###
# Forked and modifed from https://github.com/asktomsk/bootstrap-alerts/
###
Alerts =

  ###
  Default options. Can be overridden for application
  ###
  defaultOptions:

    ###
    Button with cross icon to hide (close) alert
    ###
    dismissable: true

    ###
    CSS classes to be appended on each alert DIV (use space for separator)
    ###
    classes: ""

    ###
    Hide alert after delay in ms or false to infinity
    ###
    autoHide: false

    ###
    Time in ms before alert fully appears
    ###
    fadeIn: 200

    ###
    If autoHide enabled then fadeOut is time in ms before alert disappears
    ###
    fadeOut: 600

    ###
    Amount of alerts to be displayed
    ###
    alertsLimit: 3

    ###
    Allows use HTML in messages
    ###
    html: false
    ###
    # define placement to only show where matches
    # use: {{boostrapAlerts placement="cart"}}
    # Alerts.add "message","danger", placement:"cart"
    ###
    placement: ""

  ###
  Add an alert

  @param message (String) Text to display.
  @param mode (String) One of bootstrap alerts types: success, info, warning, danger
  @param options (Object) Options if required to override some of default ones.
  See Alerts.defaultOptions for all values.
  ###
  add: (message, mode, options) ->
    mode = mode or "danger"
    options = _.defaults(options or {}, Alerts.defaultOptions)

    # If type is specified, we re-use the existing alert with that type.
    # Use this when only one of that type should be shown at any one
    # time, for example, enabled/disabled messages.
    # This looks better in UI because it prevents in/out animation and
    # ensures that conflicting messages are not visible at the same time.
    if options.type
      a = Alerts.collection_.findOne({'options.type': options.type});
      if a
        Alerts.collection_.update a._id,
          $set:
            message: message
            mode: mode
            options: options
            seen: false
        return;

    # Handle alertsLimit
    count = Alerts.collection_.find({}).count()

    # TODO: think how to optimize this
    if count >= options.alertsLimit
      Alerts.collection_.find({},
        sort:
          created: -1

        skip: options.alertsLimit - 1
      ).forEach (row) ->
        Alerts.collection_.remove row._id
        return

    Alerts.collection_.insert
      message: message
      mode: mode
      options: options
      seen: false
      created: +new Date()

    return


  ###
  Call this function before loading a new page to clear errors from previous page
  Best way is using Router filtering feature to call this function
  ###
  removeSeen: ->
    Alerts.collection_.remove
      seen: true
      'options.sticky':
        $ne: true
    return

  ###
  If you provide a `type` option when adding an alert, you can call this function
  to later remove that alert.
  ###
  removeType: (type) ->
    Alerts.collection_.remove 'options.type': type
    return

  # Private members
  collection_: new Meteor.Collection(null)
