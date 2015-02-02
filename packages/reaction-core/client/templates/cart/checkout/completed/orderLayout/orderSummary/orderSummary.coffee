Template.completedOrderSummary.helpers
  # retrieve the first (original) invoice for order
  invoice: () ->
    # todo we'll want to make sure this is the original invoice
    # handling for subsequent invoice actions will be presented elsewhere
    return @.payment.invoices[0]
