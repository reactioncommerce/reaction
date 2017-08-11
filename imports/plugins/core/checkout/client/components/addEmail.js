import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";


class AddEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasEmail: !!this.props.orderEmail
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  };

  handleSubmit(event) {
    event.preventDefault();
    if (this.props.handleEmailSubmit) {
      this.props.handleEmailSubmit(this.state.email);
    }
  }

  render() {
    if (this.state.hasEmail) {
      return (
        <p>
          <Components.Translation defaultValue="Order updates will be sent to" i18nKey={"cartCompleted.trackYourDelivery"} />
          &nbsp;<strong>{this.props.orderEmail}</strong>
        </p>
      );
    }
    return (
      <form onSubmit={this.handleSubmit} className="add-email-input">
        <div className="input-group">
          <Components.TextField
            label="Email"
            name="email"
            type="email"
            tabIndex="1"
            value={this.state.email}
            onChange={this.handleFieldChange}
          />
          <input type="submit" className="input-group-addon" id="update-order" data-i18n="app.submit" />
        </div>
      </form>
    );
  }
}

AddEmail.propTypes = {
  handleEmailSubmit: PropTypes.func,
  orderEmail: PropTypes.string
};

export default AddEmail;
