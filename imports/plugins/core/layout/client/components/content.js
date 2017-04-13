import React, { Component, PropTypes } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Button } from "/imports/plugins/core/ui/client/components";

class Content extends Component {
  static propTypes = {
    buttons: PropTypes.array
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
