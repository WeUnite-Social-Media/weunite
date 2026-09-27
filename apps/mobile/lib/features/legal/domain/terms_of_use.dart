/// Terms of Use, word for word from the web article so both clients show the
/// same document: `apps/web/src/features/legal/components/TermsOfUseArticle.tsx`
/// and `apps/web/src/features/legal/constants/termsOfUse.ts`.
///
/// There is no separate privacy policy anywhere in the project, so the sign-up
/// forms link to these terms only — the same single link the web offers.
library;

/// `TERMS_OF_USE_LAST_UPDATED`.
const String kTermsOfUseLastUpdated = '28/03/2026';

class TermsSection {
  const TermsSection({
    required this.title,
    required this.paragraphs,
    this.highlighted = false,
    this.bullets = const [],
  });

  final String title;
  final List<String> paragraphs;

  /// Section 2 is boxed and coloured on the web; on the phone it gets a tinted
  /// card so the minors notice keeps standing out.
  final bool highlighted;
  final List<String> bullets;
}

const List<TermsSection> kTermsOfUseSections = [
  TermsSection(
    title: '1. Aceitação dos Termos',
    paragraphs: [
      'Ao acessar e usar a plataforma WeUnite, você concorda em cumprir e '
          'ficar vinculado aos termos e condições desta página. Se você não '
          'concordar com qualquer parte destes termos, não deve usar nossos '
          'serviços.',
    ],
  ),
  TermsSection(
    title: '2. Elegibilidade e Menores de Idade',
    highlighted: true,
    paragraphs: [
      'O uso da WeUnite é permitido apenas para pessoas que possam celebrar '
          'contratos vinculativos segundo a legislação aplicável.',
      'Atenção: Usuários Menores de Idade',
      'Para usuários menores de 18 anos, ou da idade de maioridade em sua '
          'jurisdição, o uso da plataforma deve ocorrer sob supervisão e '
          'acompanhamento de um pai ou responsável legal.',
      'Ao permitir que um menor utilize a plataforma, o responsável legal '
          'concorda com estes Termos de Uso e assume a responsabilidade pelo '
          'uso da conta, incluindo encargos financeiros e obrigações legais '
          'eventualmente decorrentes desse uso.',
    ],
  ),
  TermsSection(
    title: '3. Conta e Segurança',
    paragraphs: [
      'Para acessar certos recursos da plataforma, você pode precisar criar '
          'uma conta. Você é responsável por manter a confidencialidade de '
          'suas credenciais de login e por todas as atividades realizadas em '
          'sua conta. Avise-nos imediatamente em caso de uso não autorizado.',
    ],
  ),
  TermsSection(
    title: '4. Conduta do Usuário',
    paragraphs: ['Você concorda em não usar a plataforma para:'],
    bullets: [
      'Publicar conteúdo ilegal, ofensivo, ameaçador, difamatório ou que '
          'promova discurso de ódio e preconceito.',
      'Assediar, intimidar ou prejudicar outros usuários.',
      'Violar direitos de propriedade intelectual de terceiros.',
      'Distribuir spam, vírus ou qualquer outro código malicioso.',
      'Criar perfis falsos ou deturpar sua identidade.',
    ],
  ),
  TermsSection(
    title: '5. Conteúdo Gerado pelo Usuário',
    paragraphs: [
      'Ao publicar conteúdo na WeUnite, você concede à plataforma uma licença '
          'não exclusiva para usar, exibir e distribuir tal conteúdo dentro '
          'das funcionalidades do produto. Você mantém a propriedade do seu '
          'conteúdo, mas é responsável por garantir que ele não viole '
          'direitos de terceiros nem as nossas políticas.',
    ],
  ),
  TermsSection(
    title: '6. Modificações dos Termos',
    paragraphs: [
      'Reservamo-nos o direito de modificar estes termos a qualquer momento. '
          'As alterações entram em vigor após a publicação na plataforma. O '
          'uso continuado da WeUnite após essas mudanças constitui sua '
          'aceitação da versão atualizada.',
    ],
  ),
  TermsSection(
    title: '7. Contato',
    paragraphs: [
      'Em caso de dúvidas sobre estes Termos de Uso, utilize os canais de '
          'suporte disponibilizados pela WeUnite.',
    ],
  ),
];
