import { cn } from "@/shared/lib/utils";

type TermsOfUseArticleProps = {
  className?: string;
};

export function TermsOfUseArticle({ className }: TermsOfUseArticleProps) {
  return (
    <article
      className={cn(
        "space-y-8 text-sm leading-relaxed sm:text-base",
        className,
      )}
    >
      <section>
        <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
        <p className="mt-3 text-muted-foreground">
          Ao acessar e usar a plataforma WeUnite, você concorda em cumprir e
          ficar vinculado aos termos e condições desta página. Se você não
          concordar com qualquer parte destes termos, não deve usar nossos
          serviços.
        </p>
      </section>

      <section className="rounded-lg border border-primary/20 bg-primary/5 p-6">
        <h2 className="text-xl font-semibold text-primary">
          2. Elegibilidade e Menores de Idade
        </h2>
        <p className="mt-3 font-medium">
          O uso da WeUnite é permitido apenas para pessoas que possam celebrar
          contratos vinculativos segundo a legislação aplicável.
        </p>
        <div className="mt-4 rounded-md border border-primary/30 bg-background p-4">
          <h3 className="text-lg font-bold">Atenção: Usuários Menores de Idade</h3>
          <p className="mt-2">
            Para usuários menores de 18 anos, ou da idade de maioridade em sua
            jurisdição, o uso da plataforma deve ocorrer sob supervisão e
            acompanhamento de um pai ou responsável legal.
          </p>
          <p className="mt-2">
            Ao permitir que um menor utilize a plataforma, o responsável legal
            concorda com estes Termos de Uso e assume a responsabilidade pelo uso
            da conta, incluindo encargos financeiros e obrigações legais
            eventualmente decorrentes desse uso.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">3. Conta e Segurança</h2>
        <p className="mt-3 text-muted-foreground">
          Para acessar certos recursos da plataforma, você pode precisar criar
          uma conta. Você é responsável por manter a confidencialidade de suas
          credenciais de login e por todas as atividades realizadas em sua
          conta. Avise-nos imediatamente em caso de uso não autorizado.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">4. Conduta do Usuário</h2>
        <p className="mt-3 text-muted-foreground">
          Você concorda em não usar a plataforma para:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            Publicar conteúdo ilegal, ofensivo, ameaçador, difamatório ou que
            promova discurso de ódio e preconceito.
          </li>
          <li>Assediar, intimidar ou prejudicar outros usuários.</li>
          <li>Violar direitos de propriedade intelectual de terceiros.</li>
          <li>Distribuir spam, vírus ou qualquer outro código malicioso.</li>
          <li>Criar perfis falsos ou deturpar sua identidade.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold">5. Conteúdo Gerado pelo Usuário</h2>
        <p className="mt-3 text-muted-foreground">
          Ao publicar conteúdo na WeUnite, você concede à plataforma uma licença
          não exclusiva para usar, exibir e distribuir tal conteúdo dentro das
          funcionalidades do produto. Você mantém a propriedade do seu conteúdo,
          mas é responsável por garantir que ele não viole direitos de terceiros
          nem as nossas políticas.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">6. Modificações dos Termos</h2>
        <p className="mt-3 text-muted-foreground">
          Reservamo-nos o direito de modificar estes termos a qualquer momento.
          As alterações entram em vigor após a publicação na plataforma. O uso
          continuado da WeUnite após essas mudanças constitui sua aceitação da
          versão atualizada.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">7. Contato</h2>
        <p className="mt-3 text-muted-foreground">
          Em caso de dúvidas sobre estes Termos de Uso, utilize os canais de
          suporte disponibilizados pela WeUnite.
        </p>
      </section>
    </article>
  );
}
