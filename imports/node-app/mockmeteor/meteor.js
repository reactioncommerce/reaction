import ReactionError from "@reactioncommerce/reaction-error";

export const Meteor = {
  Error: ReactionError,
  isAppTest: false,
  isClient: false,
  isServer: true,
  isTest: false,
  settings: {
    public: {}
  }
};
