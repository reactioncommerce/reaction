const accounting = require("accounting-js");
import $ from "jquery";
require("autonumeric");

/**
 * numericInput onCreated
 */
Template.numericInput.onCreated(() => {
  const template = Template.instance();

  // Initial method for autoNumeric field
  template.autoNumericFieldState = "init";
});

/**
 * numericInput onRendered
 * @summary attaches "autoNumeric" to the input element of this template
 */
Template.numericInput.onRendered(() => {
  const template = Template.instance();

  template.autorun(() => {
    const data = Template.currentData();

    Meteor.call("shop/getLocale", (error, result) => {
      if (_.isObject(result)) {
        // Set options
        const options = Object.assign({},
          result.currency,
          {
            minValue: "0.00",
            maxValue: "999999999.99"
          },
          data
        );

        $(template.find("input")).autoNumeric(template.autoNumericFieldState, {
          aSep: options.thousand,
          dGroup: options.grouping,
          aSign: options.symbol,
          aDec: options.decimal,
          vMax: accounting.toFixed(options.maxValue, 2),
          vMin: accounting.toFixed(options.minValue, 2),
          wEmpty: "sign"
        });

        // Subsquent calls runs will update autoNumeric on our field, instead of init
        template.autoNumericFieldState = "update";
      }
    });
  });
});
