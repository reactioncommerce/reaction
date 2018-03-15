import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Autosuggest from "react-autosuggest";
import Velocity from "velocity-animate";
import "velocity-animate/velocity.ui";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import { Button, Handle } from "/imports/plugins/core/ui/client/components";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";
import { Router } from "@reactioncommerce/reaction-router";

class TagItem extends Component {
  componentWillReceiveProps(nextProps) {
    if (this._updated && this._saved && this.refs.autoSuggestInput) {
      const { input } = this.refs.autoSuggestInput;

      Velocity.RunSequence([
        { e: input, p: { backgroundColor: "#e2f2e2" }, o: { duration: 200 } },
        { e: input, p: { backgroundColor: "#fff" }, o: { duration: 100 } }
      ]);

      this._updated = false;
    }

    if ((nextProps.tag.name !== this.props.tag.name)) {
      this._updated = true;
    }
  }

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
    this._saved = true;
    this.saveTag(event);
  }

  /**
   * Handle tag remove events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagRemove = () => {
    if (this.props.onTagRemove) {
      this.props.onTagRemove(this.props.tag, this.props.parentTag);
    }
  }

  /**
   * Handle tag update events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagUpdate = (event) => {
    if (this.props.onTagUpdate && event.keyCode === 13) {
      this._saved = true;
      this.props.onTagUpdate(this.props.tag._id, event.target.value);
    }
  }

  handleTagKeyDown = (event) => {
    if (event.keyCode === 13) {
      this._saved = true;
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
  }

  /**
   * Handle click event on drop button and pass up the component chain
   * @return {void} no return value
   */
  handleTagSelect = () => {
    if (this.props.onTagSelect) { // Pass the tag back up to the parent component
      this.props.onTagSelect(this.props.tag);
    }
  }

  /**
   * Handle tag mouse over events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagMouseOver = (event) => {
    if (this.props.onTagMouseOver) {
      this.props.onTagMouseOver(event, this.props.tag);
    }
  }

  /**
   * Handle tag inout blur events and pass them up the component chain
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleTagInputBlur = (event) => {
    if (this.props.onTagInputBlur) {
      this._saved = true;
      this.props.onTagInputBlur(event, this.props.tag);
    }
  }

  handleInputChange = (event, { newValue }) => {
    if (this.props.onTagUpdate) {
      const updatedTag = Object.assign({}, { ...this.props.tag }, {
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

  handleClick = (event) => {
    if (this.props.onTagClick) {
      event.preventDefault();
      this.props.onTagClick(event, this.props.tag);
    }
  }

  /**
   * Render a simple tag for display purposes only
   * @return {JSX} simple tag
   */
  renderTag() {
    const baseClassName = classnames({
      "rui": true,
      "tag": true,
      "link": true,
      "full-width": this.props.fullWidth
    });

    const url = Router.pathFor("tag", {
      hash: {
        slug: this.props.tag.slug
      }
    });

    return (
      <a
        className={baseClassName}
        href={url}
        onFocus={this.handleTagMouseOver}
        onBlur={this.handleTagMouseOut}
        onMouseOut={this.handleTagMouseOut}
        onMouseOver={this.handleTagMouseOver}
        onClick={this.handleClick}
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
      "draggable": this.props.draggable,
      "full-width": this.props.fullWidth
    });

    return (
      this.props.connectDropTarget(<div className="rui item edit draggable">
        <div
          className={baseClassName}
          data-id={this.props.tag._id}
        >
          <form onSubmit={this.handleTagFormSubmit}>
            <Handle connectDragSource={this.props.connectDragSource} />
            {this.renderAutosuggestInput()}
            <Button icon="times-circle" onClick={this.handleTagRemove} status="danger" />
            {this.props.isTagNav &&
              <Button icon="chevron-down" onClick={this.handleTagSelect} status="default" />
            }
          </form>
        </div>
      </div>)
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
      <div className="rui item edit draggable">
        <div className={baseClassName}>
          <form onSubmit={this.handleTagFormSubmit}>
            <Button icon="tag" />
            {this.renderAutosuggestInput()}
            <Button icon="plus" />
          </form>
        </div>
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
        ref="autoSuggestInput"
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
    if (this.props.blank) {
      return this.renderBlankEditableTag();
    } else if (this.props.editable) {
      return this.renderEditableTag();
    }

    return this.renderTag();
  }
}

TagItem.propTypes = {
  blank: PropTypes.bool,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  draggable: PropTypes.bool,
  editable: PropTypes.bool,
  fullWidth: PropTypes.bool,
  i18nKeyInputPlaceholder: PropTypes.string,
  index: PropTypes.number,
  inputPlaceholder: PropTypes.string,
  isTagNav: PropTypes.bool,
  onClearSuggestions: PropTypes.func,
  onGetSuggestions: PropTypes.func,
  onTagClick: PropTypes.func,
  onTagInputBlur: PropTypes.func,
  onTagMouseOut: PropTypes.func,
  onTagMouseOver: PropTypes.func,
  onTagRemove: PropTypes.func,
  onTagSave: PropTypes.func,
  onTagSelect: PropTypes.func,
  onTagUpdate: PropTypes.func,
  parentTag: PropTypes.object,
  suggestions: PropTypes.arrayOf(PropTypes.object),
  tag: PropTypes.object
};

registerComponent("TagItem", TagItem, SortableItem("tag"));

export default SortableItem("tag")(TagItem);
