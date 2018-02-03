import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import * as Collections from "/lib/collections";

/**
 * reactionTemplate helper
 * use the reactionTemplate helper when you are using templates defined
 * as workflow templates in the package registery.Layout
 * use "collection" on the layout to indicate a workflow source
 *
 * @summary reactionTemplate provides templates as defined in ReactionRegistry.Layout
 * @param {Object} options - workflow defaults to "coreLayout/coreWorkflow"
 * @returns {Array} returns an array with labels, templates that match workflow
 */
Template.registerHelper("reactionTemplate", (options) => {
  const shopId = options.hash.shopId || Reaction.getShopId();
  // get shop info, defaults to current
  const Shop = Collections.Shops.findOne(shopId);
  const groupSub = Meteor.subscribe("Groups", { shopId });
  let defaultRoles;
  if (groupSub.ready()) {
    const groups = Collections.Groups.findOne({ slug: "customer", shopId });
    defaultRoles = groups.permissions;
  }

  const reactionTemplates = [];
  // fetch collection from shop.layout configuration
  let layout = _.find(Shop.layout, {
    workflow: options.hash.workflow || "coreWorkflow"
  });

  let layoutConfigCollection;
  let currentId;

  // determine if workflow has a target
  // collection defined. This is where we'll
  // fetch/save workflow changes.
  if (layout) {
    layoutConfigCollection = layout.collection || "Cart";
  } else {
    Logger.error("Shop Layout Undefined");
    layoutConfigCollection = "Cart";
  }

  // if we've got an id, we'll use it with the layout's collection
  // and get the current status of the workflowTargetCollection
  if (Template.currentData() && Template.currentData()._id) {
    currentId = Template.currentData()._id;
  } else {
    const currentCart = Collections.Cart.findOne({
      userId: Meteor.userId()
    });
    currentId = currentCart && currentCart._id;
  }
  // we'll get current cart status by default, as the most common case
  // TODO: expand query options
  currentId = options.hash.id || currentId;

  // The currentCollection must have workflow schema attached.
  // layoutConfigCollection is the collection defined in Shops.workflow
  const workflowTargetCollection = Collections[layoutConfigCollection];
  const currentCollection = workflowTargetCollection.findOne(currentId);
  const currentStatus = currentCollection.workflow.status;
  const currentCollectionWorkflow = currentCollection.workflow.workflow;
  const packages = Collections.Packages.find({
    layout: {
      $elemMatch: options.hash
    },
    shopId
  });

  //  we can have multiple packages contributing to the layout / workflow
  packages.forEach((reactionPackage) => {
    const layoutWorkflows = _.filter(reactionPackage.layout, options.hash);
    // check the packages for layout workflow templates
    for (layout of layoutWorkflows) {
      // audience is layout permissions
      if (layout.audience === undefined) {
        layout.audience = defaultRoles || "owner";
      }

      // check permissions so you don't have to on template.
      if (Reaction.hasPermission(layout.audience)) {
        // todo: review this hack to remove layout
        // from the workflow
        if (!layout.layout) {
          // default is boolean false status
          // true = we've completed this workflow
          // false = pending (future) step
          // <template> = in process (current) step.
          layout.status = _.includes(currentCollectionWorkflow, layout.template);
          // if the current template is already the current status
          if (layout.template === currentStatus) {
            layout.status = currentStatus;
          }
          // push to reactionTemplates
          reactionTemplates.push(layout);
        }
      }
    }
  });
  return reactionTemplates;
});
