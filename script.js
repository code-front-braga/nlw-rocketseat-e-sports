const form = document.getElementById('form');
const apiKeyInput = document.getElementById('api-key');
const gameSelect = document.getElementById('game-select');
const questionInput = document.getElementById('question-input');
const askButton = document.getElementById('ask-button');
const aiResponse = document.getElementById('ai-response');

const markdownToHTML = text => {
	const converter = new showdown.Converter();
	return converter.makeHtml(text);
};

const askAI = async (question, game, apiKey) => {
	const geminiModel = 'gemini-2.0-flash';
	const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
	const promptText = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}.

    ## Tarefa
    Você deve responder às perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo.'
    - Considere a data atual ${new Date().toLocaleDateString()}.
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual.
    - Os nomes dos itens e runas devem ser em inglês.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens**\n\n coloque os itens aqui.\n\n**Runas:**\n\n exemplo de runas \n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `;

	const contents = [
		{
			role: 'user',
			parts: [
				{
					text: promptText,
				},
			],
		},
	];

	const tools = [
		{
			google_search: {},
		},
	];

	const response = await fetch(geminiURL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ contents, tools }),
	});

	const data = await response.json();
	return data.candidates[0].content.parts[0].text;
};

const sendForm = async e => {
	e.preventDefault();
	const question = questionInput.value;
	const game = gameSelect.value;
	const apiKey = apiKeyInput.value;

	if (apiKey === '' || game === '' || question === '') {
		alert('Por favor, preencha todos os campos!');
		return;
	}

	askButton.disabled = true;
	askButton.textContent = 'Perguntando...';
	askButton.classList.add('loading');

	try {
		const text = await askAI(question, game, apiKey);
		aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
	} catch (error) {
		console.error('Erro: ', error);
	} finally {
		askButton.disabled = false;
		askButton.textContent = 'Perguntar';
		askButton.classList.remove('loading');
	}
};

form.addEventListener('submit', sendForm);
