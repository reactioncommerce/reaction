/* eslint dot-notation:0 */
/* eslint no-loop-func:0 */
/* eslint prefer-arrow-callback:0 */
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Products, Tags } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import ReactionError from "@reactioncommerce/reaction-error";
import { addProduct, addProductSingleVariant } from "/imports/plugins/core/core/server/fixtures/products";
import { getBaseContext } from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

Fixtures();


describe("core product methods", function () {
  // we can't clean Products collection after each test from now, because we
  // have functions which called from async db operations callbacks. So, if we
  // clean collections each time - we could have a situation when next test
  // started, but previous not yet finished his async computations.
  // So, if you need to clean the collection for your test, you could try to do
  // it, but this is not recommended in droves
  let sandbox;
  let updateStub;
  let removeStub;
  let insertStub;

  before(function (done) {
    this.timeout(20000);

    Products.remove({});

    // We sleep until `setBaseContext` has run. I wish there were a better way to
    // do this but Meteor starts app tests whenever it decides to, without waiting
    // for all the startup code to run.
    const handle = Meteor.setInterval(() => {
      if (getBaseContext().queries) {
        Meteor.clearInterval(handle);
        done();
      }
    }, 500);
  });

  after(function () {
    if (updateStub) {
      updateStub.restore();
      removeStub.restore();
      insertStub.restore();
    }
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("products/cloneVariant", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Roles, "userIsInRole", () => false);
      const product = addProduct();
      const variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(1);

      const insertProductSpy = sandbox.spy(Products, "insert");
      expect(() => Meteor.call("products/cloneVariant", product._id, variants[0]._id)).to.throw(ReactionError, /Access Denied/);
      expect(insertProductSpy).to.not.have.been.called;
    });

    it("should clone variant by admin", function () {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const product = addProduct();
      let variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(1);
      Meteor.call("products/cloneVariant", product._id, variants[0]._id);
      variants = Products.find({ ancestors: [product._id] }).count();
      expect(variants).to.equal(2);
    });

    it("number of `child variants` between source and cloned `variants` should be equal", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.find({ ancestors: [product._id] }).fetch();
      let optionCount = Products.find({
        ancestors: {
          $in: [variant[0]._id]
        }
      }).count();
      expect(optionCount).to.equal(2);

      Meteor.call("products/cloneVariant", product._id, variant[0]._id);
      const variants = Products.find({ ancestors: [product._id] }).fetch();
      const clonedVariant = variants.filter((v) => v._id !== variant[0]._id);
      expect(variant[0]._id).to.not.equal(clonedVariant[0]._id);
      expect(_.isEqual(variant[0].ancestors, clonedVariant[0].ancestors)).to.be.true;
      // expect(variant[0].ancestors).to.equal(clonedVariant[0].ancestors);

      optionCount = Products.find({ ancestors: { $in: [clonedVariant[0]._id] } }).count();
      expect(optionCount).to.equal(2);
    });
  });

  describe("products/createVariant", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/createVariant", product._id)).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should create top level variant", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(1);
      Meteor.call("products/createVariant", product._id);
      variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(2);
    });

    it("should create option variant", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let options;
      const product = addProduct();
      const variant = Products.find({ ancestors: [product._id] }).fetch()[0];
      options = Products.find({
        ancestors: { $in: [variant._id] }
      }).fetch();
      expect(options.length).to.equal(2);

      Meteor.call("products/createVariant", variant._id);
      options = Products.find({
        ancestors: { $in: [variant._id] }
      }).fetch();
      expect(options.length).to.equal(3);
    });
  });

  describe("products/deleteVariant", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      const removeProductSpy = sandbox.spy(Products, "remove");
      expect(() => Meteor.call("products/deleteVariant", variant._id)).to.throw(ReactionError, /Access Denied/);
      expect(removeProductSpy).to.not.have.been.called;
    });

    it("should mark top-level variant as deleted", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variant = Products.findOne({ ancestors: [product._id] });
      expect(variant.isDeleted).to.equal(false);
      Meteor.call("products/deleteVariant", variant._id);
      variant = Products.findOne(variant._id);
      expect(variant.isDeleted).to.equal(true);
    });

    it("should mark all child variants (options) as deleted if top-level variant deleted", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.find({ ancestors: [product._id] }).fetch()[0];
      const variants = Products.find({
        ancestors: {
          $in: [variant._id]
        }
      }).fetch();
      expect(variants.length).to.equal(2);
      Meteor.call("products/deleteVariant", variant._id);
    });
  });

  describe("products/cloneProduct", function () {
    // At the moment we do not have any mechanisms that track the product
    // cloning hierarchy, so the only way to track that will be cleaning
    // collection on before each test.
    beforeEach(function () {
      return Products.remove({});
    });

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const insertProductSpy = sandbox.spy(Products, "insert");
      expect(() => Meteor.call("products/cloneProduct", {})).to.throw(ReactionError, /Access Denied/);
      expect(insertProductSpy).to.not.have.been.called;
    });

    it("should clone product", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      expect(Products.find({ type: "simple" }).count()).to.equal(1);
      Meteor.call("products/cloneProduct", product);
      expect(Products.find({ type: "simple" }).count()).to.equal(2);
      const productCloned = Products.find({
        _id: {
          $ne: product._id
        },
        type: "simple"
      }).fetch()[0];
      expect(productCloned.title).to.equal(`${product.title}-copy`);
      expect(productCloned.handle).to.equal(`${product.handle}-copy`);
      expect(productCloned.pageTitle).to.equal(product.pageTitle);
      expect(productCloned.description).to.equal(product.description);
    });

    it("product should be cloned with all variants and child variants with equal data, but not the same `_id`s", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variants = Products.find({ ancestors: { $in: [product._id] } }).fetch();
      expect(variants.length).to.equal(3);
      Meteor.call("products/cloneProduct", product);
      const clone = Products.find({
        _id: {
          $ne: product._id
        },
        type: "simple"
      }).fetch()[0];
      const cloneVariants = Products.find({
        ancestors: { $in: [clone._id] }
      }).fetch();
      expect(cloneVariants.length).to.equal(3);
      for (let i = 0; i < variants.length; i += 1) {
        expect(cloneVariants.some((clonedVariant) => clonedVariant.title === variants[i].title)).to.be.ok;
      }
    });

    it("product group cloning should create the same number of new products", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const product2 = addProduct();
      Meteor.call("products/cloneProduct", [product, product2]);
      const clones = Products.find({
        _id: {
          $nin: [product._id, product2._id]
        },
        type: "simple"
      }).fetch();
      expect(clones.length).to.equal(2);
    });

    it("product group cloning should create the same number of cloned variants", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const product2 = addProduct();
      const variants = Products.find({
        ancestors: { $in: [product._id, product2._id] }
      }).count();
      Meteor.call("products/cloneProduct", [product, product2]);
      const clones = Products.find({
        _id: {
          $nin: [product._id, product2._id]
        },
        type: "simple"
      }).fetch();
      expect(clones.length).to.equal(2);
      const clonedVariants = Products.find({
        ancestors: { $in: [clones[0]._id, clones[1]._id] }
      }).count();
      expect(clonedVariants).to.equal(variants);
    });
  });

  describe("createProduct", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const insertProductSpy = sandbox.spy(Products, "insert");
      expect(() => Meteor.call("products/createProduct")).to.throw(ReactionError, /Access Denied/);
      expect(insertProductSpy).to.not.have.been.called;
    });

    it("should create new product", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      Meteor.call("products/createProduct", (error, result) => {
        if (result) {
          expect(Products.find({ _id: result }).count()).to.equal(1);
        }
      });
    });

    it("should create variant with new product", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      Meteor.call("products/createProduct", (error, result) => {
        if (error || !result) {
          done(error || new Error("no result"));
          return;
        }
        // this test successfully finds product variant only by such way
        Meteor.defer(() => {
          expect(Products.find({ ancestors: [result] }).count()).to.equal(1);
          done();
        });
      });
    });
  });

  describe("deleteProduct", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const removeProductSpy = sandbox.spy(Products, "remove");
      expect(() => Meteor.call("products/archiveProduct", product._id)).to.throw(ReactionError, /Access Denied/);
      expect(removeProductSpy).to.not.have.been.called;
    });

    it("should mark product as deleted by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/archiveProduct", product._id);
      product = Products.findOne(product._id);
      expect(product.isDeleted).to.equal(true);
    });
  });

  describe("updateProductField", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call(
        "products/updateProductField",
        product._id, "title", "Updated Title"
      )).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should update product field by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "Updated Title");
      product = Products.findOne(product._id);
      expect(product.title).to.equal("Updated Title");
    });

    it("should update variant fields", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variant = Products.findOne({ ancestors: [product._id] });
      Meteor.call("products/updateProductField", variant._id, "title", "Updated Title");
      variant = Products.findOne(variant._id);
      expect(variant.title).to.equal("Updated Title");
    });
  });

  describe("updateProductTags", function () {
    beforeEach(function () {
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      const insertTagsSpy = sandbox.spy(Tags, "insert");
      expect(() => Meteor.call("products/updateProductTags", product._id, "productTag", null)).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
      expect(insertTagsSpy).to.not.have.been.called;
    });

    it("should create new tag when passed tag name and null ID by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tagName = "Product Tag";
      expect(Tags.findOne({ name: tagName })).to.be.undefined;
      Meteor.call("products/updateProductTags", product._id, tagName, null);
      const tag = Tags.findOne({ name: tagName });
      expect(tag.slug).to.equal(Reaction.getSlug(tagName));
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
    });

    it("should add existing tag when passed existing tag and tag._id by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");
      expect(Tags.find().count()).to.equal(1);
      expect(product.hashtags).to.not.contain(tag._id);
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      expect(Tags.find().count()).to.equal(1);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
    });
  });

  describe("removeProductTag", function () {
    beforeEach(function () {
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const tag = Factory.create("tag");
      const updateProductSpy = sandbox.spy(Products, "update");
      const removeTagsSpy = sandbox.spy(Tags, "remove");
      expect(() => Meteor.call("products/removeProductTag", product._id, tag._id)).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
      expect(removeTagsSpy).to.not.have.been.called;
    });

    it("should remove product tag by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");

      // Update product tags and publish so the original product will have the tags
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
      expect(Tags.find().count()).to.equal(1);

      // Remove the tag from the published product and ensure it succeed.
      Meteor.call("products/removeProductTag", product._id, tag._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.not.contain(tag._id);
    });
  });

  describe("setHandle", () => {
    beforeEach(() => Tags.remove({}));

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const productUpdateSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/setHandle", product._id)).to.throw(ReactionError, /Access Denied/);
      expect(productUpdateSpy).to.not.have.been.called;
    });

    it("should set handle for product by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new product name");
      Meteor.call("products/setHandle", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.equal("new-product-name");
    });
  });

  describe("setHandleTag", function () {
    beforeEach(function () {
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const tag = Factory.create("tag");
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(function () {
        return Meteor.call("products/setHandleTag", product._id, tag._id);
      }).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should set handle tag for product by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");
      Meteor.call("products/setHandleTag", product._id, tag._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.equal(tag.slug);
    });
  });

  describe("updateMetaFields position", () => {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const product2 = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/updateVariantsPosition", [
        product._id, product2._id], product.shopId)).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should update variants' position", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const { variant: variant1 } = addProductSingleVariant();
      const { variant: variant2 } = addProductSingleVariant();
      const { variant: variant3 } = addProductSingleVariant();

      expect(variant1.index).to.be.undefined;
      expect(variant2.index).to.be.undefined;
      expect(variant3.index).to.be.undefined;

      Meteor.call("products/updateVariantsPosition", [
        variant2._id, variant3._id, variant1._id
      ], variant1.shopId);
      const modifiedVariant1 = Products.findOne(variant1._id);
      const modifiedVariant2 = Products.findOne(variant2._id);
      const modifiedVariant3 = Products.findOne(variant3._id);
      expect(modifiedVariant1.index).to.be.equal(2);
      expect(modifiedVariant2.index).to.be.equal(0);
      expect(modifiedVariant3.index).to.be.equal(1);
    });
  });

  describe("updateMetaFields", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      })).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should add meta fields by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      });
      product = Products.findOne(product._id);
      expect(product.metafields.length).to.be.equal(1);

      return done();
    });
  });

  describe("publishProduct", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/publishProduct", product._id)).to.throw(ReactionError, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should let admin toggle product visibility", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const { isVisible } = product;
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(ReactionError, /Access Denied/);
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(!isVisible);
    });

    it("should not publish product when missing title", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const { isVisible } = product;
      Products.update(product._id, {
        $set: {
          title: ""
        }
      }, {
        bypassCollection2: true
      });

      expect(() => Meteor.call("products/publishProduct", product._id))
        .to.throw(ReactionError, /Bad Request/);

      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(isVisible);
    });

    it("should not publish product when missing even one of child variant price", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const { isVisible } = product;
      const variant = Products.findOne({ ancestors: [product._id] });
      expect(variant.ancestors[0]).to.equal(product._id);
      const options = Products.find({
        ancestors: [product._id, variant._id]
      }).fetch();
      expect(options.length).to.equal(2);
      Products.update(options[0]._id, {
        $set: {
          isVisible: true,
          price: 0
        }
      }, {
        selector: { type: "variant" },
        validate: false
      });
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(isVisible);
    });


    it("should not publish product when missing variant", function () {
      let product = addProduct();
      const { isVisible } = product;
      sandbox.stub(Roles, "userIsInRole", () => true);
      Products.remove({ ancestors: { $in: [product._id] } });
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(isVisible);
    });
  });
});
