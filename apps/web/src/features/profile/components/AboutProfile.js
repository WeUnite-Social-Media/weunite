"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AboutProfile;
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/shared/components/ui/card");
function AboutProfile() {
    return (<card_1.Card className="w-[30em] sm:w-[38em] md:w-[42.5em]">
      <card_1.CardHeader className="items-start">
        <card_1.CardTitle className="text-lg">Sobre</card_1.CardTitle>
        <card_1.CardDescription className="gap-2">
          Faça uma breve descrição sobre você, suas preferências e sua jornada
          atual.
        </card_1.CardDescription>
        <span>fale mais sobre voce isto seria uma descrição</span>
      </card_1.CardHeader>

      <card_1.CardFooter className="flex-col items-start">
        <div className="text-lg bg-red-4">Características</div>
        <div className="flex items-center gap-2">
          <lucide_react_1.User className="h-4 w-4"/>
          <span>Idade:</span>
          <span className="text-sm mt-[0.1em]">25</span>
        </div>
        <div className="flex items-center gap-2">
          <lucide_react_1.MapPin className="h-4 w-4"/>
          <span>Posição:</span>
          <span className="text-sm mt-[0.1em]">Atacante</span>
        </div>
        <div className="flex items-center gap-2">
          <lucide_react_1.Footprints className="h-4 w-4"/>
          <span>Perna Dominante:</span>
          <span className="text-sm mt-[0.1em]">Direita</span>
        </div>
        <div className="flex items-center gap-2">
          <lucide_react_1.RulerDimensionLine className="h-4 w-4"/>
          <span>Altura:</span>
          <span className="text-sm mt-[0.1em]">180cm</span>
        </div>
        <div className="flex items-center gap-2">
          <lucide_react_1.Weight className="h-4 w-4"/>
          <span>Peso:</span>
          <span className="text-sm mt-[0.1em]">90kg</span>
        </div>
      </card_1.CardFooter>
    </card_1.Card>);
}
