/* eslint dot-notation: 0 */
describe("core product methods", function () {
  describe("products/cloneVariant", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "insert");
      expect(function () {
        return Meteor.call("products/cloneVariant", product._id,
          product.variants[0]._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.insert).not.toHaveBeenCalled();
      return done();
    });
    return it("should clone variant by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call("products/cloneVariant", product._id, product.variants[
        0]._id);
      product = Products.findOne(product._id);
      expect(_.size(product.variants)).toEqual(2);
      return done();
    });
  });
  describe("products/createVariant", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/createVariant", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    return it("should create variant by admin", function (done) {
      let product;
      let variant;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(_.size(product.variants)).toEqual(1);

      Meteor.call("products/createVariant", product._id);
      product = Products.findOne(product._id);
      variant = product.variants[1];
      expect(_.size(product.variants)).toEqual(2);
      expect(variant.title).toEqual("");
      expect(variant.price).toEqual(0);

      return done();
    });
  });
  describe("products/updateVariant", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/updateVariant", product.variants[
          0]);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
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
        updatedProduct = Products.find({
          "variants._id": variant._id
        }).fetch()[0];
        updatedVariant = updatedProduct.variants[0];
        expect(updatedVariant.price).toEqual(7);
        expect(updatedVariant.title).toEqual("Updated Title");
        return done();
      });
    return it(
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
        updatedProduct = Products.find({
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
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/updateVariants", product.variants);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    return it(
      "should update all variants by admin passing in array of objects",
      function (done) {
        let clonedVariant;
        let product;
        let updatedProduct;
        let updatedVariant;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        Meteor.call("products/cloneVariant", product._id, product.variants[
          0]._id);
        product = Products.findOne({
          "variants._id": product.variants[0]._id
        });
        product.variants[0].title = "Updated Title";
        product.variants[0].price = 7;
        product.variants[1].title = "Updated Clone Title";
        Meteor.call("products/updateVariants", product.variants);
        updatedProduct = Products.findOne({
          "variants._id": product.variants[0]._id
        });
        updatedVariant = updatedProduct.variants[0];
        clonedVariant = updatedProduct.variants[1];
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
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/deleteVariant", product.variants[
          0]._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    it("should delete variant by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call("products/deleteVariant", product.variants[0]._id);
      product = Products.findOne(product._id);
      expect(_.size(product.variants)).toEqual(0);
      return done();
    });
    return it("should delete all child variants (options) by admin",
      function (done) {
        let product;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        Meteor.call("products/cloneVariant", product._id, product.variants[
          0]._id, product.variants[0]._id);
        product = Products.findOne(product._id);
        expect(_.size(product.variants)).toEqual(2);
        Meteor.call("products/deleteVariant", product.variants[0]._id);
        product = Products.findOne(product._id);
        expect(_.size(product.variants)).toEqual(0);
        return done();
      });
  });
  describe("products/createInventoryVariant", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      let variant;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      variant = product.variants[0];
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/createInventoryVariant",
          product._id, variant._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    it("should create default barcode inventory variant by admin",
      function (done) {
        let inventoryVariant;
        let product;
        let variant;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        variant = product.variants[0];
        expect(_.size(product.variants)).toEqual(1);
        Meteor.call("products/createInventoryVariant", product._id,
          variant._id);
        product = Products.findOne(product._id);
        inventoryVariant = product.variants[1];
        expect(_.size(product.variants)).toEqual(2);
        expect(inventoryVariant.type).toEqual("inventory");
        expect(inventoryVariant.parentId).toEqual(variant._id);
        return done();
      });
    return it(
      "should create specific barcode inventory variant by admin",
      function (done) {
        let inventoryVariant;
        let inventoryVariantOptions;
        let product;
        let variant;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        variant = product.variants[0];
        inventoryVariantOptions = {
          barcode: "specificBarcode123"
        };
        expect(_.size(product.variants)).toEqual(1);
        Meteor.call("products/createInventoryVariant", product._id,
          variant._id, inventoryVariantOptions);
        product = Products.findOne(product._id);
        inventoryVariant = product.variants[1];
        expect(_.size(product.variants)).toEqual(2);
        expect(inventoryVariant.type).toEqual("inventory");
        expect(inventoryVariant.parentId).toEqual(variant._id);
        expect(inventoryVariant.barcode).toEqual(
          inventoryVariantOptions.barcode);
        return done();
      });
  });
  describe("products/createInventoryVariants", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      let variant;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      variant = product.variants[0];
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/createInventoryVariants",
          product._id, variant._id, 5);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    it("should create default inventory variants by admin", function (
      done) {
      let inventoryVariant;
      let product;
      let qty;
      let variant;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      variant = product.variants[0];
      qty = _.random(1, 100);
      expect(_.size(product.variants)).toEqual(1);
      Meteor.call("products/createInventoryVariants", product._id,
        variant._id, qty);
      product = Products.findOne(product._id);
      variant = product.variants[0];
      inventoryVariant = product.variants[1];
      expect(_.size(product.variants)).toEqual(qty + 1);
      expect(inventoryVariant.type).toEqual("inventory");
      expect(inventoryVariant.parentId).toEqual(variant._id);
      expect(variant.inventoryQuantity).toEqual(qty);
      return done();
    });
    it("should create inventory variants with prefix by admin",
      function (done) {
        let inventoryVariant;
        let product;
        let qty;
        let variant;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        variant = product.variants[0];
        qty = _.random(1, 100);
        expect(_.size(product.variants)).toEqual(1);
        Meteor.call("products/createInventoryVariants", product._id,
          variant._id, qty, "jasmine");
        product = Products.findOne(product._id);
        variant = product.variants[0];
        inventoryVariant = product.variants[1];
        expect(_.size(product.variants)).toEqual(qty + 1);
        expect(inventoryVariant.type).toEqual("inventory");
        expect(inventoryVariant.parentId).toEqual(variant._id);
        expect(inventoryVariant.barcode).toContain("jasmine");
        expect(variant.inventoryQuantity).toEqual(qty);
        return done();
      });
    return it("should create inventory variants with prefix by admin",
      function (done) {
        // let initialQty;
        let inventoryVariant;
        let optionVariant;
        let optionVariantId;
        let product;
        let productVariant;
        let qty;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        productVariant = product.variants[0];
        qty = _.random(1, 100);
        initialQty = productVariant.inventoryQuantity;
        expect(_.size(product.variants)).toEqual(1);
        optionVariantId = Meteor.call("products/cloneVariant",
          product._id, productVariant._id, productVariant._id);

        Meteor.call("products/createInventoryVariants", product._id,
          optionVariantId, qty, "jasmine");
        product = Products.findOne(product._id);
        productVariant = product.variants[0];
        optionVariant = ((function () {
          let _results = [];
          for (let variant of product.variants) {
            if (variant._id === optionVariantId) {
              _results.push(variant);
            }
          }
          return _results;
        })())[0];

        inventoryVariant = ((function () {
          let _results = [];
          for (let variant of product.variants) {
            if (variant.type === "inventory") {
              _results.push(variant);
            }
          }
          return _results;
        })())[0];

        expect(_.size(product.variants)).toEqual(qty + 2);
        expect(inventoryVariant.type).toEqual("inventory");
        expect(inventoryVariant.parentId).toEqual(optionVariant._id);
        expect(inventoryVariant.barcode).toContain("jasmine");
        expect(optionVariant.inventoryQuantity).toEqual(qty);
        expect(productVariant.inventoryQuantity).toEqual(qty);
        return done();
      });
  });
  describe("createProduct", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(Products, "insert");
      expect(function () {
        return Meteor.call("products/createProduct");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.insert).not.toHaveBeenCalled();
      return done();
    });
    return it("should create new product by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(Products, "insert").and.returnValue(1);
      expect(Meteor.call("products/createProduct")).toEqual(1);
      expect(Products.insert).toHaveBeenCalled();
      return done();
    });
  });
  describe("deleteProduct", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(Products, "remove");
      product = Factory.create("product");
      expect(function () {
        return Meteor.call("products/deleteProduct", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.remove).not.toHaveBeenCalled();
      return done();
    });
    return it("should delete product by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(Products.find().count()).toEqual(1);
      expect(Meteor.call("products/deleteProduct", product._id)).toBe(
        true);
      expect(Products.find().count()).toEqual(0);
      return done();
    });
  });
  describe("products/cloneProduct", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "insert");
      expect(function () {
        return Meteor.call("products/cloneProduct", product);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.insert).not.toHaveBeenCalled();
      return done();
    });
    return it("should clone product by admin", function (done) {
      let product;
      let productCloned;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      expect(Products.find().count()).toEqual(1);
      Meteor.call("products/cloneProduct", product);
      expect(Products.find().count()).toEqual(2);
      productCloned = Products.find({
        _id: {
          $ne: product._id
        }
      }).fetch()[0];
      expect(productCloned.title).toEqual(product.title + "1");
      expect(productCloned.pageTitle).toEqual(product.pageTitle);
      expect(productCloned.description).toEqual(product.description);
      return done();
    });
  });
  describe("updateProductField", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/updateProductField",
          product._id, "title", "Updated Title");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    return it("should update product field by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      Meteor.call("products/updateProductField", product._id,
        "title", "Updated Title");
      product = Products.findOne({
        _id: product._id
      });
      expect(product.title).toEqual("Updated Title");
      return done();
    });
  });
  describe("updateProductTags", function () {
    beforeEach(function () {
      Products.remove({});
      return Tags.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      spyOn(Tags, "insert");
      expect(function () {
        return Meteor.call("products/updateProductTags",
          product._id, "productTag", null);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      expect(Tags.insert).not.toHaveBeenCalled();
      return done();
    });
    it("should add new tag when passed tag name and null ID by admin",
      function (done) {
        // let newTag;
        let product;
        let tag;
        let tagName;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        tagName = "Product Tag";
        newTag = {
          slug: getSlug(tagName),
          name: tagName
        };
        expect(Tags.findOne({
          name: tagName
        })).toEqual(void 0);
        Meteor.call("products/updateProductTags", product._id,
          tagName, null);
        tag = Tags.findOne({
          name: tagName
        });
        expect(tag.slug).toEqual(getSlug(tagName));
        product = Products.findOne({
          _id: product._id
        });
        expect(product.hashtags).toContain(tag._id);
        return done();
      });
    return it(
      "should add existing tag when passed existing tag and tag._id by admin",
      function (done) {
        let product;
        let tag;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        tag = Factory.create("tag");
        expect(Tags.find().count()).toEqual(1);
        expect(product.hashtags).not.toContain(tag._id);
        Meteor.call("products/updateProductTags", product._id, tag.name,
          tag._id);
        expect(Tags.find().count()).toEqual(1);
        product = Products.findOne({
          _id: product._id
        });
        expect(product.hashtags).toContain(tag._id);
        return done();
      });
  });
  describe("removeProductTag", function () {
    beforeEach(function () {
      Products.remove({});
      return Tags.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      tag = Factory.create("tag");
      spyOn(Products, "update");
      spyOn(Tags, "remove");
      expect(function () {
        return Meteor.call("products/removeProductTag", product
          ._id, tag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      expect(Tags.remove).not.toHaveBeenCalled();
      return done();
    });
    return it("should remove product tag by admin", function (done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      tag = Factory.create("tag");
      Meteor.call("products/updateProductTags", product._id, tag.name,
        tag._id);
      product = Products.findOne({
        _id: product._id
      });
      expect(product.hashtags).toContain(tag._id);
      expect(Tags.find().count()).toEqual(1);
      Meteor.call("products/removeProductTag", product._id, tag._id);
      product = Products.findOne({
        _id: product._id
      });
      expect(product.hashtags).not.toContain(tag._id);
      expect(Tags.find().count()).toEqual(0);
      return done();
    });
  });
  describe("setHandleTag", function () {
    beforeEach(function () {
      Products.remove({});
      return Tags.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      tag = Factory.create("tag");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/setHandleTag", product._id,
          tag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    return it("should set handle tag for product by admin", function (
      done) {
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      tag = Factory.create("tag");
      Meteor.call("products/setHandleTag", product._id, tag._id);
      product = Products.findOne({
        _id: product._id
      });
      expect(product.handle).toEqual(tag.slug);
      return done();
    });
  });
  describe("updateProductPosition", function () {
    beforeEach(function () {
      Products.remove({});
      return Tags.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/updateProductPosition",
          product._id, {});
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    return it("should update product position by admin", function (done) {
      let position;
      let product;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      tag = Factory.create("tag");
      position = {
        tag: tag._id,
        position: 0,
        weight: 0,
        updatedAt: new Date()
      };
      Meteor.call("products/updateProductPosition", product._id,
        position);
      product = Products.findOne(product._id);
      expect(product.positions[0].tag).toEqual(tag._id);
      return done();
    });
  });
  describe("updateMetaFields", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/updateMetaFields", product
          ._id, {
            key: "Material",
            value: "Spandex"
          });
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
      return done();
    });
    return it("should add meta fields by admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      Meteor.call("products/updateMetaFields", product._id, {
        key: "Material",
        value: "Spandex"
      });
      product = Products.findOne(product._id);
      expect(product.metafields[0].key).toEqual("Material");
      expect(product.metafields[0].value).toEqual("Spandex");
      return done();
    });
  });
  return describe("publishProduct", function () {
    beforeEach(function () {
      return Products.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      product = Factory.create("product");
      spyOn(Products, "update");
      expect(function () {
        return Meteor.call("products/publishProduct", product._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Products.update).not.toHaveBeenCalled();
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
      product = Products.findOne(product._id);
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
      product = Products.findOne(product._id);
      expect(product.isVisible).toEqual(!isVisible);
      expect(function () {
        return Meteor.call("products/publishProduct", product._id);
      }).not.toThrow(new Meteor.Error(400, "Bad Request"));
      product = Products.findOne(product._id);
      expect(product.isVisible).toEqual(isVisible);
      return done();
    });
    it("should not publish product when missing title", function (done) {
      let isVisible;
      let product;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      product = Factory.create("product");
      isVisible = product.isVisible;
      Products.update(product._id, {
        $set: {
          title: ""
        }
      }, {
        validate: false
      });
      expect(function () {
        return Meteor.call("products/publishProduct", product._id);
      }).not.toThrow(new Meteor.Error(403, "Access Denied"));
      product = Products.findOne(product._id);
      expect(product.isVisible).toEqual(isVisible);
      return done();
    });
    return it("should not publish product when missing variant",
      function (done) {
        let isVisible;
        let product;
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        product = Factory.create("product");
        isVisible = product.isVisible;
        Products.update(product._id, {
          $set: {
            variants: []
          }
        }, {
          validate: false
        });
        expect(function () {
          return Meteor.call("products/publishProduct", product._id);
        }).not.toThrow(new Meteor.Error(403, "Access Denied"));
        product = Products.findOne(product._id);
        expect(product.isVisible).toEqual(isVisible);
        return done();
      });
  });
});
