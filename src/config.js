import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(process.env, {
  NODE_ENV: str({ default: "production" }),
  REACTION_IDENTITY_PUBLIC_PASSWORD_RESET_URL: str({ devDefault: "http://localhost:4100/account/reset-password/TOKEN" }),
  REACTION_IDENTITY_PUBLIC_VERIFY_EMAIL_URL: str({ devDefault: "http://localhost:4100/#/verify-email/TOKEN" }),
  REACTION_ADMIN_PUBLIC_ACCOUNT_REGISTRATION_URL: str({ devDefault: "http://localhost:4080" })
}, {
  dotEnvPath: null
});
