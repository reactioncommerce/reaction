import ReactionService from "/imports/node-app/core/ReactionService";
import getFulfillmentMethodsWithQuotes from "/imports/plugins/core/shipping/server/no-meteor/util/getFulfillmentMethodsWithQuotes";

export default class ReactionFulfillmentService extends ReactionService {
  constructor(options) {
    super(options);

    this.fulfillmentMethodQuoteFunctions = [];
  }

  /**
   * @summary Called by plugins that provide fulfillment features
   * @param {Object} options Plugin options
   * @returns {undefined}
   */
  configurePlugin(options) {
    const { fulfillmentMethodQuoteFunctions } = options;

    if (Array.isArray(fulfillmentMethodQuoteFunctions)) {
      this.fulfillmentMethodQuoteFunctions.push(...fulfillmentMethodQuoteFunctions);
    }
  }

  getFulfillmentMethodsWithQuotes = (...args) =>
    getFulfillmentMethodsWithQuotes(this.fulfillmentMethodQuoteFunctions, ...args);
}
