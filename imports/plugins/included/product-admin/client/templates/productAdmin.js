import { ProductAdminContainer } from "../containers";

Template.ProductAdmin.helpers({
  component() {
    const currentData = Template.currentData();
    let data;

    if (currentData && currentData.data) {
      data = currentData.data;
    }

    return Object.assign({}, data, {
      component: ProductAdminContainer
    });
  }
});
