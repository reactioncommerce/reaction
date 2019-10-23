import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import matchSorter from "match-sorter";
import ReactTable from "react-table";
import checkboxHOC from "react-table/lib/hoc/selectTable";
import ChevronRightIcon from "mdi-material-ui/ChevronRight";
import ChevronLeftIcon from "mdi-material-ui/ChevronLeft";
import { registerComponent } from "@reactioncommerce/reaction-components";
import styled from "styled-components";
import Select from "@reactioncommerce/components/Select/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import Button from "@reactioncommerce/catalyst/Button";
import { i18next } from "/client/api";
import { pagination } from "./util/pagination";
import TagTableSelect from "./TagTableSelect";

const CheckboxTable = checkboxHOC(ReactTable);

const TableHeader = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const FilterTextInput = styled.div`
  display: flex;
  flex: 1;

  > div {
    width: 100%;
  }
`;

const BulkActionsSelect = styled.div`
  min-width: 150px;
  margin-right: 20px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  > div {
    margin-left: 0.5rem;
  }
`;

const TableContainer = styled.div`
  .ReactTable {
    border: none;
  }

  .ReactTable .rt-th, .ReactTable .rt-td {
    padding: 0px 5px;
  }

  .ReactTable .rt-tbody .rt-td {
    border: none;
  }

  .ReactTable .rt-thead .rt-th, .ReactTable .rt-thead .rt-td {
    border: none;
    display: flex;
    align-items: center;
    font-weight: 600;
  }

  .ReactTable .rt-thead.-header {
    border: none;
  }

  .ReactTable .rt-tr-group {
    border: none;
  }

  .ReactTable .rt-thead.-header:first-child .rt-th:first-child {
    justify-content: center;
  }
`;

/**
 * @file TagDataTable is a React Component wrapper around {@link https://react-table.js.org} ReactTable.
 * Any functionality from ReactTable should be available in SortableTable out of the box, but may require styling.
 * For more, see {@link https://react-table.js.org/#/story/readme ReactTable docs}
 *
 * @module SortableTable
 * @extends Component
 * @returns {Class} class
 */
class TagDataTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
      filterInput: "",
      maxPages: 0,
      selection: [],
      selectAll: false,
      query: props.query || {}
    };
  }

  /**
   * @name customFilter
   * @method
   * @summary Replace default filter with customized filter, custom filter is case insensitive
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

    return null;
  }

  /**
   * @name handleFilterInput
   * @summary Update state when filter is changed
   * @param {String} value text field input
   * @returns {function} state for field value
   */
  handleFilterInput = (value) => {
    this.setState({
      filterInput: value
    });
  }

  /**
   * @name filterData
   * @method
   * @summary Filter supplied data if needed, or spit out raw if no filter
   * @param {Array} data An array of objects
   * @returns {Object} data filed (string), translated header (string), and minWidth (number / undefined)
   */
  filterData(data) {
    const { filteredFields, filterType } = this.props;
    const { filterInput } = this.state;
    const originalData = [...data];

    if (filterType === "both" || filterType === "table") {
      const filteredData = matchSorter(originalData, filterInput, { keys: filteredFields });
      return filteredData;
    }

    return originalData;
  }

  /**
   * @name handleClick
   * @summary Handle click on table row
   * @param {Object} rowInfo row data passed in from ReactTable
   * @returns {function} return onRowClick function prop, or undefined if not supplied
   */
  handleClick(rowInfo) {
    const { onRowClick } = this.props;

    if (typeof onRowClick === "function") {
      onRowClick({
        className: "sortable-table-row",
        props: {
          data: {
            ...rowInfo.original
          }
        }
      });
    }
  }

  /**
   * @name handleCellClick
   * @summary Handle click on table cell
   * @param {Object} rowInfo row data passed in from ReactTable
   * @param {Object} column Column data
   * @returns {function} return onRowClick function prop, or undefined if not supplied
   */
  handleCellClick(rowInfo, column) {
    const { onCellClick } = this.props;

    if (rowInfo && typeof onCellClick === "function") {
      onCellClick({
        column,
        rowData: {
          ...rowInfo.original
        }
      });
    }
  }

  /**
   * @name renderColumns
   * @method
   * @summary Absorb columnMetadata information from props, output columns to display
   * @prop {String} columnMetadata - Object of data field, column header
   * @returns {Object} data filed (string), translated header (string), and minWidth (number / undefined)
   */
  renderColumns() {
    const { columnMetadata } = this.props;

    // Add minWidth = undefined to override 100px default set by ReactTable
    const displayColumns = columnMetadata.map((element) => Object.assign({}, element, {
      minWidth: undefined
    }));

    return displayColumns;
  }

  /**
   * @name renderColumnFilter
   * @summary Uses props to determine if Column Filters should be shown
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
   * @name renderTableFilter
   * @method
   * @summary Uses props to determine if a Table Filter should be shown
   * @param {Number} numRows Number of rows in current set of data
   * @returns {node} returns JSX node or null
   */
  renderTableFilter() {
    const { filterType } = this.props;

    if (filterType === "both" || filterType === "table") {
      return (
        <FilterTextInput>
          <TextInput
            placeholder={i18next.t("reactionUI.components.sortableTable.filterPlaceholder", { defaultValue: "Filter Data" })}
            onChanging={this.handleFilterInput}
            value={this.state.filterInput}
            name="filterInput"
          />
        </FilterTextInput>

      );
    }

    return null;
  }

  /**
   * @name handleBulkActionsSelect
   * @method
   * @summary Handle bulk action select
   * @param {String} action Bulk action name
   * @returns {undefined} No return value
   */
  handleBulkActionsSelect = (action) => {
    this.setState({ selectedBulkAction: action });

    if (action) {
      const { bulkActions } = this.props;
      const selection = [...this.state.selection];
      const option = bulkActions.find((opt) => opt.value === action);

      Alerts.alert({
        title: i18next.t(`admin.tags.${option.value}Action`, { count: selection.length }),
        type: "warning",
        showCancelButton: true
      }, async (isConfirm) => {
        if (isConfirm) {
          try {
            const result = await this.props.onBulkAction(action, selection);
            this.props.onBulkActionSuccess(result);
          } catch (error) {
            this.props.onBulkActionError(error);
          }
        }

        // Reset selection state
        this.setState({
          selection: [],
          selectAll: false,
          selectedBulkAction: null
        });
      });
    }
  }

  /**
   * @name renderBulkActionsSelect
   * @method
   * @summary Renders the bulk action select component
   * @returns {Node} React node
   */
  renderBulkActionsSelect() {
    const { bulkActions } = this.props;
    const { selection, selectedBulkAction } = this.state;

    if (Array.isArray(bulkActions) && bulkActions.length) {
      const actions = Array.isArray(selection) && selection.length ? bulkActions : [];

      if (actions.length) {
        return (
          <BulkActionsSelect>
            <Select
              key="enabled-actions"
              onChange={this.handleBulkActionsSelect}
              options={actions}
              placeholder="Actions"
              value={selectedBulkAction}
            />
          </BulkActionsSelect>
        );
      }

      return (
        <BulkActionsSelect>
          <Select
            key="disabled-actions"
            placeholder="Actions"
            isReadOnly={true}
          />
        </BulkActionsSelect>
      );
    }

    return null;
  }

  /**
   * @name selectedRowsClassName
   * @method
   * @summary If any rows are selected, give them a className of "selected-row"
   * @param {Object} rowInfo row data passed in from ReactTable
   * @returns {String} className to apply to row that is selected, or empty string if no row is selected
   */
  selectedRowsClassName(rowInfo) {
    const { selectedRows } = this.props;
    let className = "";

    if (selectedRows && selectedRows.length) {
      if (rowInfo !== undefined && selectedRows.includes(rowInfo.row._id)) {
        className = "selected-row";
      }
    }

    return className;
  }

  /**
   * @name displayNoResultsFound
   * @method
   * @summary This function displays a 'No Results Found' when there is no data to populate the table
   * @param {Number} numRows Number of rows in current set of data
   * @returns {node} returns a JSX node or empty string
   */
  displayNoResultsFound(numRows) {
    let displayText = "";
    if (numRows === 0) {
      displayText = <span className="sortableTable-noDataText">{this.props.noDataMessage}</span>;
    }
    return displayText;
  }

  /**
   * @name isRowSelected
   * @method
   * @summary Return selected state for a given row key
   * @param {String} key Row key field value
   * @returns {Boolean} A boolean value for the selected state of the row
   */
  isRowSelected = (key) => (
    this.state.selection.find((element) => element._id === key) !== undefined
  )

  /**
   * @name handleToggleSelection
   * @method
   * @summary Return selected state for a given row key
   * @param {String} key Row key field value
   * @param {Boolean} shift Shift key was pressed
   * @param {Object} row Row data
   * @returns {undefined} No return value
   */
  handleToggleSelection = (key, shift, row) => {
    const selectedKey = key.replace("select-", "");
    // update the state
    this.setState((prevState) => {
      // start off with the existing state
      let selection = [...prevState.selection];

      const keyIndex = selection.findIndex((element) => element._id === selectedKey);
      // check to see if the key exists
      if (keyIndex >= 0) {
        // it does exist so we will remove it using destructing
        selection = [
          ...selection.slice(0, keyIndex),
          ...selection.slice(keyIndex + 1)
        ];
      } else {
        // it does not exist so add it
        selection.push(row);
      }

      return {
        selection,
        selectAll: false,
        selectedBulkAction: selection.length === 0 ? undefined : prevState.selectedBulkAction
      };
    });
  }

  /**
   * @name handleToggleAll
   * @method
   * @summary Toggle selection state for all rows
   * @returns {undefined} No return value
   */
  handleToggleAll = () => {
    this.setState((state) => {
      const selectAll = !state.selectAll;
      const selection = [];

      if (selectAll) {
        // Get at the internals of ReactTable
        const wrappedInstance = this.checkboxTable.getWrappedInstance();
        // The 'sortedData' property contains the currently accessible records based on the filter and sort
        const currentRecords = wrappedInstance.getResolvedState().sortedData;
        // Push all items into the selection array
        currentRecords.forEach((item) => {
          selection.push(item._original);
        });
      }
      this.setState({ selectAll, selection });
    });
  }

  render() {
    const { query, variables: variablesProp, defaultPageSize, ...otherProps } = this.props;
    const { filterInput } = this.state;
    const defaultClassName = "-striped -highlight";
    const variables = {
      filter: filterInput || null,
      first: defaultPageSize,
      ...variablesProp
    };
    const checkboxProps = {
      SelectInputComponent: TagTableSelect,
      SelectAllInputComponent: TagTableSelect,
      selectType: "checkbox",
      selectAll: this.state.selectAll,
      isSelected: this.isRowSelected,
      toggleSelection: this.handleToggleSelection,
      toggleAll: this.handleToggleAll,
      selectWidth: 64
    };


    // All available props: https://github.com/tannerlinsley/react-table#props
    return (
      <Query query={query} variables={variables}>
        {({ data, fetchMore, refetch }) => {
          const result = (data[otherProps.dataKey] && data[otherProps.dataKey].nodes) || [];
          const resultCount = (Array.isArray(result) && result.length) || 0;
          const pageInfo = pagination({
            fetchMore,
            data,
            queryName: otherProps.dataKey,
            limit: defaultPageSize
          });

          this.refetch = refetch;

          this.refetchFirstPage = () => {
            fetchMore({
              variables: {
                first: defaultPageSize,
                after: null,
                last: null,
                before: null
              },
              updateQuery: (previousResult, { fetchMoreResult }) => {
                const { [otherProps.dataKey]: items } = fetchMoreResult;

                if (items.edges && items.edges.length) {
                  return fetchMoreResult;
                }

                // Send the previous result if the new result contains no additional data
                return previousResult;
              }
            });
          };

          const { hasNextPage, hasPreviousPage, loadNextPage, loadPreviousPage } = pageInfo;

          return (
            <TableContainer>
              <TableHeader>
                {this.renderBulkActionsSelect()}
                {this.renderTableFilter(resultCount)}
              </TableHeader>
              <CheckboxTable
                {...checkboxProps}
                ref={(ref) => { this.checkboxTable = ref; }}
                className={otherProps.tableClassName || defaultClassName}
                columns={this.renderColumns()}
                data={this.filterData(result)}
                defaultFilterMethod={this.customFilter}
                filterable={this.renderColumnFilter()}
                minRows={resultCount === 0 ? 3 : 0}
                previousText={otherProps.previousText}
                nextText={otherProps.nextText}
                loadingText={otherProps.loadingText}
                noDataText={this.displayNoResultsFound(resultCount)}
                pageText={otherProps.pageText}
                ofText={otherProps.ofText}
                rowsText={otherProps.rowsText}
                showPaginationTop={otherProps.showPaginationTop}
                sortable={otherProps.isSortable}
                showPagination={false}
                getTrProps={(state, rowInfo, column, instance) => {
                  if (otherProps.getTrProps) {
                    return otherProps.getTrProps(state, rowInfo, column, instance);
                  }

                  return {
                    onClick: () => { // eslint-disable-line no-unused-vars
                      this.handleClick(rowInfo, column);
                    },
                    className: this.selectedRowsClassName(rowInfo)
                  };
                }}
                getTdProps={(state, rowInfo, column, instance) => {
                  if (otherProps.getTdProps) {
                    return otherProps.getTdProps(state, rowInfo, column, instance);
                  }

                  return {
                    onClick: () => {
                      this.handleCellClick(rowInfo, column);
                    }
                  };
                }}
                getTableProps={otherProps.getTableProps}
                getTrGroupProps={otherProps.getTrGroupProps}
                getTheadProps={otherProps.getTheadProps}
                getPaginationProps={otherProps.getPaginationProps}
                pages={otherProps.pages}
                onPageChange={otherProps.onPageChange}
                onPageSizeChange={otherProps.onPageSizeChange}
                page={otherProps.page}
                manual
              />
              <PaginationContainer>
                <Button
                  size="small"
                  onClick={loadPreviousPage}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeftIcon />
                  {i18next.t("admin.tags.tableText.previousText")}
                </Button>
                <Button
                  size="small"
                  onClick={loadNextPage}
                  disabled={!hasNextPage}
                >
                  {i18next.t("admin.tags.tableText.nextText")}
                  <ChevronRightIcon />
                </Button>
              </PaginationContainer>
            </TableContainer>
          );
        }}
      </Query>
    );
  }
}

