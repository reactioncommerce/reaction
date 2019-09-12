import createGroup from "./createGroup";
import updateGroup from "./updateGroup";

/**
 * @file Methods for creating and managing admin user permission groups.
 * Run these methods using `Meteor.call()`.
 * @example Meteor.call("group/createGroup", sampleCustomerGroup, shop._id)
 * @namespace Group/Methods
*/

export default {
  "group/createGroup": createGroup,
  "group/updateGroup": updateGroup
};
