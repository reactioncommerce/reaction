$.fn.parsley.defaults.errors.classHandler = (el) ->
  $(el).closest ".form-group"

$.fn.parsley.defaults.errors.errorsWrapper = "<span class=\"error-block\"></span>"
$.fn.parsley.defaults.errors.errorElem = "<span></span>"
$.fn.parsley.defaults.successClass = "has-success"
$.fn.parsley.defaults.errorClass = "has-error"
