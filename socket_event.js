module.exports = function(io, restify) {
    // Initialize a new socket.io application, named 'chat'
	var chat = io.on('connection', function (socket) {

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(roomId){

			var room = findClientsSocket(io, roomId);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length >= 1) {

				//chat.emit('tooMany', {boolean: true});
				socket.emit('peopleinchat', {
					number: room.length,
					user: room[0].username,
					avatar: room[0].avatar,
					id: roomId
				});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id);
			// Only two people per room are allowed
			if (room.length < 20) {

				// Use the socket object to store data. Each client gets
				// their own unique socket object

				socket.username = data.user;
				socket.room = data.id;
				////socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

				// Tell the person what he should use for an avatar
				socket.emit('img', '../img/unnamed.jpg' /*socket.avatar*/);


				// Add the client to the room
				socket.join(data.id);

				if (room.length>=1) {
				// zivbr
					var usernames = [];
					var avatars = [];
					room.forEach(function(socket) {
						usernames.push(socket.username);
						avatars.push(socket.avatar);
					});
					usernames.push(socket.username);
					avatars.push(socket.avatar);

					// Send the startChat event to all the people in the
					// room, along with a list of people that are in it.
					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
				// zivbr
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// Somebody left the chat
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){
            
            var client = restify.createJsonClient({
                url: 'https://api.api.ai',
                version: '*'
            });
            //'https://api.api.ai/v1/query?v=20150910&query=' + data.msg + '&lang=en&sessionId=' + socket.id

            var options = {
                path: '/v1/query?v=20150910',
                headers: {
                    'Authorization': 'Bearer 711c08d8f0bd400caa86312c68bc4b25',
                    'content-type': 'application/json; charset=utf-8'
                }
            }
            var body = {
                "query": data.msg,
                //"timezone": "America/New_York",
                "lang": "en",
                "sessionId": socket.id
            }
                
            client.post(options, body, function(err, req, res, obj) {
                /*assert.ifError(err);
                console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);
                */
                io.to(socket.id).emit('receive', {msg: JSON.stringify(obj.result.fulfillment.messages), user: 'שרה', img: '../img/unnamed.jpg'});
            });

			// When the server receives a message, it sends it to the other person in the room.
			//socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});
}

module.exports.room_list = getRoomList;
function findClientsSocket(io, roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				//var index = ns.connected[id].rooms.indexOf(roomId) ;	// socket.io version 1.0.6
				var index = ns.connected[id].rooms[roomId];	// socket.io version 2.0.2
				//if(index !== -1) {
				if (index !== undefined) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}

function getRoomList(io, namespace) {
	let ns = io.of(namespace || "/");
	let rooms = ns.adapter.rooms;
	
	return rooms;
}