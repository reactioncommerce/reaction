import envalid, { str } from "envalid";

export default envalid.cleanEnv(process.env, {
  NODE_ENV: str({ default: "production" })
});
