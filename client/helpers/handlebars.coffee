Handlebars.registerHelper "condition", (v1, operator, v2, options) ->
  switch operator
    when "==", "eq"
      v1 is v2
    when "!=", "neq"
      v1 isnt v2
    when "===", "ideq"
      v1 is v2
    when "!==", "nideq"
      v1 isnt v2
    when "&&", "and"
      v1 and v2
    when "||", "or"
      v1 or v2
    when "<", "lt"
      v1 < v2
    when "<=", "lte"
      v1 <= v2
    when ">", "gt"
      v1 > v2
    when ">=", "gte"
      v1 >= v2
    else
      throw "Undefined operator \"" + operator + "\""

Handlebars.registerHelper "key_value", (context, options) ->
  result = []
  _.each context, (value, key, list) ->
    result.push
      key: key
      value: value
  result

### *****************************************************
Convert new line (\n\r) to <br>
from http://phpjs.org/functions/nl2br:480
###
Handlebars.registerHelper "nl2br", (text) ->

  #        text = Handlebars.Utils.escapeExpression(text);
  nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + "<br>" + "$2")
  new Handlebars.SafeString(nl2br)


### *****************************************************
format an ISO date using Moment.js
http://momentjs.com/
moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
usage: {{dateFormat creation_date format="MMMM YYYY"}}
###
Handlebars.registerHelper "dateFormat", (context, block) ->
  if window.moment
    f = block.hash.format or i18n.t("dateFormat")
    lang = Meteor.user().profile.settings.locale or i18n.lng()
    indexOf = lang.indexOf("_")
    moment.lang (if indexOf is -1 then lang else lang.substr(0, indexOf))
    moment(new Date(context)).format f
  else
    context #  moment plugin not available. return data as is.

Handlebars.registerHelper "uc", (str) ->
  encodeURIComponent str


# *****************************************************
# general helper for plurization of strings
# returns string with 's' concatenated if n = 1
# *****************************************************
Handlebars.registerHelper "pluralize", (n, thing) ->

  # fairly stupid pluralizer
  if n is 1
    "1 " + thing
  else
    n + " " + thing + "s"


# *****************************************************
# general helper user name handling
# todo: needs additional validation all use cases
# returns first word in profile name
# *****************************************************
Handlebars.registerHelper "fname", ->
  if Meteor.user()
    name = Meteor.user().profile.name.split(" ")
    fname = name[0]
    fname


# *****************************************************
# general helper for determine if user has a store
# returns boolean
# *****************************************************
Handlebars.registerHelper "userHasProfile", ->
  user = Meteor.user()
  user and !!user.profile.store

Handlebars.registerHelper "userHasRole", (role) ->
  user = Meteor.user()
  user and user.roles.indexOf(role) isnt -1  if user and user.roles


# *****************************************************
# general helper to return 'active' when on current path
# returns string
# handlebars: {{active 'route'}}
# *****************************************************

#Determine if current link should be active
Handlebars.registerHelper "active", (path) ->
  # Get the current path for URL
  current = Router.current()
  routeName = current and current.route.name
  if routeName is path
    "active"
  else
    ""

# *****************************************************
# general helper to return 'active' when on current path
# returns string
# handlebars: {{navLink 'projectsList' 'icon-edit'}}
# *****************************************************
Handlebars.registerHelper "navLink", (page, icon) ->
  ret = "<li "
  ret += "class='active'"  if Meteor.Router.page() is page
  ret += "><a href='" + Meteor.Router.namedRoutes[page].path + "'><i class='" + icon + " icon-fixed-width'></i></a></li>"
  new Handlebars.SafeString(ret)


# *****************************************************
# Handler Helper that randomly picks colors for package tiles
# returns random color
# TODO: assignedColors aren't populated until after this runs!
# TODO: generate colors for infinite palette, currently will run out of colors
# *****************************************************
Handlebars.registerHelper "tileColors", (app) ->
  colors = [
    "blue"
    "light-blue"
    "dark-blue"
    "red"
    "orange"
    "brown"
    "lime"
    "yellow"
    "pink"
    "aqua"
    "fuchsia"
    "gray"
    "maroon"
    "olive"
    "purple"
    "teal"
    "green"
  ]
  assignedColor = ReactionPalette.findOne(appId: app)

  #console.log("tileColor exists:" +tileColor);
  unless assignedColor
    palette = ReactionPalette.find({}).fetch()
    palette.forEach (palette) ->
      colors = _.without(colors, palette.color) # Remove color duplicates

    tileColor = colors[Math.floor(Math.random() * colors.length)] # pick random color from unused palette
  else
    tileColor = assignedColor.color
    return tileColor
  if tileColor
    ReactionPalette.insert
      appId: app
      color: tileColor

    tileColor


# *****************************************************
# Handler Helper allows you to load templates dynamically
# format: {{{getTemplate package context}}}
# example: {{{getTemplate widget }}}
# *****************************************************
Handlebars.registerHelper "getTemplate", (pkg, context) ->
  templateName = pkg + "-widget"
  Template[templateName] context  if Template[templateName]


# *****************************************************
# Handler Helper foreach loop with positional information
# example:
# {{#foreach foo}}
#     <div class='{{#if first}}first{{/if}}{{#if last}} last{{/if}}'>{{index}}</div>
# {{/foreach}}
# *****************************************************
Handlebars.registerHelper "foreach", (arr, options) ->
  return options.inverse(this)  if options.inverse and not arr.length
  arr.map((item, index) ->
    item.index = index
    item.first = index is 0
    item.last = index is arr.length - 1
    options.fn item
  ).join ""

#
# https://github.com/meteor/meteor/issues/281
#
Handlebars.registerHelper "labelBranch", (label, options) ->
  data = this
  Spark.labelBranch Spark.UNIQUE_LABEL, ->
    options.fn data