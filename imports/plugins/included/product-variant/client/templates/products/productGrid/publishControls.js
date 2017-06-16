import GridPublishContainer from "/imports/plugins/included/product-variant/containers/gridPublishContainer.js";

Template.gridPublishControls.helpers({
  PublishComponent() {
    return {
      component: GridPublishContainer
    };
  }
});
