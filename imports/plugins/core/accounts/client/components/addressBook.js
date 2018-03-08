import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
// import { Router } from "/client/api";

class AddressBook extends Component {
  static propTypes = {
    headingContent: PropTypes.object // { defaultValue: String, i18nKey: String }
  }


  // rendering the address book heading
  // this content will change based on where
  // in the app this component is being used
  renderHeading() {
    const { headingContent } = this.props;
    return (
      <div className="panel-heading">
        <h2 className="panel-title">
          <Components.Translation {...headingContent} />
        </h2>
      </div>
    );
  }

  render() {
    console.log("React AddressBook", this.props);
    return (
      <div className="panel panel-default panel-address-book">
        {this.renderHeading()}
        <div className="address-book">
          Address Book!
        </div>
      </div>
    );
  }
}

registerComponent("AddressBook", AddressBook);

export default AddressBook;
