import React, { Component, PropTypes } from "react";
import { TagItem } from "/imports/plugins/core/ui/client/components/tags/";

class TagTree extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    onTagRemove: PropTypes.func,
    onTagSave: PropTypes.func,
    parentTag: PropTypes.object,
    subTagGroups: PropTypes.arrayOf(PropTypes.object)
  }

  suggestions = [{}]

  newTag = {
    name: ""
  }

  renderSubTagGroups(subTagGroups) {
    if (_.isArray(subTagGroups)) {
      console.log({ text: subTagGroups[0] });
      return subTagGroups.map((groupTag, index) => (
        <div className="rui grouptag {{className}}" data-id={groupTag._id} key={groupTag._id}>
          <div className="content">
            <TagItem
              className="js-tagNav-item"
              editable={this.props.editable}
              index={index}
              isSelected={this.isSelected}
              key={index}
              onTagRemove={this.handleTagRemove}
              onTagSave={this.props.onTagSave}
              onTagSelect={this.onTagSelect}
              selectable={true}
              onTagUpdate={this.handleTagUpdate}
              suggestions={this.suggestions}
              tag={groupTag}
            />
          </div>
          { this.props.editable &&
            <div className="rui grouptag create">
              <div className="header">
                <div className="navbar-item">
                  <TagItem
                    blank={true}
                    key="newTagForm"
                    onClearSuggestions={this.handleClearSuggestions}
                    onGetSuggestions={this.handleGetSuggestions}
                    onTagInputBlur={this.handleNewTagSave}
                    onTagSave={this.props.onTagSave}
                    onTagUpdate={this.handleNewTagUpdate}
                    tag={this.newTag}
                    suggestions={this.suggestions}
                  />
                </div>
              </div>
            </div>
          }
        </div>
      ));
    }
  }

  render() {
    return (
      <div className="rui tagtree">
        <div className="header">
          <span className="title">{this.props.parentTag.name}</span>
          <a href="#">View All <i className="fa fa-angle-right"></i></a>
        </div>
        <div className="content">
          {this.renderSubTagGroups(this.props.subTagGroups)}
        </div>
      </div>
    );
  }
}

export default TagTree;
