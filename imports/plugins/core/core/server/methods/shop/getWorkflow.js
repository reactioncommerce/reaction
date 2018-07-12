import { check } from "meteor/check";
import { Shops } from "/lib/collections";

/**
 * @name shop/getWorkflow
 * @method
 * @memberof Shop/Methods
 * @summary gets the current shop workflows
 * @param {String} name - workflow name
 * @return {Array} returns workflow array
 */
export default function getWorkflow(name) {
  check(name, String);

  const shopWorkflows = Shops.findOne({
    defaultWorkflows: {
      $elemMatch: {
        provides: name
      }
    }
  }, {
    fields: {
      defaultWorkflows: true
    }
  });
  return shopWorkflows;
}
