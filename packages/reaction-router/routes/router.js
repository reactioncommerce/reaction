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
    shopHandle = Meteor.subscribe("Shops");
    if (shopHandle.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne();
      const newLayout = shop.layout.find((x) => selectLayout(x, layout, workflow));
      if (!newLayout) {
        ReactionCore.Log.warn("Failed to render layout", layout, workflow);
        BlazeLayout.render("notFound");
      } else {
        const layoutToRender = Object.assign({}, newLayout.structure, options);
        // console.log(`layoutToRender ${layout}`, layoutToRender);
        BlazeLayout.render(layout, layoutToRender);
      }
    }
  });
};

// const hasLayoutPermission = (context, redirect, stop) => {
//   // const role = shop.layout.find((x) => selectLayout(x, layout, workflow));
//   if (!ReactionCore.hasPermission(context.route.name)) {
//     renderLayout({
//       template: "unauthorized"
//     });
//     stop();
//   }
// };

// define Router export
// FlowRouter.triggers.enter([hasLayoutPermission]);
ReactionRouter = FlowRouter;

// default not found route
ReactionRouter.notFound = {
  action() {
    renderLayout({
      template: "notFound"
    });
  }
};
