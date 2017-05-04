import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components/";
import { TagListContainer, EditContainer } from "/imports/plugins/core/ui/client/containers";
import { IconButton, Overlay } from "/imports/plugins/core/ui/client/components";

const NavbarStates = {
  Orientation: "stateNavbarOrientation",
  Position: "stateNavbarPosition",
  Anchor: "stateNavbarAnchor",
  Visible: "stateNavbarVisible"
};

const NavbarOrientation = {
  Vertical: "vertical",
  Horizontal: "horizontal"
};

const NavbarVisibility = {
  Shown: "shown",
  Hidden: "hidden"
};

const NavbarPosition = {
  Static: "static",
  Fixed: "fixed"
};

const NavbarAnchor = {
  Top: "top",
  Right: "right",
  Bottom: "bottom",
  Left: "left",
  None: "inline"
};

class TagNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      attachedBodyListener: false,
      isEditing: false,
      selectedTag: null,
      [NavbarStates.Visible]: false,
      [NavbarStates.Visibility]: NavbarVisibility.Hidden
    };
  }

  get tags() {
    return this.props.tags;
  }

  get showEditControls() {
    return this.props.tags && true;
  }

  get navbarOrientation() {
    return this.state[NavbarStates.Orientation];
  }

  get navbarPosition() {
    return this.state[NavbarStates.Position];
  }

  get navbarAnchor() {
    return this.state[NavbarStates.Anchor];
  }

  get navbarVisibility() {
    const isVisible = this.state[NavbarStates.Visible] === true;

    if (isVisible) {
      return "open";
    }
    return "closed";
  }

  get showEditControls() {
    return this.props.product && this.props.editable;
  }

  renderEditButton() {
    if (this.showEditControls) {
      return (
        <span className="edit-button">
          <EditContainer
            data={this.props.product}
            disabled={this.props.editable === false}
            editView="ProductAdmin"
            field="hashtags"
            i18nKeyLabel="productDetailEdit.productSettings"
            label="Product Settings"
            permissions={["createProduct"]}
          />
        </span>
      );
    }

    return null;
  }

  render() {
    console.log({ props: this.props });

    if (Array.isArray(this.tags) && this.tags.length > 0) {
      const parentClasses = `rui tagnav ${this.navbarOrientation} ${this.navbarPosition} ${this.navbarAnchor} ${this.navbarVisibility}`;

      return (
        // Todo: fix --> rui tagnav horizontal static inline closed
        <div className={parentClasses}>
          <div className="navbar-items">
            <TagListContainer
              editable={false}
              product={this.props.product}
              tags={this.tags}
            />
            {this.renderEditButton()}
          </div>
        </div>
      );
    }
    return null;
  }
}

TagNav.propTypes = {
  editButton: PropTypes.node,
  editable: PropTypes.bool,
  product: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.object)
};

export default TagNav;
