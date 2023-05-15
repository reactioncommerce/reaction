import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(
  process.env,
  {
    PASSWORD_RESET_PATH_FRAGMENT: str({ default: "?resetToken=" }),
    STORE_URL: str({ devDefault: "http://localhost:4000" }),
    TOKEN_SECRET: str({ default: "UPDATE_THIS_SECRET" })
  },
  {
    dotEnvPath: null
  }
);
