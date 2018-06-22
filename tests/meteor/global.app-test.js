import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";

before(function () {
  this.timeout(6000);
  let numPackages = 0;
  while (numPackages === 0) {
    numPackages = Packages.find({}).count();
    Logger.debug(`there are ${numPackages} packages loaded`);
    Meteor._sleepForMs(500);
  }
});
