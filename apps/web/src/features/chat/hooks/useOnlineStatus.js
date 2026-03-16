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
exports.useOnlineStatus = void 0;
var react_1 = require("react");
var WebSocketContext_1 = require("@/features/chat/context/WebSocketContext");
var http_1 = require("@/shared/api/http");
/**
 * Hook para rastrear o status online de um usuário específico
 */
var useOnlineStatus = function (userId) {
    var _a = (0, react_1.useState)(false), isOnline = _a[0], setIsOnline = _a[1];
    var _b = (0, WebSocketContext_1.useWebSocket)(), subscribeToUserStatus = _b.subscribeToUserStatus, isConnected = _b.isConnected;
    (0, react_1.useEffect)(function () {
        if (!userId || !isConnected)
            return;
        console.log("\uD83D\uDC64 Buscando status inicial do usu\u00E1rio ".concat(userId));
        // 1️⃣ Busca o status inicial via REST API
        var fetchInitialStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, initialStatus, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, http_1.instance.get("/users/".concat(userId, "/status"))];
                    case 1:
                        response = _a.sent();
                        initialStatus = response.data.status;
                        console.log("\uD83D\uDD0D Status inicial do usu\u00E1rio ".concat(userId, ": ").concat(initialStatus));
                        setIsOnline(initialStatus === "ONLINE");
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.warn("\u26A0\uFE0F Erro ao buscar status inicial do usu\u00E1rio ".concat(userId, ":"), error_1);
                        setIsOnline(false);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchInitialStatus();
        // 2️⃣ Inscreve-se no status do usuário para receber atualizações em tempo real
        console.log("\uD83D\uDC64 Inscrevendo no status do usu\u00E1rio ".concat(userId));
        var unsubscribe = subscribeToUserStatus(userId, function (status) {
            console.log("\uD83D\uDCCA Status atualizado para usu\u00E1rio ".concat(userId, ": ").concat(status));
            setIsOnline(status === "ONLINE");
        });
        return function () {
            console.log("\uD83D\uDCF4 Desinscrevendo do status do usu\u00E1rio ".concat(userId));
            if (unsubscribe)
                unsubscribe();
            setIsOnline(false); // Reset ao desinscrever
        };
    }, [userId, subscribeToUserStatus, isConnected]);
    return isOnline;
};
exports.useOnlineStatus = useOnlineStatus;
