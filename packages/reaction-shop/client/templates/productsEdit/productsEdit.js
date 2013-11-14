Template.productsEdit.rendered = function () {
  // *****************************************************
  // function that stores images that have successfully
  // uploaded to filepicker.io
  // *****************************************************


  // *****************************************************
  // Enable Medium style rollover wysiwyg markip tool
  // requires:
  //   mrt add medium-editor
  // *****************************************************
  // var elements = document.querySelectorAll('.editable'),
  // editor = new MediumEditor(elements);
  // jquery tags
  //$('#tags').tagsInput();

  // *****************************************************
  // Inline field editing, handling
  // http://vitalets.github.io/x-editable/docs.html
  //
  // You could just do:  $('#username').editable();
  // but we want to maintain reactivity etc.
  // *****************************************************

  $.fn.editable.defaults.mode = 'popup';
  $.fn.editable.defaults.showbuttons = false;

  // *****************************************************
  // TODO: Tabbing
  // SEE: https://github.com/vitalets/x-editable/issues/324
  // *****************************************************


  // *****************************************************
  // Editable product title entry
  // *****************************************************

  $('#title').editable({
    inputclass: 'editable-width',
    success: function (response, newValue) {
      updateProduct({title: newValue});
    },
    validate: function (value) {
      if ($.trim(value) == '') {
        throwError('This field is required');
        return false;
      }
    }
  });

  // *****************************************************
  // Editable vendor entry - dropdown
  // *****************************************************

  $('#vendor').editable({
    inputclass: 'editable-width',
    success: function (response, newValue) {
      updateProduct({vendor: newValue});
    }
  });

  // *****************************************************
  // Editable price - really first variant entry
  // *****************************************************

  $('#price').editable({
    success: function (response, newValue) {
      updateProduct({price: newValue});
    }
  });

  // *****************************************************
  // Editable product html
  // *****************************************************
  //
  $('#body_html').editable({
    showbuttons: true,
    inputclass: 'editable-width',
    success: function (response, newValue) {
      updateProduct({body_html: newValue});
    }
  });

  // *****************************************************
  // Editable social handle (hashtag, url)
  // *****************************************************
  //
  $('#handle').editable({
    inputclass: 'editable-width',
    success: function (response, newValue) {
      updateProduct({handle: newValue});
    }
  });

  // *****************************************************
  // Editable twitter, social messages entry
  // *****************************************************

  $('#twitter-msg').editable({
    inputclass: 'editable-width',
    value: 'tweet this!',
    type: 'text',
    title: 'Default Twitter message ~100 characters!',
    success: function (response, newValue) {
      updateProduct({twitter_msg: newValue});
    }
  });

  // *****************************************************
  // Editable tag field
  // *****************************************************

  $('#tags').editable({
    showbuttons: true,
    inputclass: 'editable-width',
    select2: {
      tags: function () {
        var currentProductId = Session.get('currentProductId');
        return Products.findOne({_id: currentProductId}, {fields: {tags: true}});
      },
      tokenSeparators: [",", " "]
    },
    success: function (response, newValue) {
      updateProduct({tags: newValue});
    }
  });

  // *****************************************************
  // Editable variants entry
  // Format
  //    :description => 'Author of book',
  //    :namespace => 'book',
  //    :key => 'author',
  //    :value => 'Kurt Vonnegut',
  //    :value_type => 'string'
  // *****************************************************

  $('#variants').editable({
    inputclass: 'input-large',
    select2: {
      width: '250px',
      initSelection: function (element, callback) {
        data = [];
        var data = {id: "1", text: "text"};
        callback(data);
      },
      data: function (element, callback) {
        data = [];
        var data = {id: "2", text: "text2"};
        callback(data);
      }
    },
    success: function (response, newValue) {
      updateProduct({variants: newValue});
    }
  });


  // *****************************************************
  // Function to return variant data
  // param: property:value
  // returns true or err
  // *****************************************************
  variants = function (options) {
    var currentProductId = Session.get('currentProductId');
    var product = Products.findOne({_id: currentProductId}, {fields: {variants: true}}).variants.valueOf();
    variant = [];
    for (var i = 0; i < product.length; i++) {
      variant[i] = {value: i, text: product[i].sku}
    }
    return variant;
  };


  // *****************************************************
  // Function to update product
  // param: property:value
  // returns true or err
  // *****************************************************
  var updateProduct = function (productsProperties) {
    var currentProductId = Session.get('currentProductId');
    Products.update(currentProductId, {$set: productsProperties}, function (error) {
      if (error) {
        throwError(error);
        return false;
        alert(error.reason);
      } else {
        return true;
      }
    });
  };

  $('.variant-table input:first').prop('checked', 'checked');
}; // End Template.rendered


