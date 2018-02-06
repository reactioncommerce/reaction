/* eslint-disable no-console */
/*
  Original version: https://github.com/vsivsi/meteor-job-collection/
  License: https://github.com/vsivsi/meteor-job-collection/blob/master/LICENSE
 */
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Mongo } from "meteor/mongo";
import Job from "./job";

let later;
if (Meteor.isServer) {
  later = require("later");
}

const _validNumGTEZero = v => Match.test(v, Number) && (v >= 0.0);

const _validNumGTZero = v => Match.test(v, Number) && (v > 0.0);

const _validNumGTEOne = v => Match.test(v, Number) && (v >= 1.0);

const _validIntGTEZero = v => _validNumGTEZero(v) && (Math.floor(v) === v);

const _validIntGTEOne = v => _validNumGTEOne(v) && (Math.floor(v) === v);

const _validStatus = v => Match.test(v, String) && Array.from(Job.jobStatuses).includes(v);

const _validLogLevel = v => Match.test(v, String) && Array.from(Job.jobLogLevels).includes(v);

const _validRetryBackoff = v => Match.test(v, String) && Array.from(Job.jobRetryBackoffMethods).includes(v);

const _validId = v => Match.test(v, Match.OneOf(String, Mongo.Collection.ObjectID));

const _validLog = () => [{
  time: Date,
  runId: Match.OneOf(Match.Where(_validId), null),
  level: Match.Where(_validLogLevel),
  message: String,
  data: Match.Optional(Object)
}];

const _validProgress = () =>
  ({
    completed: Match.Where(_validNumGTEZero),
    total: Match.Where(_validNumGTEZero),
    percent: Match.Where(_validNumGTEZero)
  })
;

const _validLaterJSObj = () =>
  ({
    schedules: [ Object ],
    exceptions: Match.Optional([ Object ])
  })
;

const _validJobDoc = () =>
  ({
    _id: Match.Optional(Match.OneOf(Match.Where(_validId), null)),
    runId: Match.OneOf(Match.Where(_validId), null),
    type: String,
    status: Match.Where(_validStatus),
    data: Object,
    result: Match.Optional(Object),
    failures: Match.Optional([ Object ]),
    priority: Match.Integer,
    depends: [ Match.Where(_validId) ],
    resolved: [ Match.Where(_validId) ],
    after: Date,
    updated: Date,
    workTimeout: Match.Optional(Match.Where(_validIntGTEOne)),
    expiresAfter: Match.Optional(Date),
    log: Match.Optional(_validLog()),
    progress: _validProgress(),
    retries: Match.Where(_validIntGTEZero),
    retried: Match.Where(_validIntGTEZero),
    repeatRetries: Match.Optional(Match.Where(_validIntGTEZero)),
    retryUntil: Date,
    retryWait: Match.Where(_validIntGTEZero),
    retryBackoff: Match.Where(_validRetryBackoff),
    repeats: Match.Where(_validIntGTEZero),
    repeated: Match.Where(_validIntGTEZero),
    repeatUntil: Date,
    repeatWait: Match.OneOf(Match.Where(_validIntGTEZero), Match.Where(_validLaterJSObj)),
    created: Date
  })
;

class JobCollectionBase extends Mongo.Collection {
  static initClass() {
    this.prototype._validNumGTEZero = _validNumGTEZero;
    this.prototype._validNumGTZero = _validNumGTZero;
    this.prototype._validNumGTEOne = _validNumGTEOne;
    this.prototype._validIntGTEZero = _validIntGTEZero;
    this.prototype._validIntGTEOne = _validIntGTEOne;
    this.prototype._validStatus = _validStatus;
    this.prototype._validLogLevel = _validLogLevel;
    this.prototype._validRetryBackoff = _validRetryBackoff;
    this.prototype._validId = _validId;
    this.prototype._validLog = _validLog;
    this.prototype._validProgress = _validProgress;
    this.prototype._validJobDoc = _validJobDoc;

    this.prototype.jobLogLevels = Job.jobLogLevels;
    this.prototype.jobPriorities = Job.jobPriorities;
    this.prototype.jobStatuses = Job.jobStatuses;
    this.prototype.jobStatusCancellable = Job.jobStatusCancellable;
    this.prototype.jobStatusPausable = Job.jobStatusPausable;
    this.prototype.jobStatusRemovable = Job.jobStatusRemovable;
    this.prototype.jobStatusRestartable = Job.jobStatusRestartable;
    this.prototype.forever = Job.forever;
    this.prototype.foreverDate = Job.foreverDate;

    this.prototype.ddpMethods = Job.ddpMethods;
    this.prototype.ddpPermissionLevels = Job.ddpPermissionLevels;
    this.prototype.ddpMethodPermissions = Job.ddpMethodPermissions;

    this.prototype.jobDocPattern = _validJobDoc();
  }