/**
  * @name SortableTable propTypes
  * @type {propTypes}
  * @param {Object} props - React PropTypes
  * @property {Object} collection collection to get data from
  * @property {Array} columnMetadata provides filtered columns with i18n headers
  * @property {Number} defaultPageSize how many results per page
  * @property {Boolean} filterType filter by table, column, or both
  * @property {Array} filteredFields provides filtered columns, use columnMetadata instead
  * @property {Boolean} isFilterable show / hide column filter
  * @property {Boolean} isResizeable allow resizing of table columns
  * @property {Boolean} isSortable allow column sorting
  * @property {String} matchingResultsCount provides Count publication to get count from
  * @property {Number} minRows minimum amount of rows to display in table
  * @property {String} noDataMessage text to display when no data is available
  * @property {Function} onRowClick provides function / action when clicking on row
  * @property {object} query GraphQL query object
  * @property {Array} selectedRows provides selected rows in the table
  * @property {Function} transform transform of collection for grid results
  * @returns {Array} React propTypes
  */
TagDataTable.propTypes = {
  bulkActions: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  collection: PropTypes.object,
  columnMetadata: PropTypes.array,
  dataKey: PropTypes.string,
  defaultPageSize: PropTypes.number,
  filterType: PropTypes.string,
  filteredFields: PropTypes.array,
  isFilterable: PropTypes.bool,
  isResizeable: PropTypes.bool,
  isSortable: PropTypes.bool,
  matchingResultsCount: PropTypes.string,
  minRows: PropTypes.number,
  noDataMessage: PropTypes.string,
  onBulkAction: PropTypes.func,
  onBulkActionError: PropTypes.func,
  onBulkActionSuccess: PropTypes.func,
  onCellClick: PropTypes.func,
  onRowClick: PropTypes.func,
  publication: PropTypes.string,
  query: PropTypes.object,
  selectedRows: PropTypes.array,
  transform: PropTypes.func,
  variables: PropTypes.object
};

