import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class TagGroupHeaderCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      tag: this.props.tag
    };
  }

  render() {
    return (
      <div className="header">
        <Components.TagItemCustomer
          tag={this.state.tag}
          parentTag={this.props.parentTag}
          selectable={true}
          className="js-tagNav-item"
          isSelected={this.isSelected}
          onTagClick={this.props.onTagClick}
        />
      </div>
    );
  }
}

TagGroupHeaderCustomer.propTypes = {
  parentTag: PropTypes.object,
  tag: PropTypes.object,
};

registerComponent("TagGroupHeaderCustomer", TagGroupHeaderCustomer);

export default TagGroupHeaderCustomer;
