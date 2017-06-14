import React,  { Component } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import "react-table/react-table.css";
import _ from "lodash";


class SortableTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
      maxPages: 0,
      externalResultsPerPage: this.props.externalResultsPerPage,
      externalSortColumn: this.props.externalSortColumn,
      externalSortAscending: this.props.externalSortAscending,
      query: {}
    };
  }

  renderColumns() {
    const { columnMetadata, filteredFields } = this.props;

    return columnMetadata;
  }

  /**
   * Absorb publication information from props, output data from subscription
   * Use props to get collection, EmailTableColumn
   * Use that info to call meteor and get subscription
   * Output data for table
   * @returns {Object}
   */
  getMeteorData() {
    // Get a count of the number of items matching the current filter. If no filter is set it will return the total number
    // of items in the collection.
    const matchingResults = Counts.get(this.props.matchingResultsCount);

    const options = {};
    let skip;
    if (this.props.useExternal) {
      options.limit = this.state.externalResultsPerPage;
      if (!_.isEmpty(this.state.query) && !!matchingResults) {
        // if necessary, limit the cursor to number of matching results to avoid displaying results from other publications
        options.limit = _.min([options.limit, matchingResults]);
      }
      options.sort = {
        [this.state.externalSortColumn]: (this.state.externalSortAscending
          ? 1
          : -1)
      };
      skip = this.state.currentPage * this.state.externalResultsPerPage;
    }

    let pubHandle;

    if (this.props.subsManager) {
      pubHandle = this.props.subsManager.subscribe(this.props.publication, this.state.query, _.extend({
        skip: skip
      }, options));
    } else {
      pubHandle = Meteor.subscribe(this.props.publication, this.state.query, _.extend({
        skip: skip
      }, options));
    }

    // optional transform of collection for grid results
    let results = this.props.collection.find(this.state.query, options).fetch();
    if (this.props.transform) {
      results = this.props.transform(results);
    }

    return {
      loading: !pubHandle.ready(),
      results: results,
      matchingResults: matchingResults
    };
  }

  render() {
    const data = this.getMeteorData().results;
    const matchingResults = this.getMeteorData().matchingResults;

    console.log("render() - all props", this.props);
    console.log("render() - meteor data", data);
    console.log("render() - matchingResults", matchingResults);
    console.log("typeof", this.getMeteorData());

    // All available props: https://github.com/tannerlinsley/react-table#props
    return (
      <ReactTable
        data={data}
        columns={this.renderColumns()}
        filterable={true}
        getTdProps={(state, rowInfo, column, instance) => {
          return {
            onClick: e => {
// this.props.onRowClick({ props: { data: { _id: field, type: field } }})
              console.log('A Td Element was clicked!')
              console.log('it produced this event:', e)
              console.log('It was in this column:', column)
              console.log('It was in this row:', rowInfo)
              console.log('It was in this table instance:', instance)
              console.log('This is that state:', state)
            }
          }
        }}
        SubComponent={(row) => {
              return (
                <div style={{padding: '20px'}}>
                  <em>You can put any component you want here, even another React Table!</em>
                  <br />
                  <br />
                  <ReactTable
                    data={data}
                    columns={this.renderColumns()}
                    defaultPageSize={3}
                    showPagination={false}
                  />
                </div>
              )
            }}
      />
    );
  }
}

SortableTable.propTypes = {
  columnMetadata: PropTypes.array,
  filteredFields: PropTypes.array
};

SortableTable.defaultProps = {
};

export default SortableTable;


























