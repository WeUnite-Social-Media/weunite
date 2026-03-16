"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessagePreview = void 0;
var formatMessagePreview = function (content) {
    if (!content)
        return "Sem mensagens";
    var isFileUrl = content.startsWith("/uploads/") || content.startsWith("http");
    if (isFileUrl) {
        var isImage = content.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        if (isImage) {
            return "📷 Foto";
        }
        return "Arquivo";
    }
    return content;
};
exports.formatMessagePreview = formatMessagePreview;
