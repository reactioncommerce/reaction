import "./templates/checkoutForm.html";
import "./templates/checkoutForm";
import { registerComponent } from "/imports/plugins/core/layout/lib/components";

import {
  ExampleCheckoutForm
} from "./components";

import {
  ExampleSettingsForm
} from "./components";

import {
  ExampleCheckoutFormContainer
} from "./containers";

import {
  ExampleSettingsFormContainer
} from "./containers";

registerComponent({
  name: "ExampleCheckoutForm",
  component: ExampleCheckoutForm
});

registerComponent({
  name: "ExampleSettingsForm",
  component: ExampleSettingsForm
});

registerComponent({
  name: "ExampleSettingsFormContainer",
  component: ExampleSettingsFormContainer
});

registerComponent({
  name: "ExampleCheckoutFormContainer",
  component: ExampleCheckoutFormContainer
});
