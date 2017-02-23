import React, { Component, PropTypes } from "react";
import { TacoTable } from "react-taco-table";

class SortableTable extends Component {
  render() {
    const {
      data,
      columns
    } = this.props;

    return (
      <TacoTable
        className="table sortable-table"
        columns={columns}
        data={data}
      />
    );
  }
}

SortableTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array
};

export default SortableTable;
