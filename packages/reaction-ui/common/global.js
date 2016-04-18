import { checkNpmVersions } from "meteor/tmeasday:check-npm-versions";

checkNpmVersions({
  "react": "15.0.x",
  "react-dom": "15.0.x",
  "meteor-node-stubs": "0.2.x"
}, "reactioncommerce:reaction-ui");

ReactionUI = ReactionUI || {};
