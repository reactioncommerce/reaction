import "./helpers/cart.js";

// import "./templates/cartDrawer/cartDrawer.html";
// import "./templates/cartDrawer/cartDrawer.js";

import "./templates/cartIcon/cartIcon.html";
import "./templates/cartIcon/cartIcon.js";

import "./templates/checkout/addressBook/addressBook.html";
import "./templates/checkout/addressBook/addressBook.js";
import "./templates/checkout/completed/completed.html";
import "./templates/checkout/completed/completed.js";
import "./templates/checkout/login/login.html";
import "./templates/checkout/login/login.js";
import "./templates/checkout/progressBar/progressBar.html";
import "./templates/checkout/progressBar/progressBar.js";
import "./templates/checkout/review/review.html";
import "./templates/checkout/review/review.js";
import "./templates/checkout/checkout.html";
import "./templates/checkout/checkout.js";

export { default as FilledCartDrawer } from "./components/filledCartDrawer";
export { default as CartIcon } from "./components/cartIcon";
export { default as CartIconCustomer } from "./components/cartIconCustomer";
export { default as CartItems } from "./components/cartItems";
export { default as CartPanel } from "./components/cartPanel";
export { default as CartPanelCustomer } from "./components/cartPanelCustomer";
export { default as CartSubTotal } from "./components/cartSubTotal";
export { default as EmptyCartDrawer } from "./components/emptyCartDrawer";

export { default as CartDrawerContainerAdmin } from "./containers/cartDrawerContainerAdmin";
export { default as CartDrawerContainerCustomer } from "./containers/cartDrawerContainerCustomer";
export { default as FilledCartDrawerCustomer } from "./containers/filledCartDrawerContainerCustomer";
export { default as FilledCartDrawerAdmin } from "./containers/filledCartDrawerContainerAdmin";
export { default as CartIconContainer } from "./containers/cartIconContainer";
export { default as CartIconContainerCustomer } from "./containers/cartIconContainerCustomer";
export { default as CartPanelContainer } from "./containers/cartPanelContainer";
export { default as CartPanelContainerCustomer } from "./containers/cartPanelContainerCustomer";
export { default as CartSubTotalContainer } from "./containers/cartSubTotalContainer";
export { default as CartSubTotalContainerCustomer } from "./containers/cartSubTotalContainerCustomer";
