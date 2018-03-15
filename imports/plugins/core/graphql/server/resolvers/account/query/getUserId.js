import { Meteor } from "meteor/meteor";

export default function getUserId(_, __, context) {
  const userId = context && context.user && context.user._id;
  if (!userId) throw new Meteor.Error("access-denied");
  return userId;
}
