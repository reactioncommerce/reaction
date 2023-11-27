import envalid from "envalid";

const { bool } = envalid;

export default envalid.cleanEnv(process.env, {
  REACTION_SHOULD_ENCODE_IDS: bool({
    default: false,
    devDefault: envalid.testOnly(true), // #TODO Remove this in v6 when we remove the encoding of IDs
    desc: "Setting this to false makes the `encodeOpaqueId` function pass through the ID unchanged."
  })
}, {
  dotEnvPath: null
});
