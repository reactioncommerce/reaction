Template.checkoutAddressBook.onRendered(function () {
  Meteor.call("layout/pushWorkflow", "coreCartWorkflow", "checkoutAddressBook");
});
