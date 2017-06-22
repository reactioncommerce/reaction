import React,  { Component } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import _ from "lodash";
import { SortableTablePagination } from "./sortableTableComponents";


class SortableTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
      maxPages: 0,
      query: this.props.query || {},
      data: {}
    };
  }


  /**
   * getMeteorData() - Absorb publication / collection information from props, output data from subscription
   * @prop {String} matchingResultsCount - Send to Counts collection to get results count of sub
   * @prop {String} publication - publication to subscribe to
   * @prop {Object} collection - collection to get data from
   * Use props to get collection, EmailTableColumn
   * Use that info to call meteor and get subscription
   * Output data for table
   * @returns {Object} loading status (bool), results (object), and matchingResults (number)
   */
  getMeteorData() {
    const { collection, matchingResultsCount, publication } = this.props;

    // Get a count of the number of items matching the current filter.
    // If no filter is set it will return the total number of items in the collection.
    const matchingResults = Counts.get(matchingResultsCount);

    const options = {};
    let skip;

    const pubHandle = Meteor.subscribe(publication, this.state.query, _.extend({
      skip: skip
    }, options));

    // optional transform of collection for grid results
    let results = collection.find(this.state.query, options).fetch();
    if (this.props.transform) {
      results = this.props.transform(results);
    }

    return {
      loading: !pubHandle.ready(),
      results: results,
      matchingResults: matchingResults
    };
  }


  /**
   * customFilter() - Replace default filter with customized filter
   * custom filter is case insensitive
   * custom filter searches entire string, not just from string start
   * @param {Object} filter user-typed data
   * @param {Object} row row info for associated filter
   * @returns {String} replacement filter
   */
  customFilter = (filter, row) => {
    const id = filter.pivotId || filter.id;
    if (row[id] !== null && typeof row[id] === "string") {
      return (row[id] !== undefined
        ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase())
        : true);
    }
  }


  /**
   * handleClick() - Handle click on table row
   * @param {object} rowInfo row data passed in from ReactTable
   * @return {funcion} return onRowClick function prop, or undefined if not supplied
   */
  handleClick(rowInfo) {
    const { onRowClick } = this.props;

    if (typeof onRowClick === "function") {
      return (
        onRowClick({
          className: "sortable-table-row",
          props: {
            data: {
              _id: rowInfo.original._id,
              type: rowInfo.original.type
            }
          }
        })
      );
    }
  }


  /**
   * renderColumns() - Absorb columnMetadata information from props, output columns to display
   * @prop {String} columnMetadata - Object of data field, column header
   * @returns {Object} data filed (string), translated header (string), and minWidth (number / undefined)
   */
  renderColumns() {
    const { columnMetadata } = this.props;

    // Add minWidth = undefined to override 100px default set by ReactTable
    const displayColumns = columnMetadata.map((element) => {
      return _.extend({}, element, {
        minWidth: undefined
      });
    });

    return displayColumns;
  }


  render() {
    const { ...otherProps } = this.props;
    const data = this.getMeteorData().results;
    const matchingResults = this.getMeteorData().matchingResults;

    // All available props: https://github.com/tannerlinsley/react-table#props
    return (
      <ReactTable
        className={"-striped -highlight"}
        columns={this.renderColumns()}
        data={data}
        defaultFilterMethod={this.customFilter}
        defaultPageSize={otherProps.defaultPageSize}
        filterable={otherProps.isFilterable}
        minRows={otherProps.minRows}

        PaginationComponent={SortableTablePagination}

        getTrProps={(state, rowInfo, column, instance) => { // eslint-disable-line no-unused-vars
          return {
            onClick: e => { // eslint-disable-line no-unused-vars
              this.handleClick(rowInfo);
            }
          };
        }}
      />
    );
  }
}

SortableTable.propTypes = {
  /** @type {object} collection collection to get data from */
  collection: PropTypes.object,
  /** @type {array} columnMetadata provides filtered columns with i18n headers */
  columnMetadata: PropTypes.array,
  /** @type {number} defaultPageSize how many results per page */
  defaultPageSize: PropTypes.number,
  /** @type {array} filteredFields provides filtered columns, use columnMetadata instead */
  filteredFields: PropTypes.array,
  /** @type {bool} isFilterable show / hide filter */
  isFilterable: PropTypes.bool,
  /** @type {bool} isResizeable allow resizing of table columns */
  isResizeable: PropTypes.bool,
  /** @type {bool} isSortable allow column sorting */
  isSortable: PropTypes.bool,
  /** @type {string} matchingResultsCount provides Count publication to get count from */
  matchingResultsCount: PropTypes.string,
  /** @type {string} minRows minimum amount of rows to display in table */
  minRows: PropTypes.number,
  /** @type {function} onRowClick provides function / action when clicking on row */
  onRowClick: PropTypes.func,
  /** @type {string} publication provides publication to get Meteor data from */
  publication: PropTypes.string,
  /** @type {object} query provides query for publication filtering */
  query: PropTypes.object
};

SortableTable.defaultProps = {
  defaultPageSize: 10,
  isFilterable: false,
  isResizeable: true,
  isSortable: true,
  minRows: 0
};

export default SortableTable;
