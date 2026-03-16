"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeAgo = void 0;
var getTimeAgo = function (date) {
    var now = new Date();
    var postDate = new Date(date);
    var diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    if (diffInSeconds < 60) {
        return "agora";
    }
    var diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return "".concat(diffInMinutes, " ").concat(diffInMinutes === 1 ? "minuto" : "minutos");
    }
    var diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return "".concat(diffInHours, " ").concat(diffInHours === 1 ? "hora" : "horas");
    }
    var diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return "".concat(diffInDays, " ").concat(diffInDays === 1 ? "dia" : "dias");
    }
    var diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return "".concat(diffInWeeks, " ").concat(diffInWeeks === 1 ? "semana" : "semanas");
    }
    var diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return "".concat(diffInMonths, " ").concat(diffInMonths === 1 ? "mês" : "meses");
    }
    var diffInYears = Math.floor(diffInDays / 365);
    return "".concat(diffInYears, " ").concat(diffInYears === 1 ? "ano" : "anos");
};
exports.getTimeAgo = getTimeAgo;
