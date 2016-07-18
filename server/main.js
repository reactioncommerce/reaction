import "./methods"; // TODO: refactor all of the methods to use import/export
import Startup from "./startup";
import Security from "./security";

Meteor.startup(() => {
  Startup();
  Security();
});
