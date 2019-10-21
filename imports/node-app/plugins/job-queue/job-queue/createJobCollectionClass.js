/* eslint-disable no-console */
/*
  Original version: https://github.com/vsivsi/meteor-job-collection/
  License: https://github.com/vsivsi/meteor-job-collection/blob/master/LICENSE
 */

import { EventEmitter } from "events";
import Random from "@reactioncommerce/random";
import { registerMethod } from "./methodCall.js";
import { isValidObjectId } from "./util.js";

const methodPrefix = "_DDPMethod_";
const methodNames = [
  "_DDPMethod_startJobServer",
  "_DDPMethod_shutdownJobServer",
  "_DDPMethod_getJob",
  "_DDPMethod_getWork",
  "_DDPMethod_jobRemove",
  "_DDPMethod_jobPause",
  "_DDPMethod_jobResume",
  "_DDPMethod_jobReady",
  "_DDPMethod_jobCancel",
  "_DDPMethod_jobRestart",
  "_DDPMethod_jobSave",
  "_DDPMethod_jobProgress",
  "_DDPMethod_jobLog",
  "_DDPMethod_jobRerun",
  "_DDPMethod_jobDone",
  "_DDPMethod_jobFail"
];

/**
 * @summary Factory that creates the `JobCollection` classes
 * @return {Class} `JobCollection` class
 */
