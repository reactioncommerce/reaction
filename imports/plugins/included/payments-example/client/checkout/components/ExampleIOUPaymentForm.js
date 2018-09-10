import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "reacto-form";
import { uniqueId } from "lodash";
import ErrorsBlock from "@reactioncommerce/components/ErrorsBlock/v1";
import Field from "@reactioncommerce/components/Field/v1";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import { i18next } from "/client/api";

const SUBMIT_LABEL = "Complete your order";
const SUBMITTING_LABEL = "Submitting...";
const RESUBMIT_LABEL = "Resubmit payment";

export default class ExampleIOUPaymentForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func
  }

  state = {
    submitLabel: SUBMIT_LABEL,
    submitting: false
  }

  uniqueInstanceIdentifier = uniqueId("ExampleIOUPaymentForm");

  handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.form.submit();
  };

  handleSubmit = async (paymentObj) => {
    const { onSubmit } = this.props;

    this.setState({
      isSubmitting: true,
      submitLabel: SUBMITTING_LABEL
    });

    return onSubmit(paymentObj)
      .then((result) => {
        this.setState({
          isSubmitting: false,
          submitLabel: SUBMIT_LABEL
        });
        return result;
      })
      .catch((error) => {
        this.setState({
          isSubmitting: false,
          errorMessage: error.message || "Something went wrong. Please try again.",
          submitLabel: RESUBMIT_LABEL
        });
      });
  }

  renderErrorMessage() {
    const { errorMessage } = this.state;
    if (errorMessage) {
      return (<div className="alert alert-danger">{errorMessage}</div>);
    }
    return null;
  }

  render() {
    const { isSubmitting, submitLabel } = this.state;

    const fullNameInputId = `fullName_${this.uniqueInstanceIdentifier}`;

    return (
      <div>
        <Form ref={(formRef) => { this.form = formRef; }} onSubmit={this.handleSubmit}>
          <Field name="fullName" label={i18next.t("address.fullName")} labelFor={fullNameInputId}>
            <TextInput id={fullNameInputId} name="fullName" />
            <ErrorsBlock names={["fullName"]} />
          </Field>
        </Form>
        <div className="row">
          <div className="col-md-12">
            {this.renderErrorMessage()}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button className="rui btn btn-lg btn-cta btn-block btn-complete-order" disabled={isSubmitting} onClick={this.handleClick}>
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
