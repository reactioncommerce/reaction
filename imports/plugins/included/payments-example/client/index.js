import "./templates/checkoutForm.html";
import "./templates/checkoutForm";
import { registerComponent } from "/imports/plugins/core/layout/lib/components";

import {
  CheckoutForm
} from "./components";

registerComponent({
  name: "CheckoutForm",
  component: CheckoutForm
});
