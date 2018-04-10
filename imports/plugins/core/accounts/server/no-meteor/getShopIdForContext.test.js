import { rewire as rewire$getShopIdByDomain, restore as restore$getShopIdByDomain } from "./getShopIdByDomain";
import getShopIdForContext from "./getShopIdForContext";

beforeAll(() => {
  rewire$getShopIdByDomain(() => "SHOP_ID_BY_DOMAIN");
});

afterAll(restore$getShopIdByDomain);

test("falls back to getShopIdByDomain if context has no user", async () => {
  const result = await getShopIdForContext({});
  expect(result).toBe("SHOP_ID_BY_DOMAIN");
});

test("falls back to getShopIdByDomain if context has user but not activeShopId prop", async () => {
  const result = await getShopIdForContext({ user: { profile: {} } });
  expect(result).toBe("SHOP_ID_BY_DOMAIN");
});

test("uses context user's shop ID if present", async () => {
  const result = await getShopIdForContext({
    user: {
      profile: {
        preferences: {
          reaction: {
            activeShopId: "ACTIVE_SHOP_ID"
          }
        }
      }
    }
  });
  expect(result).toBe("ACTIVE_SHOP_ID");
});
