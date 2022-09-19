/**
 * @summary Sample dummy function validating the data requirements for this metod
 * @param {Object} context - Context object
 * @param {Object} commonOrder - Current order which provide available details to perform validation
 * @param {Object[]} validationResults - Validation results collected till now
 * @returns {Object[]} validationResults - with the validation details populated
 */
export default function validateOrderMethodsstore(context, commonOrder, validationResults = []) {
//   const { items, shippingAddress } = commonOrder;

  const validationResult = {
    errorName: "invalid",
    errorType: "ReactionError",
    errorField: "Store pickup - some field",
    fieldValue: "field-value",
    errorMessage: "Customer address not available to find nearest store"
  };

  validationResults.push(validationResult);

  return validationResults;
}
