import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Router } from "@reactioncommerce/reaction-router";

class TagItemCustomer extends Component {

  get tag() {
    return this.props.tag || {
      name: ""
    };
  }

  /**
   * Handle tag mouse out events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagMouseOut = (event) => {
    // event.preventDefault();
    if (this.props.onTagMouseOut) {
      this.props.onTagMouseOut(event, this.props.tag);
    }
  }

  /**
   * Handle click event on drop button and pass up the component chain
   * @return {void} no return value
   */
  handleTagSelect = () => {
    if (this.props.onTagSelect) { // Pass the tag back up to the parent component
      this.props.onTagSelect(this.props.tag);
    }
  }

  /**
   * Handle tag mouse over events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagMouseOver = (event) => {
    if (this.props.onTagMouseOver) {
      this.props.onTagMouseOver(event, this.props.tag);
    }
  }

  handleClick = (event) => {
    if (this.props.onTagClick) {
      event.preventDefault();
      this.props.onTagClick(event, this.props.tag);
    }
  }

  /**
   * Render a simple tag for display purposes only
   * @return {JSX} simple tag
   */
  renderTag() {
    const baseClassName = classnames({
      "rui": true,
      "tag": true,
      "link": true,
      "full-width": this.props.fullWidth
    });

    const url = Router.pathFor("tag", {
      hash: {
        slug: this.props.tag.slug
      }
    });

    return (
      <a
        className={baseClassName}
        href={url}
        onFocus={this.handleTagMouseOver}
        onBlur={this.handleTagMouseOut}
        onMouseOut={this.handleTagMouseOut}
        onMouseOver={this.handleTagMouseOver}
        onClick={this.handleClick}
      >
        {this.props.tag.name}
      </a>
    );
  }

  /**
   * Render component
   * @return {JSX} tag component
   */
  render() {
    return this.renderTag();
  }
}

TagItemCustomer.propTypes = {
  blank: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  fullWidth: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  index: PropTypes.number,
  isTagNav: PropTypes.bool,
  onTagClick: PropTypes.func,
  onTagInputBlur: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  onTagSelect: PropTypes.func,
  parentTag: PropTypes.object,
  tag: PropTypes.object
};

registerComponent("TagItemCustomer", TagItemCustomer);

export default TagItemCustomer;
