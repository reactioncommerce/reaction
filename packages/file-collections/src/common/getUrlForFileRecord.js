import queryString from "query-string";

export default function getUrlForFileRecord(fileRecord, {
  download = false,
  filename = null, // override the filename that is shown to the user
  prefix = "",
  store = null,
  query = {}
}) {
  if (!fileRecord.collection) throw new Error("FSHTTP.getUrlForFile: File must have attached collection");
  if (!store) throw new Error("FSHTTP.getUrlForFile: store is required");

  // Prevent a broken link appearing
  if (!fileRecord.hasStored(store)) return null;

  // Add filename to end of URL if we can determine one
  const finalFileName = filename || fileRecord.name({ store });
  if (!finalFileName) throw new Error("FSHTTP.getUrlForFile: filename is required");

  // Construct query string
  const params = { ...query };
  if (download) params.download = 1;
  let qs = queryString.stringify(params);
  if (qs.length) qs = `?${qs}`;

  // Construct and return the http method url
  let pathPart = [prefix, fileRecord.collectionName, fileRecord._id, store, finalFileName].join("/").replace(/([^:]\/)\/+/g, "$1");
  if (pathPart.endsWith("/")) pathPart = pathPart.slice(0, -1);
  return pathPart + qs;
}
