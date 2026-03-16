"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_REPORT_REASONS = exports.MOCK_REPORTERS = exports.MOCK_USER_TYPE_DATA = exports.MOCK_MONTHLY_DATA = exports.MOCK_ADMIN_STATS = void 0;
/**
 * Dados mock para estatísticas do dashboard admin
 * TODO: Substituir por dados reais da API
 */
exports.MOCK_ADMIN_STATS = {
    totalPosts: 3842,
    totalOpportunities: 1245,
    activeUsers: 12458,
    engagementRate: 68.4,
    previousMonth: {
        totalPosts: 3432,
        totalOpportunities: 1145,
        activeUsers: 10842,
        engagementRate: 65.1,
    },
};
/**
 * Dados mock para atividade mensal
 * TODO: Substituir por dados reais da API
 */
exports.MOCK_MONTHLY_DATA = [
    { month: "Jan", posts: 150, opportunities: 45 },
    { month: "Fev", posts: 280, opportunities: 65 },
    { month: "Mar", posts: 200, opportunities: 55 },
    { month: "Abr", posts: 300, opportunities: 75 },
    { month: "Mai", posts: 250, opportunities: 85 },
    { month: "Jun", posts: 400, opportunities: 95 },
];
/**
 * Dados mock para tipos de usuário
 * TODO: Substituir por dados reais da API
 */
exports.MOCK_USER_TYPE_DATA = [
    { name: "Atletas", value: 8500 },
    { name: "Empresas", value: 3958 },
];
/**
 * Dados mock para denunciantes
 * TODO: Substituir por dados reais da API
 */
exports.MOCK_REPORTERS = [
    { name: "Maria Santos", username: "maria.santos" },
    { name: "João Silva", username: "joao.silva" },
    { name: "Ana Costa", username: "ana.costa" },
    { name: "Pedro Oliveira", username: "pedro.oliveira" },
];
/**
 * Dados mock para motivos de denúncia
 * TODO: Substituir por dados reais da API
 */
exports.MOCK_REPORT_REASONS = [
    { id: "inappropriate_content", label: "Conteúdo Inadequado" },
    { id: "harassment", label: "Assédio" },
    { id: "spam", label: "Spam" },
    { id: "fake_profile", label: "Perfil Falso" },
];
