"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageList = void 0;
var react_1 = require("react");
var Message_1 = require("@/features/chat/components/Message");
var MessageList = function (_a) {
    var messages = _a.messages;
    var messagesEndRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    return (<div className="p-4 md:p-6 h-full">
      <div className="max-w-3xl mx-auto space-y-4 pb-4">
        {messages.map(function (message) { return (<Message_1.Message key={message.id} message={message}/>); })}
        <div ref={messagesEndRef}/>
      </div>
    </div>);
};
exports.MessageList = MessageList;
