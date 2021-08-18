/**
 * @summary remove index slug_1 from tags
 * @param {Object} args - the arguments
 * @param {Object} args.db - the DB client
 * @param {Function} args.progress - a function to set the progress of the operation
 * @returns {undefined}
 */
async function up({ db, progress }) {
  progress(0);

  const index = "slug_1";
  await db.collection("Tags").dropIndex(index);

  progress(100);
}

export default {
  down: "unnecessary",
  up
};
