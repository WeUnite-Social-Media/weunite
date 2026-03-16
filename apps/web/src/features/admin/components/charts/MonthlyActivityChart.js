"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthlyActivityChart = MonthlyActivityChart;
var card_1 = require("@/shared/components/ui/card");
var recharts_1 = require("recharts");
var ChartTooltips_1 = require("./ChartTooltips");
/**
 * Gráfico de atividade mensal mostrando posts e oportunidades
 */
function MonthlyActivityChart(_a) {
    var data = _a.data, colors = _a.colors;
    return (<card_1.Card className="md:col-span-2 hover:shadow-md transition-shadow duration-200">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-foreground">Atividade Mensal</card_1.CardTitle>
        <p className="text-sm text-muted-foreground">
          Posts e oportunidades criados por mês
        </p>
      </card_1.CardHeader>
      <card_1.CardContent>
        <recharts_1.ResponsiveContainer width="100%" height={300}>
          <recharts_1.LineChart data={data}>
            <recharts_1.CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
            <recharts_1.XAxis dataKey="month" className="text-xs fill-muted-foreground"/>
            <recharts_1.YAxis className="text-xs fill-muted-foreground"/>
            <recharts_1.Tooltip content={<ChartTooltips_1.CustomTooltip />}/>
            <recharts_1.Line type="monotone" dataKey="posts" stroke={colors.primary} strokeWidth={3} name="Posts" dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}/>
            <recharts_1.Line type="monotone" dataKey="opportunities" stroke={colors.secondary} strokeWidth={3} name="Oportunidades" dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: colors.secondary, strokeWidth: 2 }}/>
          </recharts_1.LineChart>
        </recharts_1.ResponsiveContainer>
      </card_1.CardContent>
    </card_1.Card>);
}
