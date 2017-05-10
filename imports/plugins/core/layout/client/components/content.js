import React, { Component, PropTypes } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";

class Content extends Component {
  static propTypes = {
    template: PropTypes.string
  }

  render() {
    return (
      <div>
        <Blaze template={this.props.template} />
      </div>
    );
  }
}

export default Content;
