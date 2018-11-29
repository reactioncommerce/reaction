import { Meteor } from "meteor/meteor";
import { oauthLogin } from "./oauthMethods";
import "./init";

Meteor.methods({
  "oauth/login": oauthLogin
});

// Init endpoints
import "./oauthEndpoints";
