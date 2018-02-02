/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//###########################################################################
//     Copyright (C) 2014-2017 by Vaughn Iverson
//     job-collection is free software released under the MIT/X11 license.
//     See included LICENSE file for details.
//###########################################################################

import { eventEmitter } from "events";
import { Meteor } from "meteor/meteor";
import JobCollectionBase from "./jobCollectionBase";
import { Job } from "./job";

function userHelper(user, connection) {
  let ret = user !== null ? user : "[UNAUTHENTICATED]";
  if (!connection) {
    ret = "[SERVER]";
  }
  return ret;
}

class JobCollection extends JobCollectionBase {
  constructor(root = "queue", options = {}) {
    // Call super"s constructor
    super(root, options);

    this._onError = this._onError.bind(this);
    this._onCall = this._onCall.bind(this);
    this._toLog = this._toLog.bind(this);
    this._emit = this._emit.bind(this);

    if (!(this instanceof JobCollection)) {
      return new JobCollection(root, options);
    }

    this.events = new eventEmitter();

    this._errorListener = this.events.on("error", this._onError);

    // Add events for all individual successful DDP methods
    this._methodErrorDispatch = this.events.on("error", msg => {
      return this.events.emit(msg.method, msg);
    });

    this._callListener = this.events.on("call", this._onCall);

    // Add events for all individual successful DDP methods
    this._methodEventDispatch = this.events.on("call", msg => {
      return this.events.emit(msg.method, msg);
    });

    this.stopped = true;

    // No client mutators allowed
    JobCollectionBase.__super__.deny.bind(this)({
      update: () => true,
      insert: () => true,
      remove: () => true
    });

    this.promote();

    this.logStream = null;

    this.allows = {};
    this.denys = {};

    // Initialize allow/deny lists for permission levels and ddp methods
    for (const level of Array.from(this.ddpPermissionLevels.concat(this.ddpMethods))) {
      this.allows[level] = [];
      this.denys[level] = [];
    }

    // If a connection option is given, then this JobCollection is actually hosted
    // remotely, so don"t establish local and remotely callable server methods in that case
    if (options.connection === null) {
      // Default indexes, only when not remotely connected!
      this._ensureIndex({
        type: 1,
        status: 1
      });

      this._ensureIndex({
        priority: 1,
        retryUntil: 1,
        after: 1
      });

      this.isSimulation = false;

      const localMethods = this._generateMethods();

      if (this._localServerMethods === null) {
        this._localServerMethods = {};
      }

      for (const methodName in localMethods) {
        if ({}.hasOwnProperty(localMethods[methodName])) {
          const methodFunction = localMethods[methodName]; this._localServerMethods[methodName] = methodFunction;
        }
      }

      this._ddpApply = (name, params, cb) => {
        if (cb !== null) {
          return Meteor.setTimeout(() => {
            let err = null;
            let res = null;
            try {
              res = this._localServerMethods[name].apply(this, params);
            } catch (e) {
              err = e;
            }
            return cb(err, res);
          }, 0);
        }

        return this._localServerMethods[name].apply(this, params);
      };

      Job._setDDPApply(this._ddpApply, root);

      Meteor.methods(localMethods);
    }
  }

  _onError(msg) {
    const user = userHelper(msg.userId, msg.connection);
    return this._toLog(user, msg.method, `${msg.error}`);
  }

  _onCall(msg) {
    const user = userHelper(msg.userId, msg.connection);
    this._toLog(user, msg.method, `params: ${JSON.stringify(msg.params)}`);
    return this._toLog(user, msg.method, `returned: ${JSON.stringify(msg.returnVal)}`);
  }

  _toLog(userId, method, message) {
    return (this.logStream !== null ? this.logStream.write(`${new Date()}, ${userId}, ${method}, ${message}\n`) : undefined);
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

  _methodWrapper(method, func) {
    const self = this;

    function myTypeof(val) {
      let type = typeof val;
      if ((type === "object") && type instanceof Array) { type = "array"; }
      return type;
    }

    const permitted = (userId, params) => {
      const performTest = tests => {
        let result = false;
        for (const test of Array.from(tests)) {
          if (result === false) {
            result = result || (() => {
              switch (myTypeof(test)) {
                case "array": return Array.from(test).includes(userId);
                case "function": return test(userId, method, params);
                default: return false;
              }
            })();
          }
        }
        return result;
      };
      const performAllTests = allTests => {
        let result = false;
        for (const t of Array.from(this.ddpMethodPermissions[method])) {
          if (result === false) {
            result = result || performTest(allTests[t]);
          }
        }
        return result;
      };
      return !performAllTests(this.denys) && performAllTests(this.allows);
    };
    // Return the wrapper function that the Meteor method will actually invoke
    return function (...params) {
      let err;
      let retval;
      try {
        if (!this.connection || !!permitted(this.userId, params)) {
          retval = func(...Array.from(params || []));
        } else {
          err = new Meteor.Error(403, "Method not authorized", "Authenticated user is not permitted to invoke this method.");
          throw err;
        }
      } catch (error) {
        err = error;
        self._emit(method, this.connection, this.userId, err);
        throw err;
      }
      self._emit(method, this.connection, this.userId, null, retval, ...Array.from(params));
      return retval;
    };
  }

  setLogStream(writeStream = null) {
    if (this.logStream) {
      throw new Error("logStream may only be set once per job-collection startup/shutdown cycle");
    }
    this.logStream = writeStream;
    if (!(this.logStream === null) &&
           ((this.logStream.write === null) ||
           (typeof this.logStream.write !== "function") ||
           (this.logStream.end === null) ||
           (typeof this.logStream.end !== "function"))) {
      throw new Error("logStream must be a valid writable node.js Stream");
    }
  }

  // Register application allow rules
  allow(allowOptions) {
    return (() => {
      const result = [];
      for (const type in allowOptions) {
        if ({}.hasOwnProperty(allowOptions[type])) {
          const func = allowOptions[type];
          if (type in this.allows) {
            result.push(this.allows[type].push(func));
          }
        }
      }
      return result;
    })();
  }

  // Register application deny rules
  deny(denyOptions) {
    return (() => {
      const result = [];
      for (const type in denyOptions) {
        if ({}.hasOwnProperty(denyOptions[type])) {
          const func = denyOptions[type];
          if (type in this.denys) {
            result.push(this.denys[type].push(func));
          }
        }
      }
      return result;
    })();
  }

  // Hook function to sanitize documents before validating them in getWork() and getJob()
  scrub(job) {
    return job;
  }

  promote(milliseconds) {
    if (milliseconds === null) {
      milliseconds = 15*1000;
    }
    if ((typeof milliseconds === "number") && (milliseconds > 0)) {
      if (this.interval) {
        Meteor.clearInterval(this.interval);
      }
      this.promoteJobs();
      this.interval = Meteor.setInterval(this.promoteJobs.bind(this), milliseconds);

      return this.interval;
    }

    console.warn(`jobCollection.promote: invalid timeout: ${this.root}, ${milliseconds}`);
  }

  promoteJobs(ids) {
    if (ids === null) {
      ids = [];
    }
    if (this.stopped) {
      return;
    }
    // This looks for zombie running jobs and autofails them
    this.find({
      status: "running",
      expiresAfter: { $lt: new Date() }
    }).forEach(job => {
      return new Job(this.root, job).fail("Failed for exceeding worker set workTimeout");
    });
    // Change jobs from waiting to ready when their time has come
    // and dependencies have been satisfied
    return this.readyJobs();
  }
}

export default JobCollection;
