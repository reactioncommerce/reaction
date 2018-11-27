import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { Factory } from "meteor/dburles:factory";
import { sinon } from "meteor/practicalmeteor:sinon";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Products, Shops, Tags } from "/lib/collections";
import { Sitemaps } from "../../lib/collections/sitemaps";
import generateSitemaps from "./generate-sitemaps";

describe("generateSitemaps", () => {
  let sandbox;
  let primaryShop;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    primaryShop = Factory.create("shop");
    sandbox.stub(Reaction, "getPrimaryShopId", () => primaryShop._id);
  });

  afterEach(() => {
    const { _id: shopId } = primaryShop;
    Shops.remove({ _id: shopId });
    Sitemaps.remove({ shopId });
    Products.remove({ shopId });
    Tags.remove({ shopId });
    sandbox.restore();
  });

  it("should throw not-found error if invalid shopId is passed", () => {
    expect(() => generateSitemaps({ shopIds: ["FAKE_SHOP_ID"] })).to.throw(Meteor.Error, /not-found/);
  });

  it("should generate the correct number of sitemap documents", () => {
    const { _id: shopId } = primaryShop;

    // Create a visible tag and product for our primary shop
    Factory.create("tag", { shopId });
    Factory.create("product", { shopId });

    generateSitemaps({ urlsPerSitemap: 1 }); // 1 URL per sitemap

    /**
     * At this point, we should have the following sitemaps:
     * sitemap.xml
     * sitemap-pages-1.xml
     * sitemap-products-1.xml
     * sitemaps-tags-1.xml
     */

    const sitemapsCount = Sitemaps.find({ shopId }).count();
    expect(sitemapsCount).to.equal(4);
  });

  it("should create sitemaps for primary shop if no shop _id is given", () => {
    const { _id: shopId } = primaryShop;

    Sitemaps.remove({});

    Factory.create("product", { shopId });

    generateSitemaps({ urlsPerSitemap: 1 }); // 1 URL per sitemap

    const sitemap = Sitemaps.findOne({});
    expect(sitemap).to.be.an("object");
    expect(sitemap.shopId).to.equal(shopId);
  });

  it("should not include deleted/non-visible products in sitemaps", () => {
    const { _id: shopId } = primaryShop;

    Factory.create("tag", { shopId });
    Factory.create("product", { shopId });

    // Create a deleted/non-visible tag and product
    Factory.create("tag", { shopId, isVisible: false, isDeleted: true });
    Factory.create("product", { shopId, isVisible: false, isDeleted: true });

    generateSitemaps({ urlsPerSitemap: 1 }); // 1 URL per sitemap

    const sitemapsCount = Sitemaps.find({ shopId }).count();
    expect(sitemapsCount).to.equal(4);
  });

  it("should create sitemaps with the correct number of URLs per each", () => {
    const { _id: shopId } = primaryShop;
    const shopFields = { shopId };

    // Create 4 visible products
    for (let inc = 0; inc < 4; inc += 1) {
      Factory.create("product", shopFields);
    }

    // Create 4 visible tags
    for (let inc = 0; inc < 4; inc += 1) {
      Factory.create("tag", shopFields);
    }

    generateSitemaps({ urlsPerSitemap: 2 }); // 2 URLs per sitemap

    /**
     * @name expectLocTagCount
     * @summary Loads a sitemap's XML by handle for current primary shop, and confirms # of <loc> tags is as expected
     * @private
     * @param {String} handle - Sitemaps handle
     * @param {Number} count - Expected count of <loc> tags in sitemap's XML
     * @returns {undefined}
     */
    const expectLocTagCount = (handle, count) => {
      const sitemapProducts1 = Sitemaps.findOne({ shopId, handle: "sitemap-products-1.xml" });
      expect(sitemapProducts1).to.be.an("object");
      const { xml } = sitemapProducts1;
      expect(xml).to.be.a("string");
      const locTagCount = (xml.match(/<loc>/g) || []).length;
      expect(locTagCount).to.equal(count);
    };

    // Should be 2 product sitemaps - sitemap-products-1.xml, sitemap-products-2.xml
    // Each should have 2 <loc> entries (sitemap location XML tags)
    expectLocTagCount("sitemap-products-1.xml", 2);
    expectLocTagCount("sitemap-products-2.xml", 2);
    expectLocTagCount("sitemap-tags-1.xml", 2);
    expectLocTagCount("sitemap-tags-2.xml", 2);
  });
});
