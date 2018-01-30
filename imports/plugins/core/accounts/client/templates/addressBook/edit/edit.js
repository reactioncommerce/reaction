import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { i18next } from "/client/api";

function setWorkingAddress(address) {
  if (address.fullName) {
    const fullName = $("input[name='fullName']");
    fullName.val(address.fullName);
  }
  if (address.city) {
    const city = $("input[name='city']");
    city.val(address.city);
  }
  if (address.postal) {
    const postal = $("input[name='postal']");
    postal.val(address.postal);
  }
  if (address.address1) {
    const address1 = $("input[name='address1']");
    address1.val(address.address1);
  }

  if (address.address2) {
    const address2 = $("input[name='address2']");
    address2.val(address.address2);
  }
  if (address.country) {
    const country = $("select[name='country']");
    country.val(address.country);
  }

  if (address.region) {
    const region = $("select[name='region']");
    region.val(address.region);
  }

  if (address.phone) {
    const phone = $("input[name='phone']");
    phone.val(address.phone);
  }

  if (address.isCommercial) {
    const isCommercial = $("input[name='isCommercial']");
    isCommercial.val(address.isCommercial);
  }
}

Template.addressBookEdit.onRendered(() => {
  const addressState = Session.get("addressState");
  if (addressState.address) {
    setWorkingAddress(addressState.address);
  }
});

/*
 * update address book (cart) form handling
 * onSubmit we need to add accountId which is not in context
 */
AutoForm.hooks({
  addressBookEditForm: {
    onSubmit(insertDoc) {
      const { done, event, template } = this; // provided by AutoForm
      event.preventDefault();
      const addressBook = $(template.firstNode).closest(".address-book");

      function handleError(error) {
        Alerts.toast(i18next.t("addressBookEdit.somethingWentWrong", { err: error.message }), "error");
        done(error);
      }

      Meteor.call("accounts/validateAddress", insertDoc, (err, res) => {
        if (err) return handleError(err);

        // if the address is validated OR the address has already been through the validation process, pass it on
        if (res.validated) {
          Meteor.call("accounts/addressBookUpdate", insertDoc, (error) => {
            if (error) return handleError(error);
            done();
            addressBook.trigger($.Event("showMainView")); // Show the grid
          });
        } else {
          // set addressState and kick it back to review
          const addressState = {
            requiresReview: true,
            address: insertDoc,
            validatedAddress: res.validatedAddress,
            formErrors: res.formErrors,
            fieldErrors: res.fieldErrors
          };
          Session.set("addressState", addressState);
          addressBook.trigger($.Event("addressRequiresReview"));
        }
      });
    }
  }
});
