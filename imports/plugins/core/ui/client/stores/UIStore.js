import { observable, computed, action, decorate } from "mobx";

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

  /**
   * @observable
   * Stack of registry data for top-level admin action views
   * @type Array
   * @default []
   */
  actionViewStack = [];

  /**
   * @observable
   * Stack of registry data for detail-level admin action views
   * @type Array
   * @default []
   */
  actionDetailViewStack = [];

  // @computed
  get actionViews() {
    return this.actionViewStack.toJS();
  }

  // @computed
  get actionDetailViews() {
    return this.actionDetailViewStack.toJS();
  }

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

  // @action
  setActionViews(views) {
    this.actionViewStack.replace(views);
  }

  // @action
  setActionDetailViews(views) {
    this.actionDetailViewStack.replace(views);
  }
}

decorate(UIStore, {
  /**
   * Observables
   */
  isActionViewOpen: observable,
  isActionViewDetailOpen: observable,
  actionViewStack: observable,
  actionDetailViewStack: observable,
  
  /**
   * Actions
   */
  showActionView: action,
  hideActionView: action,
  showActionViewDetail: action,
  hideActionViewDetail: action,
  setActionViews: action,
  setActionDetailViews: action
});

export default UIStore;
