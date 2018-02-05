/* eslint-disable no-console */
/*
  Original version: https://github.com/vsivsi/meteor-job-collection/
  License: https://github.com/vsivsi/meteor-job-collection/blob/master/LICENSE
 */
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// ###########################################################################
//     Copyright (C) 2014-2017 by Vaughn Iverson
//     meteor-job-class is free software released under the MIT/X11 license.
//     See included LICENSE file for details.
// ###########################################################################

import { Meteor } from "meteor/meteor";

// Exports Job object

function methodCall(root, method, params, cb, after = ret => ret) {
  const left = (Job._ddp_apply !== null ? Job._ddp_apply[root.root !== null ? root.root : root] : undefined);
  const apply = left !== null ? left : Job._ddp_apply;

  if (typeof apply !== "function") {
    throw new Error("Job remote method call error, no valid invocation method found.");
  }

  const name = `${root.root !== null ? root.root : root}_${method}`;

  if (cb && (typeof cb === "function")) {
    return apply(name, params, (err, res) => {
      if (err) { return cb(err); }
      return cb(null, after(res));
    });
  }

  return after(apply(name, params));
}

function optionsHelp(opts, cb) {
  let options = opts;
  let callback = cb;

  // If cb isn't a function, it's assumed to be options...
  if (!cb && typeof cb !== "function") {
    options = cb;
    callback = undefined;
  } else {
    if ((typeof options !== "object") ||
            !(options instanceof Array) ||
            !(options.length < 2)) {
      throw new Error("options... in optionsHelp must be an Array with zero or one elements");
    }
    options = options && options[0];
  }
  if (typeof options !== "object") {
    throw new Error("in optionsHelp options not an object or bad callback");
  }
  return [options, callback];
}

function splitLongArray(arr, max) {
  if (!(arr instanceof Array) || !(max > 0)) { throw new Error("splitLongArray: bad params"); }
  return __range__(0, Math.ceil(arr.length / max), false).map((i) => arr.slice((i * max), ((i + 1) * max)));
}

// This function soaks up num callbacks, by default returning the disjunction of Boolean results
// or returning on first error.... Reduce function causes different reduce behavior, such as concatenation
function reduceCallbacks(cb, num, reduce = (a, b) => a || b, init = false) {
  if (!cb) {
    return undefined;
  }

  if ((typeof cb !== "function") || !(num > 0) || (typeof reduce !== "function")) {
    throw new Error("Bad params given to reduceCallbacks");
  }
  let cbRetVal = init;
  let cbCount = 0;
  let cbErr = null;
  return function (err, res) {
    if (!cbErr) {
      if (err) {
        cbErr = err;
        return cb(err);
      }

      cbCount++;
      cbRetVal = reduce(cbRetVal, res);
      if (cbCount === num) {
        return cb(null, cbRetVal);
      } else if (cbCount > num) {
        throw new Error(`reduceCallbacks callback invoked more than requested ${num} times`);
      }
    }
  };
}

function concatReduce(a, b) {
  let arrayA = a;

  if (!(arrayA instanceof Array)) { arrayA = [arrayA]; }
  return arrayA.concat(b);
}

const isInteger = i => (typeof i === "number") && (Math.floor(i) === i);

const isBoolean = b => typeof b === "boolean";

const isFunction = f => typeof f === "function";

const isNonEmptyString = s => (typeof s === "string") && (s.length > 0);

const isNonEmptyStringOrArrayOfNonEmptyStrings = sa =>
  isNonEmptyString(sa) ||
    (sa instanceof Array &&
    (sa.length !== 0) &&
    (((() => {
      const result = [];
      for (const s of Array.from(sa)) {
        if (isNonEmptyString(s)) {
          result.push(s);
        }
      }
      return result;
    })()).length === sa.length))
 ;

// This smooths over the various different implementations...
function _setImmediate(func, ...args) {
  if ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.setTimeout : undefined) !== null) {
    return Meteor.setTimeout(func, 0, ...Array.from(args));
  } else if (typeof setImmediate !== "undefined" && setImmediate !== null) {
    return setImmediate(func, ...Array.from(args));
  }

  // Browser fallback
  return setTimeout(func, 0, ...Array.from(args));
}

