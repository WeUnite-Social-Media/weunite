"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsCard = StatsCard;
var card_1 = require("@/shared/components/ui/card");
var lucide_react_1 = require("lucide-react");
function StatsCard(_a) {
    var title = _a.title, value = _a.value, previousValue = _a.previousValue, icon = _a.icon, trend = _a.trend;
    var formatTrend = function (trend) {
        var absValue = Math.abs(trend);
        return "".concat(trend > 0 ? "+" : "").concat(absValue.toFixed(1), "%");
    };
    var getTrendColor = function (trend) {
        if (trend > 0)
            return "text-green-600";
        if (trend < 0)
            return "text-red-600";
        return "text-gray-600";
    };
    return (<card_1.Card className="hover:shadow-md transition-shadow duration-200">
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </card_1.CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend !== undefined && (<div className={"flex items-center text-xs mt-1 ".concat(getTrendColor(trend))}>
            {trend > 0 ? (<lucide_react_1.TrendingUp className="mr-1 h-3 w-3"/>) : trend < 0 ? (<lucide_react_1.TrendingDown className="mr-1 h-3 w-3"/>) : null}
            <span className="font-medium">{formatTrend(trend)}</span>
            {previousValue && (<span className="text-muted-foreground ml-1">
                vs. mês anterior
              </span>)}
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