export default function createJobCollectionClass({ Job, later }) {
  const _validNumGTEZero = (value) => typeof value === "number" && (value >= 0.0);

  const _validNumGTZero = (value) => typeof value === "number" && (value > 0.0);

  const _validNumGTEOne = (value) => typeof value === "number" && (value >= 1.0);

  const _validIntGTEZero = (value) => _validNumGTEZero(value) && (Math.floor(value) === value);

  const _validIntGTEOne = (value) => _validNumGTEOne(value) && (Math.floor(value) === value);

  const _validStatus = (value) => typeof value === "string" && Array.from(Job.jobStatuses).includes(value);

  const _validLogLevel = (value) => typeof value === "string" && Array.from(Job.jobLogLevels).includes(value);

  const _validRetryBackoff = (value) => typeof value === "string" && Array.from(Job.jobRetryBackoffMethods).includes(value);

  class JobCollection {
    static initClass() {
      this.prototype._validNumGTEZero = _validNumGTEZero;
      this.prototype._validNumGTZero = _validNumGTZero;
      this.prototype._validNumGTEOne = _validNumGTEOne;
      this.prototype._validIntGTEZero = _validIntGTEZero;
      this.prototype._validIntGTEOne = _validIntGTEOne;
      this.prototype._validStatus = _validStatus;
      this.prototype._validLogLevel = _validLogLevel;
      this.prototype._validRetryBackoff = _validRetryBackoff;

      this.prototype.jobLogLevels = Job.jobLogLevels;
      this.prototype.jobPriorities = Job.jobPriorities;
      this.prototype.jobStatuses = Job.jobStatuses;
      this.prototype.jobStatusCancellable = Job.jobStatusCancellable;
      this.prototype.jobStatusPausable = Job.jobStatusPausable;
      this.prototype.jobStatusRemovable = Job.jobStatusRemovable;
      this.prototype.jobStatusRestartable = Job.jobStatusRestartable;
      this.prototype.forever = Job.forever;
      this.prototype.foreverDate = Job.foreverDate;
    }

    constructor(root = "queue", options = {}) {
      this.root = root;

      this.later = later;

      this._createLogEntry = function (message = "", runId = null, level = "info", time = new Date()) {
        return { time, runId, message, level };
      };

      this._logMessage = {
        readied: () => (this._createLogEntry("Promoted to ready")),
        forced: () => (this._createLogEntry("Dependencies force resolved", null, "warning")),
        rerun: (id, runId) => (this._createLogEntry("Rerunning job", null, "info", new Date(), { previousJob: { id, runId } })),
        running: (runId) => (this._createLogEntry("Job Running", runId)),
        paused: () => (this._createLogEntry("Job Paused")),
        resumed: () => (this._createLogEntry("Job Resumed")),
        cancelled: () => (this._createLogEntry("Job Cancelled", null, "warning")),
        restarted: () => (this._createLogEntry("Job Restarted")),
        resubmitted: () => (this._createLogEntry("Job Resubmitted")),
        submitted: () => (this._createLogEntry("Job Submitted")),
        completed: (runId) => (this._createLogEntry("Job Completed", runId, "success")),
        resolved: (id, runId) => (this._createLogEntry("Dependency resolved", null, "info", new Date(), { dependency: { id, runId } })),
        failed: (runId, fatal, err) => {
          const { value } = err;
          const msg = `Job Failed with${fatal ? " Fatal" : ""} Error${(typeof value === "string") ? `: ${value}` : ""}.`;
          const level = fatal ? "danger" : "warning";
          return this._createLogEntry(msg, runId, level);
        }
      };

      this._toLog = this._toLog.bind(this);
      this._emit = this._emit.bind(this);

      this.events = new EventEmitter();

      this.stopped = true;

      this.promote();

      this.logStream = null;

      // If a connection option is given, then this JobCollection is actually hosted
      // remotely, so don"t establish local and remotely callable server methods in that case
      if (!options.connection) {
        this.isSimulation = false;

        for (const methodName of methodNames) {
          const methodFunc = this[methodName];
          const baseMethodName = methodName.slice(methodPrefix.length);
          registerMethod(this.root, baseMethodName, methodFunc.bind(this));
        }
      }
    }

    setCollection(collection) {
      this.collection = collection;

      if (this.whenReadyCallbacks) {
        for (const callback of this.whenReadyCallbacks) {
          callback();
        }
        this.whenReadyCallbacks = [];
      }
    }

    /**
     * @param {Function} callback A function that is called either immediately,
     *   if a collection is already set, or later right after the collection is
     *   set.
     * @return {undefined}
     */
    whenReady(callback) {
      if (this.collection) {
        callback();
      } else {
        if (!this.whenReadyCallbacks) this.whenReadyCallbacks = [];
        this.whenReadyCallbacks.push(callback);
      }
    }

    find(...findParams) {
      // Not a real cursor here but enough to keep things backwards compatible hopefully.
      return {
        toArray: (...params) => (
          this.collection.find(...findParams).toArray(...params)
        ),
        // Meteor collections had fetch rather than toArray
        fetch: (...params) => (
          this.collection.find(...findParams).toArray(...params)
        ),
        forEach: async (fn) => {
          const items = await this.collection.find(...findParams).toArray();
          items.forEach(fn);
        },
        map: async (fn) => {
          const items = await this.collection.find(...findParams).toArray();
          return items.map(fn);
        }
      };
    }

    async findOne(...params) {
      return this.collection.findOne(...params);
    }

    async insert(...params) {
      return this.collection.insert(...params);
    }

    async insertOne(...params) {
      return this.collection.insertOne(...params);
    }

    async insertMany(...params) {
      return this.collection.insertMany(...params);
    }

    async update(...params) {
      return this.collection.update(...params);
    }

    async updateOne(...params) {
      return this.collection.updateOne(...params);
    }

    async updateMany(...params) {
      return this.collection.updateMany(...params);
    }

    async remove(...params) {
      return this.collection.remove(...params);
    }

    async deleteOne(...params) {
      return this.collection.deleteOne(...params);
    }

    async deleteMany(...params) {
      return this.collection.deleteMany(...params);
    }

    processJobs(...params) { return new Job.processJobs(this.root, ...Array.from(params)); }
    getJob(...params) { return Job.getJob(this.root, ...Array.from(params)); }
    getWork(...params) { return Job.getWork(this.root, ...Array.from(params)); }
    getJobs(...params) { return Job.getJobs(this.root, ...Array.from(params)); }
    readyJobs(...params) { return Job.readyJobs(this.root, ...Array.from(params)); }
    cancelJobs(...params) { return Job.cancelJobs(this.root, ...Array.from(params)); }
    pauseJobs(...params) { return Job.pauseJobs(this.root, ...Array.from(params)); }
    resumeJobs(...params) { return Job.resumeJobs(this.root, ...Array.from(params)); }
    restartJobs(...params) { return Job.restartJobs(this.root, ...Array.from(params)); }
    removeJobs(...params) { return Job.removeJobs(this.root, ...Array.from(params)); }

    startJobServer(...params) { return Job.startJobServer(this.root, ...Array.from(params)); }
    shutdownJobServer(...params) { return Job.shutdownJobServer(this.root, ...Array.from(params)); }

    // These are deprecated and will be removed
    startJobs(...params) { return Job.startJobs(this.root, ...Array.from(params)); }
    stopJobs(...params) { return Job.stopJobs(this.root, ...Array.from(params)); }

    async _idsOfDeps(ids, antecedents, dependents, jobStatuses) {
      // Cancel the entire tree of antecedents and/or dependents
      // Dependents: jobs that list one of the ids in their depends list
      // Antecedents: jobs with an id listed in the depends list of one of the jobs in ids
      const dependsQuery = [];
      const dependsIds = [];

      if (dependents) {
        dependsQuery.push({
          depends: {
            $elemMatch: {
              $in: ids
            }
          }
        });
      }

      if (antecedents) {
        const antsArray = [];
        const docs = await this.collection.find(
          {
            _id: {
              $in: ids
            }
          },
          {
            projection: {
              depends: 1
            }
          }
        ).toArray();

        docs.forEach((doc) => {
          for (const dep in Array.from(doc.depends)) {
            if (!antsArray.includes(dep)) {
              antsArray.push(dep);
            }
          }
        });

        if (antsArray.length > 0) {
          dependsQuery.push({
            _id: {
              $in: antsArray
            }
          });
        }
      }

      if (dependsQuery.length > 0) {
        const docs = await this.collection.find(
          {
            status: {
              $in: jobStatuses
            },
            $or: dependsQuery
          },
          {
            projection: {
              _id: 1
            }
          }
        ).toArray();

        docs.forEach((doc) => {
          if (!Array.from(dependsIds).includes(doc._id)) {
            dependsIds.push(doc._id);
          }
        });
      }

      return dependsIds;
    }

    // eslint-disable-next-line camelcase
    async _rerun_job(doc, repeats = doc.repeats - 1, wait = doc.repeatWait, repeatUntil = doc.repeatUntil) {
      const id = doc._id;
      const { runId } = doc;
      const time = new Date();

      doc._id = Random.id();
      delete doc.result;
      delete doc.failures;
      delete doc.expiresAfter;
      delete doc.workTimeout;

      doc.runId = null;
      doc.status = "waiting";
      doc.repeatRetries = doc.repeatRetries || (doc.retries + doc.retried);
      doc.retries = doc.repeatRetries;
      if (doc.retries > this.forever) { doc.retries = this.forever; }
      doc.retryUntil = repeatUntil;
      doc.retried = 0;
      doc.repeats = repeats;
      if (doc.repeats > this.forever) { doc.repeats = this.forever; }
      doc.repeatUntil = repeatUntil;
      doc.repeated += 1;
      doc.updated = time;
      doc.created = time;
      doc.progress = {
        completed: 0,
        total: 1,
        percent: 0
      };

      const logObj = this._logMessage.rerun(id, runId);

      if (logObj) {
        doc.log = [logObj];
      } else {
        doc.log = [];
      }

      doc.after = new Date(time.valueOf() + wait);

      const { insertedCount } = await this.collection.insertOne(doc);

      if (insertedCount === 1) {
        await this._DDPMethod_jobReady(doc._id);
        return doc._id;
      }

      console.warn("Job rerun/repeat failed to reschedule!", id, runId);
      return null;
    }

    async _checkDeps(job, dryRun = true) {
      let cancel = false;
      const resolved = [];
      const failed = [];
      const cancelled = [];
      const removed = [];
      const log = [];
      if (job.depends.length > 0) {
        const deps = await this.collection.find({
          _id: { $in: job.depends }
        }, {
          projection: { _id: 1, runId: 1, status: 1 }
        }).toArray();

        if (deps.length !== job.depends.length) {
          const foundIds = deps.map((dep) => dep._id);
          for (const depJob of Array.from(job.depends)) {
            if (!(Array.from(foundIds).includes(depJob))) {
              // eslint-disable-next-line no-await-in-loop
              if (!dryRun) await this._DDPMethod_jobLog(job._id, null, `Antecedent job ${depJob} missing at save`);
              removed.push(depJob);
            }
          }
          cancel = true;
        }

        for (const depJob of Array.from(deps)) {
          if (!Array.from(this.jobStatusCancellable).includes(depJob.status)) {
            switch (depJob.status) {
              case "completed":
                resolved.push(depJob._id);
                log.push(this._logMessage.resolved(depJob._id, depJob.runId));
                break;
              case "failed":
                cancel = true;
                failed.push(depJob._id);
                // eslint-disable-next-line no-await-in-loop
                if (!dryRun) await this._DDPMethod_jobLog(job._id, null, "Antecedent job failed before save");
                break;
              case "cancelled":
                cancel = true;
                cancelled.push(depJob._id);
                // eslint-disable-next-line no-await-in-loop
                if (!dryRun) await this._DDPMethod_jobLog(job._id, null, "Antecedent job cancelled before save");
                break;
              default: // Unknown status
                throw new Error("Unknown status in jobSave dependency check");
            }
          }
        }

        if ((resolved.length !== 0) && !dryRun) {
          const mods = {
            $pull: {
              depends: {
                $in: resolved
              }
            },
            $push: {
              resolved: {
                $each: resolved
              },
              log: {
                $each: log
              }
            }
          };

          const { result } = await this.collection.updateOne(
            {
              _id: job._id,
              status: "waiting"
            },
            mods
          );

          if (!result.ok) {
            console.warn(`Update for job ${job._id} during dependency check failed.`);
          }
        }

        if (cancel && !dryRun) {
          await this._DDPMethod_jobCancel(job._id);
          return false;
        }
      }

      if (dryRun) {
        if (cancel || (resolved.length > 0)) {
          return {
            jobId: job._id,
            resolved,
            failed,
            cancelled,
            removed
          };
        }

        return false;
      }

      return true;
    }

    // eslint-disable-next-line camelcase
    _DDPMethod_startJobServer() {
      this.stopped = false;
      return true;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_shutdownJobServer() {
      this.stopped = true;

      // Fail all currently running jobs
      if (this.collection) {
        const runningJobs = await this.collection.find({
          status: "running"
        }, {
          projection: {
            _id: 1,
            runId: 1
          }
        }).toArray();

        if (runningJobs.length > 0) {
          console.warn(`Failing ${runningJobs.length} jobs on queue stop.`);

          await Promise.all(runningJobs.map((doc) => this._DDPMethod_jobFail(doc._id, doc.runId, "Running at Job Server shutdown.")));
        }
      }

      // Close the log stream
      if (this.logStream !== null) {
        this.logStream.end();
        this.logStream = null;
      }

      return true;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_getJob(ids, options = {}) {
      if (!options.getLog) {
        options.getLog = false;
      }

      if (!options.getFailures) {
        options.getFailures = false;
      }

      let single = false;
      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
        single = true;
      }

      if (idArray.length === 0) {
        return null;
      }

      const projection = { _private: 0 };
      if (!options.getLog) { projection.log = 0; }
      if (!options.getFailures) { projection.failures = 0; }
      let docs = await this.collection.find(
        {
          _id: {
            $in: idArray
          }
        },
        {
          projection
        }
      ).toArray();

      if (docs && docs.length) {
        if (this.scrub) {
          docs = (Array.from(docs).map((doc) => this.scrub(doc)));
        }
        if (single) {
          return docs[0];
        }

        return docs;
      }
      return null;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_getWork(type, options = {}) {
      // Don't simulate getWork!
      if (this.isSimulation) {
        return [];
      }

      if (!options.maxJobs) { options.maxJobs = 1; }
      // Don"t put out any more jobs while shutting down
      if (this.stopped) {
        return [];
      }

      // Support string types or arrays of string types
      let typeArray = type;

      if (typeof type === "string") {
        typeArray = [type];
      }
      const time = new Date();
      let docs = [];
      const runId = Random.id();

      while (docs.length < options.maxJobs) {
        // eslint-disable-next-line no-await-in-loop
        const readyDocs = await this.collection.find(
          {
            type: {
              $in: typeArray
            },
            status: "ready",
            runId: null
          },
          {
            sort: {
              priority: 1,
              retryUntil: 1,
              after: 1
            },
            limit: options.maxJobs - docs.length, // never ask for more than is needed
            projection: {
              _id: 1
            }
          }
        ).toArray();

        const ids = readyDocs.map((doc) => doc._id);

        if (!(ids && ids.length > 0)) {
          break; // Don"t keep looping when there's no available work
        }

        const mods = {
          $set: {
            status: "running",
            runId,
            updated: time
          },
          $inc: {
            retries: -1,
            retried: 1
          }
        };

        const logObj = this._logMessage.running(runId);

        if (logObj) {
          mods.$push = { log: logObj };
        }

        if (options.workTimeout) {
          mods.$set.workTimeout = options.workTimeout;
          mods.$set.expiresAfter = new Date(time.valueOf() + options.workTimeout);
        } else {
          if (!mods.$unset) {
            mods.$unset = {};
          }

          mods.$unset.workTimeout = "";
          mods.$unset.expiresAfter = "";
        }

        // eslint-disable-next-line no-await-in-loop
        const { modifiedCount } = await this.collection.updateMany(
          {
            _id: {
              $in: ids
            },
            status: "ready",
            runId: null
          },
          mods
        );

        if (modifiedCount > 0) {
          // eslint-disable-next-line no-await-in-loop
          let foundDocs = await this.collection.find(
            {
              _id: {
                $in: ids
              },
              runId
            },
            {
              projection: {
                log: 0,
                failures: 0,
                _private: 0
              }
            }
          ).toArray();

          if (foundDocs && foundDocs.length > 0) {
            if (this.scrub) {
              foundDocs = ((() => { // eslint-disable-line no-loop-func
                const result = [];
                for (const foundDoc of Array.from(foundDocs)) {
                  result.push(this.scrub(foundDoc));
                }
                return result;
              })());
            }
            docs = docs.concat(foundDocs);
          }
        }
      }

      return docs;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobRemove(ids) {
      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
      }
      if (idArray.length === 0) {
        return false;
      }

      const { deletedCount } = await this.collection.deleteMany({
        _id: {
          $in: idArray
        },
        status: {
          $in: this.jobStatusRemovable
        }
      });

      if (deletedCount > 0) {
        return true;
      }

      console.warn("jobRemove failed");
      return false;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobPause(ids) {
      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
      }

      if (idArray.length === 0) return false;
      const time = new Date();

      const mods = {
        $set: {
          status: "paused",
          updated: time
        }
      };

      const logObj = this._logMessage.paused();

      if (logObj) {
        mods.$push = { log: logObj };
      }

      const { result } = await this.collection.updateMany(
        {
          _id: {
            $in: idArray
          },
          status: {
            $in: this.jobStatusPausable
          }
        },
        mods
      );

      if (!result.ok) {
        console.warn("jobPause failed");
      }

      return result.ok;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobResume(ids) {
      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
      }
      if (idArray.length === 0) { return false; }

      const time = new Date();
      const mods = {
        $set: {
          status: "waiting",
          updated: time
        }
      };

      const logObj = this._logMessage.resumed();

      if (logObj) {
        mods.$push = { log: logObj };
      }

      const { result } = await this.collection.updateMany(
        {
          _id: {
            $in: idArray
          },
          status: "paused",
          updated: {
            $ne: time
          }
        },
        mods
      );

      if (result.ok) {
        await this._DDPMethod_jobReady(ids);
        return true;
      }

      console.warn("jobResume failed");
      return false;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobReady(ids, options = {}) {
      if (this.stopped) return false;

      let logResult;

      // Don"t simulate jobReady. It has a strong chance of causing issues with
      // Meteor on the client, particularly if an observeChanges() is triggering
      // a processJobs queue (which in turn sets timers.)
      if (this.isSimulation) {
        return false;
      }

      const now = new Date();

      if (!options.force) { options.force = false; }
      if (!options.time) { options.time = now; }

      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
      }

      const query = {
        status: "waiting",
        after: {
          $lte: options.time
        }
      };

      const mods = {
        $set: {
          status: "ready",
          updated: now
        }
      };

      if (idArray.length > 0) {
        query._id = { $in: idArray };
        mods.$set.after = now;
      }

      const logObj = [];

      if (options.force) {
        mods.$set.depends = []; // Don"t move to resolved, because they weren't!
        logResult = this._logMessage.forced();
        if (logResult) { logObj.push(logResult); }
      } else {
        query.depends = { $size: 0 };
      }

      logResult = this._logMessage.readied();
      if (logResult) { logObj.push(logResult); }

      if (logObj.length > 0) {
        mods.$push = {
          log: {
            $each: logObj
          }
        };
      }

      const { result } = await this.collection.updateMany(
        query,
        mods
      );

      return result.ok;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobCancel(ids, options = {}) {
      if (!options.antecedents) { options.antecedents = false; }
      if (!options.dependents) { options.dependents = true; }

      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
      }
      if (idArray.length === 0) return false;
      const time = new Date();

      const mods = {
        $set: {
          status: "cancelled",
          runId: null,
          progress: {
            completed: 0,
            total: 1,
            percent: 0
          },
          updated: time
        }
      };

      const logObj = this._logMessage.cancelled();

      if (logObj) {
        mods.$push = { log: logObj };
      }

      const { result } = await this.collection.updateMany(
        {
          _id: {
            $in: idArray
          },
          status: {
            $in: this.jobStatusCancellable
          }
        },
        mods
      );

      // Cancel the entire tree of dependents
      const cancelIds = await this._idsOfDeps(idArray, options.antecedents, options.dependents, this.jobStatusCancellable);

      let depsCancelled = false;
      if (cancelIds.length > 0) {
        depsCancelled = await this._DDPMethod_jobCancel(cancelIds, options);
      }

      if (result.ok || depsCancelled) {
        return true;
      }

      console.warn("jobCancel failed");
      return false;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobRestart(ids, options = {}) {
      if (options.retries === null || options.retries === undefined) { options.retries = 1; }
      if (options.retries > this.forever) { options.retries = this.forever; }
      if (!options.dependent) { options.dependents = false; }
      if (!options.antecedents) { options.antecedents = true; }

      let idArray = ids;

      if (isValidObjectId(ids)) {
        idArray = [ids];
      }
      if (idArray.length === 0) { return false; }
      const time = new Date();

      const query = {
        _id: {
          $in: idArray
        },
        status: {
          $in: this.jobStatusRestartable
        }
      };

      const mods = {
        $set: {
          status: "waiting",
          progress: {
            completed: 0,
            total: 1,
            percent: 0
          },
          updated: time
        },
        $inc: {
          retries: options.retries
        }
      };

      const logObj = this._logMessage.restarted();

      if (logObj) {
        mods.$push = { log: logObj };
      }

      if (options.until) {
        mods.$set.retryUntil = options.until;
      }

      const { result } = await this.collection.updateMany(query, mods);

      // Restart the entire tree of dependents
      const restartIds = await this._idsOfDeps(idArray, options.antecedents, options.dependents, this.jobStatusRestartable);

      let depsRestarted = false;
      if (restartIds.length > 0) {
        depsRestarted = await this._DDPMethod_jobRestart(restartIds, options);
      }

      if (result.ok || depsRestarted) {
        await this._DDPMethod_jobReady(idArray);
        return true;
      }

      console.warn("jobRestart failed");
      return false;
    }

    // Job creator methods

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobSave(doc, options = {}) {
      if (!options.cancelRepeats) { options.cancelRepeats = false; }
      if (doc.repeats > this.forever) { doc.repeats = this.forever; }
      if (doc.retries > this.forever) { doc.retries = this.forever; }

      const time = new Date();

      // This enables the default case of "run immediately" to
      // not be impacted by a client"s clock
      if (doc.after < time) { doc.after = time; }
      if (doc.retryUntil < time) { doc.retryUntil = time; }
      if (doc.repeatUntil < time) { doc.repeatUntil = time; }

      // If doc.repeatWait is a later.js object, then don"t run before
      // the first valid scheduled time that occurs after doc.after
      if (this.later && typeof doc.repeatWait !== "number") {
        // Using a workaround to find next time after doc.after.
        // See: https://github.com/vsivsi/meteor-job-collection/issues/217
        const schedule = (this.later && this.later.schedule(doc.repeatWait)) || undefined;
        const next = schedule.next(2, schedule.prev(1, doc.after))[1];

        if (!schedule || !next) {
          console.warn(`No valid available later.js times in schedule after ${doc.after}`);
          return null;
        }

        const nextDate = new Date(next);

        if (!(nextDate <= doc.repeatUntil)) {
          console.warn(`No valid available later.js times in schedule before ${doc.repeatUntil}`);
          return null;
        }

        doc.after = nextDate;
      } else if (!this.later && doc.repeatWait !== "number") {
        console.warn("Later.js not loaded...");
        return null;
      }

      if (doc._id) {
        const mods = {
          $set: {
            status: "waiting",
            data: doc.data,
            retries: doc.retries,
            repeatRetries: doc.repeatRetries ? doc.repeatRetries : doc.retries + doc.retried,
            retryUntil: doc.retryUntil,
            retryWait: doc.retryWait,
            retryBackoff: doc.retryBackoff,
            repeats: doc.repeats,
            repeatUntil: doc.repeatUntil,
            repeatWait: doc.repeatWait,
            depends: doc.depends,
            priority: doc.priority,
            after: doc.after,
            updated: time
          }
        };

        const logObj = this._logMessage.resubmitted();

        if (logObj) {
          mods.$push = { log: logObj };
        }

        const { result } = await this.collection.updateOne(
          {
            _id: doc._id,
            status: "paused",
            runId: null
          },
          mods
        );

        if (result.ok && await this._checkDeps(doc, false)) {
          await this._DDPMethod_jobReady(doc._id);
          return doc._id;
        }

        return null;
      }

      if ((doc.repeats === this.forever) && options.cancelRepeats) {
        // If this is unlimited repeating job, then cancel any existing jobs of the same type
        const existingJobs = await this.collection.find({
          type: doc.type,
          status: {
            $in: this.jobStatusCancellable
          }
        }).toArray();

        await Promise.all(existingJobs.map((foundDoc) => this._DDPMethod_jobCancel(foundDoc._id, {})));
      }

      doc.created = time;
      doc.log.push(this._logMessage.submitted());
      doc._id = Random.id();
      const { insertedCount } = await this.collection.insertOne(doc);
      if (insertedCount === 1 && await this._checkDeps(doc, false)) {
        await this._DDPMethod_jobReady(doc._id);
        return doc._id;
      }

      return null;
    }

    // Worker methods

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobProgress(id, runId, completed, total) {
      // Notify the worker to stop running if we are shutting down
      if (this.stopped) return null;

      const progress = {
        completed,
        total,
        percent: (100 * completed) / total
      };

      const time = new Date();

      const job = await this.collection.findOne({ _id: id }, { projection: { workTimeout: 1 } });

      const mods = {
        $set: {
          progress,
          updated: time
        }
      };

      if (job && job.workTimeout) {
        mods.$set.expiresAfter = new Date(time.valueOf() + job.workTimeout);
      }

      const { result } = await this.collection.updateOne(
        {
          _id: id,
          runId,
          status: "running"
        },
        mods
      );

      if (!result.ok) {
        console.warn("jobProgress failed");
      }

      return result.ok;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobLog(id, runId, message, options = {}) {
      const time = new Date();
      const logObj = {
        time,
        runId,
        level: options.level || "info",
        message
      };

      if (options.data) {
        logObj.data = options.data;
      }

      const job = await this.collection.findOne({ _id: id }, { projection: { status: 1, workTimeout: 1 } });

      const mods = {
        $push: {
          log: logObj
        },
        $set: {
          updated: time
        }
      };

      if (job && job.workTimeout && job.status === "running") {
        mods.$set.expiresAfter = new Date(time.valueOf() + job.workTimeout);
      }

      const { result } = await this.collection.updateOne(
        {
          _id: id
        },
        mods
      );

      if (!result.ok) {
        console.warn("jobLog failed");
      }

      return result.ok;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobRerun(id, options = {}) {
      const doc = await this.collection.findOne(
        {
          _id: id,
          status: "completed"
        },
        {
          projection: {
            result: 0,
            failures: 0,
            log: 0,
            progress: 0,
            updated: 0,
            after: 0,
            status: 0
          }
        }
      );

      if (doc) {
        if (!options.repeats) { options.repeats = 0; }
        if (options.repeats > this.forever) { options.repeats = this.forever; }
        if (!options.until) { options.until = doc.repeatUntil; }
        if (!options.wait) { options.wait = 0; }
        return this._rerun_job(doc, options.repeats, options.wait, options.until);
      }

      return false;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobDone(id, runId, result, options = {}) {
      if (!options.repeatId) { options.repeatId = false; }

      const time = new Date();
      const doc = await this.collection.findOne(
        {
          _id: id,
          runId,
          status: "running"
        },
        {
          projection: {
            log: 0,
            failures: 0,
            updated: 0,
            after: 0,
            status: 0
          }
        }
      );
      if (!doc) {
        if (!this.isSimulation) {
          console.warn("Running job not found", id, runId);
        }
        return false;
      }

      let mods = {
        $set: {
          status: "completed",
          result,
          progress: {
            completed: doc.progress.total || 1,
            total: doc.progress.total || 1,
            percent: 100
          },
          updated: time
        }
      };

      let logObj = this._logMessage.completed(runId);

      if (logObj) {
        mods.$push = { log: logObj };
      }

      const { result: updateResult } = await this.collection.updateOne(
        {
          _id: id,
          runId,
          status: "running"
        },
        mods
      );

      if (updateResult.ok) {
        let jobId;
        if (doc.repeats > 0) {
          if (typeof doc.repeatWait === "number") {
            if ((doc.repeatUntil - doc.repeatWait) >= time) {
              jobId = await this._rerun_job(doc);
            }
          } else {
            // This code prevents a job that just ran and finished
            // instantly from being immediately rerun on the same occurrence
            const next = (this.later && this.later.schedule(doc.repeatWait).next(2)) || undefined;
            if (next && (next.length > 0)) {
              let date = new Date(next[0]);
              if (((date - time) > 500) || (next.length > 1)) {
                if ((date - time) <= 500) {
                  date = new Date(next[1]);
                }
                const wait = date - time;
                if ((doc.repeatUntil - wait) >= time) {
                  jobId = await this._rerun_job(doc, doc.repeats - 1, wait);
                }
              }
            }
          }
        }

        // Resolve depends
        const foundDocs = await this.collection.find(
          {
            depends: {
              $all: [id]
            }
          },
          {
            projection: {
              _id: 1
            }
          }
        ).toArray();

        const ids = foundDocs.map((foundDoc) => foundDoc._id);

        if (ids.length > 0) {
          mods = {
            $pull: {
              depends: id
            },
            $push: {
              resolved: id
            }
          };

          if (options.delayDeps) {
            const after = new Date(time.valueOf() + options.delayDeps);
            mods.$max = { after };
          }

          logObj = this._logMessage.resolved(id, runId);

          if (logObj) {
            mods.$push.log = logObj;
          }

          const { modifiedCount } = await this.collection.updateMany(
            {
              _id: {
                $in: ids
              }
            },
            mods
          );

          if (modifiedCount !== ids.length) {
            console.warn(`Not all dependent jobs were resolved ${ids.length} > ${modifiedCount}`);
          }

          // Try to promote any jobs that just had a dependency resolved
          await this._DDPMethod_jobReady(ids);
        }

        if (options.repeatId && jobId) {
          return jobId;
        }

        return true;
      }

      console.warn("jobDone failed");
      return false;
    }

    // eslint-disable-next-line camelcase
    async _DDPMethod_jobFail(id, runId, err, options = {}) {
      if (!options.fatal) { options.fatal = false; }

      const time = new Date();
      const doc = await this.collection.findOne(
        {
          _id: id,
          runId,
          status: "running"
        },
        {
          projection: {
            log: 0,
            failures: 0,
            progress: 0,
            updated: 0,
            after: 0,
            runId: 0,
            status: 0
          }
        }
      );

      if (!doc) {
        if (!this.isSimulation) {
          console.warn("Running job not found", id, runId);
        }
        return false;
      }

      const after = (() => {
        switch (doc.retryBackoff) {
          case "exponential":
            return new Date(time.valueOf() + (doc.retryWait * Math.pow(2, doc.retried - 1)));
          default:
            return new Date(time.valueOf() + doc.retryWait); // "constant"
        }
      })();

      const newStatus = (!options.fatal &&
        (doc.retries > 0) &&
        (doc.retryUntil >= after)) ? "waiting" : "failed";

      err.runId = runId; // Link each failure to the run that generated it.

      const mods = {
        $set: {
          status: newStatus,
          runId: null,
          after,
          updated: time
        },
        $push: {
          failures:
            err
        }
      };

      const logObj = this._logMessage.failed(runId, newStatus === "failed", err);

      if (logObj) {
        mods.$push.log = logObj;
      }

      const { result } = await this.collection.updateOne(
        {
          _id: id,
          runId,
          status: "running"
        },
        mods
      );

      if (newStatus === "failed" && result.ok) {
        // Cancel any dependent jobs too
        const dependentJobs = await this.collection.find({
          depends: {
            $all: [id]
          }
        }).toArray();

        await Promise.all(dependentJobs.map((foundDoc) => this._DDPMethod_jobCancel(foundDoc._id)));
      }

      if (!result.ok) {
        console.warn("jobFail failed");
      }

      return result.ok;
    }

    _toLog(userId, method, message) {
      return (this.logStream && this.logStream.write(`${new Date()}, ${userId}, ${method}, ${message}\n`)) || undefined;
    }

    _emit(method, connection, userId, err, ret, ...params) {
      if (err) {
        return this.events.emit("error", {
          error: err,
          method,
          connection,
          userId,
          params,
          returnVal: null
        });
      }

      return this.events.emit("call", {
        error: null,
        method,
        connection,
        userId,
        params,
        returnVal: ret
      });
    }

    setLogStream(writeStream = null) {
      if (this.logStream) {
        throw new Error("logStream may only be set once per job-collection startup/shutdown cycle");
      }
      this.logStream = writeStream;
      if (!(this.logStream === null || this.logStream === undefined) &&
        ((this.logStream.write === null || this.logStream.write === undefined) ||
          (typeof this.logStream.write !== "function") ||
          (this.logStream.end === null || this.logStream.end === undefined) ||
          (typeof this.logStream.end !== "function"))) {
        throw new Error("logStream must be a valid writable node.js Stream");
      }
    }

    // Hook function to sanitize documents before validating them in getWork() and getJob()
    scrub(job) {
      return job;
    }

    promote(milliseconds = 15 * 1000) {
      if ((typeof milliseconds === "number") && (milliseconds > 0)) {
        if (this.interval) {
          clearInterval(this.interval);
        }

        const promoteWithErrorHandling = async () => {
          await this.promoteJobs();
        };

        promoteWithErrorHandling();
        this.interval = setInterval(promoteWithErrorHandling, milliseconds);

        return this.interval;
      }

      console.warn(`jobCollection.promote: invalid timeout: ${this.root}, ${milliseconds}`);
      return null;
    }

    async promoteJobs() {
      if (this.stopped) return null;

      // This looks for zombie running jobs and autofails them
      const runningJobs = await this.collection.find({
        status: "running",
        expiresAfter: { $lt: new Date() }
      }).toArray();

      await Promise.all(runningJobs.map((job) => {
        const jobInstance = new Job(this.root, job);
        return jobInstance.fail("Failed for exceeding worker set workTimeout");
      }));

      // Change jobs from waiting to ready when their time has come
      // and dependencies have been satisfied
      return this.readyJobs();
    }
  }

  JobCollection.initClass();

  return JobCollection;
}
