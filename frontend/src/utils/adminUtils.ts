import type { ChartColors } from "@/@types/admin.types";

/**
 * Função que retorna as cores dos gráficos baseadas no tema atual
 * @param isDark - Se o tema atual é escuro
 * @returns Objeto com as cores adaptadas ao tema
 */
export const getChartColors = (isDark: boolean): ChartColors => ({
  primary: isDark ? "#1447e6" : "#f54900",
  secondary: isDark ? "#00bc7d" : "#009689",
  tertiary: isDark ? "#fe9a00" : "#104e64",
  quaternary: isDark ? "#ad46ff" : "#ffb900",
  danger: isDark ? "#ff2056" : "#fe9a00",
});

/**
 * Calcula a tendência percentual entre valores atual e anterior
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns Percentual de mudança
 */
export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
