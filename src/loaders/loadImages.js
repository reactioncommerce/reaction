import fs from "fs";
import path  from 'path';
import { Readable } from 'stream';
import pkg from '@reactioncommerce/file-collections';
const { FileRecord } = pkg;
import ProductsData from "../json-data/Products.json";
import Logger from "@reactioncommerce/logger";


/**
 * @summary Inserts filerecords into Media collection
 * @param {Object} Media - The Media collection
 * @param {Object} fileRecords - The array of fileRecords
 * @returns {Promise<boolean>} true if success
 */
async function insertToMedia(Media, fileRecords) {
  for (const fileRecord of fileRecords) {
    await Media.insert(fileRecord);
    await storeFromAttachedBuffer(fileRecord);
  }
  return true;
}


/**
 * @summary Creates a mapping between the variantId and it's top level productId from Productsdata.json
 * @returns {Object} variantProductMapper mapping of variantId and productId
 */
 function getVariantProductMapper() {
  let variantProductMapper = {};
  ProductsData.forEach(product => {
    if (product.ancestors?.length > 0 && product.type === 'variant') {
      variantProductMapper[product._id] = product.ancestors[0];
    }
  });
  return variantProductMapper;
};


/**
 * @summary Creates a mapping between the variantId and the filename
 * @param {String} fileList - The array of file names
 * @returns {Object} variantProductMapper mapping of variantId and productId
 */
 function getVariantIdFileMapper(fileList) {
  let variantIdFileMapper = {};
  fileList.forEach(filename => {
    let variantId = filename.split(".")[0]  // filename is in the format variantId.descriptive-filename.extn
    if (variantId) {                        // Eliminates hidden files starting with '.'
      if (variantIdFileMapper[variantId] && variantIdFileMapper[variantId].length > 0) {
        variantIdFileMapper[variantId].push(filename)
      } else {
        variantIdFileMapper[`${variantId}`] =  [filename];
      }
    }
  });

  return variantIdFileMapper;
};


/**
 * @summary Inserts filerecords into Media collection
 * @param {Object} fileRecord - The fileRecord to be inserted
 * @returns {Promise<boolean>} true if success
 */
 async function storeFromAttachedBuffer(fileRecord) {
  const { stores } = fileRecord.collection.options;
  const bufferData = fileRecord.data;

  // We do these in series to avoid issues with multiple streams reading
  // from the temp store at the same time.
  try {
    for (const store of stores) {
      if (fileRecord.hasStored(store.name)) {
        return Promise.resolve();
      }

      // Make a new read stream in each loop because you can only read once
      const writeStream = await store.createWriteStream(fileRecord);
      await new Promise((resolve, reject) => {
        fileRecord.once("error", reject);
        fileRecord.once("stored", resolve);
        Readable.from(bufferData).pipe(writeStream);
      });
    }
  } catch (error) {
    throw new Error("Error in storeFromAttachedBuffer:", error);
  }
}


/**
 * @summary loads Images for the products
 * @param {Object} context - The application context
 * @param {String} shopId - The shop id
 * @returns {Promise<boolean>} true if success
 */
export default async function loadImages(context, shopId) {

  const { collections: { Media } } = context;
  const { mutations: { publishProducts } } = context;

  let topProdIds = [];
  let fileType = "image/jpeg";
  let folderPath = "./custom-packages/sample-data/src/images/"

  let fileList = [];
  try {
    fileList = fs.readdirSync(folderPath);
  } catch (err){
    Logger.warn("Error reading image filelist");
  }

  if (fileList.length === 0) return false;

  const variantIdFileMapper = getVariantIdFileMapper(fileList);
  const variantProductMapper = getVariantProductMapper();

  let fileRecords = [];
  const variantIds = Object.keys(variantIdFileMapper);
  variantIds.forEach(variantId => {
    const prodId = variantProductMapper[variantId];
    topProdIds.push(prodId);
    const fileNames = variantIdFileMapper[variantId];

    fileNames.forEach(fileName => {
      const filePath = path.join(folderPath, fileName);
      let metadata = {
        productId: prodId,
        variantId: variantId,
        toGrid: 1,
        shopId,
        priority: 0,
        workflow: "published"
      }
      const data = fs.readFileSync(filePath);
      const fileSize = data.length;
      const fileRecord = new FileRecord({
        original: {
          name: fileName,
          size: fileSize,
          type: fileType,
          updatedAt: new Date(),
          uploadedAt: new Date()
        }
      })
      fileRecord.name(fileName);
      fileRecord.attachData(data)
      fileRecord.metadata = metadata;
      fileRecords.push(fileRecord);
    })

  });


  await insertToMedia(Media, fileRecords)

  const uniqueProdIds = [...new Set(topProdIds)];

  try {
    if (uniqueProdIds && uniqueProdIds.length > 0) {
      await publishProducts(context.getInternalContext(), uniqueProdIds);
    } else {
      Logger.warn("No Products to publish");
    }
  } catch (error) {
    Logger.warn("Error publishing product: ", uniqueProdIds);
  }

  return true;
}
