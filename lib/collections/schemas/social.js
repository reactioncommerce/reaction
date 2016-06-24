import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "./registry";

/*
 * Settings for Social Package
 */
export const SocialProvider = new SimpleSchema({
  profilePage: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    label: "Profile Page",
    optional: true
  },
  enabled: {
    type: Boolean,
    defaultValue: false,
    optional: true
  }
});

export const SocialPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.public": {
      type: Object,
      optional: true
    },
    "settings.public.apps": {
      type: Object,
      label: "Social Settings",
      optional: true
    },
    "settings.public.apps.facebook": {
      type: SocialProvider,
      optional: true
    },
    "settings.public.apps.facebook.appId": {
      type: String,
      regEx: /\d+/,
      label: "App Id",
      optional: true
    },
    "settings.public.apps.facebook.appSecret": {
      type: String,
      regEx: /[\da-z]+/,
      label: "App Secret",
      optional: true
    },
    "settings.public.apps.twitter": {
      type: SocialProvider,
      optional: true
    },
    "settings.public.apps.twitter.username": {
      type: String,
      optional: true
    },
    "settings.public.apps.pinterest": {
      type: SocialProvider,
      optional: true
    },
    "settings.public.apps.googleplus": {
      type: SocialProvider,
      label: "Google+",
      optional: true
    }
  }
]);
