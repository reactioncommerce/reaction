  /**
   * cart/pushWorkflow
   * updates cart status
   * first sets, second call moves status to next workflow
   * additional calls do nothing
   */
  Meteor.methods({
    'layout/pushWorkflow': function (workflow, newWorkflowStatus) {
      check(workflow, String);
      check(newWorkflowStatus, String);
      this.unblock();

      var Cart = ReactionCore.Collections.Cart;
      var defaultWorkflows = [];
      /*var nextWorkflowStep = {};*/
      var currentCart = Cart.findOne({
        'userId': Meteor.userId()
      });

      var currentWorkflowStatus = currentCart.workflow.status;

      // get packages workflow
      var Packages = ReactionCore.Collections.Packages.find({
        'layout.workflow': workflow
      });

      // console.log("layout/pushWorkflow worklow:", workflow, "new status: ", newWorkflowStatus, "current cartId:",  currentCart._id);

      // get this package defaultWorkflow  and check permission
      Packages.forEach(function (package) {
        var layouts = _.where(package.layout, {
          workflow: workflow
        });
        // for every layout, process the associated workflows
        _.each(layouts, function (layout) {
          // audience is the layout permissions
          if (layout.audience === undefined) {
            var defaultRoles = ReactionCore.Collections.Shops.findOne({}, {
              sort: {
                priority: 1
              }
            }).defaultRoles;
            layout.audience = defaultRoles;
          }

          // check permissions so you don't have to on template.
          if (ReactionCore.hasPermission(layout.audience)) {
            defaultWorkflows.push(layout);
          }
        });
      });

      // loops through all shop configured layouts, and their default workflows
      // to determine what the next workflow step should be
      maxSteps = defaultWorkflows.length;
      _.each(defaultWorkflows, function (workflow, currentStatusIndex) {
        if (workflow.template === currentWorkflowStatus && _.contains(currentCart.workflow.workflow, newWorkflowStatus)) {

          if (currentStatusIndex < maxSteps) {
            nextWorkflowStepIndex = currentStatusIndex + 1;
          } else {
            nextWorkflowStepIndex = currentStatusIndex;
          }
          nextWorkflowStep = defaultWorkflows[nextWorkflowStepIndex];
        }
      });

      // if this status, and the next workflow step have already been used,
      // we'll just skip out of here.
      if (nextWorkflowStep && _.contains(currentCart.workflow.workflow, newWorkflowStatus) && _.contains(currentCart.workflow.workflow, nextWorkflowStep.template)) {
        // console.log("already processed workflow: ", nextWorkflowStep.template);
        return false;
      }

      // we're going to check if this workflow has already been started, but not yet processing
      // if it has, we're going to move to the next step, otherwise we'll use the current step
      if (nextWorkflowStep && _.contains(currentCart.workflow.workflow, newWorkflowStatus) === true) {
        return Cart.update(currentCart._id, {
          $set: {
            'workflow.status': nextWorkflowStep.template
          },
          $addToSet: {
            'workflow.workflow': newWorkflowStatus
          }
        });
      // else just update to this first step in the workflow.
      } else {
        return Cart.update(currentCart._id, {
          $set: {
            'workflow.status': newWorkflowStatus
          },
          $addToSet: {
            'workflow.workflow': newWorkflowStatus
          }
        });
      }
    }
  });
