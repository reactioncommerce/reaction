import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";
import { ProductDetailContainer, ProductToolbarContainer } from "../containers";
import { ProductToolbar } from "../components";

Template.productDetailSimple.helpers({
  isEnabled() {
    return isRevisionControlEnabled();
  },
  PDC() {
    return ProductDetailContainer;
  }
});

Template.productDetailSimpleToolbar.helpers({
  isEnabled() {
    return isRevisionControlEnabled();
  },
  ToolbarComponent() {
    return ProductToolbarContainer(ProductToolbar);
  }
});
