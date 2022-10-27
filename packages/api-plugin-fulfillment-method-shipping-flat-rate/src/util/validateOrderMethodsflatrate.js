/**
 * @summary Sample dummy function validating the data requirements for this metod
 * @param {Object} context - Context
 * @param {Object} commonOrder - Current order which provide available details to perform validation
 * @param {Object[]} validationResults - Existing validation Results
 * @returns {Object[]} validationResults - with the validation details populated
 */
export default function validateOrderMethodsFlatRate(context, commonOrder, validationResults = []) {
  // Add the code here to verify the data requirements of this particular plugin
  // Sample template for returning any identified errors is as below
  // If no errors, return the "validationResults" array as it is.
  // Commented out below code to avoid placeOrder getting this error. Code retained for demo purpose.

  // const validationResult = {
  //   errorName: "invalid",
  //   errorType: "ReactionError",
  //   errorField: "Flatrate shipping - some field",
  //   fieldValue: "field-value",
  //   errorMessage: "Customer address not available to decide shipping address"
  // };
  // validationResults.push(validationResult);

  return validationResults;
}
