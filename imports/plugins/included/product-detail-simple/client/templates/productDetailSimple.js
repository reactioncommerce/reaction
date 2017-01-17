import { ProductDetailContainer } from "../containers";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";

Template.productDetailSimple.helpers({
  isEnabled() {
    return isRevisionControlEnabled();
  },
  PDC() {
    return ProductDetailContainer;
  }
});
