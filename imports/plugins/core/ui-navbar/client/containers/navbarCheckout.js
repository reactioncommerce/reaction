import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import NavBarCheckout from "../components/navbarCheckout";
import { composer } from "./navbarAdmin";

registerComponent("NavBarCheckout", NavBarCheckout, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBarCheckout);
