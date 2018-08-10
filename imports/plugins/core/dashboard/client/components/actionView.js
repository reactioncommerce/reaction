import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import classnames from "classnames";
import { getComponent, withCSSTransitionGroup } from "@reactioncommerce/reaction-components";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Admin } from "/imports/plugins/core/ui/client/providers";
import Radium from "radium";
import debounce from "lodash/debounce";
import {
  IconButton,
  Translation,
  Overlay
} from "/imports/plugins/core/ui/client/components";

const getStyles = (props) => {
  const minWidth = Math.min(props.viewportWidth, 400);
  let viewSize = minWidth;
  let viewMaxSize = "400px";
  const actionView = props.actionView || {};
  const provides = actionView.provides || [];
  // legacy provides could be a string, is an array since 1.5.0, check for either.
  // prototype.includes has the fortunate side affect of checking string equality as well as array inclusion.
  const isBigView = provides.includes("dashboard") ||
                    (provides.includes("shortcut") && actionView.container === "dashboard");
  if (isBigView) {
    viewSize = "90vw";
    viewMaxSize = "100%";
  }

  if (actionView.meta && actionView.meta.actionView) {
    const isSmView = actionView.meta.actionView.dashboardSize === "sm";
    const isMdView = actionView.meta.actionView.dashboardSize === "md";
    const isLgView = actionView.meta.actionView.dashboardSize === "lg";

    if (isSmView) {
      viewSize = `${minWidth}px`;
      viewMaxSize = `${minWidth}px`;
    }
    if (isMdView) {
      viewSize = "50vw";
      viewMaxSize = "50vw";
    }
    if (isLgView) {
      viewSize = "90vw";
      viewMaxSize = "90vw";
    }
  }

  if (props.actionViewIsOpen === false) {
    viewSize = 400;
  }

  return {
    base: {
      "display": "flex",
      "flexDirection": "row",
      "height": "100vh",
      "position": "relative",
      "width": viewSize,
      "maxWidth": viewMaxSize,
      "boxShadow": isBigView ? "0 0 40px rgba(0,0,0,.1)" : "",
      "flex": "0 0 auto",
      "backgroundColor": "white",
      "overflow": "hidden",
      "zIndex": 1050,
      "@media only screen and (max-width: 949px)": {
        width: "auto",
        maxWidth: "100%"
      },
      "@media only screen and (max-width: 767px)": {
        maxWidth: "100%"
      }
    },
    header: {
      display: "flex",
      alignItems: "center",
      position: "relative",
      minHeight: "56px",
      height: "56px",
      padding: "0 20px"
    },
    heading: {
      display: "flex",
      alignItems: "center",
      flex: "1 1 auto",
      position: "relative",
      margin: "0 0 0 1rem",
      height: "100%"
    },
    body: {
      display: "flex",
      flex: "1 1 auto",
      overflow: "auto",
      WebkitOverflowScrolling: "touch"
    },
    masterViewPanel: {
      "display": "flex",
      "flexDirection": "column",
      "flex": "1 1 auto",
      "maxWidth": viewMaxSize,
      "@media only screen and (max-width: 949px)": {
        width: "100vw",
        maxWidth: "100%"
      }
    },
    masterView: {
      flex: "1 1 auto",
      // height: "100%",
      overflow: "auto"
      // WebkitOverflowScrolling: "touch"
    },
    detailViewPanel: {
      "display": "flex",
      "flexDirection": "column",
      "flex": "1 1 auto",
      "maxWidth": viewMaxSize,
      "height": "100vh",
      "backgroundColor": "white",
      "borderRight": "1px solid #ccc",
      "@media only screen and (max-width: 949px)": {
        position: "absolute",
        top: 0,
        right: 0,
        width: "96vw",
        zIndex: 1050
      }
    },
    detailView: {
      width: "100%"
    },
    backButton: {
      height: "100%"
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
    actionViewIsOpen: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    buttons: PropTypes.array,
    CSSTransitionGroup: PropTypes.func,
    detailView: PropTypes.object,
    detailViewIsOpen: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    handleActionViewBack: PropTypes.func,
    handleActionViewClose: PropTypes.func,
    handleActionViewDetailBack: PropTypes.func,
    handleActionViewDetailClose: PropTypes.func,
    isActionViewAtRootView: PropTypes.bool,
    isDetailViewAtRootView: PropTypes.bool,
    language: PropTypes.string,
    viewportWidth: PropTypes.number
  }

  constructor(props) {
    super(props);

    this.state = {
      isMobile: this.isMobile,
      enterAnimationForDetailView: {
        animation: { width: 400 },
        duration: 200,
        easing: "easeInOutQuad"
      },
      leaveAnimationForDetailView: {
        animation: { width: 0 },
        duration: 200,
        easing: "easeInOutQuad"
      }
    };

    this.handleResize = debounce(() => {
      if (window) {
        this.setState({
          isMobile: this.isMobile
        });
      }
    }, 66);
  }

  componentDidMount() {
    if (window) {
      window.addEventListener("resize", this.handleResize, false);
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener("resize", this.handleResize);
    }
  }

  renderControlComponent() {
    if (this.props.actionView && typeof this.props.actionView.template === "string") {
      // Render a react component if one has been registered by name
      try {
        const component = getComponent(this.props.actionView.template);

        return (
          <div style={this.styles.masterView} className="master">
            {React.createElement(component, this.props.actionView.data)}
          </div>
        );
      } catch (error) {
        return (
          <div style={this.styles.masterView} className="master">
            <Blaze
              {...this.props.actionView.data}
              template={this.props.actionView.template}
            />
          </div>
        );
      }
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
    let button;

    if (this.props.isActionViewAtRootView === false) {
      button = (
        <IconButton
          bezelStyle={"flat"}
          icon="fa fa-arrow-left"
          onClick={this.props.handleActionViewBack}
        />
      );
    } else {
      button = (
        <IconButton
          bezelStyle={"flat"}
          icon="fa fa-times"
          onClick={this.props.handleActionViewClose}
        />
      );
    }

    return (
      <div style={this.styles.backButton}>
        <div style={this.styles.backButtonContainers}>
          {button}
        </div>
      </div>
    );
  }

  get isMobile() {
    return window.matchMedia("(max-width: 991px)").matches;
  }

  get actionViewIsLargeSize() {
    const { meta } = this.props.actionView;
    const dashboardSize = (meta && meta.actionView && meta.actionView.dashboardSize) || "sm";
    const includesDashboard = this.props.actionView.provides && this.props.actionView.provides.includes("dashboard");

    return includesDashboard || dashboardSize !== "sm";
  }

  get showOverlay() {
    if (this.props.actionViewIsOpen === false) {
      return false;
    }

    return this.actionViewIsLargeSize || this.state.isMobile;
  }

  get showDetailViewOverlay() {
    return this.props.detailViewIsOpen && this.state.isMobile;
  }

  renderDetailViewBackButton() {
    if (this.props.isDetailViewAtRootView === false) {
      return (
        <div style={this.styles.backButton}>
          <div style={this.styles.backButtonContainers}>
            <IconButton
              bezelStyle={"flat"}
              icon="fa fa-arrow-left"
              onClick={this.props.handleActionViewDetailBack}
            />
          </div>
        </div>
      );
    }

    return (
      <IconButton
        bezelStyle={"flat"}
        icon="fa fa-times"
        onClick={this.props.handleActionViewDetailClose}
      />
    );
  }

  get styles() {
    return getStyles(this.props);
  }

  renderMasterView() {
    const { actionView } = this.props;

    return (
      <div style={this.styles.masterViewPanel}>
        <div style={this.styles.header} className="header">
          {this.renderBackButton()}
          <div style={this.styles.heading} className="heading">
            <h3 className="title" style={this.styles.title}>
              <Translation
                defaultValue={actionView.label || "Dashboard"}
                i18nKey={actionView.i18nKeyLabel || "admin.dashboard.coreTitle"}
              />
            </h3>
          </div>

          <div className="controls»">
            {/* Controls */}
          </div>
        </div>
        <div style={this.styles.body} className="admin-controls-content action-view-body">

          {this.renderControlComponent()}

        </div>
      </div>

    );
  }

  renderDetailView() {
    const { actionView } = this.props;

    const baseClassName = classnames({
      "rui": true,
      "admin": true,
      "action-view-pane": true,
      "action-view-detail": true
    });

    if (this.props.detailViewIsOpen) {
      return (
        <div className={baseClassName} style={this.styles.detailViewPanel} key="detail-view">
          <div style={this.styles.header} className="header">
            {this.renderDetailViewBackButton()}

            <div style={this.styles.heading} className="heading">
              <h3 className="title" style={this.styles.title}>
                <Translation
                  defaultValue={actionView.label}
                  i18nKey={actionView.i18nKeyLabel}
                />
              </h3>
            </div>

            <div className="controls">
              {/* Controls */}
            </div>
          </div>
          <div style={this.styles.body} className="admin-controls-content action-view-body">

            {/* this.renderControlComponent() */}
            {this.renderDetailComponent()}
          </div>
        </div>
      );
    }

    return null;
  }

  renderActionView() {
    const { CSSTransitionGroup } = this.props;

    const baseClassName = classnames({
      "rui": true,
      "admin": true,
      "action-view-pane": true,
      "action-view": true,
      "open": this.props.actionViewIsOpen
    });

    if (this.props.actionViewIsOpen) {
      const isRtl = document.querySelector("html").className === "rtl";

      return (
        <div style={this.styles.base} className={baseClassName} role="complementary" key="action-view">

          {this.renderMasterView()}
          <Overlay
            isVisible={this.showDetailViewOverlay}
            onClick={this.props.handleActionViewDetailClose}
          />
          <CSSTransitionGroup
            transitionName={`slide-in-out${isRtl && "-rtl" || ""}`}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
          >
            {this.renderDetailView()}
          </CSSTransitionGroup>


          <div className="admin-controls-footer">
            <div className="admin-controls-container">
              {this.renderFooter()}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { CSSTransitionGroup } = this.props;
    if (CSSTransitionGroup === undefined) {
      return null;
    }

    const isRtl = document.querySelector("html").className === "rtl";
    return (
      <div>
        <CSSTransitionGroup
          transitionName={`slide-in-out${isRtl && "-rtl" || ""}`}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          {this.renderActionView()}
        </CSSTransitionGroup>
        <Overlay
          isVisible={this.showOverlay}
          onClick={this.props.handleActionViewClose}
        />
      </div>
    );
  }
}

export default Admin()(
  compose(
    withCSSTransitionGroup,
    Radium
  )(ActionView)
);
