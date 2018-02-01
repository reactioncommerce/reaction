import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Orders } from "/lib/collections";

/**
 * orderPage helpers
 *
 */

Template.orderPage.helpers({
  getNote() {
    let latestNote;
    if (this.notes) {
      latestNote = this.notes.length - 1;
      return this.notes[latestNote].content;
    }
  }
});

/**
 * orderPage events
 *
 */

Template.orderPage.events({
  "click .save-label-pdf"() {},
  "click .btn-add-note"(event, template) {
    const date = new Date();
    const content = template.find("textarea[name=note]").value;
    const note = {
      content,
      userId: Meteor.userId(),
      updatedAt: date
    };
    if (this.notes) {
      if (note.content && note.content !== this.notes[this.notes.length - 1].content) {
        Orders.update(this._id, {
          $addToSet: {
            notes: note
          }
        });
      }
    } else if (note.content) {
      Orders.update(this._id, {
        $addToSet: {
          notes: note
        }
      });
    }
  }
});
