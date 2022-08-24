import jwtDecode from "jwt-decode";

/**
 * @summary Check if jwt token has expired
 * @name hasTokenExpired
 * @param {string} authToken - the encoded JWT
 * @returns {boolean} Whether the token has expired
 */
export default function hasTokenExpired(authToken) {
  const currentTime = Date.now() / 1000;
  const decodedToken = jwtDecode(authToken);
  return decodedToken.exp < currentTime;
}
