"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityCategoryChart = OpportunityCategoryChart;
var card_1 = require("@/shared/components/ui/card");
var recharts_1 = require("recharts");
var ChartTooltips_1 = require("./ChartTooltips");
/**
 * Gráfico de barras mostrando oportunidades por categoria
 */
function OpportunityCategoryChart(_a) {
    var data = _a.data;
    return (<card_1.Card className="hover:shadow-md transition-shadow duration-200">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-foreground">
          Oportunidades por Categoria
        </card_1.CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de vagas por área de atuação
        </p>
      </card_1.CardHeader>
      <card_1.CardContent>
        <recharts_1.ResponsiveContainer width="100%" height={300}>
          <recharts_1.BarChart data={data}>
            <recharts_1.CartesianGrid strokeDasharray="3 3" className="opacity-30"/>
            <recharts_1.XAxis dataKey="category" className="text-xs fill-muted-foreground"/>
            <recharts_1.YAxis className="text-xs fill-muted-foreground"/>
            <recharts_1.Tooltip content={<ChartTooltips_1.CustomTooltip />}/>
            <recharts_1.Bar dataKey="count" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity">
              {data.map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={entry.fill}/>); })}
            </recharts_1.Bar>
          </recharts_1.BarChart>
        </recharts_1.ResponsiveContainer>
      </card_1.CardContent>
    </card_1.Card>);
}
