import { Reaction } from "/server/api";

// set server side locale
Reaction.Locale = Meteor.call("shop/getLocale");
