import importAsString from "@reactioncommerce/api-utils/importAsString.js";

const account = importAsString("./account.graphql");
const adminUIAccess = importAsString("./adminUIAccess.graphql");
const group = importAsString("./group.graphql");
const inviteShopMember = importAsString("./inviteShopMember.graphql");

export default [account, adminUIAccess, group, inviteShopMember];
