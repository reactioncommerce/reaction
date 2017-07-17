import React,  { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import matchSorter from "match-sorter";
import ReactTable from "react-table";
import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { SortableTableFilter, SortableTablePagination } from "./sortableTableComponents";

class SortableTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
      filterInput: "",
      maxPages: 0,
      query: this.props.query || {}
    };

    this.handleFilterInput = this.handleFilterInput.bind(this);
  }


  /**
   * getMeteorData() - Absorb publication / collection information from props, output data from subscription
   * @prop {String} matchingResultsCount - Send to Counts collection to get results count of sub
   * @prop {String} publication - publication to subscribe to
   * @prop {Object} collection - collection to get data from
   * Use props to get collection
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

    const pubHandle = Meteor.subscribe(publication, this.state.query, _.assignIn({}, options));

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
   * @returns {String|Boolean} replacement filter
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
   * handleFilterInput() - Update state when filter is changed
   * @param {script} event onChange event when typing in filter field
   * @param {string} value text field input
   * @param {string} field input field name to watch
   * @return {function} state for field value
   */
  handleFilterInput = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }


  /**
   * handleClick() - Handle click on table row
   * @param {object} rowInfo row data passed in from ReactTable
   * @return {function} return onRowClick function prop, or undefined if not supplied
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
      return _.assignIn({}, element, {
        minWidth: undefined
      });
    });

    return displayColumns;
  }


  /**
   * renderData() - Take data from getMeteorData() and filter if needed, or spit out raw if no filter
   * @returns {Object} data filed (string), translated header (string), and minWidth (number / undefined)
   */
  renderData() {
    const { filteredFields } = this.props;
    const { filterInput } = this.state;

    let originalData = [];

    if (this.getMeteorData().results) {
      originalData = this.getMeteorData().results;
    }

    const filteredData = matchSorter(originalData, filterInput, { keys: filteredFields });

    return filteredData;
  }


  /**
   * renderColumnFilter() - Uses props to determine if Column Filters should be shown
   * @returns {Bool} returns true or false for column filters
   */
  renderColumnFilter() {
    const { filterType } = this.props;

    if (filterType === "both" || filterType === "column") {
      return true;
    }

    return false;
  }


  /**
   * renderTableFilter() - Uses props to determine if a Table Filter should be shown
   * @returns {node} returns JSX node or null
   */
  renderTableFilter() {
    const { filterType } = this.props;

    if (filterType === "both" || filterType === "table") {
      return (
        <SortableTableFilter
          onChange={this.handleFilterInput}
          value={this.state.filterInput}
          name="filterInput"
        />
      );
    }

    return null;
  }


  render() {
    const { ...otherProps } = this.props;

    // All available props: https://github.com/tannerlinsley/react-table#props
    return (
      <div>
        {this.renderTableFilter()}
        <ReactTable
          className={"-striped -highlight"}
          columns={this.renderColumns()}
          data={this.renderData()}
          defaultFilterMethod={this.customFilter}
          defaultPageSize={otherProps.defaultPageSize}
          filterable={this.renderColumnFilter()}
          minRows={otherProps.minRows}

          previousText={otherProps.previousText}
          nextText={otherProps.nextText}
          loadingText={otherProps.loadingText}
          noDataText={otherProps.noDataText}
          pageText={otherProps.pageText}
          ofText={otherProps.ofText}
          rowsText={otherProps.rowsText}

          PaginationComponent={SortableTablePagination}

          getTrProps={(state, rowInfo, column, instance) => { // eslint-disable-line no-unused-vars
            return {
              onClick: e => { // eslint-disable-line no-unused-vars
                this.handleClick(rowInfo);
              }
            };
          }}
        />
      </div>
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
  /** @type {bool} filterType filter by table, column, or both */
  filterType: PropTypes.string,
  /** @type {array} filteredFields provides filtered columns, use columnMetadata instead */
  filteredFields: PropTypes.array,
  /** @type {bool} isFilterable show / hide column filter */
  isFilterable: PropTypes.bool,
  /** @type {bool} isResizeable allow resizing of table columns */
  isResizeable: PropTypes.bool,
  /** @type {bool} isSortable allow column sorting */
  isSortable: PropTypes.bool,
  /** @type {string} matchingResultsCount provides Count publication to get count from */
  matchingResultsCount: PropTypes.string,
  /** @type {number} minRows minimum amount of rows to display in table */
  minRows: PropTypes.number,
  /** @type {string} noDataMessage text to display when no data is available */
  noDataMessage: PropTypes.string,
  /** @type {function} onRowClick provides function / action when clicking on row */
  onRowClick: PropTypes.func,
  /** @type {string} publication provides publication to get Meteor data from */
  publication: PropTypes.string,
  /** @type {object} query provides query for publication filtering */
  query: PropTypes.object,
  /** @type {function} transform transform of collection for grid results */
  transform: PropTypes.func
};

SortableTable.defaultProps = {
  defaultPageSize: 10,
  filterType: "table",
  isFilterable: false,
  isResizeable: true,
  isSortable: true,
  minRows: 0,
  // Text props where translations are needed
  noDataMessage: "No results found",
  previousText: "Previous",
  nextText: "Next",
  loadingText: "Loading...",
  noDataText: "No results found",
  pageText: "Page",
  ofText: "of",
  rowsText: "rows"
};

export default SortableTable;
