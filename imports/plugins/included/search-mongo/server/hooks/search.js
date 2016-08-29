import _ from "lodash";
import { Products } from "/lib/collections";
import { ProductSearch,
  getProductSearchParameters,
  buildProductSearchCollectionRecord } from "../methods/searchcollections";
import { Logger } from "/server/api";


/**
 * if product is removed, remove product search record
 */
Products.after.remove((userId, doc) => {
  const productId = doc._id;
  ProductSearch.remove(productId);
  Logger.info(`Removed product ${productId} from ProductSearch collection`);
});

//
// after product update rebuild product search record
//
Products.after.update((userId, doc, fieldNames) => {
  const productId = doc._id;
  const { fieldSet } = getProductSearchParameters();
  const modifiedFields = _.intersection(fieldSet, fieldNames);
  if (modifiedFields.length) {
    Logger.info(`Rewriting search record for ${doc.title}`);
    ProductSearch.remove(productId);
    buildProductSearchCollectionRecord(productId);
  } else {
    Logger.info("No watched fields modified, skipping");
  }
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 */
Products.after.insert((userId, doc) => {
  const productId = doc._id;
  buildProductSearchCollectionRecord(productId);
});
