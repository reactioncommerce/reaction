import ReactionError from "../../../imports/plugins/core/graphql/server/ReactionError";

export const Meteor = {
  Error: ReactionError,
  isClient: false,
  isServer: true,
  settings: {
    public: {}
  }
};
