
/**
 * reactionTemplate helper
 * @summary reactionTemplate provides templates as defined in ReactionRegistry.Layout
 * @param {String} workflow defaults to "default"
 * @peram {id} workflow collection id
 * @returns
 */

Template.registerHelper("reactionTemplate", function (options) {
  let shopId = options.hash.shopId || ReactionCore.getShopId();
  // get shop info, defaults to current
  let Shop = ReactionCore.Collections.Shops.findOne(shopId);
  // let layoutConfiguration = Shop.layout;
  let reactionTemplates = [];

  // fetch collection from shop.layout configuration
  let layout = _.findWhere(Shop.layout, {
    workflow: options.hash.workflow
  });

  let layoutConfigCollection;

  if (layout) {
    // potentially we can make the default a workflow collection
    layoutConfigCollection = layout.collection || "Cart";
  } else {
    ReactionCore.Log.error("Shop Layout Undefined");
    layoutConfigCollection = "Cart";
  }

  // if we've got an id, we'll use it with the layout's collection
  if (Template.currentData()) {
    currentId = Template.currentData()._id;
  } else {
    let currentCart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });
    currentId = currentCart && currentCart._id;
  }
  // we'll get current cart status by default, as the most common case
  // TODO: expand query options
  currentId = options.hash.id || currentId;

  // The currentCollection must have workflow schema attached.
  // layoutConfigCollection is the collection defined in Shops.workflow
  let workflowTargetCollection = ReactionCore.Collections[
    layoutConfigCollection];
  let currentCollection = workflowTargetCollection.findOne(currentId);

  // if we be here without a workflow, we're layouteers
  // if there isn't a layout defined
  if (!currentCollection) {
    currentCollection = ReactionCore.Collections.Layouts.findOne(
      currentId);
    if (!currentCollection) {
      return [];
    }
  }

  let currentStatus = currentCollection.workflow.status;
  let currentCollectionWorkflow = currentCollection.workflow.workflow;

  // find the packages with these options
  let Packages = ReactionCore.Collections.Packages.find({
    layout: {
      $elemMatch: options.hash
    }
  });
  //  we can have multiple packages contributing to the layout / workflow
  Packages.forEach(function (reactionPackage) {
    // match template or workflow
    let layoutWorkflows = _.where(reactionPackage.layout, options.hash);
    for (layout of layoutWorkflows) {
      // audience is layout permissions
      if (layout.audience === undefined) {
        defaultRoles = ReactionCore.Collections.Shops.findOne().defaultRoles;
        layout.audience = defaultRoles;
      }

      // check permissions so you don't have to on template.
      if (ReactionCore.hasPermission(layout.audience)) {
        // default boolean status
        layout.status = _.contains(currentCollectionWorkflow,
          layout.template);
        // if the current template is already the current status
        if (layout.template === currentStatus) {
          layout.status = currentStatus;
        }
        // add to templates list
        reactionTemplates.push(layout);
      }
    }
  });

  ReactionCore.Log.debug("reactionTemplates", reactionTemplates);
  return reactionTemplates;
});
