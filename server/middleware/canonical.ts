export default defineEventHandler((event) => {
  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host')
  if (host?.split(':')[0] !== 'wefretafrica.com') return

  const url = getRequestURL(event)
  return sendRedirect(event, `https://www.wefretafrica.com${url.pathname}${url.search}`, 308)
})
