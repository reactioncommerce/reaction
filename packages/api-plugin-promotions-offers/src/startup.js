/**
 * @summary handle cart events
 * @param {Object} context - The per request application context
 * @returns {undefined} undefined
 */
export default function registerCartHandler(context) {
  const { appEvents, promotionContext } = context;

  promotionContext.registerTrigger("offers", (context, cart) => {
    console.log("offers trigger");
    return true;
  });
}
