/* eslint dot-notation: 0 */

describe("inventory method", function () {
  let product;
  let variant;
  let options;
  let quantity;
  // The thing is... the `inventory/register` called when we creating product
  // and variants within `beforeAll`, so we need to remove all it insert first
  // time before running specs.
  beforeAll(() => {
    spyOn(Roles, "userIsInRole").and.returnValue(true);
    product = faker.reaction.products.add();
    variant = ReactionCore.Collections.Products.findOne({
      ancestors: [product._id]
    });
    options = ReactionCore.Collections.Products.find({
      ancestors: [product._id, variant._id]
    }).fetch();
    quantity = options[0].inventoryQuantity;
  });

  beforeEach(function () {
    // again hack. w/o this we can't remove products from previous spec.
    ReactionCore.Collections.Inventory.remove({}); // Empty Inventory
  });

  describe("inventory/register", function () {
    it(
      "should add inventory items for child variant",
      function (done) {
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        let inventory = ReactionCore.Collections.Inventory.find({
          variantId: options[0]._id
        }).count();
        expect(inventory).toEqual(0);

        Meteor.call("inventory/register", options[0]);
        inventory = ReactionCore.Collections.Inventory.find({
          variantId: options[0]._id
        }).count();
        expect(inventory).toEqual(quantity);

        return done();
      }
    );
  });

  describe("inventory/remove", function () {
    it(
      "should remove deleted variants from inventory",
      function (done) {
        // register inventory (that we'll should delete on variant removal)
        spyOn(ReactionCore, "hasPermission").and.returnValue(true);
        // checking our option quantity. It should be greater than zero.
        let qty =  options[1].inventoryQuantity;
        expect(qty).toBeGreaterThan(0);

        // before spec we're cleared collection, so we need to insert all docs
        // again and make sure quantity will be equal with `qty`
        Meteor.call("inventory/register", options[1]);
        let midQty = ReactionCore.Collections.Inventory.find({
          variantId: options[1]._id
        }).count();
        expect(midQty).toEqual(qty);

        // then we are removing option and docs should be automatically removed
        Meteor.call("products/deleteVariant", options[1]._id);
        let newQty = ReactionCore.Collections.Inventory.find({
          variantId: options[1]._id
        }).count();
        expect(newQty).not.toEqual(qty);
        expect(newQty).toEqual(0);

        return done();
      }
    );
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
