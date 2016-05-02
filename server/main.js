// import Fixtures from "./fixtures";  // TODO: get this working!
// import Methods from "./methods"; // TODO: wrap each file in a closure
// import Publications from "./publications";  // TODO: wrap each file in a closure
import Security from "./security";
import Startup from "./startup";

// Fixtures();
// Methods();
// Publications();
Security();
Meteor.startup(() => Startup());
