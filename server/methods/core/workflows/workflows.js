import {Meteor} from "meteor/meteor";
import {check} from "meteor/check";
import {Reaction} from "/server/api";
import * as Collections from "/lib/collections";


function expandTemplateLiteral(literal, vars) {
  // I <3 SO
  // ATTN: Security relevant!!
  // eslint-disable-next-line no-new-func
  const tpl = new Function("return `" + literal + "`;");
  const expanded = tpl.call(vars);
  return expanded;
}

const methods = {
  "workflow/saveState": function (stateflowName, docId, oldState, newState) {
    check(stateflowName, String);
    check(docId, String);
    check(oldState, String);
    check(newState, String);

    // this.unblock();

    if (newState !== oldState) {
      const shopId = Reaction.getShopId();
      const stateflow = Collections.Stateflows.findOne({ name: stateflowName, shopId: shopId });
      const collectionName = stateflow.collection;
      const selector =  JSON.parse(expandTemplateLiteral(stateflow.querySelector, { shopId, docId }));

      switch (collectionName) {
        case "Orders":
          if (!Reaction.hasPermission("orders")) {
            throw new Meteor.Error("access-denied", "Access Denied");
          }
          break;
        default:
          throw new Meteor.Error("access-denied", "Access Denied");
      }

      return Collections[collectionName].update(
        selector,
        {
          $set: {
            [stateflow.locationPath + ".status"]: newState
          },
          $addToSet: {
            [stateflow.locationPath + ".workflow"]: oldState
          }
        }
      );
    }
  }
};

Meteor.methods(methods);
