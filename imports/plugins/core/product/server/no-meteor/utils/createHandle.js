/**
 * @function createHandle
 * @private
 * @description Recursive method which trying to find a new `handle`, given the
 * existing copies
 * @param {Object} context -  an object containing the per-request state
 * @param {String} productHandle - product `handle`
 * @param {String} productId - current product `_id`
 * @returns {String} handle - modified `handle`
 */
export default async function createHandle(context, productHandle, productId) {
  let handle = productHandle || "";
  // exception product._id needed for cases then double triggering happens
  const handleCount = await context.collections.Products.find({
    handle,
    _id: {
      $nin: [productId]
    }
  }).count();
  // current product "copy" number
  let handleNumberSuffix = 0;
  // product handle prefix
  let handleString = handle;
  // copySuffix "-copy-number" suffix of product
  const copySuffix = handleString.match(/-copy-\d+$/) || handleString.match(/-copy$/);

  // if product is a duplicate, we should take the copy number, and cut
  // the handle
  if (copySuffix) {
    // we can have two cases here: copy-number and just -copy. If there is
    // no numbers in copySuffix then we should put 1 in handleNumberSuffix
    handleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
    // removing last numbers and last "-" if it presents
    handleString = handle.replace(/\d+$/, "").replace(/-$/, "");
  }

  // if we have more than one product with the same handle, we should mark
  // it as "copy" or increment our product handle if it contain numbers.
  if (handleCount > 0) {
    // if we have product with name like "product4", we should take care
    // about its uniqueness
    if (handleNumberSuffix > 0) {
      handle = `${handleString}-${handleNumberSuffix + handleCount}`;
    } else {
      // first copy will be "...-copy", second: "...-copy-2"
      handle = `${handleString}-copy${handleCount > 1 ? `-${handleCount}` : ""}`;
    }
  }

  // we should check again if there are any new matches with DB
  // exception product._id needed for cases then double triggering happens
  const newHandleCount = await context.collections.Products.find({
    handle,
    _id: {
      $nin: [productId]
    }
  }).count();

  if (newHandleCount !== 0) {
    handle = createHandle(context, handle, productId);
  }

  return handle;
}
