import { Meteor } from "meteor/meteor";
import "./methods";
import Startup from "./startup";
import Security from "./security";
import { Logger } from "/server/api";

process.on("unhandledRejection", (err) => {
  Logger.error(err);
});

Meteor.startup(() => {
  Startup();
  Security();
});
