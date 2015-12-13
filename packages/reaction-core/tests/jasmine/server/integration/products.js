/* eslint dot-notation: 0 */
describe("core product methods", function () {
  describe("products/cloneVariant", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "insert");
      expect(function () {
        return Meteor.call("products/cloneVariant", product._id,
          product.variants[0]._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      return done();
    });

    it("should clone variant by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call("products/cloneVariant", product._id, product.variants[
        0]._id);
      product = ReactionCore.Collections.Products.findOne(product._id);
      expect(_.size(product.variants)).toEqual(2);
      return done();
    });

    it(
      "`child variant` cloned from `variant` should inherit his `_id` in `parentId` property",
      done => {
        let product;
        product = Factory.create("product");
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        Meteor.call("products/cloneVariant", product._id, product.variants[
            0]._id,
          product.variants[0]._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.variants.length).toEqual(2);
        expect(product.variants[1].parentId).toEqual(product.variants[
          0]._id);
        return done();
      });

    it(
      "cloned `variant` should have `cloneId` property equal with source `_id`",
      done => {
        let product;
        product = Factory.create("product");
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        Meteor.call("products/cloneVariant", product._id, product.variants[
          0]._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.variants[1].cloneId).toEqual(product.variants[
          0]._id);
        return done();
      });

    it(
      "number of `child variants` between source and cloned `variants` " +
      "should be equal", done => {
        let product;
        product = Factory.create("product");
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        Meteor.call("products/cloneVariant", product._id, product.variants[
            0]._id,
          product.variants[0]._id);
        Meteor.call("products/cloneVariant", product._id, product.variants[
            0]._id,
          product.variants[0]._id);
        Meteor.call("products/cloneVariant", product._id, product.variants[
          0]._id);
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.variants.length).toEqual(6);
        return done();
      });

    it(
      "`variant` and `child variants` media should be intherited when " +
      "cloning", done => {
        return done();
      });
  });

  describe("products/createVariant", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/createVariant", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should create variant by admin", function (done) {
      let product;
      let variant;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(_.size(product.variants)).toEqual(1);

      Meteor.call("products/createVariant", product._id);
      product = ReactionCore.Collections.Products.findOne(product._id);
      variant = product.variants[1];
      expect(_.size(product.variants)).toEqual(2);
      expect(variant.title).toEqual("");
      expect(variant.price).toEqual(0);

      return done();
    });
  });

  describe("products/updateVariant", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/updateVariant", product.variants[
          0]);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it(
      "should update individual variant by admin passing in full object",
      function (done) {
        let product;
        let updatedProduct;
        let updatedVariant;
        let variant;

        spyOn(Roles, "userIsInRole").and.returnValue(true);

        product = Factory.create("product");
        variant = product.variants[0];
        variant["title"] = "Updated Title";
        variant["price"] = 7;
        Meteor.call("products/updateVariant", variant);
        updatedProduct = ReactionCore.Collections.Products.find({
          "variants._id": variant._id
        }).fetch()[0];
        updatedVariant = updatedProduct.variants[0];
        expect(updatedVariant.price).toEqual(7);
        expect(updatedVariant.title).toEqual("Updated Title");
        return done();
      });

    it(
      "should update individual variant by admin passing in partial object",
      function (done) {
        let product;
        let updatedProduct;
        let updatedVariant;
        let variant;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        variant = product.variants[0];
        Meteor.call("products/updateVariant", {
          _id: variant._id,
          title: "Updated Title",
          price: 7
        });
        updatedProduct = ReactionCore.Collections.Products.find({
          "variants._id": variant._id
        }).fetch()[0];
        updatedVariant = updatedProduct.variants[0];
        expect(updatedVariant.price).toEqual(7);
        expect(updatedVariant.title).toEqual("Updated Title");
        expect(updatedVariant.optionTitle).toEqual(variant.optionTitle);
        return done();
      });
  });

  describe("products/updateVariants", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/updateVariants", product.variants);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it(
      "should update all variants by admin passing in array of objects",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        let product = Factory.create("product");
        Meteor.call("products/cloneVariant", product._id, product.variants[
          0]._id);
        product = ReactionCore.Collections.Products.findOne({
          "variants._id": product.variants[0]._id
        });
        product.variants[0].title = "Updated Title";
        product.variants[0].price = 7;
        product.variants[1].title = "Updated Clone Title";
        // update variant
        Meteor.call("products/updateVariants", product.variants);
        // check update
        const updatedProduct = ReactionCore.Collections.Products.findOne({
          "variants._id": product.variants[0]._id
        });
        const updatedVariant = updatedProduct.variants[0];
        const clonedVariant = updatedProduct.variants[1];
        expect(updatedVariant.price).toEqual(7);
        expect(updatedVariant.title).toEqual("Updated Title");
        expect(clonedVariant.title).toEqual("Updated Clone Title");
        expect(clonedVariant.optionTitle).toEqual(product.variants[1]
          .optionTitle);
        return done();
      });
  });

  describe("products/deleteVariant", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      let product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/deleteVariant", product.variants[
          0]._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should delete variant by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      let product = Factory.create("product");
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call("products/deleteVariant", product.variants[0]._id);
      product = ReactionCore.Collections.Products.findOne(product._id);
      expect(_.size(product.variants)).toEqual(0);
      return done();
    });

    // it("should delete all child variants (options) by admin",
    //   function (done) {
    //     spyOn(Roles, "userIsInRole").and.returnValue(true);
    //     spyOn(ReactionCore, "hasPermission").and.returnValue(true);
    //     let product = Factory.create("product");
    //     Meteor.call("products/cloneVariant", product._id, product.variants[
    //         0]._id,
    //       product.variants[0]._id);
    //     product = Products.findOne(product._id);
    //     expect(_.size(product.variants)).toEqual(2);
    //     Meteor.call("products/deleteVariant", product.variants[0]._id);
    //     product = Products.findOne(product._id);
    //     expect(_.size(product.variants)).toEqual(0);
    //     return done();
    //   });
  });

  describe("createProduct", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Products, "insert");
      expect(function () {
        return Meteor.call("products/createProduct");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      return done();
    });

    it("should create new product by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore.Collections.Products, "insert").and.returnValue(1);
      expect(Meteor.call("products/createProduct")).toEqual(1);
      expect(ReactionCore.Collections.Products.insert).toHaveBeenCalled();
      return done();
    });
  });

  describe("deleteProduct", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Products, "remove");
      product = Factory.create("product");
      expect(function () {
        return Meteor.call("products/deleteProduct", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.remove).not.toHaveBeenCalled();
      return done();
    });

    it("should delete product by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(ReactionCore.Collections.Products.find().count()).toEqual(1);
      expect(Meteor.call("products/deleteProduct", product._id)).toBe(
        true);
      expect(ReactionCore.Collections.Products.find().count()).toEqual(0);
      return done();
    });
  });

  describe("products/cloneProduct", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "insert");
      expect(function () {
        return Meteor.call("products/cloneProduct", product);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.insert).not.toHaveBeenCalled();
      return done();
    });

    it("should clone product by admin", function (done) {
      let product;
      let productCloned;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(ReactionCore.Collections.Products.find().count()).toEqual(1);

      // console.log("product: ", product)
      Meteor.call("products/cloneProduct", product);
      expect(ReactionCore.Collections.Products.find().count()).toEqual(2);
      productCloned = ReactionCore.Collections.Products.find({
        _id: {
          $ne: product._id
        }
      }).fetch()[0];
      expect(productCloned.title).toEqual(product.title);
      expect(productCloned.handle).toEqual(product.handle + "-copy");
      expect(productCloned.pageTitle).toEqual(product.pageTitle);
      expect(productCloned.description).toEqual(product.description);
      return done();
    });

    it(
      "product should be cloned with all variants and child variants with equal data," +
      "but not the same `_id`s",
      done => {
        // let product;
        // spyOn(Roles, "userIsInRole").and.returnValue(true);
        // product = Factory.create("product");
        // for (let i = 0; i < 2; i++) {
        //   Meteor.call("products/cloneVariant", product._id, product.variants[
        //       0]._id,
        //     product.variants[0]._id);
        // }
        // product = Products.findOne(product._id);
        // expect(product.variants.length).toEqual(3);
        // const variant = Object.assign({}, product.variants[0], {
        //   title: "test variant 1",
        //   price: 7
        // });
        // const optionOne = Object.assign({}, product.variants[1], {
        //   title: "test option 1",
        //   price: 7,
        //   inventoryQuantity: 10
        // });
        // const optionTwo = Object.assign({}, product.variants[2], {
        //   title: "test option 2",
        //   price: 17,
        //   inventoryQuantity: 20
        // });
        // Meteor.call("products/updateVariant", variant);
        // Meteor.call("products/updateVariant", optionOne);
        // Meteor.call("products/updateVariant", optionTwo);
        // Meteor.call("products/cloneProduct", product);
        // const productCloned = Products.find({
        //   _id: {
        //     $ne: product._id
        //   }
        // }).fetch()[0];
        // expect(productCloned.variants[0].title).toEqual(product.variants[
        //   0].title);
        // expect(productCloned.variants[0].price).toEqual(product.variants[
        //   0].price);
        // expect(productCloned.variants[0]._id).not.toEqual(product.variants[
        //   0]._id);
        //
        // expect(productCloned.variants[1].title).toEqual(product.variants[
        //   1].title);
        // expect(productCloned.variants[1].price).toEqual(product.variants[
        //   1].price);
        // expect(productCloned.variants[1].inventoryQuantity)
        //   .toEqual(product.variants[1].inventoryQuantity);
        // expect(productCloned.variants[1]._id).not.toEqual(product.variants[
        //   1]._id);
        // expect(productCloned.variants[1].parentId).toEqual(
        //   productCloned.variants[0]._id);
        //
        // expect(productCloned.variants[2].title).toEqual(product.variants[
        //   2].title);
        // expect(productCloned.variants[2].price).toEqual(product.variants[
        //   2].price);
        // expect(productCloned.variants[2].inventoryQuantity)
        //   .toEqual(product.variants[2].inventoryQuantity);
        // expect(productCloned.variants[2]._id).not.toEqual(product.variants[
        //   2]._id);
        // expect(productCloned.variants[2].parentId).toEqual(
        //   productCloned.variants[0]._id);

        return done();
      });

    it(
      "product group cloning should create the same number of new products",
      done => {
        return done();
      });

    it("all hierarchy media should be cloned", done => {
      return done();
    });
  });

  describe("updateProductField", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/updateProductField",
          product._id, "title", "Updated Title");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should update product field by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      Meteor.call("products/updateProductField", product._id,
        "title", "Updated Title");
      product = ReactionCore.Collections.Products.findOne({
        _id: product._id
      });
      expect(product.title).toEqual("Updated Title");
      return done();
    });
  });

  describe("updateProductTags", function () {
    beforeEach(function () {
      ReactionCore.Collections.Products.remove({});
      ReactionCore.Collections.Shops.remove({});
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      spyOn(ReactionCore.Collections.Tags, "insert");
      expect(function () {
        return Meteor.call("products/updateProductTags",
          product._id, "productTag", null);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      expect(ReactionCore.Collections.Tags.insert).not.toHaveBeenCalled();
      return done();
    });

    it("should add new tag when passed tag name and null ID by admin",
      function (done) {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        Factory.create("shop"); // Create shop so that ReactionCore.getShopId() doesn't fail
        let product = Factory.create("product");
        let tagName = "Product Tag";
        expect(ReactionCore.Collections.Tags.findOne({
          name: tagName
        })).toEqual(void 0);

        Meteor.call("products/updateProductTags", product._id,
          tagName, null);
        let tag = ReactionCore.Collections.Tags.findOne({
          name: tagName
        });
        expect(tag.slug).toEqual(getSlug(tagName));

        product = ReactionCore.Collections.Products.findOne({
          _id: product._id
        });
        expect(product.hashtags).toContain(tag._id);
        return done();
      });

    it(
      "should add existing tag when passed existing tag and tag._id by admin",
      function (done) {
        let product;
        let tag;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        tag = Factory.create("tag");
        expect(ReactionCore.Collections.Tags.find().count()).toEqual(1);
        expect(product.hashtags).not.toContain(tag._id);
        Meteor.call("products/updateProductTags", product._id, tag.name,
          tag._id);
        expect(ReactionCore.Collections.Tags.find().count()).toEqual(1);
        product = ReactionCore.Collections.Products.findOne({
          _id: product._id
        });
        expect(product.hashtags).toContain(tag._id);
        return done();
      });
  });
  describe("removeProductTag", function () {
    beforeEach(function () {
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      tag = Factory.create("tag");
      spyOn(ReactionCore.Collections.Products, "update");
      spyOn(ReactionCore.Collections.Tags, "remove");
      expect(function () {
        return Meteor.call("products/removeProductTag", product
          ._id, tag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      expect(ReactionCore.Collections.Tags.remove).not.toHaveBeenCalled();
      return done();
    });

    it("should remove product tag by admin", function (done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      tag = Factory.create("tag");
      Meteor.call("products/updateProductTags", product._id, tag.name,
        tag._id);
      product = ReactionCore.Collections.Products.findOne({
        _id: product._id
      });
      expect(product.hashtags).toContain(tag._id);
      expect(ReactionCore.Collections.Tags.find().count()).toEqual(1);
      Meteor.call("products/removeProductTag", product._id, tag._id);
      product = ReactionCore.Collections.Products.findOne({
        _id: product._id
      });
      expect(product.hashtags).not.toContain(tag._id);
      expect(ReactionCore.Collections.Tags.find().count()).toEqual(0);
      return done();
    });
  });

  describe("setHandle", () => {
    beforeEach(() => {
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", done => {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Products, "update");
      const product = Factory.create("product");
      expect(() => Meteor.call("products/setHandle", product._id))
        .toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should set handle for product by admin", done => {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      let product = Factory.create("product");
      const productHandle = product.handle;
      Meteor.call("products/updateProductField", product._id,
        "title", "new product name");
      Meteor.call("products/setHandle", product._id);
      product = ReactionCore.Collections.Products.findOne({
        _id: product._id
      });
      expect(product.handle).not.toEqual(productHandle);
      return done();
    });

    it("should set handle correctly", done => {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      let product = Factory.create("product");
      Meteor.call("products/updateProductField", product._id,
        "title", "new product name");
      Meteor.call("products/setHandle", product._id);
      product = ReactionCore.Collections.Products.findOne({
        _id: product._id
      });
      expect(product.handle).toEqual("new-product-name");
      return done();
    });

    it("products with the same title should receive correct handle",
      done => {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        let product = Factory.create("product");
        Meteor.call("products/cloneProduct", product);
        Meteor.call("products/cloneProduct", product);
        let newProducts = ReactionCore.Collections.Products.find({
          _id: {
            $ne: product._id
          }
        }).fetch();
        const productCloned = newProducts[0];
        const productCloned2 = newProducts[1];
        expect(productCloned.handle).toEqual(product.handle + "-copy");
        expect(productCloned2.handle).toEqual(product.handle +
          "-copy-2");
        return done();
      });
  });

  describe("setHandleTag", function () {
    beforeEach(function () {
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      tag = Factory.create("tag");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/setHandleTag", product._id,
          tag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should set handle tag for product by admin", function (
      done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      let product = Factory.create("product");
      let tag = Factory.create("tag");

      Meteor.call("products/setHandleTag", product._id, tag._id);
      product = ReactionCore.Collections.Products.findOne({
        _id: product._id
      });
      expect(product.handle).toEqual(tag.slug);
      return done();
    });
  });

  describe("updateProductPosition", function () {
    beforeEach(function () {
      ReactionCore.Collections.Products.remove({});
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      const product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/updateProductPosition",
          product._id, {});
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should update product position by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);

      const product = Factory.create("product");
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

      const updatedProduct = ReactionCore.Collections.Products.findOne(product._id);
      expect(updatedProduct.positions[0].tag).toEqual(tag._id);
      return done();
    });
  });

  describe("updateMetaFields", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/updateMetaFields", product
          ._id, {
            key: "Material",
            value: "Spandex"
          });
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should add meta fields by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      });
      product = ReactionCore.Collections.Products.findOne(product._id);
      expect(product.metafields[0].key).toEqual("Material");
      expect(product.metafields[0].value).toEqual("Spandex");
      return done();
    });
  });

  describe("publishProduct", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Products.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(ReactionCore.Collections.Products, "update");
      expect(function () {
        return Meteor.call("products/publishProduct", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Products.update).not.toHaveBeenCalled();
      return done();
    });

    it("should let admin publish product", function (done) {
      let isVisible;
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      isVisible = product.isVisible;
      expect(function () {
        return Meteor.call("products/publishProduct", product._id);
      }).not.toThrow(new Meteor.Error(403, "Access Denied"));
      product = ReactionCore.Collections.Products.findOne(product._id);
      expect(product.isVisible).toEqual(!isVisible);
      return done();
    });

    it("should let admin toggle product visibility", function (done) {
      let isVisible;
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      isVisible = product.isVisible;
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
    });

    it("should not publish product when missing title", function (done) {
      let isVisible;
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      isVisible = product.isVisible;
      ReactionCore.Collections.Products.direct.update(product._id, {
        $set: {
          title: ""
        }
      }, {
        validate: false
      });
      expect(function () {
        return Meteor.call("products/publishProduct", product._id);
      }).not.toThrow(new Meteor.Error(403, "Access Denied"));
      product = ReactionCore.Collections.Products.findOne(product._id);
      expect(product.isVisible).toEqual(isVisible);
      return done();
    });

    it("should not publish product when missing variant",
      function (done) {
        let isVisible;
        let product;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        isVisible = product.isVisible;
        ReactionCore.Collections.Products.update(product._id, {
          $set: {
            variants: []
          }
        }, {
          validate: false
        });
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).not.toThrow(new Meteor.Error(403, "Access Denied"));
        product = ReactionCore.Collections.Products.findOne(product._id);
        expect(product.isVisible).toEqual(isVisible);
        return done();
      });
  });
});
