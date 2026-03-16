"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = void 0;
exports.ThemeProvider = ThemeProvider;
var react_1 = require("react");
var initialState = {
    theme: "system",
    setTheme: function () { return null; },
};
var ThemeProviderContext = (0, react_1.createContext)(initialState);
function ThemeProvider(_a) {
    var children = _a.children, _b = _a.defaultTheme, defaultTheme = _b === void 0 ? "system" : _b, _c = _a.storageKey, storageKey = _c === void 0 ? "vite-ui-theme" : _c, props = __rest(_a, ["children", "defaultTheme", "storageKey"]);
    var _d = (0, react_1.useState)(function () { return localStorage.getItem(storageKey) || defaultTheme; }), theme = _d[0], setTheme = _d[1];
    (0, react_1.useEffect)(function () {
        var root = window.document.documentElement;
        root.classList.remove("light", "dark");
        if (theme === "system") {
            var systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            return;
        }
        root.classList.add(theme);
    }, [theme]);
    var value = {
        theme: theme,
        setTheme: function (theme) {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };
    return (<ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>);
}
var useTheme = function () {
    var context = (0, react_1.useContext)(ThemeProviderContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
exports.useTheme = useTheme;
