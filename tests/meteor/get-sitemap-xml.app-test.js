import Random from "@reactioncommerce/random";
import { expect } from "meteor/practicalmeteor:chai";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Sitemaps } from "/imports/plugins/included/sitemap-generator/server/lib/collections/sitemaps";
import getSitemapXML from "/imports/plugins/included/sitemap-generator/server/lib/get-sitemap-xml";

before((done) => {
  Reaction.onAppStartupComplete(() => {
    done();
  });
});

describe("getSitemapXML", () => {
  it("should return an empty string if no sitemap by handle for given shop is found", () => {
    Sitemaps.remove({});
    const xml = getSitemapXML("FAKE_SHOP_ID", "FAKE_HANDLE");
    expect(xml).to.equal("");
  });

  it("should return the correct XML for a sitemap", () => {
    const shopId = Random.id();
    const handle = "sitemap.xml";
    const mockSitemap = {
      shopId,
      handle,
      _id: Random.id(),
      xml: "<xml></xml>", // Fake XML
      createdAt: new Date()
    };

    Sitemaps.insert(mockSitemap);

    const xml = getSitemapXML(shopId, handle);
    expect(xml).to.equal(mockSitemap.xml);
  });
});
