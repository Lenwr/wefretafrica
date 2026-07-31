const API_URL = String(import.meta.env.VITE_TRACKING_API_URL || '').replace(/\/$/, '')

export class TrackingApiError extends Error {
  constructor(code, status) {
    super(code)
    this.name = 'TrackingApiError'
    this.code = code
    this.status = status
  }
}

export const getPublicTracking = async (companySlug, trackingNumber) => {
  if (!API_URL) throw new TrackingApiError('API_NOT_CONFIGURED', 0)

  const url = `${API_URL}/v1/public/${encodeURIComponent(companySlug)}/${encodeURIComponent(trackingNumber)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000)
  })
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new TrackingApiError(body.error || 'TRACKING_API_ERROR', response.status)
  }
  return body.data
}
