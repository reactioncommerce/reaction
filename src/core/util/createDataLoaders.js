import DataLoader from "dataloader";
import convertToDataloaderResult from "./convertToDataloaderResult";

export const dataLoaderFactory = (dlFunc) => new DataLoader(dlFunc, { cache: false });

/**
 * @param {Object} context An object with request-specific state
 * @returns {undefined}
 */
export default async function createDataLoaders(context) {
  if (!context.getFunctionsOfType || !context.getFunctionsOfType("createDataLoaders")) return;

  const promises = context.getFunctionsOfType("createDataLoaders").map((fn) => fn(context, dataLoaderFactory, convertToDataloaderResult));
  const dataLoadersByPlugin = await Promise.all(promises);
  context.dataLoaders = {};

  dataLoadersByPlugin.forEach((pluginDataLoaders) => {
    Object.assign(context.dataLoaders, pluginDataLoaders);
  });
}
