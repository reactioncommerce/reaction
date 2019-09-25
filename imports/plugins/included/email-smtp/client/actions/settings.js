import _ from "lodash";
import { Meteor } from "meteor/meteor";
import Alert from "sweetalert2";
import { i18next, Reaction } from "/client/api";
import gql from "graphql-tag";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const verifySMTPEmailSettings = gql`
  mutation verifySMTPEmailSettings($input: VerifySMTPEmailSettingsInput!) {
    verifySMTPEmailSettings(input: $input) {
      clientMutationId
      isVerified
    }
  }
`;

export default {
  /**
   * Save email settings
   * @param {Object} settings - object of mail provider settings
   * @param {Object} client - apollo client
   * @param {Function} callback - optional callback
   * @returns {Boolean} returns true if all fields provided and update method is called
   */
  async saveSettings(settings, client, callback) {
    const { service, host, port, user, password } = settings;

    if (!service) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.missingService"), "error");
      return callback();
    }

    if (service !== "custom" && service !== "Maildev" && (!user || !password)) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.userPassRequired", { service }), "error");
      return callback();
    }

    if (service === "custom" && (!host || !port)) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.allFieldsRequired"), "error");
      return callback();
    }

    // make sure port is a Number
    settings.port = Number(settings.port);

    if (isNaN(settings.port)) {
      Alert(i18next.t("app.error"), i18next.t("mail.alerts.portNaN"), "error");
      return callback();
    }

    const save = () => {
      Meteor.call("email/saveSettings", _.pick(settings, ["service", "host", "port", "user", "password"]), (err) => {
        if (err) {
          return Alert(
            i18next.t("app.error"),
            i18next.t("mail.alerts.saveFailed", { error: err.reason }),
            "error"
          );
        }
        return Alerts.toast(i18next.t("app.success"), "success");
      });
    };

    const shopId = Reaction.getPrimaryShopId();
    const [opaqueShopId] = await getOpaqueIds([{ namespace: "Shop", id: shopId }]);

    let shouldSave = true;
    try {
      await client.mutate({
        mutation: verifySMTPEmailSettings,
        variables: {
          input: {
            host: settings.host,
            password: settings.password,
            port: settings.port,
            service: settings.service,
            shopId: opaqueShopId,
            user: settings.user
          }
        }
      });
    } catch (error) {
      shouldSave = false;
    }

    if (!shouldSave) {
      try {
        await Alert({
          title: i18next.t("mail.alerts.connectionFailed"),
          text: i18next.t("mail.alerts.saveAnyway"),
          type: "warning",
          showCancelButton: true,
          cancelButtonText: i18next.t("app.cancel"),
          confirmButtonColor: "#DD6B55",
          confirmButtonText: i18next.t("app.save")
        });
      } catch (error) {
        callback();
        return error;
      }
    }

    callback();
    await save();

    return true;
  }
};
