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

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createCardHTML(card, index, isPlayer) {
        if (!isPlayer || (isPlayer && usedPlayerCards[index])) {
            return `
                <article class="card card--facedown">
                    <img src="assets/img/logo2.png">
                </article>
            `;
        }
        return `
            <article class="card">
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
                if(cardElement) cardElement.classList.add('used-card');
            }

            carouselItem.appendChild(caroucelBlock);
            carouselInner.appendChild(carouselItem);
        });
        
        aiCardContainer.innerHTML = createCardHTML(null, -1, false);
    }

    function updateTurnInfo() {
        if (isPlayerTurn) {
            gameMessageEl.textContent = "Sua vez de escolher o atributo.";
            attributeSelectEl.disabled = false;
        } else {
            gameMessageEl.textContent = "Vez da IA escolher o atributo.";
            attributeSelectEl.disabled = true;
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
        
        if (usedPlayerCards[playerCardIndex]) {
            gameMessageEl.textContent = "Essa carta já foi usada! Escolha outra.";
            return;
        }
        
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

        aiCardContainer.innerHTML = `
            <article class="card ${usedAiCards[playerDeck.indexOf(playerCard)] ? 'used-card' : ''}">
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

        const attributeNames = {
            speed: 'Velocidade',
            fuel: 'Combustível',
            passengers: 'Passageiros',
            maxWeight: 'Peso Máx.',
            maxAltitude: 'Altitude Máx.'
        };

        const resultBody = document.getElementById('result-modal-body');
        resultBody.innerHTML = `
            <h5>${winnerMsg}</h5>
            <p>Atributo: <strong>${attributeNames[attribute]}</strong></p>
            <p><strong>Sua carta (${playerCard.name}):</strong> ${playerValue}</p>
            <p><strong>Carta da IA (${aiCard.name}):</strong> ${aiValue}</p>
        `;
    }
    
    function checkEndGame() {
        let finalMessage = '';

        if (playerScore >= 3 || aiScore >= 3 || (playerScore === 2 && aiScore === 2)) {
            isGameOver = true; // <<< NOVO: Avisa que o jogo acabou
            if (playerScore === 2 && aiScore === 2) {
                finalMessage = 'O jogo terminou em empate!';
            } else if (playerScore >= 3) {
                finalMessage = 'Parabéns, você venceu o jogo!';
            } else {
                finalMessage = 'A IA venceu o jogo. Tente novamente!';
            }
        }
        
        if (isGameOver) {
            gameMessageEl.textContent = finalMessage;
            attributeSelectEl.disabled = true;
            playButton.textContent = 'Jogar Novamente'; // <<< NOVO: Muda o texto do botão

            aiCardContainer.innerHTML = createCardHTML(null, -1, false);

            const carouselInner = document.querySelector('#playerCarousel .carousel-inner');
            carouselInner.querySelectorAll('.card').forEach(cardEl => cardEl.classList.add('used-card'));
        }
        
        return isGameOver;
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