import { createRequire } from "module";

const require = createRequire(import.meta.url);

const { assoc, curry, keys, reduce } = require("ramda");

export const renameKeys = curry((keysMap, obj) =>
  reduce((acc, key) => assoc(keysMap[key] || key, obj[key], acc), {}, keys(obj)));
