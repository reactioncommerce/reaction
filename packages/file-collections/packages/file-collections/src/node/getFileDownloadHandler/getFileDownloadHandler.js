import contentDisposition from "content-disposition";
import { Path } from "path-parser";
import debug from "../debug";
import requestRange from "./requestRange";
import writeHeadersToResponse from "./writeHeadersToResponse";

// NOTE: This path can be changed back to "/:collectionName/:fileId/:storeName/:filename" if this issue is fixed and pulled in:
// https://github.com/troch/path-parser/issues/22
const matchFix = "<[a-zA-Z0-9-_.~%':|\\+]+>";
const routePath = new Path(`/:collectionName${matchFix}/:fileId${matchFix}/:storeName${matchFix}/:filename${matchFix}`);

/**
 * @param {Object} param0 options for file downloader
 * @returns {void} null
 */
export default function getFileDownloadHandler({
  getFileInfo,
  getReadStream,
  headers: customResponseHeaders,
  shouldAllowGet
} = {}) {
  return async (req, res) => {
    const { headers, method, originalUrl, query, url } = req;

    debug("---------------------------------------");
    debug("FSHTTP request received:");
    debug("  url:", url);
    debug("  originalUrl:", originalUrl);
    debug("  method:", method);
    debug("  headers:", headers);
    debug("  query:", JSON.stringify(query));
    debug("---------------------------------------");

    const itemsFromUrl = routePath.partialTest(url);
    if (!itemsFromUrl) {
      debug(`Unable to parse file download URL: ${url}`);
      res.writeHead(400, "Bad Request");
      res.end();
      return;
    }

    const {
      collectionName,
      fileId,
      filename,
      storeName
    } = routePath.partialTest(url);

    debug("Parsed from URL:", { collectionName, fileId, filename, storeName });

    if (!collectionName || !fileId || !filename || !storeName) {
      debug("Request was missing some information");
      res.writeHead(400, "Bad Request");
      res.end();
      return;
    }

    // context is an object that getFileInfo can mutate with any info the
    // other functions will need later.
    const context = {};

    const fileInfo = await getFileInfo({
      collectionName,
      context,
      fileId,
      filename,
      query,
      storeName
    });

    debug("getFileInfo returned", fileInfo);

    if (!fileInfo) {
      res.writeHead(404, "File Not Found");
      res.end();
      return;
    }

    const { name, size, type, updatedAt } = fileInfo;
    switch (method.toLowerCase()) {
      case "get": {
        if (!(await shouldAllowGet(context, req))) {
          debug("shouldAllowGet returned false");
          res.writeHead(403, "Forbidden");
          res.end();
          return;
        }

        const { download } = query;

        // Get the contents range from request
        const range = requestRange(headers, size);
        if (range.errorCode) {
          res.writeHead(range.errorCode);
          res.end(range.errorMessage);
          return;
        }

        debug("Requested range details:", range);

        // Write HTTP headers
        const responseHeaders = {
          // Inform clients that we accept ranges for resumable chunked downloads
          "Accept-Ranges": range.unit,
          // Tell browser whether it should display or download the file
          "Content-Disposition": download ? contentDisposition(filename || name) : "inline",
          "Content-Length": range.len,
          // Some browsers cope better if the content-range header is
          // still included even for the full file being returned.
          "Content-Range": `${range.unit} ${range.start}-${range.end}/${range.size}`,
          "Content-Type": type || "application/octet-stream",
          "Last-Modified": updatedAt ? updatedAt.toUTCString() : null,
          ...((customResponseHeaders && customResponseHeaders.get) || {})
        };
        writeHeadersToResponse(res, responseHeaders);

        let readStream;
        try {
          readStream = await getReadStream(context, range);
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
          res.writeHead(503, "Service Unavailable");
          res.end();
          return;
        }

        readStream.once("error", (error) => {
          console.error(error); // eslint-disable-line no-console
          res.writeHead(503, "Service Unavailable");
          res.end();
        });

        readStream.pipe(res);

        // If a chunk/range was requested instead of the whole file, use 206 success code
        res.writeHead(range.partial ? 206 : 200);
        break;
      }
      default:
        res.writeHead(405, "Method Not Allowed");
        res.end();
        break;
    }
  };
}
