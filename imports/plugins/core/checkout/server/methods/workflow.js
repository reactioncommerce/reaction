import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { check, Match } from "meteor/check";
import { Cart, Orders, Packages, Groups } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

/* eslint no-shadow: 0 */

/**
 * @method updateOrderWorkflow
 * @summary Updates a hook to update orders status before updating an order.
 *
 * @param {String} userId - currently logged in user
 * @param {Object} selector - selector for product to update
 * @param {Object} modifier - Object describing what parts of the document to update.
 * @param {Object} validation
 * @return {String} _id of updated document
 */
function updateOrderWorkflow(userId, selector, modifier, validation) {
  const order = Orders.findOne(selector);

  Hooks.Events.run("beforeUpdateOrderWorkflow", order, {
    userId,
    modifier,
    validation
  });

  Logger.debug("beforeUpdateOrderWorkflow hook executed before Order is updated");

  const result = Orders.update(selector, modifier, validation);

  // Update mongo search record
  Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", order);

  return result;
}

/**
 * @file Methods for Workflow. Run these methods using `Meteor.call()`.
 * @example Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
 *
 * @namespace Methods/Workflow
*/
Meteor.methods({
  /**
   * @name workflow/pushCartWorkflow
   * @memberof Methods/Workflow
   * @method
   * @example Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", "checkoutLogin");
   * @summary updates cart workflow status
   * @description status in the workflow is stored as the current active workflow step.
   * first sets, second call moves status to next workflow
   * additional calls do nothing
   * user permissions to template are verified
   * @param {String} workflow - name of workflow
   * @param {String} newWorkflowStatus - name of the next workflow stage
   * @param {String} [cartId] - cart._id
   * @return {Array|Boolean|Number} return
   */
  "workflow/pushCartWorkflow"(workflow, newWorkflowStatus, cartId) {
    check(workflow, String);
    check(newWorkflowStatus, String);
    check(cartId, Match.Optional(String));
    this.unblock();

    let currentCart;
    const defaultPackageWorkflows = [];
    let nextWorkflowStep = {
      template: ""
    };

    // This method could be called indirectly from publication method in a time
    // when `this.userId` will be null, that's why we have a third argument in
    // this method - `cartId`. So, we can't completely rely on `Meteor.userId()`
    // here.
    if (typeof cartId === "string") {
      currentCart = Cart.findOne(cartId);
    } else {
      currentCart = Cart.findOne({
        userId: this.userId
      });
    }
    // exit if a cart doesn't exist.
    if (!currentCart) return [];
    // TODO doc this
    const currentWorkflowStatus = currentCart.workflow.status;
    const packages = Packages.find({
      "shopId": Reaction.getShopId(),
      "layout.workflow": workflow
    });

    // loop through packages and set the defaultPackageWorkflows
    packages.forEach((reactionPackage) => {
      // todo fix this hack for not filtering nicely
      if (!reactionPackage.layout.layout) {
        const layouts = _.filter(reactionPackage.layout, {
          workflow
        });
        // for every layout, process the associated workflows
        _.each(layouts, (layout) => {
          // audience is the layout permissions
          if (typeof layout.audience !== "object") {
            const defaultRoles = Groups.findOne({
              slug: "customer",
              shopId: Reaction.getShopId()
            }).permissions;
            layout.audience = defaultRoles;
          }
          // check permissions so you don't have to on template. For a case, when
          // this method calls indirectly from publication method, we do this
          // check which is looks not pretty secure
          let hasPermission;
          if (typeof Meteor.userId() !== "string") {
            hasPermission = Roles.userIsInRole(currentCart.userId, layout.audience, Reaction.getShopId());
          } else {
            hasPermission = Roles.userIsInRole(Meteor.userId(), layout.audience, Reaction.getShopId());
          }

          if (hasPermission && !layout.layout) {
            defaultPackageWorkflows.push(layout);
          }
        });
      }
    });

    // statusExistsInWorkflow boolean
    const statusExistsInWorkflow = _.includes(currentCart.workflow.workflow, newWorkflowStatus);
    const maxSteps = defaultPackageWorkflows.length;
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
    _.each(defaultPackageWorkflows, (workflow, currentStatusIndex) => {
      if (workflow.template === currentWorkflowStatus) {
        // don't go past the end of the workflow
        if (currentStatusIndex < maxSteps - 1) {
          Logger.debug("currentStatusIndex, maxSteps", currentStatusIndex, maxSteps);
          Logger.debug("currentStatusIndex, maxSteps", currentStatusIndex, maxSteps);
          nextWorkflowStepIndex = currentStatusIndex + 1;
        } else {
          nextWorkflowStepIndex = currentStatusIndex;
        }

        Logger.debug("nextWorkflowStepIndex", nextWorkflowStepIndex);
        // set the nextWorkflowStep as the next workflow object from registry
        nextWorkflowStep = defaultPackageWorkflows[nextWorkflowStepIndex];

        Logger.debug("setting nextWorkflowStep", nextWorkflowStep.template);
      }
    });

    // check to see if the next step has already been processed.
    // templateProcessedinWorkflow boolean
    gotoNextWorkflowStep = nextWorkflowStep.template;
    templateProcessedinWorkflow = _.includes(currentCart.workflow.workflow, nextWorkflowStep.template);

    // debug info
    Logger.debug("currentWorkflowStatus: ", currentWorkflowStatus);
    Logger.debug("workflow/pushCartWorkflow workflow: ", workflow);
    Logger.debug("newWorkflowStatus: ", newWorkflowStatus);
    Logger.debug("current cartId: ", currentCart._id);
    Logger.debug("currentWorkflow: ", currentCart.workflow.workflow);
    Logger.debug("nextWorkflowStep: ", nextWorkflowStep.template || defaultPackageWorkflows[0].template);
    Logger.debug("statusExistsInWorkflow: ", statusExistsInWorkflow);
    Logger.debug("templateProcessedinWorkflow: ", templateProcessedinWorkflow);
    Logger.debug("gotoNextWorkflowStep: ", gotoNextWorkflowStep);

    // Condition One
    // if you're going to join the workflow you need a status that is a template name.
    // this status/template is how we know
    // where you are in the flow and configures `gotoNextWorkflowStep`

    if (!gotoNextWorkflowStep && currentWorkflowStatus !== newWorkflowStatus) {
      Logger.debug(`######## Condition One #########:
        initialise the ${currentCart._id} ${workflow}:
        ${defaultPackageWorkflows[0].template}`);
      const result = Cart.update(currentCart._id, {
        $set: {
          "workflow.status": defaultPackageWorkflows[0].template
        }
      });
      Logger.debug(result);
      return result;
    }

    // Condition Two
    // your're now accepted into the workflow,
    // but to begin the workflow you need to have a next step
    // and you should have already be in the current workflow template
    if (gotoNextWorkflowStep && statusExistsInWorkflow === false &&
      templateProcessedinWorkflow === false) {
      Logger.debug("######## Condition Two #########: set status to: ", nextWorkflowStep.template);

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
      Logger.debug(
        `######## Condition Three #########: complete workflow ${currentWorkflowStatus} updates and move to: `,
        nextWorkflowStep.template
      );
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
      Logger.debug(
        "######## Condition Four #########: previously ran, doing nothing. : ",
        newWorkflowStatus
      );
      return true;
    }
  },

  /**
   * @name workflow/revertCartWorkflow
   * @memberof Methods/Workflow
   * @method
   * @summary if something was changed on the previous `cartWorkflow` steps,
   * we need to revert to this step to renew the order
   * @param {String} newWorkflowStatus - name of `cartWorkflow` step, which we need to revert
   * @todo need tests
   * @return {Number|Boolean} cart update results
   */
  "workflow/revertCartWorkflow"(newWorkflowStatus) {
    check(newWorkflowStatus, String);
    this.unblock();

    const cart = Cart.findOne({
      userId: this.userId
    });

    if (!cart || typeof cart.workflow !== "object") return false;
    if (typeof cart.workflow.workflow !== "object") return false;

    const { workflow } = cart.workflow;
    // get index of `newWorkflowStatus`
    const resetToIndex = workflow.indexOf(newWorkflowStatus);
    // exit if no such step in workflow
    if (resetToIndex < 0) return false;
    // remove all steps that further `newWorkflowStatus` and itself
    const resetedWorkflow = workflow.slice(0, resetToIndex);

    return Cart.update(cart._id, {
      $set: {
        "workflow.status": newWorkflowStatus,
        "workflow.workflow": resetedWorkflow
      }
    });
  },

  /**
   * @name workflow/pushOrderWorkflow
   * @summary Update the order workflow: Push the status as the current workflow step,
   * move the current status to completed worflow steps
   *
   * @description Step 1 meteor call to push a new workflow
   * Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", this);
   * NOTE: "coreOrderWorkflow", "processing" will be combined into "coreOrderWorkflow/processing" and set as the status
   * Step 2 (this method) of the "workflow/pushOrderWorkflow" flow; Try to update the current status
   *
   * @method
   * @memberof Methods/Workflow
   * @param  {String} workflow workflow to push to
   * @param  {String} status - Workflow status
   * @param  {Order} order - Schemas.Order, an order object
   * @return {Boolean} true if update was successful
   */
  "workflow/pushOrderWorkflow"(workflow, status, order) {
    check(workflow, String);
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String
    }));
    this.unblock();

    const workflowStatus = `${workflow}/${status}`;

    const result = updateOrderWorkflow(
      this.userId,
      {
        _id: order._id
      },
      {
        $set: {
          // Combine (workflow) "coreOrderWorkflow", (status) "processing" into "coreOrderWorkflow/processing".
          // This comoniation will be used to call the method "workflow/coreOrderWorkflow/processing", if it exists.
          "workflow.status": `${workflow}/${status}`
        },
        $addToSet: {
          "workflow.workflow": workflowStatus
        }
      }
    );

    return result;
  },

  /**
   * @name workflow/pullOrderWorkflow
   * @description Push the status as the current workflow step, move the current status to completed worflow steps
   * @summary Pull a previous order status
   * @method
   * @memberof Methods/Workflow
   * @param  {String} workflow workflow to push to
   * @param  {String} status - Workflow status
   * @param  {Order} order - Schemas.Order, an order object
   * @return {Boolean} true if update was successful
   */
  "workflow/pullOrderWorkflow"(workflow, status, order) {
    check(workflow, String);
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String,
      workflow: Match.ObjectIncluding({
        status: String
      })
    }));
    this.unblock();

    const result = Orders.update({
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

  /**
   * @name workflow/pushItemWorkflow
   * @method
   * @memberof Methods/Workflow
   * @param  {String} status  Workflow status
   * @param  {Object} order   Schemas.Order, an order object
   * @param  {String[]} itemIds Array of item IDs
   * @return {Boolean}         true if update was successful
   */
  "workflow/pushItemWorkflow"(status, order, itemIds) {
    check(status, String);
    check(order, Match.ObjectIncluding({
      _id: String,
      items: [Object]
    }));
    check(itemIds, Array);

    // We can't trust the order from the client (for several reasons)
    // Initially because in a multi-merchant scenario, the order from the client
    // will contain only the items associated with their shop
    // We'll get the order from the db that has all the items

    // TODO: Resolve potential concurrency issue where any writes to the order items
    // between this read and the Orders.update write below would be lost.
    const dbOrder = Orders.findOne({ _id: order._id });
    const items = dbOrder.items.map((item) => {
      // Don't modify items unless they in our itemIds array
      if (!itemIds.includes(item._id)) {
        return item;
      }

      // Add the current status to completed workflows
      if (item.workflow.status !== "new") {
        const workflows = item.workflow.workflow || [];

        workflows.push(status);
        item.workflow.workflow = _.uniq(workflows);
      }

      // Set the new item status
      item.workflow.status = status;
      return item;
    });

    const result = Orders.update({
      _id: dbOrder._id
    }, {
      $set: {
        items
      }
    });

    // Update search record
    Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", order);

    return result;
  }
});
