import migration2 from "./2.js";

export default {
  tracks: [
    {
      namespace: "legacy-authorization",
      migrations: {
        2: migration2
      }
    }
  ]
};
