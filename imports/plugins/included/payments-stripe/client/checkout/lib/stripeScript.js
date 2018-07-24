import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Logger } from "/client/api";

export const StripeScript = {

  load: _.once(function () {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "//js.stripe.com/v3/";
    document.head.appendChild(script);

    this._checkReady();
  }),

  _checkReady() {
    let i = 0;
    const checkReady = Meteor.setInterval(() => {
      if (typeof window.Stripe !== "undefined") {
        this._loaded.set(true);
        Meteor.clearInterval(checkReady);
      } else {
        i += 100;
        if (i > 10000) {
          // stop checking and warn if the lib isn't loaded within 10 secs
          Meteor.clearInterval(checkReady);
          Logger.warn("Error loading Stripe lib from CDN");
        }
      }
    }, 100);
  },

  _loaded: new ReactiveVar(false),

  loaded() {
    return this._loaded.get();
  }
};
