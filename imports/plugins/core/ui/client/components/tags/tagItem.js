import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";
import { i18next } from "/client/api";
import classnames from "classnames";
import Autosuggest from "react-autosuggest";
import { ReactiveDict } from "meteor/reactive-dict";
import React from "react";

function createAutosuggestInput(templateInstance, options) {
  return {
    component: Autosuggest,
    suggestions: templateInstance.state.get("suggestions"),
    getSuggestionValue: getSuggestionValue,
    renderSuggestion: renderSuggestion,
    onSuggestionsFetchRequested({ value }) {
      templateInstance.state.set("suggestions", getSuggestions(value));
    },
    onSuggestionsClearRequested() {
      templateInstance.state.set("suggestions", []);
    },
    inputProps: {
      placeholder: i18next.t(options.i18nPlaceholderKey, { defaultValue: options.i18nPlaceholderValue}),
      value: templateInstance.state.get("inputValue"),
      onKeyDown(event) {
        // 9 == Tab key
        // 13 == Enter Key
        if (event.keyCode === 9 || event.keyCode === 13) {
          options.onUpdateCallback && options.onUpdateCallback();
        }
      },
      onBlur: () => {
        options.onUpdateCallback && options.onUpdateCallback();
      },
      onChange(event, { newValue }) {
        templateInstance.state.set("suggestion", getSuggestions(newValue));
        templateInstance.state.set("inputValue", newValue);
      }
    }
  };
}

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

Template.tagItem.helpers({
  tagBlankProps() {
    const instance = Template.instance();
    return {
      onTagCreate: instance.data.onTagCreate
    };
  },

  tagEditableProps(tag) {
    const instance = Template.instance();

    return {
      tag,
      controls: _.map(instance.data.controls, (control) => {
        return {
          ...control,
          toggleOn() {
            if (control.toggleOn) {
              if (_.isFunction(control.toggleOn)) {
                return control.toggleOn(tag);
              }

              return control.toggleOn;
            }
            return undefined;
          },
          onClick(event) {
            // Call the original onClick and add the current tag
            control.onClick(event, tag);
          }
        };
      }),
      className: instance.data.className,
      isSelected: instance.data.isSelected,
      selectable: instance.data.selectable,
      onTagRemove: instance.data.onTagRemove,
      onTagSelect: instance.data.onTagSelect,
      onTagUpdate: instance.data.onTagUpdate
    };
  }
});

Template.tagEditable.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    oldValue: this.data.tag.name,
    inputValue: this.data.tag.name,
    suggestions: []
  });

  this.submitInput = () => {
    const value = this.state.get("inputValue").trim();

    if (this.data.onTagCreate && _.isEmpty(value) === false) {
      this.data.onTagCreate(value);
    }

    this.state.set("inputValue", "");
  };

  this.updateTag = () => {
    const inputValue = this.state.get("inputValue");
    if (this.state.equals("oldValue", inputValue) === false) {
      const value = inputValue.trim();

      if (this.data.onTagUpdate && _.isEmpty(value) === false) {
        this.data.onTagUpdate(this.data.tag._id, value);
        this.state.set("oldValue", inputValue);
      }
    }
  };
});

Template.tagEditable.helpers({
  AutosuggestInput() {
    const instance = Template.instance();

    return createAutosuggestInput(instance, {
      i18nPlaceholderKey: "tags.updateTag",
      i18nPlaceholderValue: "Update Tag",
      onUpdateCallback: instance.updateTag
    });
  },

  className() {
    const instance = Template.instance();

    return classnames(instance.data.className, {
      selected: instance.data.classes
    });
  },

  handleTagSelect() {
    const instance = Template.instance();
    return () => {
      // Pass the tag back up to the parent component
      if (instance.data.onTagSelect) {
        instance.data.onTagSelect(instance.data.tag);
      }
    };
  },
  handleTagRemove() {
    const instance = Template.instance();
    return () => {
      // Pass the tag back up to the parent component
      if (instance.data.onTagRemove) {
        instance.data.onTagRemove(instance.data.tag);
      }
    };
  }
});

Template.tagBlank.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    inputValue: "",
    suggestions: []
  });

  this.submitInput = () => {
    const value = this.state.get("inputValue").trim();

    if (this.data.onTagCreate && _.isEmpty(value) === false) {
      this.data.onTagCreate(value);
    }

    this.state.set("inputValue", "");
  };
});

Template.tagBlank.helpers({
  AutosuggestInput() {
    const instance = Template.instance();

    return createAutosuggestInput(instance, {
      i18nPlaceholderKey: "tags.addTag",
      i18nPlaceholderValue: "Add Tag",
      onUpdateCallback: instance.submitInput
    });
  }
});
