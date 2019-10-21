import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const account = importAsString("./account.graphql");
const group = importAsString("./group.graphql");
const inviteShopMember = importAsString("./inviteShopMember.graphql");
const role = importAsString("./role.graphql");

export default [account, group, inviteShopMember, role];
