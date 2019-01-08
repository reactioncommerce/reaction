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
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import MUICardActions from "@material-ui/core/CardActions";
import { i18next } from "/client/api";

import { tagListingQuery } from "../../lib/queries";
import { addTagMutation, updateTagMutation, removeTagMutation } from "../../lib/mutations";

const Title = styled.h3`
  margin-bottom: 16px;
`;

const CardActions = styled(MUICardActions)`
  justify-content: flex-end;
`;

const PaddedField = styled(Field)`
  margin-bottom: 20px;
`;

const ContentGroup = styled.div`
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

  state = {
    currentTab: 0
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

  handleTabChange = (event, value) => {
    this.setState({ currentTab: value });
  };

  render() {
    const { tag } = this.props;
    const { currentTab } = this.state;
    const nameInputId = `name_${this.uniqueInstanceIdentifier}`;
    const displayTitleInputId = `displayTitle_${this.uniqueInstanceIdentifier}`;
    const isVisibleInputId = `isVisible_${this.uniqueInstanceIdentifier}`;

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
              <ContentGroup>
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
              </ContentGroup>

              <ContentGroup>
                <Tabs value={currentTab} onChange={this.handleTabChange}>
                  <Tab label={i18next.t("admin.tags.form.tagListingPage")} />
                  <Tab label={i18next.t("admin.tags.form.metadata")} />
                  <Tab label={i18next.t("admin.tags.form.productOrdering")} />
                </Tabs>
                <Components.Divider />
              </ContentGroup>

              <Card>
                <CardContent>
                  {currentTab === 0 &&
                    <Fragment>
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
                        name="isVisible"
                        labelFor={isVisibleInputId}
                      >
                        <Checkbox
                          id={isVisibleInputId}
                          name="isVisible"
                          label={i18next.t("admin.tags.form.isVisible")}
                        />
                      </PaddedField>
                    </Fragment>
                  }

                  {currentTab === 1 &&
                    <div>
                      tab 2
                    </div>
                  }

                  {currentTab === 3 &&
                    <div>
                      tab 3
                    </div>
                  }
                </CardContent>
              </Card>
            </Form>
          </Fragment>
        )}
      </Mutation>
    );
  }
}

export default TagForm;
