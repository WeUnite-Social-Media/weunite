"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthMessages = useAuthMessages;
var useAuthStore_1 = require("@/features/auth/stores/useAuthStore");
var react_1 = require("react");
var sonner_1 = require("sonner");
function useAuthMessages() {
    (0, react_1.useEffect)(function () {
        var unsubscribe = useAuthStore_1.useAuthStore.subscribe(function (state) {
            if (state.message) {
                sonner_1.toast.success(state.message, { position: "top-center" });
                useAuthStore_1.useAuthStore.getState().clearMessages();
            }
            if (state.error) {
                sonner_1.toast.error(state.error, { position: "top-center" });
                useAuthStore_1.useAuthStore.getState().clearMessages();
            }
        });
        return function () { return unsubscribe(); };
    }, []);
}
