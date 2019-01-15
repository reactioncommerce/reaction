import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";
import { withRouter } from "react-router";
import { compose } from "recompose";
import { withApollo } from "react-apollo";
import { uniqueId } from "lodash";
import styled from "styled-components";
import Button from "@reactioncommerce/components/Button/v1";
import { i18next } from "/client/api";
import withOpaqueShopId from "/imports/plugins/core/graphql/lib/hocs/withOpaqueShopId";
import { tagListingQuery } from "../../lib/queries";
import { updateTagMutation, removeTagMutation } from "../../lib/mutations";

const ButtonBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px
`;

class TagSettings extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }),
    isLoadingShopId: PropTypes.bool,
    shopId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    this.bulkActions = [
      { value: "disable", label: i18next.t("admin.routing.disable") },
      { value: "enable", label: i18next.t("admin.routing.enable") },
      { value: "delete", label: i18next.t("admin.routing.delete") }
    ];

    this.tableRef = React.createRef();
  }

  state = {
    selection: [],
    selectedTag: null
  }

  formValue = null;

  uniqueInstanceIdentifier = uniqueId("URLRedirectEditForm");

  handleCellClick = ({ column, rowData }) => {
    if (column.id === "edit") {
      this.setState({
        selection: []
      });

      this.props.history.push(`/operator/tags/edit/${rowData._id}`);
    }
  }

  handleShowCreateForm = () => {
    this.props.history.push("/operator/tags/create");
  }

  handleBulkAction = async (action, itemIds) => {
    const { client, shopId } = this.props;
    let mutation = updateTagMutation;

    // Escape early if you don't have a valid action
    if (!["enable", "disable", "delete"].includes(action)) {
      return Promise.reject(`Invalid bulk action: ${action}`);
    }

    // Use the remove mutation for the delete action
    if (action === "delete") {
      mutation = removeTagMutation;
    }

    const promises = itemIds.map((item) => {
      let input = {
        id: item._id,
        shopId
      };

      // For enable / disable we need to supply the required fields for
      // the `UpdateTagInput`
      if (action === "enable" || action === "disable") {
        input = {
          ...input,
          isVisible: action === "enable",
          name: item.name,
          displayTitle: item.displayTitle
        };
      }

      return client.mutate({
        mutation,
        variables: {
          input
        }
      });
    });

    await Promise.all(promises);

    if (action === "delete") {
      this.tableRef.current.refetch();
    }
  }

  reset() {
    this.setState({
      selection: []
    });
  }


  renderTable() {
    const { shopId, isLoadingPrimaryShopId } = this.props;

    if (isLoadingPrimaryShopId) return null;

    const filteredFields = ["heroMediaUrl", "slug", "displayTitle", "name", "isVisible", "edit"];
    const noDataMessage = i18next.t("admin.tags.tableText.noDataMessage");

    // helper adds a class to every grid row
    const customRowMetaData = {
      bodyCssClassName: () => "email-grid-row"
    };

    // add i18n handling to headers
    const customColumnMetadata = [];
    filteredFields.forEach((field) => {
      let colWidth;
      let colStyle;
      let colClassName;
      let headerLabel = i18next.t(`admin.tags.headers.${field}`);

      if (field === "heroMediaUrl") {
        colWidth = 70;
        colClassName = "email-log-status";
        headerLabel = "";
      }

      if (field === "edit") {
        colWidth = 44;
        colStyle = { textAlign: "center", cursor: "pointer" };
        headerLabel = "";
      }

      if (field === "isVisible") {
        colWidth = 110;
        headerLabel = "";
      }

      // https://react-table.js.org/#/story/cell-renderers-custom-components
      const columnMeta = {
        accessor: field,
        Header: headerLabel,
        Cell: (row) => (
          <Components.TagDataTableColumn row={row} />
        ),
        className: colClassName,
        width: colWidth,
        style: colStyle,
        headerStyle: { textAlign: "left" }
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <Components.TagDataTable
        ref={this.tableRef}
        bulkActions={this.bulkActions}
        query={tagListingQuery}
        variables={{ shopId }}
        dataKey="tags"
        onBulkAction={this.handleBulkAction}
        onCellClick={this.handleCellClick}
        showFilter={true}
        rowMetadata={customRowMetaData}
        filteredFields={filteredFields}
        noDataMessage={noDataMessage}
        columnMetadata={customColumnMetadata}
        externalLoadingComponent={Components.Loading}
      />
    );
  }

  render() {
    return (
      <div>
        <ButtonBar>
          <Button onClick={this.handleShowCreateForm}>
            {i18next.t("admin.tags.form.createNewRule")}
          </Button>
        </ButtonBar>
        <Components.CardGroup>
          <Components.Card>
            <Components.CardBody>
              {this.renderTable()}
            </Components.CardBody>
          </Components.Card>
        </Components.CardGroup>
      </div>
    );
  }
}

registerComponent("TagSettings", TagSettings, [
  withApollo,
  withRouter,
  withOpaqueShopId
]);

export default compose(
  withApollo,
  withRouter,
  withOpaqueShopId
)(TagSettings);
