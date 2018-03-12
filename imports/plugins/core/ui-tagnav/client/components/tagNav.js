import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Components } from "@reactioncommerce/reaction-components";
import { getTagIds } from "/lib/selectors/tags";
import { TagHelpers } from "/imports/plugins/core/ui-tagnav/client/helpers";
import ShopSelect from "/imports/plugins/core/dashboard/client/components/shopSelect";

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

  /**
   * onShopSelectChange
   * @method
   * @summary Handle change in selected shop
   * @param {script} event
   * @param {String} shopId - selected shopId
   * @since 1.5.8
   * @return {void}
  */
  onShopSelectChange = (event, shopId) => {
    if (this.props.handleShopSelectChange) {
      this.props.handleShopSelectChange(event, shopId);
    }
  }

  renderEditButton() {
    const { editContainerItem } = this.props.navButtonStyles;
    return (
      <span className="navbar-item edit-button" style={editContainerItem}>
        <Components.EditButton
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

  /**
  * renderShopSelect
  * @method
  * @summary Handles shop options display on mobile view
  * @return {JSX} React node containing dropdown menu
  */
  renderShopSelect() {
    if (this.props.handleShopSelectChange) {
      return (
        <ShopSelect
          className={"shop-select"}
          isTagNav={true}
          onShopSelectChange={this.onShopSelectChange}
          shopName={this.props.shop.name}
          shops={this.props.shops}
          shopId={this.props.shop._id}
        />
      );
    }
    return null;
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
          <Components.Button
            primary={true}
            icon="times"
            status="default"
            className="close-button"
            onClick={this.props.closeNavbar}
          />
          {this.props.children}
        </div>
        {this.renderShopSelect()}
        <div className="navbar-items">
          <Components.DragDropProvider>
            <Components.TagList
              {...this.props}
              isTagNav={true}
              draggable={true}
              enableNewTagForm={true}
            >
              <div className="dropdown-container">
                <Components.TagGroup
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
            </Components.TagList>
          </Components.DragDropProvider>
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
  handleShopSelectChange: PropTypes.func,
  navButtonStyles: PropTypes.object,
  navbarAnchor: PropTypes.string,
  navbarOrientation: PropTypes.string,
  navbarPosition: PropTypes.string,
  navbarVisibility: PropTypes.string,
  onEditButtonClick: PropTypes.func,
  onMoveTag: PropTypes.func,
  selectedTag: PropTypes.object,
  shop: PropTypes.object,
  shops: PropTypes.array
};

export default TagNav;
