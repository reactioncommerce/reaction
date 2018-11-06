# Address Validation Test Plugin

## Purpose

The goal of this plugin is to serve as a guide for developers building custom plugins for address validation services and to provided developers building custom address validation UI a mock validation endpoint to develop againts without needing a legitimate address validation service.

## Creating an address validation service plugin.
When dealing with address validation we suggest using a 3rd party validation service that specalizes in taxes, payments or shpping (e.g., [shippo](https://goshippo.com/), [Radial](https://www.radial.com/), [Avalara](https://www.avalara.com/us/en/index.html), [TaxJar](https://www.taxjar.com/)). Your custom plugin will create an interface between Reaction's `addressValidation` query and your validation solution. After properly registering your custom plugin, your validation service should be avalible within the operator UI under the Shop panel.

### Writing an address validation function
When creating your custom plugin following a similar folder structure as this example plugin with a server dierctory and a `addressValidation.js` file.

A simple validation method might look as such:
```js
import { resolveAddress } from "some-validation-sdk";

export default async function addressValidation({ address }) {
  const validationResults = await resolveAddress(address);
  
  // if the address is valid return emptry results.
  if (validationResults.isValid) return { suggestedAddresses: [], validationErrors: [] };
  return {
    suggestedAddresses: validationResults.validatedAddresses,
    validationErrors: validationResults.messages
  }
}
```

### Formating validation results
More than likely your validation solution results with a differ from the `AddressValidationResults` shcema stucture. In this case you'll need to create a tranform function to normilize the data stucture for the query. See the GQL [Address Schema](https://github.com/reactioncommerce/reaction/blob/feat-aldeed-address-validation-graphql/imports/plugins/core/address/server/no-meteor/schemas/schema.graphql).

A simple results transform method might look as such:
``` ``js
import { resolveAddress } from "some-validation-sdk";

function validationErrorsTransform(errors) {
  return errors.map(err) => ({
    type: err.severity,
    source: err.code,
    summary: err.title,
    details: err.message
  });
}

export default async function addressValidation({ address }) {
  const validationResults = await resolveAddress(address);
  
  // if the address is valid return emptry results.
  if (validationResults.isValid) return { suggestedAddresses: [], validationErrors: [] };
  return {
    suggestedAddresses: validationResults.validatedAddresses,
    validationErrors: validationErrorsTransform(validationResults.messages)
  }
}
```

### Registering an address validation plugin.
To register your custom plugin to Reaction's plugin system you need to create a `register.js` file in your plugin's root directory and pass the plugin configuration to `Reaction.registerPackage`. Within this config you'll also need to set an `addressValidationServices` property that will make your address validation service avalible to Reaction's address system.

Exmaple plugin registration:
```js
import Reaction from "/imports/plugins/core/core/server/Reaction";
import addressValidation from "./server/addressValidation.js";

Reaction.registerPackage({
  label: "Great Validation Service",
  name: "great-validation-service",
  autoEnable: true,
  addressValidationServices: [
    {
      displayName: "Great Validation",
      functions: {
        addressValidation
      },
      name: "great",
      supportedCountryCodes: ["US", "CA", "DE", "IN"]
    }
  ]
});

```

**`addressValidationServices` service API**
  * **displayName**: The validation service name shown in the operator UI.
  * **functions**: Object of validation methods. (i.e., address validation methods need to be keyed by `addressValidation`)
  * **name**: Operator UI form name.
  * **supportedCountryCodes**: An array of all countries the plugin supports. These options can be selected from the operator UI, if none are selected the entire list will be applied.
  
  
The `addressValidationServices` property is key to making your plugin avalible to Reaction's address system, once this step is completed you can restart Reaction, enable your validation service from the Shop operator panel and start testing your service via the `addressValidation` GQL query.

## Using this plugin to build address validation UI
We wanted to provide a way for developers to build address validation UI using the `addressValidation` query without havig to choose, configure and write a validation serivce plugin. Then running Reaction locally or in `development` mode the Address Validation Test plugin will become avalible within the operators Shop panel. Once this test plugin is enabled all addresses execpt those with postal codes begining with "9" will return some sort of validation results/errors. The amount of `suggestedAddresses` that get returned is based on the first number of the postal code (e.g, "10234" = 1 suggested address, "20234" = 2 suggested address, etc). Similarly the `validationErrors` will return an amount based of the second number of the postal code (e.g., "10234" = 1 validation error, "11234" = 2 validation errors, etc).
