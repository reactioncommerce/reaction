import { Reaction } from "/server/api";

export default function () {
  // set server side locale
  Reaction.Locale = Meteor.call("shop/getLocale");
}
