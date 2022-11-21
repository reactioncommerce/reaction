import { MongoClient } from "mongodb";
// eslint-disable-next-line node/no-extraneous-import
import { MongoMemoryServer } from "mongodb-memory-server";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import setPromotionState from "./setPromotionState.js";

let con;
let mongoServer;
let db;
let promotions;

const promotionShouldBeActive = {
  shopId: "shop1",
  state: "created",
  enabled: true,
  startDate: new Date("2022/12/01"),
  endDate: null
};

const promotionShouldBeCompleted = {
  shopId: "shop1",
  state: "active",
  startDate: new Date("2022/01/01"),
  endDate: new Date("2022/02/01")
};

jest.mock("../utils/getCurrentShopTime.js", () => () => ({ shop1: new Date("2022/12/31") }));


describe("setPromotionState", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    con = await MongoClient.connect(mongoServer.getUri(), {});
    db = con.db(mongoServer.instanceInfo.dbName);
    promotions = db.collection("Promotions");
    mockContext.collections.Promotions = promotions;
  });

  afterAll(async () => {
    if (con) {
      await con.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return 0 when no records match", async () => {
    promotions.removeMany({});
    const { totalMarkedCompleted, totalMadeActive } = await setPromotionState(mockContext);
    expect(totalMarkedCompleted).toEqual(0);
    expect(totalMadeActive).toEqual(0);
  });


  it("should return 1 for made active when 1 valid record exists", async () => {
    promotions.removeMany({});
    await promotions.insertOne(promotionShouldBeActive);
    const { totalMarkedCompleted, totalMadeActive } = await setPromotionState(mockContext);
    expect(totalMarkedCompleted).toEqual(0);
    expect(totalMadeActive).toEqual(1);
  });

  it("should return 1 for marked completed when 1 valid record exists", async () => {
    promotions.removeMany({});
    await promotions.insertOne(promotionShouldBeCompleted);
    const { totalMarkedCompleted, totalMadeActive } = await setPromotionState(mockContext);
    expect(totalMarkedCompleted).toEqual(1);
    expect(totalMadeActive).toEqual(0);
  });
});
