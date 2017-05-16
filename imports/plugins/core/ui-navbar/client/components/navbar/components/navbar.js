import React, { Component, PropTypes } from "react";
import BrandContainer from "../containers/brandContainer";
import { FlatButton } from "/imports/plugins/core/ui/client/components";

class NavBar extends Component {
  constructor(props) {
    super(props);
  }

  renderSearchButton() {
    if (this.props.isSearchEnabled()) {
      return (
        <div className="search">
          <FlatButton
            icon={this.props.icon}
            kind={this.props.kind}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div>
          <BrandContainer />
        </div>

        {this.renderSearchButton()}

      </div>
    );
  }
}

NavBar.propTypes = {
  icon: PropTypes.string,
  isSearchEnabled: PropTypes.func,
  kind: PropTypes.string
};

export default NavBar;
