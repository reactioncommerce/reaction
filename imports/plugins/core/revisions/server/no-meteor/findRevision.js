/**
 *
 * @method findRevision
 * @summary TODO
 * @param {string} documentId - TODO
 * @param {Object} collections - TODO
 * @return {Promise<Object>} TODO:
 */
export default async function findRevision(documentId, collections) {
  const { Revisions } = collections;
  return Revisions.findOne({
    documentId,
    "workflow.status": {
      $nin: ["revision/published"]
    }
  });
}
