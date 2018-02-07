/* eslint prefer-arrow-callback:0 */

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//###########################################################################
//     Copyright (C) 2014-2017 by Vaughn Iverson
//     job-collection is free software released under the MIT/X11 license.
//     See included LICENSE file for details.
//###########################################################################


import { Meteor } from "meteor/meteor";
import { assert, expect } from "meteor/practicalmeteor:chai";
import { Match } from "meteor/check";
import { DDP } from "meteor/ddp";
import JobCollection from "./jobCollection";
import Job from "./job";

let remoteServerTestColl;
// function bind_env(func) {
//   if (Meteor.isServer && (typeof func === "function")) {
//     return Meteor.bindEnvironment(func, function (err) { throw err; });
//   }
//
//   return func;
// }

//
// const subWrapper = (sub, func) =>
//   function(test, onComplete) {
//     if (Meteor.isClient) {
//       return Deps.autorun(function() {
//         if (sub.ready()) {
//           return func(test, onComplete);
//         }
//       });
//     } else {
//       return func(test, onComplete);
//     }
//   }
// ;
//



const validId = v => Match.test(v, Match.OneOf(String, Meteor.Collection.ObjectID));

const defaultColl = new JobCollection();

const validJobDoc = d => Match.test(d, defaultColl.jobDocPattern);

describe("JobCollection default constructor", function () {
  it("should be an instance of JobCollection", function () {
    expect(defaultColl, "JobCollection constructor failed").to.be.an.instanceOf(JobCollection);
    expect(defaultColl.root, "default root isn't 'queue'").to.equal("queue");

    if (Meteor.isServer) {
      expect(defaultColl.stopped, "isn't initially stopped").to.equal(true);
      expect(defaultColl.logStream, "Doesn't have a logStream").to.equal(null);
      expect(defaultColl.allows, "allows isn't an object").to.be.an.instanceOf(Object);
      expect(Object.keys(defaultColl.allows).length, "allows not properly initialized").to.equal(22);
      expect(defaultColl.denys, "denys isn't an object").to.be.an.instanceOf(Object);
      expect(Object.keys(defaultColl.denys).length, "denys not properly initialized").to.equal(22);
    } else {
      expect(Object.keys(defaultColl.denys).length, "Doesn't have a logConsole").to.equal(22);
    }
  });
});

describe.only("JobCollection", function () {
  let clientTestColl;
  let serverTestColl;
  let testColl;

  // The line below is a regression test for issue #51
  const dummyTestColl = new JobCollection("DummyTest", { idGeneration: "STRING" });

  before(function () {
    clientTestColl = new JobCollection("ClientTest", { idGeneration: "MONGO" });
    serverTestColl = new JobCollection("ServerTest", { idGeneration: "STRING" });

    if (Meteor.isServer) {
      const remoteTestColl = new JobCollection("RemoteTest", { idGeneration: "STRING" });
      remoteTestColl.allow({ admin() { return true; } });
    } else {
      const remoteConnection = DDP.connect(Meteor.absoluteUrl());
      remoteServerTestColl = new JobCollection("RemoteTest", { idGeneration: "STRING", connection: remoteConnection });
    }

    // This is defined differently for client / server
    testColl = Meteor.isClient ? clientTestColl : serverTestColl;

    if (Meteor.isServer) {
      clientTestColl.allow({ admin() { return true; } });
    }
  });

  it("should set permissions to allow admin on ClientTest", function () {
    expect(clientTestColl.allows.admin[0]()).to.equal(true);
  });

  it("should set polling interval", function () {
    let { interval } = clientTestColl;
    clientTestColl.promote(250);
    expect(interval, "clientTestColl interval not updated").to.not.equal(clientTestColl.interval);

    ({ interval } = serverTestColl);
    serverTestColl.promote(250);
    expect(interval, "serverTestColl interval not updated").to.not.equal(serverTestColl.interval);
  });

  it("should run startJobServer on new job collection", function (done) {
    testColl.startJobServer(function (err, res) {
      if (err) { done(err); }
      expect(res, "startJobServer failed in callback result").to.equal(true);
      if (Meteor.isServer) {
        expect(testColl.stopped, "startJobServer didn't start job collection").to.equal(false);
      }
      done();
    });
  });

  if (Meteor.isServer) {
    it("should create a server-side job and see that it is added to the collection and runs", function (done) {
      const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
      const job = new Job(testColl, jobType, { some: "data" });
      assert.ok(validJobDoc(job.doc));

      const res = job.save();
      assert.ok(validId(res), "job.save() failed in sync result");

      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        expect(jobResult._doc._id).to.equal(res);
        jobResult.done();
        return cb();
      });

      testColl.events.once("jobDone", function (msg) {
        expect(msg.method).to.equal("jobDone");
        if (msg.params[0] === res) {
          return q.shutdown({ level: "soft", quiet: true }, () => done());
        }
      });
    });
  }

  it("should create a job and see that it is added to the collection and runs", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" });
    assert.ok(validJobDoc(job.doc));

    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");

      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        expect(jobResult._doc._id).to.equal(res);
        jobResult.done();
        cb();
        return q.shutdown({ level: "soft", quiet: true }, () => done());
      });
    });
  });
});


