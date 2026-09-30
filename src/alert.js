import { Alert as NativeAlert, Platform } from "react-native";

// React Native Web's Alert is a no-op. Preserve the app's messages in browsers.
const BrowserAlert = {
  alert(title, message, buttons) {
    const text = [title, message].filter(Boolean).join("\n\n");
    if (buttons && buttons.length > 1) {
      const action = buttons.find((button) => button.style !== "cancel");
      const cancel = buttons.find((button) => button.style === "cancel");
      if (window.confirm(text)) action?.onPress?.();
      else cancel?.onPress?.();
    } else {
      window.alert(text);
      buttons?.[0]?.onPress?.();
    }
  },
};

export default Platform.OS === "web" ? BrowserAlert : NativeAlert;
