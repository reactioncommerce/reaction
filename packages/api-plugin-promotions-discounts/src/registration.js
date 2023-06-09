export const discountCalculationMethods = {};

/**
 * @summary register the discount calculation methods
 * @param {Array} params.discountCalculationMethods - The discount calculation methods to register
 * @return {void} undefined
 */
export function registerDiscountCalculationMethod({ discountCalculationMethods: methods }) {
  if (methods) {
    Object.assign(discountCalculationMethods, methods);
  }
}
