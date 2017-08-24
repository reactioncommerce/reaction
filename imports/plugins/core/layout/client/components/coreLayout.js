import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Template } from "meteor/templating";

const CoreLayout = ({ actionViewIsOpen, structure }) => {
  const { layoutFooter, template } = structure || {};

  const pageClassName = classnames({
    "page": true,
    "show-settings": actionViewIsOpen
  });

  return (
    <div className={pageClassName} id="reactionAppContainer">
      <Components.NavBar />

      <Blaze template="cartDrawer" className="reaction-cart-drawer" />

      { Template[template] &&
        <main>
          <Blaze template={template} />
        </main>
      }

      { Template[layoutFooter] &&
        <Blaze template={layoutFooter} className="reaction-navigation-footer footer-default" />
      }
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
