import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Session } from "meteor/session";
import { $ } from "meteor/jquery";
import { i18next } from "/client/api";


Template.addressBookReview.onCreated(function () {
  const addressState = Session.get("addressState");
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
  fieldErrors: function () {
    const fieldErrors = Template.instance().state.get("fieldErrors");
    return fieldErrors;
  },
  hasAddress2: function () {
    const address = Template.instance().state.get("address");
    const validatedAddress = Template.instance().state.get("validatedAddress");
    return !!address.address2 || !!validatedAddress.address2;
  }
});

Template.addressBookReview.events({
  "click .address-line-copyover": function (event) {
    // set address value to be value from validatedAddress
    const addressKey = event.target.getAttribute("data-key");
    const address = Template.instance().state.get("address");
    const validatedAddress = Template.instance().state.get("validatedAddress");
    address[addressKey] = validatedAddress[addressKey];
    Template.instance().state.set("address", address);
    $(`div.${addressKey}-display`).removeClass("address-invalid-line");
    const selector = `[data-key=${addressKey}]`;
    $(selector).hide();
  },
  "click [data-event-action=saveAddress]": function () {
    const instance = Template.instance();
    const address = instance.state.get("address");
    const addressState = {
      requiresReview: false,
      address: address,
      formErrors: [],
      fieldErrors: {}
    };
    Session.set("addressState", addressState);
    Meteor.call("accounts/addressBookAdd", address, function (error, result) {
      if (error) {
        Alerts.toast(i18next.t("addressBookAdd.failedToAddAddress", { err: error.message }), "error");
        return false;
      }
      if (result) {
        const addressBook = $(instance.firstNode).closest(".address-book");
        addressBook.trigger($.Event("showMainView"));
        return true;
      }
    });
  },
  "click [data-event-action=cancelAddressValidate]": function () {
    const addressBook = $(instance.firstNode).closest(".address-book");
    addressBook.trigger($.Event("showMainView"));
  }
});

