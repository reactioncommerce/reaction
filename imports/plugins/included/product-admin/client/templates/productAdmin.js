import { ProductAdminContainer } from "../containers";

Template.ProductAdmin.helpers({
  component() {
    const currentData = Template.currentData();

    return Object.assign({}, currentData.data, {
      component: ProductAdminContainer
    });
  }
});
