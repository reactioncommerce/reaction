import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";

import { Reaction } from "/client/api";
import { userPrefs } from "./main";
import { getUserId } from "./helpers/utils";

/**
 *  Startup Reaction
 *  Init Reaction client
 */
Meteor.startup(() => {
  Reaction.init();
});

// Fine-grained reactivity on only the user preferences
Tracker.autorun(() => {
  const userId = getUserId();
  if (!userId) return;

  const user = Meteor.users.findOne(userId, { fields: { profile: 1 } });
  userPrefs.set((user && user.profile && user.profile.preferences) || undefined);
});
