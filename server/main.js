// import Fixtures from "./fixtures";  // TODO: get this working!
import "./methods"; // TODO: refactor all of the methods to use import/export
// import Publications from "./publications";  // TODO: wrap each file in a closure
import Security from "./security";
import Startup from "./startup";

// Fixtures();
// Methods();
// Publications();
Security();
Meteor.startup(() => Startup());
