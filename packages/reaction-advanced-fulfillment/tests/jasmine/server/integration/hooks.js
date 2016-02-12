beforeAll(function () {
  VelocityHelpers.exportGlobals();
});
describe('getoutfitted:reaction-advanced-fulfillment hooks', function () {
  beforeEach(function () {
    ReactionCore.Collections.Cart.remove({});
    ReactionCore.Collections.Orders.remove({});
  });
  describe('after_copyCartToOrder.js', function () {
    it('should update the order after the method is called', function () {
      let user = Factory.create('user');
      let cart = Factory.create('cart', {
        userId: user._id
      });
      spyOn(ReactionCore.Collections.Orders, 'insert').and.callThrough();
      Meteor.call('cart/copyCartToOrder', cart._id);
      expect(ReactionCore.Collections.Orders.insert).toHaveBeenCalled();
      let order = ReactionCore.Collections.Orders.findOne({cartId: cart._id});
      expect(order.advancedFulfillment.workflow.status).toBe('orderCreated');
    });
  });
});
