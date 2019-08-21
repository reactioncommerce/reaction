import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FileRecord } from "@reactioncommerce/file-collections";
import { Images } from "../fileCollections";

import "./images.css";
import "./images.html";

const uploadInfo = new ReactiveVar({
  isUploading: false,
  bytesUploaded: 0,
  bytesTotal: 0,
  percentage: 0
});

function uploadAndInsertBrowserFile(file) {
  // Convert it to a FileRecord
  const fileRecord = FileRecord.fromFile(file);

  // Listen for upload progress events if desired
  fileRecord.on("uploadProgress", (info) => {
    uploadInfo.set({ ...uploadInfo.get(), ...info });
  });

  // Do the upload
  uploadInfo.set({ ...uploadInfo.get(), isUploading: true });
  fileRecord.upload({ chunkSize: 1024 * 1024 })
    .then((id) => {
      console.log(`Temp ID is ${id}`); // eslint-disable-line no-console
      return Images.insert(fileRecord);
    })
    .then(() => {
      console.log("FileRecord saved to database"); // eslint-disable-line no-console
      uploadInfo.set({ ...uploadInfo.get(), isUploading: false });
    })
    .catch((error) => {
      console.error(error); // eslint-disable-line no-console
    });
}

Template.images.helpers({
  uploadedImages() {
    return Images.findLocal();
  },
  uploadInfo() {
    return uploadInfo.get();
  },
  progressStyle() {
    return `width: ${this.percentage}%`;
  }
});

Template.uploadedImage.helpers({
  downloadUrlForStore(store) {
    const fileRecord = this;
    return fileRecord.url({ store, download: true });
  },
  urlForStore(store) {
    const fileRecord = this;
    return fileRecord.url({ store });
  },
  sizeForStore(store) {
    const fileRecord = this;
    return fileRecord.size({ store });
  },
  typeForStore(store) {
    const fileRecord = this;
    return fileRecord.type({ store });
  },
  nameForStore(store) {
    const fileRecord = this;
    return fileRecord.name({ store });
  }
});

Template.images.events({
  // "dropped .imageArea": getHandler(true),
  // "dropped .imageDropArea": getHandler(true),
  "change .images": (e) => {
    // Get the selected file from the input element
    const [file] = e.target.files;

    uploadAndInsertBrowserFile(file);
  },
  "click .js-deleteFile"() {
    Meteor.call("removeImage", this._id);
  },
  "click .js-cloneFile"() {
    Meteor.call("cloneImage", this._id);
  },
  "click .grabButton"() {
    const url = document.getElementsByClassName("js-remoteUrl")[0].value || "";
    Meteor.call("insertRemoteImage", url.trim(), (error) => {
      if (!error) document.getElementsByClassName("js-remoteUrl")[0].value = "";
    });
  }
});
