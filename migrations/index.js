import { migrationsNamespace } from "./migrationsNamespace.js";
import migration2 from "./2.js";
import migration3 from "./3.js";

export default {
  tracks: [
    {
      namespace: migrationsNamespace,
      migrations: {
        2: migration2,
        3: migration3
      }
    }
  ]
};
