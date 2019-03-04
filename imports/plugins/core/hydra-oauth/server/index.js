import { Meteor } from "meteor/meteor";
import { oauthLogin } from "./oauthMethods";

Meteor.methods({
  "oauth/login": oauthLogin
});

// Init endpoints
import "./oauthEndpoints";
