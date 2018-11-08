import Language from "@material-ui/icons/Language";

import { registerOperatorRoute } from "/imports/client/ui";
import Localization from "./containers/localizationSettings";

export { default as CurrencyDropdown } from "./containers/currencyDropdown";
export { default as LanguageDropdown } from "./containers/languageDropdown";
export { default as LocalizationSettings } from "./containers/localizationSettings";

registerOperatorRoute({
  isNavigationLink: true,
  mainComponent: Localization,
  path: "/localization",
  sidebarIconComponent: Language,
  sidebarI18nLabel: "admin.i18nSettings.shopLocalization"
});
