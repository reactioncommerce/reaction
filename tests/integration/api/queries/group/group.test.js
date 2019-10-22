import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import GroupFullQuery from "./GroupFullQuery.graphql";

jest.setTimeout(300000);

/**
 * @param {Object} mongoGroup The Group document in MongoDB schema
 * @returns {Object} The Group document in GraphQL schema
 */
function groupMongoSchemaToGraphQL(mongoGroup) {
  const doc = {
    ...mongoGroup,
    _id: encodeGroupOpaqueId(mongoGroup._id),
    createdAt: mongoGroup.createdAt.toISOString(),
    createdBy: {
      _id: encodeAccountOpaqueId(mongoGroup.createdBy)
    },
    updatedAt: mongoGroup.updatedAt.toISOString()
  };
  delete doc.shopId;
  return doc;
}

let testApp;
let groupQuery;
let mockAdminAccount;
let mockOtherAccount;
let groups;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  const shopId = await testApp.insertPrimaryShop();

  mockAdminAccount = Factory.Account.makeOne({
    roles: {
      [shopId]: ["reaction-accounts"]
    },
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  groups = Factory.Group.makeMany(2, { shopId });
  await testApp.collections.Groups.insertMany(groups);

  mockOtherAccount = Factory.Account.makeOne({
    groups: [groups[0]._id],
    shopId
  });
  await testApp.createUserAndAccount(mockOtherAccount);

  await testApp.collections.Groups.updateMany({}, {
    $set: {
      createdBy: mockOtherAccount._id
    }
  });

  for (let index = 0; index < groups.length; index += 1) {
    groups[index].createdBy = mockOtherAccount._id;
  }

  groupQuery = testApp.query(GroupFullQuery);
});

afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  try {
    await groupQuery({ id: groupMongoSchemaToGraphQL(groups[0])._id });
  } catch (error) {
    expect(error[0].message).toBe("User does not have permissions to view groups");
  }
});

test("authenticated with reaction-accounts role, gets any group", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const expectedGroup = groupMongoSchemaToGraphQL(groups[0]);

  const result = await groupQuery({ id: expectedGroup._id });
  expect(result).toEqual({
    group: expectedGroup
  });

  await testApp.clearLoggedInUser();
});

test("authenticated without reaction-accounts role, gets group they belong to", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  const expectedGroup = groupMongoSchemaToGraphQL(groups[0]);

  const result = await groupQuery({ id: expectedGroup._id });
  expect(result).toEqual({
    group: expectedGroup
  });

  await testApp.clearLoggedInUser();
});

test("authenticated without reaction-accounts role, does not get group they do not belong to", async () => {
  await testApp.setLoggedInUser(mockOtherAccount);

  try {
    await groupQuery({ id: groupMongoSchemaToGraphQL(groups[1])._id });
  } catch (error) {
    expect(error[0].message).toBe("User does not have permissions to view groups");
  }

  await testApp.clearLoggedInUser();
});
