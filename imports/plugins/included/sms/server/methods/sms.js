import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Sms, Accounts } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import { parse, isValidNumber, getPhoneCode } from "libphonenumber-js";

// We lazy load these in order to shave a few seconds off the time
// it takes Meteor to start/restart the app.
let Twilio;
async function lazyLoadTwilio() {
  if (Twilio) return;
  const mod = await import("twilio");
  Twilio = mod.default;
}

let Nexmo;
async function lazyLoadNexmo() {
  if (Nexmo) return;
  const mod = await import("nexmo");
  Nexmo = mod.default;
}

function formatPhoneNo(phone, country) {
  try {
    // Phone no. already has the country code attached
    if (isValidNumber(phone)) {
      return phone;
    }
    // try attaching the country code to phone no.
    return getPhoneCode(country) + parse(phone, country).phone;
  } catch (error) {
    return phone;
  }
}
/**
 * @file Meteor methods for SMS. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Methods/SMS
*/
Meteor.methods({
  /**
   * @name sms/saveSettings
   * @method
   * @memberof Methods/SMS
   * @summary This save the sms provider settings
   * @param {Object} settings - settings
   * @return {object} returns result
   */
  "sms/saveSettings": (settings) => {
    check(settings, Object);
    settings.shopId = Reaction.getShopId();

    const smsDetails = Sms.find().count();
    if (smsDetails >= 1) {
      return Sms.update({ shopId: Reaction.getShopId() }, {
        $set: settings
      });
    }
    return Sms.insert(settings);
  },

  /**
   * @name sms/send
   * @method
   * @memberof Methods/SMS
   * @summary This send the sms to the user
   * @param {String} message - The message to send
   * @param {String} userId - The user to receive the message
   * @param {String} shopId - The currenct shopId
   * @return {object} returns result
   */
  "sms/send": (message, userId, shopId) => {
    check(message, String);
    check(userId, String);
    check(shopId, String);

    const user = Accounts.findOne({ _id: userId });
    const addressBook = user && user.profile ? user.profile.addressBook : false;
    // check for addressBook phone
    const phone = (Array.isArray(addressBook) && addressBook[0] && addressBook[0].phone) || false;
    const country = (Array.isArray(addressBook) && addressBook[0] && addressBook[0].country) || false;

    if (!phone || !country) return;

    const formattedPhone = formatPhoneNo(phone, country);

    const smsSettings = Sms.findOne({ shopId });
    if (!smsSettings) return;

    const { apiKey, apiToken, smsPhone, smsProvider } = smsSettings;
    if (smsProvider === "twilio") {
      Logger.debug("choose twilio");
      Promise.await(lazyLoadTwilio());
      const client = new Twilio(apiKey, apiToken);
      client.messages.create({
        to: formattedPhone,
        from: smsPhone,
        body: message
      }, (err) => {
        if (err) {
          return Logger.error(err);
        }
      });
      return;
    }

    if (smsProvider === "nexmo") {
      Logger.debug("choose nexmo");
      Promise.await(lazyLoadNexmo());
      const client = new Nexmo({ apiKey, apiSecret: apiToken });
      client.message.sendSms(smsPhone, formattedPhone, message, (err, result) => {
        if (err) {
          Logger.error("Nexmo error", err);
        }

        if (result && Array.isArray(result.messages) && result.messages[0]["error-text"]) {
          Logger.error("Nexmo error sending sms", result.messages[0]["error-text"]);
        }

        Logger.debug(JSON.stringify(result));
      });
    }
  }
});
