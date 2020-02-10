import { migrationNamespace } from "./migrationsNamespace.js";
import migration2 from "./2.js";

export default {
  tracks: [
    {
      namespace: migrationNamespace,
      migrations: {
        2: migration2
      }
    }
  ]
};
