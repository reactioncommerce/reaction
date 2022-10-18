/**
 * @summary Sample dummy function validating the data requirements for this metod
 * @param {Object} context - Context object
 * @param {Object} commonOrder - Current order which provide available details to perform validation
 * @param {Object[]} validationResults - Validation results collected till now
 * @returns {Object[]} validationResults - with the validation details populated
 */
export default function validateOrderMethodsups(context, commonOrder, validationResults = []) {
  // const { items, shippingAddress } = commonOrder;

  const validationResult = {
    errorName: "invalid",
    errorType: "ReactionError",
    errorField: "UPS - some field",
    fieldValue: "field-value",
    errorMessage: "Customer address not available to decide shipping address"
  };

  validationResults.push(validationResult);

  return validationResults;
}
