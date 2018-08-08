import { Session } from "meteor/session";
import {
  DEFAULT_LAYOUT,
  DEFAULT_WORKFLOW,
  INDEX_OPTIONS,
  ITEMS_INCREMENT
} from "./defaults";

/**
 * Set Reaction layout defaults
 */
Session.setDefault("DEFAULT_LAYOUT", DEFAULT_LAYOUT);
Session.setDefault("DEFAULT_WORKFLOW", DEFAULT_WORKFLOW);
Session.setDefault("INDEX_OPTIONS", INDEX_OPTIONS);
Session.setDefault("productScrollLimit", ITEMS_INCREMENT);
