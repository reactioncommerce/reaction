import React, { Component, PropTypes } from "react";
import { getTagIds } from "/lib/selectors/tags";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { Button, EditButton } from "/imports/plugins/core/ui/client/components";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";
import TagGroup from "./tagGroup";

class TagNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTag: this.props.selectedTag || {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectedTag: nextProps.selectedTag });
  }

  renderEditButton() {
    const { editContainerItem } = this.props.navButtonStyles;
    return (
      <span className="navbar-item edit-button" style={editContainerItem}>
        <EditButton
          onClick={this.props.onEditButtonClick}
          bezelStyle="solid"
          primary={true}
          icon="fa fa-pencil"
          onIcon="fa fa-check"
          toggle={true}
          toggleOn={this.props.editable}
        />
      </span>
    );
  }

  tagGroupProps = (tag) => {
    const subTagGroups = _.compact(TagHelpers.subTags(tag));
    const tagsByKey = {};

    if (Array.isArray(subTagGroups)) {
      for (const tagItem of subTagGroups) {
        tagsByKey[tagItem._id] = tagItem;
      }
    }

    return {
      parentTag: tag,
      tagsByKey: tagsByKey || {},
      tagIds: getTagIds({ tags: subTagGroups }) || [],
      subTagGroups
    };
  }

  render() {
    const { navbarOrientation, navbarPosition, navbarAnchor, navbarVisibility } = this.props;
    return (
      <div className={`rui tagnav ${navbarOrientation} ${navbarPosition} ${navbarAnchor} ${navbarVisibility}`}>
        <div className="navbar-header">
          <Button
            primary={true}
            icon="times"
            status="default"
            className="close-button"
            onClick={this.props.closeNavbar}
          />
          {this.props.children}
        </div>
        <div className="navbar-items">
          <DragDropProvider>
            <TagList
              {...this.props}
              isTagNav={true}
              draggable={true}
              enableNewTagForm={true}
            >
              <div className="dropdown-container">
                <TagGroup
                  {...this.props}
                  editable={this.props.editable === true}
                  tagGroupProps={this.tagGroupProps(this.state.selectedTag || {})}
                  onMove={this.props.onMoveTag}
                  onTagInputBlur={this.handleTagSave}
                  onTagMouseOut={this.handleTagMouseOut}
                  onTagMouseOver={this.handleTagMouseOver}
                  onTagSave={this.handleTagSave}
                />
              </div>
            </TagList>
          </DragDropProvider>
          {this.props.canEdit && this.renderEditButton()}
          </div>
      </div>
    );
  }
}

TagNav.propTypes = {
  canEdit: PropTypes.bool,
  children: PropTypes.node,
  closeNavbar: PropTypes.func,
  editable: PropTypes.bool,
  navButtonStyles: PropTypes.object,
  navbarAnchor: PropTypes.string,
  navbarOrientation: PropTypes.string,
  navbarPosition: PropTypes.string,
  navbarVisibility: PropTypes.string,
  onEditButtonClick: PropTypes.func,
  onMoveTag: PropTypes.func,
  selectedTag: PropTypes.object
};

export default TagNav;