// **********************************************************************************************************
// general helpers for editing products
// returns int
// **********************************************************************************************************

// *****************************************************
// x-editable inline submitting, each field is indepandly
// submitted
// *****************************************************
Template.productsEdit.events({
  'submit form': function (e) {
    e.preventDefault();

    var currentProductId = Session.get('currentProductId');

    var productsProperties = {
      title: $(e.target).find('[name=title]').val(),
      vendor: $(e.target).find('[name=vendor]').val(),
      body_html: $(e.target).find('[name=body_html]').val(),
      tags: $(e.target).find('[name=tags]').val(),
      handle: $(e.target).find('[name=handle]').val()
    };

    Products.update(currentProductId, {$set: productsProperties}, function (error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {
        //Router.go('/shop/products');
      }

    });
  },
  // *****************************************************
  // deletes entire product
  // TODO: implement revision control by using
  // suspended = boolean // not visible on site
  // archived = boolean // not visible in admin
  // this function is a full delete
  // TODO: delete from archived list
  // *****************************************************
  'click .delete': function (e) {
    e.preventDefault();

    if (confirm("Delete this products?")) {
      var currentProductId = Session.get('currentProductId');
      Products.remove(currentProductId);
      Router.go('/shop/products');
    }
  },

  // *****************************************************
  // get session image-url and deletes from images,
  // or deletes from image if no session data
  // TODO: Consider path {path: '/myfiles/1234.png'};
  // *****************************************************
  'click .imageAddButton': function (e) {
    filepicker.pickAndStore({multiple: true}, {},
      function (InkBlob) {
        uploadImages(InkBlob);
      },
      function (FPError) {
        if (FPError.code == 101) {
          return; // The user closed the picker without choosing a file
        }
        $.gritter.add({
          title: '"Filepicker.io Error"',
          text: FPError.toString()
        });
      }

    );

  },

  // *****************************************************
  // get session image-url and deletes from images,
  // or deletes from image if no session data
  // *****************************************************
  'click .fa-trash-o': function (e, template) {
    e.preventDefault();

    var currentProductId = Session.get('currentProductId');
    var sessionImage = Session.get('image-url');

    if (Session.equals("image-url", undefined)) {
      if (typeof this.image == 'undefined') {
        Products.update(currentProductId, {$pull: {images: this}}, function (error) {
          if (error) {
            throwError(error.reason);
          }
        });
      } else {
        Products.update(currentProductId, {$unset: {image: ''}}, function (error) {
          if (error) {
            throwError(error.reason);
          }
        });
      }
    } else {
      Products.update(currentProductId, {$pull: {images: {src: sessionImage} } }, function (error) {
        if (error) {
          // display the error to the user
          throwError(error.reason);
        } else {
          Session.set('image-url', undefined);
        }
      });
    }
  },

  'click .variant-table tr': function (e) {
    $(e.target).closest('tr').find('input').prop('checked', 'checked');
    e.preventDefault();
  },
  'click #add-variant': function(e) {
    $('#variant-edit-modal form').get(0).reset();
    Session.set('currentVariantIndex', null);
    $('#variant-edit-modal').modal();
    e.preventDefault();
  },
    'click #edit-options': function(e) {
      $('#options-modal').modal();
      e.preventDefault();
    }
});

uploadImages = function (upload) {
  var currentProductId = Session.get('currentProductId');

  for (var i = upload.length - 1; i >= 0; i--) {
    var imageProperties = {
      created_at: new Date(),
      src: upload[i].url,
      mimetype: upload[i].mimetype,
      inkblob: upload[i]
    };
    //Save image to local data after successfully uploading.
    //Upload to single image structure, if there isn't a main
    //this is some lame legacy structure from shopify
    if (typeof Products.findOne(currentProductId).image == 'undefined') {
      Products.update(currentProductId, {$set: {image: imageProperties}}, function (error) {
        if (error) {
          throwError(error.reason);
        }
      });

    } else { // if product has primary image add to images object
      Products.update(currentProductId, {$addToSet: {images: imageProperties}}, function (error) {
        if (error) {
          throwError(error.reason);
        }
      });
    }
  }
};
