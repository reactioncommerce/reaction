import Accounts from "./accounts";
import i18n from "./i18n";
import Load from "./load-data";
import Packages from "./packages";
import Plugins from "./plugins";
import Registry from "./registry";
import Init from "./init";

export default function () {
  Accounts();
  i18n();
  Load();
  Packages();
  Plugins();
  Registry();
  Init();
}
