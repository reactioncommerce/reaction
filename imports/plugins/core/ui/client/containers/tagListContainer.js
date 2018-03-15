import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import update from "immutability-helper";
import { compose } from "recompose";
import { registerComponent, composeWithTracker, Components } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import TagList from "../components/tags/tagList";
import { Tags } from "/lib/collections";
import { getTagIds } from "/lib/selectors/tags";

function updateSuggestions(term, { excludeTags }) {
  const slug = Reaction.getSlug(term);

  const selector = {
    slug: new RegExp(slug, "i")
  };

  if (Array.isArray(excludeTags)) {
    selector._id = {
      $nin: excludeTags
    };
  }

  const tags = Tags.find(selector).map((tag) => ({
    label: tag.name
  }));

  return tags;
}

const wrapComponent = (Comp) => (
  class TagListContainer extends Component {
    static propTypes = {
      children: PropTypes.node,
      editable: PropTypes.bool,
      hasPermission: PropTypes.bool,
      product: PropTypes.object,
      tagIds: PropTypes.arrayOf(PropTypes.string),
      tagsAsArray: PropTypes.arrayOf(PropTypes.object),
      tagsByKey: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.state = {
        tagIds: props.tagIds || [],
        tagsByKey: props.tagsByKey || {},
        newTag: {
          name: ""
        },
        suggestions: []
      };

      this.debounceUpdateTagOrder = _.debounce(() => {
        Meteor.call(
          "products/updateProductField",
          this.props.product._id,
          "hashtags",
          this.state.tagIds
        );
      }, 500);
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
        tagIds: nextProps.tagIds || [],
        tagsByKey: nextProps.tagsByKey || {}
      });
    }

    get productId() {
      if (this.props.product) {
        return this.props.product._id;
      }
      return null;
    }

    canSaveTag(tag) {
      // Blank tags cannot be saved
      if (typeof tag.name === "string" && tag.name.trim().length === 0) {
        return false;
      }

      // If the tag does not have an id, then allow the save
      if (!tag._id) {
        return true;
      }

      // Get the original tag from the props
      // Tags from props are not mutated, and come from an outside source
      const originalTag = this.props.tagsByKey[tag._id];

      if (originalTag && originalTag.name !== tag.name) {
        return true;
      }

      return false;
    }

    handleNewTagSave = (tag) => {
      if (this.productId && this.canSaveTag(tag)) {
        Meteor.call("products/updateProductTags", this.productId, tag.name, null, (error) => {
          if (error) {
            return Alerts.toast(i18next.t("productDetail.tagExists"), "error");
          }

          this.setState({
            newTag: {
              name: ""
            },
            suggestions: []
          });

          return true;
        });
      }
    }

    handleNewTagUpdate = (tag) => {
      this.setState({
        newTag: tag
      });
    }

    handleTagSave = (tag) => {
      if (this.productId && this.canSaveTag(tag)) {
        Meteor.call("products/updateProductTags", this.productId, tag.name, tag._id, (error) => {
          if (error) {
            return Alerts.toast(i18next.t("productDetail.tagExists"), "error");
          }

          this.setState({
            suggestions: []
          });

          return true;
        });
      }
    }

    handleTagRemove = (tag) => {
      if (this.productId) {
        Meteor.call("products/removeProductTag", this.productId, tag._id, (error) => {
          if (error) {
            Alerts.toast(i18next.t("productDetail.tagInUse"), "error");
          }
        });
      }
    }

    handleTagUpdate = (tag) => {
      const newState = update(this.state, {
        tagsByKey: {
          [tag._id]: {
            $set: tag
          }
        }
      });

      this.setState(newState);
    }

    handleMoveTag = (dragIndex, hoverIndex) => {
      const tag = this.state.tagIds[dragIndex];

      // Apply new sort order to variant list
      const newState = update(this.state, {
        tagIds: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, tag]
          ]
        }
      });

      // Set local state so the component does't have to wait for a round-trip
      // to the server to get the updated list of variants
      this.setState(newState, () => {
        // Save the updated positions
        if (this.props.product) {
          this.debounceUpdateTagOrder();
        }
      });
    }

    handleGetSuggestions = (suggestionUpdateRequest) => {
      const suggestions = updateSuggestions(
        suggestionUpdateRequest.value,
        { excludeTags: this.state.tagIds }
      );

      this.setState({
        suggestions
      });
    }

    handleClearSuggestions = () => {
      this.setState({
        suggestions: []
      });
    }

    get tags() {
      if (this.props.editable) {
        return this.state.tagIds.map((tagId) => this.state.tagsByKey[tagId]);
      }

      return this.props.tagsAsArray;
    }

    render() {
      return (
        <Components.DragDropProvider>
          <Comp
            newTag={this.state.newTag}
            onClick={this.handleEditButtonClick}
            onClearSuggestions={this.handleClearSuggestions}
            onGetSuggestions={this.handleGetSuggestions}
            onMoveTag={this.handleMoveTag}
            onNewTagSave={this.handleNewTagSave}
            onNewTagUpdate={this.handleNewTagUpdate}
            onTagRemove={this.handleTagRemove}
            onTagSave={this.handleTagSave}
            onTagUpdate={this.handleTagUpdate}
            suggestions={this.state.suggestions}
            tags={this.tags}
            tooltip="Unpublished changes"
            {...this.props}
          />
        </Components.DragDropProvider>
      );
    }
  }
);

function composer(props, onData) {
  let { tags } = props;

  if (props.product) {
    if (_.isArray(props.product.hashtags)) {
      tags = _.map(props.product.hashtags, (id) => Tags.findOne(id));
    }
  }

  let isEditable = props.editable;

  if (typeof isEditable !== "boolean") {
    isEditable = Reaction.hasPermission(props.permissions);
  }

  const tagsByKey = {};

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (tag) {
        tagsByKey[tag._id] = tag;
      }
    }
  }

  onData(null, {
    isProductTags: props.product !== undefined,
    tagIds: getTagIds({ tags }),
    tagsByKey,
    tagsAsArray: tags,
    editable: isEditable
  });
}

registerComponent("TagList", TagList, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(TagList);
