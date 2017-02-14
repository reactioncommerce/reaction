import React, { Component } from "react";
import { FieldGroup } from "/imports/plugins/core/ui/client/components";
import { Button } from "react-bootstrap";
// import { SmartForm } from "meteor/nova:forms";
// import { ExamplePayment } from "../../lib/collections/schemas";
// import { Cart, Shops } from "/lib/collections";

/* class ExampleCheckoutForm extends Component {
  render() {
    return (
      <SmartForm
        schema={ExamplePayment}
      />
    );
  }
}*/

class ExampleCheckoutForm extends Component {
  render() {
    return (
        <form>
          <FieldGroup
            label="Cardholder name"
            type="text"
          />
          <FieldGroup
            label="Cardholder number"
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
          />

          <div className="row">
            <div className="col-sm-12 col-lg-6 form-group">
              <FieldGroup
                label="Expiration Month"
                placeholder="Exp. Month"
                type="text"
              />
            </div>

            <div className="col-sm-12 col-lg-6 form-group">
              <FieldGroup
                label="Expiration Year"
                placeholder="Exp. year"
                type="text"
              />
            </div>
          </div>

          <div className="col-sm-12 col-lg-3 form-group">
            <FieldGroup
              label="CVV"
              placeholder="CVV"
              type="text"
            />
          </div>

          <div className="alert alert-danger hidden">Oh! Snap!</div>
          <Button type="submit"  bsStyle="primary" className="btn-lg btn-success btn-block btn-complete-order">
            <span id="btn-complete-order" data-i18n="checkoutPayment.completeYourOrder">Complete your order</span>
            <i className="fa fa-spinner fa-spin hidden" id="btn-processing"/>
          </Button>
        </form>
    );
  }
}

export default ExampleCheckoutForm;
