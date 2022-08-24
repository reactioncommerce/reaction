import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(
  process.env,
  {
    STORE_URL: str({ devDefault: "http://localhost:4000" }),
    TOKEN_SECRET: str({ default: "UPDATE_THIS_SECRET" })
  },
  {
    dotEnvPath: null
  }
);
