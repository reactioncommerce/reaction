import React, { PropTypes } from "react";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";
import { Button } from "/imports/plugins/core/ui/client/components";
import { TagList } from "/imports/plugins/core/ui/client/components/tags/";

const TagNav = (props) => {
  return (
    <div className={`rui tagnav ${props.navbarOrientation} ${props.navbarPosition} ${props.navbarAnchor} ${props.navbarVisibility}`}>
      <div className="navbar-header">
        <Button primary={true} icon="times" status="default" className="close-button" />
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
