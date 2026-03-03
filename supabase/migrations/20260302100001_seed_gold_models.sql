-- Inserir os modelos iniciais da Biblioteca de Ouro
insert into public.gold_models (title, niche, icon_name, bg_gradient, ctr, roas, views, prompt_instruction, example_video_url, example_thumbnail_url)
values
  (
    'UGC Autêntico (Selfie)', 
    'Geral / Produto Físico', 
    'UserCircle', 
    'from-blue-500 to-cyan-500', 
    '4.8%', 
    '6.2x', 
    '2.1M', 
    'Você é um Copywriter especialista em UGC (User Generated Content) no TikTok/Reels.\nCrie um roteiro realista entre 30 a 60 segundos focado na DOR do usuário, focando numa comunicação nativa como se fosse ''um amigo recomendando algo''.\n\n### [HOOK RÁPIDO - 0-3s]\n(Visual: Câmera na mão estilo selfie, iluminação natural, segurando o produto em movimento curto)\n🎙️ Fala: Uma frase de impacto agressivo abordando uma [DOR COMUM] ou uma Quebra de Expectativa. Sem ''Oi gente''.\n\n### [CONEXÃO UGC - 3-15s]\n(Visual: B-roll alternado com rosto da pessoa sofrendo ou explicando como resolveu o problema)\n🎙️ Fala: O ''Eu te entendo''. A narrativa de que tentou várias coisas ruins, até encontrar isso. Apresente o Mecanismo Único de forma orgânica.\n\n### [PROVA RÁPIDA E OFERTA - 15-30s]\n(Visual: Texto nativo do Instagram na tela mostrando depoimento rápido ou resultado real)\n🎙️ Fala: "E não acreditei quando vi [RESULTADO ESPERADO]. Eles tão com promoção na loja".\n\n### [CALL TO ACTION - 30s+]\n(Visual: Dedo apontando rápido pro link e tela tremendo de aprovação)\n🎙️ Fala: "Clica e pede antes que esgote e tenham que repor".',
    NULL,
    NULL
  ),
  (
    'Mini VSL Disruptivo', 
    'Infoprodutos / Serviços', 
    'Zap', 
    'from-purple-500 to-indigo-500', 
    '3.9%', 
    '8.5x', 
    '950K', 
    'Você é o mestre da conversão em VSLs Cinematográficas. O objetivo é vender Lógica com Emoção subliminar em até 60s.\n\n### [HOOK CIENTÍFICO/CHOCANTE - 0-5s]\n(Visual: Gráfico branco explodindo num fundo preto ou matéria sensacionalista recortada de jornal. Ação rápida, sem locutor aparecendo no primeiro milissegundo)\n🎙️ Fala (Voz Forte): Uma constatação que fere o ego do prospecto, desmistificando o principal mito sobre a [DOR]. \n\n### [CRIANDO O INIMIGO COMUM - 5-20s]\n(Visual: Animação simples de lousa/quadro demonstrando a complexidade vs simplicidade)\n🎙️ Fala: Jogue a culpa do fracasso do cliente no ''sistema tradicional'' ou no ''consenso antigo'' e mostre que [NOME DO PRODUTO] não é convencional.\n\n### [PITCH DO MECANISMO ÚNICO - 20-45s]\n(Visual: Flash criativo do Produto / Plataforma em alta resolução)\n🎙️ Fala: Um soco de lógica mostrando que o sistema entrega [RESULTADOS] rápido por causa do [MECANISMO SECRETO].\n\n### [ESCASSEZ LÓGICA E CTA - 45s+]\n(Visual: Barra de progresso de vagas se esgotando ou contagem regressiva tensa)\n🎙️ Fala: "Liberei 30 vagas com desconto de early access. Clique no Saiba Mais. Seja rápido."',
    NULL,
    NULL
  ),
  (
    'ASMR Storytelling', 
    'Estética / Tech / Unboxing', 
    'Headphones', 
    'from-emerald-500 to-teal-400', 
    '5.5%', 
    '4.1x', 
    '3.4M', 
    'Ignore todas as músicas. Aqui o formato é focado nos ruídos satisfatórios, silêncio estratégico e uma voz calma enquanto revela resultados visuais potentes.\n\n### [GANCHO ASMR PURO - 0-4s]\n(Visual: MACRO (super perto). Som ALTO de estilete rasgando fita, unhas batendo no plástico ou creme sendo retirado. ZERO LOCUÇÃO NOS PRIMEIROS SEGUNDOS.)\n🎙️ Fone: Somente a textura audível da imagem.\n\n### [REVELAÇÃO SATISFATÓRIA - 4-15s]\n(Visual: Textura do produto sendo aplicada ou led do Tech Gadget acendendo de forma fluida e suave)\n🎙️ Fala (Voz calma próxima do microfone): "Me disseram que o [NOME DO PRODUTO] resolvia [DOR], mas eu não esperava por isso..."\n\n### [USO RELAXANTE - 15-25s]\n(Visual: Time-lapse sedoso do produto funcionando na tela ou pele clareando com o creme)\n🎙️ Fala (Suave): "É bizarro como ele me entrega [RESULTADO ESPERADO] com esse mecanismo premium..."\n\n### [CTA SUTIL - 25s+]\n(Visual: O produto é finalizado ou pousado de volta harmoniosamente. O texto do link aparece.)\n🎙️ Fala (Suave): "O link tá fixado embaixo. Vale o hype."',
    NULL,
    NULL
  ),
  (
    'O Conflito Narrativo (Storytelling)', 
    'Saúde / Bem Estar / Coach', 
    'HeartPulse', 
    'from-orange-500 to-rose-500', 
    '2.8%', 
    '3.9x', 
    '800K', 
    'O usuário quer comprar esperança. Seja vulnerável, doloroso e heroico em até 90 segundos. Sem tom ''empresarial'', crie algo visceral.\n\n### [O FUNDO DO POÇO - 0-10s]\n(Visual: Ator ou Founder em um cômodo com pouca luz, sentando devagar, encarando a lente)\n🎙️ Fala (Tom de confissão exausta): O gatilho emocional exato da vergonha ou estresse que o público alvo sofre ao não ter [RESULTADO ESPERADO].\n\n### [A DESCOBERTA ACIDENTAL - 10-30s]\n(Visual: Corte para o rosto um pouco mais tenso. Pega algum objeto que simbolize o Método Antigo na mão)\n🎙️ Fala: "Gastei os últimos anos pulando de galho em galho, mas o segredo de verdade cruzou meu caminho de forma silenciosa." \n\n### [A TRANSIÇÃO HERÓICA - 30-45s]\n(Visual: Câmera levanta, luz do sol invade, entra música inspiracional)\n🎙️ Fala: "No dia que apliquei [NOME DO PRODUTO], e ativei o [MECANISMO DA FERRAMENTA], tudo virou. Eu estava curado."\n\n### [A MÃO ESTENDIDA - 45s+]\n(Visual: Mão esticada ou olhar fraterno direto)\n🎙️ Fala: "Se você dói do mesmo lugar que eu doía... Clique agora. Não sofra mais um dia."',
    NULL,
    NULL
  ),
  (
    'Split-Screen: Antes VS Depois', 
    'Fitness / Transformação', 
    'SplitSquareHorizontal', 
    'from-pink-500 to-fuchsia-600', 
    '5.1%', 
    '7.2x', 
    '4.8M', 
    'Você é focado em Choque Visual Rápido para TikTokers com Déficit de Atenção. Tudo tem que ser dividido no meio. Formato 30s.\n\n### [HOOK HIPNÓTICO SPLIT-SCREEN - 0-5s]\n(Visual: Tela rachada no meio. Esquerda: Erro/Dor (Tristeza vermelha / Barriga / Pele ruim). Direita: Acerto/Prazer (Herói / Sucesso / Verde brillante).)\n🎙️ Fala (Dinâmico): "Porque todo mundo tá sofrendo de [DOR] enquanto essa galera de cá tá chegando longe?"\n\n### [CARIMBANDO O ERRO - 5-15s]\n(Visual: A Esquerda domina a tela, ganha um grande ''X'' com som de campainha de erro)\n🎙️ Fala: "A culpa não é sua, fazer ''X'' e ''Y'' tá te matando de frustração, porque te tira energia e não gera [RESULTADO]."\n\n### [A PREMIAÇÃO - 15-25s]\n(Visual: A Direita rompe pra tela toda esfregando o Antes e Depois mágico em apenas um flash lindo, junto com a logomarca de [PRODUTO])\n🎙️ Fala: "Os prós descobriram o [NOME DO PRODUTO], que com esse mecanismo acelera todos os resultados pro topo."\n\n### [CTA FLASH - 25s+]\n(Visual: Seta vermelha apontando freneticamente pra Action Area)\n🎙️ Fala: "Pare de atrasar seu progresso. Clica aqui!"',
    NULL,
    NULL
  ),
  (
    'Screencast / Tool Highlight', 
    'SaaS / B2B / Ferramentas', 
    'MonitorPlay', 
    'from-slate-600 to-gray-800', 
    '2.5%', 
    '5.5x', 
    '1.1M', 
    'Foco total em B2B e produtividade. Apresente o problema complexo e como o seu App resolve com um ''Clique''. Formato Rápido e Limpo de 45s.\n\n### [O CAOS CORPORATIVO (HOOK) - 0-5s]\n(Visual: Post It na cara, dezenas de abas do Chrome abertas piscando, cara de burnout no computador)\n🎙️ Fala (Rápido): "Se seu time ainda faz [MÉTODO ANTIGO] na mão pra conseguir [RESULTADOS], sua empresa parou no tempo."\n\n### [A PÍLULA MÁGICA - 5-20s]\n(Visual: Mostra a UI limpa e o Dark Mode poderoso do [NOME DO PRODUTO])\n🎙️ Fala: "Demita a burocracia. Acabei de jogar todo esse problema na conta do [NOME DO PRODUTO]."\n\n### [TUTORIAL EM 3 PONTOS MÁGICOS - 20-35s]\n(Visual: Mouse clicando rapidamente em Step 1, Step 2, acompanhado por SFX sonoros potentes e satisfatórios e gráficos subindo na tela)\n🎙️ Fala: "Importa os dados. Clica na IA do Painel. E pumba: Automação completa sem usar um desenvolvedor."\n\n### [CTA DIRETÃO - 35s+]\n(Visual: Fundo Limpo e o botão amarelo de CTA piscando no centro da tela)\n🎙️ Fala: "Aumente as margens hoje com nosso trial grátis. Saiba Mais."',
    NULL,
    NULL
  ),
  (
    'A Lista Negativa', 
    'Consultoria / Cursos', 
    'AlertTriangle', 
    'from-red-500 to-pink-600', 
    '4.5%', 
    '3.8x', 
    '2.2M', 
    'Essa técnica é controversa mas retém a geração Z. Fale sobre ''3 Coisas que estão acabando com a Vida/Resultados do Cliente'' listando os erros, e revele o Produto como salvação.\n\n### [O GANCHO DA NEGAÇÃO - 0-5s]\n(Visual: Alguém segurando um celular na frente de um espelho ou fazendo texto nativo do Reels pontuando um número com a mão: 3 dedos)\n🎙️ Fala: "3 coisas que você tá fazendo de idiota e por isso continua [DOR DO CLIENTE]."\n\n### [OS 2 PRIMEIROS ERROS ÓBVIOS - 5-20s]\n(Visual: Edição Fast-Paced com textos fortes saltando no centro do vídeo para cada erro. Efeito sonoro nas transições.)\n🎙️ Fala: "O primeiro é o que te dizem desde criancinha pra fazer e só enriquece seu chefe. O segundo é achar que tem que passar fome pra emagrecer."\n\n### [O ERRO FATAL + O SVO DO PRODUTO - 20-40s]\n(Visual: Foco dramático na cara. Corta o som da música de fundo para algo mais seco.)\n🎙️ Fala: "Mas o erro número 3 é fatal. Você tentar fazer isso enquanto não usa a barreira de proteção de um [MECANISMO NOVO]." Puxe o [NOME DO PRODUTO] como antídoto do Erro 3, mostrando seus diferenciais.\n\n### [A CHAMADA AGRESSIVA - 40s+]\n(Visual: Transição pesada para uma arte final com Logo, Oferta e a Seta)\n🎙️ Fala: "Se quer consertar a burrada que você aprendeu ano passado. Eu tenho uma oferta. Clica embaixo e muda a chavinha agora."',
    NULL,
    NULL
  ),
  (
    'Entrevista de Rua', 
    'Viral / Apps / E-Commerce', 
    'Mic', 
    'from-yellow-400 to-orange-500', 
    '6.2%', 
    '5.1x', 
    '5.4M', 
    'O estilo Pop Vox. Entreviste alguém com um microfone vagabundo no meio de um lugar movimentado, faça um Quiz sobre o produto, faça os clientes descobrirem sozinhos a magia da Solução na rua. Formato Curto!\n\n### [O ATAQUE NA RUA (O HOOK) - 0-4s]\n(Visual: Entrevistador correndo atrás de um transeunte com um microfone de lapela na mão. Câmera tremida, dinâmica crua e autêntica)\n🎙️ Fala (Entrevistador): "Amigo! Quantas horas da sua vida você já perdeu tentando [DOR DO CLIENTE]? Dou cem reais se acertar!"\n\n### [A CONFISSÃO E A CAIXINHA - 4-15s]\n(Visual: A pessoa entrevistada dá uma resposta absurdamente alta e sofre, enquanto o apresentador saca o produto do bolso.)\n🎙️ Fala (Entrevistada): "Putz, acho que já perdi metade da minha paciência só essa semana com isso!" \n\n🎙️ Fala (Entrevistador): "E se eu disser que o [NOME DO PRODUTO] limpa essa sua bagunça em dois minutos cravados com tecnologia de ponta?"\n\n### [O TESTE AO VIVO - 15-30s]\n(Visual: Entrega o produto ou mostre a tela do app pra pessoa na rua e grave o choque autêntico no rosto dela ao ver a solução [RESULTADOS])\n🎙️ Fala (Entrevistada berrando e sorrindo): "Mentira que isso fez tudo automático?! Mano do céu!"\n\n### [O CTA FINAL NO MEIO DA RUA - 30s+]\n(Visual: Apresentador encara câmera super perto de forma debochada olhando os papéis ou a mercadoria caírem)\n🎙️ Fala: "Você viu. Agora é sua vez de [RESULTADO MÁGICO]. O cupom secreto tá aí embaixo. Corre."',
    NULL,
    NULL
  )
on conflict do nothing;
