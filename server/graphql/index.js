import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { server } from "./server";

// TODO: Get these settings from the application config.
const port = 4000;
const serverOptions = {
  endpoint: "/",
  subscriptions: "/",
  playground: "/",
  port,
  uploads: null
};

// NOTE: By starting the server here rather than adding it to Meteor via
// connect handlers we're running two separate webservers on different ports.
// That won't be as efficient as adding middleware to the existing Meteor app.
// Initial attempts to inject with connectHandlers didn't work in prototyping,
// but it would be best to use that method.
//
// Bind the specified paths to the Express server running Apollo + GraphiQL
// WebApp.connectHandlers.use(server.express);
//
server.start(serverOptions);