// /*
// Forked from https://github.com/meteor-utilities/Meteor-Griddle
//  */
// import React,  { Component } from "react";
// import PropTypes from "prop-types";
// import _ from "lodash";
// import Griddle, { plugins, ColumnDefinition, RowDefinition } from "griddle-react";
// import { Counts } from "meteor/tmeasday:publish-counts";
// import { ReactMeteorData } from "meteor/react-meteor-data";
// import { Icon, Translation } from "/imports/plugins/core/ui/client/components";
// import { testData } from "./testData";
// import { i18next } from "/client/api";
//
//
// class CustomColumn extends Component {
//   handleClick = () => {
//     this.props.onClick && this.props.onClick({
//       data: {
//         _id: this.props.id
//       }
//     });
//   }
//
//   render() {
//     return (
//       <span onClick={this.handleClick}>{value}</span>
//     )
//   }
// }
//
// class SortableTable extends Component {
//   constructor(props) {
//     super(props);
//
//     this.state = {
//       currentPage: 0,
//       maxPages: 0,
//       externalResultsPerPage: this.props.externalResultsPerPage,
//       externalSortColumn: this.props.externalSortColumn,
//       externalSortAscending: this.props.externalSortAscending,
//       query: {}
//     };
//   }
//
//   componentWillMount() {
//     console.log("componentWillMount");
//     this.applyQuery = _.debounce((query) => {
//       this.setState({ query });
//     }, this.props.externalFilterDebounceWait);
//   }
//
//   componentDidMount() {
//     console.log("componentDidMount");
//   }
//
//   /**
//    * Get data from Meteor publication
//    */
//   getMeteorData() {
//     // Get a count of the number of items matching the current filter. If no filter is set it will return the total number
//     // of items in the collection.
//     const matchingResults = Counts.get(this.props.matchingResultsCount);
//
//     const options = {};
//     let skip;
//     if (this.props.useExternal) {
//       options.limit = this.state.externalResultsPerPage;
//       if (!_.isEmpty(this.state.query) && !!matchingResults) {
//         // if necessary, limit the cursor to number of matching results to avoid displaying results from other publications
//         options.limit = _.min([options.limit, matchingResults]);
//       }
//       options.sort = {
//         [this.state.externalSortColumn]: (this.state.externalSortAscending
//           ? 1
//           : -1)
//       };
//       skip = this.state.currentPage * this.state.externalResultsPerPage;
//     }
//
//     let pubHandle;
//
//     if (this.props.subsManager) {
//       pubHandle = this.props.subsManager.subscribe(this.props.publication, this.state.query, _.extend({
//         skip: skip
//       }, options));
//     } else {
//       pubHandle = Meteor.subscribe(this.props.publication, this.state.query, _.extend({
//         skip: skip
//       }, options));
//     }
//
//     // optional transform of collection for grid results
//     let results = this.props.collection.find(this.state.query, options).fetch();
//     if (this.props.transform) {
//       results = this.props.transform(results);
//     }
//
//     return {
//       loading: !pubHandle.ready(),
//       results: results,
//       matchingResults: matchingResults
//     };
//   }
//
//   styleConfig() {
//     // Override Griddle's default styles.
//     // See http://griddlegriddle.github.io/Griddle/docs/styles/ for available classNames
//
//     const styleConfig = {
//       icons: {
//         TableHeadingCell: {
//           sortDescendingIcon: <small><Icon icon="fa fa-caret-down" /></small>,
//           sortAscendingIcon: <small><Icon icon="fa fa-caret-up" /></small>
//         }
//       },
//       classNames: {
//         Filter: "griddle-filter form-control",
//         Pagination: "griddle-pagination heyPage",
//         Row: "griddle-row row-class",
//         Table: "griddle-table table"
//       },
//       styles: {}
//     };
//
//     return styleConfig;
//   }
//
//   resetQuery() {
//     this.setState({ query: {} });
//   }
//
//   // what page is currently viewed
//   setPage(index) {
//     this.setState({ currentPage: index });
//   }
//
//   // this changes whether data is sorted in ascending or descending order
//   changeSort(sort, sortAscending) {
//     this.setState({ externalSortColumn: sort, externalSortAscending: sortAscending });
//   }
//
//   setFilter(filter) {
//     if (filter) {
//       const filteredFields = this.props.filteredFields || this.props.columns;
//       const orArray = filteredFields.map((field) => {
//         const filterItem = {};
//         filterItem[field] = {
//           $regex: filter,
//           $options: "i"
//         };
//         return filterItem;
//       });
//       this.applyQuery({ $or: orArray });
//     } else {
//       this.resetQuery();
//     }
//   }
//
//   // this method handles determining the page size
//   setPageSize(size) {
//     this.setState({ externalResultsPerPage: size });
//   }
//
//
//
//
//
//
//   filteredFields() {
//     const { filteredFields } = this.props;
//
//
//     console.log("all props", this.props);
//     return filteredFields.map((field, i) => {
//
//       const CustomColumn = ({value}) => <span onClick={() => (this.props.onRowClick({ props: { data: { _id: field, type: field } }}) )}>{value}</span>;
//
//       return (
//         <ColumnDefinition key={i} id={field} title={field}
//           customComponent={CustomColumn}
//         />
//       );
//     });
//   }
//
//   onTheClick = () => {
//     console.log("heyyyyyy i've been clicked son");
//     return this.props.onRowClick();
//   }
//
//   render() {
//     // The Griddle externalIsLoading property is managed internally to line up with the subscription ready state, so we're
//     // removing this property if it's passed in.
//     const allProps = this.props;
//     delete allProps.externalIsLoading;
//
//     const { filteredFields } = this.props;
//     const tableData = this.getMeteorData().results;
//
//     return (
//       <Griddle
//         data={tableData}
//         plugins={[plugins.LocalPlugin]}
//
//         styleConfig={this.styleConfig()}
//         {...allProps}
//
//
//         tableClassName="table"
//
//         columnMetadata={this.props.columnMetadata}
//         externalSetPage={this.setPage}
//         externalChangeSort={this.changeSort}
//         externalSetFilter={this.setFilter}
//         externalSetPageSize={this.setPageSize}
//         externalMaxPage={this.state.maxPages}
//         externalCurrentPage={this.state.currentPage}
//         resultsPerPage={this.state.externalResultsPerPage}
//         externalSortColumn={this.state.externalSortColumn}
//         externalSortAscending={this.state.externalSortAscending}
//         externalIsLoading={this.getMeteorData().loading}
//
//       >
//       <RowDefinition onClick={this.onTheClick}>
//         {this.filteredFields()}
//       </RowDefinition>
//     </Griddle>
//     );
//   }
// }
//
// SortableTable.propTypes = {
//   collection: PropTypes.object, // the collection to display
//   filteredFields: PropTypes.array, // an array of fields to search through when filtering
//   matchingResultsCount: PropTypes.string, // the name of the matching results counter
//   publication: PropTypes.string, // the publication that will provide the data
//   subsManager: PropTypes.object, // subsManager sub
//   transform: PropTypes.func // external function to filter result source
// };
//
// SortableTable.defaultProps = {
//   useExternal: false,
//   externalFilterDebounceWait: 300,
//   externalResultsPerPage: 10,
//   query: {}
// };
//
// export default SortableTable;
//
//
//
//
//
//
//
//
//



































