"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGetOpportunities = exports.useGetOpportunitiesCompany = exports.useDeleteOpportunity = exports.useUpdateOpportunity = exports.useCreateOpportunity = exports.opportunityKeys = void 0;
var opportunityService_1 = require("@/features/opportunities/api/opportunityService");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
exports.opportunityKeys = {
    all: ["opportunities"],
    lists: function () { return __spreadArray(__spreadArray([], exports.opportunityKeys.all, true), ["list"], false); },
    list: function (filters) { return __spreadArray(__spreadArray([], exports.opportunityKeys.lists(), true), [{ filters: filters }], false); },
    details: function () { return __spreadArray(__spreadArray([], exports.opportunityKeys.all, true), ["detail"], false); },
    detail: function (id) { return __spreadArray(__spreadArray([], exports.opportunityKeys.details(), true), [id], false); },
};
var useCreateOpportunity = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, companyId = _a.companyId;
            return (0, opportunityService_1.createOpportunityRequest)(data, companyId);
        },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Oportunidade criada com sucesso!");
                queryClient.invalidateQueries({ queryKey: exports.opportunityKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao criar oportunidade");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao criar oportunidade");
        },
    });
};
exports.useCreateOpportunity = useCreateOpportunity;
var useUpdateOpportunity = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var data = _a.data, companyId = _a.companyId;
            return (0, opportunityService_1.updateOpportunityRequest)(companyId, data);
        },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Oportunidade atualizada com sucesso!");
                queryClient.invalidateQueries({ queryKey: exports.opportunityKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao atualizar oportunidade");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao atualizar oportunidade");
        },
    });
};
exports.useUpdateOpportunity = useUpdateOpportunity;
var useDeleteOpportunity = function () {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var opportunityId = _a.opportunityId, companyId = _a.companyId;
            return (0, opportunityService_1.deleteOpportunityRequest)(companyId, opportunityId);
        },
        onSuccess: function (result) {
            if (result.success) {
                sonner_1.toast.success(result.message || "Oportunidade deletada com sucesso!");
                queryClient.invalidateQueries({ queryKey: exports.opportunityKeys.lists() });
            }
            else {
                sonner_1.toast.error(result.message || "Erro ao deletar oportunidade");
            }
        },
        onError: function () {
            sonner_1.toast.error("Erro inesperado ao deletar oportunidade");
        },
    });
};
exports.useDeleteOpportunity = useDeleteOpportunity;
var useGetOpportunitiesCompany = function (companyId) {
    return (0, react_query_1.useQuery)({
        queryKey: exports.opportunityKeys.list("companyId=".concat(companyId)),
        queryFn: function () { return (0, opportunityService_1.getOpportunitiesCompanyRequest)(companyId); },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};
exports.useGetOpportunitiesCompany = useGetOpportunitiesCompany;
var useGetOpportunities = function () {
    return (0, react_query_1.useQuery)({
        queryKey: exports.opportunityKeys.lists(),
        queryFn: opportunityService_1.getOpportunitiesRequest,
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
};
exports.useGetOpportunities = useGetOpportunities;
