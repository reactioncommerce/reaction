import { ReactionCore, Logger } from "/server/api";

/*
 * Execute start up fixtures
 */

export default function () {
  ReactionCore.init();
  // we've finished all reaction core initialization
  Logger.info("Reaction initialization finished.");
}
