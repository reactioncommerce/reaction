import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class TagGroupBodyCustomer extends Component {
  constructor(props) {
    super(props);

    const { parentTag, tagsByKey, tagIds } = props.tagGroupBodyProps;
    this.state = {
      tagIds,
      parentTag,
      tagsByKey
    };
  }

  componentWillReceiveProps(nextProps) {
    const { parentTag, tagsByKey, tagIds } = nextProps.tagGroupBodyProps;
    this.setState({ tagIds, parentTag, tagsByKey });
  }

  get tags() {
    return this.props.tagGroupBodyProps.subTagGroups;
  }

  genTagsList(tags, parentTag) {
    if (Array.isArray(tags)) {
      return tags.map((tag, index) => (
        <Components.TagItemCustomer
          tag={tag}
          index={index}
          key={index}
          data-id={tag._id}
          isSelected={this.isSelected}
          parentTag={parentTag}
          selectable={true}
          onTagClick={this.props.onTagClick}
        />
      ));
    }
  }

  render() {
    return (
      <div className="content">
        <div className="rui tags" data-id={this.state.parentTag._id}>
          {this.genTagsList(_.compact(this.tags), this.state.parentTag)}
        </div>
      </div>
    );
  }
}

TagGroupBodyCustomer.propTypes = {
  tagGroupBodyProps: PropTypes.object
};

registerComponent("TagGroupBodyCustomer", TagGroupBodyCustomer);

export default TagGroupBodyCustomer;
