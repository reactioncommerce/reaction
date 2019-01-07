import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Mutation } from "react-apollo";
import { uniqueId } from "lodash";
import styled from "styled-components";
import { Form } from "reacto-form";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";

import { tagListingQuery } from "../../lib/queries";
import { addTagMutation, updateTagMutation, removeTagMutation } from "../../lib/mutations";

const Title = styled.h3`
  margin-bottom: 16px;
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

class TagForm extends Component {
  static propTypes = {
    isLoadingShopId: PropTypes.bool,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    shopId: PropTypes.string.isRequired,
    tag: PropTypes.object
  }

  static defaultProps = {
    tag: {}
  }

  formValue = null;

  uniqueInstanceIdentifier = uniqueId("URLRedirectEditForm");

  async handleSubmit(data, mutation) {
    const { shopId } = this.props;

    const input = {
      id: data._id,
      name: data.name,
      displayTitle: data.displayTitle,
      isVisible: data.isVisible || false,
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

        this.reset();
      }
    });
  }

  reset() {
    this.formValue = null;
  }

  handleCancel = () => {
    this.reset();
    this.props.onCancel();
  }

  handleSubmitForm = () => {
    this.form.submit();
    this.props.onSave();
  }

  handleFormChange = (value) => {
    this.formValue = value;
  }

  renderForm() {
    const { tag } = this.props;
    const nameInputId = `name_${this.uniqueInstanceIdentifier}`;
    const displayTitleInputId = `displayTitle_${this.uniqueInstanceIdentifier}`;
    const visibleInputId = `visible_${this.uniqueInstanceIdentifier}`;

    let title = i18next.t("admin.tags.form.formTitleNew");
    let mutation = addTagMutation;
    let submitButtonTitle = i18next.t("admin.tags.form.submitNew");

    const isNew = !!tag._id;

    if (tag._id) {
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
              value={tag}
            >
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
                helpText={i18next.t("admin.tags.form.displayTitleHelpText")}
                name="displayTitle"
                label={i18next.t("admin.tags.form.displayTitle")}
                labelFor={displayTitleInputId}
                isRequired
              >
                <TextInput id={displayTitleInputId} name="displayTitle" placeholder={i18next.t("admin.tags.form.displayTitlePlaceholder")} />
                <ErrorsBlock names={["displayTitle"]} />
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
                      onClick={() => this.handleRemove(tag._id, removeMutationFunc)}
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

  render() {
    return (
      <Components.CardGroup>
        <Components.Card>
          <Components.CardBody>
            {this.renderForm()}
          </Components.CardBody>
        </Components.Card>
      </Components.CardGroup>
    );
  }
}

export default TagForm;
