import getShopLogo from "../util/getShopLogo.js";

/**
 * @method send
 * @memberof Email
 * @summary Add send e-mail job to job queue.
 * The worker will then process it immediately (in batches of up to 10) and will retry failures up to 5 times
 * (waiting 3 mins between each try) before failing completely.
 * All email sending attempts are logged in the job collection.
 * @see (Job API doc) https://github.com/vsivsi/meteor-job-collection/#user-content-job-api
 * @example context.mutations.sendEmail({
    from: 'me@example.com',
    to: 'you@example.com',
    templateName: "someName",
    data: { foo: "bar" }
  });
 * @param {Object} context App context
 * @param  {Object} options - object containing to/from/subject/html String keys
 * @returns {Boolean} returns job object
 */
export default async function sendEmail(context, options) {
  const { collections, bullQueue } = context;
  const { Shops } = collections;

  const { to } = options;
  let { from, fromShop, fromShopId } = options;
  if (!to) throw new Error("sendEmail requires a TO address");
  if (!fromShopId && !fromShop) throw new Error("sendEmail requires fromShop or fromShopId");

  if (!fromShop) {
    fromShop = await Shops.findOne({ _id: fromShopId });
  } else if (!fromShopId) {
    fromShopId = fromShop._id;
  }

  if (!from) {
    const shopEmail = fromShop.emails && fromShop.emails[0] && fromShop.emails[0].address;
    if (!shopEmail) throw new Error("Shop email address not found");

    from = `${fromShop.name} <${shopEmail}>`;
  }

  const jobData = {
    from,
    shopId: fromShopId,
    to
  };

  // For backwards compatibility, options may have `subject` and `html`
  // properties already on it.
  if (options.html) {
    jobData.html = options.html;
    jobData.subject = options.subject;
  } else if (options.templateName) {
    // Automatically add some commonly needed data
    const emailLogo = await getShopLogo(context, fromShop);
    const defaultData = {
      emailLogo,
      shop: fromShop,
      shopId: fromShopId,
      socialLinks: {
        display: false
      }
    };

    const { html, subject } = await context.mutations.renderEmail(context, {
      ...options,
      data: {
        ...defaultData,
        ...(options.data || {})
      },
      shopId: fromShopId
    });
    jobData.html = html;
    jobData.subject = subject;
  }

  await bullQueue.addJob(context, "sendEmail", jobData);
}
