"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ImageModal_1 = require("@/features/chat/components/ImageModal");
var Message = function (_a) {
    var message = _a.message;
    var isSender = message.sender === "me";
    var _b = (0, react_1.useState)(false), showImageModal = _b[0], setShowImageModal = _b[1];
    var _c = (0, react_1.useState)(false), isPlaying = _c[0], setIsPlaying = _c[1];
    var _d = (0, react_1.useState)(null), audioRef = _d[0], setAudioRef = _d[1];
    var isImageUrl = function (text) {
        return text.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    };
    var isAudioUrl = function (text) {
        return text.match(/\.(mp3|wav|ogg|m4a|webm)$/i);
    };
    var isFileUrl = function (text) {
        return text.startsWith("/uploads/") || text.startsWith("http");
    };
    var getFileName = function (url) {
        return url.split("/").pop() || "arquivo";
    };
    var hasImage = isFileUrl(message.text) && isImageUrl(message.text);
    var handleAudioPlayPause = function () {
        if (audioRef) {
            if (isPlaying) {
                audioRef.pause();
            }
            else {
                audioRef.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    var renderContent = function () {
        if (isFileUrl(message.text)) {
            var fullUrl = "http://localhost:8080".concat(message.text);
            if (isImageUrl(message.text)) {
                return (<>
            <div className="w-[240px] md:w-[280px] h-[240px] md:h-[280px]">
              <img src={fullUrl} alt="Imagem enviada" className="rounded-lg w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity hover:scale-[1.02] duration-200" onClick={function () { return setShowImageModal(true); }}/>
            </div>
            {showImageModal && (<ImageModal_1.ImageModal imageUrl={fullUrl} onClose={function () { return setShowImageModal(false); }}/>)}
          </>);
            }
            else if (isAudioUrl(message.text)) {
                return (<div className="flex items-center gap-3 min-w-[200px]">
            <button onClick={handleAudioPlayPause} className="p-2 rounded-full hover:bg-opacity-80 transition-colors">
              {isPlaying ? <lucide_react_1.Pause size={20}/> : <lucide_react_1.Play size={20}/>}
            </button>
            <div className="flex-1">
              <audio ref={setAudioRef} src={fullUrl} onEnded={function () { return setIsPlaying(false); }} onPause={function () { return setIsPlaying(false); }} onPlay={function () { return setIsPlaying(true); }} className="w-full" controls/>
            </div>
          </div>);
            }
            else {
                return (<a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
            <lucide_react_1.FileText size={20}/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getFileName(message.text)}
              </p>
              <p className="text-xs opacity-70">Clique para baixar</p>
            </div>
            <lucide_react_1.Download size={16}/>
          </a>);
            }
        }
        return (<p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>);
    };
    return (<div className={"flex ".concat(isSender ? "justify-end" : "justify-start")}>
      <div className={"max-w-[85%] md:max-w-[80%] ".concat(isSender ? "order-1" : "order-2")}>
        <div className={"".concat(hasImage ? "p-1" : "p-2 md:p-3", " rounded-lg ").concat(isSender
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border border-border")}>
          {renderContent()}
        </div>
        <div className={"flex items-center mt-1 text-xs text-muted-foreground ".concat(isSender ? "justify-end" : "justify-start")}>
          <span>{message.time}</span>
          {isSender && (<span className="ml-1 flex items-center">
              <lucide_react_1.Check size={12} className={message.read ? "text-primary" : ""}/>
              <lucide_react_1.Check size={12} className={"-ml-1 ".concat(message.read ? "text-primary" : "")}/>
            </span>)}
        </div>
      </div>
    </div>);
};
exports.Message = Message;
