import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import { EditControl, Media } from "/imports/plugins/core/ui/client/components";

class VariantList extends Component {

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "btn": true,
      "btn-default": true,
      "variant-detail-selected": this.props.isSelected
    });

    return (
      <div className="variant-select-option">
      <button type="button" className={classes}>
        <Media media={this.props.childVariantMedia} />
        <span className="title">{variant.optionTitle}</span>
      </button>

      <div className="variant-controls">
        {this.props.editButton}
      </div>
    </div>
    );
  }
}

export default VariantList;
