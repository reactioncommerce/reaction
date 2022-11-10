import { createRequire } from "module";
import getNextSequence from "./util/getNextSequence.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "api-plugin-sequences",
    name: "sequences",
    version: pkg.version,
    collections: {
      Sequences: {
        name: "Sequences",
        indexes: [[{ shopId: 1, entity: 1 }, { unique: true }]]
      }
    },
    functionsByType: {
      getNextSequence: [getNextSequence]
    }
  });
}
