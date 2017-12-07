import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

class MarketplaceShops extends Component {
  static propTypes = {
    onWorkflowChange: PropTypes.func,
    shops: PropTypes.arrayOf(PropTypes.object)
  }

  getTrGroupProps(state, rowInfo) {
    return {
      onClick: () => {
        const shopId = rowInfo.original._id;
        Reaction.setActionViewDetail({
          data: { shopId },
          props: { size: "large" },
          template: "MarketplaceShopPackages"
        });
      }
    };
  }

  renderShopsTable() {
    const fields = ["name", "emails", "workflow"];

    const columnMetadata = fields.map((field) => {
      return {
        Header: <Components.Translation i18nKey={`marketplaceShops.headers.${field}`} defaultValue={field} />,
        accessor: field,
        Cell: (data) => (
          <Components.MarketplaceShopTableCell
            data={data}
            field={field}
            onWorkflowChange={this.props.onWorkflowChange}
          />
        )
      };
    });

    return (
      <Components.SortableTable
        data={this.props.shops}
        columnMetadata={columnMetadata}
        filteredFields={fields}
        filterType="none"
        getTrGroupProps={this.getTrGroupProps}
        showFilter={true}
        isSortable={false}
      />
    );
  }

  render() {
    return (
      <div className="rui sortable-table-container">
        <div className="rui sortable-table marketplace-shops">
          {this.renderShopsTable()}
        </div>
      </div>
    );
  }
}

export default MarketplaceShops;
