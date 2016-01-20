
/**
 * numericInput onRendered
 * @summary attaches "autoNumeric" to the input element of this template
 */
Template.numericInput.onRendered(() => {
  const template = Template.instance();

  // Initial initialization on autoNumeric
  $(template.find("input")).autoNumeric("init");

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

        // Update autoNumeric field with currency for current locale
        $(template.find("input")).autoNumeric("update", {
          aSep: options.thousand,
          dGroup: options.grouping,
          aSign: options.symbol,
          aDec: options.decimal,
          vMax: accounting.toFixed(options.maxValue, 2),
          vMin: accounting.toFixed(options.minValue, 2),
          wEmpty: "sign"
        });
      }
    });
  });
});
