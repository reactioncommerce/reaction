import { checkNpmVersions } from "meteor/tmeasday:check-npm-versions";

checkNpmVersions({
  "react": "15.1.x",
  "react-dom": "15.1.x",
  "meteor-node-stubs": "0.2.x"
}, "reactioncommerce:reaction-ui");

ReactionUI = ReactionUI || {};
