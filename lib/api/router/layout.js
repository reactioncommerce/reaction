import { Shops } from "/lib/collections";

/**
 * selectLayout
 * @param {Object} layout - element of shops.layout array
 * @param {Object} setLayout - layout
 * @param {Object} setWorkflow - workflow
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
const selectLayout = (layout, setLayout, setWorkflow) => {
  const currentLayout = setLayout || "coreLayout";
  const currentWorkflow = setWorkflow || "coreWorkflow";
  if (layout.layout === currentLayout && layout.workflow === currentWorkflow && layout.enabled === true) {
    return layout;
  }
};

/**
 * ReactionLayout
 * sets and returns reaction layout structure
 * @param {Object} context - this router context
 * @param {String} options.layout - string of shop.layout.layout (defaults to coreLayout)
 * @param {String} options.workflow - string of shop.layout.workflow (defaults to coreLayout)
 * @param {String} options - layout.structure overrides
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
export const ReactionLayout = (options = {}) => {
  const layout = options.layout || "coreLayout";
  const workflow = options.workflow || "coreWorkflow";
  if (!options.layout) {
    options.layout = "coreLayout";
  }
  if (!options.workflow) {
    options.workflow = "coreWorkflow";
  }

  // check if router has denied permissions
  // see: checkRouterPermissions
  let unauthorized = {};
  if (ReactionRouter.current().unauthorized) {
    unauthorized.template = "unauthorized";
  }

  // autorun router rendering
  Tracker.autorun(function () {
    if (Reaction.Subscriptions.Shops.ready()) {
      const shop = Shops.findOne(Reaction.getShopId());
      if (shop) {
        let newLayout = shop.layout.reverse().find((x) => selectLayout(x, layout, workflow));
        let fallbackLayout = {};
        if (!newLayout) {
          // Look for a layout using the coreLayout and fall back to that
          Logger.debug("Could not find custom layout, falling back to core");
          fallbackLayout = shop.layout.reverse().find((x) => selectLayout(x, defaultLayout, workflow));
          if (!fallbackLayout) {
            // still not found, log and render the notfound template
            ReactionCore.Log.warn(`Missing layout for ${layout}/${workflow}`);
            BlazeLayout.render("notFound");
          }
        }
        const layoutToRender = Object.assign({}, newLayout.structure, fallbackLayout.structure, options, unauthorized);
        BlazeLayout.render(layout, layoutToRender);
      }
    }
  });
  return options;
};
