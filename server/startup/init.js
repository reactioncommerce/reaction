import { Reaction, Logger } from "/server/api";
import LoadData from "./load-data";

/*
 * Execute start up fixtures
 */

export default function () {
  // load fixture data
  LoadData();
  // initialize Reaction
  Reaction.init();
  // we've finished all reaction core initialization
  Logger.info("Reaction initialization finished.");
}
