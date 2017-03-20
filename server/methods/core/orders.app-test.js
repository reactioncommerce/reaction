import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Orders } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("orders test", () => {
  let methods;
  let sandbox;
  let user;
  let order;

  before(() => {
    methods = {
      startCancelOrder: Meteor.server.method_handlers["orders/startCancelOrder"],
      completeCancelOrder: Meteor.server.method_handlers["orders/completeCancelOrder"]
    };
  });

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    user = Factory.create("user");
    sandbox.stub(Meteor, "userId", () => {
      return user._id;
    });
    order = Factory.create("order");
  });

  afterEach(() => {
    Orders.remove({});
    sandbox.restore();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `orders/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return methods[method].apply(this, arguments);
    });
  }

  describe("orders/startCancelOrder", () => {
    it("should return an error if user is not admin", (done) => {
      sandbox.stub(Reaction, "hasPermissions", () => false);
      const returnToStock =  false;
      spyOnMethod("startCancelOrder", order.userId);

      function copyStartCancelOrder() {
        return Meteor.call("orders/startCancelOrder", order, returnToStock);
      }
      expect(copyStartCancelOrder).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });
  });
});
