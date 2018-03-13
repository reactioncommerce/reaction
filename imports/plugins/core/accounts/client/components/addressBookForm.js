import React, { Component } from "react";
import PropTypes from "prop-types";
import { Countries } from "/client/collections";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class AddressBookForm extends Component {
  static propTypes = {}

  state = {
    countries: []
  }

  componentWillMount() {
    const countries = Countries.find().fetch();
    this.setState({ countries });
  }

  // on submit event handler
  onSubmit = (event) => {
    event.preventDefault();
    console.log("addess book form submited", event);
  }

  // on field change handler
  onFieldChange = (event) => {
    console.log("on field change event", event);
  }

  render() {
    const { countries } = this.state;
    console.log("React AddressBookForm", this.props, this.state);
    return (
      <form onSubmit={this.onSubmit}>
        <div className="row">
          <div className="col-md-6 form-group">
            <Components.Select
              label="Country"
              name="country"
              options={countries}
              onChange={this.onFieldChange}
              placeholder="Country"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 form-group">
            <Components.TextField
              label="Full Name"
            />
          </div>
        </div>
      </form>
    );
  }
}

registerComponent("AddressBookForm", AddressBookForm);

export default AddressBookForm;
