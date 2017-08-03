import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatPriceString } from "/client/api";
import { Translation, CardGroup, Card, CardBody, CardHeader } from "/imports/plugins/core/ui/client/components";
import DiscountList from "/imports/plugins/core/discounts/client/components/list";
import LineItems from "./lineItems";
import InvoiceActions from "./invoiceActions";

class Invoice extends Component {
  static propTypes = {
    canMakeAdjustments: PropTypes.bool,
    collection: PropTypes.string,
    dateFormat: PropTypes.func,
    discounts: PropTypes.bool,
    handleClick: PropTypes.func,
    invoice: PropTypes.object,
    isFetching: PropTypes.bool,
    isOpen: PropTypes.bool,
    orderId: PropTypes.string,
    paymentCaptured: PropTypes.bool,
    refunds: PropTypes.array
  }

  renderDiscountForm() {
    const { isOpen, orderId, collection } = this.props;

    return (
      <div>
        {isOpen &&
          <div>
            <hr/>
            <DiscountList
              id={orderId}
              collection={collection}
              validatedInput={true}
            />
            <hr/>
          </div>
        }
      </div>
    );
  }

  renderRefundsInfo() {
    const { isFetching, refunds, dateFormat } = this.props;

    return (
      <div>
        {isFetching &&
          <div className="form-group order-summary-form-group">
            <strong>Loading Refunds</strong>
            <div className="invoice-details">
              <i className="fa fa-spinner fa-spin" />
            </div>
          </div>
        }

        {refunds && refunds.map((refund) => (
          <div className="order-summary-form-group text-danger" key={refund.created} style={{ marginBottom: 15 }}>
            <strong>Refunded on: {dateFormat(refund.created, "MM/D/YYYY")}</strong>
            <div className="invoice-details"><strong>{formatPriceString(refund.amount)}</strong></div>
          </div>
        ))}
      </div>
    );
  }

  renderTotal() {
    const { invoice } = this.props;

    return (
      <div className="order-summary-form-group">
        <hr/>
        <strong>TOTAL</strong>
        <div className="invoice-details">
          <strong>{formatPriceString(invoice.total)}</strong>
        </div>
      </div>
    );
  }

  renderConditionalDisplay() {
    const { canMakeAdjustments, paymentCaptured } = this.props;

    return (
      <div>
        {canMakeAdjustments ?
          <div> {this.renderTotal()} </div> :
          <span>
            {paymentCaptured ?
              <div>
                {this.renderRefundsInfo()}
              </div>
              :
              <div> {this.renderTotal()} </div>
            }
          </span>
        }
      </div>
    );
  }

  renderInvoice() {
    const { invoice, discounts, handleClick } = this.props;

    return (
      <div>
        <div className="order-summary-form-group">
          <strong>Quantity Total</strong>
          <div className="invoice-details">
            {invoice.totalItems}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Subtotal" i18nKey="cartSubTotals.subtotal"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.subtotal)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Shipping" i18nKey="cartSubTotals.shipping"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.shipping)}
          </div>
        </div>

        <div className="order-summary-form-group">
          <strong><Translation defaultValue="Tax" i18nKey="cartSubTotals.tax"/></strong>
          <div className="invoice-details">
            {formatPriceString(invoice.taxes)}
          </div>
        </div>

        {discounts &&
          <div>
            <div className="order-summary-form-group">
              <strong><Translation defaultValue="Discount" i18nKey="cartSubTotals.discount"/></strong>
              <div className="invoice-details">
                <i className="fa fa-tag fa-lg" style={{ marginRight: 2 }}/>
                <a className="btn-link" onClick={handleClick}>Add Discount</a>
              </div>
            </div>
            {this.renderDiscountForm()}
          </div>
        }
        {this.renderConditionalDisplay()}
      </div>
    )
  }

  render() {
    return (
      <CardGroup>
        <Card
          expanded={true}
        >
          <CardHeader
            actAsExpander={false}
            i18nKeyTitle="admin.orderWorkflow.invoice.cardTitle"
            title="Invoice"
          />
          <CardBody expandable={false}>
            <LineItems
              onClose={this.props.handleClose}
              handleSelectAllItems={this.props.handleSelectAllItems}
              selectAllItems={this.props.selectAllItems}
              selectedItems={this.props.selectedItems}
              togglePopOver={this.props.togglePopOver}
              inputOnChange={this.props.inputOnChange}
              handleItemSelect={this.props.handleItemSelect}
              popOverIsOpen={this.props.popOverIsOpen}
              displayMedia={this.props.displayMedia}
              uniqueItems={this.props.uniqueItems}
              editedItems={this.props.editedItems}
              isUpdating={this.props.isUpdating}
              toggleUpdating={this.props.toggleUpdating}
              applyRefund={this.props.applyRefund}
              getRefundedItemsInfo={this.props.getRefundedItemsInfo}
            />
            <div className="invoice-container">
              {this.renderInvoice()}
            </div>
            <InvoiceActions
              isAdjusted={this.props.isAdjusted}
              paymentCaptured={this.props.paymentCaptured}
              adjustedTotal={this.props.adjustedTotal}
              invoice={this.props.invoice}
              paymentPendingApproval={this.props.paymentPendingApproval}
              paymentApproved={this.props.paymentApproved}
              capturedDisabled={this.props.capturedDisabled}
              handleApprove={this.props.handleApprove}
              handleCapturePayment={this.props.handleCapturePayment}
              currency={this.props.currency}
              handleRefund={this.props.handleRefund}
            />
          </CardBody>
        </Card>
      </CardGroup>
    );
  }
}

export default Invoice;
