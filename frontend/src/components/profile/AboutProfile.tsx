import {
  User,
  RulerDimensionLine,
  Footprints,
  MapPin,
  Weight,
} from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";

export default function AboutProfile() {
  return (
    <Card className="w-[30em] sm:w-[38em] md:w-[42.5em]">
      <CardHeader className="items-start">
        <CardTitle className="text-lg">Sobre</CardTitle>
        <CardDescription className="gap-2">
          Faça uma breve descrição sobre você, suas preferências e sua jornada
          atual.
        </CardDescription>
        <span>fale mais sobre voce isto seria uma descrição</span>
      </CardHeader>

      <CardFooter className="flex-col items-start">
        <div className="text-lg bg-red-4">Características</div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Idade:</span>
          <span className="text-sm mt-[0.1em]">25</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>Posição:</span>
          <span className="text-sm mt-[0.1em]">Atacante</span>
        </div>
        <div className="flex items-center gap-2">
          <Footprints className="h-4 w-4" />
          <span>Perna Dominante:</span>
          <span className="text-sm mt-[0.1em]">Direita</span>
        </div>
        <div className="flex items-center gap-2">
          <RulerDimensionLine className="h-4 w-4" />
          <span>Altura:</span>
          <span className="text-sm mt-[0.1em]">180cm</span>
        </div>
        <div className="flex items-center gap-2">
          <Weight className="h-4 w-4" />
          <span>Peso:</span>
          <span className="text-sm mt-[0.1em]">90kg</span>
        </div>
      </CardFooter>
    </Card>
  );
}