function _setInterval(func, timeOut, ...args) {
  if ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.setInterval : undefined) !== null) {
    return Meteor.setInterval(func, timeOut, ...Array.from(args));
  }

  // Browser / node.js fallback
  return setInterval(func, timeOut, ...Array.from(args));
}

function _clearInterval(id) {
  if ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.clearInterval : undefined) !== null) {
    return Meteor.clearInterval(id);
  }

  // Browser / node.js fallback
  return clearInterval(id);
}

// ##################################################################

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

    this.errorCallback = options.errorCallback !== null ? options.errorCallback : e => console.error("JobQueue: ", e);
    if (!isFunction(this.errorCallback)) {
      throw new Error("JobQueue: Invalid errorCallback, must be a function");
    }


    if (options && !options.pollInterval) {
      this.pollInterval = Job.forever;
    } else if (options && options.pollInterval !== undefined && !isInteger(options.pollInterval)) {
      this.pollInterval = 5000;
    } else {
      this.pollInterval = options.pollInterval;
    }

    if (!isInteger(this.pollInterval) || !(this.pollInterval >= 0)) {
      throw new Error("JobQueue: Invalid pollInterval, must be a positive integer");
    }

    this.concurrency = options.concurrency !== null ? options.concurrency : 1;
    if (!isInteger(this.concurrency) || !(this.concurrency >= 0)) {
      throw new Error("JobQueue: Invalid concurrency, must be a positive integer");
    }

    this.payload = options.payload !== null ? options.payload : 1;
    if (!isInteger(this.payload) || !(this.payload >= 0)) {
      throw new Error("JobQueue: Invalid payload, must be a positive integer");
    }

    this.prefetch = options.prefetch !== null ? options.prefetch : 0;
    if (!isInteger(this.prefetch) || !(this.prefetch >= 0)) {
      throw new Error("JobQueue: Invalid prefetch, must be a positive integer");
    }

    this.workTimeout = options.workTimeout;  // No default
    if ((this.workTimeout !== null) && !(isInteger(this.workTimeout) && (this.workTimeout >= 0))) {
      throw new Error("JobQueue: Invalid workTimeout, must be a positive integer");
    }

    this.callbackStrict = options.callbackStrict;
    if ((this.callbackStrict !== null) && !isBoolean(this.callbackStrict)) {
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
        if (this.workTimeout !== null) { options.workTimeout = this.workTimeout; }
        return Job.getWork(this.root, this.type, options, (err, jobs) => {
          this._getWorkOutstanding = false;
          if (err) {
            return this.errorCallback(new Error(`Received error from getWork(): ${err}`));
          } else if ((jobs !== null) && jobs instanceof Array) {
            if (jobs.length > numJobsToGet) {
              this.errorCallback(new Error(`getWork() returned jobs (${jobs.length}) in excess of maxJobs (${numJobsToGet})`));
            }
            for (const j of Array.from(jobs)) {
              this._tasks.push(j);
              if (this._stoppingGetWork === null) { _setImmediate(this._process.bind(this)); }
            }
            if (this._stoppingGetWork !== null) { return this._stoppingGetWork(); }
          } else {
            return this.errorCallback(new Error("Nonarray response from server from getWork()"));
          }
        });
      }
    }
  }

  _only_once(fn) {
    let called = false;
    return function () {
      if (called) {
        this.errorCallback(new Error("Worker callback called multiple times"));
        if (this.callbackStrict) {
          throw new Error("JobQueue: worker callback was invoked multiple times");
        }
      }
      called = true;
      return fn.apply(this, arguments);
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
      job._taskId = `Task_${this._taskNumber++}`;
      this._workers[job._taskId] = job;
      const next = () => {
        delete this._workers[job._taskId];
        if ((this._stoppingTasks !== null) && (this.running() === 0) && (this.length() === 0)) {
          return this._stoppingTasks();
        }
        _setImmediate(this._process.bind(this));
        return _setImmediate(this._getWork.bind(this));
      };
      const cb = this._only_once(next);
      return this.worker(job, cb);
    }
  }

  _stopGetWork(callback) {
    _clearInterval(this._interval);
    this._interval = null;
    if (this._getWorkOutstanding) {
      this._stoppingGetWork = callback;
      return this._stoppingGetWork;
    }
    return _setImmediate(callback);  // No Zalgo, thanks
  }

  _waitForTasks(callback) {
    if (this.running() !== 0) {
      this._stoppingTasks = callback;
      return this._stoppingTasks;
    }
    return _setImmediate(callback);  // No Zalgo, thanks
  }

  _failJobs(tasks, callback) {
    if (tasks.length === 0) { _setImmediate(callback); }  // No Zalgo, thanks
    let count = 0;
    return Array.from(tasks).map((job) =>
      job.fail("Worker shutdown", () => {
        count++;
        if (count === tasks.length) {
          return callback();
        }
      }));
  }

  _hard(callback) {
    this.paused = true;
    return this._stopGetWork(() => {
      let tasks = this._tasks;
      this._tasks = [];
      for (const i in this._workers) {
        if ({}.hasOwnProperty(this._workers[i])) {
          const r = this._workers[i];
          tasks = tasks.concat(r);
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
      return this._waitForTasks(() => {
        return this._failJobs(tasks, callback);
      });
    });
  }

  _soft(callback) {
    return this._stopGetWork(() => {
      return this._waitForTasks(callback);
    });
  }

  length() { return this._tasks.length; }

  running() { return Object.keys(this._workers).length; }

  idle() { return (this.length() + this.running()) === 0; }

  full() { return this.running() === this.concurrency; }

  pause() {
    if (this.paused) { return; }
    if (!(this.pollInterval >= Job.forever)) {
      _clearInterval(this._interval);
      this._interval = null;
    }
    this.paused = true;
    return this;
  }

  resume() {
    if (!this.paused) { return; }
    this.paused = false;
    _setImmediate(this._getWork.bind(this));
    if (!(this.pollInterval >= Job.forever)) {
      this._interval = _setInterval(this._getWork.bind(this), this.pollInterval);
    }
    for (let w = 1, end = this.concurrency, asc = end >= 1; asc ? w <= end : w >= end; asc ? w++ : w--) {
      _setImmediate(this._process.bind(this));
    }
    return this;
  }

  trigger() {
    if (this.paused) { return; }
    _setImmediate(this._getWork.bind(this));
    return this;
  }

  shutdown(...args) {
    const adjustedLength = Math.max(args.length, 1);
    let options = args.slice(0, adjustedLength - 1);
    let cb = args[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));

    if (options.level === null) { options.level = "normal"; }
    if (options.quiet === null) { options.quiet = false; }
    if (cb === null) {
      if (!options.quiet) { console.warn("using default shutdown callback!"); }
      cb = () => {
        return console.warn("Shutdown complete");
      };
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

// ##################################################################

export class Job {
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

    this.jobRetryBackoffMethods = [ "constant", "exponential" ];

    this.jobStatuses = [ "waiting", "paused", "ready", "running",
      "failed", "cancelled", "completed" ];

    this.jobLogLevels = [ "info", "success", "warning", "danger" ];

    this.jobStatusCancellable = [ "running", "ready", "waiting", "paused" ];
    this.jobStatusPausable = [ "ready", "waiting" ];
    this.jobStatusRemovable =   [ "cancelled", "completed", "failed" ];
    this.jobStatusRestartable = [ "cancelled", "failed" ];

    this.ddpMethods = [ "startJobs", "stopJobs",  // Deprecated!
      "startJobServer", "shutdownJobServer",
      "jobRemove", "jobPause", "jobResume", "jobReady",
      "jobCancel", "jobRestart", "jobSave", "jobRerun", "getWork",
      "getJob", "jobLog", "jobProgress", "jobDone", "jobFail" ];

    this.ddpPermissionLevels = [ "admin", "manager", "creator", "worker" ];

    // These are the four levels of the allow/deny permission heirarchy
    this.ddpMethodPermissions = {
      startJobs: ["startJobs", "admin"],  // Deprecated!
      stopJobs: ["stopJobs", "admin"],    // Deprecated!
      startJobServer: ["startJobServer", "admin"],
      shutdownJobServer: ["shutdownJobServer", "admin"],
      jobRemove: ["jobRemove", "admin", "manager"],
      jobPause: ["jobPause", "admin", "manager"],
      jobResume: ["jobResume", "admin", "manager"],
      jobCancel: ["jobCancel", "admin", "manager"],
      jobReady: ["jobReady", "admin", "manager"],
      jobRestart: ["jobRestart", "admin", "manager"],
      jobSave: ["jobSave", "admin", "creator"],
      jobRerun: ["jobRerun", "admin", "creator"],
      getWork: ["getWork", "admin", "worker"],
      getJob: ["getJob", "admin", "worker"],
      jobLog: [ "jobLog", "admin", "worker"],
      jobProgress: ["jobProgress", "admin", "worker"],
      jobDone: ["jobDone", "admin", "worker"],
      jobFail: ["jobFail", "admin", "worker"]
    };

    // Automatically work within Meteor, otherwise see @setDDP below
    this._ddp_apply = undefined;

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

  static _setDDPApply(apply, collectionName) {
    if (typeof apply === "function") {
      if (typeof collectionName === "string") {
        if (this._ddp_apply === null) {
          this._ddp_apply = {};
        }

        if (typeof this._ddp_apply === "function") {
          throw new Error("Job.setDDP must specify a collection name each time if called more than once.");
        }

        this._ddp_apply[collectionName] = apply;
        return apply;
      } else if (!this._ddp_apply) {
        this._ddp_apply = apply;
        return apply;
      }

      throw new Error("Job.setDDP must specify a collection name each time if called more than once.");
    } else {
      throw new Error("Bad function in Job.setDDPApply()");
    }
  }

  // This needs to be called when not running in Meteor to use the local DDP connection.
  static setDDP(ddp = null, collectionNames = null, Fiber = null) {
    if ((typeof collectionNames !== "string") && (!(collectionNames instanceof Array))) {
      // Handle optional collection string with Fiber present
      Fiber = collectionNames;
      collectionNames = [ undefined ];
    } else if (typeof collectionNames === "string") {
      // If string, convert to array of strings
      collectionNames = [ collectionNames ];
    }
    return (() => {
      const result = [];
      for (const collName of Array.from(collectionNames)) {
        if ((ddp === null) || (ddp.close === null) || (ddp.subscribe === null)) {
          // Not the DDP npm package
          if ((ddp === null) && ((typeof Meteor !== "undefined" && Meteor !== null ? Meteor.apply : undefined) !== null)) {
            // Meteor local server/client
            result.push(this._setDDPApply(Meteor.apply, collName));
          } else {
            // No other possibilities...
            throw new Error("Bad ddp object in Job.setDDP()");
          }
        } else if (ddp.observe === null) {  // This is a Meteor DDP connection object
          result.push(this._setDDPApply(ddp.apply.bind(ddp), collName));
        } else { // This is the npm DDP package
          if (Fiber === null) {
            result.push(this._setDDPApply(ddp.call.bind(ddp), collName));
          } else {
            // If Fibers in use under pure node.js,
            // make sure to yield and throw errors when no callback
            result.push(this._setDDPApply((name, params, cb) => {
              const fib = Fiber.current;
              ddp.call(name, params, (err, res) => {
                if ((cb !== null) && (typeof cb === "function")) {
                  return cb(err, res);
                }

                if (err) {
                  return fib.throwInto(err);
                }

                return fib.run(res);
              });
              if ((cb !== null) && (typeof cb === "function")) {
                return;
              }

              return Fiber.yield();
            }, collName));
          }
        }
      }
      return result;
    })();
  }

  // Creates a job object by reserving the next available job of
  // the specified 'type' from the server queue root
  // returns null if no such job exists
  static getWork(root, type, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));

    if (typeof type === "string") {
      type = [type];
    }

    if (options.workTimeout !== null) {
      if (!isInteger(options.workTimeout) || !(options.workTimeout > 0)) {
        throw new Error("getWork: workTimeout must be a positive integer");
      }
    }

    return methodCall(root, "getWork", [type, options], cb, res => {
      const jobs = (Array.from(res).map((doc) => new Job(root, doc))) || [];
      if (options.maxJobs !== null) {
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
    if (options.getLog === null) { options.getLog = false; }
    return methodCall(root, "getJob", [id, options], cb, doc => {
      if (doc) {
        return new Job(root, doc);
      }

      return undefined;
    });
  }

  // Like the above, but takes an array of ids, returns array of jobs
  static getJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    if (options.getLog === null) { options.getLog = false; }
    let retVal = [];
    const chunksOfIds = splitLongArray(ids, 32);
    const myCb = reduceCallbacks(cb, chunksOfIds.length, concatReduce, []);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = retVal.concat(methodCall(root, "getJob", [chunkOfIds, options], myCb, doc => {
        if (doc) {
          return (Array.from(doc).map((d) => new Job(root, d.type, d.data, d)));
        }

        return null;
      }));
    }
    return retVal;
  }

  // Pause this job, only Ready and Waiting jobs can be paused
  // Calling this toggles the paused state. Unpaused jobs go to waiting
  static pauseJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    let retVal = false;
    const chunksOfIds = splitLongArray(ids, 256);
    const myCb = reduceCallbacks(cb, chunksOfIds.length);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = methodCall(root, "jobPause", [chunkOfIds, options], myCb) || retVal;
    }
    return retVal;
  }

  // Resume this job, only Paused jobs can be resumed
  // Calling this toggles the paused state. Unpaused jobs go to waiting
  static resumeJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    let retVal = false;
    const chunksOfIds = splitLongArray(ids, 256);
    const myCb = reduceCallbacks(cb, chunksOfIds.length);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = methodCall(root, "jobResume", [chunkOfIds, options], myCb) || retVal;
    }
    return retVal;
  }

  // Move waiting jobs to the ready state, jobs with dependencies will not
  // be made ready unless force is used.
  static readyJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    if (options.force === null) { options.force = false; }
    let retVal = false;
    let chunksOfIds = splitLongArray(ids || [], 256);
    if (!(chunksOfIds.length > 0)) { chunksOfIds = [[]]; }
    const myCb = reduceCallbacks(cb, chunksOfIds.length);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = methodCall(root, "jobReady", [chunkOfIds, options], myCb) || retVal;
    }
    return retVal;
  }

  // Cancel this job if it is running or able to run (waiting, ready)
  static cancelJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    if (options.antecedents === null) { options.antecedents = true; }
    let retVal = false;
    const chunksOfIds = splitLongArray(ids, 256);
    const myCb = reduceCallbacks(cb, chunksOfIds.length);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = methodCall(root, "jobCancel", [chunkOfIds, options], myCb) || retVal;
    }
    return retVal;
  }

  // Restart a failed or cancelled job
  static restartJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    if (options.retries === null) { options.retries = 1; }
    if (options.dependents === null) { options.dependents = true; }
    let retVal = false;
    const chunksOfIds = splitLongArray(ids, 256);
    const myCb = reduceCallbacks(cb, chunksOfIds.length);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = methodCall(root, "jobRestart", [chunkOfIds, options], myCb) || retVal;
    }
    return retVal;
  }

  // Remove a job that is not able to run (completed, cancelled, failed) from the queue
  static removeJobs(root, ids, ...rest) {
    const adjustedLength = Math.max(rest.length, 1);
    let options = rest.slice(0, adjustedLength - 1);
    let cb = rest[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));
    let retVal = false;
    const chunksOfIds = splitLongArray(ids, 256);
    const myCb = reduceCallbacks(cb, chunksOfIds.length);
    for (const chunkOfIds of Array.from(chunksOfIds)) {
      retVal = methodCall(root, "jobRemove", [chunkOfIds, options], myCb) || retVal;
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
    if (options.timeout === null) { options.timeout = 60 * 1000; }
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
    if (options.timeout === null) { options.timeout = 60 * 1000; }
    return methodCall(root, "shutdownJobServer", [options], cb);
  }

  // Job class instance constructor. When "new Job(...)" is run
  constructor(rootVal, type, data) {
    let doc;
    if (!(this instanceof Job)) {
      return new Job(rootVal, type, data);
    }

    // Set the root value
    this.root = rootVal;
    // Keep a copy of the original root value, whatever type that is
    this._root = rootVal;

    // Handle root as object with obj.root attribute
    if (((this.root !== null ? this.root.root : undefined) !== null) && (typeof this.root.root === "string")) {
      this.root = this._root.root;
    }

    // Handle (root, doc) signature
    if ((data === null) && ((type !== null ? type.data : undefined) !== null) && ((type !== null ? type.type : undefined) !== null)) {
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
      throw new Error(`new Job: bad parameter(s), ${this.root} (${typeof this.root}), ${type} (${typeof type}), ${data} (${typeof data}), ${doc} (${typeof doc})`);
    } else if ((doc.type !== null) && (doc.data !== null)) { // This case is used to create local Job objects from DDP calls
      this._doc = doc;
    } else {  // This is the normal "create a new object" case
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

  // Adds a run dependancy on one or more existing jobs to this job
  // Calling with a falsy value resets the dependencies to []
  depends(jobs) {
    let depends;
    if (jobs) {
      if (jobs instanceof Job) {
        jobs = [ jobs ];
      }
      if (jobs instanceof Array) {
        ({ depends } = this._doc);
        for (const j of Array.from(jobs)) {
          if (!(j instanceof Job) || (j._doc._id === null)) {
            throw new Error("Each provided object must be a saved Job instance (with an _id)");
          }
          depends.push(j._doc._id);
        }
      } else {
        throw new Error("Bad input parameter: depends() accepts a falsy value, or Job or array of Jobs");
      }
    } else {
      depends = [];
    }
    this._doc.depends = depends;
    this._doc.resolved = [];  // This is where prior depends go as they are satisfied
    return this;
  }

  // Set the run priority of this job
  priority(level = 0) {
    let priority;

    if (typeof level === "string") {
      priority = Job.jobPriorities[level];
      if (priority === null) {
        throw new Error("Invalid string priority level provided");
      }
    } else if (isInteger(level)) {
      priority = level;
    } else {
      throw new Error("priority must be an integer or valid priority level");
      priority = 0;
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
    if (options.retries !== null) {
      if (!isInteger(options.retries) || !(options.retries >= 0)) {
        throw new Error("bad option: retries must be an integer >= 0");
      }
      options.retries++;
    } else {
      options.retries = Job.forever;
    }
    if (options.until !== null) {
      if (!(options.until instanceof Date)) {
        throw new Error("bad option: until must be a Date object");
      }
    } else {
      options.until = Job.foreverDate;
    }
    if (options.wait !== null) {
      if (!isInteger(options.wait) || !(options.wait >= 0)) {
        throw new Error("bad option: wait must be an integer >= 0");
      }
    } else {
      options.wait = 5 * 60 * 1000;
    }
    if (options.backoff !== null) {
      if (!Array.from(Job.jobRetryBackoffMethods).includes(options.backoff)) {
        throw new Error("bad option: invalid retry backoff method");
      }
    } else {
      options.backoff = "constant";
    }

    this._doc.retries = options.retries;
    this._doc.repeatRetries = options.retries;
    this._doc.retryWait = options.wait;
    if (this._doc.retried === null) { this._doc.retried = 0; }
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
    if ((options.wait !== null) && (options.schedule !== null)) {
      throw new Error("bad options: wait and schedule options are mutually exclusive");
    }
    if (options.repeats !== null) {
      if (!isInteger(options.repeats) || !(options.repeats >= 0)) {
        throw new Error("bad option: repeats must be an integer >= 0");
      }
    } else {
      options.repeats = Job.forever;
    }
    if (options.until !== null) {
      if (!(options.until instanceof Date)) {
        throw new Error("bad option: until must be a Date object");
      }
    } else {
      options.until = Job.foreverDate;
    }
    if (options.wait !== null) {
      if (!isInteger(options.wait) || !(options.wait >= 0)) {
        throw new Error("bad option: wait must be an integer >= 0");
      }
    } else {
      options.wait = 5 * 60 * 1000;
    }
    if (options.schedule !== null) {
      if (typeof options.schedule !== "object") {
        throw new Error("bad option, schedule option must be an object");
      }
      if (((options.schedule !== null ? options.schedule.schedules : undefined) === null) || !(options.schedule.schedules instanceof Array)) {
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
    if (this._doc.repeated === null) { this._doc.repeated = 0; }
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

    if (options.level === null) { options.level = "info"; }
    if (typeof message !== "string") {
      throw new Error("Log message must be a string");
    }
    if ((typeof options.level !== "string") || !Array.from(Job.jobLogLevels).includes(options.level)) {
      throw new Error("Log level options must be one of Job.jobLogLevels");
    }
    if (options.echo !== null) {
      if (options.echo && (Job.jobLogLevels.indexOf(options.level) >= Job.jobLogLevels.indexOf(options.echo))) {
        this._echo(`LOG: ${options.level}, ${this._doc._id} ${this._doc.runId}: ${message}`, options.level);
      }
      delete options.echo;
    }
    if (this._doc._id !== null) {
      return methodCall(this._root, "jobLog", [this._doc._id, this._doc.runId, message, options], cb);
    }
    // Log can be called on an unsaved job
    if (this._doc.log === null) { this._doc.log = []; }
    this._doc.log.push({ time: new Date(), runId: null, level: options.level, message });
    if ((cb !== null) && (typeof cb === "function")) {
      _setImmediate(cb, null, true);   // DO NOT release Zalgo
    }
    return this;  // Allow call chaining in this case
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
      if ((this._doc._id !== null) && (this._doc.runId !== null)) {
        return methodCall(this._root, "jobProgress", [this._doc._id, this._doc.runId, completed, total, options], cb, res => {
          if (res) {
            this._doc.progress = progress;
          }
          return res;
        });
      } else if (this._doc._id === null) {
        this._doc.progress = progress;
        if ((cb !== null) && (typeof cb === "function")) {
          _setImmediate(cb, null, true);   // DO NOT release Zalgo
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

    return methodCall(this._root, "jobSave", [this._doc, options], cb, id => {
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

    if (options.getLog === null) { options.getLog = false; }
    if (this._doc._id !== null) {
      return methodCall(this._root, "getJob", [this._doc._id, options], cb, doc => {
        if (doc !== null) {
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
    if ((result === null) || (typeof result !== "object")) {
      result = { value: result };
    }
    if ((this._doc._id !== null) && (this._doc.runId !== null)) {
      return methodCall(this._root, "jobDone", [this._doc._id, this._doc.runId, result, options], cb);
    } else {
      throw new Error("Can't call .done() on an unsaved or non-running job");
    }
    return null;
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
    if ((result === null) || (typeof result !== "object")) {
      result = { value: result };
    }
    if (options.fatal === null) { options.fatal = false; }
    if ((this._doc._id !== null) && (this._doc.runId !== null)) {
      return methodCall(this._root, "jobFail", [this._doc._id, this._doc.runId, result, options], cb);
    } else {
      throw new Error("Can't call .fail() on an unsaved or non-running job");
    }
    return null;
  }

  // Pause this job, only Ready and Waiting jobs can be paused
  pause(...args) {
    const adjustedLength = Math.max(args.length, 1);
    let options = args.slice(0, adjustedLength - 1);
    let cb = args[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));

    if (this._doc._id !== null) {
      return methodCall(this._root, "jobPause", [this._doc._id, options], cb);
    }

    this._doc.status = "paused";
    if ((cb !== null) && (typeof cb === "function")) {
      _setImmediate(cb, null, true);  // DO NOT release Zalgo
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

    if (this._doc._id !== null) {
      return methodCall(this._root, "jobResume", [this._doc._id, options], cb);
    }
    this._doc.status = "waiting";
    if ((cb !== null) && (typeof cb === "function")) {
      _setImmediate(cb, null, true);  // DO NOT release Zalgo
    }
    return this;
  }

  // Make a waiting job ready to run. Jobs with dependencies only when forced
  ready(...args) {
    const adjustedLength = Math.max(args.length, 1);
    let options = args.slice(0, adjustedLength - 1);
    let cb = args[adjustedLength - 1];

    [options, cb] = Array.from(optionsHelp(options, cb));

    if (options.force === null) { options.force = false; }
    if (this._doc._id !== null) {
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

    if (options.antecedents === null) { options.antecedents = true; }
    if (this._doc._id !== null) {
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

    if (options.retries === null) { options.retries = 1; }
    if (options.dependents === null) { options.dependents = true; }
    if (this._doc._id !== null) {
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

    if (options.repeats === null) { options.repeats = 0; }
    if (options.wait === null) { options.wait = this._doc.repeatWait; }
    if (this._doc._id !== null) {
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

    if (this._doc._id !== null) {
      return methodCall(this._root, "jobRemove", [this._doc._id, options], cb);
    }

    throw new Error("Can't call .remove() on an unsaved job");
  }
}
Job.initClass();

function __range__(left, right, inclusive) {
  const range = [];
  const ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
