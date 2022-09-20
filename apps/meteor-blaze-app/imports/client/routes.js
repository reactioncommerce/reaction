/* eslint-disable node/no-missing-import */
import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";

import "./layout.html";
import "./images/images";

FlowRouter.route("/", {
  action() {
    FlowRouter.go("/images");
  }
});

FlowRouter.route("/images", {
  action() {
    BlazeLayout.render("layout", { main: "images" });
  }
});
