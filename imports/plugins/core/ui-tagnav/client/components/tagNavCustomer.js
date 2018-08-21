import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { getTagIds } from "/lib/selectors/tags";
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
    const subTagGroups = (tag && tag.subTags) ? tag.subTags.nodes : [];
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
          <Components.TagListCustomer
            product={this.props.product}
            hasDropdownClassName={this.props.hasDropdownClassName}
            navbarSelectedClassName={this.props.navbarSelectedClassName}
            onTagClick={this.props.onTagClick}
            onTagMouseOut={this.props.onTagMouseOut}
            onTagMouseOver={this.props.onTagMouseOver}
            tags={this.props.tags}
            isTagNav={true}
            draggable={false}
            enableNewTagForm={false}
          >
            <div className="dropdown-container">
              <Components.TagGroupCustomer
                {...this.props}
                tagGroupProps={this.tagGroupProps(this.state.selectedTag || {})}
                onTagMouseOut={this.handleTagMouseOut}
                onTagMouseOver={this.handleTagMouseOver}
              />
            </div>
          </Components.TagListCustomer>
        </div>
      </div>
    );
  }
}

TagNav.propTypes = {
  children: PropTypes.node,
  closeNavbar: PropTypes.func,
  handleShopSelectChange: PropTypes.func,
  navButtonStyles: PropTypes.object,
  navbarAnchor: PropTypes.string,
  navbarOrientation: PropTypes.string,
  navbarPosition: PropTypes.string,
  navbarVisibility: PropTypes.string,
  selectedTag: PropTypes.object,
  shop: PropTypes.object,
  shops: PropTypes.array
};

export default TagNav;
