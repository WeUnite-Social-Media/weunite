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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordRequest = exports.verifyResetTokenRequest = exports.sendResetPasswordRequest = exports.loginRequest = exports.signUpCompanyRequest = exports.verifyEmailRequest = exports.signUpRequest = void 0;
var http_1 = require("@/shared/api/http");
var signUpRequest = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_1, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/signup", data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message || "Cadastro concluído com sucesso!",
                        error: null,
                    }];
            case 2:
                err_1 = _c.sent();
                error = err_1;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao se cadastrar",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.signUpRequest = signUpRequest;
var verifyEmailRequest = function (data, email) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_2, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/verify-email/".concat(email), data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message,
                        error: null,
                    }];
            case 2:
                err_2 = _c.sent();
                error = err_2;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao verificar e-mail",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.verifyEmailRequest = verifyEmailRequest;
var signUpCompanyRequest = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_3, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/signup/company", data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message || "Cadastro da empresa concluído com sucesso!",
                        error: null,
                    }];
            case 2:
                err_3 = _c.sent();
                error = err_3;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao cadastrar empresa",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.signUpCompanyRequest = signUpCompanyRequest;
var loginRequest = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_4, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/login", data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message,
                        error: null,
                    }];
            case 2:
                err_4 = _c.sent();
                error = err_4;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao logar",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.loginRequest = loginRequest;
var sendResetPasswordRequest = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_5, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/send-reset-password", data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message,
                        error: null,
                    }];
            case 2:
                err_5 = _c.sent();
                error = err_5;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao redefinir senha",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendResetPasswordRequest = sendResetPasswordRequest;
var verifyResetTokenRequest = function (data, email) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_6, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/verify-reset-token/".concat(email), data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message,
                        error: null,
                    }];
            case 2:
                err_6 = _c.sent();
                error = err_6;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao verificar token",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.verifyResetTokenRequest = verifyResetTokenRequest;
var resetPasswordRequest = function (data, verificationToken) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_7, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.post("/auth/reset-password/".concat(verificationToken), data)];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: response.data.message,
                        error: null,
                    }];
            case 2:
                err_7 = _c.sent();
                error = err_7;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao redefinir senha",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.resetPasswordRequest = resetPasswordRequest;
