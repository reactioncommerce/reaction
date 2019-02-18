import collectionIndex from "/imports/utils/collectionIndex";
import processEmailJobs from "../util/processEmailJobs";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Emails, Templates } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Emails, { jobId: 1 }, { name: "c2_jobId" });
  collectionIndex(Templates, { shopId: 1 }, { name: "c2_shopId" });

  processEmailJobs(context);
}

