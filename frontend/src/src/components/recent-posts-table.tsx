import { MoreHorizontal, Eye, Trash2, Flag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

const recentPosts = [
  {
    id: 1,
    author: "Maria Silva",
    authorInitials: "MS",
    content: "Acabei de lançar meu novo projeto! Confira...",
    likes: 234,
    comments: 45,
    status: "ativo",
    date: "2 horas atrás",
  },
  {
    id: 2,
    author: "João Santos",
    authorInitials: "JS",
    content: "Dicas essenciais para networking efetivo",
    likes: 189,
    comments: 32,
    status: "ativo",
    date: "5 horas atrás",
  },
  {
    id: 3,
    author: "Ana Costa",
    authorInitials: "AC",
    content: "Workshop gratuito sobre React e TypeScript",
    likes: 567,
    comments: 78,
    status: "ativo",
    date: "1 dia atrás",
  },
  {
    id: 4,
    author: "Pedro Lima",
    authorInitials: "PL",
    content: "Conteúdo reportado por usuários",
    likes: 12,
    comments: 3,
    status: "reportado",
    date: "2 dias atrás",
  },
  {
    id: 5,
    author: "Carla Mendes",
    authorInitials: "CM",
    content: "Como conquistei minha vaga dos sonhos",
    likes: 421,
    comments: 67,
    status: "ativo",
    date: "3 dias atrás",
  },
];

export function RecentPostsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts Recentes</CardTitle>
        <CardDescription>Últimas publicações na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Autor</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Engajamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{post.authorInitials}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {post.content}
                </TableCell>
                <TableCell>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "reportado" ? "destructive" : "secondary"
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.date}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag className="mr-2 h-4 w-4" />
                        Marcar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
