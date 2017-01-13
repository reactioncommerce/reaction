import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Blaze from "meteor/gadicc:blaze-react-component";
import { Button } from "/imports/plugins/core/ui/client/components";

class ActionView extends Component {
  static propTypes = {
    buttons: PropTypes.array
  }

  renderControlComponent() {
    if (this.props.controlComponent) {
      return (
        <Blaze
          template={this.props.controlComponent}
          data={this.props.controlComponentProps}
        />
      );
    }
  }

  renderFooter() {
    // if (this.props.footerTemplate) {
    //   return (
    //     <Blaze template={this.props.footerTemplate} />
    //   );
    // }
  }

  render() {
    const baseClassName = classnames({
      "admin-controls": true,
      "show-settings": this.props.isActionViewOpen
    });

    return (
      <div className={baseClassName}>
        <div className="admin-controls-detail">
          <div className="admin-controls-heading">
            <Blaze template="settingsHeader" />
          </div>
          <div className="admin-controls-content action-view-body">
            {this.renderControlComponent()}
          </div>
          <div className="admin-controls-footer">
            <div className="admin-controls-container">
              {this.renderFooter()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ActionView;
