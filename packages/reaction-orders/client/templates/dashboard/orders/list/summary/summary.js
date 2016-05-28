import { NumericInput } from "meteor/reactioncommerce:reaction-ui";

/**
 * ordersListSummary helpers
 *
 * @returns paymentInvoice
 */
Template.ordersListSummary.helpers({
  invoice: function () {
    return this.invoice;
  },

  numericInputProps(value) {
    const { currencyFormat } = Template.instance().data;

    return {
      component: NumericInput,
      value,
      format: currencyFormat,
      isEditing: false
    };
  }
});
