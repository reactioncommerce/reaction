/* eslint no-shadow: 0 */

Meteor.methods({
  /**
   * workflow/pushCartWorkflow
   * @summary updates cart workflow status
   * @description status in the workflow is stored as the current active
   * workflow step.
   *
   * first sets, second call moves status to next workflow
   * additional calls do nothing
   * user permissions to template are verified
   * @param {String} workflow - name of workflow
   * @param {String} newWorkflowStatus - name of the next workflow stage
   * @param {String} cartId - cart._id
   * @return {Array|Boolean|Number}
   */
  "workflow/pushCartWorkflow": function (workflow, newWorkflowStatus,
    cartId) {
    check(workflow, String);
    check(newWorkflowStatus, String);
    check(cartId, Match.Optional(String));
    this.unblock();

    let defaultPackageWorkflows = [];
    let nextWorkflowStep = {
      template: ""
    };
    const { Cart, Packages, Shops } = ReactionCore.Collections;
    const { Log } = ReactionCore;
    const currentCart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    // exit if a cart doesn't exist.
    if (!currentCart) return [];

    let currentWorkflowStatus = currentCart.workflow.status;
    let packages = Packages.find({
      "shopId": ReactionCore.getShopId(),
      "layout.workflow": workflow
    });

    // loop through packages and set the defaultPackageWorkflows
    packages.forEach(function (reactionPackage) {
      let layouts = _.where(reactionPackage.layout, {
        workflow: workflow
      });
      // for every layout, process the associated workflows
      _.each(layouts, function (layout) {
        // audience is the layout permissions
        if (layout.audience === undefined) {
          let defaultRoles = Shops.findOne(
            ReactionCore.getShopId(), {
              sort: {
                priority: 1
              }
            }).defaultRoles;
          layout.audience = defaultRoles;
        }
        // check permissions so you don't have to on template.
        if (ReactionCore.hasPermission(layout.audience)) {
          defaultPackageWorkflows.push(layout);
        }
      });
    });

    // statusExistsInWorkflow boolean
    let statusExistsInWorkflow = _.contains(currentCart.workflow.workflow,
      newWorkflowStatus);

    let maxSteps = defaultPackageWorkflows.length;
    let nextWorkflowStepIndex;
    let templateProcessedinWorkflow = false;
    let gotoNextWorkflowStep = false;

    // if we haven't populated workflows lets exit
    if (!defaultPackageWorkflows.length > 0) {
      return [];
    }

    // loop through all shop configured layouts, and their default workflows
    // to determine what the next workflow step should be
    // the cart workflow status while processing is neither true nor false (set to template)
    _.each(defaultPackageWorkflows, function (workflow,
      currentStatusIndex) {
      if (workflow.template === currentWorkflowStatus) {
        // don't go past the end of the workflow
        if (currentStatusIndex < maxSteps - 1) {
          Log.debug("currentStatusIndex, maxSteps", currentStatusIndex, maxSteps);
          nextWorkflowStepIndex = currentStatusIndex + 1;
        } else {
          nextWorkflowStepIndex = currentStatusIndex;
        }

        Log.debug("nextWorkflowStepIndex", nextWorkflowStepIndex);
        // set the nextWorkflowStep as the next workflow object from registry
        nextWorkflowStep = defaultPackageWorkflows[
          nextWorkflowStepIndex];

        Log.debug("setting nextWorkflowStep", nextWorkflowStep.template);
      }
    });

    // check to see if the next step has aready been processed.
    // templateProcessedinWorkflow boolean
    gotoNextWorkflowStep = nextWorkflowStep.template;
    templateProcessedinWorkflow = _.contains(currentCart.workflow.workflow,
      nextWorkflowStep.template);

    // debug info
    Log.debug("currentWorkflowStatus: ",  currentWorkflowStatus);
    Log.debug("workflow/pushCartWorkflow workflow: ", workflow);
    Log.debug("newWorkflowStatus: ", newWorkflowStatus);
    Log.debug("current cartId: ", currentCart._id);
    Log.debug("currentWorkflow: ", currentCart.workflow.workflow);
    Log.debug("nextWorkflowStep: ", nextWorkflowStep.template);
    Log.debug("statusExistsInWorkflow: ", statusExistsInWorkflow);
    Log.debug("templateProcessedinWorkflow: ", templateProcessedinWorkflow);
    Log.debug("gotoNextWorkflowStep: ", gotoNextWorkflowStep);

    // Condition One
    // if you're going to join the workflow you need a status that is a template name.
    // this status/template is how we know
    // where you are in the flow and configures `gotoNextWorkflowStep`

    if (!gotoNextWorkflowStep && currentWorkflowStatus !==
      newWorkflowStatus) {
      Log.debug(`######## Condition One #########: initialise the ${
        workflow}: ${defaultPackageWorkflows[0].template}`);
      return Cart.update(currentCart._id, {
        $set: {
          "workflow.status": defaultPackageWorkflows[0].template
        }
      });
    }

    // Condition Two
    // your're now accepted into the workflow,
    // but to begin the workflow you need to have a next step
    // and you should have already be in the current workflow template
    if (gotoNextWorkflowStep && statusExistsInWorkflow === false &&
      templateProcessedinWorkflow === false) {
      Log.debug("######## Condition Two #########: set status to: ",
        nextWorkflowStep.template);

      return Cart.update(currentCart._id, {
        $set: {
          "workflow.status": nextWorkflowStep.template
        },
        $addToSet: {
          "workflow.workflow": currentWorkflowStatus
        }
      });
    }

    // Condition Three
    // If you got here by skipping around willy nilly
    // we're going to do our best to ignore you.
    if (gotoNextWorkflowStep && statusExistsInWorkflow === true &&
      templateProcessedinWorkflow === false) {
      Log.debug("######## Condition Three #########: complete workflow " +
        currentWorkflowStatus + " updates and move to: ",
        nextWorkflowStep.template);
      return Cart.update(currentCart._id, {
        $set: {
          "workflow.status": nextWorkflowStep.template
        },
        $addToSet: {
          "workflow.workflow": currentWorkflowStatus
        }
      });
    }

    // Condition Four
    // you got here through hard work, and processed the previous template
    // nice job. now start over with the next step.
    if (gotoNextWorkflowStep && statusExistsInWorkflow === true &&
      templateProcessedinWorkflow === true) {
      Log.debug(
        "######## Condition Four #########: previously ran, doing nothing. : ",
        newWorkflowStatus);
      return true;
    }
  },

  /**
   * workflow/pushOrderWorkflow
   * Push the status as the current workflow step,
   * move the current status to completed worflow steps
   *
   * Step 1 meteor call to push a new workflow
   * Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", this);
   * NOTE: "coreOrderWorkflow", "processing" will be combined into "coreOrderWorkflow/processing"
   * and set as the status
   *
   * Step 2 (this method) of the "workflow/pushOrderWorkflow" flow; Try to update the current status
   *
   * @summary Update the order workflow
   * @param  {String} workflow workflow to push to
   * @param  {String} status - Workflow status
   * @param  {Order} order - ReactionCore.Schemas.Order, an order object
   * @return {Boolean} true if update was successful
   */
  "workflow/pushOrderWorkflow": function (workflow, status, order) {
    check(workflow, String);
    check(status, String);
    check(order, Object); // TODO: Validatate as ReactionCore.Schemas.Order
    this.unblock();

    const result = ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        // Combine (workflow) "coreOrderWorkflow", (status) "processing" into "coreOrderWorkflow/processing".
        // This comoniation will be used to call the method "workflow/coreOrderWorkflow/processing", if it exists.
        "workflow.status": `${workflow}/${status}`
      },
      $addToSet: {
        "workflow.workflow": order.workflow.status
      }
    });

    return result;
  },

  /**
   * workflow/pullOrderWorkflow
   * Push the status as the current workflow step,
   * move the current status to completed worflow steps
   * @summary Pull a previous order status
   * @param  {String} workflow workflow to push to
   * @param  {String} status - Workflow status
   * @param  {Order} order - ReactionCore.Schemas.Order, an order object
   * @return {Boolean} true if update was successful
   */
  "workflow/pullOrderWorkflow": function (workflow, status, order) {
    check(workflow, String);
    check(status, String);
    check(order, Object);
    this.unblock();

    const result = ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        "workflow.status": status
      },
      $pull: {
        "workflow.workflow": order.workflow.status
      }
    });

    return result;
  },

  "workflow/pushItemWorkflow": function (status, order, itemIds) {
    check(status, String);
    check(order, Object);
    check(itemIds, Array);

    const items = order.items.map((item) => {
      // Add the current status to completed workflows
      if (item.workflow.status !== "new") {
        let workflows = item.workflow.workflow;

        workflows.push(status);
        item.workflow.workflow = _.uniq(workflows);
      }

      // Set the new item status
      item.workflow.status = status;
      return item;
    });

    const result = ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        items: items
      }
    });

    return result;
  }
});
