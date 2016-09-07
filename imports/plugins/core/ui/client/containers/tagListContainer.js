import React, { Children, Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { EditButton } from "/imports/plugins/core/ui/client/components";
import { composeWithTracker } from "react-komposer";
import { TagList } from "../components/tags"
import { Tags } from "/lib/collections";

import { ReactiveDict } from "meteor/reactive-dict";

// import isEqual


const externalState = new ReactiveDict();
externalState.set("suggestions", []);

function updateSuggestions(term) {
  console.log("GET SUGGESTIONS FOR", term);
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

// function getSuggestionValue(suggestion) {
//   return suggestion.label;
// }
//
// function renderSuggestion(suggestion) {
//   return React.createElement("span", null, suggestion.label);
// }


class TagListContainer extends Component {
  render() {
    return (
      <TagList
        onClick={this.handleEditButtonClick}
        tooltip="Unpublised changes"
        {...this.props}
      />
    );
  }
}

TagListContainer.propTypes = {
  children: PropTypes.node,
  hasPermission: PropTypes.bool
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


  onData(null, {
    handleGetSuggestions(term) {
      updateSuggestions(term);
    },
    suggestions: externalState.get("suggestions"),
    tags,
    editable: Reaction.hasPermission(props.premissions)
  });
}

export default composeWithTracker(composer)(TagListContainer);
