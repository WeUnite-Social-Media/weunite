"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitials = void 0;
var getInitials = function (name) {
    if (!name) {
        return "";
    }
    var words = name.trim().split(" ").filter(Boolean);
    if (words.length === 0) {
        return "";
    }
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};
exports.getInitials = getInitials;
