import envalid, { bool } from "envalid";

export const env = envalid.cleanEnv(process.env, {
  DISABLE_MONGO_SEARCH: bool({ default: false })
});
