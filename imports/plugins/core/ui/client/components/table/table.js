import React, {Component, PropTypes} from "react";
import { TacoTable, DataType, SortDirection, Formatters, Summarizers, TdClassNames } from "react-taco-table";

class SortableTable extends React.Component {
  render() {
    const {
      data,
      columns,
      ...otherProps
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
