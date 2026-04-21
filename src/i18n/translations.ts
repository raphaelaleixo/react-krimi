// Portuguese (BR) translations — merged from all Vue component locales
export const translations: Record<string, string> = {
  // Home
  'A game of deception': 'Um jogo de intrigas',
  'A web-version of Tobey Ho\'s': 'Uma versão web do jogo de Tobey Ho',
  'New game': 'Novo jogo',
  'Join game': 'Entrar em um jogo',
  'Resume game': 'Retomar jogo',
  'How to play': 'Como jogar',
  'Versão em português': 'English version',
  'Made by': 'Feito por',
  'Licensed under': 'Licenciado sob',
  'Heads up': 'Atenção',
  'You\'re about to host on what looks like a phone. The host screen works best on a larger display — a laptop or tablet.':
    'Você vai apresentar o jogo no que parece ser um celular. A tela do apresentador funciona melhor em uma tela maior — um laptop ou tablet.',
  'Host anyway': 'Apresentar mesmo assim',
  'Cancel': 'Cancelar',
  'Content coming soon.': 'Em breve.',

  // Lobby
  'Lobby for room': 'Lobby para a sala',
  'Waiting for players': 'Esperando pelos jogadores',
  'No players joined yet.': 'Nenhum jogador entrou ainda.',
  'player joined.': 'jogador entrou.',
  'players joined.': 'jogadores entraram.',
  'URL Copied': 'URL Copiada',
  'Close': 'Fechar',
  'Copy game url': 'Copiar url do jogo',
  'Start game': 'Começar jogo',

  // Player
  'You are in room': 'Você está na sala',
  'Waiting for the game start': 'Esperando o jogo começar',

  // Detective
  'the murderer': 'o assassino',
  'a detective': 'um detetive',
  'You are': 'Você é',
  'close': 'fechar',
  'Role': 'Papel',
  'Pass turn': 'Passar',
  'Solve': 'Solucionar',
  'Solve the crime': 'Solucione o crime',
  'Who is the murderer?': 'Quem é o assassino?',
  'Select the means of murder:': 'Selecione a causa de morte',
  'Select the key evidence:': 'Selecione a evidência principal',
  'Send guess': 'Mandar palpite',

  // Board
  'Game': 'Jogo',
  'Suspects of the crime:': 'Suspeitos do crime:',
  'Passed this turn': 'Passou o turno',
  'Guessed that the murderer was': 'Achou que o assassino fosse',
  'the M.O. was': 'a causa foi',
  'and the key evidence was': 'e a evidência principal foi',
  'Round': 'Rodada',
  'of': 'de',
  'Analysis': 'Análise',
  'Forensic Scientist': 'Cientista Forense',
  'Case': 'Caso',

  // MurdererChoice
  'Select your means of murder:': 'Selecione sua causa de morte:',
  'Select your key evidence:': 'Selecione sua evidência principal:',
  'Send choice': 'Enviar escolha',

  // ForensicAnalysis
  'Waiting for the murderer to choose...': 'Esperando o assassino escolher...',
  'The murderer is': 'O assassino é',
  'Means of murder:': 'Causa da morte:',
  'Key evidence:': 'Evidência principal:',
  'Send analysis': 'Enviar análise',

  // Join
  'Enter the game code:': 'Digite o código do jogo:',
  'Enter your nickname:': 'Digite seu apelido:',
  'Game code': 'Código do jogo',
  'Nickname': 'Apelido',
  'Enter': 'Entrar',
  'Back': 'Voltar',
  'Game has already started': 'O jogo já começou',
  'Game not found': 'Jogo não encontrado',

  // Join (resume page) — added 2026-04-20
  'Resume': 'Retomar',
  'Enter the room code your friends shared to jump back in.':
    'Digite o código da sala que seus amigos compartilharam para voltar ao jogo.',
  'Room code': 'Código da sala',
  'Resume as host': 'Retomar como anfitrião',
  'Resume as player': 'Retomar como jogador',
  'Resuming…': 'Retomando…',
  'Room not found. Check the code and try again.':
    'Sala não encontrada. Verifique o código e tente novamente.',

  // Rejoin (placeholder /room/:id/players) — added 2026-04-20
  'Rejoin the game': 'Voltar ao jogo',
  'Tap your name to rejoin': 'Toque no seu nome para voltar',

  // Lobby redesign — added 2026-04-20
  'Assigning case': 'Atribuindo o caso',
  'on scene': 'na cena',
  'Start investigation': 'Começar investigação',
  'Investigator': 'Investigador',
  'Player': 'Jogador',
  'Previous': 'Anterior',
  'Next': 'Próximo',

  // How to play — added 2026-04-20
  'Premise': 'Premissa',
  'Roles': 'Papéis',
  'Setup': 'Preparação',
  'Round flow': 'Andamento',
  'Winning': 'Vitória',

  'Late at night, a murder has happened. A team of Investigators must piece together how it was done, guided only by the cryptic forensic readings of a Forensic Scientist who cannot speak plainly. Among the Investigators, a Murderer hides in plain sight.':
    'Tarde da noite, um assassinato aconteceu. Uma equipe de Investigadores precisa juntar as peças para descobrir como foi feito, guiada apenas pelas leituras forenses enigmáticas de um Cientista Forense que não pode falar abertamente. Entre os Investigadores, um Assassino se esconde à vista de todos.',

  'The {bold}Forensic Scientist{/bold} knows who the Murderer is and which means and key clue point to them. They communicate only by placing forensic analysis tiles on the host board.':
    'O {bold}Cientista Forense{/bold} sabe quem é o Assassino e qual a causa e qual a evidência principal que apontam para ele. Ele se comunica apenas colocando peças de análise forense no quadro principal.',

  'The {bold}Murderer{/bold} secretly picks their weapon (means) and a key piece of evidence from their hand on their phone.':
    'O {bold}Assassino{/bold} escolhe secretamente sua arma (causa) e uma evidência principal da sua mão, no próprio celular.',

  'The {bold}Investigators{/bold} study the board and debate aloud — one of them is secretly the Murderer.':
    'Os {bold}Investigadores{/bold} estudam o quadro e debatem em voz alta — um deles é secretamente o Assassino.',

  'One device hosts the shared board on a larger screen (a TV or a large monitor) — it\'s a display, no one plays from it. Every player, including the Forensic Scientist, joins from their own phone using the room code. Roles and cards are dealt automatically; each player\'s hand appears privately on their own device.':
    'Um dispositivo apresenta o quadro compartilhado em uma tela maior (uma TV ou um monitor grande) — ele é apenas um display, ninguém joga por ele. Todos os jogadores, incluindo o Cientista Forense, entram pelo próprio celular usando o código da sala. Papéis e cartas são distribuídos automaticamente; a mão de cada jogador aparece em privado no próprio dispositivo.',

  'From their phone, the Forensic Scientist reveals a forensic category and places a tile indicating a reading (e.g. "Cause of death: suffocation"); the choice appears on the host board for everyone to see. Investigators discuss and study the means and clues in play. Over successive rounds, more categories are revealed. Investigators may lock in a guess — selecting one player\'s means and key — from their phone at any time.':
    'Pelo celular, o Cientista Forense revela uma categoria forense e coloca uma peça indicando uma leitura (ex.: "Causa da morte: asfixia"); a escolha aparece no quadro principal para todos verem. Os Investigadores discutem e estudam as causas e evidências em jogo. A cada rodada, mais categorias são reveladas. Os Investigadores podem travar um palpite — escolhendo a causa e a evidência principal de um jogador — pelo celular a qualquer momento.',

  'Investigators win if someone correctly names the Murderer\'s means {bold}and{/bold} key. The Murderer wins if the group runs out of rounds without a correct guess, or if all incorrect guesses are used up.':
    'Os Investigadores vencem se alguém disser corretamente a causa {bold}e{/bold} a evidência principal do Assassino. O Assassino vence se as rodadas acabarem sem um palpite correto, ou se todos os palpites errados forem gastos.',

  // Lobby loading state — added 2026-04-21
  'Waiting...': 'Aguarde...',
  'Waiting for {n} more…': 'Aguardando mais {n}…',
  'We can start the game now': 'Podemos começar o jogo',
};
