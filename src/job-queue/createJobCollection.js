import createJobClass from "./createJobClass.js";
import createJobCollectionClass from "./createJobCollectionClass.js";

/**
 * @summary Factory that creates the `Job` and `JobCollection` classes
 * @return {Object} Object with `Job` and `JobCollection` classes
 */
export default function createJobCollection({ later }) {
  // Create classes through dependency injecting
  const Job = createJobClass();
  const JobCollection = createJobCollectionClass({ Job, later });

  return {
    Job,
    JobCollection
  };
}