//
// Tinytest.addAsync('Create an invalid job and see that errors correctly propagate', function(test, onComplete) {
//   console.warn("****************************************************************************************************");
//   console.warn("***** The following exception dump is a Normal and Expected part of error handling unit tests: *****");
//   console.warn("****************************************************************************************************");
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { some: 'data' });
//   delete job.doc.status;
//   test.equal(validJobDoc(job.doc), false);
//   if (Meteor.isServer) {
//     let eventFlag = false;
//     let err = null;
//     const ev = testColl.events.once('jobSave', function(msg) {
//       eventFlag = true;
//       if (!msg.error) { return test.fail(new Error("Server error event didn't dispatch")); }
//     });
//     try {
//       return job.save();
//     } catch (e) {
//       return err = e;
//     }
//     finally {
//       test.ok(eventFlag);
//       if (!err) { test.fail(new Error("Server exception wasn't thrown")); }
//       onComplete();
//     }
//   } else {
//     return job.save(function(err, res) {
//       if (!err) { test.fail(new Error("Error did not propagate to Client")); }
//       return onComplete();
//     });
//   }
// });
//
// Tinytest.addAsync('Create a job and then make a new doc with its document', function(test, onComplete) {
//   let job;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job2 = new Job(testColl, jobType, { some: 'data' });
//   if (Meteor.isServer) {
//     job = new Job('ServerTest', job2.doc);
//   } else {
//     job = new Job('ClientTest', job2.doc);
//   }
//   test.ok(validJobDoc(job.doc));
//   return job.save(function(err, res) {
//     let q;
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//       test.equal(job._doc._id, res);
//       job.done();
//       cb();
//       return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//     });
//   });
// });
//
// Tinytest.addAsync('A repeating job that returns the _id of the next job', function(test, onComplete) {
//   let counter = 0;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, {some: 'data'}).repeat({ repeats: 1, wait: 250 });
//   return job.save(function(err, res) {
//     let q;
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//       counter++;
//       if (counter === 1) {
//         test.equal(job.doc._id, res);
//         return job.done("Result1", { repeatId: true }, function(err, res) {
//           if (err) { test.fail(err); }
//           test.ok(res != null);
//           test.notEqual(res, true);
//           return testColl.getJob(res, function(err, j) {
//             if (err) { test.fail(err); }
//             test.equal(j._doc._id, res);
//             return cb();
//           });
//         });
//       } else {
//         test.notEqual(job.doc._id, res);
//         return job.done("Result2", { repeatId: true }, function(err, res) {
//           if (err) { test.fail(err); }
//           test.equal(res, true);
//           cb();
//           return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//         });
//       }
//     });
//   });
// });
//
// Tinytest.addAsync('Dependent jobs run in the correct order', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { order: 1 });
//   const job2 = new Job(testColl, jobType, { order: 2 });
//   job.delay(1000); // Ensure that job 1 has the opportunity to run first
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     job2.depends([job]);
//     return job2.save(function(err, res) {
//       let q;
//       if (err) { test.fail(err); }
//       test.ok(validId(res), "job.save() failed in callback result");
//       let count = 0;
//       return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//         count++;
//         test.equal(count, job.data.order);
//         job.done();
//         cb();
//         if (count === 2) {
//           return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//         }
//       });
//     });
//   });
// });
//
// if (Meteor.isServer) {
//   Tinytest.addAsync('Dry run of dependency check returns status object', function(test, onComplete) {
//     const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//     const job = new Job(testColl, jobType, { order: 1 });
//     const job2 = new Job(testColl, jobType, { order: 2 });
//     const job3 = new Job(testColl, jobType, { order: 3 });
//     const job4 = new Job(testColl, jobType, { order: 4 });
//     const job5 = new Job(testColl, jobType, { order: 5 });
//     job.save();
//     job2.save();
//     job3.save();
//     job4.save();
//     job5.depends([job, job2, job3, job4]);
//     return job5.save(function(err, res) {
//       if (err) { test.fail(err); }
//       test.ok(validId(res), "job2.save() failed in callback result");
//       // This creates an inconsistent state
//       testColl.update({ _id: job.doc._id, status: 'ready' }, { $set: { status: 'cancelled' }});
//       testColl.update({ _id: job2.doc._id, status: 'ready' }, { $set: { status: 'failed' }});
//       testColl.update({ _id: job3.doc._id, status: 'ready' }, { $set: { status: 'completed' }});
//       testColl.remove({ _id: job4.doc._id });
//       const dryRunRes = testColl._checkDeps(job5.doc);
//       test.equal(dryRunRes.cancelled.length, 1);
//       test.equal(dryRunRes.cancelled[0], job.doc._id);
//       test.equal(dryRunRes.failed.length, 1);
//       test.equal(dryRunRes.failed[0], job2.doc._id);
//       test.equal(dryRunRes.resolved.length, 1);
//       test.equal(dryRunRes.resolved[0], job3.doc._id);
//       test.equal(dryRunRes.removed.length, 1);
//       test.equal(dryRunRes.removed[0], job4.doc._id);
//       return onComplete();
//     });
//   });
// }
//
// Tinytest.addAsync('Dependent job saved after completion of antecedent still runs', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { order: 1 });
//   const job2 = new Job(testColl, jobType, { order: 2 });
//   return job.save(function(err, res) {
//     let q;
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     job2.depends([job]);
//     let count = 0;
//     return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(j, cb) {
//       count++;
//       j.done(`Job ${j.data.order} Done`, function(err, res) {
//         if (err) { test.fail(err); }
//         test.ok(res);
//         if (j.data.order === 1) {
//           return job2.save(function(err, res) {
//             if (err) { test.fail(err); }
//             return test.ok(validId(res), "job2.save() failed in callback result");
//           });
//         } else {
//           return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//         }
//       });
//       return cb();
//     });
//   });
// });
//
// Tinytest.addAsync('Dependent job saved after failure of antecedent is cancelled', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { order: 1 });
//   const job2 = new Job(testColl, jobType, { order: 2 });
//   return job.save(function(err, res) {
//     let q;
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     job2.depends([job]);
//     return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(j, cb) {
//       j.fail(`Job ${j.data.order} Failed`, function(err, res) {
//         if (err) { test.fail(err); }
//         test.ok(res);
//         return job2.save(function(err, res) {
//           if (err) { test.fail(err); }
//           test.isNull(res, "job2.save() failed in callback result");
//           return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//         });
//       });
//       return cb();
//     });
//   });
// });
//
// Tinytest.addAsync('Dependent job saved after cancelled antecedent is also cancelled', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { order: 1 });
//   const job2 = new Job(testColl, jobType, { order: 2 });
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     job2.depends([job]);
//     return job.cancel(function(err, res) {
//       if (err) { test.fail(err); }
//       test.ok(res);
//       return job2.save(function(err, res) {
//         if (err) { test.fail(err); }
//         test.isNull(res, "job2.save() failed in callback result");
//         return onComplete();
//       });
//     });
//   });
// });
//
// Tinytest.addAsync('Dependent job saved after removed antecedent is cancelled', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { order: 1 });
//   const job2 = new Job(testColl, jobType, { order: 2 });
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     job2.depends([job]);
//     return job.cancel(function(err, res) {
//       if (err) { test.fail(err); }
//       test.ok(res);
//       return job.remove(function(err, res) {
//         if (err) { test.fail(err); }
//         test.ok(res);
//         return job2.save(function(err, res) {
//           if (err) { test.fail(err); }
//           test.isNull(res, "job2.save() failed in callback result");
//           return onComplete();
//         });
//       });
//     });
//   });
// });
//
// Tinytest.addAsync('Cancel succeeds for job without deps, with using option dependents: false', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, {});
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     return job.cancel({ dependents: false }, function(err, res) {
//        if (err) { test.fail(err); }
//        test.ok(res);
//        return onComplete();
//     });
//   });
// });
//
// Tinytest.addAsync('Dependent job with delayDeps is delayed', function(test, onComplete) {
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, { order: 1 });
//   const job2 = new Job(testColl, jobType, { order: 2 });
//   job.delay(1000); // Ensure that job2 has the opportunity to run first
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     job2.depends([job]);
//     return job2.save(function(err, res) {
//       let q;
//       if (err) { test.fail(err); }
//       test.ok(validId(res), "job.save() failed in callback result");
//       let count = 0;
//       return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//         count++;
//         test.equal(count, job.data.order);
//         const timer = new Date();
//         job.done(null, { delayDeps: 1500 });
//         cb();
//         if (count === 2) {
//           test.ok(new Date() > (timer + 1500));
//           return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//         }
//       });
//     });
//   });
// });
//
// Tinytest.addAsync('Job priority is respected', function(test, onComplete) {
//   let counter = 0;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const jobs = [];
//   jobs[0] = new Job(testColl, jobType, {count: 3}).priority('low');
//   jobs[1] = new Job(testColl, jobType, {count: 1}).priority('high');
//   jobs[2] = new Job(testColl, jobType, {count: 2});
//
//   return jobs[0].save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "jobs[0].save() failed in callback result");
//     return jobs[1].save(function(err, res) {
//       if (err) { test.fail(err); }
//       test.ok(validId(res), "jobs[1].save() failed in callback result");
//       return jobs[2].save(function(err, res) {
//         let q;
//         if (err) { test.fail(err); }
//         test.ok(validId(res), "jobs[2].save() failed in callback result");
//         return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//           counter++;
//           test.equal(job.data.count, counter);
//           job.done();
//           cb();
//           if (counter === 3) {
//             return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//           }
//         });
//       });
//     });
//   });
// });
//
// Tinytest.addAsync('A forever retrying job can be scheduled and run', function(test, onComplete) {
//   let counter = 0;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, {some: 'data'}).retry({retries: testColl.forever, wait: 0});
//   return job.save(function(err, res) {
//     let q;
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//       counter++;
//       test.equal(job.doc._id, res);
//       if (counter < 3) {
//         job.fail('Fail test');
//         return cb();
//       } else {
//         job.fail('Fail test', { fatal: true });
//         cb();
//         return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//       }
//     });
//   });
// });
//
// Tinytest.addAsync('Retrying job with exponential backoff', function(test, onComplete) {
//   let counter = 0;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, {some: 'data'}).retry({retries: 2, wait: 200, backoff: 'exponential'});
//   return job.save(function(err, res) {
//     let q;
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     return q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//       counter++;
//       test.equal(job.doc._id, res);
//       if (counter < 3) {
//         job.fail('Fail test');
//         return cb();
//       } else {
//         job.fail('Fail test');
//         cb();
//         return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//       }
//     });
//   });
// });
//
// Tinytest.addAsync('A forever retrying job with "until"', function(test, onComplete) {
//   let counter = 0;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, {some: 'data'}).retry({until: new Date(new Date().valueOf() + 1500), wait: 500});
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     const q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//       counter++;
//       test.equal(job.doc._id, res);
//       job.fail('Fail test');
//       return cb();
//     });
//     return Meteor.setTimeout(() =>
//       job.refresh(function() {
//         test.equal(job._doc.status, 'failed', "Until didn't cause job to stop retrying");
//         return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//       })
//
//     ,
//       2500
//     );
//   });
// });
//
// Tinytest.addAsync('Autofail and retry a job', function(test, onComplete) {
//   let counter = 0;
//   const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//   const job = new Job(testColl, jobType, {some: 'data'}).retry({retries: 2, wait: 0});
//   return job.save(function(err, res) {
//     if (err) { test.fail(err); }
//     test.ok(validId(res), "job.save() failed in callback result");
//     const q = testColl.processJobs(jobType, { pollInterval: 250, workTimeout: 500 }, function(job, cb) {
//       counter++;
//       test.equal(job.doc._id, res);
//       if (counter === 2) {
//         job.done('Success');
//       }
//       // Will be called without done/fail on first attempt
//       return cb();
//     });
//
//     return Meteor.setTimeout(() =>
//       job.refresh(function() {
//         test.equal(job._doc.status, 'completed', "Job didn't successfully autofail and retry");
//         return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//       })
//
//     ,
//       2500
//     );
//   });
// });
//
// if (Meteor.isServer) {
//
//   Tinytest.addAsync('Save, cancel, restart, refresh: retries are correct.', function(test, onComplete) {
//     const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//     const j = new Job(testColl, jobType, { foo: "bar" });
//     j.save();
//     j.cancel();
//     j.restart({ retries: 0 });
//     j.refresh();
//     test.equal(j._doc.repeatRetries, j._doc.retries + j._doc.retried);
//     return onComplete();
//   });
//
//   Tinytest.addAsync('Add, cancel and remove a large number of jobs', function(test, onComplete) {
//     let count;
//     let c = (count = 500);
//     const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//     return (() => {
//       const result = [];
//       for (let i = 1, end = count, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
//         const j = new Job(testColl, jobType, { idx: i });
//         result.push(j.save(function(err, res) {
//           if (err) { test.fail(err); }
//           if (!validId(res)) { test.fail("job.save() Invalid _id value returned"); }
//           c--;
//           if (!c) {
//             let ids = testColl.find({ type: jobType, status: 'ready'}).map(d => d._id);
//             test.equal(count, ids.length);
//             return testColl.cancelJobs(ids, function(err, res) {
//               if (err) { test.fail(err); }
//               if (!res) { test.fail("cancelJobs Failed"); }
//               ids = testColl.find({ type: jobType, status: 'cancelled'}).map(d => d._id);
//               test.equal(count, ids.length);
//               return testColl.removeJobs(ids, function(err, res) {
//                 if (err) { test.fail(err); }
//                 if (!res) { test.fail("removeJobs Failed"); }
//                 ids = testColl.find({ type: jobType });
//                 test.equal(0, ids.count());
//                 return onComplete();
//               });
//             });
//           }
//         }));
//       }
//       return result;
//     })();
//   });
//
//   Tinytest.addAsync('A forever repeating job with "schedule" and "until"', function(test, onComplete) {
//     let counter = 0;
//     const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//     const job = new Job(testColl, jobType, {some: 'data'})
//       .repeat({
//         until: new Date(new Date().valueOf() + 3500),
//         schedule: testColl.later.parse.text("every 1 second")})
//       .delay(1000);
//     return job.save(function(err, res) {
//       let ev;
//       if (err) { test.fail(err); }
//       test.ok(validId(res), "job.save() failed in callback result");
//       const q = testColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//         counter++;
//         if (counter === 1) {
//           test.equal(job.doc._id, res);
//         } else {
//           test.notEqual(job.doc._id, res);
//         }
//         job.done({}, { repeatId: true });
//         return cb();
//       });
//       var listener = function(msg) {
//         if (counter === 2) {
//           return job.refresh(function() {
//             test.equal(job._doc.status, 'completed');
//             return q.shutdown({ level: 'soft', quiet: true }, function() {
//               ev.removeListener('jobDone', listener);
//               return onComplete();
//             });
//           });
//         }
//       };
//       return ev = testColl.events.on('jobDone', listener);
//     });
//   });
// }
//
// // Tinytest.addAsync 'Run stopJobs on the job collection', (test, onComplete) ->
// //   testColl.stopJobs { timeout: 1 }, (err, res) ->
// //     test.fail(err) if err
// //     test.equal res, true, "stopJobs failed in callback result"
// //     if Meteor.isServer
// //       test.notEqual testColl.stopped, false, "stopJobs didn't stop job collection"
// //     onComplete()
//
// Tinytest.addAsync('Run shutdownJobServer on the job collection', (test, onComplete) =>
//   testColl.shutdownJobServer({ timeout: 1 }, function(err, res) {
//     if (err) { test.fail(err); }
//     test.equal(res, true, "shutdownJobServer failed in callback result");
//     if (Meteor.isServer) {
//       test.notEqual(testColl.stopped, false, "shutdownJobServer didn't stop job collection");
//     }
//     return onComplete();
//   })
// );
//
// if (Meteor.isClient) {
//
//   Tinytest.addAsync('Run startJobServer on remote job collection', (test, onComplete) =>
//     remoteServerTestColl.startJobServer(function(err, res) {
//       if (err) { test.fail(err); }
//       test.equal(res, true, "startJobServer failed in callback result");
//       return onComplete();
//     })
//   );
//
//   Tinytest.addAsync('Create a job and see that it is added to a remote server collection and runs', function(test, onComplete) {
//     const jobType = `TestJob_${Math.round(Math.random()*1000000000)}`;
//     const job = new Job(remoteServerTestColl, jobType, { some: 'data' });
//     test.ok(validJobDoc(job.doc));
//     return job.save(function(err, res) {
//       let q;
//       if (err) { test.fail(err); }
//       test.ok(validId(res), "job.save() failed in callback result");
//       return q = remoteServerTestColl.processJobs(jobType, { pollInterval: 250 }, function(job, cb) {
//         test.equal(job._doc._id, res);
//         job.done();
//         cb();
//         return q.shutdown({ level: 'soft', quiet: true }, () => onComplete());
//       });
//     });
//   });
//
//   Tinytest.addAsync('Run shutdownJobServer on remote job collection', (test, onComplete) =>
//     remoteServerTestColl.shutdownJobServer({ timeout: 1 }, function(err, res) {
//       if (err) { test.fail(err); }
//       test.equal(res, true, "shutdownJobServer failed in callback result");
//       return onComplete();
//     })
//   );
// }
