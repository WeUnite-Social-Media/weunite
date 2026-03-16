"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerHapticFeedback = void 0;
var triggerHapticFeedback = function (type) {
    if (type === void 0) { type = "light"; }
    if (typeof window !== "undefined" &&
        "navigator" in window &&
        "vibrate" in navigator) {
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
            var flutterBridge = window.flutter_inappwebview;
            if (flutterBridge) {
                flutterBridge.callHandler("haptic", type);
            }
        }
        catch (_a) {
            console.log("Haptic feedback not available");
        }
    }
};
exports.triggerHapticFeedback = triggerHapticFeedback;
