import React, { Component } from "react";

class CheckoutForm extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="form-group">
            <label className="control-label">Cardholder name</label>
            <input
              type="text"
            />
          </div>

          <div className="form-group">
            <label className="control-label">Card number</label>
            <input
              type="text"
              placeholder="XXXX XXXX XXXX XXXX"
            />
          </div>
        </div>
          <div className="row">
            <div className="col-sm-12 col-lg-6 form-group">
              <label className="control-label">Expiration month</label>
              <input
                type="text"
                placeholder="Exp. Month"
              />
            </div>

            <div className="col-sm-12 col-lg-6 form-group">
              <label className="control-label">Expiration year</label>
              <input
                type="text"
                placeholder="Exp. Year"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12 col-lg-3 form-group">
              <label className="control-label">CVV</label>
              <input
                type="text"
                placeholder="CVV"
              />
            </div>
          </div>

          <div className="alert alert-danger hidden">Oh! Snap!</div>
          <button type="submit" className="rui btn btn-lg btn-cta btn-block btn-complete-order">
            <span id="btn-complete-order">Complete your order</span>
            <i className="fa fa-spinner fa-spin hidden" id="btn-processing"/>
          </button>
      </div>
    );
  }
}

export default CheckoutForm;
