const collections = {};

/**
 * @summary Use this to set the raw collections after all plugins
 *   have been registered.
 * @param {Object} registeredCollections Collections map
 * @returns {undefined}
 */
export function setCollections(registeredCollections) {
  for (const name in registeredCollections) {
    if ({}.hasOwnProperty.call(registeredCollections, name)) {
      collections[name] = registeredCollections[name];
    }
  }
}

export default collections;
