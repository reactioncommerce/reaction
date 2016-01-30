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
      // if (!newLayout) {
      //   console.error("failed to render coreLayout", options);
      //   BlazeLayout.render("notFound");
      //   stop();
      // }
      const layoutToRender = Object.assign({}, newLayout.structure, options);
      // console.log(`layoutToRender ${layout}`, layoutToRender);
      BlazeLayout.render(layout, layoutToRender);
    }
  });
};

// define Router export
Router = FlowRouter;
ReactionRouter = Router;

// default not found route
// Router.notFound = {
//   action() {
//     renderLayout({
//       template: "notFound"
//     });
//   }
// };

// these are old iron:router methods
// that we'd like to warn are deprecated
Router.waitOn = () => {
  console.warn("Deprecated. Router.waitOn is only supported for iron-router.")
};

Router.configure = () => {
  console.warn("Deprecated. Router.configure is only supported for iron-router.")
};

Router.map = () => {
  console.warn("Router.map is deprecated. Use ReactionCore.registerPackage to define routes.")
};
