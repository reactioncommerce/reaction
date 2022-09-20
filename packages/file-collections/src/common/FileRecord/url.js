import queryString from "query-string";

/**
 * @param {FileRecord} fileRecord object to get rl for
 * @param {Object} param1 settings for url builder
 * @returns {String} url of fileRecord
 */
export default function getUrlForFileRecord(fileRecord, {
  absolute = false,
  absoluteUrlPrefix,
  download = false,
  filename = null, // override the filename that is shown to the user
  prefix = "",
  store = null,
  query = {}
}) {
  if (!fileRecord.collectionName) throw new Error("FileRecord.url: File must have attached collection");
  if (!store) throw new Error("FileRecord.url: store is required");

  // Prevent a broken link appearing
  if (!fileRecord.hasStored(store)) return null;

  // Add filename to end of URL if we can determine one
  const finalFileName = filename || fileRecord.name({ store });
  if (!finalFileName) throw new Error("FileRecord.url: filename is required");

  // Construct query string
  const params = { ...query };
  if (download) params.download = 1;
  let qs = queryString.stringify(params);
  if (qs.length) qs = `?${qs}`;

  // Construct and return the http method url
  let finalPrefix = prefix;
  if (!finalPrefix.startsWith("/")) finalPrefix = `/${finalPrefix}`;
  let pathPart = [finalPrefix, fileRecord.collectionName, fileRecord._id, store, finalFileName].join("/").replace(/([^:]\/)\/+/g, "$1");
  if (pathPart.endsWith("/")) pathPart = pathPart.slice(0, -1);
  const relativeUrl = pathPart + qs;

  if (!absolute) return relativeUrl;

  if (typeof absoluteUrlPrefix !== "string") throw new Error("FileRecord.url: Requested absolute URL without setting absoluteUrlPrefix");

  let finalAbsoluteUrlPrefix = absoluteUrlPrefix;
  if (finalAbsoluteUrlPrefix.endsWith("/")) finalAbsoluteUrlPrefix = finalAbsoluteUrlPrefix.slice(0, -1);
  return [finalAbsoluteUrlPrefix, relativeUrl].join("");
}
