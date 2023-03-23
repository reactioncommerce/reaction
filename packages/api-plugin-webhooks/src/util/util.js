import * as crypto from "crypto";

const secretKey = process.env.WEBHOOKS_SECRET_KEY;

export async function generateSha256Hmac(payload) {
  return new Promise((resolve, reject) => {
    try {
      const hmac = crypto.createHmac("sha256", secretKey || "secretKey");
      const data = hmac.update(payload);
      resolve(data.digest("base64"));
    } catch (e) {
      reject(e);
    }
  });
}

export function stripLastChar(str) {
  if (!str) {
    return str;
  }

  return str.substring(0, str.length - 1);
}
