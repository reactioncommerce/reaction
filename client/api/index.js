import { Reaction } from "/client/modules/core";
import Logger from "/client/modules/logger";

// Legacy globals
// TODO: add deprecation warnings
ReactionCore = Reaction;
ReactionRouter = Reaction.Router;

export {
  Reaction,
  Logger
};
