"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpportunitiesByCategoryRequest = exports.getMonthlyActivityRequest = exports.getDashboardStatsRequest = void 0;
var http_1 = require("@/shared/api/http");
var getDashboardStatsRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_1, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/dashboard/stats")];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: null,
                        error: null,
                    }];
            case 2:
                err_1 = _c.sent();
                error = err_1;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao carregar estatísticas do dashboard",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getDashboardStatsRequest = getDashboardStatsRequest;
var getMonthlyActivityRequest = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (months) {
        var response, err_2, error;
        var _a, _b;
        if (months === void 0) { months = 6; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, http_1.instance.get("/admin/dashboard/activity?months=".concat(months))];
                case 1:
                    response = _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            data: response.data,
                            message: null,
                            error: null,
                        }];
                case 2:
                    err_2 = _c.sent();
                    error = err_2;
                    return [2 /*return*/, {
                            success: false,
                            data: null,
                            message: null,
                            error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao carregar atividade mensal",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.getMonthlyActivityRequest = getMonthlyActivityRequest;
var getOpportunitiesByCategoryRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_3, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/dashboard/opportunities-by-category")];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: null,
                        error: null,
                    }];
            case 2:
                err_3 = _c.sent();
                error = err_3;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao carregar oportunidades por categoria",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOpportunitiesByCategoryRequest = getOpportunitiesByCategoryRequest;
