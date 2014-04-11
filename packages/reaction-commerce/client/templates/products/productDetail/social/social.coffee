Template.productSocial.rendered = ->
  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  #
  # $.fn.editable.defaults.disabled = true
  # *****************************************************

  if Meteor.app.hasOwnerAccess()
    $.fn.editable.defaults.disabled = false
    $.fn.editable.defaults.mode = "inline"
    $.fn.editable.defaults.showbuttons = false
    $.fn.editable.defaults.onblur = 'submit'
    $.fn.editable.defaults.highlight = '#eff6db'


    # *****************************************************
    # Editable social handle (hashtag, url)
    # *****************************************************
    #
    $("#handle").editable
      type: "text"
      inputclass: "handle"
      emptytext: "add-short-social-hashtag"
      title: "Social handle for sharing and navigation"
      success: (response, newValue) ->
        updateProduct handle: newValue
      validate: (value) ->
        if $.trim(value) is ""
          return "A product hashtag is required"

    # *****************************************************
    # Editable twitter, social messages entry
    # *****************************************************
    $(".twitter-msg").editable
      selector: '.twitter-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-twitter fa-lg"></i>'
      title: "Default Twitter message ~100 characters!"
      success: (response, newValue) ->
        updateProduct twitterMsg: newValue

    $(".pinterest-msg").editable
      selector: '.pinterest-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-pinterest fa-lg"></i>'
      title: "Default Pinterest message ~200 characters!"
      success: (response, newValue) ->
        updateProduct pinterestMsg: newValue

    $(".facebook-msg").editable
      selector: '.facebook-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-facebook fa-lg"></i>'
      title: "Default Facebook message ~200 characters!"
      success: (response, newValue) ->
        updateProduct facebookMsg: newValue

    $(".instagram-msg").editable
      selector: '.instagram-msg-edit'
      type: "textarea"
      mode: "popup"
      emptytext: '<i class="fa fa-instagram fa-lg"></i>'
      title: "Default Instagram message ~100 characters!"
      success: (response, newValue) ->
        updateProduct instagramMsg: newValue