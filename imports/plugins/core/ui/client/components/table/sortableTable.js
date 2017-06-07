import React, { Component, PropTypes } from "react";
import { Griddle } from "griddle-react";

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
