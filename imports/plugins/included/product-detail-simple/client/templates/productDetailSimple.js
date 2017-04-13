import { ProductDetailContainer, PublishContainer } from "../containers";

Template.productDetailSimple.helpers({
  PDC() {
    return ProductDetailContainer;
  }
});

Template.productDetailSimpleToolbar.helpers({
  PublishContainerComponent() {
    return {
      component: PublishContainer
    };
  }
});
