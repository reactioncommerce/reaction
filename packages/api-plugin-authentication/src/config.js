import envalid from "envalid";

const { str, bool } = envalid;

export default envalid.cleanEnv(
  process.env,
  {
    ACCOUNTS_JS_RETURN_TOKENS_AFTER_RESET_PASSWORD: bool({ default: false }),
    ACCOUNTS_JS_ACCESS_TOKEN_EXPIRES_IN: str({ default: "90m" }),
    ACCOUNTS_JS_REFRESH_TOKEN_EXPIRES_IN: str({ default: "30d" }),
    PASSWORD_RESET_PATH_FRAGMENT: str({ default: "?resetToken=" }),
    STORE_URL: str({ devDefault: "http://localhost:4000" }),
    TOKEN_SECRET: str({ default: "UPDATE_THIS_SECRET" })
  },
  {
    dotEnvPath: null
  }
);