// /*
// Forked from https://github.com/meteor-utilities/Meteor-Griddle
//  */
// import React,  { Component } from "react";
// import PropTypes from "prop-types";
// import _ from "lodash";
// import Griddle, { plugins } from "griddle-react";
// import { Counts } from "meteor/tmeasday:publish-counts";
// import { ReactMeteorData } from "meteor/react-meteor-data";
// import { Icon } from "/imports/plugins/core/ui/client/components";
// import { testData } from "./testData";
//
// const SortableTable = React.createClass({
//   propTypes: {
//     collection: React.PropTypes.object, // the collection to display
//     filteredFields: React.PropTypes.array, // an array of fields to search through when filtering
//     matchingResultsCount: React.PropTypes.string, // the name of the matching results counter
//     publication: React.PropTypes.string, // the publication that will provide the data
//     subsManager: React.PropTypes.object, // subsManager sub
//     transform: React.PropTypes.func // external function to filter result source
//   },
//   mixins: [ReactMeteorData],
//
//   getDefaultProps() {
//     return { useExternal: false, externalFilterDebounceWait: 300, externalResultsPerPage: 10, query: {} };
//   },
//
//   getInitialState() {
//     return {
//       currentPage: 0,
//       maxPages: 0,
//       externalResultsPerPage: this.props.externalResultsPerPage,
//       externalSortColumn: this.props.externalSortColumn,
//       externalSortAscending: this.props.externalSortAscending,
//       query: {}
//     };
//   },
//
//   componentWillMount() {
//     this.applyQuery = _.debounce((query) => {
//       this.setState({ query });
//     }, this.props.externalFilterDebounceWait);
//   },
//
//   getMeteorData() {
//     // Get a count of the number of items matching the current filter. If no filter is set it will return the total number
//     // of items in the collection.
//     const matchingResults = Counts.get(this.props.matchingResultsCount);
//
//     const options = {};
//     let skip;
//     if (this.props.useExternal) {
//       options.limit = this.state.externalResultsPerPage;
//       if (!_.isEmpty(this.state.query) && !!matchingResults) {
//         // if necessary, limit the cursor to number of matching results to avoid displaying results from other publications
//         options.limit = _.min([options.limit, matchingResults]);
//       }
//       options.sort = {
//         [this.state.externalSortColumn]: (this.state.externalSortAscending
//           ? 1
//           : -1)
//       };
//       skip = this.state.currentPage * this.state.externalResultsPerPage;
//     }
//
//     let pubHandle;
//
//     if (this.props.subsManager) {
//       pubHandle = this.props.subsManager.subscribe(this.props.publication, this.state.query, _.extend({
//         skip: skip
//       }, options));
//     } else {
//       pubHandle = Meteor.subscribe(this.props.publication, this.state.query, _.extend({
//         skip: skip
//       }, options));
//     }
//
//     // optional transform of collection for grid results
//     let results = this.props.collection.find(this.state.query, options).fetch();
//     if (this.props.transform) {
//       results = this.props.transform(results);
//     }
//
//     return {
//       loading: !pubHandle.ready(),
//       results: results,
//       matchingResults: matchingResults
//     };
//   },
//
//   resetQuery() {
//     this.setState({ query: {} });
//   },
//
//   // what page is currently viewed
//   setPage(index) {
//     this.setState({ currentPage: index });
//   },
//
//   // this changes whether data is sorted in ascending or descending order
//   changeSort(sort, sortAscending) {
//     this.setState({ externalSortColumn: sort, externalSortAscending: sortAscending });
//   },
//
//   setFilter(filter) {
//     if (filter) {
//       const filteredFields = this.props.filteredFields || this.props.columns;
//       const orArray = filteredFields.map((field) => {
//         const filterItem = {};
//         filterItem[field] = {
//           $regex: filter,
//           $options: "i"
//         };
//         return filterItem;
//       });
//       this.applyQuery({ $or: orArray });
//     } else {
//       this.resetQuery();
//     }
//   },
//
//   // this method handles determining the page size
//   setPageSize(size) {
//     this.setState({ externalResultsPerPage: size });
//   },
//
//   render() {
//     // figure out how many pages we have based on the number of total results matching the cursor
//     const maxPages = Math.ceil(this.data.matchingResults / this.state.externalResultsPerPage);
//
//     // The Griddle externalIsLoading property is managed internally to line up with the subscription ready state, so we're
//     // removing this property if it's passed in.
//     const allProps = this.props;
//     delete allProps.externalIsLoading;
//
//
//
//
//
//
//
//
//
//
//     // Default Griddle classNames
// //     Cell: 'griddle-cell',
// // Filter: 'griddle-filter',
// // Loading: 'griddle-loadingResults',
// // NextButton: 'griddle-next-button',
// // NoResults: 'griddle-noResults',
// // PageDropdown: 'griddle-page-select',
// // Pagination: 'griddle-pagination',
// // PreviousButton: 'griddle-previous-button',
// // Row: 'griddle-row',
// // RowDefinition: 'griddle-row-definition',
// // Settings: 'griddle-settings',
// // SettingsToggle: 'griddle-settings-toggle',
// // Table: 'griddle-table',
// // TableBody: 'griddle-table-body',
// // TableHeading: 'griddle-table-heading',
// // TableHeadingCell: 'griddle-table-heading-cell',
// // TableHeadingCellAscending: 'griddle-heading-ascending',
// // TableHeadingCellDescending: 'griddle-heading-descending',
//
// const styleConfig = {
//   icons: {
//     TableHeadingCell: {
//       sortDescendingIcon: <small><Icon icon="fa fa-caret-down" /></small>,
//       sortAscendingIcon: <small><Icon icon="fa fa-caret-up" /></small>,
//     },
//   },
//   classNames: {
//     Filter: "griddle-filter form-control",
//     Pagination: 'griddle-pagination heyPage',
//     Row: "griddle-row row-class",
//     Table: "griddle-table table"
//   },
//   styles: {}
// };
//
//     return (
//       <Griddle
//         data={testData}
//         plugins={[plugins.LocalPlugin]}
//         styleConfig={styleConfig}
//         {...allProps}
//         tableClassName="table"
//         results={testData}
//         columnMetadata={this.props.columnMetadata}
//         externalSetPage={this.setPage}
//         externalChangeSort={this.changeSort}
//         externalSetFilter={this.setFilter}
//         externalSetPageSize={this.setPageSize}
//         externalMaxPage={maxPages}
//         externalCurrentPage={this.state.currentPage}
//         resultsPerPage={this.state.externalResultsPerPage}
//         externalSortColumn={this.state.externalSortColumn}
//         externalSortAscending={this.state.externalSortAscending}
//         externalIsLoading={this.data.loading}
//       />
//     );
//   }
// });
//
// export default SortableTable;
