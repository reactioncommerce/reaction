/**
 * @summary adds createdAt and updatedAt fields to the current collection and assigns it to 01-01-1970
 * @param {Object} args - the arguments
 * @param {Object} args.db - the DB client
 * @param {Function} args.progress - a function to set the progress of the operation
 * @returns {undefined}
 */
async function up({ db, progress }) {
  progress(0);

  const date = new Date(1970, 0, 1);
  const query = { createdAt: { $exists: false }, updatedAt: { $exists: false } };
  const update = { $set: { createdAt: date, updatedAt: date } };
  const options = { upsert: false, multi: true };

  await db.collection("Emails").update(query, update, options);

  progress(100);
}

export default {
  down: "unnecessary",
  up
};
