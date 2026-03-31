USE [approval_workflow];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.ApprovalDocuments', 'Amount') IS NULL
BEGIN
    ALTER TABLE dbo.ApprovalDocuments
    ADD Amount DECIMAL(18, 2) NOT NULL
        CONSTRAINT DF_ApprovalDocuments_Amount DEFAULT (0);
END
GO

UPDATE d
SET d.Amount = ISNULL(x.TotalAmount, 0)
FROM dbo.ApprovalDocuments d
OUTER APPLY (
    SELECT SUM(ISNULL(i.Qty, 0) * ISNULL(i.Price, 0)) AS TotalAmount
    FROM dbo.ApprovalItems i
    WHERE i.ApprovalId = d.Id
      AND ISNULL(i.Status, 'A') = 'A'
) x
WHERE ISNULL(d.Amount, 0) <> ISNULL(x.TotalAmount, 0);
GO

IF OBJECT_ID('dbo.approval_public_tokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.approval_public_tokens
    (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_approval_public_tokens PRIMARY KEY,
        token UNIQUEIDENTIFIER NOT NULL,
        doc_id INT NOT NULL,
        step_id INT NOT NULL,
        approver_id INT NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        revoked_at DATETIME NULL,
        consumed_action VARCHAR(20) NULL,
        created_at DATETIME NOT NULL CONSTRAINT DF_approval_public_tokens_created_at DEFAULT (GETDATE())
    );

    ALTER TABLE dbo.approval_public_tokens
        ADD CONSTRAINT UQ_approval_public_tokens_token UNIQUE (token);

    ALTER TABLE dbo.approval_public_tokens
        ADD CONSTRAINT FK_approval_public_tokens_doc
            FOREIGN KEY (doc_id) REFERENCES dbo.ApprovalDocuments (Id);

    ALTER TABLE dbo.approval_public_tokens
        ADD CONSTRAINT FK_approval_public_tokens_step
            FOREIGN KEY (step_id) REFERENCES dbo.doc_approval_steps (id);

    CREATE NONCLUSTERED INDEX IX_approval_public_tokens_lookup
        ON dbo.approval_public_tokens (token, revoked_at, used_at, expires_at);

    CREATE NONCLUSTERED INDEX IX_approval_public_tokens_doc
        ON dbo.approval_public_tokens (doc_id, step_id, approver_id);
END
GO

IF OBJECT_ID('dbo.v_ApprovalList', 'V') IS NULL
    EXEC('CREATE VIEW dbo.v_ApprovalList AS SELECT 1 AS Id');
GO
ALTER VIEW dbo.v_ApprovalList
AS
SELECT
    d.Id,
    d.DocNo,
    d.ProjectTitle,
    ad.DocType,
    d.ApproveStatus,
    d.DocStatus,
    ISNULL(d.Amount, 0) AS TotalAmount,
    d.RequestDate,
    d.CreateDate,
    d.requester_id,
    d.current_step
FROM dbo.ApprovalDocuments d
JOIN dbo.ApprovalDocTypes ad ON d.DocType = ad.Id
WHERE d.[Status] = 'A';
GO

IF OBJECT_ID('dbo.sp_GetPendingApprovalsForUser', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.sp_GetPendingApprovalsForUser AS BEGIN SET NOCOUNT ON; END');
GO
ALTER PROCEDURE dbo.sp_GetPendingApprovalsForUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        d.Id,
        d.DocNo,
        ad.DocType,
        d.ProjectTitle,
        d.Amount,
        d.DocStatus,
        d.ApproveStatus,
        d.RequestDate,
        d.CreateDate,
        s.id AS StepId,
        s.step_no AS StepNo,
        s.step_name AS StepName,
        s.approver_role AS ApproverRole,
        req.username AS RequesterUsername,
        req.first_name + ' ' + req.last_name AS RequesterName,
        req.department AS RequesterDepartment,
        req.division_name AS RequesterDivision
    FROM dbo.doc_approval_steps s
    JOIN dbo.ApprovalDocuments d
      ON d.Id = s.doc_id
     AND d.[Status] = 'A'
    JOIN dbo.ApprovalDocTypes ad
      ON ad.Id = d.DocType
    OUTER APPLY (
        SELECT TOP 1
            u.username,
            u.first_name,
            u.last_name,
            dp.department,
            dv.division_name
        FROM GFCS_USERS.dbo.users u
        LEFT JOIN GFCS_USERS.dbo.department dp ON dp.id = u.department_id
        LEFT JOIN GFCS_USERS.dbo.division dv ON dv.id = u.division_id
        WHERE u.user_id = d.requester_id
    ) req
    WHERE s.approver_id = @UserId
      AND s.status = 'PENDING'
    ORDER BY d.CreateDate DESC, d.Id DESC;
END
GO

IF OBJECT_ID('dbo.sp_GetApprovalWorkflowDetail', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.sp_GetApprovalWorkflowDetail AS BEGIN SET NOCOUNT ON; END');
GO
ALTER PROCEDURE dbo.sp_GetApprovalWorkflowDetail
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        d.*,
        ad.DocType AS DocTypeName,
        req.username AS RequesterUsername,
        req.first_name + ' ' + req.last_name AS RequesterName,
        req.email AS RequesterEmail,
        req.department AS RequesterDepartment,
        req.division_name AS RequesterDivision
    FROM dbo.ApprovalDocuments d
    JOIN dbo.ApprovalDocTypes ad
      ON ad.Id = d.DocType
    OUTER APPLY (
        SELECT TOP 1
            u.username,
            u.first_name,
            u.last_name,
            u.email,
            dp.department,
            dv.division_name
        FROM GFCS_USERS.dbo.users u
        LEFT JOIN GFCS_USERS.dbo.department dp ON dp.id = u.department_id
        LEFT JOIN GFCS_USERS.dbo.division dv ON dv.id = u.division_id
        WHERE u.user_id = d.requester_id
    ) req
    WHERE d.Id = @Id
      AND d.[Status] = 'A';

    SELECT
        i.Id,
        i.ApprovalId,
        i.ItemDescription,
        i.Qty,
        i.Price,
        i.Unit,
        i.Amount,
        i.CreateBy,
        i.CreateDate,
        i.ModifyBy,
        i.ModifyDate,
        i.Status
    FROM dbo.ApprovalItems i
    WHERE i.ApprovalId = @Id
      AND ISNULL(i.Status, 'A') = 'A'
    ORDER BY i.Id ASC;

    SELECT
        s.id,
        s.doc_id,
        s.step_no,
        s.step_name,
        s.approver_id,
        s.approver_role,
        s.status,
        s.due_date,
        s.approval_type,
        s.updated_at,
        u.username AS ApproverUsername,
        u.first_name + ' ' + u.last_name AS ApproverName
    FROM dbo.doc_approval_steps s
    LEFT JOIN GFCS_USERS.dbo.users u
      ON u.user_id = s.approver_id
    WHERE s.doc_id = @Id
    ORDER BY s.step_no, s.approver_id;

    SELECT
        a.action_id,
        a.doc_id,
        a.step_id,
        a.actor_id,
        a.action,
        a.remark,
        a.ip_address,
        a.action_at,
        u.username AS ActorUsername,
        u.first_name + ' ' + u.last_name AS ActorName
    FROM dbo.doc_approval_actions a
    LEFT JOIN GFCS_USERS.dbo.users u
      ON u.user_id = a.actor_id
    WHERE a.doc_id = @Id
    ORDER BY a.action_at ASC, a.action_id ASC;
END
GO

IF OBJECT_ID('dbo.sp_GetPublicApprovalDetail', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.sp_GetPublicApprovalDetail AS BEGIN SET NOCOUNT ON; END');
GO
ALTER PROCEDURE dbo.sp_GetPublicApprovalDetail
    @Token UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @doc_id INT;
    DECLARE @step_id INT;
    DECLARE @approver_id INT;

    SELECT TOP 1
        @doc_id = t.doc_id,
        @step_id = t.step_id,
        @approver_id = t.approver_id
    FROM dbo.approval_public_tokens t
    JOIN dbo.doc_approval_steps s
      ON s.id = t.step_id
    WHERE t.token = @Token
      AND t.revoked_at IS NULL
      AND t.used_at IS NULL
      AND t.expires_at > GETDATE()
      AND s.status = 'PENDING';

    IF @doc_id IS NULL
    BEGIN
        RAISERROR('Approval link is invalid or expired', 16, 1);
        RETURN;
    END

    EXEC dbo.sp_GetApprovalWorkflowDetail @Id = @doc_id;

    SELECT
        @doc_id AS doc_id,
        @step_id AS step_id,
        @approver_id AS approver_id;
END
GO

IF OBJECT_ID('dbo.sp_ProcessApproval', 'P') IS NULL
    EXEC('CREATE PROCEDURE dbo.sp_ProcessApproval AS BEGIN SET NOCOUNT ON; END');
GO
ALTER PROCEDURE dbo.sp_ProcessApproval
    @doc_id     INT,
    @actor_id   INT,
    @action     VARCHAR(20),
    @remark     NVARCHAR(MAX) = NULL,
    @ip_address VARCHAR(45) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @normalized_action VARCHAR(20) = UPPER(LTRIM(RTRIM(ISNULL(@action, ''))));

    IF @normalized_action NOT IN ('APPROVE', 'REJECT', 'RETURN')
    BEGIN
        RAISERROR('Unsupported action', 16, 1);
        RETURN;
    END

    IF @normalized_action IN ('REJECT', 'RETURN')
       AND NULLIF(LTRIM(RTRIM(ISNULL(@remark, ''))), '') IS NULL
    BEGIN
        RAISERROR('Remark is required for REJECT and RETURN', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @current_step_no INT;
        DECLARE @current_step_id INT;
        DECLARE @next_step_no INT;
        DECLARE @next_step_name VARCHAR(255);

        SELECT @current_step_no = MIN(step_no)
        FROM dbo.doc_approval_steps
        WHERE doc_id = @doc_id
          AND status = 'PENDING';

        IF @current_step_no IS NULL
        BEGIN
            RAISERROR('No pending approval step for this document', 16, 1);
            ROLLBACK;
            RETURN;
        END

        SELECT TOP 1
            @current_step_id = id
        FROM dbo.doc_approval_steps
        WHERE doc_id = @doc_id
          AND step_no = @current_step_no
          AND approver_id = @actor_id
          AND status = 'PENDING'
        ORDER BY id;

        IF @current_step_id IS NULL
        BEGIN
            RAISERROR('You are not the active approver for this step', 16, 1);
            ROLLBACK;
            RETURN;
        END

        INSERT INTO dbo.doc_approval_actions
            (doc_id, step_id, actor_id, action, remark, ip_address)
        VALUES
            (@doc_id, @current_step_id, @actor_id, @normalized_action, @remark, @ip_address);

        IF @normalized_action = 'REJECT'
        BEGIN
            UPDATE dbo.doc_approval_steps
            SET status = CASE
                WHEN id = @current_step_id THEN 'REJECTED'
                WHEN step_no = @current_step_no AND status = 'PENDING' THEN 'CANCELLED'
                WHEN status IN ('WAITING', 'PENDING') THEN 'CANCELLED'
                ELSE status
            END,
            updated_at = GETDATE()
            WHERE doc_id = @doc_id;

            UPDATE dbo.ApprovalDocuments
            SET DocStatus = 'Rejected',
                ApproveStatus = 'Rejected',
                current_step = NULL,
                updated_at = GETDATE()
            WHERE Id = @doc_id;

            COMMIT;
            SELECT 'REJECTED' AS result, NULL AS next_step, NULL AS next_step_name;
            RETURN;
        END

        IF @normalized_action = 'RETURN'
        BEGIN
            UPDATE dbo.doc_approval_steps
            SET status = CASE
                WHEN id = @current_step_id THEN 'RETURNED'
                WHEN step_no = @current_step_no AND status = 'PENDING' THEN 'CANCELLED'
                WHEN status IN ('WAITING', 'PENDING') THEN 'CANCELLED'
                ELSE status
            END,
            updated_at = GETDATE()
            WHERE doc_id = @doc_id;

            UPDATE dbo.ApprovalDocuments
            SET DocStatus = 'Draft',
                ApproveStatus = 'Returned',
                current_step = NULL,
                updated_at = GETDATE()
            WHERE Id = @doc_id;

            COMMIT;
            SELECT 'RETURNED' AS result, NULL AS next_step, NULL AS next_step_name;
            RETURN;
        END

        UPDATE dbo.doc_approval_steps
        SET status = CASE
            WHEN id = @current_step_id THEN 'APPROVED'
            WHEN step_no = @current_step_no AND status = 'PENDING' THEN 'SKIPPED'
            ELSE status
        END,
        updated_at = GETDATE()
        WHERE doc_id = @doc_id
          AND step_no = @current_step_no
          AND status = 'PENDING';

        SELECT @next_step_no = MIN(step_no)
        FROM dbo.doc_approval_steps
        WHERE doc_id = @doc_id
          AND status = 'WAITING'
          AND step_no > @current_step_no;

        IF @next_step_no IS NOT NULL
        BEGIN
            UPDATE dbo.doc_approval_steps
            SET status = 'PENDING',
                updated_at = GETDATE()
            WHERE doc_id = @doc_id
              AND step_no = @next_step_no
              AND status = 'WAITING';

            SELECT TOP 1 @next_step_name = step_name
            FROM dbo.doc_approval_steps
            WHERE doc_id = @doc_id
              AND step_no = @next_step_no
            ORDER BY id;

            UPDATE dbo.ApprovalDocuments
            SET DocStatus = 'Inprocess',
                ApproveStatus = CONVERT(NVARCHAR(255), N'รอ' + ISNULL(@next_step_name, 'อนุมัติ')),
                current_step = @next_step_no,
                updated_at = GETDATE()
            WHERE Id = @doc_id;

            COMMIT;
            SELECT 'NEXT_STEP' AS result, @next_step_no AS next_step, @next_step_name AS next_step_name;
            RETURN;
        END

        UPDATE dbo.ApprovalDocuments
        SET DocStatus = 'Approved',
            ApproveStatus = 'Approved',
            current_step = NULL,
            updated_at = GETDATE()
        WHERE Id = @doc_id;

        COMMIT;
        SELECT 'FULLY_APPROVED' AS result, NULL AS next_step, NULL AS next_step_name;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        THROW;
    END CATCH
END
GO
