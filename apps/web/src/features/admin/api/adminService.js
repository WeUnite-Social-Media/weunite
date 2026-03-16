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
exports.resolveReportsRequest = exports.markReportsAsReviewedRequest = exports.dismissReportsRequest = exports.deleteOpportunityByAdminRequest = exports.deletePostByAdminRequest = exports.getReportedOpportunityDetailRequest = exports.getReportedOpportunitiesDetailsRequest = exports.getReportedOpportunitiesSummaryRequest = exports.getReportedPostDetailRequest = exports.getReportedPostsDetailsRequest = exports.getReportedPostsSummaryRequest = void 0;
var http_1 = require("@/shared/api/http");
/**
 * Busca resumo dos posts denunciados (apenas IDs e contagem)
 */
var getReportedPostsSummaryRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_1, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/posts/reported")];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: "Posts denunciados carregados com sucesso",
                        error: null,
                    }];
            case 2:
                err_1 = _c.sent();
                error = err_1;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao carregar posts denunciados",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReportedPostsSummaryRequest = getReportedPostsSummaryRequest;
/**
 * Busca detalhes completos dos posts denunciados
 */
var getReportedPostsDetailsRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_2, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/posts/reported/details")];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: "Detalhes dos posts denunciados carregados com sucesso",
                        error: null,
                    }];
            case 2:
                err_2 = _c.sent();
                error = err_2;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao carregar detalhes dos posts denunciados",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReportedPostsDetailsRequest = getReportedPostsDetailsRequest;
/**
 * Busca detalhes de um post denunciado específico
 */
var getReportedPostDetailRequest = function (postId) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_3, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/posts/reported/".concat(postId))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: "Detalhes do post carregados com sucesso",
                        error: null,
                    }];
            case 2:
                err_3 = _c.sent();
                error = err_3;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao carregar detalhes do post",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReportedPostDetailRequest = getReportedPostDetailRequest;
/**
 * Busca resumo das oportunidades denunciadas (apenas IDs e contagem)
 */
var getReportedOpportunitiesSummaryRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_4, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/opportunities/reported")];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: "Oportunidades denunciadas carregadas com sucesso",
                        error: null,
                    }];
            case 2:
                err_4 = _c.sent();
                error = err_4;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao carregar oportunidades denunciadas",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReportedOpportunitiesSummaryRequest = getReportedOpportunitiesSummaryRequest;
/**
 * Busca detalhes completos das oportunidades denunciadas
 */
var getReportedOpportunitiesDetailsRequest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_5, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/opportunities/reported/details")];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: "Detalhes das oportunidades denunciadas carregadas com sucesso",
                        error: null,
                    }];
            case 2:
                err_5 = _c.sent();
                error = err_5;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao carregar detalhes das oportunidades denunciadas",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReportedOpportunitiesDetailsRequest = getReportedOpportunitiesDetailsRequest;
/**
 * Busca detalhes de uma oportunidade denunciada específica
 */
var getReportedOpportunityDetailRequest = function (opportunityId) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_6, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.get("/admin/opportunities/reported/".concat(opportunityId))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data,
                        message: "Detalhes da oportunidade carregados com sucesso",
                        error: null,
                    }];
            case 2:
                err_6 = _c.sent();
                error = err_6;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao carregar detalhes da oportunidade",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getReportedOpportunityDetailRequest = getReportedOpportunityDetailRequest;
/**
 * Deleta um post denunciado
 */
var deletePostByAdminRequest = function (postId) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_7, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.delete("/admin/posts/".concat(postId))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: null,
                        message: response.data.message || "Post deletado com sucesso",
                        error: null,
                    }];
            case 2:
                err_7 = _c.sent();
                error = err_7;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao deletar post",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deletePostByAdminRequest = deletePostByAdminRequest;
/**
 * Deleta uma oportunidade denunciada
 */
var deleteOpportunityByAdminRequest = function (opportunityId) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_8, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.delete("/admin/opportunities/".concat(opportunityId))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: null,
                        message: response.data.message || "Oportunidade deletada com sucesso",
                        error: null,
                    }];
            case 2:
                err_8 = _c.sent();
                error = err_8;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao deletar oportunidade",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteOpportunityByAdminRequest = deleteOpportunityByAdminRequest;
/**
 * Descarta denúncias de uma entidade (post ou oportunidade)
 */
var dismissReportsRequest = function (entityId, type) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_9, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.put("/admin/reports/dismiss/".concat(entityId, "/").concat(type))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data.data || response.data.message,
                        message: response.data.message || "Denúncias descartadas com sucesso",
                        error: null,
                    }];
            case 2:
                err_9 = _c.sent();
                error = err_9;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao descartar denúncias",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.dismissReportsRequest = dismissReportsRequest;
/**
 * Marca denúncias como revisadas (em análise)
 */
var markReportsAsReviewedRequest = function (entityId, type) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_10, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.put("/admin/reports/review/".concat(entityId, "/").concat(type))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data.data || response.data.message,
                        message: response.data.message || "Denúncias marcadas como revisadas",
                        error: null,
                    }];
            case 2:
                err_10 = _c.sent();
                error = err_10;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                            "Erro ao marcar denúncias como revisadas",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.markReportsAsReviewedRequest = markReportsAsReviewedRequest;
/**
 * Resolve denúncias (mantém o conteúdo e marca como resolvido)
 */
var resolveReportsRequest = function (entityId, type) { return __awaiter(void 0, void 0, void 0, function () {
    var response, err_11, error;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, http_1.instance.put("/admin/reports/resolve/".concat(entityId, "/").concat(type))];
            case 1:
                response = _c.sent();
                return [2 /*return*/, {
                        success: true,
                        data: response.data.data || response.data.message,
                        message: response.data.message || "Denúncias resolvidas com sucesso",
                        error: null,
                    }];
            case 2:
                err_11 = _c.sent();
                error = err_11;
                return [2 /*return*/, {
                        success: false,
                        data: null,
                        message: null,
                        error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Erro ao resolver denúncias",
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.resolveReportsRequest = resolveReportsRequest;