TagDataTable.defaultProps = {
  defaultPageSize: 10,
  filterType: "table",
  isFilterable: false,
  isResizeable: true,
  isSortable: true,
  minRows: 0,
  noDataMessage: "No results found",
  previousText: "Previous",
  nextText: "Next",
  loadingText: "Loading...",
  noDataText: "No results found",
  pageText: "Page",
  ofText: "of",
  rowsText: "rows",
  onBulkAction() { },
  onBulkActionError() { },
  onBulkActionSuccess() { },
  onCellClick() { }
  // noDataMessage: <Translation defaultValue="No results found" i18nKey={"reactionUI.components.sortableTable.tableText.noDataMessage"} />,
  // previousText: <Translation defaultValue="Previous" i18nKey={"reactionUI.components.sortableTable.tableText.previousText"} />,
  // nextText: <Translation defaultValue="Next" i18nKey={"reactionUI.components.sortableTable.tableText.nextText"} />,
  // loadingText: <Translation defaultValue="Loading..." i18nKey={"reactionUI.components.sortableTable.tableText.loadingText"} />,
  // noDataText: <Translation defaultValue="No results found" i18nKey={"reactionUI.components.sortableTable.tableText.noDataText"} />,
  // pageText: <Translation defaultValue="Page" i18nKey={"reactionUI.components.sortableTable.tableText.pageText"} />,
  // ofText: <Translation defaultValue="of" i18nKey={"reactionUI.components.sortableTable.tableText.ofText"} />,
  // rowsText: <Translation defaultValue="rows" i18nKey={"reactionUI.components.sortableTable.tableText.rowsText"} />
};

registerComponent("TagDataTable", TagDataTable);

export default TagDataTable;
