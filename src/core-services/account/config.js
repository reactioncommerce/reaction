import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(process.env, {
  HYDRA_OAUTH2_INTROSPECT_URL: str({ devDefault: "http://hydra:4445/oauth2/introspect" }),
  REACTION_ADMIN_PUBLIC_ACCOUNT_REGISTRATION_URL: str({ devDefault: "http://localhost:4080" })
});
