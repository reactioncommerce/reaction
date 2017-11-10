import { Meteor } from "meteor/meteor";
import "./methods";
import Startup from "./startup";
import Security from "./security";
import { Logger } from "/server/api";

// handle any unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  // If we get an error from the Mongo driver because something tried to drop all
  // documents in a collection before it existed, log it out as debug info.
  // Otherwise, log whatever happened as an error.
  if (err.name === "MongoError" && err.message === "ns not found") {
    Logger.debug("Attempted to remove document from Mongo collection that doesn't exist yet");
    Logger.debug(err);
  } else {
    Logger.error(err);
  }
});

Meteor.startup(() => {
  Startup();
  Security();
});
