import Logger from "@reactioncommerce/logger";

/**
 * @summary Sends an email about an order.
 * @param {Object} context App context
 * @param {Object} order - The order document
 * @param {String} [action] - The action triggering the email
 * @returns {Boolean} True if sent; else false
 */
export default async function sendOrderEmail(context, order, action) {
  // anonymous account orders without emails.
  const to = order.email;
  if (!to) {
    Logger.info("No order email found. No email sent.");
    return false;
  }

  const dataForEmail = {};
  const getDataForOrderEmailFns = context.getFunctionsOfType("getDataForOrderEmail");
  for (const getDataForOrderEmailFn of getDataForOrderEmailFns) {
    const someData = await getDataForOrderEmailFn(context, { order }); // eslint-disable-line no-await-in-loop
    Object.assign(dataForEmail, someData);
  }

  const language = await getLanguageForOrder(context, order);

  await context.mutations.sendOrderEmail(context, {
    action,
    dataForEmail,
    fromShop: dataForEmail.shop,
    language,
    to
  });

  return true;
}

/**
 * @summary Returns language to be used for order emails.
 *          If cart is account based and has set language
 *          then returns that language, else order language.
 * @param {Object} context App context
 * @param {Object} order - The order document
 * @returns {String} i18n language code
 */
async function getLanguageForOrder(context, { ordererPreferredLanguage, accountId }) {
  const { collections: { Accounts } } = context;
  // if order is anonymous return order language
  if (!accountId) {
    return ordererPreferredLanguage;
  }

  const account = await Accounts.findOne({ _id: accountId }, { "profile.language": 1 });
  return (account && account.profile && account.profile.language) || ordererPreferredLanguage;
}
