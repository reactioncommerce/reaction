import { i18next } from "/client/api";
import React from "react";
import { Reaction } from "/client/api";
import { PropTypes } from "/lib/api";
import { Tags } from "/lib/collections";
import Autosuggest from "react-autosuggest";
import { Button } from "/imports/plugins/core/ui/client/components"
import { SortableItem } from "/imports/plugins/core/ui/client/containers";

class Tag extends React.Component {
  displayName: "Tag";

  constructor(props) {
    super(props);

    this.state = {
      inputValue: props.tag.name,
      suggestion: ""
    };
  }

  handleSuggestionUpdateRequest = ({ value }) => {
    this.setState("suggestions", getSuggestions(value));
  }

  /**
   * Handle tag create events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagCreate = (event) => {
    event.preventDefault();
    if (this.props.onTagCreate) {
      this.props.onTagCreate(event.target.tag.value, this.props.parentTag);
    }
  };

  /**
   * Handle tag bookmark events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagBookmark = () => {
    if (this.props.onTagBookmark) {
      this.props.onTagBookmark(this.props.tag._id);
    }
  };

  /**
   * Handle tag remove events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagRemove = () => {
    if (this.props.onTagRemove) {
      this.props.onTagRemove(this.props.tag);
    }
  };

  /**
   * Handle tag update events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagUpdate = (event) => {
    if (this.props.onTagUpdate && event.keyCode === 13) {
      this.props.onTagUpdate(this.props.tag._id, event.target.value);
    }
  };

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
  };

  /**
   * Handle tag mouse over events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagMouseOver = (event) => {
    if (this.props.onTagMouseOver) {
      this.props.onTagMouseOver(event, this.props.tag);
    }
  };

  /**
   * Render a simple tag for display purposes only
   * @return {JSX} simple tag
   */
  renderTag() {
    const url = `/product/tag/${this.props.tag.slug}`;
    return (
      <a
        className="rui tag link"
        href={url}
        onMouseOut={this.handleTagMouseOut}
        onMouseOver={this.handleTagMouseOver}
      >
        {this.props.tag.name}
      </a>
    );
  }

  renderBookmarkButton() {
    if (this.props.showBookmark) {
      return (
        <Button icon="bookmark" onClick={this.handleTagBookmark} />
      );
    }
    return null;
  }

  /**
   * Render an admin editable tag
   * @return {JSX} editable tag
   */
  renderEditableTag() {
    return (
      <div
        className="rui tag edit"
        data-id={this.props.tag._id}
      >
        <Button icon="bars" />
          {this.renderAutosuggestInput()}


        <Button icon="times-circle" onClick={this.handleTagRemove} status="danger" />
      </div>
    );
  }

  /**
   * Render a tag creation form
   * @return {JSX} blank tag for creating new tags
   */
  renderBlankEditableTag() {
    return (
      <div className="rui tag edit create">
        <form onSubmit={this.handleTagCreate}>
          <Button icon="tag" />
          {this.renderAutosuggestInput()}
          <Button icon="plus" />
        </form>
      </div>
    );
  }

  renderSuggestion(suggestion) {
    return (
      <span>{suggestion.label}</span>
    );
  }

  getSuggestionValue(suggestion) {
    return suggestion.label;
  }

  handleInputChange = (event, { newValue }) => {
    if (this.props.onGetSuggestions) {
      this.props.onGetSuggestions(newValue);
    }

    this.setState({
      suggestion: this.getSuggestionValue(newValue),
      inputValue: newValue
    });
  }

  renderAutosuggestInput() {
    return (
      <Autosuggest
        suggestions={this.props.suggestions}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        onSuggestionsUpdateRequested={(suggestion) => {
          if (this.props.onSuggestionsUpdateRequested) {
            this.props.onSuggestionsUpdateRequested(suggestion);
          }
        }}
        inputProps={{
          placeholder: i18next.t(this.props.i18nPlaceholderKey, { defaultValue: this.props.i18nPlaceholderValue}),
          value: this.state.inputValue,
          onKeyDown(event) {
            // 9 == Tab key
            // 13 == Enter Key
            if (event.keyCode === 9 || event.keyCode === 13) {
              // this.handleUpdate
              // options.onUpdateCallback && options.onUpdateCallback();
            }
          },
          onBlur: this.handleTagMouseOut,
          onChange: this.handleInputChange
        }}
      />
    );
  }

  /**
   * Render component
   * @return {JSX} tag component
   */
  render() {
    if (this.props.editable) {
      // console.log(SortableItem(this.props.dragItemType || "tag", this.renderEditableTag()));
      return this.renderEditableTag();
    } else if (this.props.blank) {
      return this.renderBlankEditableTag();
    }

    return this.renderTag();
  }
}

Tag.propTypes = {
  blank: React.PropTypes.bool,
  editable: React.PropTypes.bool,
  index: React.PropTypes.number,

  // Event handelers
  onTagBookmark: React.PropTypes.func,
  onTagCreate: React.PropTypes.func,
  onTagMouseOut: React.PropTypes.func,
  onTagMouseOver: React.PropTypes.func,
  onTagRemove: React.PropTypes.func,
  onTagUpdate: React.PropTypes.func,

  parentTag: PropTypes.Tag,
  placeholder: React.PropTypes.string,
  showBookmark: React.PropTypes.bool,
  tag: PropTypes.Tag
};

export default SortableItem("tag", Tag);
