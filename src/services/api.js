const getStoredAuthToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('authToken') ||
  sessionStorage.getItem('access_token') ||
  sessionStorage.getItem('authToken') ||
  ''

export const buildAuthHeaders = (extraHeaders = {}) => {
  const token = getStoredAuthToken()

  return token
    ? {
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
      }
    : { ...extraHeaders }
}

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const error = new Error(
      (typeof data === 'object' && (data?.message || data?.error)) ||
        response.statusText ||
        'Request failed'
    )
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
