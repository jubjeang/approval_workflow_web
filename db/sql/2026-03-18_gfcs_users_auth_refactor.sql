USE [GFCS_USERS]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Purpose
- Stabilize the shared user/auth schema without breaking existing apps.
- Introduce a proper identity table for multiple login providers.
- Fix sp_GetUserForApp so it uses the real table/column names in this database.
- Add helper view/procedure for app-centric authorization queries.

Run order
1. Execute in GFCS_USERS
2. Validate result sets from dbo.sp_GetUserForApp
3. Update API layer to call dbo.sp_GetUserForApp or dbo.sp_GetUserAuthorization
*/

IF OBJECT_ID(N'dbo.user_identities', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[user_identities]
    (
        [identity_id] BIGINT IDENTITY(1,1) NOT NULL,
        [user_id] INT NOT NULL,
        [provider_code] VARCHAR(30) NOT NULL,
        [login_name] NVARCHAR(255) NOT NULL,
        [external_subject] NVARCHAR(255) NULL,
        [is_primary] BIT NOT NULL
            CONSTRAINT [DF_user_identities_is_primary] DEFAULT ((0)),
        [is_active] BIT NOT NULL
            CONSTRAINT [DF_user_identities_is_active] DEFAULT ((1)),
        [last_login_at] DATETIME NULL,
        [created_at] DATETIME NOT NULL
            CONSTRAINT [DF_user_identities_created_at] DEFAULT (GETDATE()),
        [updated_at] DATETIME NULL,
        CONSTRAINT [PK_user_identities] PRIMARY KEY CLUSTERED ([identity_id] ASC),
        CONSTRAINT [FK_user_identities_user] FOREIGN KEY ([user_id])
            REFERENCES [dbo].[users] ([user_id])
    )
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_user_identities_provider_login'
      AND object_id = OBJECT_ID(N'dbo.user_identities')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_user_identities_provider_login]
        ON [dbo].[user_identities] ([provider_code], [login_name])
        WHERE [is_active] = 1
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_user_identities_user'
      AND object_id = OBJECT_ID(N'dbo.user_identities')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_user_identities_user]
        ON [dbo].[user_identities] ([user_id], [is_active], [provider_code])
END
GO

;WITH identity_source AS
(
    SELECT
        u.user_id,
        CAST('AD' AS VARCHAR(30)) AS provider_code,
        LTRIM(RTRIM(u.ad_username)) AS login_name,
        CAST(CASE WHEN u.ad_username IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS is_primary
    FROM dbo.users u
    WHERE u.ad_username IS NOT NULL
      AND LTRIM(RTRIM(u.ad_username)) <> ''

    UNION ALL

    SELECT
        u.user_id,
        CAST('LOCAL' AS VARCHAR(30)) AS provider_code,
        LTRIM(RTRIM(u.username)) AS login_name,
        CAST(CASE WHEN u.ad_username IS NULL OR LTRIM(RTRIM(u.ad_username)) = '' THEN 1 ELSE 0 END AS BIT) AS is_primary
    FROM dbo.users u
    WHERE u.username IS NOT NULL
      AND LTRIM(RTRIM(u.username)) <> ''
)
INSERT INTO dbo.user_identities
(
    user_id,
    provider_code,
    login_name,
    is_primary,
    is_active
)
SELECT
    s.user_id,
    s.provider_code,
    s.login_name,
    s.is_primary,
    1
FROM identity_source s
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.user_identities ui
    WHERE ui.user_id = s.user_id
      AND ui.provider_code = s.provider_code
      AND ui.login_name = s.login_name
)
GO

IF OBJECT_ID(N'dbo.v_user_app_profile', N'V') IS NOT NULL
    DROP VIEW [dbo].[v_user_app_profile]
GO

CREATE VIEW [dbo].[v_user_app_profile]
AS
SELECT
    u.user_id,
    u.employee_id,
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    d.id AS department_id,
    d.department,
    dv.id AS division_id,
    dv.division_name,
    p.id AS positin_id,
    p.position,
    b.id AS branch_id,
    b.branch,
    u.[Status] AS user_status
FROM dbo.users u
LEFT JOIN dbo.department d
    ON u.department_id = d.id
LEFT JOIN dbo.division dv
    ON u.division_id = dv.id
LEFT JOIN dbo.position p
    ON u.positin_id = p.id
LEFT JOIN dbo.branch b
    ON u.branch_id = b.id
GO

IF OBJECT_ID(N'dbo.sp_GetUserForApp', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_GetUserForApp]
GO

