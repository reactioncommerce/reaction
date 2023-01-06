import { migrationsNamespace } from "./migrationsNamespace.js";
import migration2 from "./2.js";
import migration3 from "./3.js";
import migration4 from "./4.js";
import migration5 from "./5.js";
import migration6 from "./6.js";

export default {
  tracks: [
    {
      namespace: migrationsNamespace,
      migrations: {
        2: migration2,
        3: migration3,
        4: migration4,
        5: migration5,
        6: migration6
      }
    }
  ]
};
