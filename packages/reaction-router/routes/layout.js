/**
 * isCurrentLayout
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
 * renderLayout
 * sets and returns reaction layout structure
 * @param {Object} context - this router context
 * @param {String} layout - string of shop.layout.layout (defaults to coreLayout)
 * @param {String} workflow - string of shop.layout.workflow (defaults to coreLayout)
 * @param {String} options - layout.structure overrides
 * @returns {Object} layout - return object of template definitions for Blaze Layout
 */
renderLayout = (options = {}) => {
  const layout = options.layout || "coreLayout";
  const workflow = options.workflow || "coreWorkflow";

  Tracker.autorun(function () {
    if (ReactionCore.Subscriptions.Shops.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId());
      if (shop) {
        const newLayout = shop.layout.find((x) => selectLayout(x, layout, workflow));
        // oops this layout wasn't found. render notFound
        if (!newLayout) {
          ReactionCore.Log.warn("Failed to render layout", layout, workflow);
          BlazeLayout.render("notFound");
        } else {
          const layoutToRender = Object.assign({}, newLayout.structure, options);
          BlazeLayout.render(layout, layoutToRender);
        }
      }
    }
  });
};
