/* eslint-disable no-undef */
import { createRequire } from "module";

const require = createRequire(import.meta.url);
import * as jestProcessEnv from "./jestProcessEnv.json" assert { type: "json" };

process.env = Object.assign(process.env, {
  ...jestProcessEnv
});

process.on("unhandledRejection", (err) => {
  throw err;
});
