import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(process.env, {
  NODE_ENV: str({ default: "production" })
}, {
  dotEnvPath: null
});
