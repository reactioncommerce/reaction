import ReactionService from "/imports/services/ReactionService";
import getShippingRates from "./util/getShippingRates";

export default class ReactionFulfillmentService extends ReactionService {
  constructor(options) {
    super(options);

    this.shippingPricesFunctions = [];
  }

  addShippingPricesFunction(func) {
    this.shippingPricesFunctions.push(func);
  }

  getShippingPrices = (...args) => getShippingRates(this.shippingPricesFunctions, ...args);
}
