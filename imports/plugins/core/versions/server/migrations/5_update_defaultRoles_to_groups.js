import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Migrations } from "meteor/percolate:migrations";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Accounts, Groups, Shops } from "/lib/collections";

Migrations.add({
  version: 5,
  up() {
    // Deprecated
  },
  down() {
    // Deprecated
  }
});
