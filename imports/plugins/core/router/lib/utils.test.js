import { getEnabledPackageRoutes } from "./utils";

const fakeShopId = "FAKE_SHOP_ID";
const ReactionLayout = jest.fn().mockName("ReactionLayout");
const testPackage = {
  _id: "FAKE_GROUP_ID",
  shopId: fakeShopId,
  enabled: true,
  layout: [],
  registry: [
    {
      route: "/account/login",
      name: "account/login",
      template: "loginForm"
    },
    {
      route: "/not-found",
      name: "not-found",
      template: "notFoundPage"
    }
  ]
};

test("returns a complete array of the routes in the packages along with shop routes", async () => {
  ReactionLayout.mockReturnValue({
    theme: {},
    structure: {},
    component: () => {}
  });

  const packageRoutes = getEnabledPackageRoutes(ReactionLayout, [testPackage]);
  // a shop route is also created for each of the route defined in the package; hence double
  return expect(packageRoutes.length).toBe(testPackage.registry.length * 2);
});
