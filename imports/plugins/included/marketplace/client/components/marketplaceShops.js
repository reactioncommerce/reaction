import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class MarketplaceShops extends Component {
  static propTypes = {
    onWorkflowChange: PropTypes.func,
    shops: PropTypes.arrayOf(PropTypes.object)
  }

  renderShopsTable() {
    const fields = ["name", "emails", "workflow"];

    const columnMetadata = fields.map((field) => {
      return {
        Header: <Components.Translation i18nKey={`admin.logs.headers.${field}`} defaultValue={field} />,
        accessor: field,
        Cell: (data) => ( // eslint-disable-line
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
        showFilter={true}
        isSortable={false}
      />
    );
  }

  render() {
    return (
      <div className="group-container">
        <div className="settings">
          {/* <Components.Alerts placement={alertId} id={alertId} onAlertRemove={this.removeAlert} /> */}
          {this.renderShopsTable()}
        </div>
      </div>
    );
  }
}

export default MarketplaceShops;
