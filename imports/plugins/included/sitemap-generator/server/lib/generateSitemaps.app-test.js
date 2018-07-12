import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { Factory } from "meteor/dburles:factory";
import { sinon } from "meteor/practicalmeteor:sinon";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Sitemaps } from "../../lib/collections/Sitemaps";
import generateSitemaps from "./generateSitemaps";

describe("generateSitemaps", () => {
  let sandbox;
  let primaryShop;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    primaryShop = Factory.create("shop");
    sandbox.stub(Reaction, "getPrimaryShopId", () => primaryShop._id);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should throw not-found error if invalid shopId is passed", () => {
    expect(() => generateSitemaps(["FAKE_SHOP_ID"])).to.throw(Meteor.Error, /not-found/);
  });

  it("should generate the correct number of sitemap documents", () => {
    // Remove sitemaps
    Sitemaps.remove({});

    // Create a visible tag and product for our primary shop
    Factory.create("tag", { shopId: primaryShop._id });
    Factory.create("product", { shopId: primaryShop._id });

    generateSitemaps([], 1); // 1 URL per sitemap

    /**
     * At this point, we should have the following sitemaps:
     * sitemap.xml
     * sitemap-pages-1.xml
     * sitemap-products-1.xml
     * sitemaps-tags-1.xml
     */

    const sitemapsCount = Sitemaps.find({ shopId: primaryShop._id }).count();
    expect(sitemapsCount).to.equal(4);
  });

  it("should not include deleted/non-visible products in sitemaps", () => {
    Sitemaps.remove({});
    Factory.create("tag", { shopId: primaryShop._id });
    Factory.create("product", { shopId: primaryShop._id });

    // Create a deleted/non-visible tag and product
    Factory.create("tag", { shopId: primaryShop._id, isVisible: false, isDeleted: true });
    Factory.create("product", { shopId: primaryShop._id, isVisible: false, isDeleted: true });

    generateSitemaps([], 1); // 1 URL per sitemap

    const sitemapsCount = Sitemaps.find({ shopId: primaryShop._id }).count();
    expect(sitemapsCount).to.equal(4);
  });
});
