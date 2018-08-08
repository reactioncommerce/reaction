import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Router } from "@reactioncommerce/reaction-router";

class TagsCustomer extends Component {
  renderTagsList() {
    const { tags } = this.props;
    const baseClassName = classnames({
      rui: true,
      tag: true,
      link: true
    });
    return tags.map((tag, index) => {
      const url = Router.pathFor("tag", {
        hash: {
          slug: tag.slug
        }
      });
      return (
        <div key={index}>
          <a className={baseClassName} href={url}>{tag.name}</a>
        </div>
      );
    });
  }

  render() {
    const classes = classnames({
      rui: true,
      tags: true
    });

    return (
      <div className={classes}>
        {this.renderTagsList()}
      </div>
    );
  }
}

TagsCustomer.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.object)
};

export default TagsCustomer;
