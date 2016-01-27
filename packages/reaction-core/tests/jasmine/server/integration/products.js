/* eslint dot-notation: 0 */
/* eslint no-loop-func: 0 */

describe("core product methods", function () {
  // we can't clean Products collection after each test from now, because we
  // have functions which called from async db operations callbacks. So, if we
  // clean collections each time - we could have a situation when next test
  // started, but previous not yet finished his async computations.
  // So, if you need to clean the collection for your test, you could try to do
  // it, but this is not recommended in droves

  beforeAll(function () {
    ReactionCore.Collections.Products.remove({});
  });

  describe("products/cloneVariant", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "insert");
        expect(function () {
          return Meteor.call("products/cloneVariant", "fakeId", "fakeVarId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      }
    );

    it(
      "should clone variant by admin",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const product = faker.reaction.products.add();
        let variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        expect(variants.length).toEqual(1);
        Meteor.call("products/cloneVariant", product._id, variants[0]._id);
        variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).count();
        expect(variants).toEqual(2);

        return done();
      }
    );

    it(
      "number of `child variants` between source and cloned `variants` " +
      "should be equal",
      done => {
        const product = faker.reaction.products.add();
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        const variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        let options = ReactionCore.Collections.Products.find({ ancestors: {
          $in: [variant[0]._id]
        }}).count();
        expect(options).toBe(2);

        Meteor.call("products/cloneVariant", product._id, variant[0]._id);
        const variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        const clonedVariant = variants.filter(v => v._id !== variant[0]._id);
        expect(variant[0]._id).not.toEqual(clonedVariant[0]._id);
        expect(variant[0].ancestors).toEqual(clonedVariant[0].ancestors);

        options = ReactionCore.Collections.Products.find({ ancestors: {
          $in: [clonedVariant[0]._id]
        }}).count();
        expect(options).toBe(2);

        return done();
      }
    );

    // it(
    //  "`variant` and `child variants` media should be inherited when " +
    //  "cloning", done => {
    //    return done();
    // });
  });

  describe("products/createVariant", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/createVariant", "fakeId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should create top level variant",
      function (done) {
        const product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        let variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        expect(variants.length).toEqual(1);

        Meteor.call("products/createVariant", product._id);
        variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        expect(variants.length).toEqual(2);

        return done();
      }
    );

    it(
      "should create option variant",
      function (done) {
        let options;
        const product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch()[0];
        options = ReactionCore.Collections.Products.find({
          ancestors: { $in: [variant._id] }
        }).fetch();
        expect(options.length).toEqual(2);

        Meteor.call("products/createVariant", variant._id);
        options = ReactionCore.Collections.Products.find({
          ancestors: { $in: [variant._id] }
        }).fetch();
        expect(options.length).toEqual(3);

        return done();
      }
    );

    it(
      "should create variant with predefined object",
      function (done) {
        const product = faker.reaction.products.add();
        const newVariant = {
          title: "newVariant"
        };
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        let variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        const firstVariantId = variants[0]._id;
        expect(variants.length).toEqual(1);

        Meteor.call("products/createVariant", product._id, newVariant);
        variants = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        const createdVariant = variants.filter(v => v._id !== firstVariantId);
        expect(variants.length).toEqual(2);
        expect(createdVariant[0].title).toEqual("newVariant");

        return done();
      }
    );
  });

  describe("products/updateVariant", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/updateVariant", { _id: "fakeId" });
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should update individual variant by admin passing in full object",
      function (done) {
        const product = faker.reaction.products.add();
        let variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch()[0];
        spyOn(Roles, "userIsInRole").and.returnValue(true);

        variant["title"] = "Updated Title";
        variant["price"] = 7;
        Meteor.call("products/updateVariant", variant);
        variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch()[0];
        expect(variant.price).toEqual(7);
        expect(variant.title).toEqual("Updated Title");

        return done();
      }
    );

    it(
      "should update individual variant by admin passing in partial object",
      function (done) {
        let updatedVariant;
        const product = faker.reaction.products.add();
        let variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch()[0];
        spyOn(Roles, "userIsInRole").and.returnValue(true);

        Meteor.call("products/updateVariant", {
          _id: variant._id,
          title: "Updated Title",
          price: 7
        });
        updatedVariant = ReactionCore.Collections.Products.findOne(variant._id);
        expect(updatedVariant.price).toEqual(7);
        expect(updatedVariant.title).toEqual("Updated Title");
        expect(updatedVariant.optionTitle).toEqual(variant.optionTitle);

        return done();
      }
    );
  });

  describe("products/deleteVariant", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "remove");
        expect(function () {
          return Meteor.call("products/deleteVariant", "fakeId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.remove).not.toHaveBeenCalled();
      }
    );

    it(
      "should delete top-level variant",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const product = faker.reaction.products.add();
        let variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        expect(variant.length).toEqual(1);
        Meteor.call("products/deleteVariant", variant[0]._id);
        variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch();
        expect(variant.length).toEqual(0);

        return done();
      }
    );

    it(
      "should delete all child variants (options) if top-level variant deleted",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        const product = faker.reaction.products.add();
        const variant = ReactionCore.Collections.Products.find({
          ancestors: [product._id]
        }).fetch()[0];
        let variants = ReactionCore.Collections.Products.find({ ancestors: {
          $in: [variant._id]
        }}).fetch();
        expect(variants.length).toBe(2);
        Meteor.call("products/deleteVariant", variant._id);

        return done();
      }
    );
  });

  describe("products/cloneProduct", function () {
    // At the moment we do not have any mechanisms that track the product
    // cloning hierarchy, so the only way to track that will be cleaning
    // collection on before each test.
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "insert");
        expect(function () {
          return Meteor.call("products/cloneProduct", {});
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      }
    );

    it(
      "should clone product",
      function (done) {
        const product = faker.reaction.products.add();
        let productCloned;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        expect(ReactionCore.Collections.Products.find({
          type: "simple"
        }).count()).toEqual(1);

        Meteor.call("products/cloneProduct", product);
        expect(ReactionCore.Collections.Products.find({
          type: "simple"
        }).count()).toEqual(2);
        productCloned = ReactionCore.Collections.Products.find({
          _id: {
            $ne: product._id
          },
          type: "simple"
        }).fetch()[0];
        expect(productCloned.title).toEqual(product.title + "-copy");
        expect(productCloned.handle).toEqual(product.handle + "-copy");
        expect(productCloned.pageTitle).toEqual(product.pageTitle);
        expect(productCloned.description).toEqual(product.description);

        return done();
      }
    );

    it(
      "product should be cloned with all variants and child variants with" +
      " equal data, but not the same `_id`s",
      done => {
        const product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        let variants = ReactionCore.Collections.Products.find({
          ancestors: { $in: [product._id] }
        }).fetch();
        expect(variants.length).toBe(3);
        Meteor.call("products/cloneProduct", product);
        const clone = ReactionCore.Collections.Products.find({
          _id: {
            $ne: product._id
          },
          type: "simple"
        }).fetch()[0];
        let cloneVariants = ReactionCore.Collections.Products.find({
          ancestors: { $in: [clone._id] }
        }).fetch();
        expect(cloneVariants.length).toBe(3);
        for (let i = 0; i < variants.length; i++) {
          expect(cloneVariants.some(clonedVariant => {
            return clonedVariant.title === variants[i].title;
          })).toBeTruthy();
        }

        return done();
      }
    );

    it(
      "product group cloning should create the same number of new products",
      done => {
        const product = faker.reaction.products.add();
        const product2 = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/cloneProduct", [product, product2]);
        const clones = ReactionCore.Collections.Products.find({
          _id: {
            $nin: [product._id, product2._id]
          },
          type: "simple"
        }).fetch();
        expect(clones.length).toBe(2);

        return done();
      }
    );

    it(
      "product group cloning should create the same number of cloned variants",
      done => {
        const product = faker.reaction.products.add();
        const product2 = faker.reaction.products.add();
        const variants = ReactionCore.Collections.Products.find({
          ancestors: { $in: [product._id, product2._id] }
        }).count();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/cloneProduct", [product, product2]);
        const clones = ReactionCore.Collections.Products.find({
          _id: {
            $nin: [product._id, product2._id]
          },
          type: "simple"
        }).fetch();
        expect(clones.length).toBe(2);
        const clonedVariants = ReactionCore.Collections.Products.find({
          ancestors: { $in: [clones[0]._id, clones[1]._id] }
        }).count();
        expect(clonedVariants).toEqual(variants);

        return done();
      }
    );

    // it(
    //  "all hierarchy media should be cloned",
    //  done => {
    //    return done();
    //  }
    // );
  });

  describe("createProduct", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "insert");
        expect(function () {
          return Meteor.call("products/createProduct");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      }
    );

    it(
      "should create new product",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        spyOn(ReactionCore.Collections.Products, "insert").and.returnValue(1);
        expect(Meteor.call("products/createProduct")).toEqual(1);
        expect(ReactionCore.Collections.Products.insert).toHaveBeenCalled();

        return done();
      }
    );

    it(
      "should create variant with new product",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/createProduct", (error, result) => {
          if (result) {
            // this test successfully finds product variant only by such way
            Meteor.setTimeout(() => {
              expect(ReactionCore.Collections.Products.find({
                ancestors: [result]
              }).count()).toEqual(1);

              return done();
            }, 50);
          }
        });
      }
    );
  });

  describe("deleteProduct", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "remove");
        expect(function () {
          return Meteor.call("products/deleteProduct", "fakeId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.remove).not.toHaveBeenCalled();
      }
    );

    it(
      "should delete product by admin",
      function () {
        const product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        // we expect "4" because we have 1 product and 3 variants
        expect(Meteor.call("products/deleteProduct", product._id)).toBe(4);
        expect(ReactionCore.Collections.Products.find(product._id).
          count()).toEqual(0);
      }
    );

    it(
      "should throw error if removal fails",
      function () {
        const product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        spyOn(ReactionCore.Collections.Products, "remove");
        expect(function () {
          return Meteor.call("products/deleteProduct", product._id);
        }).toThrow(new Meteor.Error(304,
          "Something goes wrong, nothing was deleted"));
        expect(ReactionCore.Collections.Products.find(product._id).
          count()).toEqual(1);
      }
    );
  });

  describe("updateProductField", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/updateProductField",
            "fakeId", "title", "Updated Title");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should update product field by admin",
      function (done) {
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/updateProductField", product._id,
          "title", "Updated Title");
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.title).toEqual("Updated Title");

        return done();
      }
    );

    it(
      "should update variant fields",
      function (done) {
        const product = faker.reaction.products.add();
        let variant = ReactionCore.Collections.Products.findOne({
          ancestors: [product._id]
        });
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/updateProductField", variant._id,
          "title", "Updated Title");
        variant = ReactionCore.Collections.Products.findOne(variant._id);
        expect(variant.title).toEqual("Updated Title");

        return done();
      }
    );
  });

  describe("updateProductTags", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Tags.remove({});
    });

    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        spyOn(ReactionCore.Collections.Tags, "insert");
        expect(function () {
          return Meteor.call("products/updateProductTags",
            "fakeId", "productTag", null);
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
        expect(ReactionCore.Collections.Tags.insert).not.toHaveBeenCalled();
      }
    );

    it(
      "should add new tag when passed tag name and null ID by admin",
      function (done) {
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        let tagName = "Product Tag";
        expect(ReactionCore.Collections.Tags.findOne({
          name: tagName
        })).toBeUndefined();

        Meteor.call("products/updateProductTags", product._id,
          tagName, null);
        const tag = ReactionCore.Collections.Tags.findOne({
          name: tagName
        });
        expect(tag.slug).toEqual(getSlug(tagName));

        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.hashtags).toContain(tag._id);

        return done();
      }
    );

    it(
      "should add existing tag when passed existing tag and tag._id by admin",
      function (done) {
        let product = faker.reaction.products.add();
        let tag = Factory.create("tag");
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        expect(ReactionCore.Collections.Tags.find().count()).toEqual(
          1);
        expect(product.hashtags).not.toContain(tag._id);
        Meteor.call("products/updateProductTags", product._id, tag.name,
          tag._id);
        expect(ReactionCore.Collections.Tags.find().count()).toEqual(
          1);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.hashtags).toContain(tag._id);

        return done();
      }
    );
  });

  describe("removeProductTag", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Tags.remove({});
    });

    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        spyOn(ReactionCore.Collections.Tags, "remove");
        expect(function () {
          return Meteor.call("products/removeProductTag", "fakeId", "tagId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
        expect(ReactionCore.Collections.Tags.remove).not.toHaveBeenCalled();
      }
    );

    it(
      "should remove product tag by admin",
      function (done) {
        let product = faker.reaction.products.add();
        let tag = Factory.create("tag");
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/updateProductTags", product._id, tag.name,
          tag._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.hashtags).toContain(tag._id);
        expect(ReactionCore.Collections.Tags.find().count()).toEqual(
          1);
        Meteor.call("products/removeProductTag", product._id, tag._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.hashtags).not.toContain(tag._id);
        expect(ReactionCore.Collections.Tags.find().count()).toEqual(
          0);

        return done();
      }
    );
  });

  describe("setHandle", () => {
    beforeEach(() => {
      return ReactionCore.Collections.Tags.remove({});
    });

    it(
      "should throw 403 error by non admin",
      () => {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(() => Meteor.call("products/setHandle", "fakeId"))
          .toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should set handle for product by admin",
      done => {
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const productHandle = product.handle;
        Meteor.call("products/updateProductField", product._id,
          "title", "new product name");
        Meteor.call("products/setHandle", product._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.handle).not.toEqual(productHandle);

        return done();
      }
    );

    it(
      "should set handle correctly",
      done => {
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/updateProductField", product._id,
          "title", "new second product name");
        Meteor.call("products/setHandle", product._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.handle).toEqual("new-second-product-name");

        return done();
      }
    );

    it(
      "products with the same title should receive correct handle",
      done => {
        // we use product from previous test here like an original
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/updateProductField", product._id,
          "title", "new second product name");
        Meteor.call("products/setHandle", product._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.handle).toEqual("new-second-product-name-copy");

        return done();
      }
    );
  });

  describe("setHandleTag", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Tags.remove({});
    });

    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/setHandleTag", "fakeId", "tagId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should set handle tag for product by admin",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        let product = faker.reaction.products.add();
        let tag = Factory.create("tag");

        Meteor.call("products/setHandleTag", product._id, tag._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.handle).toEqual(tag.slug);

        return done();
      }
    );
  });

  describe("updateProductPosition", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Tags.remove({});
    });

    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/updateProductPosition", "fakeId", {});
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should update product position by admin",
      function (done) {
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const tag = Factory.create("tag");
        const position = {
          tag: tag._id,
          position: 0,
          weight: 0,
          updatedAt: new Date()
        };
        expect(function () {
          return Meteor.call("products/updateProductPosition",
            product._id, position);
        }).not.toThrow(new Meteor.Error(403, "Access Denied"));
        const updatedProduct = ReactionCore.Collections.Products.findOne(
          product._id
        );
        expect(updatedProduct.positions[0].tag).toEqual(tag._id);

        return done();
      }
    );
  });

  describe("updateMetaFields", () => {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/updateVariantsPosition", ["fakeId"]);
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should update variants position",
      (done) => {
        const product = faker.reaction.products.add();
        const product2 = faker.reaction.products.add();
        const product3 = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        expect(product.index).toBeUndefined();
        expect(product2.index).toBeUndefined();
        expect(product3.index).toBeUndefined();

        Meteor.call("products/updateVariantsPosition", [
          product2._id, product3._id, product._id
        ]);
        const modifiedProduct = ReactionCore.Collections.Products.findOne(
          product._id
        );
        const modifiedProduct2 = ReactionCore.Collections.Products.findOne(
          product2._id
        );
        const modifiedProduct3 = ReactionCore.Collections.Products.findOne(
          product3._id
        );
        expect(modifiedProduct.index).toBe(2);
        expect(modifiedProduct2.index).toBe(0);
        expect(modifiedProduct3.index).toBe(1);

        return done();
      }
    );
  });

  describe("updateMetaFields", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/updateMetaFields", "fakeId", {
            key: "Material",
            value: "Spandex"
          });
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should add meta fields by admin",
      function (done) {
        let product = faker.reaction.products.add();
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Meteor.call("products/updateMetaFields", product._id, {
          key: "Material",
          value: "Spandex"
        });
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.metafields[0].key).toEqual("Material");
        expect(product.metafields[0].value).toEqual("Spandex");

        return done();
      }
    );
  });

  describe("publishProduct", function () {
    it(
      "should throw 403 error by non admin",
      function () {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        spyOn(ReactionCore.Collections.Products, "update");
        expect(function () {
          return Meteor.call("products/publishProduct", "fakeId");
        }).toThrow(new Meteor.Error(403, "Access Denied"));
        expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      }
    );

    it(
      "should let admin publish product",
      function (done) {
        let product = faker.reaction.products.add();
        let isVisible = product.isVisible;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).not.toThrow(new Meteor.Error(403, "Access Denied"));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(!isVisible);

        return done();
      }
    );

    it(
      "should let admin toggle product visibility",
      function (done) {
        let product = faker.reaction.products.add();
        let isVisible = product.isVisible;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).not.toThrow(new Meteor.Error(403, "Access Denied"));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(!isVisible);
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).not.toThrow(new Meteor.Error(400, "Bad Request"));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(isVisible);

        return done();
      }
    );

    it(
      "should not publish product when missing title",
      function (done) {
        let product = faker.reaction.products.add();
        let isVisible = product.isVisible;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        ReactionCore.Collections.Products.update(product._id, {
          $set: {
            title: ""
          }
        }, {
          selector: { type: "simple" },
          validate: false
        });
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).not.toThrow(new Meteor.Error(403, "Access Denied"));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(isVisible);

        return done();
      }
    );

    it(
      "should not publish product when missing even one variant price",
      function (done) {
        let product = faker.reaction.products.add();
        const isVisible = product.isVisible;
        let variant = ReactionCore.Collections.Products.findOne({
          ancestors: [product._id]
        });
        expect(variant.ancestors).toEqual([product._id]);
        let options = ReactionCore.Collections.Products.find({
          ancestors: [product._id, variant._id]
        }).fetch();
        expect(options.length).toBe(2);
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        ReactionCore.Collections.Products.update(options[0]._id, {
          $set: {
            price: 0
          }
        }, {
          selector: { type: "variant" },
          validate: false
        });
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).toThrow(new Meteor.Error(403, "Forbidden",
          "Some properties are missing."));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(isVisible);

        return done();
      }
    );

    it(
      "should not publish product when missing variant",
      function (done) {
        let product = faker.reaction.products.add();
        let isVisible = product.isVisible;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        ReactionCore.Collections.Products.remove({
          ancestors: { $in: [product._id] }
        });
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).toThrow(new Meteor.Error(403, "Forbidden", "Variant is required"));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(isVisible);

        return done();
      }
    );
  });
});
