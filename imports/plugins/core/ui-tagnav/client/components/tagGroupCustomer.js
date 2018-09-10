import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import { getTagIds } from "/lib/selectors/tags";
import { Router } from "/client/api";

class TagGroupCustomer extends Component {
  get tags() {
    return this.props.tagGroupProps.subTagGroups;
  }

  tagGroupBodyProps = (tag) => {
    const subTagGroups = _.compact(TagHelpers.subTagsCustomer(tag));
    const tagsByKey = {};

    if (Array.isArray(subTagGroups)) {
      for (const tagItem of subTagGroups) {
        tagsByKey[tagItem._id] = tagItem;
      }
    }

    return {
      parentTag: tag,
      tagsByKey: tagsByKey || {},
      tagIds: getTagIds({ tags: subTagGroups }) || [],
      subTagGroups
    };
  }

  renderTree(tags) {
    if (Array.isArray(tags)) {
      return tags.map((tag) => (
        <div className="rui grouptag" data-id={tag._id} key={tag._id}>
          <Components.TagGroupHeaderCustomer
            {...this.props}
            tag={tag}
            parentTag={this.props.tagGroupProps.parentTag}
          />
          <Components.TagGroupBodyCustomer
            {...this.props}
            tagGroupBodyProps={this.tagGroupBodyProps(tag)}
          />
        </div>
      ));
    }
  }

  render() {
    const { slug } = this.props.tagGroupProps.parentTag;
    const url = Router.pathFor("tag", {
      hash: {
        slug
      }
    });
    return (
      <div className="rui tagtree">
        <div className="header">
          <span className="title">{this.props.tagGroupProps.parentTag.name}</span>
          <a href={url}>View All <i className="fa fa-angle-right" /></a>
        </div>
        <div className="content">
          {this.renderTree(this.tags)}
        </div>
      </div>
    );
  }
}

TagGroupCustomer.propTypes = {
  tagGroupProps: PropTypes.object
};

registerComponent("TagGroupCustomer", TagGroupCustomer);

export default TagGroupCustomer;
