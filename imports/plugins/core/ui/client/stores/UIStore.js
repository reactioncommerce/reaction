import { observable, action, computed } from "mobx";

/**
 * @class UIStore
 * MobX store for UI state
 */

class UIStore {
  /**
   * Whether the main admin panel is open
   * @type Boolean
   * @default false
   */
  @observable isActionViewOpen = false;

  /**
   * Whether the admin panel detail view (i.e. order detail) is open
   * @type Boolean
   * @default false
   */
  @observable isActionViewDetailOpen = false;

  /**
   * Stack of registry data for top-level admin action views
   * @type Array
   * @default []
   */
  @observable actionViewStack = [];

  /**
   * Stack of registry data for detail-level admin action views
   * @type Array
   * @default []
   */
  @observable actionDetailViewStack = [];

  @computed get actionViews() {
    return this.actionViewStack.toJS();
  }

  @computed get actionDetailViews() {
    return this.actionDetailViewStack.toJS();
  }

  @action showActionView() {
    this.isActionViewOpen = true;
  }

  @action hideActionView() {
    this.isActionViewOpen = false;
  }

  @action showActionViewDetail() {
    this.isActionViewDetailOpen = true;
  }

  @action hideActionViewDetail() {
    this.isActionViewDetailOpen = false;
  }

  @action setActionViews(views) {
    this.actionViewStack.replace(views);
  }

  @action setActionDetailViews(views) {
    this.actionDetailViewStack.replace(views);
  }
}

export default UIStore;
