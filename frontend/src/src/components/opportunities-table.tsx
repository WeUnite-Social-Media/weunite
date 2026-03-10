import { MoreHorizontal, Eye, Trash2, Edit } from "lucide-react";
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

const opportunities = [
  {
    id: 1,
    title: "Desenvolvedor Full Stack",
    company: "Tech Solutions",
    type: "CLT",
    location: "Remoto",
    applicants: 145,
    status: "ativa",
    date: "1 dia atrás",
  },
  {
    id: 2,
    title: "Designer UX/UI",
    company: "Creative Agency",
    type: "PJ",
    location: "São Paulo, SP",
    applicants: 89,
    status: "ativa",
    date: "2 dias atrás",
  },
  {
    id: 3,
    title: "Gerente de Marketing",
    company: "StartupXYZ",
    type: "CLT",
    location: "Híbrido",
    applicants: 234,
    status: "ativa",
    date: "3 dias atrás",
  },
  {
    id: 4,
    title: "Analista de Dados",
    company: "DataCorp",
    type: "Estágio",
    location: "Rio de Janeiro, RJ",
    applicants: 67,
    status: "pausada",
    date: "5 dias atrás",
  },
  {
    id: 5,
    title: "Product Manager",
    company: "Innovation Labs",
    type: "CLT",
    location: "Remoto",
    applicants: 312,
    status: "ativa",
    date: "1 semana atrás",
  },
];

export function OpportunitiesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oportunidades Recentes</CardTitle>
        <CardDescription>Vagas publicadas na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Candidatos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell>{opp.title}</TableCell>
                <TableCell>{opp.company}</TableCell>
                <TableCell>
                  <Badge variant="outline">{opp.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {opp.location}
                </TableCell>
                <TableCell>{opp.applicants}</TableCell>
                <TableCell>
                  <Badge
                    variant={opp.status === "pausada" ? "secondary" : "default"}
                  >
                    {opp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {opp.date}
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
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
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
