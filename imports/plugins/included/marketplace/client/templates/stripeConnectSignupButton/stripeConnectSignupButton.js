import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";

// TODO: This button should be a React component.

Template.stripeConnectSignupButton.onCreated(function () {
  this.autorun(() => {
    // TODO: this should probably be managed by a subscription?
    // Seems inefficient to do it at the button component level
    Meteor.subscribe("SellerShops");
  });
});

// Button
Template.stripeConnectSignupButton.helpers({
  /**
   * Give it a size and style
   * @return {String} The classes
   */
  classes() {
    const classes = [
      (this.type || "btn-info"),
      (this.size || "")
    ];

    return classes.join(" ");
  }
});

Template.stripeConnectSignupButton.events({
  "click [data-event-action='button-click-stripe-signup']": function () {
    const sellerShop = Reaction.getSellerShop();

    const email = sellerShop.emails[0].address;
    const country = sellerShop.addressBook[0].country;
    const phoneNumber = sellerShop.addressBook[0].phone;
    const businessName = sellerShop.addressBook[0].company;
    const streetAddress = sellerShop.addressBook[0].address1;
    const city = sellerShop.addressBook[0].city;
    const state = sellerShop.addressBook[0].state;
    const zip = sellerShop.addressBook[0].postal;

    const autofillParams = `&stripe_user[email]=${email}&stripe_user[country]=${country}&stripe_user[phone_number]=${phoneNumber}&stripe_user[business_name]=${businessName}&stripe_user[street_address]=${streetAddress}&stripe_user[city]=${city}&stripe_user[state]=${state}&stripe_user[zip]=${zip}`; // eslint-disable-line max-len
    // TODO: Should client_id be hardcoded in here?
    window.location.href = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_32D88BD1qLklliziD7gYQvctJIhWBSQ7&scope=read_write" + autofillParams;
  }
});
