import ReactionError from "../../../imports/plugins/core/graphql/server/no-meteor/ReactionError";

export const Meteor = {
  Error: ReactionError,
  isClient: false,
  isServer: true,
  settings: {
    public: {}
  }
};
