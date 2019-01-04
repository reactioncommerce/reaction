import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";
import { compose } from "recompose";
import { Mutation, withApollo } from "react-apollo";
import { uniqueId } from "lodash";
import styled from "styled-components";
import { Form } from "reacto-form";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";
import withOpaqueShopId from "/imports/plugins/core/graphql/lib/hocs/withOpaqueShopId";
import { tagListingQuery } from "../../lib/queries";
import { addTagMutation, updateTagMutation, removeTagMutation } from "../../lib/mutations";

const Title = styled.h3`
  margin-bottom: 16px;
`;

const ButtonBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const FormAction = styled.div`
  padding-left: 16px;
`;

const PaddedField = styled(Field)`
  margin-bottom: 20px;
`;

class TagSettings extends Component {
  static propTypes = {
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
        selection: [],
        selectedTag: rowData
      });
    }
  }

  async handleSubmit(data, mutation) {
    const { shopId } = this.props;

    const input = {
      id: data._id,
      to: data.to,
      from: data.from,
      status: data.status,
      type: data.type,
      enabled: !!data.enabled,
      shopId
    };

    const result = await mutation({
      refetchQueries: [{
        query: tagListingQuery,
        variables: {
          shopId
        }
      }],
      variables: {
        input
      }
    });

    // If a rule was added, then refech the first page of rules
    if (!data._id) {
      this.tableRef.current.refetchFirstPage();
    }

    this.reset();

    return result;
  }

  handleRemove(id, mutation) {
    Alerts.alert({
      title: i18next.t("admin.routing.form.deleteConfirm"),
      type: "warning",
      showCancelButton: true
    }, async (isConfirm) => {
      if (isConfirm) {
        const { shopId } = this.props;

        await mutation({
          variables: {
            input: {
              id,
              shopId
            }
          }
        });

        this.tableRef.current.refetch();

        this.reset();
      }
    });
  }

  handleShowCreateForm = () => {
    this.setState({
      selectedTag: {}
    });
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
          enabled: action === "enable",
          to: item.to,
          from: item.from,
          type: item.type,
          status: item.type === "redirect" ? item.status : null
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
    this.formValue = null;
    this.setState({
      selection: [],
      selectedTag: null
    });
  }

  handleCancel = () => {
    this.reset();
  }

  handleSubmitForm = () => {
    this.form.submit();
  }

  handleFormChange = (value) => {
    this.formValue = value;
  }

  handleTypeSelectChange = (value) => {
    this.setState(({ selectedTag }) => ({
      selectedTag: {
        ...selectedTag,
        ...this.formValue,
        type: value,
        status: value === "redirect" ? this.httpStatusCodes[0].value : undefined
      }
    }));
  }

  renderForm() {
    const { selectedTag } = this.state;
    const nameInputId = `name_${this.uniqueInstanceIdentifier}`;
    const displayTitleInputId = `displayTitle_${this.uniqueInstanceIdentifier}`;
    const visibleInputId = `visible_${this.uniqueInstanceIdentifier}`;

    let title = i18next.t("admin.tags.form.formTitleNew");
    let mutation = addTagMutation;
    let submitButtonTitle = i18next.t("admin.tags.form.submitNew");

    if (selectedTag) {
      const isNew = !!selectedTag._id;

      if (selectedTag._id) {
        title = i18next.t("admin.tags.form.formTitleUpdate");
        mutation = updateTagMutation;
        submitButtonTitle = i18next.t("admin.tags.form.submitUpdate");
      }

      return (
        <Mutation mutation={mutation}>
          {(mutationFunc) => (
            <Fragment>
              <Title>{title}</Title>
              <Form
                ref={(formRef) => { this.form = formRef; }}
                onChange={this.handleFormChange}
                onSubmit={(data) => this.handleSubmit(data, mutationFunc)}
                value={selectedTag}
              >
                <PaddedField
                  helpText={i18next.t("admin.tags.form.displayTitleHelpText")}
                  name="displayTitle"
                  label={i18next.t("admin.tags.form.displayTitle")}
                  labelFor={displayTitleInputId}
                  isRequired
                >
                  <TextInput id={displayTitleInputId} name="displayTitle" placeholder="URL" />
                  <ErrorsBlock names={["displayTitle"]} />
                </PaddedField>

                <PaddedField
                  helpText={i18next.t("admin.tags.form.nameHelpText")}
                  name="name"
                  label={i18next.t("admin.tags.form.name")}
                  labelFor={nameInputId}
                  isRequired
                >
                  <TextInput id={nameInputId} name="name" placeholder="i.e. womens-shoes" />
                  <ErrorsBlock names={["name"]} />
                </PaddedField>

                <PaddedField
                  name="visible"
                  labelFor={visibleInputId}
                >
                  <Checkbox
                    id={visibleInputId}
                    name="visible"
                    label={i18next.t("admin.tags.visible")}
                  />
                </PaddedField>
              </Form>
              <FormActions>
                {isNew &&
                  <Mutation mutation={removeTagMutation}>
                    {(removeMutationFunc) => (
                      <Button
                        actionType="secondary"
                        isTextOnly={true}
                        onClick={() => this.handleRemove(selectedTag._id, removeMutationFunc)}
                      >
                        {i18next.t("admin.tags.form.delete")}
                      </Button>
                    )}
                  </Mutation>
                }
                <FormAction>
                  <Button actionType="secondary" onClick={this.handleCancel}>
                    {i18next.t("admin.tags.form.cancel")}
                  </Button>
                </FormAction>
                <FormAction>
                  <Button onClick={this.handleSubmitForm}>
                    {submitButtonTitle}
                  </Button>
                </FormAction>
              </FormActions>
              <Components.Divider />
            </Fragment>
          )}
        </Mutation>
      );
    }

    return (
      <ButtonBar>
        <Button onClick={this.handleShowCreateForm}>
          {i18next.t("admin.tags.form.createNewRule")}
        </Button>
      </ButtonBar>
    );
  }

  renderTable() {
    const { shopId, isLoadingPrimaryShopId } = this.props;

    if (isLoadingPrimaryShopId) return null;

    const filteredFields = ["heroImageUrl", "slug", "displayTitle", "name", "isVisible", "edit"];
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

      if (field === "heroImageUrl") {
        colWidth = 120;
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
      <Components.CardGroup>
        <Components.Card>
          <Components.CardBody>
            {this.renderForm()}
            {this.renderTable()}
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

registerComponent("TagSettings", TagSettings, [
  withApollo,
  withOpaqueShopId
]);

export default compose(
  withApollo,
  withOpaqueShopId
)(TagSettings);
