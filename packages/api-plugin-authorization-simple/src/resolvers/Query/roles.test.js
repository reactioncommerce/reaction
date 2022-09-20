import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import roles from "./roles.js";

jest.mock("graphql-fields", () => jest.fn().mockName("graphqlFields"));

const shopBase64ID = "cmVhY3Rpb24vc2hvcDpzMTIz"; // reaction/shop:s123

const role1 = "reaction-shipping";
const role2 = "reaction-shipping";
const role3 = "reaction-shipping";

const rolesData = [
  {
    name: "reaction-shipping"
  },
  {
    name: "reaction-shipping"
  },
  {
    name: "reaction-shipping"
  },
  {
    name: "shipping/flatRates"
  },
  {
    name: "discount-codes/customDiscountCodes"
  },
  {
    name: "reaction-auth-net/authnetSettings"
  },
  {
    name: "reaction-social/socialSettings"
  },
  {
    name: "reaction-i18n"
  },
  {
    name: "dashboardPackages"
  },
  {
    name: "dashboard/shippo"
  }
];

test("calls queries.roles with a shopId and returns roles", async () => {
  const rolesQuery = jest.fn().mockName("queries.roles").mockReturnValueOnce(getFakeMongoCursor("roles", rolesData));

  const result = await roles(null, { shopId: shopBase64ID }, {
    queries: { roles: rolesQuery },
    userId: "123"
  });

  expect(result.nodes[0].name).toBe(role1);
  expect(result.nodes[1].name).toBe(role2);
  expect(result.nodes[2].name).toBe(role3);
  expect(rolesQuery).toHaveBeenCalled();
});
