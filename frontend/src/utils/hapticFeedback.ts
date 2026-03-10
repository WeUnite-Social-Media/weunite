// Utility function for haptic feedback on mobile devices
export const triggerHapticFeedback = (
  type: "light" | "medium" | "heavy" = "light",
) => {
  if (
    typeof window !== "undefined" &&
    "navigator" in window &&
    "vibrate" in navigator
  ) {
    // Check if device supports vibration
    switch (type) {
      case "light":
        navigator.vibrate(10); // Very light vibration
        break;
      case "medium":
        navigator.vibrate(20); // Medium vibration
        break;
      case "heavy":
        navigator.vibrate(50); // Strong vibration
        break;
    }
  }

  // For iOS devices with haptic feedback support
  if (typeof window !== "undefined" && "DeviceMotionEvent" in window) {
    try {
      // Try to use iOS haptic feedback if available
      if ((window as any).flutter_inappwebview) {
        // For Flutter WebView
        (window as any).flutter_inappwebview.callHandler("haptic", type);
      }
    } catch (e) {
      // Fallback to vibration or do nothing
      console.log("Haptic feedback not available");
    }
  }
};
