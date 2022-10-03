const COLL_FF_SOURCE = "Shipments";
const COLL_FF_DEST = "Fulfillment";
const COLL_FFR_SOURCE = "FlatRateFulfillmentRestrictions";
const COLL_FFR_DEST = "FulfillmentRestrictions";

/**
 * @summary migrates the database down one version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function down({ db, progress }) {
  progress(0);

  await db.collections(COLL_FF_DEST).drop();
  progress(50);

  await db.collections(COLL_FFR_DEST).drop();
  progress(100);
}

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  progress(0);

  await db.collections(COLL_FF_SOURCE).aggregate([{ $match: {} }, { $out: COLL_FF_DEST }]);
  progress(50);

  await db.collections(COLL_FFR_SOURCE).aggregate([{ $match: {} }, { $out: COLL_FFR_DEST }]);
  progress(100);
}

export default {
  down,
  up
};
