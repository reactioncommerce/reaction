import { Reaction } from "/client/modules/core";
import { Router } from "/client/modules/router";

// Legacy globals
// TODO: add deprecation warnings
ReactionCore = Reaction;
ReactionRouter = Router;

export {
  Reaction,
  Router
};

export * from "/client/modules/i18n";
export { default as Logger } from "/client/modules/logger";
