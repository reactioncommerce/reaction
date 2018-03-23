/* eslint dot-notation:0 */
/* eslint no-loop-func:0 */
/* eslint prefer-arrow-callback:0 */
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Products, Revisions, Tags } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { addProduct, addProductSingleVariant } from "/server/imports/fixtures/products";
import Fixtures from "/server/imports/fixtures";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

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

  before(function () {
    Products.remove({});
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
    sandbox.stub(RevisionApi, "isRevisionControlEnabled", () => true);
    Revisions.remove({});
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
      expect(() => Meteor.call("products/cloneVariant", product._id, variants[0]._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(insertProductSpy).to.not.have.been.called;
    });

    it("should clone variant by admin", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => true);
      const product = addProduct();
      let variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(1);
      Meteor.call("products/cloneVariant", product._id, variants[0]._id);
      variants = Products.find({ ancestors: [product._id] }).count();
      expect(variants).to.equal(2);
      return done();
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
      expect(() => Meteor.call("products/createVariant", product._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should create top level variant", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(1);
      Meteor.call("products/createVariant", product._id);
      Meteor._sleepForMs(500);
      variants = Products.find({ ancestors: [product._id] }).fetch();
      expect(variants.length).to.equal(2);
      return done();
    });

    it("should create option variant", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let options;
      const product = addProduct();
      const variant = Products.find({ ancestors: [product._id] }).fetch()[0];
      options = Products.find({
        ancestors: { $in: [variant._id] }
      }).fetch();
      expect(options.length).to.equal(2);

      Meteor.call("products/createVariant", variant._id);
      Meteor._sleepForMs(500);
      options = Products.find({
        ancestors: { $in: [variant._id] }
      }).fetch();
      expect(options.length).to.equal(3);
      return done();
    });

    it("should create variant with predefined object", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const newVariant = {
        title: "newVariant"
      };
      let variants = Products.find({ ancestors: [product._id] }).fetch();
      const firstVariantId = variants[0]._id;
      expect(variants.length).to.equal(1);

      Meteor.call("products/createVariant", product._id, newVariant);
      Meteor._sleepForMs(500);
      variants = Products.find({ ancestors: [product._id] }).fetch();
      const createdVariant = variants.filter((v) => v._id !== firstVariantId);
      expect(variants.length).to.equal(2);
      expect(createdVariant[0].title).to.equal("newVariant");
      return done();
    });
  });

  describe("products/updateVariant", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      variant["title"] = "Updated Title";
      variant["price"] = 7;
      const updateProductSpy = sandbox.stub(Products, "update");
      expect(() => Meteor.call("products/updateVariant", variant)).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should not update individual variant by admin passing in full object", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variant = Products.findOne({ ancestors: [product._id] });
      variant["title"] = "Updated Title";
      variant["price"] = 7;
      Meteor.call("products/updateVariant", variant);
      variant = Products.findOne({ ancestors: [product._id] });
      expect(variant.price).to.not.equal(7);
      expect(variant.title).to.not.equal("Updated Title");

      return done();
    });

    it("should update individual variant revision by admin passing in full object", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.find({ ancestors: [product._id] }).fetch()[0];
      variant["title"] = "Updated Title";
      variant["price"] = 7;
      Meteor.call("products/updateVariant", variant);
      const variantRevision = Revisions.find({ documentId: variant._id }).fetch()[0];
      expect(variantRevision.documentData.price).to.equal(7);
      expect(variantRevision.documentData.title).to.equal("Updated Title");

      return done();
    });

    it("should not update individual variant by admin passing in partial object", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      Meteor.call("products/updateVariant", {
        _id: variant._id,
        title: "Updated Title",
        price: 7
      });
      const updatedVariant = Products.findOne(variant._id);
      expect(updatedVariant.price).to.not.equal(7);
      expect(updatedVariant.title).to.not.equal("Updated Title");
      expect(updatedVariant.optionTitle).to.equal(variant.optionTitle);
    });

    it("should update individual variant revision by admin passing in partial object", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.find({ ancestors: [product._id] }).fetch()[0];
      Meteor.call("products/updateVariant", {
        _id: variant._id,
        title: "Updated Title",
        price: 7
      });
      const updatedVariantRevision = Revisions.findOne({ documentId: variant._id });
      expect(updatedVariantRevision.documentData.price).to.equal(7);
      expect(updatedVariantRevision.documentData.title).to.equal("Updated Title");
      expect(updatedVariantRevision.documentData.optionTitle).to.equal(variant.optionTitle);
    });
  });

  describe("products/deleteVariant", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      const removeProductSpy = sandbox.spy(Products, "remove");
      expect(() => Meteor.call("products/deleteVariant", variant._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(removeProductSpy).to.not.have.been.called;
    });

    it("should not mark top-level variant as deleted", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variant = Products.findOne({ ancestors: [product._id] });
      expect(variant.isDeleted).to.equal(false);
      Meteor.call("products/deleteVariant", variant._id);
      variant = Products.findOne(variant._id);
      expect(variant.isDeleted).to.not.equal(true);
    });

    it("should mark top-level variant revision as deleted", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      expect(variant.isDeleted).to.equal(false);
      Meteor.call("products/deleteVariant", variant._id);
      const variantRevision = Revisions.findOne({ documentId: variant._id });
      expect(variantRevision.documentData.isDeleted).to.equal(true);
    });

    it("should publish top-level variant as deleted", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      expect(variant.isDeleted).to.equal(false);
      Meteor.call("products/deleteVariant", variant._id);
      Meteor.call("revisions/publish", variant._id);
      const publishedProduct = Products.findOne(variant._id);
      expect(publishedProduct.isDeleted).to.equal(true);
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
      sandbox.stub(Meteor.server.method_handlers, "inventory/remove", function (...args) {
        check(args, [Match.Any]);
      });
      const insertProductSpy = sandbox.spy(Products, "insert");
      expect(() => Meteor.call("products/cloneProduct", {})).to.throw(Meteor.Error, /Access Denied/);
      expect(insertProductSpy).to.not.have.been.called;
    });

    it("should clone product", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "inventory/register", function (...args) {
        check(args, [Match.Any]);
      });
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

      return done();
    });

    it("product should be cloned with all variants and child variants with equal data, but not the same `_id`s", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "inventory/register", function (...args) {
        check(args, [Match.Any]);
      });
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
      return done();
    });

    it("product group cloning should create the same number of new products", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "inventory/register", function (...args) {
        check(args, [Match.Any]);
      });
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

      return done();
    });

    it("product group cloning should create the same number of cloned variants", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor.server.method_handlers, "inventory/register", function (...args) {
        check(args, [Match.Any]);
      });
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

      return done();
    });
  });

  describe("createProduct", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const insertProductSpy = sandbox.spy(Products, "insert");
      expect(() => Meteor.call("products/createProduct")).to.throw(Meteor.Error, /Access Denied/);
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
      expect(() => Meteor.call("products/archiveProduct", product._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(removeProductSpy).to.not.have.been.called;
    });

    it("should not mark product as deleted by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/archiveProduct", product._id);
      product = Products.findOne(product._id);
      expect(product.isDeleted).to.equal(false);
    });

    it("should mark product revision as deleted by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      Meteor.call("products/archiveProduct", product._id);
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.isDeleted).to.equal(true);
    });

    it("should publish product revision marked as deleted by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/archiveProduct", product._id);
      Meteor.call("revisions/publish", product._id);
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
      )).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should not update product field by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "Updated Title");
      product = Products.findOne(product._id);
      expect(product.title).to.not.equal("Updated Title");
    });

    it("should update product revision field by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "Updated Title");
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.title).to.equal("Updated Title");
    });

    it("should publish changes to product field by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "Updated Title");
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.title).to.equal("Updated Title");
    });

    it("should not update variant fields", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variant = Products.findOne({ ancestors: [product._id] });
      Meteor.call("products/updateProductField", variant._id, "title", "Updated Title");
      variant = Products.findOne(variant._id);
      expect(variant.title).to.not.equal("Updated Title");
    });

    it("should update variant revision fields", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const variant = Products.findOne({ ancestors: [product._id] });
      Meteor.call("products/updateProductField", variant._id, "title", "Updated Title");
      const variantRevision = Revisions.findOne({ documentId: variant._id });
      expect(variantRevision.documentData.title).to.equal("Updated Title");
    });

    it("should publish update for variant fields", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let variant = Products.findOne({ ancestors: [product._id] });
      Meteor.call("products/updateProductField", variant._id, "title", "Updated Title");
      Meteor.call("revisions/publish", product._id);
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
      expect(() => Meteor.call("products/updateProductTags", product._id, "productTag", null)).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
      expect(insertTagsSpy).to.not.have.been.called;
    });

    it("should not new tag when passed tag name and null ID by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tagName = "Product Tag";
      expect(Tags.findOne({ name: tagName })).to.be.undefined;
      Meteor.call("products/updateProductTags", product._id, tagName, null);
      const tag = Tags.findOne({ name: tagName });
      expect(tag.slug).to.equal(Reaction.getSlug(tagName));
      product = Products.findOne(product._id);
      expect(product.hashtags).to.not.contain(tag._id);
    });

    it("should add new tag to product revision when passed tag name and null ID by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const tagName = "Product Tag";
      expect(Tags.findOne({ name: tagName })).to.be.undefined;
      Meteor.call("products/updateProductTags", product._id, tagName, null);
      const tag = Tags.findOne({ name: tagName });
      expect(tag.slug).to.equal(Reaction.getSlug(tagName));
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.hashtags).to.contain(tag._id);
    });

    it("should publish new product tag when passed tag name and null ID by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tagName = "Product Tag";
      expect(Tags.findOne({ name: tagName })).to.be.undefined;
      Meteor.call("products/updateProductTags", product._id, tagName, null);
      const tag = Tags.findOne({ name: tagName });
      expect(tag.slug).to.equal(Reaction.getSlug(tagName));
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
    });

    it("should not add existing tag when passed existing tag and tag._id by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");
      expect(Tags.find().count()).to.equal(1);
      expect(product.hashtags).to.not.contain(tag._id);
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      expect(Tags.find().count()).to.equal(1);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.not.contain(tag._id);
    });

    it("should add existing tag to product revision when passed existing tag and tag._id by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const tag = Factory.create("tag");
      expect(Tags.find().count()).to.equal(1);
      expect(product.hashtags).to.not.contain(tag._id);
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      expect(Tags.find().count()).to.equal(1);
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.hashtags).to.contain(tag._id);
    });

    it("should publish existing tag for product when passed existing tag and tag._id by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");
      expect(Tags.find().count()).to.equal(1);
      expect(product.hashtags).to.not.contain(tag._id);
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      expect(Tags.find().count()).to.equal(1);
      Meteor.call("revisions/publish", product._id);
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
      expect(() => Meteor.call("products/removeProductTag", product._id, tag._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
      expect(removeTagsSpy).to.not.have.been.called;
    });

    it("should not remove product tag by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");

      // Update product tags and publish so the original prodcut will have the tags
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
      expect(Tags.find().count()).to.equal(1);

      // Remove the tag from the published prouct and ensure it didn't succeed.
      // Revision control should stop the published product from being changed.
      Meteor.call("products/removeProductTag", product._id, tag._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
      expect(Tags.find().count()).to.equal(1);
    });

    it("should remove tag in product revision by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");

      // Update product tags and publish so the original prodcut will have the tags
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
      expect(Tags.find().count()).to.equal(1);

      // Remove the tag from the published prouct and ensure it changed in the revision.
      Meteor.call("products/removeProductTag", product._id, tag._id);
      const productRevision = Revisions.findOne({
        "documentId": product._id,
        "workflow.status": { $nin: ["revision/published"] }
      });
      expect(productRevision.documentData.hashtags).to.not.contain(tag._id);
      expect(Tags.find().count()).to.equal(1);
    });

    it("should publish remove product tag by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();

      // Update product tags and publish so the original prodcut will have the tags
      const tag = Factory.create("tag");
      Meteor.call("products/updateProductTags", product._id, tag.name, tag._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.hashtags).to.contain(tag._id);
      expect(Tags.find().count()).to.equal(1);

      // Remove the tag from the published prouct which should create a revision.
      // Then publish that revision and ensure that it published product changed.
      Meteor.call("products/removeProductTag", product._id, tag._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      const tags = Tags.find();
      expect(product.hashtags).to.not.contain(tag._id);
      expect(tags.count()).to.equal(1);
      // Tag should not be deleted, it should just be removed from the product
      expect(tags.fetch()[0].isDeleted).to.equal(false);
    });
  });

  describe("setHandle", () => {
    beforeEach(() => Tags.remove({}));

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const productUpdateSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/setHandle", product._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(productUpdateSpy).to.not.have.been.called;
    });

    it("should not set handle for product by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const productHandle = product.handle;
      Meteor.call("products/updateProductField", product._id, "title", "new product name");
      Meteor.call("products/setHandle", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.equal(productHandle);
    });

    it("should set handle correctly on product revision", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new second product name");
      Meteor.call("products/setHandle", product._id);
      const revision = Revisions.findOne({ documentId: product._id });
      expect(revision.documentData.handle).to.not.equal("new-second-product-name");
    });

    it("should not set handle on published product", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new second product name");
      Meteor.call("products/setHandle", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.not.equal("new-second-product-name");
    });

    it("should publish handle correctly", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new second product name");
      Meteor.call("products/setHandle", product._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.not.equal("new-second-product-name");
    });

    it("unpublished products with the same title should not receive correct handle", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new second product name");
      Meteor.call("products/setHandle", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.not.equal("new-second-product-name-copy");
    });

    it("products with the same title should receive correct handle on revision", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new second product name");
      Meteor.call("products/setHandle", product._id);
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.handle).to.not.equal("new-second-product-name-copy");
    });

    it("products with the same title should receive correct handle when published", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateProductField", product._id, "title", "new second product name");
      Meteor.call("products/setHandle", product._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.not.equal("new-second-product-name-copy");
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
      }).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should not set handle tag for product by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");
      Meteor.call("products/setHandleTag", product._id, tag._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.not.equal(tag.slug);
    });

    it("should set handle tag for product revision by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const tag = Factory.create("tag");
      Meteor.call("products/setHandleTag", product._id, tag._id);
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.handle).to.equal(tag.slug);
    });

    it("should publish set handle tag for product by admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const tag = Factory.create("tag");
      Meteor.call("products/setHandleTag", product._id, tag._id);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.handle).to.equal(tag.slug);
    });
  });

  describe("updateProductPosition", function () {
    beforeEach(function () {
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const tag = Factory.create("tag");
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call(
        "products/updateProductPosition",
        product._id, {}, tag._id
      )).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should not update product position by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const tag = Factory.create("tag");
      const position = {
        position: 0,
        weight: 0,
        updatedAt: new Date()
      };
      expect(() => Meteor.call(
        "products/updateProductPosition",
        product._id, position, tag.slug
      )).to.not.throw(Meteor.Error, /Access Denied/);
      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.positions).to.be.undefined;

      return done();
    });

    it("should update product revision position by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const tag = Factory.create("tag");
      const position = {
        position: 0,
        weight: 0,
        updatedAt: new Date()
      };
      expect(() => Meteor.call(
        "products/updateProductPosition",
        product._id, position, tag.slug
      )).to.not.throw(Meteor.Error, /Access Denied/);
      const updatedProductRevision = Revisions.findOne({ documentId: product._id });
      expect(updatedProductRevision.documentData.positions[tag.slug].position).to.equal(0);

      return done();
    });

    it("should publish product position by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      const tag = Factory.create("tag");
      const position = {
        position: 0,
        weight: 0,
        updatedAt: new Date()
      };
      expect(() => Meteor.call(
        "products/updateProductPosition",
        product._id, position, tag.slug
      )).to.not.throw(Meteor.Error, /Access Denied/);
      Meteor.call("revisions/publish", product._id);
      const updatedProduct = Products.findOne(product._id);
      expect(updatedProduct.positions[tag.slug].position).to.equal(0);

      return done();
    });
  });

  describe("updateMetaFields position", () => {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const product2 = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/updateVariantsPosition", [
        product._id, product2._id])).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should not update variants' position", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const { variant: variant1 } = addProductSingleVariant();
      const { variant: variant2 } = addProductSingleVariant();
      const { variant: variant3 } = addProductSingleVariant();

      expect(variant1.index).to.be.undefined;
      expect(variant2.index).to.be.undefined;
      expect(variant3.index).to.be.undefined;

      Meteor.call("products/updateVariantsPosition", [
        variant2._id, variant3._id, variant1._id
      ]);
      Meteor._sleepForMs(500);
      const modifiedVariant1 = Products.findOne(variant1._id);
      const modifiedVariant2 = Products.findOne(variant2._id);
      const modifiedVariant3 = Products.findOne(variant3._id);
      expect(modifiedVariant1.index).to.be.undefined;
      expect(modifiedVariant2.index).to.be.undefined;
      expect(modifiedVariant3.index).to.be.undefined;
    });

    it("should update variants' revision position", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const { variant: variant1 } = addProductSingleVariant();
      const { variant: variant2 } = addProductSingleVariant();
      const { variant: variant3 } = addProductSingleVariant();

      expect(variant1.index).to.be.undefined;
      expect(variant2.index).to.be.undefined;
      expect(variant3.index).to.be.undefined;

      Meteor.call("products/updateVariantsPosition", [
        variant2._id, variant3._id, variant1._id
      ]);
      Meteor._sleepForMs(500);
      const modifiedVariantRevision1 = Revisions.findOne({ documentId: variant1._id });
      const modifiedVariantRevision2 = Revisions.findOne({ documentId: variant2._id });
      const modifiedVariantRevision3 = Revisions.findOne({ documentId: variant3._id });
      expect(modifiedVariantRevision1.documentData.index).to.equal(2);
      expect(modifiedVariantRevision2.documentData.index).to.equal(0);
      expect(modifiedVariantRevision3.documentData.index).to.equal(1);
    });

    it("should publish variants' revision position", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const { variant: variant1 } = addProductSingleVariant();
      const { variant: variant2 } = addProductSingleVariant();
      const { variant: variant3 } = addProductSingleVariant();

      expect(variant1.index).to.be.undefined;
      expect(variant2.index).to.be.undefined;
      expect(variant3.index).to.be.undefined;

      Meteor.call("products/updateVariantsPosition", [
        variant2._id, variant3._id, variant1._id
      ]);
      Meteor._sleepForMs(500);
      Meteor.call("revisions/publish", [
        variant1._id, variant2._id, variant3._id
      ]);
      const modifiedVariant1 = Products.findOne(variant1._id);
      const modifiedVariant2 = Products.findOne(variant2._id);
      const modifiedVariant3 = Products.findOne(variant3._id);
      expect(modifiedVariant1.index).to.equal(2);
      expect(modifiedVariant2.index).to.equal(0);
      expect(modifiedVariant3.index).to.equal(1);
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
      })).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should not add meta fields by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      });
      product = Products.findOne(product._id);
      expect(product.metafields.length).to.be.equal(0);

      return done();
    });

    it("should add meta fields to product revision by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      });
      const productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.metafields[0].key).to.equal("Material");
      expect(productRevision.documentData.metafields[0].value).to.equal("Spandex");

      return done();
    });

    it("should publish add meta fields by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      });
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.metafields[0].key).to.equal("Material");
      expect(product.metafields[0].value).to.equal("Spandex");

      return done();
    });
  });

  describe("publishProduct", function () {
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const product = addProduct();
      const updateProductSpy = sandbox.spy(Products, "update");
      expect(() => Meteor.call("products/publishProduct", product._id)).to.throw(Meteor.Error, /Access Denied/);
      expect(updateProductSpy).to.not.have.been.called;
    });

    it("should let admin publish product changes", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const { isVisible } = product;
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Access Denied/);
      Meteor.call("revisions/publish", product._id);
      Meteor._sleepForMs(500);
      product = Products.findOne(product._id);
      // We switch the visible state in `products/publishProdct` for revisions
      expect(product.isVisible).to.equal(!isVisible);
    });

    it("should not let admin toggle product visibility", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const { isVisible } = product;
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Access Denied/);
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(isVisible);
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Bad Request/);
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(isVisible);
    });

    it("should let admin toggle product revision visibility", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const product = addProduct();
      let productRevision = Revisions.findOne({ documentId: product._id });
      const { isVisible } = productRevision.documentData;
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Access Denied/);
      productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.isVisible).to.equal(!isVisible);
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Bad Request/);
      productRevision = Revisions.findOne({ documentId: product._id });
      expect(productRevision.documentData.isVisible).to.equal(!isVisible);
    });

    it("should publish admin toggle product visibility", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let product = addProduct();
      const { isVisible } = product; // false

      // Toggle visible
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Access Denied/);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(!isVisible);

      // Toggle not visible
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Bad Request/);
      Meteor.call("revisions/publish", product._id);
      product = Products.findOne(product._id);
      expect(product.isVisible).to.equal(isVisible);
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
        selector: { type: "simple" },
        validate: false
      });
      expect(() => Meteor.call("products/publishProduct", product._id)).to.not.throw(Meteor.Error, /Access Denied/);
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
