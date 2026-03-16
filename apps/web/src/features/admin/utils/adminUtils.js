"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTrend = exports.getChartColors = void 0;
/**
 * Função que retorna as cores dos gráficos baseadas no tema atual
 * @param isDark - Se o tema atual é escuro
 * @returns Objeto com as cores adaptadas ao tema
 */
var getChartColors = function (isDark) { return ({
    primary: isDark ? "#1447e6" : "#f54900",
    secondary: isDark ? "#00bc7d" : "#009689",
    tertiary: isDark ? "#fe9a00" : "#104e64",
    quaternary: isDark ? "#ad46ff" : "#ffb900",
    danger: isDark ? "#ff2056" : "#fe9a00",
}); };
exports.getChartColors = getChartColors;
/**
 * Calcula a tendência percentual entre valores atual e anterior
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns Percentual de mudança
 */
var calculateTrend = function (current, previous) {
    if (previous === 0)
        return 0;
    return ((current - previous) / previous) * 100;
};
exports.calculateTrend = calculateTrend;
