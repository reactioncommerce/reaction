(($) ->
  $.fn.serializeHash = ->
    
    ###
    JQuery plugin that returns a hash from serialization of any form or dom element. It supports Brackets on input names.
    It is convenient if you want to get values from a form and merge it with an other hash for example.
    
    Added by rilinor on 29/05/2012 : jquery serialize hash now support serialization of any dom elements (before, only form were supported). Thanks !
    
    Example:
    ---------- HTML ----------
    <form id="form">
    <input type="hidden" name="firstkey" value="val1" />
    <input type="hidden" name="secondkey[0]" value="val2" />
    <input type="hidden" name="secondkey[1]" value="val3" />
    <input type="hidden" name="secondkey[key]" value="val4" />
    </form>
    ---------- JS ----------
    $('#form').serializeHash()
    should return :
    {
    firstkey: 'val1',
    secondkey: {
    0: 'val2',
    1: 'val3',
    key: 'val4'
    }
    }
    ###
    stringKey = (key, value) ->
      beginBracket = key.lastIndexOf("[")
      if beginBracket is -1
        hash = undefined
        if key is +key
          key = +key
          hash = []
        else
          hash = {}
        hash[key] = value
        return hash
      newKey = key.substr(0, beginBracket)
      newValue = undefined
      currentKey = key.substring(beginBracket + 1, key.length - 1)
      if currentKey is +currentKey
        currentKey = +currentKey
        newValue = []
      else
        newValue = {}
      newValue[currentKey] = value
      stringKey newKey, newValue
    hash = {}
    els = $(this).find(":input").get()
    $.each els, ->
      if @name and not @disabled and (@checked or /select|textarea/i.test(@nodeName) or /hidden|text|search|tel|url|email|password|datetime|date|month|week|time|datetime-local|number|range|color/i.test(@type))
        val = $(this).val()
        $.extend true, hash, stringKey(@name, val)

    hash
) jQuery
