"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBreakpoints = useBreakpoints;
var useMediaQuery_1 = require("./useMediaQuery");
function useBreakpoints() {
    var isMobile = (0, useMediaQuery_1.useMediaQuery)("(max-width: 480px)");
    var isTablet = (0, useMediaQuery_1.useMediaQuery)("(min-width: 481px) and (max-width: 768px)");
    var isSmallDesktop = (0, useMediaQuery_1.useMediaQuery)("(min-width: 769px) and (max-width: 1289px)");
    var isDesktop = (0, useMediaQuery_1.useMediaQuery)("(min-width: 1290px)");
    var commentDesktop = (0, useMediaQuery_1.useMediaQuery)("(min-width: 1100px)");
    var maxLeftSideBar = (0, useMediaQuery_1.useMediaQuery)("(max-width: 891px)");
    var headerProfileDesktop = (0, useMediaQuery_1.useMediaQuery)("(min-width: 1100px)");
    return {
        isMobile: isMobile,
        isTablet: isTablet,
        isSmallDesktop: isSmallDesktop,
        isDesktop: isDesktop,
        commentDesktop: commentDesktop,
        maxLeftSideBar: maxLeftSideBar,
        headerProfileDesktop: headerProfileDesktop,
    };
}
