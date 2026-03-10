import { useState } from "react";
import { PostReviewModal } from "@/components/admin/PostReviewModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/@types/post.types";
import { AdminLayout } from "@/components/admin/AdminLayout";

/**
 * Página de demonstração do modal de revisão de posts
 * Use esta página para testar o componente antes do backend estar pronto
 */
export function AdminModerationDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Post de exemplo para demonstração
  const mockPost: Post = {
    id: "1",
    text: "Sistema de design: por que sua empresa precisa de um e como começar. Guia prático baseado na minha experiência liderando o design system da empresa.",
    imageUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
    updatedAt: new Date().toISOString(),
    user: {
      id: "123",
      username: "roberto.nunes",
      name: "Roberto Nunes",
      email: "roberto@example.com",
      password: "",
      role: "athlete" as const,
      profileImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
      isAdmin: false,
    },
    likes: [],
    comments: [],
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Demo: Moderação de Posts</h1>
          <p className="text-muted-foreground">
            Teste o modal de revisão de denúncias antes do backend estar pronto
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Denunciado (Exemplo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={mockPost.user.profileImg}
                alt={mockPost.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{mockPost.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  @{mockPost.user.username}
                </p>
              </div>
            </div>

            <p className="text-sm">{mockPost.text}</p>

            {mockPost.imageUrl && (
              <img
                src={mockPost.imageUrl}
                alt="Post"
                className="rounded-lg w-full max-w-md"
              />
            )}

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>❤️ 734 curtidas</span>
              <span>💬 98 comentários</span>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Abrir Modal de Revisão
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              ℹ️ Informações de Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• Este é um ambiente de demonstração com dados mockados</p>
            <p>
              • As ações de "Ocultar" e "Deletar" apenas exibem mensagens no
              console
            </p>
            <p>
              • Quando o backend estiver pronto, as ações serão executadas na
              API real
            </p>
            <p>• Abra o DevTools (F12) para ver os logs das ações</p>
          </CardContent>
        </Card>

        <PostReviewModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          post={mockPost}
        />
      </div>
    </AdminLayout>
  );
}
