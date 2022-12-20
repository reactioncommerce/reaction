import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getCurrentShopTime from "./getCurrentShopTime.js";

const shops = [
  {
    _id: "shop1",
    timezone: "US/Pacific"
  },
  {
    _id: "shop2",
    timezone: "US/Eastern"
  }
];
mockContext.collections.Shops = mockCollection("Shops");
mockContext.collections.Shops.toArray.mockReturnValueOnce(Promise.resolve(shops));

test("returns time for local timezone for all shops", async () => {
  const currentShopTime = await getCurrentShopTime(mockContext);
  const dt1 = currentShopTime.shop1;
  const dt2 = currentShopTime.shop2;
  let diff = (dt1.getTime() - dt2.getTime()) / 1000;
  diff /= (60 * 60);
  expect(Number(diff.toFixed(3))).toEqual(-3);
});
