import SimpleSchema from "simpl-schema";

const cleanupSchema = new SimpleSchema({
  purgeAfterDays: SimpleSchema.Integer,
  type: String
});

const schema = new SimpleSchema({
  "cleanup": {
    type: Array,
    optional: true
  },
  "cleanup.$": cleanupSchema
});

export const jobCleanupRequests = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ backgroundJobs }) {
  if (backgroundJobs) {
    schema.validate(backgroundJobs);

    if (Array.isArray(backgroundJobs.cleanup)) {
      jobCleanupRequests.push(...backgroundJobs.cleanup);
    }
  }
}
