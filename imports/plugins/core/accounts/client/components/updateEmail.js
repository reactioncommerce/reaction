import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class UpdateEmail extends Component {
  static propTypes = {
    email: PropTypes.string,
    handleUpdateEmail: PropTypes.func.isRequired,
    uniqueId: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      email: props.email,
      showSpinner: false
    };
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault;
    this.setState({ showSpinner: true });
    const options = {
      newEmail: this.state.email,
      oldEmail: this.props.email
    };
    this.props.handleUpdateEmail(options, () => this.setState({ showSpinner: false }));
  }

  render() {
    const { showSpinner } = this.state;

    return (
      <div>
        <Components.TextField
          i18nKeyLabel="accountsUI.emailAddress"
          label="Email Address"
          name="email"
          type="email"
          id={`email-${this.props.uniqueId}`}
          value={this.state.email}
          onChange={this.handleFieldChange}
        />
        <Components.Button
          bezelStyle={"solid"}
          icon={showSpinner ? "fa fa-spin fa-circle-o-notch" : ""}
          i18nKeyLabel={showSpinner ? "accountsUI.updatingEmailAddress" : "accountsUI.updateEmailAddress"}
          label={showSpinner ? "Updating Email Address" : "Update Email Address"}
          status={"primary"}
          onClick={this.handleSubmit}
          disabled={this.state.email === this.props.email}
        />
      </div>
    );
  }
}

export default UpdateEmail;
