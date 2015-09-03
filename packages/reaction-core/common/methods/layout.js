  /**
   * layout/pushWorkflow
   * updates workflow status
   * status in the workflow is stored as the current active
   * workflow step.
   *
   * first sets, second call moves status to next workflow
   * additional calls do nothing
   * user permissions to template are verified
   *
   */
  Meteor.methods({
    'layout/pushWorkflow': function (workflow, newWorkflowStatus) {
      check(workflow, String);
      check(newWorkflowStatus, String);
      this.unblock();

      var Cart = ReactionCore.Collections.Cart;
      var defaultPackageWorkflows = [];
      var nextWorkflowStep = {template: ''};
      var currentCart = Cart.findOne({
        'userId': Meteor.userId()
      });
      var currentWorkflowStatus = currentCart.workflow.status;
      var Packages = ReactionCore.Collections.Packages.find({
        'layout.workflow': workflow
      });

      // loop through packages and set the defaultPackageWorkflows
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
            defaultPackageWorkflows.push(layout);
          }
        });
      });

      // statusExistsInWorkflow boolean
      var statusExistsInWorkflow = _.contains(currentCart.workflow.workflow, newWorkflowStatus);

      var maxSteps = defaultPackageWorkflows.length;
      var nextWorkflowStepIndex;
      var templateProcessedinWorkflow = false;
      var gotoNextWorkflowStep = false;

      // loop through all shop configured layouts, and their default workflows
      // to determine what the next workflow step should be
      // the cart workflow status while processing is neither true nor false (set to template)

      _.each(defaultPackageWorkflows, function (workflow, currentStatusIndex) {
        if (workflow.template === currentWorkflowStatus) {
          // don't go past the end of the workflow
          if (currentStatusIndex < maxSteps - 1) {
            ReactionCore.Events.debug( "currentStatusIndex, maxSteps", currentStatusIndex, maxSteps);
            nextWorkflowStepIndex = currentStatusIndex + 1;
          } else {
            nextWorkflowStepIndex = currentStatusIndex;
          }

          ReactionCore.Events.debug("nextWorkflowStepIndex", nextWorkflowStepIndex);
          // set the nextWorkflowStep as the next workflow object from registry
          nextWorkflowStep = defaultPackageWorkflows[nextWorkflowStepIndex];

          ReactionCore.Events.debug("setting nextWorkflowStep", nextWorkflowStep.template);
        }
      });

      // check to see if the next step has aready been processed.
      // templateProcessedinWorkflow boolean


      gotoNextWorkflowStep = nextWorkflowStep.template;
      templateProcessedinWorkflow = _.contains(currentCart.workflow.workflow, nextWorkflowStep.template);


      // debug info
      ReactionCore.Events.debug("currentWorkflowStatus:", currentWorkflowStatus);
      ReactionCore.Events.debug("layout/pushWorkflow workflow:", workflow);
      ReactionCore.Events.debug("newWorkflowStatus: ", newWorkflowStatus);
      ReactionCore.Events.debug("current cartId: ", currentCart._id);
      ReactionCore.Events.debug("currentWorkflow: ", currentCart.workflow.workflow);
      ReactionCore.Events.debug("nextWorkflowStep: ", nextWorkflowStep.template);
      ReactionCore.Events.debug("statusExistsInWorkflow: ", statusExistsInWorkflow);
      ReactionCore.Events.debug("templateProcessedinWorkflow: ", templateProcessedinWorkflow);
      ReactionCore.Events.debug("gotoNextWorkflowStep: ", gotoNextWorkflowStep);


      // Condition One
      // if you're going to join the workflow you need a status that is a template name.
      // this status/template is how we know
      // where you are in the flow and configures `gotoNextWorkflowStep`

      if (!gotoNextWorkflowStep && currentWorkflowStatus !== newWorkflowStatus ) {
        ReactionCore.Events.debug("######## Condition One #########: initialise the " + workflow + ":  " + defaultPackageWorkflows[0].template);
        return Cart.update(currentCart._id, {
          $set: {
            'workflow.status': defaultPackageWorkflows[0].template
          }
        });
      }


      // Condition Two
      // your're now accepted into the workflow,
      // but to begin the workflow you need to have a next step
      // and you should have already be in the current workflow template
      if (gotoNextWorkflowStep && statusExistsInWorkflow === false && templateProcessedinWorkflow === false) {
        ReactionCore.Events.debug("######## Condition Two #########: set status to: ", nextWorkflowStep.template);

        return Cart.update(currentCart._id, {
          $set: {
            'workflow.status': nextWorkflowStep.template
          },
          $addToSet: {
            'workflow.workflow': currentWorkflowStatus
          }
        });
      }


      // Condition Three
      // If you got here by skipping around willy nilly
      // we're going to do our best to ignore you.
      if (gotoNextWorkflowStep && statusExistsInWorkflow === true && templateProcessedinWorkflow === false) {
        ReactionCore.Events.debug("######## Condition Three #########: complete workflow " + currentWorkflowStatus + " updates and move to: ", nextWorkflowStep.template);
        return Cart.update(currentCart._id, {
          $set: {
            'workflow.status': nextWorkflowStep.template
          },
          $addToSet: {
            'workflow.workflow': currentWorkflowStatus
          }
        });
      }

      // Condition Four
      // you got here through hard work, and processed the previous template
      // nice job. now start over with the next step.
      if (gotoNextWorkflowStep && statusExistsInWorkflow === true && templateProcessedinWorkflow === true) {
        ReactionCore.Events.debug("######## Condition Four #########: previously ran, doing nothing. : ", newWorkflowStatus);
        return true;
      }
    }
  });
