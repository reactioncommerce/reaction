/* eslint-disable no-console */
import methodCall from "./methodCall.js";
import {
  _setImmediate,
  concatReduce,
  isBoolean,
  isFunction,
  isInteger,
  isNonEmptyString,
  isNonEmptyStringOrArrayOfNonEmptyStrings,
  optionsHelp,
  reduceCallbacks,
  splitLongArray
} from "./util.js";

/**
 * @summary Factory that creates the `Job` class
 * @return {Class} Job
 */
export default function createJobClass() {
  class JobQueue {
    constructor(root, type, ...rest) {
      this.root = root;
      this.type = type;

      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      this.worker = rest[adjustedLength - 1];

      if (!(this instanceof JobQueue)) {
        return new JobQueue(this.root, this.type, ...Array.from(options), this.worker);
      }
      [options, this.worker] = Array.from(optionsHelp(options, this.worker));

      if (!isNonEmptyString(this.root)) {
        throw new Error("JobQueue: Invalid root, must be nonempty string");
      }

      if (!isNonEmptyStringOrArrayOfNonEmptyStrings(this.type)) {
        throw new Error("JobQueue: Invalid type, must be nonempty string or array of nonempty strings");
      }

      if (!isFunction(this.worker)) {
        throw new Error("JobQueue: Invalid worker, must be a function");
      }

      this.errorCallback = options.errorCallback || ((error) => console.error("JobQueue: ", error));
      if (!isFunction(this.errorCallback)) {
        throw new Error("JobQueue: Invalid errorCallback, must be a function");
      }


      if (options && !options.pollInterval) {
        // Disable no-use-before-define because while it looks like we're accessing `Job` before it's defined,
        // it's actually being accessed after it's defined, because this classes is used from within a Job class instance.
        //
        // eslint-disable-next-line no-use-before-define
        this.pollInterval = Job.forever;
      } else if (options && options.pollInterval !== undefined && !isInteger(options.pollInterval)) {
        this.pollInterval = 5000;
      } else {
        this.pollInterval = options.pollInterval;
      }

      if (!isInteger(this.pollInterval) || !(this.pollInterval >= 0)) {
        throw new Error("JobQueue: Invalid pollInterval, must be a positive integer");
      }

      this.concurrency = options.concurrency || 1;
      if (!isInteger(this.concurrency) || !(this.concurrency >= 0)) {
        throw new Error("JobQueue: Invalid concurrency, must be a positive integer");
      }

      this.payload = options.payload || 1;
      if (!isInteger(this.payload) || !(this.payload >= 0)) {
        throw new Error("JobQueue: Invalid payload, must be a positive integer");
      }

      this.prefetch = options.prefetch || 0;
      if (!isInteger(this.prefetch) || !(this.prefetch >= 0)) {
        throw new Error("JobQueue: Invalid prefetch, must be a positive integer");
      }

      this.workTimeout = options.workTimeout; // No default
      if (this.workTimeout && !(isInteger(this.workTimeout) && (this.workTimeout >= 0))) {
        throw new Error("JobQueue: Invalid workTimeout, must be a positive integer");
      }

      this.callbackStrict = options.callbackStrict;
      if (this.callbackStrict && !isBoolean(this.callbackStrict)) {
        throw new Error("JobQueue: Invalid callbackStrict, must be a boolean");
      }

      this._workers = {};
      this._tasks = [];
      this._taskNumber = 0;
      this._stoppingGetWork = undefined;
      this._stoppingTasks = undefined;
      this._interval = null;
      this._getWorkOutstanding = false;
      this.paused = true;
      this.resume();
    }

    _getWork() {
      // Don't reenter, or run when paused or stopping
      if (!this._getWorkOutstanding && !this.paused) {
        const numJobsToGet = (this.prefetch + (this.payload * (this.concurrency - this.running()))) - this.length();
        if (numJobsToGet > 0) {
          this._getWorkOutstanding = true;
          const options = { maxJobs: numJobsToGet };
          if (this.workTimeout) { options.workTimeout = this.workTimeout; }
          // eslint-disable-next-line no-use-before-define
          Job.getWork(this.root, this.type, options, (err, jobs) => {
            this._getWorkOutstanding = false;
            if (err) {
              this.errorCallback(new Error(`Received error from getWork(): ${err}`));
              return;
            }
            if (jobs && jobs instanceof Array) {
              if (jobs.length > numJobsToGet) {
                this.errorCallback(new Error(`getWork() returned jobs (${jobs.length}) in excess of maxJobs (${numJobsToGet})`));
              }
              for (const job of Array.from(jobs)) {
                this._tasks.push(job);
                if (!this._stoppingGetWork) { _setImmediate(this._process.bind(this)); }
              }
              if (this._stoppingGetWork) {
                this._stoppingGetWork();
              }
            } else {
              this.errorCallback(new Error("Nonarray response from server from getWork()"));
            }
          }).catch((error) => {
            this.errorCallback(new Error(`Caught unhandled rejection from getWork(): ${error}`));
          });
        }
      }
      return null;
    }

    // eslint-disable-next-line camelcase
    _only_once(fn) {
      let called = false;
      return function (...args) {
        if (called) {
          this.errorCallback(new Error("Worker callback called multiple times"));
          if (this.callbackStrict) {
            throw new Error("JobQueue: worker callback was invoked multiple times");
          }
        }
        called = true;
        return fn.apply(this, args);
      }.bind(this);
    }

    _process() {
      if (!this.paused && (this.running() < this.concurrency) && this.length()) {
        let job;
        if (this.payload > 1) {
          job = this._tasks.splice(0, this.payload);
        } else {
          job = this._tasks.shift();
        }
        job._taskId = `Task_${this._taskNumber += 1}`;
        this._workers[job._taskId] = job;

        const next = () => {
          delete this._workers[job._taskId];
          if (this._stoppingTasks && (this.running() === 0) && (this.length() === 0)) {
            return this._stoppingTasks();
          }
          _setImmediate(this._process.bind(this));
          return _setImmediate(this._getWork.bind(this));
        };
        const cb = this._only_once(next);

        // Worker may or may not be async so we'll wrap to be sure we can call .catch on it
        const runWorker = async () => {
          await this.worker(job, cb);
        };

        runWorker().catch((error) => {
          try {
            // `job` may actually be an array of jobs
            let count = 0;
            const arrayOfJobs = Array.isArray(job) ? job : [job];
            arrayOfJobs.forEach((singleJob) => {
              singleJob.fail(`Uncaught error in worker: ${error.message}`, () => {
                count += 1;
                if (count === arrayOfJobs.length) {
                  cb(); // eslint-disable-line
                }
              });
            });
          } catch (yetAnotherError) {
            throw yetAnotherError;
          }
        });
      }
      return null;
    }

    _stopGetWork(callback) {
      clearInterval(this._interval);
      this._interval = null;
      if (this._getWorkOutstanding) {
        this._stoppingGetWork = callback;
        return this._stoppingGetWork;
      }
      return _setImmediate(callback); // No Zalgo, thanks
    }

    _waitForTasks(callback) {
      if (this.running() !== 0) {
        this._stoppingTasks = callback;
        return this._stoppingTasks;
      }
      return _setImmediate(callback); // No Zalgo, thanks
    }

    _failJobs(tasks, callback) {
      if (tasks.length === 0) { _setImmediate(callback); } // No Zalgo, thanks
      let count = 0;
      return Array.from(tasks).map((job) =>
        job.fail("Worker shutdown", () => {
          count += 1;
          if (count === tasks.length) {
            return callback();
          }
          return null;
        }));
    }

    _hard(callback) {
      this.paused = true;
      return this._stopGetWork(() => {
        let tasks = this._tasks;
        this._tasks = [];
        for (const worker in this._workers) {
          if ({}.hasOwnProperty.call(this._workers, worker)) {
            const task = this._workers[worker];
            tasks = tasks.concat(task);
          }
        }
        return this._failJobs(tasks, callback);
      });
    }

    _stop(callback) {
      this.paused = true;
      return this._stopGetWork(() => {
        const tasks = this._tasks;
        this._tasks = [];
        return this._waitForTasks(() => (
          this._failJobs(tasks, callback)
        ));
      });
    }

    _soft(callback) {
      return this._stopGetWork(() => (
        this._waitForTasks(callback)
      ));
    }

    length() { return this._tasks.length; }

    running() { return Object.keys(this._workers).length; }

    idle() { return (this.length() + this.running()) === 0; }

    full() { return this.running() === this.concurrency; }

    pause() {
      if (this.paused) return this;

      // eslint-disable-next-line no-use-before-define
      if (this.pollInterval < Job.forever) {
        clearInterval(this._interval);
        this._interval = null;
      }
      this.paused = true;
      return this;
    }

    resume() {
      if (!this.paused) return this;

      this.paused = false;
      _setImmediate(this._getWork.bind(this));
      // eslint-disable-next-line no-use-before-define
      if (this.pollInterval < Job.forever) {
        this._interval = setInterval(this._getWork.bind(this), this.pollInterval);
      }
      for (let wk = 1, end = this.concurrency, asc = end >= 1; asc ? wk <= end : wk >= end; asc ? wk += 1 : wk -= 1) {
        _setImmediate(this._process.bind(this));
      }
      return this;
    }

    trigger() {
      if (this.paused) return this;

      _setImmediate(this._getWork.bind(this));
      return this;
    }

    shutdown(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (!options.level) { options.level = "normal"; }
      if (!options.quiet) { options.quiet = false; }
      if (!cb) {
        if (!options.quiet) { console.warn("using default shutdown callback!"); }
        cb = () => console.warn("Shutdown complete");
      }

      switch (options.level) {
        case "hard":
          if (!options.quiet) { console.warn("Shutting down hard"); }
          return this._hard(cb);
        case "soft":
          if (!options.quiet) { console.warn("Shutting down soft"); }
          return this._soft(cb);
        default:
          if (!options.quiet) { console.warn("Shutting down normally"); }
          return this._stop(cb);
      }
    }
  }

  class Job {
    static initClass() {
      // This is the JS max int value = 2^53
      this.forever = 9007199254740992;

      // This is the maximum date value in JS
      this.foreverDate = new Date(8640000000000000);

      this.jobPriorities = {
        low: 10,
        normal: 0,
        medium: -5,
        high: -10,
        critical: -15
      };

      this.jobRetryBackoffMethods = ["constant", "exponential"];

      this.jobStatuses = ["waiting", "paused", "ready", "running",
        "failed", "cancelled", "completed"];

      this.jobLogLevels = ["info", "success", "warning", "danger"];

      this.jobStatusCancellable = ["running", "ready", "waiting", "paused"];
      this.jobStatusPausable = ["ready", "waiting"];
      this.jobStatusRemovable = ["cancelled", "completed", "failed"];
      this.jobStatusRestartable = ["cancelled", "failed"];

      // This is defined above
      this.processJobs = JobQueue;

      // Makes a job object from a job document
      // This method is deprecated and will be removed
      this.makeJob = (function () {
        let depFlag = false;
        return function (root, doc) {
          if (!depFlag) {
            depFlag = true;
            console.warn("Job.makeJob(root, jobDoc) has been deprecated and will be removed in a future release, use 'new Job(root, jobDoc)' instead.");
          }
          return new Job(root, doc);
        };
      }());

      // Define convenience getters for some document properties
      Object.defineProperties(this.prototype, {
        doc: {
          get() { return this._doc; },
          set() { return console.warn("Job.doc cannot be directly assigned."); }
        },
        type: {
          get() { return this._doc.type; },
          set() { return console.warn("Job.type cannot be directly assigned."); }
        },
        data: {
          get() { return this._doc.data; },
          set() { return console.warn("Job.data cannot be directly assigned."); }
        }
      });
    }

    // Class methods

    // Creates a job object by reserving the next available job of
    // the specified 'type' from the server queue root
    // returns null if no such job exists
    static getWork(root, typeOrArray, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let type = typeOrArray;
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (typeof type === "string") {
        type = [type];
      }

      if (options.workTimeout !== null && options.workTimeout !== undefined) {
        if (!isInteger(options.workTimeout) || !(options.workTimeout > 0)) {
          throw new Error("getWork: workTimeout must be a positive integer");
        }
      }

      return methodCall(root, "getWork", [type, options], cb, (res) => {
        const jobs = (Array.from(res).map((doc) => new Job(root, doc))) || [];
        if (options.maxJobs) {
          return jobs;
        }

        return jobs[0];
      });
    }

    // Creates a job object by id from the server queue root
    // returns null if no such job exists
    static getJob(root, id, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      if (!options.getLog) { options.getLog = false; }
      return methodCall(root, "getJob", [id, options], cb, (doc) => {
        if (doc) {
          return new Job(root, doc);
        }

        return null;
      });
    }

    // Like the above, but takes an array of ids, returns array of jobs
    static async getJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      if (!options.getLog) { options.getLog = false; }
      let retVal = [];
      const chunksOfIds = splitLongArray(ids, 32);
      const myCb = reduceCallbacks(cb, chunksOfIds.length, concatReduce, []);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        const result = await methodCall(root, "getJob", [chunkOfIds, options], myCb, (doc) => {
          if (doc) {
            return (Array.from(doc).map((jobDoc) => new Job(root, jobDoc.type, jobDoc.data, jobDoc)));
          }

          return null;
        });
        retVal = retVal.concat(result);
      }
      return retVal;
    }

    // Pause this job, only Ready and Waiting jobs can be paused
    // Calling this toggles the paused state. Unpaused jobs go to waiting
    static async pauseJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      let retVal = false;
      const chunksOfIds = splitLongArray(ids, 256);
      const myCb = reduceCallbacks(cb, chunksOfIds.length);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        retVal = await methodCall(root, "jobPause", [chunkOfIds, options], myCb) || retVal;
      }
      return retVal;
    }

    // Resume this job, only Paused jobs can be resumed
    // Calling this toggles the paused state. Unpaused jobs go to waiting
    static async resumeJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      let retVal = false;
      const chunksOfIds = splitLongArray(ids, 256);
      const myCb = reduceCallbacks(cb, chunksOfIds.length);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        retVal = await methodCall(root, "jobResume", [chunkOfIds, options], myCb) || retVal;
      }
      return retVal;
    }

    // Move waiting jobs to the ready state, jobs with dependencies will not
    // be made ready unless force is used.
    static async readyJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      if (!options.force) { options.force = false; }
      let retVal = false;
      let chunksOfIds = splitLongArray(ids || [], 256);
      if (!(chunksOfIds.length > 0)) { chunksOfIds = [[]]; }
      const myCb = reduceCallbacks(cb, chunksOfIds.length);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        retVal = await methodCall(root, "jobReady", [chunkOfIds, options], myCb) || retVal;
      }
      return retVal;
    }

    // Cancel this job if it is running or able to run (waiting, ready)
    static async cancelJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      if (!options.antecedents) { options.antecedents = true; }
      let retVal = false;
      const chunksOfIds = splitLongArray(ids, 256);
      const myCb = reduceCallbacks(cb, chunksOfIds.length);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        retVal = await methodCall(root, "jobCancel", [chunkOfIds, options], myCb) || retVal;
      }
      return retVal;
    }

    // Restart a failed or cancelled job
    static async restartJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      if (typeof options.retries !== "number") { options.retries = 1; }
      if (!options.dependents) { options.dependents = true; }
      let retVal = false;
      const chunksOfIds = splitLongArray(ids, 256);
      const myCb = reduceCallbacks(cb, chunksOfIds.length);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        retVal = await methodCall(root, "jobRestart", [chunkOfIds, options], myCb) || retVal;
      }
      return retVal;
    }

    // Remove a job that is not able to run (completed, cancelled, failed) from the queue
    static async removeJobs(root, ids, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      let retVal = false;
      const chunksOfIds = splitLongArray(ids, 256);
      const myCb = reduceCallbacks(cb, chunksOfIds.length);
      for (const chunkOfIds of Array.from(chunksOfIds)) {
        /* eslint-disable-next-line no-await-in-loop */
        retVal = await methodCall(root, "jobRemove", [chunkOfIds, options], myCb) || retVal;
      }
      return retVal;
    }

    // Start the job queue
    // Deprecated!
    static startJobs(root, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      return methodCall(root, "startJobs", [options], cb);
    }

    // Stop the job queue, stop all running jobs
    // Deprecated!
    static stopJobs(root, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      if (typeof options.timeout !== "number") { options.timeout = 60 * 1000; }
      return methodCall(root, "stopJobs", [options], cb);
    }

    // Start the job queue
    static startJobServer(root, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      return methodCall(root, "startJobServer", [options], cb);
    }

    // Shutdown the job queue, stop all running jobs
    static shutdownJobServer(root, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));
      return methodCall(root, "shutdownJobServer", [options], cb);
    }

    // Job class instance constructor. When "new Job(...)" is run
    constructor(rootVal, jobType, jobData) {
      let type = jobType;
      let data = jobData;
      let doc;

      if (!(this instanceof Job)) {
        return new Job(rootVal, type, data);
      }

      // Set the root value
      this.root = rootVal;
      // Keep a copy of the original root value, whatever type that is
      this._root = rootVal;

      // Handle root as object with obj.root attribute
      if (this.root && typeof this.root.root === "string") {
        this.root = this._root.root;
      }

      // Handle (root, doc) signature
      if (!data && (type && type.data && type.type)) {
        if (type instanceof Job) {
          return type;
        }

        doc = type;
        ({ data } = doc);
        ({ type } = doc);
      } else {
        doc = {};
      }

      if ((typeof doc !== "object") ||
        (typeof data !== "object") ||
        (typeof type !== "string") ||
        (typeof this.root !== "string")) {
        // eslint-disable-next-line max-len
        throw new Error(`new Job: bad parameter(s), ${this.root} (${typeof this.root}), ${type} (${typeof type}), ${data} (${typeof data}), ${doc} (${typeof doc})`);
      } else if (doc.type && doc.data) { // This case is used to create local Job objects from DDP calls
        this._doc = doc;
      } else { // This is the normal "create a new object" case
        const time = new Date();
        this._doc = {
          runId: null,
          type,
          data,
          status: "waiting",
          updated: time,
          created: time
        };
        this.priority()
          .retry()
          .repeat()
          .after()
          .progress()
          .depends()
          .log("Constructed");
      }

      return this;
    }

    // Override point for methods that have an echo option
    _echo(message, level = null) {
      switch (level) {
        case "danger": console.error(message); break;
        case "warning": console.warn(message); break;
        case "success": console.log(message); break;
        default: console.info(message);
      }
    }

    // Adds a run dependency on one or more existing jobs to this job
    // Calling with a falsy value resets the dependencies to []
    depends(jobOrArray) {
      let jobs = jobOrArray;
      let depends;
      if (jobs) {
        if (jobs instanceof Job) {
          jobs = [jobs];
        }
        if (jobs instanceof Array) {
          ({ depends } = this._doc);
          for (const jobInstance of Array.from(jobs)) {
            if (!(jobInstance instanceof Job) || !jobInstance._doc._id) {
              throw new Error("Each provided object must be a saved Job instance (with an _id)");
            }
            depends.push(jobInstance._doc._id);
          }
        } else {
          throw new Error("Bad input parameter: depends() accepts a falsy value, or Job or array of Jobs");
        }
      } else {
        depends = [];
      }
      this._doc.depends = depends;
      this._doc.resolved = []; // This is where prior depends go as they are satisfied
      return this;
    }

    // Set the run priority of this job
    priority(level = 0) {
      let priority;

      if (typeof level === "string") {
        priority = Job.jobPriorities[level];
        if (priority === null || priority === undefined) {
          throw new Error("Invalid string priority level provided");
        }
      } else if (isInteger(level)) {
        priority = level;
      } else {
        throw new Error("priority must be an integer or valid priority level");
      }
      this._doc.priority = priority;
      return this;
    }

    // Sets the number of attempted runs of this job and
    // the time to wait between successive attempts
    // Default, do not retry
    retry(opts = 0) {
      let options = opts;

      if (isInteger(options) && (options >= 0)) {
        options = { retries: options };
      }
      if (typeof options !== "object") {
        throw new Error("bad parameter: accepts either an integer >= 0 or an options object");
      }
      if (options.retries !== null && options.retries !== undefined) {
        if (!isInteger(options.retries) || !(options.retries >= 0)) {
          throw new Error("bad option: retries must be an integer >= 0");
        }
        options.retries += 1;
      } else {
        options.retries = Job.forever;
      }
      if (options.until !== null && options.until !== undefined) {
        if (!(options.until instanceof Date)) {
          throw new Error("bad option: until must be a Date object");
        }
      } else {
        options.until = Job.foreverDate;
      }
      if (options.wait !== null && options.wait !== undefined) {
        if (!isInteger(options.wait) || !(options.wait >= 0)) {
          throw new Error("bad option: wait must be an integer >= 0");
        }
      } else {
        options.wait = 5 * 60 * 1000;
      }
      if (options.backoff !== null && options.backoff !== undefined) {
        if (!Array.from(Job.jobRetryBackoffMethods).includes(options.backoff)) {
          throw new Error("bad option: invalid retry backoff method");
        }
      } else {
        options.backoff = "constant";
      }

      this._doc.retries = options.retries;
      this._doc.repeatRetries = options.retries;
      this._doc.retryWait = options.wait;
      if (this._doc.retried === null || this._doc.retried === undefined) { this._doc.retried = 0; }
      this._doc.retryBackoff = options.backoff;
      this._doc.retryUntil = options.until;
      return this;
    }

    // Sets the number of times to repeatedly run this job
    // and the time to wait between successive runs
    // Default: repeat every 5 minutes, forever...
    repeat(opts = 0) {
      let options = opts;

      if (isInteger(options) && (options >= 0)) {
        options = { repeats: options };
      }
      if (typeof options !== "object") {
        throw new Error("bad parameter: accepts either an integer >= 0 or an options object");
      }
      if (typeof options.wait !== "undefined" && typeof options.schedule !== "undefined") {
        throw new Error("bad options: wait and schedule options are mutually exclusive");
      }
      if (typeof options.repeats !== "undefined") {
        if (!isInteger(options.repeats) || !(options.repeats >= 0)) {
          throw new Error("bad option: repeats must be an integer >= 0");
        }
      } else {
        options.repeats = Job.forever;
      }
      if (typeof options.until !== "undefined") {
        if (!(options.until instanceof Date)) {
          throw new Error("bad option: until must be a Date object");
        }
      } else {
        options.until = Job.foreverDate;
      }
      if (typeof options.wait !== "undefined") {
        if (!isInteger(options.wait) || !(options.wait >= 0)) {
          throw new Error("bad option: wait must be an integer >= 0");
        }
      } else {
        options.wait = 5 * 60 * 1000;
      }
      if (typeof options.schedule !== "undefined") {
        if (typeof options.schedule !== "object") {
          throw new Error("bad option, schedule option must be an object");
        }
        if (((typeof options.schedule !== "undefined" ? options.schedule.schedules : undefined) === null) || !(options.schedule.schedules instanceof Array)) {
          throw new Error("bad option, schedule object requires a schedules attribute of type Array.");
        }
        if ((options.schedule.exceptions !== null) && !(options.schedule.exceptions instanceof Array)) {
          throw new Error("bad option, schedule object exceptions attribute must be an Array");
        }
        options.wait = {
          schedules: options.schedule.schedules,
          exceptions: options.schedule.exceptions
        };
      }

      this._doc.repeats = options.repeats;
      this._doc.repeatWait = options.wait;
      if (this._doc.repeated === null || this._doc.repeated === undefined) { this._doc.repeated = 0; }
      this._doc.repeatUntil = options.until;
      return this;
    }

    // Sets the delay before this job can run after it is saved
    delay(wait = 0) {
      if (!isInteger(wait) || !(wait >= 0)) {
        throw new Error("Bad parameter, delay requires a non-negative integer.");
      }
      return this.after(new Date(new Date().valueOf() + wait));
    }

    // Sets a time after which this job can run once it is saved
    after(time = new Date(0)) {
      let after;

      if ((typeof time === "object") && time instanceof Date) {
        after = time;
      } else {
        throw new Error("Bad parameter, after requires a valid Date object");
      }
      this._doc.after = after;
      return this;
    }

    // Write a message to this job's log.
    log(message, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (!options.level) { options.level = "info"; }
      if (typeof message !== "string") {
        throw new Error("Log message must be a string");
      }
      if ((typeof options.level !== "string") || !Array.from(Job.jobLogLevels).includes(options.level)) {
        throw new Error("Log level options must be one of Job.jobLogLevels");
      }
      if (typeof options.echo !== "undefined") {
        if (options.echo && (Job.jobLogLevels.indexOf(options.level) >= Job.jobLogLevels.indexOf(options.echo))) {
          this._echo(`LOG: ${options.level}, ${this._doc._id} ${this._doc.runId}: ${message}`, options.level);
        }
        delete options.echo;
      }
      if (typeof this._doc._id !== "undefined") {
        return methodCall(this._root, "jobLog", [this._doc._id, this._doc.runId, message, options], cb);
      }
      // Log can be called on an unsaved job
      if (this._doc.log === null || this._doc.log === undefined) { this._doc.log = []; }
      this._doc.log.push({ time: new Date(), runId: null, level: options.level, message });
      if ((cb !== null) && (typeof cb === "function")) {
        _setImmediate(cb, null, true); // DO NOT release Zalgo
      }
      return this; // Allow call chaining in this case
    }

    // Indicate progress made for a running job. This is important for
    // long running jobs so the scheduler doesn't assume they are dead
    progress(completed = 0, total = 1, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if ((typeof completed === "number") &&
        (typeof total === "number") &&
        (completed >= 0) &&
        (total > 0) &&
        (total >= completed)) {
        const progress = {
          completed,
          total,
          percent: (100 * completed) / total
        };
        if (options.echo) {
          delete options.echo;
          this._echo(`PROGRESS: ${this._doc._id} ${this._doc.runId}: ${progress.completed} out of ${progress.total} (${progress.percent}%)`);
        }
        if ((typeof this._doc._id !== "undefined") && (typeof this._doc.runId !== "undefined")) {
          return methodCall(this._root, "jobProgress", [this._doc._id, this._doc.runId, completed, total, options], cb, (res) => {
            if (res) {
              this._doc.progress = progress;
            }
            return res;
          });
        } else if (this._doc._id === null || this._doc._id === undefined) {
          this._doc.progress = progress;
          if (typeof cb === "function") {
            _setImmediate(cb, null, true); // DO NOT release Zalgo
          }
          return this;
        }
      } else {
        throw new Error(`job.progress: something is wrong with progress params: ${this.id}, ${completed} out of ${total}`);
      }
      return null;
    }

    // Save this job to the server job queue Collection it will also resave a modified job if the
    // job is not running and hasn't completed.
    save(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      return methodCall(this._root, "jobSave", [this._doc, options], cb, (id) => {
        if (id) {
          this._doc._id = id;
        }
        return id;
      });
    }

    // Refresh the local job state with the server job queue's version
    refresh(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (options.getLog === null || options.getLog === undefined) { options.getLog = false; }
      if (this._doc._id !== null && this._doc._id !== undefined) {
        return methodCall(this._root, "getJob", [this._doc._id, options], cb, (doc) => {
          if (doc) {
            this._doc = doc;
            return this;
          }
          return false;
        });
      }
      throw new Error("Can't call .refresh() on an unsaved job");
    }

    // Indicate to the server that this run has successfully finished.
    done(resultOrCallback = {}, ...rest) {
      const adjustedLength = Math.max(rest.length, 1);
      let result = resultOrCallback;
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      if (typeof result === "function") {
        cb = result;
        result = {};
      }
      [options, cb] = Array.from(optionsHelp(options, cb));
      if ((result === null || result === undefined) || (typeof result !== "object")) {
        result = { value: result };
      }
      if (this._doc._id && this._doc.runId) {
        return methodCall(this._root, "jobDone", [this._doc._id, this._doc.runId, result, options], cb);
      }

      throw new Error("Can't call .done() on an unsaved or non-running job");
    }

    // Indicate to the server that this run has failed and provide an error message.
    fail(resultOrCallback = "No error information provided", ...rest) {
      let result = resultOrCallback;

      const adjustedLength = Math.max(rest.length, 1);
      let options = rest.slice(0, adjustedLength - 1);
      let cb = rest[adjustedLength - 1];

      if (typeof result === "function") {
        cb = result;
        result = "No error information provided";
      }
      [options, cb] = Array.from(optionsHelp(options, cb));
      if ((result === null || result === undefined) || (typeof result !== "object")) {
        result = { value: result };
      }
      if (options.fatal === null || options.fatal === undefined) { options.fatal = false; }
      if (this._doc._id && this._doc.runId) {
        return methodCall(this._root, "jobFail", [this._doc._id, this._doc.runId, result, options], cb);
      }

      throw new Error("Can't call .fail() on an unsaved or non-running job");
    }

    // Pause this job, only Ready and Waiting jobs can be paused
    pause(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (this._doc._id) {
        return methodCall(this._root, "jobPause", [this._doc._id, options], cb);
      }

      this._doc.status = "paused";
      if (typeof cb === "function") {
        _setImmediate(cb, null, true); // DO NOT release Zalgo
      }
      return this;
    }

    // Resume this job, only Paused jobs can be resumed
    // Resumed jobs go to waiting
    resume(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (this._doc._id) {
        return methodCall(this._root, "jobResume", [this._doc._id, options], cb);
      }
      this._doc.status = "waiting";
      if (typeof cb === "function") {
        _setImmediate(cb, null, true); // DO NOT release Zalgo
      }
      return this;
    }

    // Make a waiting job ready to run. Jobs with dependencies only when forced
    ready(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (options.force === null || options.force === undefined) { options.force = false; }
      if (this._doc._id) {
        return methodCall(this._root, "jobReady", [this._doc._id, options], cb);
      }

      throw new Error("Can't call .ready() on an unsaved job");
    }

    // Cancel this job if it is running or able to run (waiting, ready)
    cancel(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (options.antecedents === null || options.antecedents === undefined) { options.antecedents = true; }
      if (this._doc._id) {
        return methodCall(this._root, "jobCancel", [this._doc._id, options], cb);
      }

      throw new Error("Can't call .cancel() on an unsaved job");
    }

    // Restart a failed or cancelled job
    restart(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (options.retries === null || options.retries === undefined) { options.retries = 1; }
      if (options.dependents === null || options.dependents === undefined) { options.dependents = true; }
      if (this._doc._id) {
        return methodCall(this._root, "jobRestart", [this._doc._id, options], cb);
      }

      throw new Error("Can't call .restart() on an unsaved job");
    }

    // Run a completed job again as a new job, essentially a manual repeat
    rerun(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (options.repeats === null || options.repeats === undefined) { options.repeats = 0; }
      if (options.wait === null || options.wait === undefined) { options.wait = this._doc.repeatWait; }
      if (this._doc._id) {
        return methodCall(this._root, "jobRerun", [this._doc._id, options], cb);
      }

      throw new Error("Can't call .rerun() on an unsaved job");
    }

    // Remove a job that is not able to run (completed, cancelled, failed) from the queue
    remove(...args) {
      const adjustedLength = Math.max(args.length, 1);
      let options = args.slice(0, adjustedLength - 1);
      let cb = args[adjustedLength - 1];

      [options, cb] = Array.from(optionsHelp(options, cb));

      if (this._doc._id) {
        return methodCall(this._root, "jobRemove", [this._doc._id, options], cb);
      }

      throw new Error("Can't call .remove() on an unsaved job");
    }
  }

  Job.initClass();

  return Job;
}
