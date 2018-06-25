import updateRegistry from "./updateRegistry";
import shopMethods from "./shop";

/**
 * @file Methods for Registry
 *
 *
 * @namespace Registry/Methods
*/

export default {
  ...shopMethods,
  "registry/update": updateRegistry
};
