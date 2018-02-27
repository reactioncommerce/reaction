import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose, withProps } from "recompose";
import getServiceConfig from "nodemailer-wellknown";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import actions from "../actions";
import EmailConfig from "../components/emailConfig";

const wrapComponent = (Comp) => (
  class EmailConfigContainer extends Component {
    static propTypes = {
      settings: PropTypes.shape({
        host: PropTypes.string,
        password: PropTypes.string,
        port: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string
        ]),
        service: PropTypes.string,
        user: PropTypes.string
      })
    }

    constructor(props) {
      super(props);
      this.state = {
        status: null,
        error: null
      };
    }

    componentDidMount() {
      this._isMounted = true;
      this.checkEmailStatus();
    }

    componentWillReceiveProps(nextProps) {
      const { settings } = this.props;
      const { settings: nextSettings } = nextProps;
      // if the email settings do not match check the email status
      if (JSON.stringify(settings) !== JSON.stringify(nextSettings)) {
        this.checkEmailStatus();
      } else {
        return;
      }
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    // checking email settings
    // and updating status
    checkEmailStatus() {
      const { settings } = this.props;
      const { service, host, port, user, password } = settings;

      if (service && host && port && user && password) {
        Meteor.call("email/verifySettings", (error) => {
          if (!this._isMounted) return;
          if (error) {
            this.setState({ status: "error" });
          } else {
            this.setState({ status: "valid" });
          }
        });
      } else {
        this.setState({ status: "error" });
      }
    }

    render() {
      const { status } = this.state;
      return (
        <Comp {...this.props} status={status} />
      );
    }
  }
);

const composer = (props, onData) => {
  if (Meteor.subscribe("Packages").ready()) {
    const shopSettings = Reaction.getShopSettings();
    const settings = shopSettings.mail || {};

    if (settings.service && settings.service !== "custom") {
      const config = getServiceConfig(settings.service);

      // show localhost for test providers like Maildev that have no host
      settings.host = config.host || "localhost";
      settings.port = config.port;
    }
    return onData(null, { settings });
  }
};

const handlers = { saveSettings: actions.settings.saveSettings };

registerComponent("EmailConfig", EmailConfig, [
  composeWithTracker(composer),
  withProps(handlers),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers),
  wrapComponent
)(EmailConfig);
