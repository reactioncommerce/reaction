import { observable, action } from "mobx";
/**
 * A mobx store for UI data
 * @class AuthStore
 */

class UIStore {
  @observable pdpSelectedVariantId = null;
  @observable pdpSelectedOptionId = null;
  /* ACTIONS */

  @action setPDPSelectedVariantId(variantId, optionId) {
    this.pdpSelectedVariantId = variantId;
    this.pdpSelectedOptionId = optionId;
  }
}

export default UIStore;
