"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTypeDistributionChart = UserTypeDistributionChart;
var card_1 = require("@/shared/components/ui/card");
var recharts_1 = require("recharts");
var ChartTooltips_1 = require("./ChartTooltips");
/**
 * Gráfico de pizza mostrando distribuição de tipos de usuário
 */
function UserTypeDistributionChart(_a) {
    var data = _a.data, colors = _a.colors;
    return (<card_1.Card className="hover:shadow-md transition-shadow duration-200">
      <card_1.CardHeader>
        <card_1.CardTitle className="text-foreground">Tipos de Usuário</card_1.CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição por categoria
        </p>
      </card_1.CardHeader>
      <card_1.CardContent>
        <recharts_1.ResponsiveContainer width="100%" height={300}>
          <recharts_1.PieChart>
            <recharts_1.Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              <recharts_1.Cell fill={colors.primary}/>
              <recharts_1.Cell fill={colors.secondary}/>
            </recharts_1.Pie>
            <recharts_1.Tooltip content={<ChartTooltips_1.PieTooltip />}/>
          </recharts_1.PieChart>
        </recharts_1.ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }}/>
            <span className="text-sm text-foreground">Atletas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }}/>
            <span className="text-sm text-foreground">Empresas</span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
