import React from "react";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";

const ProductNotFound = () => {
  return (
    <TranslationProvider>
      <div className="container-fluid-sm">
        <div className="empty-view-message">
          <i className="fa fa-barcode" />
          <Translation defaultValue="Oops" i18nKey="productDetail.notFoundTitle" />
          <Translation defaultValue="Product Not Found" i18nKey="productDetail.notFoundError" />
        </div>
      </div>
    </TranslationProvider>
  );
};

export default ProductNotFound;
