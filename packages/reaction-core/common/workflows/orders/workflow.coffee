# fulfillmentWorkflow = [
#   { name: "order", label: "CM", method: copyCartToOrder, transition: newOrder }
#   { name: "orderCreated", label: "New", method: displayOrder, transition: createTracking }
#   { name: "shipmentTracking", label: "Tracking Generated", method: createOrderTracking, transition: packed  }
#   { name: "shipmentPacked", label: "PICK N PACK", method: updateFlow, transition: createLabel  }
#   { name: "shipmentLabel", label: "Label Generated", method: createLabel, transition: createLabel  }
#   { name: "shipmentShipped", label: "Shipment Shipped", method:  }
#   { name: "returnRequested", label: "Return Requested", method:  }
#   { name: "returnAuthorized", label: "Return Authorized", method:  }
#   { name: "returnAccepted", label: "Return Accepted", method:  }
#   { name: "adjustmentRequested", label: "Adjustment Requested", method:  }
#   { name: "adjustmentAuthorized", label: "Adjustment Requested", method:  }
#   { name: "adjustmentAccepted", label: "Adjustment Requested", method:  }
# ]

# serviceWorkflow = [
#   { name: "servicing", label: "CM",  }
#   { name: "adjustment", label: "CM",  }
#   { name: "return", label: "CM",}


# ]


# escalationWorkflow = [
#   { name: "servicing", label: "CM", count: servicingOrdersCount, condition: ""}

# ]


# returnsWorkflow = [
#   { name: "servicing", label: "CM", count: servicingOrdersCount }

# ]