import { Session } from "meteor/session";

/**
 * Misc. App. Configuration
 *
 * A place to put misc. package configurations
 */

ITEMS_INCREMENT = 24;
// sets default number of product displayed on a grid
Session.setDefault("productScrollLimit", ITEMS_INCREMENT);
