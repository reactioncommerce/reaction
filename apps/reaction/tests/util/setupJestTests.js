/* eslint-disable no-undef */
import jestProcessEnv from "./jestProcessEnv.json" assert { type: "json" };

process.env = Object.assign(process.env, {
  ...jestProcessEnv
});

process.on("unhandledRejection", (err) => {
  throw err;
});
