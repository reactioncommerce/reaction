import ReactionError from "@reactioncommerce/reaction-error";

export const Meteor = {
  Error: ReactionError,
  isClient: false,
  isServer: true,
  settings: {
    public: {}
  }
};
