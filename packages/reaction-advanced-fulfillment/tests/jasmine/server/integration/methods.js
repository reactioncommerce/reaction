beforeAll(function () {
  VelocityHelpers.exportGlobals();
});

describe('getoutfitted:reaction-advanced-fulfillment methods', function () {
  describe('advancedFulfillment/updateOrderWorkflow', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should initially have a new workflow status', function () {
      let Order = Factory.create('orderForAF');
      expect(Order.advancedFulfillment).toBeDefined();
      expect(Order.advancedFulfillment.workflow.status).toEqual('new');
    });
    it('should not have any history events', function () {
      let Order = Factory.create('orderForAF');
      expect(Order.history.length).toEqual(0);
    });
    it('should update Order after being called', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update');
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
    });
    it('should update create a history object on order with correct event and userID', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      expect(Order.history.length).toEqual(0);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      let thisOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(thisOrder.history.length).toEqual(1);
      expect(thisOrder.history[0].event).toEqual('orderPicking');
      expect(thisOrder.history[0].userId).toEqual(User._id);
    });
    it('should update the advancedFulfillment workflow', function () {
      let Order = Factory.create('orderForAF');
      let User = Factory.create('user');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      let thisOrder = ReactionCore.Collections.Orders.findOne(Order._id).advancedFulfillment;
      expect(thisOrder.workflow.status).toEqual('orderPicking');
      expect(thisOrder.workflow.workflow.length).toEqual(1);
      expect(thisOrder.workflow.workflow).toContain('orderCreated');
    });
    it('should throw an error if not passed a valid orderid', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      }).not.toThrow();
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', 1234, User._id, 'orderCreated');
      }).toThrow();
    });
    it('should throw an error if not passed a valid userid', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      }).not.toThrow();
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, true, 'orderCreated');
      }).toThrow();
    });
    it('should throw an error if not passed a valid status', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update');
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      }).not.toThrow();
      expect(function () {
        return Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, true);
      }).toThrow();
    });
    it('should be able to be called multiple times and update the history and work flow', function () {
      let User = Factory.create('user');
      let Order = Factory.create('orderForAF');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, 'orderCreated');
      let thisOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      Meteor.call('advancedFulfillment/updateOrderWorkflow', Order._id, User._id, thisOrder.advancedFulfillment.workflow.status);
      thisOrder = ReactionCore.Collections.Orders.findOne(Order._id);
      expect(thisOrder.history.length).toBe(2);
      expect(thisOrder.advancedFulfillment.workflow.workflow.length).toBe(2);
      expect(thisOrder.advancedFulfillment.workflow.status).toBe('orderPacking');
    });
  });
  describe('advancedFulfillment/updateItemWorkflow', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update the order when it is called', function () {
      let OrderWithItems = Factory.create('newOrder');
      let itemId = OrderWithItems.advancedFulfillment.items[0]._id;
      let itemStatus = OrderWithItems.advancedFulfillment.workflow.status;
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      Meteor.call('advancedFulfillment/updateItemWorkflow', OrderWithItems._id, itemId, itemStatus);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
    });
    it('should update the items workflow when called', function () {
      let User = Factory.create('user');
      let OrderWithItems = Factory.create('newOrder', {
        'advancedFulfillment.workflow.status': 'orderPicking',
        'history': [{
          event: 'orderCreated',
          userId: User._id,
          updatedAt: new Date()
        }, {
          event: 'orderPicking',
          userId: User._id,
          updatedAt: new Date()
        }]
      });
      let items = OrderWithItems.advancedFulfillment.items;
      let itemId = OrderWithItems.advancedFulfillment.items[0]._id;
      let thisItem = _.findWhere(items, {_id: itemId});
      expect(thisItem.workflow.status).toBe('In Stock');
      let itemStatus = OrderWithItems.advancedFulfillment.items[0].workflow.status;
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      Meteor.call('advancedFulfillment/updateItemWorkflow', OrderWithItems._id, itemId, itemStatus);
      let thisOrder = ReactionCore.Collections.Orders.findOne(OrderWithItems._id);
      let thisitems = thisOrder.advancedFulfillment.items;
      let thisitemId = thisOrder.advancedFulfillment.items[0]._id;
      let thisItem2 = _.findWhere(thisitems, {_id: thisitemId});
      expect(thisItem2.workflow.status).toBe('picked');
    });
  });
  describe('advancedFulfillment/updateAllItemsToShipped', function () {
    beforeEach(function () {
      return ReactionCore.Collections.Orders.remove({});
    });
    it('should update each of the items to shipped', function () {
      let FulfilledOrder = Factory.create('fulfilledOrder');
      let initialItems = FulfilledOrder.advancedFulfillment.items;
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      let allPacked = _.every(initialItems, function (item) {
        return item.workflow.status === 'packed';
      });
      expect(allPacked).toBe(true);
      Meteor.call('advancedFulfillment/updateAllItemsToShipped', FulfilledOrder);
      let updatedItems = ReactionCore.Collections.Orders.findOne(FulfilledOrder._id).advancedFulfillment.items;
      let allShipped = _.every(updatedItems, function (item) {
        return item.workflow.status === 'shipped';
      });
      expect(allShipped).toBe(true);
      expect(ReactionCore.Collections.Orders.update).toHaveBeenCalled();
    });
    it('should throw an error if order status is not orderfulfilled', function () {
      let newOrder = Factory.create('orderSKU');
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      let initialStatus = newOrder.advancedFulfillment.workflow.status;
      expect(initialStatus).toBe('orderCreated');
      expect(function () {
        Meteor.call('advancedFulfillment/updateAllItemsToShipped', newOrder);
      }).toThrow();
      expect(ReactionCore.Collections.Orders.update).not.toHaveBeenCalled();
    });
    it('should throw an error if all items are not packed', function () {
      let newOrder = Factory.create('orderSKU', {
        'advancedFulfillment.workflow.status': 'orderFulfilled'
      });
      spyOn(ReactionCore.Collections.Orders, 'update').and.callThrough();
      let initialItems = newOrder.advancedFulfillment.items;
      let allNew = _.every(initialItems, function (item) {
        return item.workflow.status === 'In Stock';
      });
      expect(allNew).toBe(true);
      expect(function () {
        Meteor.call('advancedFulfillment/updateAllItemsToShipped', newOrder);
      }).toThrow();
      expect(ReactionCore.Collections.Orders.update).not.toHaveBeenCalled();
    });
  });
});
