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
      var nextWorkflowStep = {};
      var currentCart = Cart.findOne({
        'userId': Meteor.userId()
      });

      var currentWorkflowStatus = currentCart.workflow.status;

      // get packages workflow
      var Packages = ReactionCore.Collections.Packages.find({
        'layout.workflow': workflow
      });

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

      if (Meteor.isClient){
        console.table(defaultWorkflows);
      }


      // loops through all layouts, and their workflows
      // and determine the next workflow step
      maxSteps = defaultWorkflows.length;
/*
      currentStatusIndex = _.findLastIndex(defaultWorkflows, {
        'workflow.template': currentWorkflowStatus
      });
      console.log(currentStatusIndex);*/

      /*currentStatusIndex = _.indexOf(defaultWorkflows, {'workflow.template': currentWorkflowStatus} );*/

      _.each(defaultWorkflows, function (workflow, currentStatusIndex) {
        if ( workflow.template === currentWorkflowStatus ) {
          console.log(workflow.template);
          if (currentStatusIndex < maxSteps) {
            nextWorkflowStepIndex = currentStatusIndex + 1;
          } else {
            nextWorkflowStepIndex = currentStatusIndex;
          }
          nextWorkflowStep = defaultWorkflows[nextWorkflowStepIndex];
        }
      });



      /*_.each(defaultWorkflows, function (workflow, index) {

        // workflow ends on last step
        if (index + 1 !== maxSteps) {
          nextWorkflowStepIndex = index + 1;
        } else {
          nextWorkflowStepIndex = index;
        }
        nextWorkflowStep = defaultWorkflows[nextWorkflowStepIndex];
      });*/

      console.log(nextWorkflowStep);


      // we're going to check if  this workflow has already been processed.
      if (nextWorkflowStep && _.contains( currentCart.workflow.workflow, newWorkflowStatus) === true) {

        /*console.log(currentCart.workflow.workflow, newWorkflowStatus);
        console.log(_.contains(currentCart.workflow.workflow, newWorkflowStatus));*/
        console.log("setting nextWorkflowStep", newWorkflowStatus, nextWorkflowStep);

        return Cart.update(currentCart._id, {
          $set: {
            'workflow.status': nextWorkflowStep.template
          },
          $addToSet: {
            'workflow.workflow': newWorkflowStatus
          }
        });
      // else just update to this first step.
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
