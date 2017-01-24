import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Blaze from "meteor/gadicc:blaze-react-component";
import {
  IconButton,
  Translation
} from "/imports/plugins/core/ui/client/components";
import { Admin } from "/imports/plugins/core/ui/client/providers";
import Radium from "radium";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import { VelocityTransitionGroup } from "velocity-react";

const getStyles = (props) => {
  let viewSize = 400;
  // if (props.actionView && props.actionView.priority === 1 && props.actionView.provides === "dashboard") {
  if (props.actionView && props.actionView.provides === "dashboard") {
    viewSize = "90vw";
  }

  if (props.actionViewIsOpen === false) {
    viewSize = 0;
  }

  return {
    base: {
      "display": "flex",
      "flexDirection": "row",
      "height": "100vh",
      "position": "relative",
      "width": viewSize,
      "@media only screen and (max-width: 949px)": {
        width: "100vw"
      }
    },
    header: {
      display: "flex",
      alignItems: "center",
      position: "relative",
      height: "56px",
      padding: "0 20px",
      margin: 0
    },
    heading: {
      display: "flex",
      alignItems: "center",
      flex: "1 1 auto",
      position: "relative",
      margin: 0,
      height: "100%"
    },
    body: {
      display: "flex",
      WebkitOverflowScrolling: "touch"
    },
    masterViewPanel: {
      flex: "1 1 auto",
      // height: "100%"
    },
    masterView: {
      flex: "1 1 auto",
      height: "100%",
      overflow: "auto",
      WebkitOverflowScrolling: "touch"
    },
    detailViewPanel: {
      flex: "1 1 auto",
      width: "400px",
      // height: "100%",
      backgroundColor: "white",
      borderRight: "1px solid #ccc",
      "@media only screen and (max-width: 949px)": {
        position: "absolute",
        top: 0,
        right: 0,
        width: "96vw"
      }
    },
    detailView: {
      height: "100%",
      overflow: "auto",
      webkitOverflowScrolling: "touch",
      backgroundColor: "#ccc"
    },
    title: {
      margin: 0,
      transition: "200ms all"
    },
    titleWithBackButton: {
      paddingLeft: 40
    },
    backButton: {
      height: "100%",
      position: "absolute",
      top: 0,
      zIndex: 1
    },
    backButtonContainers: {
      display: "flex",
      alignItems: "center",
      height: "100%"
    }
  };
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
        <div style={this.styles.masterView} className="master">
          <Blaze
            {...this.props.actionView.data}
            template={this.props.actionView.template}
          />
        </div>
      );
    }

    return null;
  }

  renderDetailComponent() {
    if (this.props.detailView && typeof this.props.detailView.template === "string") {
      return (
        <div style={this.styles.detailView} className="detail">
          <Blaze
            {...this.props.detailView.data}
            template={this.props.detailView.template}
          />
      </div>
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
        <div style={this.styles.backButton}>
          <div style={this.styles.backButtonContainers}>
            <IconButton
              icon="fa fa-arrow-left"
              onClick={this.props.handleActionViewBack}
            />
          </div>
        </div>
      );
    }
  }

  renderDetailViewBackButton() {
    if (this.props.isDetailViewAtRootView === false) {
      return (
        <div style={this.styles.backButton}>
          <div style={this.styles.backButtonContainers}>
            <IconButton
              icon="fa fa-arrow-left"
              onClick={this.props.handleActionViewDetailBack}
            />
          </div>
        </div>
      );
    } else {

      return (
        <IconButton
          icon="fa fa-times"
          onClick={this.props.handleActionViewDetailClose}
        />
      )
    }
  }

  get styles() {
    return getStyles(this.props);
  }

  get backButtonEnterAnimation() {
    return {
      animation: {
        display: "flex",
        position: "absolute",
        left: 20,
        opaticy: 1
      },
      duration: 200
    };
  }

  get backButtonLeaveAnimaton() {
    return {
      animation: {
        display: "flex",
        position: "absolute",
        left: -30,
        opaticy: 0
      },
      duration: 200

    };
  }

  renderMasterView() {
    const { actionView } = this.props;

    return (
      <div style={this.styles.masterViewPanel}>
        <div style={this.styles.header} className="admin-controls-heading--">
          <VelocityTransitionGroup
            enter={this.backButtonEnterAnimation}
            leave={this.backButtonLeaveAnimaton}
          >
            {this.renderBackButton()}
          </VelocityTransitionGroup>

          <div style={this.styles.heading} className="nav-settings-heading--">
            <h3
              className="nav-settings-title--"
              style={[
                this.styles.title,
                !this.props.isActionViewAtRootView ? this.styles.titleWithBackButton : {}
              ]}
            >
              <Translation
                defaultValue={actionView.label || "Dashboard"}
                i18nKey={actionView.i18nKeyLabel || "dashboard.coreTitle"}
              />
            </h3>
          </div>

          <div className="nav-settings-controls--">
            <IconButton
              icon="fa fa-times"
              onClick={this.props.handleActionViewClose}
            />
          </div>
        </div>
        <div style={this.styles.body} className="admin-controls-content action-view-body">

            {this.renderControlComponent()}

        </div>
      </div>

    )
  }

  renderDetailView() {
    const { actionView } = this.props;

    if (this.props.detailViewIsOpen) {
      return (
        <div style={this.styles.detailViewPanel}>
          <div style={this.styles.header} className="admin-controls-heading--">
            <VelocityTransitionGroup
              enter={this.backButtonEnterAnimation}
              leave={this.backButtonLeaveAnimaton}
            >
              {this.renderDetailViewBackButton()}
            </VelocityTransitionGroup>

            <div style={this.styles.heading} className="nav-settings-heading--">
              <h3
                className="nav-settings-title--"
                style={[
                  this.styles.title,
                  !this.props.isDetailViewAtRootView ? this.styles.titleWithBackButton : {}
                ]}
              >
                <Translation
                  defaultValue={actionView.label}
                  i18nKey={actionView.i18nKeyLabel}
                />
              </h3>
            </div>

            <div className="nav-settings-controls--">
              {/* Controls */}
            </div>
          </div>
          <div style={this.styles.body} className="admin-controls-content action-view-body">

              {/*this.renderControlComponent() */}
              {this.renderDetailComponent()}
          </div>
        </div>

      )
    }
  }

  render() {
    const { actionView } = this.props;
    const baseClassName = classnames({
      "admin-controls": true,
      "show-settings": this.props.actionViewIsOpen
    });


    return (
      <div style={this.styles.base} className={baseClassName}>

        {this.renderMasterView()}
        {this.renderDetailView()}


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
