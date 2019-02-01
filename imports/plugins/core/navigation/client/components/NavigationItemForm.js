import React, { Component } from "react";
import PropTypes from "prop-types";
import { uniqueId } from "lodash";
import SimpleSchema from "simpl-schema";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import { Form } from "reacto-form";
import Link from "@reactioncommerce/components/Link/v1";
import Button from "@reactioncommerce/components/Button/v1";
import Checkbox from "@reactioncommerce/components/Checkbox/v1";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";
import iconTimes from "../../svg/iconTimes";


const Wrapper = styled.div`
  .close-icon-container {
    text-align: right;
  }
  .close-icon {
    display: inline-block;
    height: 12px;
    width: 12px;
  }
  .buttons-container {
    text-align: right;
    margin-top: 20px;

    .button-save {
      margin-left: 10px;
    }
  }
`;

const navigationItemFormSchema = new SimpleSchema({
  name: String,
  url: String,
  classNames: {
    type: String,
    optional: true
  },
  isUrlRelative: Boolean,
  shouldOpenInNewWindow: Boolean
});

const navigationItemValidator = navigationItemFormSchema.getFormValidator();

class NavigationItemForm extends Component {
  static propTypes = {
    createNavigationItem: PropTypes.func,
    mode: PropTypes.oneOf(["create", "edit"]),
    navigationItem: PropTypes.object,
    onCloseForm: PropTypes.func,
    updateNavigationItem: PropTypes.func
  }

  uniqueInstanceIdentifier = uniqueId("NavigationItemForm");

  handleFormValidate = (doc) => navigationItemValidator(navigationItemFormSchema.clean(doc));

  handleFormSubmit = (input) => {
    const { createNavigationItem, mode, navigationItem, onCloseForm, updateNavigationItem } = this.props;
    const { name, url, isUrlRelative, shouldOpenInNewWindow, classNames } = input;

    const navigationItemUpdate = {
      draftData: {
        content: {
          value: name,
          language: "en"
        },
        url,
        isUrlRelative,
        shouldOpenInNewWindow,
        classNames
      }
    };

    if (mode === "create") {
      createNavigationItem({
        variables: {
          input: {
            navigationItem: navigationItemUpdate
          }
        }
      });
    } else {
      updateNavigationItem({
        variables: {
          input: {
            _id: navigationItem._id,
            navigationItem: navigationItemUpdate
          }
        }
      });
    }
    return onCloseForm();
  }

  handleClickSave = () => {
    if (this.form) {
      this.form.submit();
    }
  }

  renderActionTitle() {
    const { mode } = this.props;
    if (mode === "create") {
      return <h4>Add Navigation Item</h4>;
    }
    return <h4>Edit Navigation Item</h4>;
  }

  render() {
    const { onCloseForm, navigationItem } = this.props;

    const nameInputId = `name_${this.uniqueInstanceIdentifier}`;
    const urlInputId = `url_${this.uniqueInstanceIdentifier}`;
    const classNamesInputId = `classNames_${this.uniqueInstanceIdentifier}`;

    navigationItemFormSchema.labels({
      name: i18next.t("navigationItem.displayName"),
      url: i18next.t("navigationItem.url"),
      isUrlRelative: i18next.t("navigationItem.isUrlRelative"),
      shouldOpenInNewWindow: i18next.t("navigationItem.shouldOpenInNewWindow"),
      classNames: i18next.t("navigationItem.classNames")
    });

    return (
      <Wrapper>
        <Grid container>
          <Grid item xs={8}>
            {this.renderActionTitle()}
          </Grid>
          <Grid item xs={4} className="close-icon-container">
            <Link onClick={onCloseForm}>
              <span className="close-icon">{iconTimes}</span>
            </Link>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Form ref={(formRef) => { this.form = formRef; }} onSubmit={this.handleFormSubmit} validator={this.handleFormValidate} value={navigationItem}>
              <Field name="name" label={i18next.t("navigationItem.displayName")} labelFor={nameInputId}>
                <TextInput id={nameInputId} name="name" />
                <ErrorsBlock names={["name"]} />
              </Field>
              <Field name="url" label={i18next.t("navigationItem.url")} labelFor={urlInputId}>
                <TextInput id={urlInputId} name="url" />
                <ErrorsBlock names={["url"]} />
              </Field>
              <Field name="isUrlRelative">
                <Checkbox name="isUrlRelative" label={i18next.t("navigationItem.isUrlRelative")} />
                <ErrorsBlock names={["isUrlRelative"]} />
              </Field>
              <Field name="shouldOpenInNewWindow">
                <Checkbox name="shouldOpenInNewWindow" label={i18next.t("navigationItem.shouldOpenInNewWindow")} />
                <ErrorsBlock names={["shouldOpenInNewWindow"]} />
              </Field>
              <Field name="classNames" label={i18next.t("navigationItem.classNames")} labelFor={classNamesInputId}>
                <TextInput id={classNamesInputId} name="classNames" />
                <ErrorsBlock names={["classNames"]} />
              </Field>
            </Form>
          </Grid>
        </Grid>
        <Grid>
          <Grid item xs={12} className="buttons-container">
            <Button actionType="secondary" onClick={onCloseForm}>{i18next.t("app.cancel")}</Button>
            <Button onClick={this.handleClickSave} className="button-save">{i18next.t("app.saveChanges")}</Button>
          </Grid>
        </Grid>
      </Wrapper>
    );
  }
}

export default NavigationItemForm;

