/* eslint prefer-arrow-callback:0 */
/*
  Original version: https://github.com/vsivsi/meteor-job-collection/
  License: https://github.com/vsivsi/meteor-job-collection/blob/master/LICENSE
 */
import { Meteor } from "meteor/meteor";
import { assert, expect } from "meteor/practicalmeteor:chai";
import { Match } from "meteor/check";
import { DDP } from "meteor/ddp";
import { Job, JobCollection } from "./";

let remoteServerTestColl;

const validId = (v) => Match.test(v, Match.OneOf(String, Meteor.Collection.ObjectID));

const defaultColl = new JobCollection();

const validJobDoc = (d) => Match.test(d, defaultColl.jobDocPattern);

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

describe("JobCollection", function () {
  let clientTestColl;
  let serverTestColl;
  let testColl;

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

  it("should create an invalid job and see that errors correctly propagate", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" });

    delete job.doc.status;

    expect(validJobDoc(job.doc)).to.equal(false);

    if (Meteor.isServer) {
      let eventFlag = false;
      let err = null;

      testColl.events.once("jobSave", function (msg) {
        eventFlag = true;
        if (!msg.error) {
          done(new Error("Server error event didn't dispatch"));
        }
      });

      try {
        job.save();
      } catch (e) {
        err = e;
      } finally {
        assert.ok(eventFlag);
        if (!err) { done(new Error("Server exception wasn't thrown")); }
        done();
      }
    } else {
      return job.save(function (err) {
        if (!err) { done(new Error("Error did not propagate to Client")); }
        return done();
      });
    }
  });

  it("should create a job and then make a new doc with its document", function (done) {
    let job;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job2 = new Job(testColl, jobType, { some: "data" });

    if (Meteor.isServer) {
      job = new Job("ServerTest", job2.doc);
    } else {
      job = new Job("ClientTest", job2.doc);
    }

    assert.ok(validJobDoc(job.doc));

    job.save(function (err, res) {
      if (err) { test.fail(err); }

      assert.ok(validId(res), "job.save() failed in callback result");

      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        expect(jobResult._doc._id).to.equal(res);
        jobResult.done();
        cb();
        return q.shutdown({ level: "soft", quiet: true }, () => done());
      });
    });
  });

  it("should should create a repeating job that returns the _id of the next job", function (done) {
    let counter = 0;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" }).repeat({ repeats: 1, wait: 250 });

    job.save(function (err, res) {
      if (err) { test.fail(err); }
      assert.ok(validId(res), "job.save() failed in callback result");

      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        counter += 1;
        if (counter === 1) {
          expect(jobResult.doc._id).to.equal(res);

          jobResult.done("Result1", { repeatId: true }, function (err2, res2) {
            if (err2) { done(err2); }
            assert.ok(res2);
            expect(res2).to.not.equal(true);

            testColl.getJob(res2, function (err3, j) {
              if (err3) { done(err3); }
              expect(j._doc._id).to.equal(res2);
              cb();
            });
          });
        } else {
          expect(jobResult.doc._id).to.not.equal(res);
          jobResult.done("Result2", { repeatId: true }, function (err2, res2) {
            if (err2) { done(err2); }
            expect(res2).to.equal(true);
            cb();
            q.shutdown({ level: "soft", quiet: true }, () => done());
          });
        }
      });
    });
  });

  it("should have dependent jobs run in the correct order", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    job.delay(1000); // Ensure that job 1 has the opportunity to run first
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      return job2.save(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(validId(res2), "job.save() failed in callback result");
        let count = 0;
        const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
          count += 1;
          expect(count).to.equal(jobResult.data.order);
          jobResult.done();
          cb();
          if (count === 2) {
            q.shutdown({ level: "soft", quiet: true }, () => done());
          }
        });
      });
    });
  });

  if (Meteor.isServer) {
    it("should dry run of dependency check returns status object", function (done) {
      const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
      const job = new Job(testColl, jobType, { order: 1 });
      const job2 = new Job(testColl, jobType, { order: 2 });
      const job3 = new Job(testColl, jobType, { order: 3 });
      const job4 = new Job(testColl, jobType, { order: 4 });
      const job5 = new Job(testColl, jobType, { order: 5 });
      job.save();
      job2.save();
      job3.save();
      job4.save();
      job5.depends([job, job2, job3, job4]);
      return job5.save(function (err, res) {
        if (err) { done(err); }
        assert.ok(validId(res), "job2.save() failed in callback result");
        // This creates an inconsistent state
        testColl.update({ _id: job.doc._id, status: "ready" }, { $set: { status: "cancelled" } });
        testColl.update({ _id: job2.doc._id, status: "ready" }, { $set: { status: "failed" } });
        testColl.update({ _id: job3.doc._id, status: "ready" }, { $set: { status: "completed" } });
        testColl.remove({ _id: job4.doc._id });
        const dryRunRes = testColl._checkDeps(job5.doc);
        expect(dryRunRes.cancelled.length).to.equal(1);
        expect(dryRunRes.cancelled[0]).to.equal(job.doc._id);
        expect(dryRunRes.failed.length).to.equal(1);
        expect(dryRunRes.failed[0]).to.equal(job2.doc._id);
        expect(dryRunRes.resolved.length).to.equal(1);
        expect(dryRunRes.resolved[0]).to.equal(job3.doc._id);
        expect(dryRunRes.removed.length).to.equal(1);
        expect(dryRunRes.removed[0]).to.equal(job4.doc._id);
        done();
      });
    });
  }

  it("should have dependent job saved after completion of antecedent still runs", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    return job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (j, cb) {
        j.done(`Job ${j.data.order} Done`, function (err2, res2) {
          if (err2) { done(err2); }
          assert.ok(res2);
          if (j.data.order === 1) {
            job2.save(function (err3, res3) {
              if (err3) { done(err3); }
              assert.ok(validId(res3), "job2.save() failed in callback result");
            });
          } else {
            q.shutdown({ level: "soft", quiet: true }, () => done());
          }
        });
        cb();
      });
    });
  });

  it("should have dependent job saved after failure of antecedent is cancelled", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    return job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (j, cb) {
        j.fail(`Job ${j.data.order} Failed`, function (err2, res2) {
          if (err2) { done(err2); }
          assert.ok(res2);
          return job2.save(function (err3, res3) {
            if (err3) { done(err3); }
            assert.isNull(res3, "job2.save() failed in callback result");
            q.shutdown({ level: "soft", quiet: true }, () => done());
          });
        });
        cb();
      });
    });
  });

  it("should have dependent job saved after cancelled antecedent is also cancelled", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      return job.cancel(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(res2);
        return job2.save(function (err3, res3) {
          if (err3) { assert.ok(err3); }
          assert.isNull(res3, "job2.save() failed in callback result");
          done();
        });
      });
    });
  });

  it("should have dependent job saved after removed antecedent is cancelled", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      return job.cancel(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(res2);
        return job.remove(function (err3, res3) {
          if (err3) { done(err3); }
          assert.ok(res3);
          return job2.save(function (err4, res4) {
            if (err4) { done(err); }
            assert.isNull(res4, "job2.save() failed in callback result");
            done();
          });
        });
      });
    });
  });

  it("should cancel succeeds for job without deps, with using option dependents: false", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, {});
    job.save(function (err2, res2) {
      if (err2) { done(err2); }
      assert.ok(validId(res2), "job.save() failed in callback result");
      job.cancel({ dependents: false }, function (err3, res3) {
        if (err3) { done(err3); }
        assert.ok(res3);
        done();
      });
    });
  });

  it("should have dependent job with delayDeps is delayed", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    job.delay(1000); // Ensure that job2 has the opportunity to run first
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      job2.save(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(validId(res2), "job.save() failed in callback result");
        let count = 0;
        let timer;
        const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
          count += 1;
          expect(count).to.equal(jobResult.data.order);
          jobResult.done(null, { delayDeps: 1500 });
          cb();
          if (count === 2) {
            assert.ok(new Date().getTime() > (timer + 1500));
            q.shutdown({ level: "soft", quiet: true }, () => done());
          }
          timer = new Date().getTime();
        });
      });
    });
  }).timeout(4000);

  it("should be dependent job with delayDeps is delayed", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { order: 1 });
    const job2 = new Job(testColl, jobType, { order: 2 });
    job.delay(1000); // Ensure that job2 has the opportunity to run first
    return job.save(function (err, res) {
      if (err) { test.fail(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      job2.depends([job]);
      job2.save(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(validId(res2), "job.save() failed in callback result");
        let count = 0;
        let timer;
        const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
          count += 1;
          expect(count).to.equal(jobResult.data.order);
          jobResult.done(null, { delayDeps: 1500 });
          cb();
          if (count === 2) {
            assert.ok(new Date().getTime() > (timer + 1500));
            q.shutdown({ level: "soft", quiet: true }, () => done());
          }
          timer = new Date().getTime();
        });
      });
    });
  }).timeout(4000);

  it("Job priority is respected", function (done) {
    let counter = 0;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const jobs = [];
    jobs[0] = new Job(testColl, jobType, { count: 3 }).priority("low");
    jobs[1] = new Job(testColl, jobType, { count: 1 }).priority("high");
    jobs[2] = new Job(testColl, jobType, { count: 2 });

    jobs[0].save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "jobs[0].save() failed in callback result");
      jobs[1].save(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(validId(res2), "jobs[1].save() failed in callback result");
        jobs[2].save(function (err3, res3) {
          if (err3) { done(err3); }
          assert.ok(validId(res3), "jobs[2].save() failed in callback result");
          const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (job, cb) {
            counter += 1;
            expect(job.data.count).to.equal(counter);
            job.done();
            cb();
            if (counter === 3) {
              q.shutdown({ level: "soft", quiet: true }, () => done());
            }
          });
        });
      });
    });
  });

  it("Job priority is respected", function (done) {
    let counter = 0;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const jobs = [];
    jobs[0] = new Job(testColl, jobType, { count: 3 }).priority("low");
    jobs[1] = new Job(testColl, jobType, { count: 1 }).priority("high");
    jobs[2] = new Job(testColl, jobType, { count: 2 });

    jobs[0].save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "jobs[0].save() failed in callback result");
      jobs[1].save(function (err2, res2) {
        if (err2) { done(err2); }
        assert.ok(validId(res2), "jobs[1].save() failed in callback result");
        jobs[2].save(function (err3, res3) {
          if (err3) { done(err3); }
          assert.ok(validId(res3), "jobs[2].save() failed in callback result");
          const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (job, cb) {
            counter += 1;
            expect(job.data.count).to.equal(counter);
            job.done();
            cb();
            if (counter === 3) {
              q.shutdown({ level: "soft", quiet: true }, () => done());
            }
          });
        });
      });
    });
  });

  it("A forever retrying job can be scheduled and run", function (done) {
    let counter = 0;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" }).retry({ retries: testColl.forever, wait: 0 });
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        counter += 1;
        expect(jobResult.doc._id).to.equal(res);
        if (counter < 3) {
          jobResult.fail("Fail test");
          cb();
        } else {
          jobResult.fail("Fail test", { fatal: true });
          cb();
          q.shutdown({ level: "soft", quiet: true }, () => done());
        }
      });
    });
  });

  it("Retrying job with exponential backoff", function (done) {
    let counter = 0;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" }).retry({ retries: 2, wait: 200, backoff: "exponential" });
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        counter += 1;
        expect(jobResult.doc._id).to.equal(res);
        if (counter < 3) {
          jobResult.fail("Fail test");
          cb();
        } else {
          jobResult.fail("Fail test");
          cb();
          q.shutdown({ level: "soft", quiet: true }, () => done());
        }
      });
    });
  });

  it("should have a forever retrying job with 'until'", function (done) {
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" }).retry({ until: new Date(new Date().valueOf() + 1500), wait: 500 });
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
        expect(jobResult.doc._id).to.equal(res);
        jobResult.fail("Fail test");
        cb();
      });
      Meteor.setTimeout(
        () =>
          job.refresh(function () {
            expect(job._doc.status, "Until didn't cause job to stop retrying").to.equal("failed");
            q.shutdown({ level: "soft", quiet: true }, () => done());
          }),
        2500
      );
    });
  }).timeout(5000);

  it("should autofail and retry a job", function (done) {
    let counter = 0;
    const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
    const job = new Job(testColl, jobType, { some: "data" }).retry({ retries: 2, wait: 0 });
    job.save(function (err, res) {
      if (err) { done(err); }
      assert.ok(validId(res), "job.save() failed in callback result");
      const q = testColl.processJobs(jobType, { pollInterval: 250, workTimeout: 500 }, function (jobResult, cb) {
        counter += 1;
        expect(jobResult.doc._id).to.equal(res);
        if (counter === 2) {
          jobResult.done("Success");
        }
        // Will be called without done/fail on first attempt
        cb();
      });

      Meteor.setTimeout(
        () =>
          job.refresh(function () {
            expect(job._doc.status, "Job didn't successfully autofail and retry").to.equal("completed");
            q.shutdown({ level: "soft", quiet: true }, () => done());
          }),
        2500
      );
    });
  }).timeout(5000);

  if (Meteor.isServer) {
    it("should save, cancel, restart, refresh: retries are correct.", function (done) {
      const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
      const j = new Job(testColl, jobType, { foo: "bar" });
      j.save();
      j.cancel();
      j.restart({ retries: 0 });
      j.refresh();
      expect(j._doc.repeatRetries).to.equal(j._doc.retries + j._doc.retried);
      done();
    });

    it("should add, cancel and remove a large number of jobs", function (done) {
      const count = 500;
      let c = count;
      const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
      (() => {
        const result = [];
        for (let i = 1, end = count, asc = end >= 1; asc ? i <= end : i >= end; asc ? i += 1 : i -= 1) {
          const j = new Job(testColl, jobType, { idx: i });
          // eslint-disable-next-line no-loop-func
          result.push(j.save(function (err, res) {
            if (err) { done(err); }
            if (!validId(res)) { done("job.save() Invalid _id value returned"); }
            c -= 1;
            if (!c) {
              let ids = testColl.find({ type: jobType, status: "ready" }).map((d) => d._id);
              expect(count).to.equal(ids.length);
              testColl.cancelJobs(ids, function (err2, res2) {
                if (err2) { done(err2); }
                if (!res2) { done("cancelJobs Failed"); }
                ids = testColl.find({ type: jobType, status: "cancelled" }).map((d) => d._id);
                expect(count).to.equal(ids.length);
                testColl.removeJobs(ids, function (err3, res3) {
                  if (err3) { done(err3); }
                  if (!res3) { done("removeJobs Failed"); }
                  ids = testColl.find({ type: jobType });
                  expect(0).to.equal(ids.count());
                  done();
                });
              });
            }
          }));
        }
        return result;
      })();
    }).timeout(5000);

    it("should have a forever repeating job with 'schedule' and 'until'", function (done) {
      let counter = 0;
      const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
      const job = new Job(testColl, jobType, { some: "data" })
        .repeat({
          until: new Date(new Date().valueOf() + 3500),
          schedule: testColl.later.parse.text("every 1 second")
        })
        .delay(1000);
      job.save(function (err, res) {
        if (err) { test.fail(err); }
        assert.ok(validId(res), "job.save() failed in callback result");
        const q = testColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
          counter += 1;
          if (counter === 1) {
            expect(jobResult.doc._id).to.equal(res);
          } else {
            expect(jobResult.doc._id).to.not.equal(res);
          }
          jobResult.done({}, { repeatId: true });
          return cb();
        });
        let ev; // eslint-disable-line prefer-const
        const listener = () => {
          if (counter === 2) {
            job.refresh(function () {
              expect(job._doc.status).to.equal("completed");
              q.shutdown({ level: "soft", quiet: true }, function () {
                ev.removeListener("jobDone", listener);
                done();
              });
            });
          }
        };
        ev = testColl.events.on("jobDone", listener);
        return ev;
      });
    }).timeout(4000);
  }

  it("should run shutdownJobServer on the job collection", function (done) {
    testColl.shutdownJobServer({ timeout: 1 }, function (err, res) {
      if (err) { done(err); }
      expect(res, true, "shutdownJobServer failed in callback result");
      if (Meteor.isServer) {
        expect(testColl.stopped, "shutdownJobServer didn't stop job collection").to.not.equal(false);
      }
      done();
    });
  });

  if (Meteor.isClient) {
    it("should run startJobServer on remote job collection", function (done) {
      remoteServerTestColl.startJobServer(function (err, res) {
        if (err) { done(err); }
        expect(res, "startJobServer failed in callback result").to.equal(true);
        done();
      });
    });

    it("should create a job and see that it is added to a remote server collection and runs", function (done) {
      const jobType = `TestJob_${Math.round(Math.random() * 1000000000)}`;
      const job = new Job(remoteServerTestColl, jobType, { some: "data" });
      assert.ok(validJobDoc(job.doc));
      return job.save(function (err, res) {
        if (err) { done(err); }
        assert.ok(validId(res), "job.save() failed in callback result");
        const q = remoteServerTestColl.processJobs(jobType, { pollInterval: 250 }, function (jobResult, cb) {
          expect(jobResult._doc._id).to.equal(res);
          jobResult.done();
          cb();
          q.shutdown({ level: "soft", quiet: true }, () => done());
        });
      });
    });

    it("should run shutdownJobServer on remote job collection", function (done) {
      remoteServerTestColl.shutdownJobServer({ timeout: 1 }, function (err, res) {
        if (err) { done(err); }
        expect(res, "shutdownJobServer failed in callback result").to.equal(true);
        done();
      });
    });
  }
});
