import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";
import { PropTypes as ReactionPropTypes } from "/lib/api";

class TagListCustomer extends Component {
  displayName = "Tag List (TagList)";

  /**
   * Handle tag mouse out events and pass them up the component chain
   * @param  {Event} event Event object
   * @param  {Tag} tag Reaction.Schemas.Tag - a tag object
   * @return {void} no return value
   */
  handleTagMouseOut = (event, tag) => {
    if (this.props.onTagMouseOut) {
      this.props.onTagMouseOut(event, tag, this.props.parentTag);
    }
  }

  /**
   * Handle tag mouse over events and pass them up the component chain
   * @param  {Event} event Event object
   * @param  {Tag} tag Reaction.Schemas.Tag - a tag object
   * @return {void} no return value
   */
  handleTagMouseOver = (event, tag) => {
    if (this.props.onTagMouseOver) {
      this.props.onTagMouseOver(event, tag, this.props.parentTag);
    }
  }

  handleTagClick = (event, tag) => {
    if (this.props.onTagClick) {
      this.props.onTagClick(event, tag);
    }
  }

  hasDropdownClassName = (tag) => {
    if (this.props.hasDropdownClassName) {
      return this.props.hasDropdownClassName(tag);
    }
    return "";
  }

  navbarSelectedClassName = (tag) => {
    if (this.props.navbarSelectedClassName) {
      return this.props.navbarSelectedClassName(tag);
    }
    return "";
  }

  renderTags() {
    const classes = (tag = {}) => classnames({
      "navbar-item": this.props.isTagNav,
      [this.navbarSelectedClassName(tag)]: this.props.isTagNav,
      [this.hasDropdownClassName(tag)]: this.props.isTagNav
    });

    if (Array.isArray(this.props.tags)) {
      const arrayProps = _.compact(this.props.tags);
      const tags = arrayProps.map((tag, index) => (
        <div className={classes(tag)} key={index}>
          <Components.TagItemCustomer
            {...this.props}
            data-id={tag._id}
            index={index}
            key={index}
            tag={tag}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagClick={this.handleTagClick}
          />
          {this.props.children}
        </div>
      ));
      return tags;
    }

    return null;
  }

  render() {
    if (this.props.isTagNav) {
      return (
        <div className="tag-group">
          {this.renderTags()}
        </div>
      );
    }

    const classes = classnames({
      rui: true,
      tags: true,
      edit: this.props.editable
    });

    return (
      <div
        className={classes}
        data-id={this.props.parentTag._id}
        ref="tags"
      >
        {this.renderTags()}
      </div>
    );
  }
}

TagListCustomer.defaultProps = {
  parentTag: {}
};

TagListCustomer.propTypes = {
  children: PropTypes.node,
  hasDropdownClassName: PropTypes.func,
  isTagNav: PropTypes.bool,
  navbarSelectedClassName: PropTypes.func,
  onTagClick: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  parentTag: ReactionPropTypes.Tag,
  showBookmark: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  tags: ReactionPropTypes.arrayOfTags
};

export default TagListCustomer;
