import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Autosuggest from "react-autosuggest";
import { Router } from "/client/api";
import { i18next } from "/client/api";
import { Button, Handle } from "/imports/plugins/core/ui/client/components";
import { SortableItem } from "../../containers";


class Tag extends Component {
  displayName: "Tag";

  get tag() {
    return this.props.tag || {
      name: ""
    };
  }

  get inputPlaceholder() {
    return i18next.t(this.props.i18nKeyInputPlaceholder || "tags.tagName", {
      defaultValue: this.props.inputPlaceholder || "Tag Name"
    });
  }

  getSuggestionValue(suggestion) {
    return suggestion.label;
  }

  saveTag(event) {
    if (this.props.onTagSave) {
      this.props.onTagSave(event, this.props.tag);
    }
  }

  /**
   * Handle tag form submit events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagFormSubmit = (event) => {
    event.preventDefault();
    this.saveTag(event);
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

  handleTagKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.saveTag(event);
    }
  }

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
   * Handle tag inout blur events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagInputBlur = (event) => {
    if (this.props.onTagInputBlur) {
      this.props.onTagInputBlur(event, this.props.tag);
    }
  };

  handleInputChange = (event, { newValue }) => {
    if (this.props.onTagUpdate) {
      const updatedTag = Object.assign({}, this.props.tag, {
        name: newValue
      });
      this.props.onTagUpdate(event, updatedTag);
    }
  }

  handleSuggestionsUpdateRequested = (suggestion) => {
    if (this.props.onGetSuggestions) {
      this.props.onGetSuggestions(suggestion);
    }
  }

  handleSuggestionsClearRequested = () => {
    if (this.props.onClearSuggestions) {
      this.props.onClearSuggestions();
    }
  }

  /**
   * Render a simple tag for display purposes only
   * @return {JSX} simple tag
   */
  renderTag() {
    const url = Router.pathFor("tag", {
      hash: {
        slug: this.props.tag.slug
      }
    });

    const baseClassName = classnames({
      "rui": true,
      "tag": true,
      "link": true,
      "full-width": this.props.fullWidth
    });

    return (
      <a
        className={baseClassName}
        href={url}
        onMouseOut={this.handleTagMouseOut}
        onMouseOver={this.handleTagMouseOver}
      >
        {this.props.tag.name}
      </a>
    );
  }

  /**
   * Render an admin editable tag
   * @return {JSX} editable tag
   */
  renderEditableTag() {
    const baseClassName = classnames({
      "rui": true,
      "tag": true,
      "edit": true,
      "full-width": this.props.fullWidth
    });

    return (
      this.props.connectDropTarget(
        <div
          className={baseClassName}
          data-id={this.props.tag._id}
        >
          <form onSubmit={this.handleTagFormSubmit}>
            <Handle connectDragSource={this.props.connectDragSource} />
            {this.renderAutosuggestInput()}
            <Button icon="times-circle" onClick={this.handleTagRemove} status="danger" />
          </form>
        </div>
      )
    );
  }

  /**
   * Render a tag creation form
   * @return {JSX} blank tag for creating new tags
   */
  renderBlankEditableTag() {
    const baseClassName = classnames({
      "rui": true,
      "tag": true,
      "edit": true,
      "create": true,
      "full-width": this.props.fullWidth
    });

    return (
      <div className={baseClassName}>
        <form onSubmit={this.handleTagFormSubmit}>
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

  renderAutosuggestInput() {
    return (
      <Autosuggest
        getSuggestionValue={this.getSuggestionValue}
        inputProps={{
          placeholder: this.inputPlaceholder,
          value: this.props.tag.name,
          onKeyDown(event) {
            // 9 == Tab key
            // 13 == Enter Key
            if (event.keyCode === 9 || event.keyCode === 13) {
              // this.handleUpdate
              // options.onUpdateCallback && options.onUpdateCallback();
            }
          },
          onBlur: this.handleTagInputBlur,
          onChange: this.handleInputChange
        }}
        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
        onSuggestionsFetchRequested={this.handleSuggestionsUpdateRequested}
        renderSuggestion={this.renderSuggestion}
        suggestions={this.props.suggestions}
      />
    );
  }

  /**
   * Render component
   * @return {JSX} tag component
   */
  render() {
    if (this.props.editable) {
      return this.renderEditableTag();
    } else if (this.props.blank) {
      return this.renderBlankEditableTag();
    }

    return this.renderTag();
  }
}

Tag.propTypes = {
  blank: PropTypes.bool,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  editable: PropTypes.bool,
  fullWidth: PropTypes.bool,
  i18nKeyInputPlaceholder: PropTypes.string,
  index: PropTypes.number,
  inputPlaceholder: PropTypes.string,
  onGetSuggestions: PropTypes.func,
  onTagInputBlur: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSave: PropTypes.func,
  onTagUpdate: PropTypes.func,
  parentTag: PropTypes.object,
  suggestions: PropTypes.arrayOf(PropTypes.object),
  tag: PropTypes.object
};

export default SortableItem("tag", Tag);
