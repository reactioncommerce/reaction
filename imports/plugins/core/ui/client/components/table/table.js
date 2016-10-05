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
        // columnHighlighting
        data={data}
        // striped
        sortable
        thClassName="woopty"
      />
    );
  }
}

SortableTable.propTypes = {
  columns: PropTypes.node,
  data: PropTypes.node
};

export default SortableTable;
