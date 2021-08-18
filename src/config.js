import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(
  process.env,
  {
    STORE_URL: str({ devDefault: "http://localhost:4000" })
  },
  {
    dotEnvPath: null
  }
);
