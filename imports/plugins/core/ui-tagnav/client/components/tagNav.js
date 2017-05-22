import React, { PropTypes } from "react";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { PropTypes as ReactionPropTypes } from "/lib/api";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";

const TagNav = (props) => {
  console.log({ props });
  return (
    <div className={`rui tagnav ${props.navbarOrientation} ${props.navbarPosition} ${props.navbarAnchor} ${props.navbarVisibility}`}>
      <div className="navbar-header">
        <p>Header</p>
      </div>
      <DragDropProvider>
        <TagList
          {...props}
          tags={props.tags}
          isTagNav={props.isTagNav}
          canEdit={props.canEdit}
          newTag={props.newTag}
          navButton={props.styles}
          enableNewTagForm={true}
          editable={props.editable}
          hasDropdownClassName={props.hasDropdownClassName}
          navbarSelectedClassName={props.navbarSelectedClassName}
          suggestions={props.suggestions}
          onClearSuggestions={props.handleClearSuggestions}
          onGetSuggestions={props.handleGetSuggestions}
          onEditButtonClick={props.handleEditButtonClick}
          onMoveTag={props.handleMoveTag}
          onNewTagSave={props.handleNewTagSave}
          onNewTagUpdate={props.handleNewTagUpdate}
          onTagMouseOut={props.handleTagMouseOut}
          onTagMouseOver={props.handleTagMouseOver}
          onTagRemove={props.handleTagRemove}
          onTagSave={props.handleTagSave}
          onTagUpdate={props.handleTagUpdate}
          onTagSelect={props.onTagSelect}
        />
      </DragDropProvider>
    </div>
  );
};

TagNav.propTypes = {
  canEdit: PropTypes.bool,
  editable: PropTypes.bool,
  handleClearSuggestions: PropTypes.func,
  handleEditButtonClick: PropTypes.func,
  handleGetSuggestions: PropTypes.func,
  handleMoveTag: PropTypes.func,
  handleNewTagSave: PropTypes.func,
  handleNewTagUpdate: PropTypes.func,
  handleTagMouseOut: PropTypes.func,
  handleTagMouseOver: PropTypes.func,
  handleTagRemove: PropTypes.func,
  handleTagSave: PropTypes.func,
  handleTagUpdate: PropTypes.func,
  hasDropdownClassName: PropTypes.func,
  isTagNav: PropTypes.bool,
  navbarAnchor: PropTypes.string,
  navbarOrientation: PropTypes.string,
  navbarPosition: PropTypes.string,
  navbarSelectedClassName: PropTypes.func,
  navbarVisibility: PropTypes.string,
  newTag: PropTypes.object,
  onTagSelect: PropTypes.func,
  styles: PropTypes.object,
  suggestions: PropTypes.array,
  tags: ReactionPropTypes.arrayOfTags
};

export default TagNav;
