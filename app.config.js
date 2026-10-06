const { withEntitlementsPlist } = require('expo/config-plugins');

// Annie schedules reminders on this device; PayPlace does not register for APNs.
// expo-notifications adds the push entitlement even when background remote
// notifications are disabled. Remove it after the package's config plugin runs
// so local reminders work with the existing App Store provisioning profile.
function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
}

module.exports = ({ config }) => ({
  ...config,
  // Entitlement mods run in reverse registration order: register this first
  // so it removes the APNs entitlement after all package mods have finished.
  plugins: [withLocalNotificationsOnly, ...(config.plugins || [])],
});
