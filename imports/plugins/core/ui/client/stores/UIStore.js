import { observable, action, decorate } from "mobx";

/**
 * @class UIStore
 * MobX store for UI state
 */

class UIStore {
  /**
   * @observable
   * Whether the main admin panel is open
   * @type Boolean
   * @default false
   */
  isActionViewOpen = false;

  /**
   * @observable
   * Whether the admin panel detail view (i.e. order detail) is open
   * @type Boolean
   * @default false
   */
  isActionViewDetailOpen = false;

  // @action
  showActionView() {
    this.isActionViewOpen = true;
  }

  // @action
  hideActionView() {
    this.isActionViewOpen = false;
  }

  // @action
  showActionViewDetail() {
    this.isActionViewDetailOpen = true;
  }

  // @action
  hideActionViewDetail() {
    this.isActionViewDetailOpen = false;
  }
}

decorate(UIStore, {
  isActionViewOpen: observable,
  isActionViewDetailOpen: observable,
  showActionView: action,
  hideActionView: action,
  showActionViewDetail: action,
  hideActionViewDetail: action
});

export default UIStore;
