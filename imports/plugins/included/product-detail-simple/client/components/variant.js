import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import { EditControl } from "/imports/plugins/core/ui/client/components";

class Variant extends Component {

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "variant-detail": true,
      "variant-detail-selected": this.props.isSelected
    });

    return (
      <li className="variant-list-item" id="variant-list-item-{variant._id}" key={variant._id}>
        <div className={classes}>
          <div className="title">
            <span className="variant-title">{variant.title}</span>
          </div>

          <div className="actions">
            <span className="variant-price">price</span>
          </div>

          <div className="alerts">
            {this.props.editButton}
          </div>
        </div>
      </li>
    );
  }
}

export default Variant;
