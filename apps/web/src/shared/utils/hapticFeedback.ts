interface FlutterInAppWebViewBridge {
  callHandler: (
    handlerName: "haptic",
    type: "light" | "medium" | "heavy",
  ) => void;
}

export const triggerHapticFeedback = (
  type: "light" | "medium" | "heavy" = "light",
) => {
  if (
    typeof window !== "undefined" &&
    "navigator" in window &&
    "vibrate" in navigator
  ) {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(50);
        break;
    }
  }

  if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
    try {
      const flutterBridge = (
        window as Window & {
          flutter_inappwebview?: FlutterInAppWebViewBridge;
        }
      ).flutter_inappwebview;

      if (flutterBridge) {
        flutterBridge.callHandler("haptic", type);
      }
    } catch {
      console.log("Haptic feedback not available");
    }
  }
};
