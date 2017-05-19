import React, { Component, PropTypes } from "react";
import { PropTypes as ReactionPropTypes } from "/lib/api";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";

class TagTreeBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      tags: this.props.tags,
      newTag: {
        name: ""
      }
    };
  }

  // setting up the func before passing to TagItem
  handleNewTagSave = (event, tag) => {
    if (this.props.onNewTagSave) {
      this.props.onNewTagSave(tag, this.props.parentTag);
      this.setState({
        newTag: { name: "" }
      });
    }
  }

  handleTagUpdate = (event, tag) => {
    // const newState = update(this.state, {
    //   tagsByKey: {
    //     [tag._id]: {
    //       $set: tag
    //     }
    //   }
    // });

    // this.setState(newState);
  }

  handleNewTagUpdate = (event, tag) => { // updates blank tag state being edited
    this.setState({ newTag: tag });
  }

  genTagsList(tags, parentTag) {
    if (Array.isArray(tags)) {
      return tags.map((tag, index) => {
        return (
          <TagItem
            tag={tag}
            index={index}
            key={index}
            data-id={tag._id}
            editable={this.props.editable}
            isSelected={this.isSelected}
            parentTag={parentTag}
            draggable={true}
            selectable={true}
            suggestions={this.state.suggestions}
            onMove={this.handleMoveTag}
            onTagInputBlur={this.handleTagSave}
            onTagMouseOut={this.handleTagMouseOut}
            onTagMouseOver={this.handleTagMouseOver}
            onTagRemove={this.props.onTagRemove}
            onTagSelect={this.onTagSelect}
            onTagUpdate={this.handleTagUpdate}
          />
        );
      });
    }
  }

  render() {
    return (
      <div className="content">
        <div className="rui tags" data-id={this.props.parentTag._id}>
          {this.genTagsList(this.state.tags, this.props.parentTag)}
          {this.props.editable &&
            <div className="rui item create">
              <TagItem
                blank={true}
                key="newTagForm"
                tag={this.state.newTag}
                inputPlaceholder="Add Tag"
                i18nKeyInputPlaceholder="tags.addTag"
                suggestions={this.state.suggestions}
                onClearSuggestions={this.props.onClearSuggestions}
                onGetSuggestions={this.props.onGetSuggestions}
                onTagInputBlur={this.handleNewTagSave}
                onTagSave={this.handleNewTagSave}
                onTagUpdate={this.handleNewTagUpdate}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

TagTreeBody.propTypes = {
  editable: PropTypes.bool,
  onClearSuggestions: PropTypes.func,
  onGetSuggestions: PropTypes.func,
  onNewTagSave: PropTypes.func,
  onTagRemove: PropTypes.func,
  parentTag: PropTypes.object,
  tags: ReactionPropTypes.arrayOfTags
};

export default TagTreeBody;
