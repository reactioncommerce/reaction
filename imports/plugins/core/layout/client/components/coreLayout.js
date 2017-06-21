import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Template } from "meteor/templating";
import { ReactionComponents } from "@reactioncommerce/reaction-layout";

class CoreLayout extends Component {
  static propTypes = {
    actionViewIsOpen: PropTypes.bool,
    data: PropTypes.object,
    structure: PropTypes.object
  }

  render() {
    const { layoutHeader, layoutFooter, template } = this.props.structure || {};
    const pageClassName = classnames({
      "page": true,
      "show-settings": this.props.actionViewIsOpen
    });

    return (
      <div className={pageClassName} id="reactionAppContainer">
        <ReactionComponents.Component
          name={layoutHeader}
        />

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
  }
}

export default CoreLayout;
