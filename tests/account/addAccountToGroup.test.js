// Uncomment after moving "group/addUser" method to a no-meteor mutation

test("addAccountToGroup", () => {});

// import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
// import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
// import TestApp from "../TestApp";
// import Factory from "/imports/test-utils/helpers/factory";
// import AddAccountToGroupMutation from "./AddAccountToGroupMutation.graphql";

// jest.setTimeout(300000);

// let testApp;
// let addAccountToGroup;
// let mockAdminAccount;
// let accountOpaqueId;
// let group;
// let groupOpaqueId;
// beforeAll(async () => {
//   testApp = new TestApp();
//   await testApp.start();
//   const shopId = await testApp.insertPrimaryShop();

//   mockAdminAccount = Factory.Accounts.makeOne({
//     roles: {
//       [shopId]: ["admin"]
//     },
//     shopId
//   });
//   await testApp.createUserAndAccount(mockAdminAccount);

//   group = Factory.Groups.makeOne({ shopId });
//   await testApp.collections.Groups.insert(group);

//   accountOpaqueId = encodeAccountOpaqueId(mockAdminAccount._id);
//   groupOpaqueId = encodeGroupOpaqueId(group._id);

//   addAccountToGroup = testApp.mutate(AddAccountToGroupMutation);
// });

// afterAll(async () => {
//   testApp.stop();
// });

// test("admin can add account to group", async () => {
//   await testApp.setLoggedInUser(mockAdminAccount);

//   let result;
//   try {
//     result = await addAccountToGroup({ accountId: accountOpaqueId, groupId: groupOpaqueId });
//   } catch (error) {
//     expect(error).toBeUndefined();
//     return;
//   }

//   expect(result.addAccountToGroup.group).toEqual(group);

//   const account = await testApp.collections.Accounts.findOne({ _id: mockAdminAccount._id });
//   expect(account.groups).toEqual([]);
// });
