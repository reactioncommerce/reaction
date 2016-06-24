import { JobCollection } from "meteor/vsivsi:job-collection";

/**
 * Jobs Collection
 */
export const Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});
