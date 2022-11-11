import envalid from "envalid";
import * as dotenv from "dotenv";

const { json } = envalid;

// this is required for envalid 7 or greater which was required to make json work
dotenv.config();

export default envalid.cleanEnv(process.env, {
  SEQUENCE_INITIAL_VALUES: json({ default: { entity: 999 } })
});
