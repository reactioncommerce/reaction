import { Meteor } from "meteor/meteor";
import "./init.js";
import methods from "./methods";

/**
 * Query functions that do not import or use any Meteor packages or globals. These can be used both
 * by Meteor methods or publications, and by GraphQL resolvers.
 * @namespace Accounts/NoMeteorQueries
 */

Meteor.methods(methods);
