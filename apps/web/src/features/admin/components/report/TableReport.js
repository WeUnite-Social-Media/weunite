"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableReportRow = TableReportRow;
var badge_1 = require("@/shared/components/ui/badge");
var button_1 = require("@/shared/components/ui/button");
var table_1 = require("@/shared/components/ui/table");
var lucide_react_1 = require("lucide-react");
function TableReportRow(_a) {
    var _b, _c;
    var reportedPost = _a.reportedPost, onReview = _a.onReview, getTimeAgo = _a.getTimeAgo;
    var getStatusBadge = function (status) {
        switch (status) {
            case "pending":
                return "border-yellow-500 text-yellow-600";
            case "hidden":
                return "border-orange-500 text-orange-600";
            case "deleted":
                return "border-red-500 text-red-600";
            default:
                return "border-gray-500 text-gray-600";
        }
    };
    var getStatusText = function (status) {
        switch (status) {
            case "pending":
                return "Pendente";
            case "hidden":
                return "Oculto";
            case "deleted":
                return "Deletado";
            default:
                return status;
        }
    };
    return (<table_1.TableRow key={reportedPost.post.id}>
      <table_1.TableCell className="max-w-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {reportedPost.post.user.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {reportedPost.post.text}
          </p>
          {reportedPost.post.imageUrl && (<div className="flex items-center gap-1 text-xs text-muted-foreground">
              <lucide_react_1.Image className="h-3 w-3"/>
              <span>Com mídia</span>
            </div>)}
        </div>
      </table_1.TableCell>
      <table_1.TableCell>
        <badge_1.Badge variant="destructive" className="bg-red-600">
          {reportedPost.totalReports} denúncias
        </badge_1.Badge>
      </table_1.TableCell>
      <table_1.TableCell>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1">
            <lucide_react_1.Heart className="h-3 w-3 text-red-500"/>
            <span>{((_b = reportedPost.post.likes) === null || _b === void 0 ? void 0 : _b.length) || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{((_c = reportedPost.post.comments) === null || _c === void 0 ? void 0 : _c.length) || 0}</span>
          </div>
        </div>
      </table_1.TableCell>
      <table_1.TableCell>
        <badge_1.Badge variant="outline" className={getStatusBadge(reportedPost.status)}>
          {getStatusText(reportedPost.status)}
        </badge_1.Badge>
      </table_1.TableCell>
      <table_1.TableCell className="text-sm text-muted-foreground">
        {getTimeAgo(reportedPost.post.createdAt)}
      </table_1.TableCell>
      <table_1.TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <button_1.Button variant="outline" size="sm" onClick={function () { return onReview(reportedPost); }}>
            Revisar
          </button_1.Button>
        </div>
      </table_1.TableCell>
    </table_1.TableRow>);
}
