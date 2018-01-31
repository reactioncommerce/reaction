import { Meteor } from "meteor/meteor";
import "./methods";
import Startup from "./startup";
import Security from "./security";
import { Logger } from "/server/api";

// handle any unhandled Promise rejections because
// Node 8 no longer swallows them
process.on("unhandledRejection", (err) => {
  Logger.error(err);
});

Meteor.startup(() => {
  Startup();
  Security();
});
