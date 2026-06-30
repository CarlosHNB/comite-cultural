// ============================================================
// DATA.JS — Banco de dados central | LINKCE · Comitê de Cultura
// Atualizado com base na Cartilha "O Jeito LINKCE de Ser"
// ============================================================

const AppData = {

  // -----------------------------------------------------------
  // IDENTIDADE LINKCE (extraído fielmente da cartilha)
  // -----------------------------------------------------------
  identidade: {
    proposito: 'Experiências incríveis a todo o momento.',
    missao: 'Entregar com excelência o melhor serviço de conectividade.',
    visao: 'Ser reconhecida como a melhor e mais amada provedora de conectividade e segurança do Ceará.',
    slogan: 'a internet mais amada',
    frase_cultura: 'Feedback é um presente. Às vezes vem em uma embalagem desconfortável, mas sempre carrega crescimento.',
    frase_cartilha: 'Desenvolver pessoas é uma escolha diária.',
    titulo_cartilha: 'O Jeito LINKCE de Ser',
    subtitulo_cartilha: 'Use este material como apoio nas suas conversas.'
  },

  // -----------------------------------------------------------
  // VALORES DA CULTURA — Fielmente extraídos da cartilha
  // -----------------------------------------------------------
  valores: [
    {
      id: 'foco_cliente',
      nome: 'Foco no Cliente',
      icone: 'target',
      cor: '#22c55e',
      emoji: '🎯',
      descricao: 'Colocamos o cliente no centro de tudo o que fazemos, entregando soluções que criam valor e superam expectativas.',
      chaves: [
        { numero: 1, texto: 'Se o cliente tem problema, o problema é nosso.' },
        { numero: 2, texto: 'Informar ao diretor tudo o que atinge a excelência da empresa.' },
        { numero: 3, texto: 'Tudo é problema de todo mundo. Cobre!' }
      ],
      comportamentos_aceitaveis: [
        'Escutar ativamente o cliente, sem interrompê-lo.',
        'Registrar corretamente os chamados e informações no sistema.',
        'Chamar o cliente pelo nome, gerando proximidade.',
        'Cumprir o SLA (tempo de resposta) básico estabelecido para a área.',
        'Direcionar o cliente para a área correta sem deixá-lo esperando.',
        'Retornar contatos nos prazos combinados, mesmo que seja para dar status.',
        'Entender a real "dor" do cliente antes de propor um serviço ou correção.',
        'Tratar colegas internos (clientes internos) com o mesmo respeito do cliente final.',
        'Manter um tom de voz calmo, mesmo em situações de estresse.',
        'Confirmar se a dúvida do cliente foi totalmente resolvida antes de encerrar o contato.'
      ],
      comportamentos_punitivos: [
        'Omitir falhas da diretoria que impactem a excelência e a qualidade ("varrer para baixo do tapete").',
        'Tratar clientes ou colegas de forma ríspida, irônica ou com grosseria.',
        'Abster-se da responsabilidade de resolver os problemas do cliente em detrimento de falhas intersetoriais ("o problema é do TI/Financeiro", ferindo o "tudo é problema de todo mundo").',
        'Deixar o cliente sem resposta ou ignorar mensagens intencionalmente.',
        'Desligar chamadas de forma proposital.',
        'Falsificar dados de atendimento ou pesquisas de satisfação.',
        'Encerrar chamados de forma intencional sem que a solução real tenha sido entregue.',
        'Culpar o cliente pelo problema de conexão ou uso sem orientá-lo.',
        'Prometer prazos inviáveis apenas para encerrar um atendimento rapidamente.',
        'Ignorar feedbacks de insatisfação constantes de um mesmo cliente.'
      ],
      atitudes_extraordinarias: [
        'Recuperar proativamente um cliente detrator (risco de cancelamento) e transformá-lo em promotor.',
        'Receber elogios nominais do cliente em pesquisas de NPS ou redes sociais.',
        'Identificar gargalos e sugerir melhorias que reduzam o churn na empresa.',
        'Antecipar-se a um problema de infraestrutura e avisar os clientes antes que eles reclamem.',
        'Ajudar um colega de outra área a resolver um chamado crítico, assumindo o problema para si.',
        'Entregar a experiência "Link UAU", provendo uma solução que surpreenda o cliente positivamente.',
        'Resolver demandas complexas no primeiro contato (FCR altíssimo).',
        'Treinar novatos em técnicas de encantamento ao cliente.',
        'Apresentar projetos focados na melhoria contínua da Jornada do Cliente.',
        'Mapear tendências de reclamação e levar a solução pronta para a liderança.'
      ]
    },
    {
      id: 'etica',
      nome: 'Ética e Integridade',
      icone: 'shield-check',
      cor: '#22c55e',
      emoji: '🛡️',
      descricao: 'Fazer o certo mesmo quando ninguém está olhando.',
      chaves: [
        { numero: 4, texto: 'Não julgue, ajude!' },
        { numero: 5, texto: 'Praticamos a verdade nua e crua.' },
        { numero: 6, texto: 'Somos íntegros e honestos acima de tudo.' }
      ],
      comportamentos_aceitaveis: [
        'Falar a "verdade nua e crua" de forma empática e construtiva.',
        'Usar equipamentos, veículos e recursos da LinkCE apenas para fins profissionais.',
        'Respeitar a diversidade, opiniões e histórico dos colegas.',
        'Demonstrar responsabilidade ao reconhecer, reportar e agir rapidamente diante de erros, reduzindo riscos e impactos para a empresa.',
        'Tratar fornecedores e parceiros com ética, respeito e transparência.',
        'Manter o sigilo de dados sensíveis de clientes e da empresa (LGPD).',
        'Cumprir a jornada de trabalho com honestidade, sem burlar ponto.',
        'Cumprir rigorosamente as normas de conformidade, higiene e segurança do trabalho.',
        'Não repassar fofocas, boatos ou comentários que prejudiquem o ambiente organizacional.',
        'Solicitar ajuda quando não souber como proceder em situações delicadas.',
        'Preservar e fortalecer a imagem da empresa dentro e fora do ambiente de trabalho.',
        'Agir com ética e transparência ao identificar e corrigir o recebimento indevido de equipamentos ou valores.',
        'Relatar qualquer comportamento indevido que comprometa a integridade do cliente ou da empresa, ainda que motivado pelo atingimento de metas.'
      ],
      comportamentos_punitivos: [
        'Mentir sobre indicadores, produtividade ou ocorrências.',
        'Espalhar boatos maldosos ou julgar colegas publicamente, ferindo o "Não julgue, ajude!".',
        'Assédio moral, sexual ou comportamentos discriminatórios.',
        'Furto de equipamentos físicos ou desvio e compartilhamento de dados da empresa.',
        'Obter vantagens financeiras ou pessoais utilizando-se do cargo (ex: propina de fornecedor).',
        'Sabotar o trabalho de colegas ou ocultar informações para prejudicá-los.',
        'Acessar ou divulgar dados de clientes sem autorização.',
        'Falsificar assinaturas, atestados médicos ou documentos.',
        'Agir com desrespeito ou preconceito frente a clientes em campo.',
        'Omitir conscientemente falhas graves de ética de outros colaboradores.',
        'Compartilhamento não autorizado de informações internas, seja com terceiros ou entre setores.'
      ],
      atitudes_extraordinarias: [
        'Denunciar formalmente desvios éticos (ajudando a manter a integridade da empresa).',
        'Reportar conflitos entre membros do time de forma imparcial para uma hierarquia superior de forma proativa para mediar conflitos entre membros do time.',
        'Promover ativamente a cultura da empresa, orientando e influenciando outros colaboradores.',
        'Contribuir ativamente para a criação de políticas de integridade.'
      ]
    },
    {
      id: 'entrega',
      nome: 'Entrega Extraordinária',
      icone: 'zap',
      cor: '#22c55e',
      emoji: '⚡',
      descricao: 'Sempre faça mais do que as pessoas esperam de você.',
      chaves: [
        { numero: 7, texto: 'Dê soluções aos problemas e gere ganhos.' },
        { numero: 8, texto: 'Nível de expectativa elevado sobre nós e sobre o time.' },
        { numero: 9, texto: 'Gestão acima de tudo.' }
      ],
      comportamentos_aceitaveis: [
        'Buscar ativamente capacitação técnica relacionada à função.',
        'Engajar-se e contribuir durante apresentações de resultados ou projetos.',
        'Manter o padrão de qualidade mesmo sob pressão de fim de mês.',
        'Auxiliar a bater a meta global do setor, não apenas a individual.'
      ],
      comportamentos_punitivos: [
        'Entregar tarefas pela metade, com desleixo ou erros recorrentes.',
        'Recusar treinamentos corporativos obrigatórios ou capacitações exigidas.',
        'Ignorar os KPIs de sua área e ferramentas de gestão.',
        'Comodismo intencional (o famoso "fazer corpo mole").',
        'Atrasar recorrentemente projetos estratégicos sem aviso prévio.',
        'Entregar relatórios financeiros/operacionais com dados maquiados ou incorretos.',
        'Desistir de metas nos primeiros obstáculos, desmotivando o restante da equipe.',
        'Rejeitar o conceito de alta performance ("Gente de Fibra"), preferindo a mediocridade.'
      ],
      atitudes_extraordinarias: [
        'Superar sistematicamente as metas mensais e trimestrais estabelecidas.',
        'Apresentar ideias que gerem ganho de receita ou economia considerável de custos ("gerar ganhos").',
        'Assumir o comando de projetos críticos e entregar resultados de excelência.',
        'Entregar relatórios analíticos ricos que mudem a visão estratégica da diretoria.',
        'Desenvolver e mentorar sucessores, preparando-os para assumir novas responsabilidades e crescer profissionalmente na empresa.',
        'Obter certificações difíceis que elevem o padrão de conhecimento da área.',
        'Transformar uma crise ou falha grave em uma oportunidade rentável.',
        'Implementar práticas de "Gestão acima de tudo" que sirvam de exemplo para outras áreas.',
        'Entregar valor não solicitado (ex: terminar um projeto e, proativamente, mapear melhorias futuras).',
        'Bater recordes históricos de vendas, instalações ou retenção.'
      ]
    },
    {
      id: 'simplicidade',
      nome: 'Simplicidade',
      icone: 'minimize-2',
      cor: '#22c55e',
      emoji: '✨',
      descricao: 'Solucionar de forma prática sem complicar.',
      chaves: [
        { numero: 10, texto: 'Velocidade nos processos e soluções.' },
        { numero: 11, texto: 'Somos uma empresa de tecnologia.' },
        { numero: 12, texto: 'Crescer e contribuir.' }
      ],
      comportamentos_aceitaveis: [
        'Falar de forma objetiva nos canais de comunicação corporativos (evitar áudios longos sem necessidade).',
        'Focar na resolução do problema antes de procurar as justificativas.',
        'Utilizar as ferramentas tecnológicas disponibilizadas pela empresa.',
        'Organizar o ambiente de trabalho e pastas virtuais para facilitar o acesso de todos.',
        'Ensinar o que sabe para o colega de forma clara e paciente.',
        'Preparar-se antes de reuniões para garantir que sejam breves.',
        'Redigir e-mails e comunicados indo direto ao ponto.',
        'Eliminar o uso excessivo de jargões técnicos ao falar com clientes.',
        'Fazer o básico bem feito antes de propor mirabolâncias.',
        'Aceitar melhorias propostas pela empresa.'
      ],
      comportamentos_punitivos: [
        'Criar burocracias desnecessárias ("gargalos") para não assumir responsabilidades.',
        'Reter informações, tornando-se um ponto único de falha propositalmente.',
        'Complicar soluções financeiras ou técnicas, impactando o "Link 360 Graus".',
        'Recusar-se a usar softwares ou tecnologias adotadas pela LinkCE.',
        'Excesso de controle que trave a agilidade do time.',
        'Marcar ou prolongar reuniões sem pauta ou utilidade prática.',
        'Ignorar ou boicotar automações criadas para melhorar o setor.',
        'Esconder-se atrás de "processos rígidos" para justificar lentidão com o cliente.',
        'Agir com estrelismo ou arrogância intelectual ("falar difícil para humilhar").',
        'Demorar ou reter aprovações simples, travando a operação de outros departamentos.'
      ],
      atitudes_extraordinarias: [
        'Mapear um fluxo complexo e reduzi-lo a poucos passos ágeis.',
        'Criar tutoriais práticos de 1 página para facilitar o onboarding de novatos.',
        'Sugerir ou programar automações que economizem horas-homem da equipe.',
        'Apresentar inovações tecnológicas que reduzam custos de operação.',
        'Substituir longas reuniões de status por dashboards simples e visíveis.',
        'Resolver de forma rápida e definitiva problemas técnicos antigos.',
        'Disseminar a cultura de tecnologia e inovação em áreas mais conservadoras.',
        'Entregar a resolução prática de um problema de campo muito antes do esperado.',
        'Promover iniciativas de compartilhamento de soluções.'
      ]
    },
    {
      id: 'autorresponsabilidade',
      nome: 'Autorresponsabilidade',
      icone: 'user-check',
      cor: '#22c55e',
      emoji: '💪',
      descricao: 'Aja com Senso de Dono: você é o único responsável pelos seus resultados.',
      chaves: [
        { numero: 13, texto: 'Use dados, não opiniões.' },
        { numero: 14, texto: 'Senso de urgência. Prometeu, cumpra!' },
        { numero: 15, texto: 'Amar feedback.' }
      ],
      comportamentos_aceitaveis: [
        'Chegar no horário marcado em reuniões ou clientes.',
        'Cumprir os prazos que prometeu entregar.',
        'Basear-se em dados, não em opiniões.',
        'Escutar um feedback em silêncio, processar a informação e tentar melhorar.',
        'Organizar as demandas sem depender de cobrança superior.',
        'Comunicar antecipadamente caso perceba que não conseguirá entregar algo dentro do prazo.',
        'Ter cuidado com material de trabalho, lembrando que a vida útil depende de quem usa.',
        'Tratar o orçamento da empresa com responsabilidade.',
        'Focar no que é possível resolver, em vez de focar no incontrolável (o clima, a crise).',
        'Verificar se é possível resolver o problema de forma independente antes de solicitar ajuda.'
      ],
      comportamentos_punitivos: [
        'Atribuir a culpa dos seus resultados a terceiros.',
        'Tomar decisões de alto custo baseado em "achismos", ignorando dados existentes.',
        'Reagir de forma ríspida ao receber um feedback.',
        'Prometer sabendo que não irá conseguir cumprir.',
        'Faltas injustificadas, atrasos sistêmicos ou descaso durante a jornada de trabalho.',
        'Usar de forma inadequada os recursos financeiros ou materiais da empresa.',
        'Deixar de comunicar problemas no momento certo, permitindo que eles se acumulem e se tornem mais complexos de resolver no futuro.',
        'Recusar-se a preencher os controles de dados do próprio setor.',
        'Ignorar direcionamento de avaliações de desempenho.',
        'Recusar-se a resolver situações com o pressuposto de que não é problema meu.'
      ],
      atitudes_extraordinarias: [
        'Trazer a cultura de dados para decisões do dia a dia.',
        'Assumir que errou e apresentar um plano de melhoria baseadas em fatos.',
        'Demonstrar evolução visível após receber um feedback.',
        'Apoiar a resolução de situações críticas sempre que necessário, visando proteger a empresa e garantir a melhor experiência ao cliente.',
        'Buscar feedback para saber o que poderia ter feito diferente.',
        'Trazer o que for relevante para otimização de tempo e custo.',
        'Treinar todos para compreenderem e serem orientadas por dados.',
        'Entregar as metas dentro ou antes do prazo.',
        'Assumir o projeto tendo ciência que se der certo é mérito do time, mas se der errado a responsabilidade é minha.',
        'Observar eventuais erros dos superiores embasado em dados e sugerir melhorias.'
      ]
    }
  ],

  // -----------------------------------------------------------
  // BANCO DE PERGUNTAS (adaptado para frequência dinâmica)
  // -----------------------------------------------------------
  perguntas: {
    acolhimento: [
      { id: 'ac1', texto: 'Como você se sentiu no seu primeiro dia na LINKCE?', categoria: 'acolhimento' },
      { id: 'ac2', texto: 'Você se sentiu bem recebido pela equipe? O que chamou mais atenção nesse acolhimento?', categoria: 'acolhimento' },
      { id: 'ac3', texto: 'Teve algum momento que te deixou mais à vontade desde que chegou?', categoria: 'acolhimento' },
      { id: 'ac4', texto: 'Existe algo que poderia ter sido diferente no seu processo de entrada?', categoria: 'acolhimento' },
      { id: 'ac5', texto: 'Como foi a experiência com os processos de integração (documentos, sistemas, acessos)?', categoria: 'acolhimento' }
    ],
    integracao: [
      { id: 'in1', texto: 'Como está sendo a adaptação à rotina e aos processos da empresa?', categoria: 'integracao' },
      { id: 'in2', texto: 'Você já se sente parte do time? O que contribuiu para isso?', categoria: 'integracao' },
      { id: 'in3', texto: 'Existe alguma ferramenta ou processo que ainda gera dúvida?', categoria: 'integracao' },
      { id: 'in4', texto: 'Como está a sua comunicação com as outras áreas da empresa?', categoria: 'integracao' },
      { id: 'in5', texto: 'O que mudou na sua percepção sobre a empresa desde que entrou?', categoria: 'integracao' }
    ],
    foco_cliente: [
      { id: 'fc1', texto: 'Como você tem aplicado o valor "Foco no Cliente" na prática — seja com clientes externos ou internos?', categoria: 'foco_cliente', valores: ['foco_cliente'] },
      { id: 'fc2', texto: 'Você já vivenciou uma situação em que precisou colocar o problema do cliente como seu? Como foi?', categoria: 'foco_cliente', valores: ['foco_cliente'] },
      { id: 'fc3', texto: 'Nossa chave diz: "Se o cliente tem problema, o problema é nosso." Você consegue identificar exemplos disso no seu dia a dia?', categoria: 'foco_cliente', valores: ['foco_cliente'] },
      { id: 'fc4', texto: 'Como você garante que o cliente (interno ou externo) não fica sem resposta ou sem solução?', categoria: 'foco_cliente', valores: ['foco_cliente'] },
      { id: 'fc5', texto: 'Já entregou uma experiência que surpreendeu positivamente o cliente? O que fez diferente?', categoria: 'foco_cliente', valores: ['foco_cliente'] }
    ],
    etica: [
      { id: 'et1', texto: 'Nossa chave diz: "Praticamos a verdade nua e crua." Você se sente confortável em dar feedbacks diretos e honestos?', categoria: 'etica', valores: ['etica'] },
      { id: 'et2', texto: 'Já vivenciou alguma situação que testou seus valores éticos aqui? Como agiu?', categoria: 'etica', valores: ['etica'] },
      { id: 'et3', texto: '"Não julgue, ajude!" — você tem conseguido aplicar esse princípio com seus colegas?', categoria: 'etica', valores: ['etica'] },
      { id: 'et4', texto: 'Você se sente à vontade para falar a verdade mesmo quando ela é difícil de ouvir?', categoria: 'etica', valores: ['etica'] },
      { id: 'et5', texto: 'Como você preserva o sigilo das informações dos clientes e da empresa no dia a dia?', categoria: 'etica', valores: ['etica'] }
    ],
    entrega: [
      { id: 'en1', texto: 'Nossa chave diz: "Dê soluções aos problemas e gere ganhos." Como você tem feito isso no seu trabalho?', categoria: 'entrega', valores: ['entrega'] },
      { id: 'en2', texto: 'Você tem conseguido manter o padrão de qualidade mesmo sob pressão? Me conta uma situação.', categoria: 'entrega', valores: ['entrega'] },
      { id: 'en3', texto: 'O que te impede de entregar sempre no seu melhor nível?', categoria: 'entrega', valores: ['entrega'] },
      { id: 'en4', texto: 'Já fez algo além do que foi pedido? "Gestão acima de tudo" — você entende o que isso significa na sua área?', categoria: 'entrega', valores: ['entrega'] },
      { id: 'en5', texto: 'Como você tem buscado capacitação técnica para melhorar suas entregas?', categoria: 'entrega', valores: ['entrega'] }
    ],
    simplicidade: [
      { id: 'si1', texto: 'Nossa chave: "Velocidade nos processos e soluções." O que você tem feito para ser mais ágil no seu dia a dia?', categoria: 'simplicidade', valores: ['simplicidade'] },
      { id: 'si2', texto: 'Já identificou algum processo burocrático desnecessário? O que faria para simplificar?', categoria: 'simplicidade', valores: ['simplicidade'] },
      { id: 'si3', texto: 'Como você comunica informações complexas de forma simples e direta?', categoria: 'simplicidade', valores: ['simplicidade'] },
      { id: 'si4', texto: '"Somos uma empresa de tecnologia." Você está usando as ferramentas e tecnologias disponíveis ao máximo?', categoria: 'simplicidade', valores: ['simplicidade'] },
      { id: 'si5', texto: '"Crescer e contribuir." O que você tem ensinado ou compartilhado com seus colegas?', categoria: 'simplicidade', valores: ['simplicidade'] }
    ],
    autorresponsabilidade: [
      { id: 'au1', texto: 'Nossa chave: "Use dados, não opiniões." Você tem baseado suas decisões e argumentos em dados?', categoria: 'autorresponsabilidade', valores: ['autorresponsabilidade'] },
      { id: 'au2', texto: '"Prometeu, cumpra!" — Como está seu senso de urgência e o cumprimento dos seus compromissos?', categoria: 'autorresponsabilidade', valores: ['autorresponsabilidade'] },
      { id: 'au3', texto: '"Amar feedback." Como você tem recebido os feedbacks que te deram? Conseguiu agir a partir deles?', categoria: 'autorresponsabilidade', valores: ['autorresponsabilidade'] },
      { id: 'au4', texto: 'Quando algo dá errado, qual é o seu primeiro movimento — buscar a solução ou entender as causas externas?', categoria: 'autorresponsabilidade', valores: ['autorresponsabilidade'] },
      { id: 'au5', texto: 'Você organiza suas próprias demandas sem precisar de cobrança? Como faz isso?', categoria: 'autorresponsabilidade', valores: ['autorresponsabilidade'] }
    ],
    lideranca: [
      { id: 'li1', texto: 'Como é a sua relação com o seu gestor direto?', categoria: 'lideranca' },
      { id: 'li2', texto: 'Você se sente apoiado pela sua liderança? De que forma?', categoria: 'lideranca' },
      { id: 'li3', texto: 'Você se sente confortável para levar dúvidas e problemas ao seu líder?', categoria: 'lideranca' },
      { id: 'li4', texto: 'Existe algo que você gostaria que seu gestor soubesse ou fizesse diferente?', categoria: 'lideranca' }
    ],
    equipe: [
      { id: 'eq1', texto: 'Como é o seu relacionamento com a equipe no dia a dia?', categoria: 'equipe' },
      { id: 'eq2', texto: 'Você já colaborou de forma significativa com algum colega? Como foi?', categoria: 'equipe' },
      { id: 'eq3', texto: 'Como você descreveria o clima do seu time hoje?', categoria: 'equipe' },
      { id: 'eq4', texto: 'O que você mais aprecia na dinâmica da sua equipe atual?', categoria: 'equipe' }
    ],
    desenvolvimento: [
      { id: 'de1', texto: 'Onde você se vê daqui a 6 meses na LINKCE?', categoria: 'desenvolvimento' },
      { id: 'de2', texto: 'Quais competências você quer desenvolver para avançar na sua carreira?', categoria: 'desenvolvimento' },
      { id: 'de3', texto: 'O que a LINKCE pode fazer para te ajudar a crescer?', categoria: 'desenvolvimento' },
      { id: 'de4', texto: 'Você sente que está aprendendo e evoluindo no ritmo esperado?', categoria: 'desenvolvimento' }
    ],
    feedback: [
      { id: 'fb1', texto: 'Que feedback você daria para a empresa sobre a sua experiência até agora?', categoria: 'feedback' },
      { id: 'fb2', texto: 'Existe algo que você gostaria de ter ouvido antes e que faria diferença no seu trabalho?', categoria: 'feedback' },
      { id: 'fb3', texto: 'Como você usa os feedbacks recebidos para se desenvolver?', categoria: 'feedback' },
      { id: 'fb4', texto: 'Se você pudesse mudar uma coisa no seu ambiente de trabalho, o que seria?', categoria: 'feedback' }
    ]
  },

  // -----------------------------------------------------------
  // TEMPLATES DE ENCONTRO (por tipo — frequência é definida por colaborador)
  // -----------------------------------------------------------
  templates_encontro: [
    {
      tipo: 'primeiro',
      titulo: 'Primeiro Encontro',
      label: '1º Encontro',
      objetivo: 'Acolher e criar conexão. Entender as primeiras impressões, garantir que o colaborador se sente bem-vindo e apresentar o propósito do padrinhamento.',
      descricao: 'O objetivo deste encontro é criar um espaço seguro para que o novo colaborador compartilhe suas primeiras percepções sobre a LINKCE.',
      categorias_foco: ['acolhimento', 'integracao', 'lideranca'],
      num_perguntas: 6,
      cor: '#6366f1',
      icone: 'handshake'
    },
    {
      tipo: 'acompanhamento',
      titulo: 'Acompanhamento',
      label: 'Acompanhamento',
      objetivo: 'Avaliar evolução, aprofundar percepção dos valores e identificar pontos de desenvolvimento.',
      descricao: 'Encontro de acompanhamento para verificar evolução, vivência dos valores da cultura e pontos de atenção.',
      categorias_foco: ['foco_cliente', 'etica', 'entrega', 'simplicidade', 'autorresponsabilidade', 'equipe'],
      num_perguntas: 7,
      cor: '#10b981',
      icone: 'trending-up'
    },
    {
      tipo: 'encerramento',
      titulo: 'Encerramento do Ciclo',
      label: 'Encerramento',
      objetivo: 'Concluir o ciclo de acompanhamento. Avaliar a jornada completa, celebrar a evolução e definir próximos passos.',
      descricao: 'O encontro de encerramento marca a conclusão do programa de padrinhamento. Momento de celebrar e planejar o futuro.',
      categorias_foco: ['desenvolvimento', 'feedback', 'autorresponsabilidade', 'foco_cliente'],
      num_perguntas: 8,
      cor: '#f59e0b',
      icone: 'award'
    }
  ],

  // -----------------------------------------------------------
  // CHAVES LINKCE (todas as 15 chaves da cartilha)
  // -----------------------------------------------------------
  chaves: [
    { numero: 1,  valor: 'foco_cliente',        texto: 'Se o cliente tem problema, o problema é nosso.' },
    { numero: 2,  valor: 'foco_cliente',        texto: 'Informar ao diretor tudo o que atinge a excelência da empresa.' },
    { numero: 3,  valor: 'foco_cliente',        texto: 'Tudo é problema de todo mundo. Cobre!' },
    { numero: 4,  valor: 'etica',               texto: 'Não julgue, ajude!' },
    { numero: 5,  valor: 'etica',               texto: 'Praticamos a verdade nua e crua.' },
    { numero: 6,  valor: 'etica',               texto: 'Somos íntegros e honestos acima de tudo.' },
    { numero: 7,  valor: 'entrega',             texto: 'Dê soluções aos problemas e gere ganhos.' },
    { numero: 8,  valor: 'entrega',             texto: 'Nível de expectativa elevado sobre nós e sobre o time.' },
    { numero: 9,  valor: 'entrega',             texto: 'Gestão acima de tudo.' },
    { numero: 10, valor: 'simplicidade',        texto: 'Velocidade nos processos e soluções.' },
    { numero: 11, valor: 'simplicidade',        texto: 'Somos uma empresa de tecnologia.' },
    { numero: 12, valor: 'simplicidade',        texto: 'Crescer e contribuir.' },
    { numero: 13, valor: 'autorresponsabilidade', texto: 'Use dados, não opiniões.' },
    { numero: 14, valor: 'autorresponsabilidade', texto: 'Senso de urgência. Prometeu, cumpra!' },
    { numero: 15, valor: 'autorresponsabilidade', texto: 'Amar feedback.' }
  ],

  // -----------------------------------------------------------
  // CARTILHA DIGITAL — Fiel ao documento "O Jeito LINKCE de Ser"
  // -----------------------------------------------------------
  cartilha: {
    titulo: 'O Jeito LINKCE de Ser',
    subtitulo: 'Use este material como apoio nas suas conversas.',
    frase: 'Desenvolver pessoas é uma escolha diária.',
    secoes: [
      {
        id: 'identidade',
        titulo: 'Identidade LINKCE',
        icone: 'building-2',
        conteudo: [
          { tipo: 'destaque', texto: '"Desenvolver pessoas é uma escolha diária."' },
          { tipo: 'bloco_identidade', items: [
            { label: 'Propósito', texto: 'Experiências incríveis a todo o momento.' },
            { label: 'Missão', texto: 'Entregar com excelência o melhor serviço de conectividade.' },
            { label: 'Visão', texto: 'Ser reconhecida como a melhor e mais amada provedora de conectividade e segurança do Ceará.' }
          ]},
          { tipo: 'valores_lista', titulo: 'Nossos 5 Valores', items: [
            'Foco do Cliente',
            'Ética e Integridade',
            'Entrega Extraordinária',
            'Simplicidade',
            'Autorresponsabilidade'
          ]},
          { tipo: 'frase_destaque', texto: 'Feedback é um presente. Às vezes vem em uma embalagem desconfortável, mas sempre carrega crescimento.' }
        ]
      },
      {
        id: 'foco-cliente',
        titulo: 'Foco no Cliente',
        icone: 'target',
        valor_id: 'foco_cliente',
        conteudo: [
          { tipo: 'descricao_valor', texto: 'Colocamos o cliente no centro de tudo o que fazemos, entregando soluções que criam valor e superam expectativas.' },
          { tipo: 'chaves', chave_ids: [1,2,3] },
          { tipo: 'comportamentos' }
        ]
      },
      {
        id: 'etica-integridade',
        titulo: 'Ética e Integridade',
        icone: 'shield-check',
        valor_id: 'etica',
        conteudo: [
          { tipo: 'descricao_valor', texto: 'Fazer o certo mesmo quando ninguém está olhando.' },
          { tipo: 'chaves', chave_ids: [4,5,6] },
          { tipo: 'comportamentos' }
        ]
      },
      {
        id: 'entrega-extraordinaria',
        titulo: 'Entrega Extraordinária',
        icone: 'zap',
        valor_id: 'entrega',
        conteudo: [
          { tipo: 'descricao_valor', texto: 'Sempre faça mais do que as pessoas esperam de você.' },
          { tipo: 'chaves', chave_ids: [7,8,9] },
          { tipo: 'comportamentos' }
        ]
      },
      {
        id: 'simplicidade',
        titulo: 'Simplicidade',
        icone: 'minimize-2',
        valor_id: 'simplicidade',
        conteudo: [
          { tipo: 'descricao_valor', texto: 'Solucionar de forma prática sem complicar.' },
          { tipo: 'chaves', chave_ids: [10,11,12] },
          { tipo: 'comportamentos' }
        ]
      },
      {
        id: 'autorresponsabilidade',
        titulo: 'Autorresponsabilidade',
        icone: 'user-check',
        valor_id: 'autorresponsabilidade',
        conteudo: [
          { tipo: 'descricao_valor', texto: 'Aja com Senso de Dono: você é o único responsável pelos seus resultados.' },
          { tipo: 'chaves', chave_ids: [13,14,15] },
          { tipo: 'comportamentos' }
        ]
      }
    ]
  }
};

if (typeof module !== 'undefined') module.exports = AppData;
