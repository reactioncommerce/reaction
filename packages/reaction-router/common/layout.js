/**
 * selectLayout
 * @param {Object} layout - element of shops.layout array
 * @param {Object} setLayout - layout
 * @param {Object} setWorkflow - workflow
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
selectLayout = (layout, setLayout, setWorkflow) => {
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
ReactionLayout = (options = {}) => {
  const layout = options.layout || DEFAULT_LAYOUT || "coreLayout";
  const workflow = options.workflow || DEFAULT_WORKFLOW || "coreWorkflow";

  // this only occurs if you aren't overriding
  // with custom options, merges the default (that is already assigned to layout/workflow)
  // so that the "newLayout" is actually the old layout
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
    const defaultLayout = "coreLayout";
    if (ReactionCore.Subscriptions.Shops.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId());
      if (shop) {
        let newLayout = shop.layout.reverse().find((x) => selectLayout(x, layout, workflow));
        let fallbackLayout = {};
        if (!newLayout) {
          // Look for a layout using the coreLayout and fall back to that
          ReactionCore.Log.debug("Could not find custom layout, falling back to core");
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
