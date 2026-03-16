"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTooltip = CustomTooltip;
exports.PieTooltip = PieTooltip;
/**
 * Tooltip customizado para gráficos de linha e barra
 * Segue o padrão visual do shadcn/ui
 */
function CustomTooltip(_a) {
    var active = _a.active, payload = _a.payload, label = _a.label;
    if (active && payload && payload.length) {
        return (<div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map(function (entry, index) { return (<p key={index} className="text-sm" style={{ color: entry.color }}>
            {"".concat(entry.name, ": ").concat(entry.value.toLocaleString())}
          </p>); })}
      </div>);
    }
    return null;
}
/**
 * Tooltip específico para gráfico de pizza
 * Mostra percentuais e formatação específica
 */
function PieTooltip(_a) {
    var active = _a.active, payload = _a.payload;
    if (active && payload && payload.length) {
        var data = payload[0];
        var totalUsers = 8500 + 3958; // TODO: Calcular dinamicamente
        return (<div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value.toLocaleString()} usuários
        </p>
        <p className="text-xs text-muted-foreground">
          {((data.value / totalUsers) * 100).toFixed(1)}%
        </p>
      </div>);
    }
    return null;
}
