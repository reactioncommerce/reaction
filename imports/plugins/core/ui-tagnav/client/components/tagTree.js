import React, { Component, PropTypes } from "react";

class TagTree extends Component {
  static propTypes = {
    tag: PropTypes.object
  }

// return {
//   tag: groupTag,
//   isEditing: instance.data.isEditing,
//   onTagRemove(tag) {
//     instance.data.onTagRemove(tag, instance.data.parentTag);
//   },
//   onTagUpdate: instance.data.onTagUpdate
// }

  renderSubTagGroups(subTagGroups) {
    if (_.isArray(subTagGroups)) {
      return subTagGroups.map((groupTag) => (
        <div className="rui grouptag {{className}}" data-id={groupTag._id}>
          <div className="header">
            Test
          </div>
          <div className="content">
            Test
          </div>
          { groupTag.isEditing &&
            <div className="rui grouptag create">
              <div className="header">
                <p>Test</p>
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
          <span className="title">{this.props.tag.name}</span>
          <a href="#">View All <i className="fa fa-angle-right"></i></a>
        </div>
        <div className="content">
          {this.renderSubTagGroups()}
        </div>
      </div>
    );
  }
}

export default TagTree;
