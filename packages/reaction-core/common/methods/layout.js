  /**
   * cart/pushWorkflow
   * updates cart status
   * first sets, second call moves status to next workflow
   * additional calls do nothing
   */
Meteor.methods({
  'layout/pushWorkflow': function (workflow, status) {
    console.log( 'layout/pushWorkflow', workflow, status);
    check(workflow, String);
    check(status, String);
    this.unblock();

    var Cart = ReactionCore.Collections.Cart;
    var defaultWorkflows = [];
    var currentCart = Cart.findOne({
      'userId': Meteor.userId()
    });

    var currentWorkflowStatus = currentCart.workflow.status;



    // get packages workflow
    var Packages = ReactionCore.Collections.Packages.find({
      'layout.workflow': workflow
    });

    // get this package workflow steps and check permission
    Packages.forEach(function (package) {
      var layouts = _.where(package.layout, {
        workflow: workflow
      });
      _.each(layouts, function (layout) {

        // audience is the layout permissions
        if (layout.audience === undefined) {
          defaultRoles = ReactionCore.Collections.Shops.findOne().defaultRoles;
          layout.audience = defaultRoles;
        }

        // check permissions so you don't have to on template.
        if (ReactionCore.hasPermission(layout.audience)) {
          defaultWorkflows.push(layout);
        }
      });
    });

    /*console.log(defaultWorkflows);*/

    // we're going to check if  this workflow has already been processed.
    if (_.contains(currentCart.workflow.workflow, currentWorkflowStatus)) {
      console.log("cart has status in workflow:", currentWorkflowStatus);

      found = _.findWhere(defaultWorkflows, currentWorkflowStatus);

      nextWorkflowStep = defaultWorkflows[found + 1];

      return Cart.update(currentCart._id, {
        $set: {
          'workflow.status': nextWorkflowStep
        },
        $addToSet: {
          'workflow.workflow': status
        }
      });
      // else just update to this first step.
    } else {
      return Cart.update(currentCart._id, {
        $set: {
          'workflow.status': status
        },
        $addToSet: {
          'workflow.workflow': status
        }
      });
    }
  }

});
