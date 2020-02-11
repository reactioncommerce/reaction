import { migrationsNamespace } from "./migrationsNamespace.js";
import migration2 from "./2.js";

export default {
  tracks: [
    {
      namespace: migrationsNamespace,
      migrations: {
        2: migration2
      }
    }
  ]
};
