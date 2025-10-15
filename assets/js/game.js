document.addEventListener('DOMContentLoaded', function () {

    let playerDeck = [];
    let aiDeck = [];
    let playerScore = 0;
    let aiScore = 0;
    let isPlayerTurn = true;
    let usedPlayerCards = [];
    let usedAiCards = [];
    let isGameOver = false; // <<< NOVO: Variável de estado para controlar o fim do jogo

    const playerScoreEl = document.getElementById('player-score');
    const aiScoreEl = document.getElementById('ai-score');
    const gameMessageEl = document.getElementById('game-message');
    const attributeSelectEl = document.getElementById('attribute');
    const playButton = document.getElementById('play-button');
    const playerCarouselEl = document.getElementById('playerCarousel');
    const aiCardContainer = document.querySelector('.deck-ai');
    const lockIconEl = document.getElementById('lock-icon');
    const scoreBlockEl = document.querySelector('.score-block');
    const resultModal = new bootstrap.Modal(document.getElementById('modalConfirmResult'));

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Substitua a função createCardHTML inteira por esta:

    function createCardHTML(card, index, isPlayer) {
        // CASO 1: É a carta da IA (que não vemos) -> Mostra apenas o verso, sem cadeado.
        if (!isPlayer) {
            return `
            <article class="card card--facedown">
                <img src="assets/img/logo2.png">
            </article>
        `;
        }

        // CASO 2: É uma carta do jogador. Sempre criamos a estrutura completa.
        // O CSS vai decidir se o cadeado aparece ou não, baseado na classe .used-card.
        return `
        <article class="card">
            <div class="lock-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 1.5A5.5 5.5 0 0 0 6.5 7v3H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1.5V7A5.5 5.5 0 0 0 12 1.5zM8.5 7a3.5 3.5 0 0 1 7 0v3H8.5V7z"/>
                </svg>
            </div>
            
            <img src="${card.image}" alt="${card.name}">
            <h6 class="card-name">${card.name}</h6>
            <div class="attributes-container">
                <div class="attributes">
                    <h6 class="title-attributes">Atributos</h6>
                    <p>VELOCIDADE</p>
                    <p>COMBUSTÍVEL</p>
                    <p>PASSAGEIROS</p>
                    <p>PESO MÁX.</p>
                    <p>ALTITUDE MÁX.</p>
                </div>
                <div class="values">
                    <h6 class="title-attributes">Valores</h6>
                    <p>~${card.speed} km/h</p>
                    <p>~${card.fuel} L</p>
                    <p>${card.passengers}</p>
                    <p>${card.maxWeight} t</p>
                    <p>${card.maxAltitude} ft</p>
                </div>
            </div>
        </article>
    `;
    }

    function displayHands() {
        const carouselInner = document.querySelector('#playerCarousel .carousel-inner');
        carouselInner.innerHTML = '';

        playerDeck.forEach((card, index) => {
            const cardArticle = createCardHTML(card, index, true);
            const carouselItem = document.createElement('div');
            const activeSlideIndex = document.querySelector('#playerCarousel .carousel-item.active')?.dataset.cardIndex || 0;
            carouselItem.className = `carousel-item ${index == activeSlideIndex ? 'active' : ''}`;
            carouselItem.dataset.cardIndex = index;

            const caroucelBlock = document.createElement('div');
            caroucelBlock.className = 'caroucel-block';
            caroucelBlock.innerHTML = cardArticle;

            if (usedPlayerCards[index]) {
                const cardElement = caroucelBlock.querySelector('.card');
                if (cardElement) cardElement.classList.add('used-card');
            }

            carouselItem.appendChild(caroucelBlock);
            carouselInner.appendChild(carouselItem);
        });

        aiCardContainer.innerHTML = createCardHTML(null, -1, false);
    }

    function updateTurnInfo() {
        if (isPlayerTurn) {
            gameMessageEl.textContent = "SUA VEZ DE ESCOLHER O ATRIBUTO!";
            attributeSelectEl.disabled = false;
            lockIconEl.classList.add('hidden'); // Esconde o cadeado
        } else {
            gameMessageEl.textContent = "VEZ DA IA DE ESCOLHER O ATRIBUTO!";
            attributeSelectEl.disabled = true;
            lockIconEl.classList.remove('hidden'); // Mostra o cadeado
        }
    }

    function startGame() {
        // --- MUDANÇA IMPORTANTE AQUI ---
        isGameOver = false;
        playButton.textContent = 'Jogar'; // Garante que o texto do botão seja 'Jogar' no início
        // --- FIM DA MUDANÇA ---

        const shuffledDeck = shuffle([...allCards]);
        playerDeck = shuffledDeck.slice(0, 4);
        aiDeck = shuffledDeck.slice(4, 8);

        playerScore = 0;
        aiScore = 0;
        isPlayerTurn = true;
        usedPlayerCards = [false, false, false, false];
        usedAiCards = [false, false, false, false];

        playerScoreEl.textContent = '0';
        aiScoreEl.textContent = '0';
        playButton.disabled = false;

        displayHands();
        updateTurnInfo();
    }

    function getSelectedPlayerCard() {
        const activeCarouselItem = document.querySelector('#playerCarousel .carousel-item.active');
        const cardIndex = parseInt(activeCarouselItem.dataset.cardIndex, 10);
        return { card: playerDeck[cardIndex], index: cardIndex };
    }

    function aiSelectAttribute() {
        const attributes = ['speed', 'fuel', 'passengers', 'maxWeight', 'maxAltitude'];
        const randomIndex = Math.floor(Math.random() * attributes.length);
        const randomAttribute = attributes[randomIndex];

        attributeSelectEl.value = randomAttribute;
        return randomAttribute;
    }

    function playRound() {
        const { card: playerCard, index: playerCardIndex } = getSelectedPlayerCard();

        // VERIFICAÇÃO DE CARTA USADA
        if (usedPlayerCards[playerCardIndex]) {
            gameMessageEl.textContent = "ESSA CARTA JÁ FOI USADA, TENTE OUTRA!";

            // --- NOVA LÓGICA (Animação) ---
            // 1. Adiciona a classe que faz o placar tremer
            scoreBlockEl.classList.add('shake');

            // 2. Remove a classe após a animação, para que possa tremer de novo
            setTimeout(() => {
                scoreBlockEl.classList.remove('shake');
            }, 500); // O tempo (500ms) deve ser igual à duração da animação no CSS
            // --- FIM DA NOVA LÓGICA ---

            return; // Para a execução aqui, impedindo o modal de abrir
        }

        // Lógica normal da rodada (se a carta for válida)
        const aiCard = aiDeck[playerCardIndex];

        let chosenAttribute;
        if (isPlayerTurn) {
            chosenAttribute = attributeSelectEl.value;
        } else {
            chosenAttribute = aiSelectAttribute();
        }

        const playerValue = playerCard[chosenAttribute];
        const aiValue = aiCard[chosenAttribute];

        let roundWinner = '';
        if (playerValue > aiValue) {
            playerScore++;
            roundWinner = 'Você venceu a rodada!';
        } else if (aiValue > playerValue) {
            aiScore++;
            roundWinner = 'A IA venceu a rodada!';
        } else {
            roundWinner = 'Empate!';
        }

        if (playerValue !== aiValue) {
            usedPlayerCards[playerCardIndex] = true;
            usedAiCards[playerCardIndex] = true;
        }

        updateScoresAndUI(roundWinner, playerCard, aiCard, chosenAttribute, playerValue, aiValue);

        // --- NOVA LÓGICA (Abertura do Modal) ---
        // Abre o modal manualmente via JavaScript
        resultModal.show();
        // --- FIM DA NOVA LÓGICA ---

        if (playerValue !== aiValue) {
            isPlayerTurn = !isPlayerTurn;
        }

        if (!checkEndGame()) {
            displayHands();
            const nextActiveIndex = usedPlayerCards[playerCardIndex]
                ? usedPlayerCards.findIndex(used => !used)
                : playerCardIndex;

            if (nextActiveIndex !== -1) {
                const carousel = new bootstrap.Carousel(playerCarouselEl);
                carousel.to(nextActiveIndex);
            }

            updateTurnInfo();
        }
    }

    function updateScoresAndUI(winnerMsg, playerCard, aiCard, attribute, playerValue, aiValue) {
        playerScoreEl.textContent = playerScore;
        aiScoreEl.textContent = aiScore;

        // Pega o elemento da carta do jogador que está visível no carrossel
        const playerCardElement = document.querySelector('#playerCarousel .carousel-item.active .card').cloneNode(true);
        // Cria o elemento da carta da IA
        const aiCardElementHTML = `
        <article class="card">
            <img src="${aiCard.image}" alt="${aiCard.name}">
            <h6 class="card-name">${aiCard.name}</h6>
            <div class="attributes-container">
                 <div class="attributes">
                    <h6 class="title-attributes">Atributos</h6>
                    <p>VELOCIDADE</p>
                    <p>COMBUSTÍVEL</p>
                    <p>PASSAGEIROS</p>
                    <p>PESO MÁX.</p>
                    <p>ALTITUDE MÁX.</p>
                </div>
                <div class="values">
                    <h6 class="title-attributes">Valores</h6>
                    <p>~${aiCard.speed} km/h</p>
                    <p>~${aiCard.fuel} L</p>
                    <p>${aiCard.passengers}</p>
                    <p>${aiCard.maxWeight} t</p>
                    <p>${aiCard.maxAltitude} ft</p>
                </div>
            </div>
        </article>
    `;
        const aiCardContainer = document.createElement('div');
        aiCardContainer.innerHTML = aiCardElementHTML;
        const aiCardElement = aiCardContainer.firstElementChild;


        // Mapa para encontrar o parágrafo do atributo pelo nome
        const attributeMap = {
            speed: 0,
            fuel: 1,
            passengers: 2,
            maxWeight: 3,
            maxAltitude: 4
        };
        const attributeIndex = attributeMap[attribute];

        // Destaca o atributo na carta do jogador e da IA
        if (attributeIndex !== undefined) {
            playerCardElement.querySelector('.values').querySelectorAll('p')[attributeIndex].classList.add('highlight-attribute');
            aiCardElement.querySelector('.values').querySelectorAll('p')[attributeIndex].classList.add('highlight-attribute');
        }

        // Define a classe de cor para a mensagem de resultado
        let resultClass = 'draw';
        if (winnerMsg.includes('venceu')) {
            resultClass = winnerMsg.includes('Você') ? 'win' : 'loss';
        }

        // Constrói o HTML do corpo do modal
        const resultBody = document.getElementById('result-modal-body');
        resultBody.innerHTML = `
        <div class="result-header">
            <p class="result-message ${resultClass}">${winnerMsg}</p>
        </div>
        <div class="result-comparison">
            <div class="result-card-display" id="player-result-card">
                <h5>VOCÊ</h5>
            </div>
            <div class="result-divider">VS</div>
            <div class="result-card-display" id="ai-result-card">
                <h5>IA</h5>
            </div>
        </div>
    `;

        // Adiciona as cartas clonadas e estilizadas ao modal
        document.getElementById('player-result-card').appendChild(playerCardElement);
        document.getElementById('ai-result-card').appendChild(aiCardElement);
    }

    function checkEndGame() {
        let finalMessage = '';
        let gameEnded = false;

        if (playerScore >= 3 || aiScore >= 3 || (playerScore === 2 && aiScore === 2)) {
            isGameOver = true;
            gameEnded = true;

            if (playerScore === 2 && aiScore === 2) {
                finalMessage = 'O JOGO TERMINOU EM EMPATE!';
            } else if (playerScore >= 3) {
                finalMessage = 'PARABÉNS, VOCÊ TERMINOU O JOGO!';
            } else {
                finalMessage = 'A IA VENCEU O JOGO, TENTE NOVAMENTE!';
            }
        }

        if (gameEnded) {
            gameMessageEl.textContent = finalMessage;
            attributeSelectEl.disabled = true;
            playButton.textContent = 'Jogar Novamente';

            // --- MUDANÇA IMPORTANTE AQUI ---
            // Força todas as cartas do jogador para o estado de "usadas"
            usedPlayerCards.fill(true);

            // Redesenha as mãos para garantir que todas as cartas do jogador apareçam viradas
            displayHands();
            // --- FIM DA MUDANÇA ---
        }

        return gameEnded;
    }

    // --- MUDANÇA IMPORTANTE AQUI ---
    // Nova função para gerenciar o clique do botão principal
    function handlePlayButtonClick() {
        if (isGameOver) {
            // Se o jogo acabou, recarrega a página
            location.reload();
        } else {
            // Se o jogo está rolando, joga a rodada
            playRound();
        }
    }

    // Apenas um event listener é necessário agora
    playButton.addEventListener('click', handlePlayButtonClick);
    // --- FIM DA MUDANÇA ---

    startGame();
});