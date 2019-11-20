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
	event.source.postMessage({message: 'caution'})
	let msg = event.data;
	if (msg.message == "init_player_player") {
		event.source.postMessage({message: 'caution', data: msg.token})
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
	
}

client.display = function(content) {
	
}

window.addEventListener("message", client.handle, false);
