import LocalizationSettingsContainer from "./containers/localizationSettingsContainer";
import { registerComponent } from "/imports/plugins/core/layout/lib/components";

registerComponent({
  name: "i18nSettings",
  component: LocalizationSettingsContainer
});
