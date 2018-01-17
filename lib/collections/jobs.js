import { JobCollection } from "meteor/vsivsi:job-collection";

/**
 * Jobs Collection
 * @ignore
 */
export const Jobs = new JobCollection("Jobs", {
  noCollectionSuffix: true
});
