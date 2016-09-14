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
    const { settings, status } = this.props;
    const { service, host, port, user, password } = settings;
    const { passwordHidden } = this.state;

    const Header = () => (
      <div className="email-config-header">
        <div className="email-config-title">Configuration</div>
        <div className="email-config-status">
          Status:
          {status ?
              <i className={`fa fa-circle ${status}`} />
            : <i className={"fa fa-refresh fa-spin"} />}
        </div>
      </div>
    );

    return (
      <Col md={4} sm={12}>
        <Panel header={<Header/>}>
          <div className="pull-right">
            <a onClick={this.props.toggleSettings}><Icon icon="gear"/></a>
          </div>
          <div><strong>Service:</strong> {service || "Not set"}</div>
          <div>
            <strong>Host:</strong> {host || "Not set"}
          </div>
          <div>
            <strong>Port:</strong> {port || "Not set"}
          </div>
          <div><strong>User:</strong> {user || "Not set"}</div>
          <div>
            <strong>Password:</strong>&nbsp;&nbsp;
            {password ?
              <span>
                {passwordHidden ? "********" : password}
                <a onClick={this.togglePassword}>
                  <span style={{ marginLeft: "1rem" }}>
                    <em>{passwordHidden ? "Show" : "Hide"}</em>
                  </span>
                </a>
              </span>
              : "Not set"}
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
