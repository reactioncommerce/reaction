import { Random } from "meteor/random";
import { expect } from "meteor/practicalmeteor:chai";
import { Factory } from "meteor/dburles:factory";
import { sinon } from "meteor/practicalmeteor:sinon";
import { PublicationCollector } from "meteor/johanbrook:publication-collector";
import * as Collections from "/lib/collections";
import Fixtures from "/imports/plugins/core/core/server/fixtures";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { createActiveShop } from "/imports/plugins/core/core/server/fixtures/shops";

Fixtures();

describe("Tags Publication", () => {
  let sandbox;
  let collector;
  let primaryShop;
  let shop;
  let tags;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    collector = new PublicationCollector({ userId: Random.id() });

    primaryShop = createActiveShop();
    shop = Factory.create("shop");

    sandbox.stub(Reaction, "getPrimaryShopId", () => primaryShop._id);

    Collections.Tags.remove({});

    tags = [1, 2, 3].map(() => {
      const tag = createTag({ shopId: primaryShop._id });
      Collections.Tags.insert(tag);
      return tag;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("ensures our test is set up properly", () => {
    expect(primaryShop._id).to.not.equal(shop._id);
  });

  it("returns all Tags when the current shop is the Primary Shop", (done) => {
    // create a tag for a Merchant Shop
    const tag = createTag({ shopId: shop._id });
    Collections.Tags.insert(tag);

    const expectedTags = [...tags, tag];

    sandbox.stub(Reaction, "getShopId", () => primaryShop._id);

    collector.collect("Tags", (collections) => {
      const collectionTags = collections.Tags;

      expect(collectionTags.map((t) => t.name))
        .to.eql(expectedTags.map((t) => t.name));
    }).then(() => done()).catch(done);
  });

  it("scopes the list of Tags to the current merchant shop", (done) => {
    // create a tag for a Merchant Shop
    const tag = createTag({ shopId: shop._id });
    Collections.Tags.insert(tag);

    sandbox.stub(Reaction, "getShopId", () => shop._id);

    collector.collect("Tags", (collections) => {
      const collectionTags = collections.Tags;

      expect(collectionTags.map((t) => t.name))
        .to.eql([tag.name]);
    }).then(() => done()).catch(done);
  });

  function randomString() {
    return Math.random().toString(36);
  }

  function createTag(tagData = {}) {
    return Object.assign({
      name: randomString(),
      slug: randomString(),
      isTopLevel: true
    }, tagData);
  }
});
