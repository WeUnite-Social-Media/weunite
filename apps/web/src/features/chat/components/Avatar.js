"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Avatar = void 0;
var Avatar = function (_a) {
    var avatar = _a.avatar, avatarColor = _a.avatarColor, name = _a.name, _b = _a.size, size = _b === void 0 ? "md" : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    // Detecta se o avatar é uma URL de imagem
    var isImageUrl = avatar.startsWith("http") ||
        avatar.startsWith("data:") ||
        avatar.includes(".");
    // Define tamanhos
    var sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
    };
    var sizeClass = sizeClasses[size];
    if (isImageUrl) {
        return (<div className={"".concat(sizeClass, " rounded-full overflow-hidden ").concat(className)}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" onError={function (e) {
                // Fallback para iniciais se a imagem falhar
                var target = e.target;
                target.style.display = "none";
                if (target.parentElement) {
                    target.parentElement.innerHTML = "\n                <div class=\"".concat(avatarColor, " w-full h-full flex items-center justify-center font-medium\">\n                  ").concat(name
                        .split(" ")
                        .map(function (n) { return n[0]; })
                        .join("")
                        .toUpperCase(), "\n                </div>\n              ");
                }
            }}/>
      </div>);
    }
    // Renderiza iniciais
    return (<div className={"".concat(sizeClass, " rounded-full ").concat(avatarColor, " flex items-center justify-center font-medium ").concat(className)}>
      <span>{avatar}</span>
    </div>);
};
exports.Avatar = Avatar;
