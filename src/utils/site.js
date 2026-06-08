export const fallbackIcon =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"%3E%3Crect width="40" height="40" rx="8" fill="%23f3f4f6"/%3E%3Cpath d="M10 20H30" stroke="%239ca3af" strokeWidth="2" strokeLinecap="round"/%3E%3Cpath d="M20 10V30" stroke="%239ca3af" strokeWidth="2" strokeLinecap="round"/%3E%3C/svg%3E'

export const normalizeUrl = (url) => {
  const trimmedUrl = url.trim()
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }

  return `https://${trimmedUrl}`
}

export const getFaviconUrl = (url) => `https://favicon.im/zh/${url}`
