import Twilio from "twilio";
import Nexmo from "nexmo";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Sms, Accounts } from "/lib/collections";
import { Reaction, Logger } from "/server/api";


/**
 * Sms Methods
 */
Meteor.methods({
  /**
   * sms/saveSettings
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
   * sms/send
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

    const user = Accounts.findOne();
    const addressBook = user.profile.addressBook;
    let phone = false;
    // check for addressBook phone
    if (user && addressBook) {
      if (addressBook[0].phone) {
        phone = addressBook[0].phone;
      }
    }

    if (phone) {
      const smsSettings = Sms.findOne();

      if (smsSettings) {
        const { apiKey, apiToken, smsPhone, smsProvider } = smsSettings;
        if (smsProvider === "twilio") {
          Logger.debug("choose twilio");
          const client = new Twilio(apiKey, apiToken);

          client.sendMessage({
            to: phone,
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
          const client = new Nexmo({
            apiKey,
            apiSecret: apiToken
          });
          client.message.sendSms(smsPhone, phone, message, {}, (err) => {
            if (err) {
              return Logger.error(err);
            }
          });
        }
      }
    }
  }
});
