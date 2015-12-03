/**
* orderPage helpers
*
*/

Template.orderPage.helpers({
  getNote: function() {
    var latestNote;
    if (this.notes) {
      latestNote = this.notes.length - 1;
      return this.notes[latestNote].content;
    } else {

    }
  }
});

/**
* orderPage events
*
*/

Template.orderPage.events({
  'click .save-label-pdf': function() {},
  'click .btn-add-note': function(event, template) {
    var content, date, note;
    date = new Date();
    content = template.find("textarea[name=note]").value;
    note = {
      content: content,
      userId: Meteor.userId(),
      updatedAt: date
    };
    if (this.notes) {
      if (note.content && note.content !== this.notes[this.notes.length - 1].content) {
        Orders.update(this._id, {
          $addToSet: {
            "notes": note
          }
        });
      }
    } else if (note.content) {
      Orders.update(this._id, {
        $addToSet: {
          "notes": note
        }
      });
    }
  }
});