  constructor(root = "queue", options = {}) {
    let collectionName = root;

    if (!options.noCollectionSuffix) {
      collectionName += ".jobs";
    }

    // Call super"s constructor
    super(collectionName, options);

    this.root = root;

    if (!(this instanceof JobCollectionBase)) {
      return new JobCollectionBase(this.root, options);
    }

    if (!(this instanceof Mongo.Collection)) {
      // eslint-disable-next-line max-len
      throw new Meteor.Error("The global definition of Mongo.Collection has changed since the job-collection package was loaded. Please ensure that any packages that redefine Mongo.Collection are loaded before job-collection.");
    }

    if (Mongo.Collection !== Mongo.Collection.prototype.constructor) {
      throw new Meteor.Error("The global definition of Mongo.Collection has been patched by another package, and the prototype constructor has been left in an inconsistent state. Please see this link for a workaround: https://github.com/vsivsi/meteor-file-sample-app/issues/2#issuecomment-120780592");
    }

    this.later = later;  // later object, for convenience

    if (!options.noCollectionSuffix) { options.noCollectionSuffix = false; }

    // Remove non-standard options before
    // calling Mongo.Collection constructor
    delete options.noCollectionSuffix;

    Job.setDDP(options.connection, this.root);

    this._createLogEntry = function (message = "", runId = null, level = "info", time = new Date(), data = null) {
      return { time, runId, message, level };
    };

    this._logMessage = {
      readied: () => { return this._createLogEntry("Promoted to ready"); },
      forced: () => { return this._createLogEntry("Dependencies force resolved", null, "warning"); },
      rerun: (id, runId) => { return this._createLogEntry("Rerunning job", null, "info", new Date(), { previousJob: { id, runId } }); },
      running: runId => { return this._createLogEntry("Job Running", runId); },
      paused: () => { return this._createLogEntry("Job Paused"); },
      resumed: () => { return this._createLogEntry("Job Resumed"); },
      cancelled: () => { return this._createLogEntry("Job Cancelled", null, "warning"); },
      restarted: () => { return this._createLogEntry("Job Restarted"); },
      resubmitted: () => { return this._createLogEntry("Job Resubmitted"); },
      submitted: () => { return this._createLogEntry("Job Submitted"); },
      completed: runId => { return this._createLogEntry("Job Completed", runId, "success"); },
      resolved: (id, runId) => { return this._createLogEntry("Dependency resolved", null, "info", new Date(), { dependency: { id, runId } }); },
      failed: (runId, fatal, err) => {
        const { value } = err;
        const msg = `Job Failed with${fatal ? " Fatal" : ""} Error${(typeof value === "string") ? `: ${value}` : ""}.`;
        const level = fatal ? "danger" : "warning";
        return this._createLogEntry(msg, runId, level);
      }
    };
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

  setDDP(...params) { return Job.setDDP(...Array.from(params || [])); }

  startJobServer(...params) { return Job.startJobServer(this.root, ...Array.from(params)); }
  shutdownJobServer(...params) { return Job.shutdownJobServer(this.root, ...Array.from(params)); }

  // These are deprecated and will be removed
  startJobs(...params) { return Job.startJobs(this.root, ...Array.from(params)); }
  stopJobs(...params) { return Job.stopJobs(this.root, ...Array.from(params)); }

  // Warning Stubs for server-only calls
  allow() { throw new Error("Server-only function jc.allow() invoked on client."); }
  deny() { throw new Error("Server-only function jc.deny() invoked on client."); }
  promote() { throw new Error("Server-only function jc.promote() invoked on client."); }
  setLogStream() { throw new Error("Server-only function jc.setLogStream() invoked on client."); }

  // Warning Stubs for client-only calls
  logConsole() { throw new Error("Client-only function jc.logConsole() invoked on server."); }

  _methodWrapper(method, func) {
    const toLog = this._toLog;
    const unblockDDPMethods = this._unblockDDPMethods || false;
    // Return the wrapper function that the Meteor method will actually invoke
    return function (...params) {
      const user = this.userId || "[UNAUTHENTICATED]";
      toLog(user, method, `params: ${JSON.stringify(params)}`);
      if (unblockDDPMethods) { this.unblock(); }
      const retval = func(...Array.from(params || []));
      toLog(user, method, `returned: ${JSON.stringify(retval)}`);
      return retval;
    };
  }

  _generateMethods() {
    const methodsOut = {};
    const methodPrefix = "_DDPMethod_";
    console.log("0.", typeof this._DDPMethod_getJob);
    console.log("0.1. ", Object.getOwnPropertyNames(this));

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

    for (const methodName of methodNames) {
      const methodFunc = this[methodName];
      const baseMethodName = methodName.slice(methodPrefix.length);
      methodsOut[`${this.root}_${baseMethodName}`] = this._methodWrapper(baseMethodName, methodFunc.bind(this));
    }

    return methodsOut;
  }

  _idsOfDeps(ids, antecedents, dependents, jobStatuses) {
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
      this.find(
        {
          _id: {
            $in: ids
          }
        },
        {
          fields: {
            depends: 1
          },
          transform: null
        }
      ).forEach((d) => {
        console.log("d.depends", d.depends);
        for (const i in Array.from(d.depends)) {
          if (!antsArray.includes(i)) {
            antsArray.push(i);
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
      this.find(
        {
          status: {
            $in: jobStatuses
          },
          $or: dependsQuery
        },
        {
          fields: {
            _id: 1
          },
          transform: null
        }
      ).forEach((d) => {
        if (!Array.from(dependsIds).includes(d._id)) {
          return dependsIds.push(d._id);
        }
      });
    }
    return dependsIds;
  }

  _rerun_job(doc, repeats = doc.repeats - 1, wait = doc.repeatWait, repeatUntil = doc.repeatUntil) {
    const id = doc._id;
    const { runId } = doc;
    const time = new Date();

    delete doc._id;
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
    doc.repeated = doc.repeated + 1;
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

    const jobId = this.insert(doc);

    if (jobId) {
      this._DDPMethod_jobReady(jobId);
      return jobId;
    }

    console.warn("Job rerun/repeat failed to reschedule!", id, runId);
    return null;
  }

  _checkDeps(job, dryRun = true) {
    let cancel = false;
    const resolved = [];
    const failed = [];
    const cancelled = [];
    const removed = [];
    const log = [];
    if (job.depends.length > 0) {
      const deps = this.find({
        _id: { $in: job.depends }
      }, {
        fields: { _id: 1, runId: 1, status: 1 }
      }).fetch();

      if (deps.length !== job.depends.length) {
        const foundIds = deps.map(d => d._id);
        for (const j of Array.from(job.depends)) {
          if (!(Array.from(foundIds).includes(j))) {
            if (!dryRun) { this._DDPMethod_jobLog(job._id, null, `Antecedent job ${j} missing at save`); }
            removed.push(j);
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
              if (!dryRun) { this._DDPMethod_jobLog(job._id, null, "Antecedent job failed before save"); }
              break;
            case "cancelled":
              cancel = true;
              cancelled.push(depJob._id);
              if (!dryRun) { this._DDPMethod_jobLog(job._id, null, "Antecedent job cancelled before save"); }
              break;
            default:  // Unknown status
              throw new Meteor.Error("Unknown status in jobSave Dependency check");
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

        const n = this.update(
          {
            _id: job._id,
            status: "waiting"
          },
          mods
        );

        if (!n) {
          console.warn(`Update for job ${job._id} during dependency check failed.`);
        }
      }

      if (cancel && !dryRun) {
        this._DDPMethod_jobCancel(job._id);
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

  _DDPMethod_startJobServer(options = {}) {
    check(options, Match.Optional({}));

    // The client can"t actually do this, so skip it
    if (!this.isSimulation) {
      if (this.stopped && (this.stopped !== true)) { Meteor.clearTimeout(this.stopped); }
      this.stopped = false;
    }
    return true;
  }

  _DDPMethod_shutdownJobServer(options = {}) {
    check(options, Match.Optional({
      timeout: Match.Optional(Match.Where(_validIntGTEOne))
    }));

    if (!options.timeout) {
      options.timeout = 60 * 1000;
    }

    // The client can"t actually do any of this, so skip it
    if (!this.isSimulation) {
      if (this.stopped && (this.stopped !== true)) { Meteor.clearTimeout(this.stopped); }
      this.stopped = Meteor.setTimeout(
        () => {
          const cursor = this.find(
            {
              status: "running"
            },
            {
              transform: null
            }
          );
          const failedJobs = cursor.count();

          if (failedJobs !== 0) {
            console.warn(`Failing ${failedJobs} jobs on queue stop.`);
          }

          cursor.forEach(d => this._DDPMethod_jobFail(d._id, d.runId, "Running at Job Server shutdown."));

          if (this.logStream !== null) { // Shutting down closes the logStream!
            this.logStream.end();
            this.logStream = null;

            return this.logStream;
          }
        },
        options.timeout
      );
    }
    return true;
  }

  _DDPMethod_getJob(ids, options = {}) {
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({
      getLog: Match.Optional(Boolean),
      getFailures: Match.Optional(Boolean)
    }));

    if (!options.getLog) {
      options.getLog = false;
    }

    if (!options.getFailures) {
      options.getFailures = false;
    }

    let single = false;
    let idArray = ids;

    if (_validId(ids)) {
      idArray = [ids];
      single = true;
    }

    if (idArray.length === 0) {
      return null;
    }

    const fields = { _private: 0 };
    if (!options.getLog) { fields.log = 0; }
    if (!options.getFailures) { fields.failures = 0; }
    let docs = this.find(
      {
        _id: {
          $in: idArray
        }
      },
      {
        fields,
        transform: null
      }
    ).fetch();

    if (docs && docs.length) {
      if (this.scrub) {
        docs = (Array.from(docs).map((d) => this.scrub(d)));
      }
      check(docs, [_validJobDoc()]);
      if (single) {
        return docs[0];
      }

      return docs;
    }
    return null;
  }

  _DDPMethod_getWork(type, options = {}) {
    let d;
    check(type, Match.OneOf(String, [ String ]));
    check(options, Match.Optional({
      maxJobs: Match.Optional(Match.Where(_validIntGTEOne)),
      workTimeout: Match.Optional(Match.Where(_validIntGTEOne))
    }));

    // Don"t simulate getWork!
    if (this.isSimulation) {
      return;
    }

    if (!options.maxJobs) { options.maxJobs = 1; }
    // Don"t put out any more jobs while shutting down
    if (this.stopped) {
      return [];
    }

    // Support string types or arrays of string types
    let typeArray = type;

    if (typeof type === "string") {
      typeArray = [ type ];
    }
    const time = new Date();
    let docs = [];
    const runId = this._makeNewID(); // This is meteor internal, but it will fail hard if it goes away.

    while (docs.length < options.maxJobs) {
      const ids = this.find(
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
          fields: {
            _id: 1
          },
          transform: null
        }
      ).map(doc => doc._id);

      if (!(ids && ids.length > 0)) {
        break;  // Don"t keep looping when there"s no available work
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

      const num = this.update(
        {
          _id: {
            $in: ids
          },
          status: "ready",
          runId: null
        },
        mods,
        {
          multi: true
        }
      );

      if (num > 0) {
        let foundDocs = this.find(
          {
            _id: {
              $in: ids
            },
            runId
          },
          {
            fields: {
              log: 0,
              failures: 0,
              _private: 0
            },
            transform: null
          }
        ).fetch();

        if (foundDocs && foundDocs.length > 0) {
          if (this.scrub) {
            foundDocs = ((() => { // eslint-disable-line no-loop-func
              const result = [];
              for (d of Array.from(foundDocs)) {
                result.push(this.scrub(d));
              }
              return result;
            })());
          }
          check(docs, [ _validJobDoc() ]);
          docs = docs.concat(foundDocs);
        }
      }
    }

    return docs;
  }

  _DDPMethod_jobRemove(ids, options = {}) {
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({}));

    let idArray = ids;

    if (_validId(ids)) {
      idArray = [ids];
    }
    if (idArray.length === 0) {
      return false;
    }

    const num = this.remove({
      _id: {
        $in: idArray
      },
      status: {
        $in: this.jobStatusRemovable
      }
    });

    if (num > 0) {
      return true;
    }

    console.warn("jobRemove failed");
    return false;
  }

  _DDPMethod_jobPause(ids, options = {}) {
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({}));

    let idArray = ids;

    if (_validId(ids)) {
      idArray = [ids];
    }

    if (idArray.length === 0) { return false; }
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

    const num = this.update(
      {
        _id: {
          $in: idArray
        },
        status: {
          $in: this.jobStatusPausable
        }
      },
      mods,
      {
        multi: true
      }
    );
    if (num > 0) {
      return true;
    }

    console.warn("jobPause failed");
    return false;
  }

  _DDPMethod_jobResume(ids, options = {}) {
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({}));

    let idArray = ids;

    if (_validId(ids)) {
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

    const num = this.update(
      {
        _id: {
          $in: idArray
        },
        status: "paused",
        updated: {
          $ne: time
        }
      },
      mods,
      {
        multi: true
      }
    );
    if (num > 0) {
      this._DDPMethod_jobReady(ids);
      return true;
    }

    console.warn("jobResume failed");
    return false;
  }

  _DDPMethod_jobReady(ids, options = {}) {
    let l;
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({
      force: Match.Optional(Boolean),
      time: Match.Optional(Date)
    }));

    // Don"t simulate jobReady. It has a strong chance of causing issues with
    // Meteor on the client, particularly if an observeChanges() is triggering
    // a processJobs queue (which in turn sets timers.)
    if (this.isSimulation) {
      return;
    }

    const now = new Date();

    if (!options.force) { options.force = false; }
    if (!options.time) { options.time = now; }

    let idArray = ids;

    if (_validId(ids)) {
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
      mods.$set.depends = [];  // Don"t move to resolved, because they weren"t!
      l = this._logMessage.forced();
      if (l) { logObj.push(l); }
    } else {
      query.depends = { $size: 0 };
    }

    l = this._logMessage.readied();
    if (l) { logObj.push(l); }

    if (logObj.length > 0) {
      mods.$push = {
        log: {
          $each: logObj
        }
      };
    }

    const num = this.update(
      query,
      mods,
      {
        multi: true
      }
    );

    if (num > 0) {
      return true;
    }

    return false;
  }

  _DDPMethod_jobCancel(ids, options = {}) {
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({
      antecedents: Match.Optional(Boolean),
      dependents: Match.Optional(Boolean)
    }));

    if (!options.antecedents) { options.antecedents = false; }
    if (!options.dependents) { options.dependents = true; }

    let idArray = ids;

    if (_validId(ids)) {
      idArray = [ids];
    }
    if (idArray.length === 0) { return false; }
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

    const num = this.update(
      {
        _id: {
          $in: idArray
        },
        status: {
          $in: this.jobStatusCancellable
        }
      },
      mods,
      {
        multi: true
      }
    );
    // Cancel the entire tree of dependents
    const cancelIds = this._idsOfDeps(idArray, options.antecedents, options.dependents, this.jobStatusCancellable);

    let depsCancelled = false;
    if (cancelIds.length > 0) {
      depsCancelled = this._DDPMethod_jobCancel(cancelIds, options);
    }

    if ((num > 0) || depsCancelled) {
      return true;
    }

    console.warn("jobCancel failed");
    return false;
  }

  _DDPMethod_jobRestart(ids, options = {}) {
    check(ids, Match.OneOf(Match.Where(_validId), [ Match.Where(_validId) ]));
    check(options, Match.Optional({
      retries: Match.Optional(Match.Where(_validIntGTEZero)),
      until: Match.Optional(Date),
      antecedents: Match.Optional(Boolean),
      dependents: Match.Optional(Boolean)
    }));

    if (!options.retries) { options.retries = 1; }
    if (options.retries > this.forever) { options.retries = this.forever; }
    if (!options.dependent) { options.dependents = false; }
    if (!options.antecedents) { options.antecedents = true; }

    let idArray = ids;

    if (_validId(ids)) {
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

    const num = this.update(query, mods, { multi: true });

    // Restart the entire tree of dependents
    const restartIds = this._idsOfDeps(idArray, options.antecedents, options.dependents, this.jobStatusRestartable);

    let depsRestarted = false;
    if (restartIds.length > 0) {
      depsRestarted = this._DDPMethod_jobRestart(restartIds, options);
    }

    if ((num > 0) || depsRestarted) {
      this._DDPMethod_jobReady(idArray);
      return true;
    }

    console.warn("jobRestart failed");
    return false;
  }

  // Job creator methods

  _DDPMethod_jobSave(doc, options = {}) {
    check(doc, _validJobDoc());
    check(options, Match.Optional({
      cancelRepeats: Match.Optional(Boolean)
    }));
    check(doc.status, Match.Where(v => Match.test(v, String) && [ "waiting", "paused" ].includes(v)));

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
      const schedule = this.later && this.later.schedule(doc.repeatWait) || undefined;
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

      const num = this.update(
        {
          _id: doc._id,
          status: "paused",
          runId: null
        },
        mods
      );

      if (num && this._checkDeps(doc, false)) {
        this._DDPMethod_jobReady(doc._id);
        return doc._id;
      }

      return null;
    }

    if ((doc.repeats === this.forever) && options.cancelRepeats) {
      // If this is unlimited repeating job, then cancel any existing jobs of the same type
      this.find(
        {
          type: doc.type,
          status: {
            $in: this.jobStatusCancellable
          }
        },
        {
          transform: null
        }
      ).forEach(d => this._DDPMethod_jobCancel(d._id, {}));
    }
    doc.created = time;
    doc.log.push(this._logMessage.submitted());
    doc._id = this.insert(doc);
    if (doc._id && this._checkDeps(doc, false)) {
      this._DDPMethod_jobReady(doc._id);
      return doc._id;
    }

    return null;
  }

  // Worker methods

  _DDPMethod_jobProgress(id, runId, completed, total, options = {}) {
    check(id, Match.Where(_validId));
    check(runId, Match.Where(_validId));
    check(completed, Match.Where(_validNumGTEZero));
    check(total, Match.Where(_validNumGTZero));
    check(options, Match.Optional({}));

    // Notify the worker to stop running if we are shutting down
    if (this.stopped) {
      return null;
    }

    const progress = {
      completed,
      total,
      percent: (100 * completed) / total
    };

    check(progress, Match.Where(v => (v.total >= v.completed) && (v.percent >= 0 && v.percent <= 100)));

    const time = new Date();

    const job = this.findOne({ _id: id }, { fields: { workTimeout: 1 } });

    const mods = {
      $set: {
        progress,
        updated: time
      }
    };

    if (job && job.workTimeout) {
      mods.$set.expiresAfter = new Date(time.valueOf() + job.workTimeout);
    }

    const num = this.update(
      {
        _id: id,
        runId,
        status: "running"
      },
      mods
    );

    if (num === 1) {
      return true;
    }

    console.warn("jobProgress failed");
    return false;
  }

  _DDPMethod_jobLog(id, runId, message, options = {}) {
    check(id, Match.Where(_validId));
    check(runId, Match.OneOf(Match.Where(_validId), null));
    check(message, String);
    check(options, Match.Optional({
      level: Match.Optional(Match.Where(_validLogLevel)),
      data: Match.Optional(Object)
    }));

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

    const job = this.findOne({ _id: id }, { fields: { status: 1, workTimeout: 1 } });

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

    const num = this.update(
      {
        _id: id
      },
      mods
    );
    if (num === 1) {
      return true;
    }

    console.warn("jobLog failed");
    return false;
  }

  _DDPMethod_jobRerun(id, options = {}) {
    check(id, Match.Where(_validId));
    check(options, Match.Optional({
      repeats: Match.Optional(Match.Where(_validIntGTEZero)),
      until: Match.Optional(Date),
      wait: Match.OneOf(Match.Where(_validIntGTEZero), Match.Where(_validLaterJSObj))
    }));

    const doc = this.findOne(
      {
        _id: id,
        status: "completed"
      },
      {
        fields: {
          result: 0,
          failures: 0,
          log: 0,
          progress: 0,
          updated: 0,
          after: 0,
          status: 0
        },
        transform: null
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

  _DDPMethod_jobDone(id, runId, result, options = {}) {
    check(id, Match.Where(_validId));
    check(runId, Match.Where(_validId));
    check(result, Object);
    check(options, Match.Optional({
      repeatId: Match.Optional(Boolean),
      delayDeps: Match.Optional(Match.Where(_validIntGTEZero))
    }));

    if (!options.repeatId) { options.repeatId = false; }

    const time = new Date();
    const doc = this.findOne(
      {
        _id: id,
        runId,
        status: "running"
      },
      {
        fields: {
          log: 0,
          failures: 0,
          updated: 0,
          after: 0,
          status: 0
        },
        transform: null
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

    const num = this.update(
      {
        _id: id,
        runId,
        status: "running"
      },
      mods
    );
    if (num === 1) {
      let jobId;
      if (doc.repeats > 0) {
        if (typeof doc.repeatWait === "number") {
          if ((doc.repeatUntil - doc.repeatWait) >= time) {
            jobId = this._rerun_job(doc);
          }
        } else {
          // This code prevents a job that just ran and finished
          // instantly from being immediately rerun on the same occurance
          const next = (this.later && this.later.schedule(doc.repeatWait).next(2)) || undefined;
          if (next && (next.length > 0)) {
            let d = new Date(next[0]);
            if (((d - time) > 500) || (next.length > 1)) {
              if ((d - time) <= 500) {
                d = new Date(next[1]);
              }
              const wait = d - time;
              if ((doc.repeatUntil - wait) >= time) {
                jobId = this._rerun_job(doc, doc.repeats - 1, wait);
              }
            }
          }
        }
      }

      // Resolve depends
      const ids = this.find(
        {
          depends: {
            $all: [ id ]
          }
        },
        {
          transform: null,
          fields: {
            _id: 1
          }
        }
      ).fetch().map(d => d._id);

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

        const n = this.update(
          {
            _id: {
              $in: ids
            }
          },
          mods,
          {
            multi: true
          }
        );

        if (n !== ids.length) {
          console.warn(`Not all dependent jobs were resolved ${ids.length} > ${n}`);
        }
        // Try to promote any jobs that just had a dependency resolved
        this._DDPMethod_jobReady(ids);
      }

      if (options.repeatId && jobId) {
        return jobId;
      }

      return true;
    }

    console.warn("jobDone failed");
    return false;
  }

  _DDPMethod_jobFail(id, runId, err, options = {}) {
    check(id, Match.Where(_validId));
    check(runId, Match.Where(_validId));
    check(err, Object);
    check(options, Match.Optional({
      fatal: Match.Optional(Boolean)
    }));

    if (!options.fatal) { options.fatal = false; }

    const time = new Date();
    const doc = this.findOne(
      {
        _id: id,
        runId,
        status: "running"
      },
      {
        fields: {
          log: 0,
          failures: 0,
          progress: 0,
          updated: 0,
          after: 0,
          runId: 0,
          status: 0
        },
        transform: null
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
          return new Date(time.valueOf() + doc.retryWait);  // "constant"
      }
    })();

    const newStatus = (!options.fatal &&
                    (doc.retries > 0) &&
                    (doc.retryUntil >= after)) ? "waiting" : "failed";

    err.runId = runId;  // Link each failure to the run that generated it.

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

    const num = this.update(
      {
        _id: id,
        runId,
        status: "running"
      },
      mods
    );
    if ((newStatus === "failed") && (num === 1)) {
      // Cancel any dependent jobs too
      this.find(
        {
          depends: {
            $all: [ id ]
          }
        },
        {
          transform: null
        }
      ).forEach(d => this._DDPMethod_jobCancel(d._id));
    }
    if (num === 1) {
      return true;
    }

    console.warn("jobFail failed");
    return false;
  }
}
JobCollectionBase.initClass();

// Share these methods so they"ll be available on server and client

export default JobCollectionBase;
