import envalid from "envalid";

const { bool } = envalid;

export default envalid.cleanEnv(process.env, {
  REACTION_SHOULD_ENCODE_IDS: bool({
    default: true,
    desc: "Setting this to false makes the `encodeOpaqueId` function pass through the ID unchanged."
  })
}, {
  dotEnvPath: null
});
