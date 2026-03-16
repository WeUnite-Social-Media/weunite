"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePasswordStrength = usePasswordStrength;
var react_1 = require("react");
function usePasswordStrength(password) {
    var _a = (0, react_1.useState)(0), strength = _a[0], setStrength = _a[1];
    (0, react_1.useEffect)(function () {
        var calculateStrength = function (pwd) {
            if (!pwd)
                return 0;
            var score = 0;
            if (pwd.length >= 8)
                score += 20;
            if (/[A-Z]/.test(pwd))
                score += 20;
            if (/[a-z]/.test(pwd))
                score += 20;
            if (/[0-9]/.test(pwd))
                score += 20;
            if (/[^A-Za-z0-9]/.test(pwd))
                score += 20;
            return score;
        };
        setStrength(calculateStrength(password || ""));
    }, [password]);
    return strength;
}