CREATE PROCEDURE [dbo].[sp_GetUserForApp]
    @username VARCHAR(100),
    @app_id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @normalized_username NVARCHAR(255) = LOWER(LTRIM(RTRIM(@username)));

    ;WITH matched_user AS
    (
        SELECT TOP (1)
            u.user_id
        FROM dbo.users u
        LEFT JOIN dbo.user_identities ui
            ON ui.user_id = u.user_id
           AND ui.is_active = 1
        WHERE u.[Status] = '1'
          AND
          (
              LOWER(LTRIM(RTRIM(ISNULL(u.username, '')))) = @normalized_username
              OR LOWER(LTRIM(RTRIM(ISNULL(u.ad_username, '')))) = @normalized_username
              OR LOWER(LTRIM(RTRIM(ISNULL(ui.login_name, '')))) = @normalized_username
          )
        ORDER BY
            CASE WHEN LOWER(LTRIM(RTRIM(ISNULL(u.username, '')))) = @normalized_username THEN 0 ELSE 1 END,
            u.user_id
    )
    IF NOT EXISTS
    (
        SELECT 1
        FROM matched_user mu
        JOIN dbo.user_app_roles uar
            ON mu.user_id = uar.user_id
        WHERE uar.app_id = @app_id
          AND ISNULL(uar.[status], 1) = 1
          AND (uar.valid_to IS NULL OR uar.valid_to > GETDATE())
    )
    BEGIN
        SELECT
            CAST('NOT_REGISTERED' AS VARCHAR(30)) AS result_code,
            CAST(NULL AS INT) AS user_id,
            CAST(NULL AS INT) AS app_id;
        RETURN;
    END;

    SELECT TOP (1)
        p.user_id,
        p.employee_id,
        p.email,
        p.username,
        p.first_name,
        p.last_name,
        p.department_id,
        p.department,
        p.position,
        p.positin_id,
        ar.role_name AS [role],
        ar.role_id,
        p.division_name,
        p.branch,
        p.branch_id,
        p.division_id,
        a.app_id,
        a.app_code,
        a.app_name
    FROM matched_user mu
    JOIN dbo.v_user_app_profile p
        ON mu.user_id = p.user_id
    JOIN dbo.user_app_roles uar
        ON mu.user_id = uar.user_id
       AND uar.app_id = @app_id
       AND ISNULL(uar.[status], 1) = 1
       AND (uar.valid_to IS NULL OR uar.valid_to > GETDATE())
    JOIN dbo.app_roles ar
        ON uar.role_id = ar.role_id
    JOIN dbo.applications a
        ON a.app_id = uar.app_id
    ORDER BY ar.role_id;

    SELECT
        ar.role_id,
        ar.role_code,
        ar.role_name
    FROM matched_user mu
    JOIN dbo.user_app_roles uar
        ON mu.user_id = uar.user_id
       AND uar.app_id = @app_id
       AND ISNULL(uar.[status], 1) = 1
       AND (uar.valid_to IS NULL OR uar.valid_to > GETDATE())
    JOIN dbo.app_roles ar
        ON uar.role_id = ar.role_id
    ORDER BY ar.role_id;

    SELECT DISTINCT
        pm.perm_id,
        pm.perm_code,
        pm.resource,
        pm.[action]
    FROM matched_user mu
    JOIN dbo.user_app_roles uar
        ON mu.user_id = uar.user_id
       AND uar.app_id = @app_id
       AND ISNULL(uar.[status], 1) = 1
       AND (uar.valid_to IS NULL OR uar.valid_to > GETDATE())
    JOIN dbo.role_permissions rp
        ON uar.role_id = rp.role_id
    JOIN dbo.permissions pm
        ON rp.perm_id = pm.perm_id
    ORDER BY pm.perm_id;
END
GO

IF OBJECT_ID(N'dbo.sp_GetUserAuthorization', N'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_GetUserAuthorization]
GO

CREATE PROCEDURE [dbo].[sp_GetUserAuthorization]
    @username VARCHAR(100),
    @app_id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @normalized_username NVARCHAR(255) = LOWER(LTRIM(RTRIM(@username)));

    ;WITH matched_user AS
    (
        SELECT TOP (1)
            u.user_id,
            u.employee_id,
            u.email,
            u.username,
            u.first_name,
            u.last_name
        FROM dbo.users u
        LEFT JOIN dbo.user_identities ui
            ON ui.user_id = u.user_id
           AND ui.is_active = 1
        WHERE u.[Status] = '1'
          AND
          (
              LOWER(LTRIM(RTRIM(ISNULL(u.username, '')))) = @normalized_username
              OR LOWER(LTRIM(RTRIM(ISNULL(u.ad_username, '')))) = @normalized_username
              OR LOWER(LTRIM(RTRIM(ISNULL(ui.login_name, '')))) = @normalized_username
          )
        ORDER BY
            CASE WHEN LOWER(LTRIM(RTRIM(ISNULL(u.username, '')))) = @normalized_username THEN 0 ELSE 1 END,
            u.user_id
    )
    SELECT
        mu.user_id,
        mu.employee_id,
        mu.email,
        mu.username,
        mu.first_name,
        mu.last_name,
        a.app_id,
        a.app_code,
        a.app_name,
        ar.role_id,
        ar.role_code,
        ar.role_name,
        pm.perm_id,
        pm.perm_code,
        pm.resource,
        pm.[action]
    FROM matched_user mu
    JOIN dbo.user_app_roles uar
        ON mu.user_id = uar.user_id
       AND uar.app_id = @app_id
       AND ISNULL(uar.[status], 1) = 1
       AND (uar.valid_to IS NULL OR uar.valid_to > GETDATE())
    JOIN dbo.applications a
        ON a.app_id = uar.app_id
    JOIN dbo.app_roles ar
        ON ar.role_id = uar.role_id
    LEFT JOIN dbo.role_permissions rp
        ON rp.role_id = ar.role_id
    LEFT JOIN dbo.permissions pm
        ON pm.perm_id = rp.perm_id
    ORDER BY ar.role_id, pm.perm_id;
END
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_user_app_roles_lookup'
      AND object_id = OBJECT_ID(N'dbo.user_app_roles')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_user_app_roles_lookup]
        ON [dbo].[user_app_roles] ([app_id], [user_id], [status], [valid_to])
        INCLUDE ([role_id], [valid_from])
END
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_role_permissions_role'
      AND object_id = OBJECT_ID(N'dbo.role_permissions')
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_role_permissions_role]
        ON [dbo].[role_permissions] ([role_id], [perm_id])
END
GO

PRINT 'GFCS_USERS auth refactor script completed.'
GO
