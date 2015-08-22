
/*
 * methods to return cart calculated values
 * cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
 * are calculated by a transformation on the collection
 * and are available to use in template as cart.xxx
 * in template: {{cart.cartCount}}
 * in code: ReactionCore.Collections.Cart.findOne().cartTotal()
 */

(function() {
  Template.registerHelper("cart", function() {
    return {
      showCartIconWarning: function() {
        if (this.showLowInventoryWarning()) {
          return true;
        }
        return false;
      },
      showLowInventoryWarning: function() {
        var item, storedCart, _i, _len, _ref, _ref1, _ref2, _ref3;
        storedCart = Cart.findOne();
        if (storedCart != null ? storedCart.items : void 0) {
          _ref = storedCart != null ? storedCart.items : void 0;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (((_ref1 = item.variants) != null ? _ref1.inventoryPolicy : void 0) && ((_ref2 = item.variants) != null ? _ref2.lowInventoryWarningThreshold : void 0)) {
              if (((_ref3 = item.variants) != null ? _ref3.inventoryQuantity : void 0) <= item.variants.lowInventoryWarningThreshold) {
                return true;
              }
            }
          }
        }
        return false;
      },
      showItemLowInventoryWarning: function(variant) {
        if ((variant != null ? variant.inventoryPolicy : void 0) && (variant != null ? variant.lowInventoryWarningThreshold : void 0)) {
          if ((variant != null ? variant.inventoryQuantity : void 0) <= variant.lowInventoryWarningThreshold) {
            return true;
          }
        }
        return false;
      }
    };
  });


  /*
   * cartPayerName
   * gets current cart billing address / payment name
   */

  Template.registerHelper("cartPayerName", function() {
    var _ref, _ref1, _ref2;
    return (_ref = Cart.findOne()) != null ? (_ref1 = _ref.payment) != null ? (_ref2 = _ref1.address) != null ? _ref2.fullName : void 0 : void 0 : void 0;
  });


  /*
   * cartWorkFlow
   * describes current status of cart checkout workflow
   * return object with workflow, status(boolean)
   */

  Template.registerHelper("cartWorkflow", function(options) {
    var cartWorkflow, cartWorkflowAside, cartWorkflowMain, currentStatus, defaultWorkflow, found, index, shopWorkflows, status, stopAt, workflow, _i, _len, _ref;
    shopWorkflows = ReactionCore.Collections.Shops.findOne({
      defaultWorkflows: {
        $elemMatch: {
          provides: "simple"
        }
      }
    }, {
      fields: {
        defaultWorkflows: true
      }
    });
    defaultWorkflow = shopWorkflows.defaultWorkflows[0].workflow;
    currentStatus = ReactionCore.Collections.Cart.findOne().status;
    cartWorkflow = [];
    cartWorkflowMain = [];
    cartWorkflowAside = [];
    found = defaultWorkflow.indexOf(currentStatus);
    if (!found) {
      currentStatus = defaultWorkflow != null ? defaultWorkflow[0] : void 0;
    }
    for (index = _i = 0, _len = defaultWorkflow.length; _i < _len; index = ++_i) {
      workflow = defaultWorkflow[index];
      if (!stopAt && workflow !== currentStatus) {
        status = true;
      }
      if (workflow === currentStatus && !stopAt) {
        if (index === 0) {
          stopAt = 1;
        } else {
          stopAt = index + 1;
        }
        status = true;
      }
      if (index >= stopAt) {
        status = false;
      }
      cartWorkflow.push({
        index: index,
        position: index + 1,
        workflow: workflow,
        status: status
      });
      if ((_ref = cartWorkflow[index].workflow) === 'checkoutReview' || _ref === 'checkoutPayment') {
        cartWorkflowAside.push(cartWorkflow[index]);
      } else {
        cartWorkflowMain.push(cartWorkflow[index]);
      }
    }
    return {
      main: cartWorkflowMain,
      aside: cartWorkflowAside
    };
  });


  /*
   * cartWorkflowPosition
   * returns position from the workflow object
   * basically index + 1  (for human step numbers)
   */

  Template.registerHelper("cartWorkflowPosition", function(options) {
    var workflowStep;
    workflowStep = Template.parentData(2).data;
    return workflowStep.position;
  });


  /*
   * cartWorkflowCompleted
   * if the cart and the workflow object have the same value the
   * workflow is completed  you can use this for
   * alternate template before/after or other workflow Logic
   */

  Template.registerHelper("cartWorkflowCompleted", function(options) {
    var currentStatus, workflowStep;
    workflowStep = Template.parentData(2).data;
    currentStatus = ReactionCore.Collections.Cart.findOne().status;
    if (workflowStep.status === true && currentStatus !== workflowStep.workflow) {
      return true;
    } else {
      return false;
    }
  });

}).call(this);
