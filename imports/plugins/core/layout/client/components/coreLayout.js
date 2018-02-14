import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { getComponent, registerComponent } from "@reactioncommerce/reaction-components";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Template } from "meteor/templating";

const CoreLayout = ({ actionViewIsOpen, structure }) => {
  const { layoutHeader, layoutFooter, template } = structure || {};

  const pageClassName = classnames({
    "page": true,
    "show-settings": actionViewIsOpen
  });

  const headerComponent = layoutHeader && getComponent(layoutHeader);
  const footerComponent = layoutFooter && getComponent(layoutFooter);

  let mainNode = null;
  try {
    const mainComponent = getComponent(template);
    mainNode = React.createElement(mainComponent, {});
  } catch (error) {
    //  Probe for Blaze template (legacy)
    if (Template[template]) {
      mainNode = <Blaze template={template} />;
    }
  }

  return (
    <div className={pageClassName} id="reactionAppContainer">

      {headerComponent && React.createElement(headerComponent, {})}

      <Blaze template="cartDrawer" className="reaction-cart-drawer" />

      <main>
        {mainNode}
      </main>

      {footerComponent && React.createElement(footerComponent, {})}
    </div>
  );
};

CoreLayout.propTypes = {
  actionViewIsOpen: PropTypes.bool,
  data: PropTypes.object,
  structure: PropTypes.object
};

registerComponent("coreLayout", CoreLayout);

export default CoreLayout;
