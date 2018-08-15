import Reaction from "/imports/plugins/core/core/server/Reaction";
import SimpleLayout from "../lib/layout/simple";
import SimpleLayoutCustomer from "../lib/layout/simpleCustomer";
import TwoColumnLayout from "../lib/layout/twoColumn";
import TwoColumnLayoutCustomer from "../lib/layout/twoColumnCustomer";
import "./i18n";

Reaction.registerTemplate({
  name: "productDetailSimple",
  title: "Product Detail Simple Layout",
  type: "react",
  templateFor: ["pdp"],
  permissions: ["admin", "owner"],
  audience: ["anonymous", "guest"],
  template: SimpleLayout()
});

Reaction.registerTemplate({
  name: "productDetailSimpleCustomer",
  title: "Product Detail Simple Layout Customer",
  type: "react",
  enabled: false,
  templateFor: ["pdp"],
  permissions: ["admin", "owner"],
  audience: ["anonymous", "guest"],
  template: SimpleLayoutCustomer()
});

Reaction.registerTemplate({
  name: "productDetailTwoColumn",
  title: "Product Detail Two Column Layout",
  type: "react",
  templateFor: ["pdp"],
  audience: ["anonymous", "guest"],
  template: TwoColumnLayout()
});

Reaction.registerTemplate({
  name: "productDetailTwoColumnCustomer",
  title: "Product Detail Two Column Layout Customer",
  type: "react",
  enabled: false,
  templateFor: ["pdp"],
  audience: ["anonymous", "guest"],
  template: TwoColumnLayoutCustomer()
});
