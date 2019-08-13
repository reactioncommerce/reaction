import { parseNumber, isValidNumber } from "libphonenumber-js";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name formatPhoneNumber
 * @summary prepends country code to phone no. if required
 * @param  {String} phone the original phone no.
 * @param  {String} countryCode the country's code to which the phone no. belongs to
 * @returns {Promise} that resolves to a string - the phone no. with country extension.
 */
export default function formatPhoneNumber(phone, countryCode) {
  try {
    // Phone no. already has the country code attached
    if (isValidNumber(phone)) {
      return phone;
    }

    const parsed = parseNumber(phone, countryCode, { extended: true });
    const { countryCallingCode, phone: phoneNumber } = parsed || {};
    if (phoneNumber && countryCallingCode) {
      // Try attaching the country code to phone number
      return `${countryCallingCode}${phoneNumber}`;
    }
    throw new ReactionError("invalid-parameter", `Incorrect format for phone number ${phone} with country ${countryCode}`);
  } catch (error) {
    throw new ReactionError("invalid-parameter", error);
  }
}
