Template.localDeliveryLabelPDF.helpers({
  dateHelper: function (date) {
    return moment(date).format('dddd, MM/DD/YYYY');
  },
  shippingAddress: function () {
    return this.shipping[0].address;
  },
  billingPhone: function () {
    return this.billing[0].address.phone;
  },
  shippingPhone: function () {
    return this.shipping[0].address.phone;
  }
});
