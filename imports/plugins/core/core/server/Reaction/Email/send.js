import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs } from "/lib/collections";

/**
 * @method send
 * @memberof Email
 * @summary Add send e-mail job to job queue.
 * The worker will then process it immediately (in batches of up to 10) and will retry failures up to 5 times
 * (waiting 3 mins between each try) before failing completely.
 * All email sending attempts are logged in the job collection.
 * @see (Job API doc) https://github.com/vsivsi/meteor-job-collection/#user-content-job-api
 * @example Reaction.Email.send({
    from: 'me@example.com',
    to: 'you@example.com',
    subject: 'RE: new email API',
    html: SSR.render('some-name', { shopUrl: Reaction.absoluteUrl() })
  });
 * @param  {Object} options - object containing to/from/subject/html String keys
 * @return {Boolean} returns job object
 */
export default function send(options) {
  return new Job(Jobs, "sendEmail", options)
    .retry({
      retries: 5,
      wait: 3 * 60000
    }).save();
}
