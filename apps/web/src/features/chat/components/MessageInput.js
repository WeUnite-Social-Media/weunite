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
exports.MessageInput = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/shared/components/ui/button");
var textarea_1 = require("@/shared/components/ui/textarea");
var emoji_picker_react_1 = require("emoji-picker-react");
var useChat_1 = require("@/features/chat/state/useChat");
var sonner_1 = require("sonner");
var AudioRecorder_1 = require("@/features/chat/components/AudioRecorder");
var MessageInput = function (_a) {
    var conversationId = _a.conversationId, senderId = _a.senderId, onSendMessage = _a.onSendMessage;
    var _b = (0, react_1.useState)(""), message = _b[0], setMessage = _b[1];
    var _c = (0, react_1.useState)(false), showEmojiPicker = _c[0], setShowEmojiPicker = _c[1];
    var _d = (0, react_1.useState)([]), selectedFiles = _d[0], setSelectedFiles = _d[1];
    var textareaRef = (0, react_1.useRef)(null);
    var emojiPickerRef = (0, react_1.useRef)(null);
    var emojiButtonRef = (0, react_1.useRef)(null);
    var fileInputRef = (0, react_1.useRef)(null);
    var uploadMutation = (0, useChat_1.useUploadMessageFile)();
    var handleInputChange = function (e) {
        setMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = "".concat(Math.min(textareaRef.current.scrollHeight, 120), "px");
        }
    };
    var handleKeyDown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    // ✅ Fecha o emoji picker ao clicar fora ou pressionar ESC
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (showEmojiPicker &&
                emojiPickerRef.current &&
                emojiButtonRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                !emojiButtonRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        var handleEscapeKey = function (event) {
            if (event.key === "Escape" && showEmojiPicker) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
        return function () {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [showEmojiPicker]);
    var handleEmojiClick = function (emojiData) {
        if (textareaRef.current) {
            var start_1 = textareaRef.current.selectionStart;
            var end = textareaRef.current.selectionEnd;
            var text = message;
            var before = text.substring(0, start_1);
            var after = text.substring(end, text.length);
            var newMessage = before + emojiData.emoji + after;
            setMessage(newMessage);
            setTimeout(function () {
                if (textareaRef.current) {
                    var newCursorPos = start_1 + emojiData.emoji.length;
                    textareaRef.current.selectionStart = newCursorPos;
                    textareaRef.current.selectionEnd = newCursorPos;
                    textareaRef.current.focus();
                }
            }, 0);
        }
    };
    var handleFileSelect = function (event) {
        var files = Array.from(event.target.files || []);
        var maxSize = 10 * 1024 * 1024;
        var invalidFiles = files.filter(function (file) { return file.size > maxSize; });
        if (invalidFiles.length > 0) {
            sonner_1.toast.error("Alguns arquivos excedem 10MB");
            return;
        }
        var newFiles = files.map(function (file) {
            var isImage = file.type.startsWith("image/");
            return {
                file: file,
                type: isImage ? "image" : "file",
                preview: isImage ? URL.createObjectURL(file) : undefined,
            };
        });
        setSelectedFiles(function (prev) { return __spreadArray(__spreadArray([], prev, true), newFiles, true); });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    var handleRemoveFile = function (index) {
        setSelectedFiles(function (prev) {
            var newFiles = __spreadArray([], prev, true);
            var removed = newFiles.splice(index, 1)[0];
            if (removed.preview) {
                URL.revokeObjectURL(removed.preview);
            }
            return newFiles;
        });
    };
    var handleSendAudio = function (audioBlob) { return __awaiter(void 0, void 0, void 0, function () {
        var audioFile, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    audioFile = new File([audioBlob], "audio-".concat(Date.now(), ".webm"), {
                        type: "audio/webm",
                    });
                    return [4 /*yield*/, uploadMutation.mutateAsync({
                            conversationId: conversationId,
                            senderId: senderId,
                            file: audioFile,
                            fileType: "audio",
                        })];
                case 1:
                    result = _a.sent();
                    if (result.success && result.data) {
                        onSendMessage(result.data.fileUrl, "AUDIO");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Erro ao enviar áudio:", error_1);
                    sonner_1.toast.error("Erro ao enviar áudio");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSend = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _i, selectedFiles_1, filePreview, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(selectedFiles.length > 0)) return [3 /*break*/, 7];
                    _i = 0, selectedFiles_1 = selectedFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < selectedFiles_1.length)) return [3 /*break*/, 6];
                    filePreview = selectedFiles_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, uploadMutation.mutateAsync({
                            conversationId: conversationId,
                            senderId: senderId,
                            file: filePreview.file,
                        })];
                case 3:
                    result = _a.sent();
                    if (result.success && result.data) {
                        onSendMessage(result.data.fileUrl, filePreview.type === "image" ? "IMAGE" : "FILE");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("Erro ao enviar arquivo:", error_2);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    selectedFiles.forEach(function (fp) {
                        if (fp.preview)
                            URL.revokeObjectURL(fp.preview);
                    });
                    setSelectedFiles([]);
                    _a.label = 7;
                case 7:
                    if (message.trim()) {
                        onSendMessage(message.trim(), "TEXT");
                        setMessage("");
                        if (textareaRef.current) {
                            textareaRef.current.style.height = "auto";
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<div className="p-3 md:p-3 border-t border-border bg-card relative">
      {selectedFiles.length > 0 && (<div className="mb-3 flex flex-wrap gap-2 max-w-3xl mx-auto">
          {selectedFiles.map(function (filePreview, index) { return (<div key={index} className="relative rounded-lg border bg-muted p-2 flex items-center gap-2">
              {filePreview.type === "image" && filePreview.preview ? (<img src={filePreview.preview} alt={filePreview.file.name} className="h-16 w-16 rounded object-cover"/>) : (<div className="h-16 w-16 rounded bg-muted-foreground/10 flex items-center justify-center">
                  <lucide_react_1.File className="h-8 w-8 text-muted-foreground"/>
                </div>)}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(filePreview.file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button_1.Button variant="ghost" size="icon" className="h-6 w-6" onClick={function () { return handleRemoveFile(index); }}>
                <lucide_react_1.X className="h-4 w-4"/>
              </button_1.Button>
            </div>); })}
        </div>)}

      <div className="flex items-center gap-1 max-w-3xl mx-auto">
        <div className="relative shrink-0">
          <button_1.Button ref={emojiButtonRef} type="button" variant="ghost" size="icon" onClick={function () { return setShowEmojiPicker(!showEmojiPicker); }} className={showEmojiPicker ? "bg-accent" : ""}>
            <lucide_react_1.Smile size={20}/>
          </button_1.Button>

          {showEmojiPicker && (<div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <emoji_picker_react_1.default onEmojiClick={handleEmojiClick} theme={emoji_picker_react_1.Theme.AUTO} width={window.innerWidth < 400 ? 280 : 320} height={400} searchPlaceHolder="Pesquisar emoji..." previewConfig={{
                showPreview: false,
            }} lazyLoadEmojis={true}/>
            </div>)}
        </div>

        <button_1.Button type="button" variant="ghost" size="icon" onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} disabled={uploadMutation.isPending} className="shrink-0">
          <lucide_react_1.Paperclip size={20}/>
        </button_1.Button>

        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden"/>

        <textarea_1.Textarea ref={textareaRef} value={message} onChange={handleInputChange} onKeyDown={handleKeyDown} className="flex-1 min-w-0 min-h-[40px] max-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring" placeholder="Digite sua mensagem..." rows={1}/>
        {message.trim() || selectedFiles.length > 0 ? (<button_1.Button type="button" size="icon" onClick={handleSend} disabled={uploadMutation.isPending} className="shrink-0">
            <lucide_react_1.Send size={18}/>
          </button_1.Button>) : (<AudioRecorder_1.AudioRecorder onSendAudio={handleSendAudio}/>)}
      </div>

      {uploadMutation.isPending && (<p className="text-xs text-muted-foreground mt-2 text-center">
          Enviando arquivo...
        </p>)}
    </div>);
};
exports.MessageInput = MessageInput;
