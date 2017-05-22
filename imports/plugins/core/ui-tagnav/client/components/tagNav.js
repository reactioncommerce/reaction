import React, { PropTypes } from "react";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";

const TagNav = (props) => {
  return (
    <div className={`rui tagnav ${props.navbarOrientation} ${props.navbarPosition} ${props.navbarAnchor} ${props.navbarVisibility}`}>
      <div className="navbar-header">
        <p>Header</p>
      </div>
      <DragDropProvider>
        <TagList
          {...props}
          enableNewTagForm={true}
        />
      </DragDropProvider>
    </div>
  );
};

TagNav.propTypes = {
  navbarAnchor: PropTypes.string,
  navbarOrientation: PropTypes.string,
  navbarPosition: PropTypes.string,
  navbarVisibility: PropTypes.string
};

export default TagNav;
