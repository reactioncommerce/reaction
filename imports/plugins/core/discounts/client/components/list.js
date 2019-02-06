import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { IconButton } from "/imports/plugins/core/ui/client/components";
import { Reaction } from "/client/api";
import DiscountForm from "./form";

class DiscountList extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  // handle remove click
  handleClick(event, codeId) {
    const { collection, id, token } = this.props;
    return Meteor.call("discounts/codes/remove", id, codeId, collection, token);
  }

  // list items
  renderList() {
    const listItems = this.props.listItems.map((listItem) => this.renderItem(listItem));

    return (
      <div className="rui list-group">{listItems}</div>
    );
  }

  // render item
  renderItem(listItem) {
    let TrashCan;

    if (this.props.collection !== "Orders") {
      TrashCan = (
        <div className="rui list-item-action">
          <IconButton icon="fa fa-remove" onClick={(event) => this.handleClick(event, listItem._id)}/>
        </div>
      );
    }
    return (
      <div className="rui list-group-item" key={listItem._id}>
        <span className="rui list-item-content">
          {listItem.displayName}
        </span>
        {TrashCan}
      </div>
    );
  }

  // load form input view
  renderNoneFound() {
    const { collection, id, token, validatedInput } = this.props;
    return (
      <DiscountForm id={id} collection={collection} token={token} validatedInput={validatedInput} />
    );
  }

  // render list view
  render() {
    const { listItems } = this.props;
    return (listItems.length >= 1) ? this.renderList() : this.renderNoneFound();
  }
}

DiscountList.propTypes = {
  collection: PropTypes.string,
  id: PropTypes.string,
  listItems: PropTypes.array,
  token: PropTypes.string,
  validatedInput: PropTypes.bool // eslint-disable-line react/boolean-prop-naming
};

/**
 * @summary Tracker reactive props
 * @param {Object} props Incoming props
 * @param {Function} onData Callback for more props
 * @returns {undefined}
 */
function composer(props, onData) {
  const currentCart = Reaction.Collections[props.collection].findOne({
    _id: props.id
  });

  const listItems = (currentCart.billing || []).reduce((list, item) => {
    if (item.mode === "discount") {
      list.push({
        _id: item._id,
        displayName: item.displayName
      });
    }
    return list;
  }, []);

  onData(null, {
    listItems
  });
}

const options = {
  propsToWatch: ["billing"]
};

const discountListComponent = composeWithTracker(composer, options)(DiscountList);
registerComponent("DiscountList", discountListComponent);

export default discountListComponent;
