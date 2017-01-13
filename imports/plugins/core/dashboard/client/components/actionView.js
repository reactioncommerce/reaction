import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Blaze from "meteor/gadicc:blaze-react-component";
import {
  IconButton,
  Button,
  Translation
} from "/imports/plugins/core/ui/client/components";
import { Admin } from "/imports/plugins/core/ui/client/providers";
import Radium from "radium";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import { VelocityTransitionGroup } from "velocity-react"

const styles = {
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100vh"
  },
  body: {
    webkitOverflowScrolling: "touch"
  }
};

class ActionView extends Component {
  static propTypes = {
    actionView: PropTypes.object,
    actionViewIsOpen: PropTypes.bool,
    buttons: PropTypes.array,
    isActionViewAtRootView: PropTypes.bool
  }

  renderControlComponent() {
    if (this.props.actionView && typeof this.props.actionView.template === "string") {
      return (
        <Blaze
          template={this.props.actionView.template}
        />
      );
    }

    return null;
  }

  renderFooter() {
    // if (this.props.footerTemplate) {
    //   return (
    //     <Blaze template={this.props.footerTemplate} />
    //   );
    // }
  }

  renderBackButton() {
    if (this.props.isActionViewAtRootView === false) {
      return (
        <IconButton
          icon="fa fa-arrow-left"
          onClick={this.props.handleActionViewBack}
        />
      );
    }
  }


  render() {
    const { actionView } = this.props;
    const baseClassName = classnames({
      "admin-controls": true,
      "show-settings": this.props.actionViewIsOpen
    });

    return (
      <div style={styles.base} className={baseClassName}>
        <div className="admin-controls-heading">

          <div className="nav nav-settings">
            <div className="nav-settings-heading">
              {this.renderBackButton()}
              <h3 className="nav-settings-title">
                <Translation
                  defaultValue={actionView.label}
                  i18nKey={actionView.i18nKeyLabel}
                />
              </h3>
            </div>

            <div className="nav-settings-controls">
              <IconButton
                icon="fa fa-times"
                onClick={this.props.handleActionViewClose}
              />
            </div>
          </div>

        </div>
        <div style={styles.body} className="admin-controls-content action-view-body">

            {this.renderControlComponent()}
        </div>
        <div className="admin-controls-footer">
          <div className="admin-controls-container">
            {this.renderFooter()}
          </div>
        </div>

      </div>
    );
  }
}

export default Admin()(Radium(ActionView));
