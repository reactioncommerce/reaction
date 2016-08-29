import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import { Media } from "/imports/plugins/core/ui/client/components";

class VariantList extends Component {
  renderMedia() {
    if (this.props.childVariantMedia) {
      return (
        <Media media={this.props.childVariantMedia} />
      );
    }

    return null;
  }
  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "btn": true,
      "btn-default": true,
      "variant-detail-selected": this.props.isSelected
    });

    return (
      <div className="variant-select-option">
      <button className={classes} type="button">
        {this.renderMedia()}
        <span className="title">{variant.optionTitle}</span>
      </button>

      <div className="variant-controls">
        {this.props.visibilityButton}
        {this.props.editButton}
      </div>
    </div>
    );
  }
}

VariantList.propTypes = {
  childVariantMedia: PropTypes.object,
  editButton: PropTypes.node,
  isSelected: PropTypes.bool,
  variant: PropTypes.varaint,
  visibilityButton: PropTypes.node
};


export default VariantList;
