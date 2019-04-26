import envalid, { bool } from "envalid";

export default envalid.cleanEnv(process.env, {
  AUTO_PUBLISH_INVENTORY_FIELDS: bool({ default: true })
});
