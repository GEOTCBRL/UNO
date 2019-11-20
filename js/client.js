var client = {};

function setupClient(ws) {
	ws.onopen = function(evt) {
	    console.log("Connection open...");
	    let msg = {token: client.token_b64, request: "connect"};
	    ws.send(JSON.stringify(msg));
	};

	ws.onmessage = function(event) {
		console.log("receive msg" + event.data);
		let msg = JSON.parse(event.data);
		if (msg.request == "action"){
			console.log("action");
			client.parse(msg.content);
		}
	};
}

client.handle = function(event) {
	if (event.origin != 'saiblo.com')
		return
	let msg = event.data;
	if (msg.message == "init_player_player") {
		event.source.postMessage({message: 'init_successfully', data: msg.token}, event.origin)
		client.token_b64 = msg['token'];
		console.log(client.token_b64);
		token = atob(token_b64);
		client.token = token;
		console.log(token);

		client.ws = new WebSocket("ws://"+token);
		setupClient(client.ws)
	}
}

client.parse = function(content) {
	if ('position' in content) {
		client.init(content);
	} else if ('current player' in content) {
		client.display(content);
	} else if ('invalid' in content) {
		// invalid operation
	}
}

client.init = function(content) {
	playerNames = content.player;
	game.position = content.position;
	console.log(playerNames)
	console.log(game.position)
	game.start()
}

client.display = function(content) {
	game.currentActivePlayerIndex = content['current player']
	if (content.direction == 0)
		game.direction = true;
	else
		game.direction = false;

	var lastCard = content['top card'];
	var lastColor = content['color'];
	lastCard = lastCard.split('_');
	var card = {};
	card.color = lastColor;
	card.content = lastCard[1];
	console.log(card);
	switch (card.content) {
		case 'S':  {
			card.type = 1;
			card.content = 2;
			break;
		};
		case 'R': {
			card.type = 1;
			card.content = 1;
			break;
		};
		case '+2': {
			card.type = 1;
			card.content = 0;
			break;
		};
		case 'W+4': {
			card.type = 2;
			card.content = 0;
			break;
		};
		case 'W': {
			card.type = 2;
			card.content = 1;
			break;
		};
		default: {
			card.type = 0;
			card.content = card.content[0];
			break;
		};
	}
	var colorMap = {
		'red': 0, 'green': 1, 'yellow': 2, 'blue': 3, 'none': 4
	};
	card.color = colorMap[card.color]
	console.log(card)

	if (game.currentActivePlayerIndex == game.user.index)
		game.players[game.currentActivePlayerIndex].activate(card, 0)
	else
		game.sendOtherCard(game.currentActivePlayerIndex, card)
}

client.sendCard = function(card) {
	var data = {};
	var typeMap = {
		"全色": 'W',
		"停": 'S',
		'回': 'R'
		"+2": "+2",
		"+4": "+4"
	};
	if (card == null) {

	} else {
		console.log(COLORS);
		data.color = COLORS[card.color];
		data.card = CONTENT[card.type][card.content];
		console.log(data)
		if (data.card in typeMap) {
			data.card = typeMap[data.card];
		} else {
			data.card = Integer.toString(data.card);
		}
	}
	var msg = {token: client.token, 
		request: 'action', 
		content: JSON.stringify(data)
	};
	console.log('sending message');
	console.log(msg);
	client.ws.send(JSON.stringify(msg));
};


window.addEventListener("message", client.handle, false);

var DEBUG = false;

if (DEBUG) {
	client.token = '192.168.102.138/1/hgr/1';
	setupClient(client.ws);
}