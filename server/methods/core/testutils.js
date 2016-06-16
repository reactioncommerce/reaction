import { Meteor } from "meteor/meteor";
import "/server/methods/core/cart";


export const originals = {
  mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
  createCart: Meteor.server.method_handlers["cart/createCart"],
  copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"],
  addToCart: Meteor.server.method_handlers["cart/addToCart"],
  setShipmentAddress: Meteor.server.method_handlers["cart/setShipmentAddress"],
  setPaymentAddress: Meteor.server.method_handlers["cart/setPaymentAddress"]
};


export function monkeyPatchMethod(method, id) {
  Meteor.server.method_handlers[`cart/${method}`] = function () {
    check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
    this.userId = id;
    return originals[method].apply(this, arguments);
  };
}

export function resetAllMonkeyPatch() {
  for (let key of Object.keys(originals)) {
    let methodName = `cart/${key}`;
    console.log(`resetting ${methodName} back to: ${originals[methodName]}`);
    Meteor.server.method_handlers[methodName] = originals[methodName];
  }
}

export function resetMonkeyPatch(method) {
  console.log("resetMonkeyPatch originals: " + JSON.stringify(originals, null, 4));
  Meteor.server.method_handlers[`cart/${method}`] = originals[method];
}

// This function allows us to set the this.userId in a Meteor function by wrapping it in a closure
// that sets the context and then calls it with that context
export function spyOnMethod(method, id) {
  return sinon.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
    check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
    this.userId = id;
    originals[method].apply(this, arguments);
  });
}
