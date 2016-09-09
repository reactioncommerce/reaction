import React, { Component, PropTypes } from "react";
import update from "react/lib/update";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { composeWithTracker } from "react-komposer";
import { TagList } from "../components/tags";
import { Tags } from "/lib/collections";
import { ReactiveDict } from "meteor/reactive-dict";
import { getTagIds } from "/lib/selectors/tags";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";

const externalState = new ReactiveDict();
externalState.set("suggestions", []);

function updateSuggestions(term) {
  const datums = [];
  const slug = Reaction.getSlug(term);

  Tags.find({
    slug: new RegExp(slug, "i")
  }).forEach(function (tag) {
    return datums.push({
      label: tag.name
    });
  });


  externalState.set("suggestions", datums);
}

class TagListContainer extends Component {

  get productId() {
    if (this.props.product) {
      return this.props.product._id;
    }
    return null;
  }

  handleTagCreate = (tag) => {
    if (this.productId) {
      Meteor.call("products/updateProductTags", this.productId, tag.name, null, (error) => {
        if (error) {
          Alerts.toast("Tag already exists, duplicate add failed.", "error");
        }
      });
    }
  }

  handleTagRemove = (tag) =>{
    if (this.productId) {
      Meteor.call("products/removeProductTag", this.productId, tag._id, (error) => {
        if (error) {
          Alerts.toast("Tag already exists, duplicate add failed.", "error");
        }
      });
    }
  }

  handleTagUpdate = (tag) => {
    if (this.productId) {
      Meteor.call("products/updateProductTags", this.productId, tag.name, tag._id, (error) => {
        if (error) {
          Alerts.toast("Tag already exists, duplicate add failed.", "error");
        }
      });
    }
  }

  handleMoveTag = (dragIndex, hoverIndex) => {
    const variant = this.props.tags[dragIndex];

    // Apply new sort order to variant list
    const newTagOrder = update(this.props.tags, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, variant]
      ]
    });

    // Set local state so the component does't have to wait for a round-trip
    // to the server to get the updated list of variants
    this.setState({
      tags: newTagOrder
    });

    // Save the updated positions
    Meteor.defer(() => {
      if (this.props.product) {
        const tagIds = getTagIds({ tags: newTagOrder });
        Meteor.call("products/updateProductField", this.props.product._id, "hashtags", tagIds);
      }
    });
  }

  render() {
    return (
      <DragDropProvider>
        <TagList
          onClick={this.handleEditButtonClick}
          onMoveTag={this.handleMoveTag}
          onNewTagInputBlur={this.handleTagCreate}
          onTagRemove={this.handleTagRemove}
          onTagUpdate={this.handleTagUpdate}
          tooltip="Unpublised changes"
          {...this.props}
        />
      </DragDropProvider>
    );
  }
}

TagListContainer.propTypes = {
  children: PropTypes.node,
  hasPermission: PropTypes.bool,
  product: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.object)
};

function composer(props, onData) {
  let tags = props.tags;

  if (props.product) {
    if (_.isArray(props.product.hashtags)) {
      tags = _.map(props.product.hashtags, function (id) {
        return Tags.findOne(id);
      });
    }
  }


  let isEditable = props.editable;

  if (typeof isEditable !== "boolean") {
    isEditable = Reaction.hasPermission(props.premissions);
  }

  onData(null, {
    handleGetSuggestions(term) {
      updateSuggestions(term);
    },
    isProductTags: props.product !== undefined,
    suggestions: externalState.get("suggestions"),
    tags,
    editable: isEditable
  });
}

let decoratedComponent = TagListContainer;
decoratedComponent = composeWithTracker(composer)(decoratedComponent);

export default decoratedComponent;
