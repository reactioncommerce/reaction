import React, { Component, PropTypes } from "react";
import { Col, Panel } from "react-bootstrap";
import { Icon } from "/imports/plugins/core/ui/client/components";
import "./email_config.css";

class EmailConfig extends Component {
  constructor(props) {
    super(props);

    this.state = {
      passwordHidden: true
    };

    this.togglePassword = this.togglePassword.bind(this);
  }

  togglePassword() {
    this.setState({
      passwordHidden: !this.state.passwordHidden
    });
  }

  render() {
    const { settings, status, toggleSettings } = this.props;
    const { service, host, port, user, password } = settings;
    const { passwordHidden } = this.state;

    const Header = () => (
      <div className="email-config-header">
        <div className="email-config-title" data-i18n="mail.headers.config">
          Configuration
        </div>
        <div className="email-config-status">
          <span data-i18n="mail.headers.status">Status</span>:
          {status ?
              <i className={`fa fa-circle ${status}`} />
            : <i className={"fa fa-refresh fa-spin"} />}
        </div>
      </div>
    );

    const NotSet = () => <span data-i18n="mail.settings.fieldNotSet">Not set</span>;

    return (
      <Col md={4} sm={12}>
        <Panel header={<Header/>}>
          <div className="pull-right">
            <a onClick={toggleSettings}><Icon icon="gear"/></a>
          </div>
          <div>
            <strong data-i18n="mail.settings.service">Service</strong>: {service || <NotSet/>}
          </div>
          <div className="truncate">
            <strong data-i18n="mail.settings.host">Host</strong>: {host || <NotSet/>}
          </div>
          <div>
            <strong data-i18n="mail.settings.port">Port</strong>: {port || <NotSet/>}
          </div>
          <div className="truncate">
            <strong data-i18n="mail.settings.user">User</strong>: {user || <NotSet/>}
          </div>
          <div>
            <strong data-i18n="mail.settings.password">Password</strong>:&nbsp;&nbsp;
            {password ?
              <span>
                {passwordHidden ? "********" : password}
                <a onClick={this.togglePassword}>
                  <span style={{ marginLeft: "1rem" }}>
                    <em>{passwordHidden ?
                        <span data-i18n="mail.settings.passwordShow">Show</span>
                      : <span data-i18n="mail.settings.passwordHide">Hide</span>}
                    </em>
                  </span>
                </a>
              </span>
              : <NotSet/>}
          </div>
        </Panel>
      </Col>
    );
  }
}

EmailConfig.propTypes = {
  settings: PropTypes.shape({
    host: PropTypes.string,
    password: PropTypes.string,
    port: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    service: PropTypes.string,
    user: PropTypes.string
  }),
  status: PropTypes.string,
  toggleSettings: PropTypes.func.isRequired
};

export default EmailConfig;
