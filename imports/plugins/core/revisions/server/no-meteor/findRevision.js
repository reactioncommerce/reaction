/**
 * TODO:
 * @method
 * @summary
 * @param
 * @param
 * @return
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
