import { Meteor } from "meteor/meteor";
import "./methods";
import Startup from "./startup";
import Security from "./security";

Meteor.startup(() => {
  Startup();
  Security();
});
