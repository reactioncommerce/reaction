/* eslint-disable react/no-did-update-set-state */
/* eslint-disable react/no-did-mount-set-state */
/* TODO: revisit this component and convert to functional component to remove need for state */
import React, { Component } from "react";
import { compose } from "recompose";
import PropTypes from "prop-types";
import classnames from "classnames";
import { isEqual } from "lodash";
import { getComponent, withCSSTransition } from "@reactioncommerce/reaction-components";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Admin } from "/imports/plugins/core/ui/client/providers";
import Radium from "radium";
import debounce from "lodash/debounce";
import { IconButton, Translation, Overlay } from "/imports/plugins/core/ui/client/components";

const getStyles = (props) => {
  const minWidth = Math.min(props.viewportWidth, 400);
  let viewSize = minWidth;
  let viewMaxSize = "400px";
  const actionView = props.actionView || {};
  const provides = actionView.provides || [];
  // legacy provides could be a string, is an array since 1.5.0, check for either.
  // prototype.includes has the fortunate side affect of checking string equality as well as array inclusion.
  const isBigView =
    provides.includes("dashboard") || (provides.includes("shortcut") && actionView.container === "dashboard");

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
        width: "100vw"
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
      "width": "24vw",
      "@media only screen and (max-width: 1420px)": {
        width: "35vw"
      },
      "@media only screen and (max-width: 1024px)": {
        position: "absolute",
        top: 0,
        right: 0,
        width: "100vw",
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
    CSSTransition: PropTypes.func,
    actionView: PropTypes.object,
    actionViewIsOpen: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    buttons: PropTypes.array,
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
  };

  static getDerivedStateFromProps(props) {
    const { actionView, detailView, prevProps = {} } = props;

    const stateUpdates = { prevProps: props };

    if (isEqual(actionView, prevProps.actionView) === false) {
      stateUpdates.actionView = actionView;
    }
    if (isEqual(detailView, prevProps.detailView) === false) {
      stateUpdates.detailView = detailView;
    }

    return stateUpdates;
  }

  constructor(props) {
    super(props);

    this.state = {
      isMobile: this.isMobile,
      actionView: {},
      detailView: null
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

    const { actionView } = this.props;
    if (actionView) {
      this.setState({ actionView });
    }
  }

  componentDidUpdate(prevProps) {
    const { actionView } = this.props;

    if (isEqual(actionView, prevProps.actionView) === false) {
      this.setState({ actionView });
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener("resize", this.handleResize);
    }
  }

  renderControlComponent() {
    const { actionView } = this.state;
    if (actionView && typeof actionView.template === "string") {
      // Render a react component if one has been registered by name
      try {
        const component = getComponent(actionView.template);

        return (
          <div style={this.styles.masterView} className="master">
            {React.createElement(component, actionView.data)}
          </div>
        );
      } catch (error) {
        return (
          <div style={this.styles.masterView} className="master">
            <Blaze {...actionView.data} template={actionView.template} />
          </div>
        );
      }
    }

    return null;
  }

  renderDetailComponent() {
    const { detailView } = this.state;
    if (detailView && typeof detailView.template === "string") {
      return (
        <div style={this.styles.detailView} className="detail">
          <Blaze {...detailView.data} template={detailView.template} />
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
      button = <IconButton bezelStyle={"flat"} icon="fa fa-arrow-left" onClick={this.props.handleActionViewBack} />;
    } else {
      button = <IconButton bezelStyle={"flat"} icon="fa fa-times" onClick={this.props.handleActionViewClose} />;
    }

    return (
      <div style={this.styles.backButton}>
        <div style={this.styles.backButtonContainers}>{button}</div>
      </div>
    );
  }

  get isMobile() {
    return window.matchMedia("(max-width: 991px)").matches;
  }

  get actionViewIsLargeSize() {
    const { actionView } = this.props;
    const { meta } = actionView;
    const dashboardSize = (meta && meta.actionView && meta.actionView.dashboardSize) || "sm";
    const includesDashboard = actionView.provides && actionView.provides.includes("dashboard");

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
            <IconButton bezelStyle={"flat"} icon="fa fa-arrow-left" onClick={this.props.handleActionViewDetailBack} />
          </div>
        </div>
      );
    }

    return <IconButton bezelStyle={"flat"} icon="fa fa-times" onClick={this.props.handleActionViewDetailClose} />;
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

          <div className="controls»">{/* Controls */}</div>
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

    return (
      <div className={baseClassName} style={this.styles.detailViewPanel} key="detail-view">
        <div style={this.styles.header} className="header">
          {this.renderDetailViewBackButton()}

          <div style={this.styles.heading} className="heading">
            <h3 className="title" style={this.styles.title}>
              <Translation defaultValue={actionView.label} i18nKey={actionView.i18nKeyLabel} />
            </h3>
          </div>

          <div className="controls">{/* Controls */}</div>
        </div>
        <div style={this.styles.body} className="admin-controls-content action-view-body">
          {/* this.renderControlComponent() */}
          {this.renderDetailComponent()}
        </div>
      </div>
    );
  }

  renderActionView() {
    const { CSSTransition, detailView } = this.props;

    const baseClassName = classnames({
      "rui": true,
      "admin": true,
      "action-view-pane": true,
      "action-view": true,
      "open": this.props.actionViewIsOpen
    });

    const isRtl = document.querySelector("html").className === "rtl";

    return (
      <div style={this.styles.base} className={baseClassName} role="complementary" key="action-view">
        {this.renderMasterView()}
        <Overlay isVisible={this.showDetailViewOverlay} onClick={this.props.handleActionViewDetailClose} />
        <CSSTransition
          in={this.props.detailViewIsOpen}
          unmountOnExit
          classNames={`slide-in-out${(isRtl && "-rtl") || ""}`}
          timeout={200}
          onEnter={() => this.setState({ detailView })}
          onExited={() => this.setState({ detailView })}
        >
          {this.renderDetailView()}
        </CSSTransition>

        <div className="admin-controls-footer">
          <div className="admin-controls-container">{this.renderFooter()}</div>
        </div>
      </div>
    );
  }

  render() {
    const { CSSTransition, actionView } = this.props;
    if (CSSTransition === undefined) {
      return null;
    }

    const isRtl = document.querySelector("html").className === "rtl";
    return (
      <div>
        <CSSTransition
          in={this.props.actionViewIsOpen}
          unmountOnExit
          classNames={`slide-in-out${(isRtl && "-rtl") || ""}`}
          timeout={200}
          onEnter={() => this.setState({ actionView })}
          onExited={() => this.setState({ actionView })}
        >
          {this.renderActionView()}
        </CSSTransition>
        <Overlay isVisible={this.showOverlay} onClick={this.props.handleActionViewClose} />
      </div>
    );
  }
}

export default Admin()(compose(withCSSTransition, Radium)(ActionView));
