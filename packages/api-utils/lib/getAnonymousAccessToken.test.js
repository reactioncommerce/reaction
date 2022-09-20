import getAnonymousAccessToken from "./getAnonymousAccessToken.js";

test("getAnonymousAccessToken basic structure", () => {
  const token = getAnonymousAccessToken();
  expect(token.createdAt instanceof Date).toBe(true);
  const sha256hex = Buffer.from(token.hashedToken, "base64").toString("hex");
  // sha256 is a 32-byte number, which is 64 hex characters
  expect(sha256hex.length).toBe(64);
});
