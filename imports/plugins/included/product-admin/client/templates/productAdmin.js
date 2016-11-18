import { ProductAdminContainer } from "../containers";

Template.ProductAdmin.helpers({
  component() {
    const currentData = Template.currentData() || {};

    return {
      ...currentData,
      component: ProductAdminContainer
    };
  }
});
