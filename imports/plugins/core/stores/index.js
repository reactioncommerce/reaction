import { configure } from "mobx";
import UIStore from "./uiStore";

configure({ enforceActions: true });

const uiStore = new UIStore();

export default {
  uiStore
};
