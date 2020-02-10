import migration2 from "./2.js";

export default {
  tracks: [
    {
      namespace: "simple-authorization",
      migrations: {
        2: migration2
      }
    }
  ]
};
