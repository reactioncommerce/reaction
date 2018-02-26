import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { $ } from "meteor/jquery";
import { i18next } from "/client/api";


Template.addressBookReview.onCreated(function () {
  const addressState = Session.get("addressState");
  this.state = new ReactiveDict();
  this.state.set("address", addressState.address);
  this.state.set("originalAddress", addressState.address); // use this to "revert" address changes
  this.state.set("validatedAddress", addressState.validatedAddress);
  this.state.set("formErrors", addressState.formErrors);
  this.state.set("fieldErrors", addressState.fieldErrors);
});

Template.addressBookReview.helpers({
  address() {
    const address = Template.instance().state.get("address");
    return address;
  },
  validatedAddress() {
    const validatedAddress = Template.instance().state.get("validatedAddress");
    return validatedAddress;
  },
  formErrors() {
    const formErrors = Template.instance().state.get("formErrors");
    return formErrors;
  },
  fieldErrors() {
    const fieldErrors = Template.instance().state.get("fieldErrors");
    return fieldErrors;
  },
  hasAddress2() {
    const address = Template.instance().state.get("address");
    const validatedAddress = Template.instance().state.get("validatedAddress");
    return !!address.address2 || !!validatedAddress.address2;
  }
});

Template.addressBookReview.events({
  "mouseover .address-ignore"(event) {
    event.stopPropagation();
  },
  "mouseover .address-invalid-line"(event) {
    // show checkmark when mousing over
    const addressKey = event.target.getAttribute("data-key");
    $(`div .address-invalid-line [data-key=${addressKey}] .address-line-copyover`).show();
  },
  "mouseout .address-invalid-line"(event) {
    // hide checkmark when mousing out
    const addressKey = event.target.getAttribute("data-key");
    $(`div .address-invalid-line [data-key=${addressKey}] .address-line-copyover`).hide();
  },
  "click .address-ignore"(event) {
    // Ignore line but mark it "valid"
    event.stopPropagation();
    const addressKey = event.target.getAttribute("data-key");
    const addressLine = $(`div.${addressKey}-display`);
    $(`div .address-invalid-line [data-key=${addressKey}] .address-line-copyover`).hide();
    $(`div .address-invalid-line [data-key=${addressKey}] .address-ignore`).hide();
    addressLine.removeClass("address-invalid-line");
  },
  "click .address-invalid-line"(event) {
    // set address value to be value from validatedAddress and mark it valid
    const addressKey = event.target.getAttribute("data-key");
    const address = Template.instance().state.get("address");
    const validatedAddress = Template.instance().state.get("validatedAddress");
    address[addressKey] = validatedAddress[addressKey];
    Template.instance().state.set("address", address);
    $(`div .address-invalid-line [data-key=${addressKey}] .address-ignore`).hide();
    const addressLine = $(`div.${addressKey}-display`);
    addressLine.removeClass("address-invalid-line");
    addressLine.addClass("address-valid-line");
  },
  "click [data-event-action=saveAddress]"() {
    const instance = Template.instance();
    const address = instance.state.get("address");
    const addressState = {
      requiresReview: false,
      address,
      formErrors: [],
      fieldErrors: {}
    };
    Session.set("addressState", addressState);
    if (address._id) {
      Meteor.call("accounts/addressBookUpdate", address, (error, result) => {
        if (error) {
          Alerts.toast(i18next.t("addressBookEdit.somethingWentWrong", { err: error.message }), "error");
          return false;
        }
        if (result) {
          const addressBook = $(instance.firstNode).closest(".address-book");
          addressBook.trigger($.Event("showMainView"));
          return true;
        }
      });
    } else {
      Meteor.call("accounts/addressBookAdd", address, (error, result) => {
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
    }
  },
  "click [data-event-action=cancelAddressEdit]"() {
    // set address back to original value before edits
    const originalAddress = Template.instance().state.get("originalAddress");
    const addressState = {
      requiresReview: false,
      address: originalAddress,
      formErrors: [],
      fieldErrors: {}
    };
    Session.set("addressState", addressState);
    const instance = Template.instance();
    const addressBook = $(instance.firstNode).closest(".address-book");
    addressBook.trigger($.Event("addressReviewComplete"));
    return false;
  }
});

