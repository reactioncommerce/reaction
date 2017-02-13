import "./templates/checkoutForm.html";
import "./templates/checkoutForm";
import { registerComponent } from "/imports/plugins/core/layout/lib/components";

import {
  ExampleCheckoutForm
} from "./components";

import {
  ExampleCheckoutFormContainer
} from "./containers";

registerComponent({
  name: "ExampleCheckoutForm",
  component: ExampleCheckoutForm
});

registerComponent({
  name: "ExampleCheckoutFormContainer",
  component: ExampleCheckoutFormContainer
});
