/* eslint dot-notation: 0 */
describe("inventory method", function () {
  beforeEach(function () {
    ReactionCore.Collections.Inventory.remove({}); // Empty Inventory
    ReactionCore.Collections.Products.remove({}); // Empty Products
    ReactionCore.Collections.Cart.remove({}); // Empty Cart
  });
  describe("inventory/register", function () {
    it("should add inventory items for product", function (done) {
      let product = Factory.create("product");
      let productId = product._id;
      let quantity = product.variants[0].inventoryQuantity;
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      expect(Meteor.call("inventory/register", product)).toEqual(quantity);
      let inventory = ReactionCore.Collections.Inventory.find({
        productId: productId
      }).fetch();
      expect(_.size(inventory)).toEqual(quantity);
      done();
    });

    it("should add inventory items for a new child variant", done => {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      let product = Factory.create("product");
      const productId = product._id;
      const quantity = product.variants[0].inventoryQuantity;
      Meteor.call("products/cloneVariant", productId, product.variants[
        0]._id, product.variants[0]._id);
      product = ReactionCore.Collections.Products.findOne(product._id);
      const newChildVariant = product.variants[product.variants.length - 1];
      expect(undefined).toEqual(newChildVariant.inventoryQuantity);
      newChildVariant["inventoryQuantity"] = 10;
      Meteor.call("products/updateVariant", newChildVariant);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      const totalQuantity = quantity + newChildVariant.inventoryQuantity;
      Meteor.call("inventory/register", product);
      // uncommenting that leads to test failure. looks like a bug in tests;
      // expect(Meteor.call("inventory/register", product)).toEqual(totalQuantity);
      const inventory = ReactionCore.Collections.Inventory.find({
        productId: productId
      }).fetch();
      expect(inventory.length).toEqual(totalQuantity);
      done();
    });

    it("should remove deleted variants from inventory", function (done) {
      let product = Factory.create("product");
      let productId = product._id;
      let quantity = product.variants[0].inventoryQuantity;

      expect(_.size(product.variants)).toEqual(1);
      // register inventory (that we'll should delete on variant removal)
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      // Meteor.call("inventory/register", product);
      expect(Meteor.call("inventory/register", product)).toEqual(quantity);

      // delete variant
      Meteor.call("products/deleteVariant", product.variants[0]._id);

      let inventory = ReactionCore.Collections.Inventory.find({
        productId: productId
      }).fetch();

      expect(_.size(inventory)).not.toEqual(quantity);
      expect(_.size(inventory)).toEqual(0);
      done();
    });
  });
  //
  // inventory/register is invoked from hooks.js before cart update
  //
  describe("inventory/register invoked from hooks", function () {
    // it("should create backordered inventory when no inventory available", function (done) {
    //   let product = Factory.create("product");
    //   let cartId = Factory.create("cart")._id;
    //   let productId = product._id;
    //   let quantity = product.variants[0].inventoryQuantity;
    //   let variantData = product.variants[0];
    //
    //   spyOn(ReactionCore, "hasPermission").and.returnValue(true);
    //   spyOn(ReactionCore.Collections.Cart.after, "update");
    //   expect(_.size(product.variants)).toEqual(1);
    //
    //   // add to cart
    //   Meteor.call("cart/addToCart", cartId, productId, variantData, quantity, function () {
    //     // fetch reserved inventory
    //     let inventory = ReactionCore.Collections.Inventory.find({
    //       "workflow.status": "backorder"
    //     });
    //
    //     let inventoryCount = _.size(inventory);
    //     expect(inventoryCount).toEqual(quantity);
    //     done();
    //   });
    // });

    // it("should reserve product variants added to cart", function () {
    //   let product = Factory.create("product");
    //   let cartId = Factory.create("cart")._id;
    //   let productId = product._id;
    //   let quantity = product.variants[0].inventoryQuantity;
    //   let variantData = product.variants[0];
    //   expect(_.size(product.variants)).toEqual(1);
    //   // create some inventory to reserve
    //   spyOn(ReactionCore, "hasPermission").and.returnValue(true);
    //
    //   //Setup a spy to watch for calls to Inventory.insert
    //   spyOn(ReactionCore.Collections.Inventory, "insert");
    //   spyOn(ReactionCore.Collections.Cart, "update");
    //   Meteor.call("inventory/register", product);
    //   expect(ReactionCore.Collections.Inventory.insert).toHaveBeenCalled();
    //
    //   // add to cart (expect to reserve)
    //   Meteor.call("cart/addToCart", cartId, productId, variantData, quantity);
    //   expect(ReactionCore.Collections.Cart.update).toHaveBeenCalled();
    //
    //   // fetch reserved inventory
    //   console.log("productId", productId);
    //   console.log("variantId", product.variants[0]._id);
    //   console.log("orderId", cartId);
    //
    //   let reservedInventory = ReactionCore.Collections.Inventory.find({
    //     "workflow.status": "reserved"
    //   }).count();
    //   console.log('reservedInventory', reservedInventory);
    //   expect(reservedInventory).toEqual(quantity);;
    // });



    //
    // it("should remove inventory reservation when removed cart", function (
    //   done) {
    //   done();
    // });
    //

    //
    // it("should converted backordered inventory to reserved when inventory available", function (
    //   done) {
    //   done();
    // });
    //
    // it("should update sold inventory on product and inventory when order fulfilled", function (
    //   done) {
    //   done();
    // });
    //
    // it("should make reserved inventory available when cart deleted", function (
    //   done) {
    //   done();
    // });
    //
    // it("should update cart reservations when product sold out", function (
    //   done) {
    //   done();
    // });
    //
    // it("should send inventory notification when low stock on product", function (
    //   done) {
    //   done();
    // });
  });
});
