import createJobClass from "./createJobClass";
import createJobCollectionClass from "./createJobCollectionClass";

/**
 *
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
