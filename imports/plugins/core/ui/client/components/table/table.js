import React, { Component, PropTypes } from "react";
import { TacoTable } from "react-taco-table";

class SortableTable extends Component {
  handleRowClick = (event, value) => {
    if (this.props.onRowClick) {
      this.props.onRowClick(event, value);
    }
  }
  render() {
    const {
      data,
      columns
    } = this.props;

    return (
      <TacoTable
        className="table sortable-table"
        columns={columns}
        onRowClick={this.handleRowClick}
        data={data}
      />
    );
  }
}

SortableTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  onRowClick: PropTypes.func
};

export default SortableTable;
