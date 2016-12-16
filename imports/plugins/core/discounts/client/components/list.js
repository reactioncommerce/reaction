import React, { Component, PropTypes } from "react";
import { Loading, Translation, IconButton } from "/imports/plugins/core/ui/client/components";
import DiscountForm from "./form";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction, formatNumber } from "/client/api";

class DiscountList extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  // handle remove click
  handleClick(event, codeId) {
    return Meteor.call("discounts/codes/remove", this.props.id, codeId, this.props.collection);
  }
  // list items
  renderList() {
    const listItems = this.props.listItems.map((listItem) => {
      return this.renderItem(listItem.id, listItem.code, listItem.discount);
    });

    return (
      <div className="rui list-group">{listItems}</div>
    );
  }
  // render item
  renderItem(_id, code, discount) {
    let TrashCan;
    const formattedDiscount = formatNumber(discount);

    if (this.props.collection !== "Orders") {
      TrashCan =
        <a className="pull-right">
          <IconButton icon="fa fa-remove" onClick={(e) => this.handleClick(e, _id)}/>
        </a>;
    }
    return (
      <div className="rui list-group-item" key={_id}>
        <span>
          {code} - {formattedDiscount} <Translation defaultValue="Discount applied" i18nKey={"discounts.applied"} />
        </span>
        {TrashCan}
      </div>
    );
  }
  // list loading
  renderLoader() {
    return (
      <Loading/>
    );
  }

  // list loading
  renderNoneFound() {
    return (
      <DiscountForm id={this.props.id} collection={this.props.collection}/>
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
  listItems: PropTypes.array
};

function composer(props, onData) {
  const currentCart = Reaction.Collections[props.collection].findOne({
    _id: props.id
  });

  const listItems = [];
  for (billing of currentCart.billing) {
    if (billing.paymentMethod && billing.paymentMethod.processor === "discount-code") {
      listItems.push({
        id: billing._id,
        code: billing.paymentMethod.code,
        discount: billing.paymentMethod.amount
      });
    }
  }

  onData(null, {
    collection: props.collection,
    id: props.id,
    listItems: listItems
  });
}

// export default composeWithTracker(composer)(DiscountList)
const options = {
  propsToWatch: ["billing"]
};

let discountListComponent = DiscountList;
discountListComponent = composeWithTracker(composer, options)(discountListComponent);

export default discountListComponent;
