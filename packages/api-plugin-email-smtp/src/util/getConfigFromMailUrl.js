/**
 * @summary get email sending config for Nodemailer based on parsing a mail URL
 * @param {String} mailUrl The mail URL
 * @returns {Object} A mail config object
 */
export default function getConfigFromMailUrl(mailUrl) {
  const urlSections = mailUrl.split(":");
  // Prevent URL parsing from breaking due to invalid characters in user/password
  // Look for invalid characters in username,
  // ignore the first two // as they are port of the protocol in username section.
  // Also look for invalid character in password, split with @ delimiter to ignore host and only look at password.
  if (urlSections[1].slice(2).indexOf("/") >= 0 || urlSections[2].split("@")[0].indexOf("/") >= 0) {
    throw new Error(`
      Invalid character detected in environment variable MAIL_URL,
      user or password has invalid characters, please replace "/" with "%2F"
    `);
  }

  const parsedUrl = new URL(mailUrl);

  // create a nodemailer config from the SMTP url string
  const config = {
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    secure: parseInt(parsedUrl.port, 10) === 465
  };

  // add user/pass to the config object if they were found
  if (parsedUrl.username && parsedUrl.password) {
    config.auth = {
      user: decodeURIComponent(parsedUrl.username),
      pass: decodeURIComponent(parsedUrl.password)
    };
  }

  // don't enforce checking TLS on localhost
  if (parsedUrl.hostname === "localhost") {
    config.ignoreTLS = true;
  }

  return config;
}
