import React from "react";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const ProductNotFound = () => (
  <div className="container-fluid-sm">
    <div className="empty-view-message">
      <i className="fa fa-barcode" />
      <Components.Translation defaultValue="Oops" i18nKey="productDetail.notFoundTitle" />
      <Components.Translation defaultValue="Product Not Found" i18nKey="productDetail.notFoundError" />
    </div>
  </div>
);

registerComponent("ProductNotFound", ProductNotFound);

export default ProductNotFound;
