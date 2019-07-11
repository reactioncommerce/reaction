import validateInventoryInfo from "./validateInventoryInfo";
import validateProductConfiguration from "./validateProductConfiguration";

export default function validateInventoryPluginResults(results) {
  return results.map((result, index) => {
    if (!result.productConfiguration) {
      return [`[${index}].inventoryPluginResultMissingField[productConfiguration]`];
    }
    let errors = validateProductConfiguration(result.productConfiguration, false, `[${index}].`);
    if (result.inventoryInfo) {
      errors = [...errors, ...validateInventoryInfo(result.inventoryInfo, `[${index}].`)];
    }
    return errors;
  }).reduce((flat, toFlatten) => flat.concat(toFlatten), []);
}
