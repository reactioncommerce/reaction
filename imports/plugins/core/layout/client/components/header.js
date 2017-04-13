import React, { Component, PropTypes } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";

class Header extends Component {
  static propTypes = {
    template: PropTypes.string
  }

  render() {
    if (this.props.template) {
      return (
        <Blaze template={this.props.template} className="reaction-navigation-header" />
      );
    }

    return null;
  }
}

export default Header;
