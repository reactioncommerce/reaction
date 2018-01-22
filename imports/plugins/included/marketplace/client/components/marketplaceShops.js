import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class MarketplaceShops extends Component {
  static propTypes = {
    handleSelectRow: PropTypes.func,
    onWorkflowChange: PropTypes.func,
    shops: PropTypes.arrayOf(PropTypes.object)
  }

  constructor(props) {
    super(props);

    this.state = {
      selected: null
    };
  }

  getTrGroupProps = (state, rowInfo) => {
    let className = "";
    if (rowInfo.original._id === this.state.selected) {
      className = "selected";
    }

    return {
      className,
      onClick: () => {
        const shopId = rowInfo.original._id;
        this.setState({ selected: shopId });
        this.props.handleSelectRow(shopId);
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
