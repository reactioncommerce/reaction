import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Session } from "meteor/session";


Template.addressBookReview.onCreated(function () {
  const addressState = Session.get("addressState");
  console.log("addressState", addressState);
  this.state = new ReactiveDict();
  this.state.set("address", addressState.address);
  this.state.set("validatedAddress", addressState.validatedAddress);
  this.state.set("formErrors", addressState.formErrors);
  this.state.set("fieldErrors", addressState.fieldErrors);
});

Template.addressBookReview.helpers({
  address: function () {
    const address = Template.instance().state.get("address");
    return address;
  },
  validatedAddress: function () {
    const validatedAddress = Template.instance().state.get("validatedAddress");
    return validatedAddress;
  },
  formErrors: function () {
    const formErrors = Template.instance().state.get("formErrors");
    return formErrors;
  },
  hasAddress2: function () {
    const address = Template.instance().state.get("address");
    const validatedAddress = Template.instance().state.get("validatedAddress");
    return !!address.address2 || !!validatedAddress.address2;
  }
});
