import type { ReactNode } from "react";
import { differenceInYears, parseISO } from "date-fns";
import {
  Building2,
  Calendar,
  Footprints,
  Ruler,
  Target,
  Weight,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { User } from "@/shared/types/user.types";

interface AboutProfileProps {
  user?: User | null;
}

export default function AboutProfile({ user }: AboutProfileProps) {
  const isAthlete = user?.role === "athlete";
  const isCompany = user?.role === "company";
  const age =
    user?.birthDate && !Number.isNaN(Date.parse(user.birthDate))
      ? differenceInYears(new Date(), parseISO(user.birthDate))
      : null;

  return (
    <Card className="w-full max-w-3xl border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Sobre
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {user?.bio || "Nenhuma descricao informada."}
        </div>

        {isAthlete && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Caracteristicas
              </h3>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <CharacteristicItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Idade"
                  value={age ? `${age} anos` : "N/A"}
                />
                <CharacteristicItem
                  icon={<Target className="h-4 w-4" />}
                  label="Posicao"
                  value={user?.position || "N/A"}
                />
                <CharacteristicItem
                  icon={<Footprints className="h-4 w-4" />}
                  label="Pe dominante"
                  value={user?.footDomain || "N/A"}
                />
                <CharacteristicItem
                  icon={<Ruler className="h-4 w-4" />}
                  label="Altura"
                  value={user?.height ? `${user.height}m` : "N/A"}
                />
                <CharacteristicItem
                  icon={<Weight className="h-4 w-4" />}
                  label="Peso"
                  value={user?.weight ? `${user.weight}kg` : "N/A"}
                />
              </div>
            </div>
          </>
        )}

        {isCompany && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Informacoes da empresa
              </h3>

              <CharacteristicItem
                icon={<Building2 className="h-4 w-4" />}
                label="CNPJ"
                value={formatCnpj(user?.cnpj)}
              />
            </div>
          </>
        )}

        {!!user?.skills?.length && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Habilidades
              </h3>

              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="px-3 py-1 text-xs font-normal bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function formatCnpj(cnpj?: string) {
  const digits = cnpj?.replace(/\D/g, "");
  if (!digits || digits.length !== 14) {
    return cnpj || "N/A";
  }

  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  );
}

function CharacteristicItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
