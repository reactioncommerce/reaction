import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class AddEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasEmail: !!this.props.orderEmail
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.props.handleEmailSubmit) {
      this.props.handleEmailSubmit(event);
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
          <input type="email" name="email" className="form-control" placeholder="email"
            id="update-order-email" aria-describedby="update-order-email"
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
