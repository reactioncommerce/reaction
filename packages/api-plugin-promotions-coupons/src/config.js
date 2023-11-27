import { cleanEnv, json } from "envalid";
import * as dotenv from "dotenv";


// this is required for envalid 7 or greater which was required to make json work
dotenv.config();

export default cleanEnv(process.env, {
  SEQUENCE_INITIAL_VALUES: json({ default: { entity: 999 } })
});
