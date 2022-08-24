import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const emailTemplatesQuery = importAsString("./emailTemplatesQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const emailTemplateDocuments = [];
const template = `
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>This is a test email</title>
</head>
<body style="margin:0; padding:0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="emailwrapto100pc">
    <tr>
      <td align="center" valign="middle">
        <p>This is a test email template</p>
      </td>
    </tr>
  </table>
</body>
`;
const emailTemplateData = [{
  name: "orders/new",
  subject: "Your order is confirmed - {{order.referenceId}}",
  template,
  title: "Orders - New Order Placed",
  type: "email"
}, {
  name: "accounts/resetPassword",
  subject: "{{shop.name}}: Here's your password reset link",
  template,
  title: "Accounts - Reset Password",
  type: "email"
}, {
  name: "accounts/verifyEmail",
  subject: "{{shopName}}: Please verify your email address",
  template,
  title: "Accounts - Verify Account",
  type: "email"
}];

// Create 10 test email template documents
for (let index = 0; index < 3; index += 1) {
  const doc = Factory.EmailTemplates.makeOne({
    _id: `emailTemplate-${index}`,
    shopId: internalShopId,
    enabled: true,
    language: "en",
    name: emailTemplateData[index].name,
    parser: "handlebars",
    provides: "template",
    subject: emailTemplateData[index].subject,
    template: emailTemplateData[index].template,
    title: emailTemplateData[index].title,
    type: "email"
  });

  emailTemplateDocuments.push(doc);
}

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:email-templates/read"],
  slug: "admin",
  shopId: internalShopId
});

const customerGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["customer"],
  slug: "customer",
  shopId: internalShopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

const mockCustomerAccount = Factory.Account.makeOne({
  groups: [customerGroup._id],
  shopId: internalShopId
});

let testApp;
let emailTemplates;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  // Delete some templates auto-created by insertPrimaryShop
  await testApp.collections.Templates.deleteMany({});

  // Insert the test templates
  await Promise.all(emailTemplateDocuments.map((doc) => (
    testApp.collections.Templates.insertOne(doc)
  )));

  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.collections.Groups.insertOne(customerGroup);

  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.createUserAndAccount(mockCustomerAccount);

  emailTemplates = testApp.query(emailTemplatesQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("throws access-denied when retrieving email templates if not an admin", async () => {
  await testApp.setLoggedInUser(mockCustomerAccount);

  try {
    await emailTemplates({
      shopId: opaqueShopId
    });
  } catch (errors) {
    expect(errors[0]).toMatchSnapshot();
  }
});

test("returns email template records if user is an admin", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const result = await emailTemplates({
    shopId: opaqueShopId,
    first: 3,
    offset: 0
  });

  expect(result.emailTemplates.nodes.length).toEqual(3);
  expect(result.emailTemplates.nodes[0].name).toEqual("orders/new");
  expect(result.emailTemplates.nodes[2].name).toEqual("accounts/verifyEmail");
  expect(result.emailTemplates.nodes[2].template).toEqual(template);
});
