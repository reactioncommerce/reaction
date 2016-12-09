import { Meteor } from "meteor/meteor";

// Export Reaction using commonJS style for common libraries to use Reaction easily
// https://docs.meteor.com/packages/modules.html#CommonJS
let Core;

if (Meteor.isServer) {
  Core = require("/server/api");
} else if (Meteor.isClient) {
  Core = require("/client/api");
}

const Reaction = Core.Reaction;

export {
  Reaction
};
