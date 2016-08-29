import React, { Children, Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { EditButton } from "/imports/plugins/core/ui/client/components";
import { composeWithTracker } from "react-komposer";
import { TagList } from "../components/tags"
// import isEqual




function getSuggestions(term) {
  const datums = [];
  const slug = Reaction.getSlug(term);
  Tags.find({
    slug: new RegExp(slug, "i")
  }).forEach(function (tag) {
    return datums.push({
      label: tag.name
    });
  });

  return datums;
}

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

function renderSuggestion(suggestion) {
  return React.createElement("span", null, suggestion.label);
}



class TagListContainer extends Component {

  constructor(props) {
    super(props);

    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  handleGetT

  handleEditButtonClick() {
    const props = this.props;
console.log("OPEN EDIT VIEW????", props);
    Reaction.showActionView({
      label: props.label,
      i18nKeyLabel: props.i18nKeyLabel,
      template: props.editView,
      data: props.data
    });
  }

  renderEditButton() {
    let styles = {}
    if (this.props.data.__draft) {
      styles = {
        backgroundColor: "yellow"
      }
    }

    return (
      <TagList
        getSuggestions={getSuggestions}
        onClick={this.handleEditButtonClick}
        style={styles}
        tooltip="Unpublised changes"
      />
    );
  }

  render() {
    if (this.props.hasPermission) {
      return React.cloneElement(this.props.children, {
        editButton: this.renderEditButton()
      });
    }

    return (
      Children.only(this.props.children)
    );
  }
}

TagListContainer.propTypes = {
  children: PropTypes.node,
  hasPermission: PropTypes.bool
};

function composer(props, onData) {


  onData(null, {
    hasPermission: Reaction.hasPermission(props.premissions)
  });
}

export default composeWithTracker(composer)(TagListContainer);
