import later from "later";
import createJobCollection from "./job-queue/createJobCollection";

const { Job, JobCollection } = createJobCollection({ later });

const Jobs = new JobCollection();

export { Jobs, Job };
