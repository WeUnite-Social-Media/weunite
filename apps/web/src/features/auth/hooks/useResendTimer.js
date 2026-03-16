"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResendTimer = useResendTimer;
var react_1 = require("react");
function useResendTimer(initialTimerValue) {
    var initialTimer = initialTimerValue !== null && initialTimerValue !== void 0 ? initialTimerValue : 60;
    var _a = (0, react_1.useState)(0), timer = _a[0], setTimer = _a[1];
    var _b = (0, react_1.useState)(true), canResend = _b[0], setCanResend = _b[1];
    var startTimer = (0, react_1.useCallback)(function () {
        setCanResend(false);
        setTimer(initialTimer);
    }, [initialTimer]);
    (0, react_1.useEffect)(function () {
        var interval;
        if (timer > 0 && !canResend) {
            interval = window.setInterval(function () {
                setTimer(function (prevTimer) { return prevTimer - 1; });
            }, 1000);
        }
        else if (timer === 0 && !canResend) {
            setCanResend(true);
        }
        return function () {
            if (interval)
                clearInterval(interval);
        };
    }, [timer, canResend]);
    return { timer: timer, canResend: canResend, startTimer: startTimer };
}
