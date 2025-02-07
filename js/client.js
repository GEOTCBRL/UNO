var client = {};
game.client = client;
client.waitCnt = 0;

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
			client.parse(JSON.parse(msg.content));
		}
	};
}

client.handle = function(event) {
	/*if (event.origin != 'saiblo.com')
		return*/
	let msg = event.data;
	if (msg.message == "init_player_player") {
		event.source.postMessage({message: 'init_successfully', data: msg.token}, event.origin)
		client.token_b64 = msg['token'];
		console.log(client.token_b64);
		token = atob(client.token_b64);
		client.token = token;
		console.log(token);

		client.ws = new WebSocket("ws://" + token);
		setupClient(client.ws)
	}
}

client.parse = function(content) {
	if (content['position'] != undefined) {
		client.init(content);
	} else if (content['current player'] != undefined) {
		client.waitCnt ++;
		console.log('wait time:')
		console.log(500 * client.waitCnt)
		setTimeout(function(){client.display(content);}, 500 * client.waitCnt)
	} else if (content['invalid'] != undefined) {
		// invalid operation
		console.log('invalid operation')
	}
}

client.init = function(content) {
	playerNames = content.player;
	game.position = content.position;
	PLAYER_COUNT = playerNames.length
	console.log('init')
	console.log(playerNames)
	console.log(game.position)
	game.start()
}

convertType = function(_card) {
	var c = _card.split('_');
	var card = {};
	card.color = c[0];
	card.content = c[1];
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
			card.content = parseInt(card.content);
			break;
		};
	}
	var colorMap = {
		'red': 0, 'green': 1, 'yellow': 2, 'blue': 3, 'none': 4
	};
	card.color = colorMap[card.color]
	console.log(card)
	return card;
}

client.display = function(content) {
	console.log('wait count')
	console.log(client.waitCnt)

	console.log('display infomation')
	console.log(content)
	game.state = content.state;
	client.displayLock = true;

	game.currentActivePlayerIndex = content['current player']
	var flag = false;
	if (content.direction == 0) {
		if (!game.direction)
			flag = true;
		game.direction = true;
	}
	else {
		if (game.direction)
			flag = true;
		game.direction = false;
	}
	if (flag)
		pageNotifier.notifyDirectionChanged(game.direction)

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
			card.content = parseInt(card.content);
			break;
		};
	}
	var colorMap = {
		'red': 0, 'green': 1, 'yellow': 2, 'blue': 3, 'none': 4
	};
	card.color = colorMap[card.color]
	console.log(card)

	var cardSet = [];
	var pos = game.position.toString();
	for (var i = 0; i < content[pos].length; i ++)
		cardSet.push(convertType(content[pos][i]))
	console.log(cardSet);
	content[pos] = cardSet;
	console.log(content);
	game.updateUserCards(content);

	console.log('current active player index')
	console.log(game.currentActivePlayerIndex)
	var p = content['current player'];
	game.sendOtherCard(p, card);
	if (p == game.user.index) {
		game.players[p].active(card, 0)
		client.waitCnt = 0;
	}
}

client.sendCard = function(card, cardIndex) {
	var data = {};
	var typeMap = {
		"全色": 'W',
		"停": 'S',
		'回': 'R',
		"+2": "+2",
		"+4": "+4"
	};
	data.state = game.state;
	if (card == null) {

	} else {
		console.log(COLORS);
		data.color = COLORS[card.color];
		data.card = cardIndex;
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

client.main = function() {

	var DEBUG = true;

	if (DEBUG) {
		// client.token = '183.172.85.120:14285/1/hgr/1';
		client.token = '127.0.0.1:14285/1/hgr/1';
		client.token_b64 = client.token;
		client.ws = new WebSocket("ws://" + client.token);
		setupClient(client.ws);
	}

}