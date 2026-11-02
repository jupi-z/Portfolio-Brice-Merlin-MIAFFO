const EDITORIAL_ACCESS_COOKIE = 'brice_editorial_access';
const EDITORIAL_REFRESH_COOKIE = 'brice_editorial_refresh';

const createEditorialCookieOptions = (secure, maxAgeSeconds) => ({
  httpOnly: true,
  overwrite: true,
  sameSite: 'lax',
  secure: Boolean(secure),
  path: '/',
  maxAge: maxAgeSeconds * 1000,
});

const readCookieToken = (cookieHeader = '') => {
  const match = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${EDITORIAL_ACCESS_COOKIE}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(EDITORIAL_ACCESS_COOKIE.length + 1));
  } catch {
    return null;
  }
};

module.exports = {
  EDITORIAL_ACCESS_COOKIE,
  EDITORIAL_REFRESH_COOKIE,
  createEditorialCookieOptions,
  readCookieToken,
};
