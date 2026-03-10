# Sistema de Denúncias (Reports)

## Visão Geral

Sistema completo para gerenciar denúncias de posts e oportunidades, permitindo que usuários reportem conteúdo inadequado e administradores revisem e tomem ações.

## Estrutura Criada

### 1. Entidade Report (`domain/report/Report.java`)
- Armazena informações sobre cada denúncia
- **Enums internos**:
  - `ReportType`: POST, OPPORTUNITY
  - `ReportStatus`: PENDING, REVIEWED, DISMISSED
- Relacionamento com User (denunciante)
- Campo `entityId` para referenciar post ou oportunidade denunciada

### 2. DTOs
- **ReportRequestDTO**: Para criar uma nova denúncia
- **ReportDTO**: Retorno completo de uma denúncia
- **ReportSummaryDTO**: Resumo de denúncias agrupadas por entidade

### 3. Repository (`ReportRepository`)
- Query para encontrar entidades com muitas denúncias
- Contagem de denúncias por entidade
- Busca de denúncias pendentes

### 4. Services
- **ReportService**: Gerencia criação e consulta de denúncias
- **AdminService**: Gerencia ações administrativas (excluir, descartar denúncias)

### 5. Controllers
- **ReportController**: Endpoints para usuários denunciarem
- **AdminController**: Endpoints administrativos

## Endpoints

### Usuários (ReportController)

#### Criar Denúncia
```
POST /api/reports/create/{userId}
Body: {
    "type": "POST" ou "OPPORTUNITY",
    "entityId": 123,
    "reason": "Conteúdo inapropriado"
}
```

#### Listar Denúncias Pendentes
```
GET /api/reports/pending
```

#### Contar Denúncias de uma Entidade
```
GET /api/reports/count/{entityId}/{type}
Exemplo: /api/reports/count/123/POST
```

### Administradores (AdminController)

#### Ver Posts com Muitas Denúncias (≥5)
```
GET /api/admin/posts/reported
Retorna: [
    {
        "entityId": 123,
        "entityType": "POST",
        "reportCount": 7
    }
]
```

#### Ver Oportunidades com Muitas Denúncias (≥5)
```
GET /api/admin/opportunities/reported
```

#### Excluir Post Denunciado
```
DELETE /api/admin/posts/{postId}
```

#### Excluir Oportunidade Denunciada
```
DELETE /api/admin/opportunities/{opportunityId}
```

#### Descartar Denúncias (manter conteúdo)
```
PUT /api/admin/reports/dismiss/{entityId}/{type}
Exemplo: /api/admin/reports/dismiss/123/POST
```

## Fluxo de Uso

### 1. Usuário Denuncia Conteúdo
```javascript
// Frontend
fetch('/api/reports/create/1', {
    method: 'POST',
    body: JSON.stringify({
        type: 'POST',
        entityId: 456,
        reason: 'Spam ou conteúdo enganoso'
    })
});
```

### 2. Sistema Acumula Denúncias
- Cada denúncia é salva com status `PENDING`
- Quando um post/oportunidade atingir 5+ denúncias, aparece na lista do admin

### 3. Admin Revisa
```javascript
// Ver posts reportados
fetch('/api/admin/posts/reported')
  .then(res => res.json())
  .then(data => {
      // data = [{ entityId: 123, entityType: 'POST', reportCount: 7 }]
  });
```

### 4. Admin Toma Ação

**Opção A: Excluir conteúdo**
```javascript
fetch('/api/admin/posts/123', { method: 'DELETE' });
// As denúncias são marcadas como REVIEWED
```

**Opção B: Descartar denúncias**
```javascript
fetch('/api/admin/reports/dismiss/123/POST', { method: 'PUT' });
// As denúncias são marcadas como DISMISSED
// O conteúdo permanece
```

## Configuração

### Limite de Denúncias
O limite padrão é **5 denúncias**. Para alterar, edite `AdminService.java`:

```java
private static final Long REPORT_THRESHOLD = 5L; // Altere aqui
```

## Tabela no Banco de Dados

A entidade `Report` criará a seguinte tabela:

```sql
CREATE TABLE report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reporter_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    entity_id BIGINT NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (reporter_id) REFERENCES tb_user(id)
);
```

## Próximos Passos

1. **Adicionar Autenticação**: Proteger endpoints do AdminController com `@PreAuthorize("hasRole('ADMIN')")`
2. **Validações**: Adicionar validações em `ReportRequestDTO`
3. **Notificações**: Notificar admins quando limite de denúncias for atingido
4. **Dashboard**: Criar interface visual para admins gerenciarem denúncias
5. **Histórico**: Adicionar campo de observações do admin ao revisar denúncias

## Exemplo de Integração no Frontend

```typescript
// Botão de denunciar post
async function reportPost(postId: number, userId: number) {
    const response = await fetch(`/api/reports/create/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'POST',
            entityId: postId,
            reason: 'Conteúdo ofensivo'
        })
    });
    
    if (response.ok) {
        alert('Denúncia registrada com sucesso!');
    }
}

// Dashboard do admin
async function loadReportedContent() {
    const posts = await fetch('/api/admin/posts/reported').then(r => r.json());
    const opportunities = await fetch('/api/admin/opportunities/reported').then(r => r.json());
    
    // Renderizar lista de conteúdos denunciados
    return { posts, opportunities };
}
```

