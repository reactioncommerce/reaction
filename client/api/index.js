import { Reaction } from "/client/modules/core";
import { Router } from "/client/modules/router";

window.ReactionCore = Reaction;
window.ReactionRouter = Router;

export {
  Reaction,
  Router
};

export * from "/client/modules/i18n";
export { default as Logger } from "/client/modules/logger";
