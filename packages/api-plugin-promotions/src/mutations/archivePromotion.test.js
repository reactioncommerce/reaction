import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import _ from "lodash";
import archivePromotion from "./archivePromotion.js";
import { ExistingOrderPromotion } from "./fixtures/orderPromotion.js";

const archivedPromotion = _.cloneDeep(ExistingOrderPromotion);
archivedPromotion.state = "archived";

mockContext.collections.Promotions = mockCollection("Promotions");
const findOneResults = {
  value: archivedPromotion
};


mockContext.collections.Promotions.findOneAndUpdate = () => findOneResults;

test("will mark promotion record as archived", async () => {
  const promotionToUpdate = ExistingOrderPromotion;
  const { success, promotion } = await archivePromotion(mockContext, { shopId: promotionToUpdate.shopId, promotion: promotionToUpdate });
  expect(success).toBeTruthy();
  expect(promotion.state).toEqual("archived");
});
