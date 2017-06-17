import React,  { Component } from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import _ from "lodash";
import { IconButton } from "/imports/plugins/core/ui/client/components";


// class NextIcon extends Component {
//   constructor(props) {
//     super(props);
//   }
//   render() {
//     return (
//       <IconButton
//         bezelStyle={"flat"}
//         icon="fa fa-arrow-right"
//         {...this.props}
//       />
//     );
//   }
// }
//
// class PrevIcon extends Component {
//   constructor(props) {
//     super(props);
//   }
//   render() {
//     return (
//       <IconButton
//         bezelStyle={"flat"}
//         icon="fa fa-arrow-left"
//         {...this.props}
//       />
//     );
//   }
// }
//
// class MyTrComponent extends React.Component {
// 	constructor () {
// 		super()
// 		this.state = {
// 			background: null
// 		}
// 	}
// 	render () {
// 		const {children, className, style, ...rest} = this.props
// 		console.log(rest)
// 		return (
// 			<div
// 				className={'rt-tr ' + className}
// 				style={{
// 					...style,
// 					...this.state
// 				}}
// 				{...rest}</div>
// 				onMouseEnter={() => this.setState({
// 					background: 'yellow'
// 				})}
// 				onMouseLeave={() => this.setState({
// 					background: null
// 				})}
// 			>
// 				{children}
// 			</div>
// 		)
// 	}
// }




class SortableTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
      maxPages: 0,
      // externalResultsPerPage: this.props.externalResultsPerPage,
      // externalSortColumn: this.props.externalSortColumn,
      // externalSortAscending: this.props.externalSortAscending,
      query: {}
    };
  }

  renderColumns() {
    const { columnMetadata, filteredFields } = this.props;

    console.log("columnMetadata", columnMetadata);


    // Add minWidth data to columns
    const displayColumns = columnMetadata.map((element) => {
      return _.extend({}, element, {
        minWidth: undefined
      });
    });

    console.log("displayColumns", displayColumns);

    return displayColumns;
  }














  /**
   * getMeteorData() - Absorb publication information from props, output data from subscription
   * @prop {String} matchingResultsCount - Send to Counts collection to get results count of sub
   * Use props to get collection, EmailTableColumn
   * Use that info to call meteor and get subscription
   * Output data for table
   * @returns {Object} loading status (bool), results (object), and matchingResults (number)
   */
  getMeteorData() {
    const { matchingResultsCount } = this.props;

    // Get a count of the number of items matching the current filter.
    // If no filter is set it will return the total number of items in the collection.
    const matchingResults = Counts.get(matchingResultsCount);

    const options = {};
    let skip;
    // if (this.props.useExternal) {
    //   options.limit = this.state.externalResultsPerPage;
    //   if (!_.isEmpty(this.state.query) && !!matchingResults) {
    //     // if necessary, limit the cursor to number of matching results to avoid displaying results from other publications
    //     options.limit = _.min([options.limit, matchingResults]);
    //   }
    //   options.sort = {
    //     [this.state.externalSortColumn]: (this.state.externalSortAscending
    //       ? 1
    //       : -1)
    //   };
    //   skip = this.state.currentPage * this.state.externalResultsPerPage;
    // }

    let pubHandle;

    // if (this.props.subsManager) {
    //   pubHandle = this.props.subsManager.subscribe(this.props.publication, this.state.query, _.extend({
    //     skip: skip
    //   }, options));
    // } else {
      pubHandle = Meteor.subscribe(this.props.publication, this.state.query, _.extend({
        skip: skip
      }, options));
    // }

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





  // Custom components

  prevIcon() {
    return <PrevIcon />
  }
  nextIcon() {
    return <NextIcon />
  }

  // /Custom components


  /**
   * filter() - Replace default filter with customized filter
   * custom filter is case insensitive
   * custom filter searches entire string, not just from string start
   */
  customFilter = (filter, row) => {
    const id = filter.pivotId || filter.id;
    if (row[id] !== null && typeof row[id] === "string") {
      return (row[id] !== undefined
        ? String(row[id].toLowerCase()).includes(filter.value.toLowerCase())
        : true);
    }
  }

  render() {
    const { onRowClick, ...otherProps } = this.props;
    const data = this.getMeteorData().results;
    const matchingResults = this.getMeteorData().matchingResults;

    // All available props: https://github.com/tannerlinsley/react-table#props
    return (
      <ReactTable
        className={"-striped -highlight"}
        columns={this.renderColumns()}
        data={data}
        defaultFilterMethod={this.customFilter}
        filterable={otherProps.isFilterable}
        minRows={otherProps.minRows}


        getTrProps={(state, rowInfo, column, instance) => {
          return {
            onClick: e => {
              onRowClick({
                className: "holy-cow-party",
                props: {
                  data: {
                    _id: rowInfo.original._id,
                    type: rowInfo.original.type
                  }
                }
              });
            }
          }
        }}
      />
    );
  }
}

SortableTable.propTypes = {
  /** @type {array} columnMetadata provides filtered columns with i18n headers */
  columnMetadata: PropTypes.array,
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
  onRowClick: PropTypes.function
};

SortableTable.defaultProps = {
  isFilterable: true,
  isResizeable: true,
  isSortable: true,
  minRows: 0
};

export default SortableTable;
