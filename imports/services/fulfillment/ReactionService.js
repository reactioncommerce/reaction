import getShippingRates from "../util/getShippingRates";

export default class ReactionService {
  constructor({
    graphqlResolvers,
    graphqlSchemas
  } = {}) {
    this.graphqlResolvers = graphqlResolvers;
    this.graphqlSchemas = graphqlSchemas;
    this.shippingPricesFunctions = [];
  }

  addShippingPricesFunction(func) {
    this.shippingPricesFunctions.push(func);
  }

  getShippingPrices = (...args) => getShippingRates(this.shippingPricesFunctions, ...args);

  start() {
    // In the future this would start the Express app serving
  }
}
