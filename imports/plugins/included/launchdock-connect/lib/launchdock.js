import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp";

const Launchdock = {
  /*
  * Create authenticated DDP connection to Launchdock
  */
  connect() {
    let url;
    let username;
    let pw;

    /*
    * client login info
    */
    if (Meteor.isClient) {
      const user = Meteor.user();

      if (!user || !user.services || !user.services.launchdock) {
        return null;
      }

      url = user.services.launchdock.url;
      username = user.services.launchdock.username;
      pw = user.services.launchdock.auth;
    }

    /*
    * server login info
    */
    if (Meteor.isServer) {
      url = process.env.LAUNCHDOCK_URL;
      username = process.env.LAUNCHDOCK_USERNAME;
      pw = process.env.LAUNCHDOCK_AUTH;
    }

    if (!url || !username || !pw) {
      return null;
    }

    // create and return connection
    const launchdock = DDP.connect(url);
    DDP.loginWithPassword(launchdock, { username: username }, pw);

    return launchdock;
  }
};

export default Launchdock;
