import NodeGeocoder from "node-geocoder";


const options = {
  provider: "google"
};

const Geocoder = NodeGeocoder(options);

const geocoder = {};

geocoder.geocode = function (address) {
  Geocoder.geocode(address)
    .then(function (response) {
      console.log("response", response);
      return response;
    })
    .catch(function (err) {
      console.log("err", err);
    });
};

export default geocoder;
