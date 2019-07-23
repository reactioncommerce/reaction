import { customPublisherTransforms } from "../registration";

/**
 *
 * @method applyCustomPublisherTrasforms
 * @summary TODO: write method summary.
 * @param {ParamType} paramName - TODO: write parameter summary.
 * @return {ReturnType} - TODO: write return summary.
 */
export default async function applyCustomPublisherTransforms(catalogProduct, context, startFrom) {
  let readyToStart = startFrom ? false : true;
  for(const customPublisherInfo of customPublisherTransforms ) {

    if (!readyToStart) {
      if (startFrom === customPublisherInfo.name) {
        readyToStart = true;
      }
    }

    if (!readyToStart) continue;

    // eslint-disable-next-line no-await-in-loop
    await customPublisherInfo.function(catalogProduct, { context });
  }
}
