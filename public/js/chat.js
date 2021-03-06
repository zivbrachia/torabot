// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

	// getting the id of the room from the url
	//var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);
	var id = window.location.pathname.split('/')[2]; // zivbr

	// connect to the socket
	var socket = io();
	
	// variables which hold the data for each person
	var name = "",
		email = "",
		img = "",
		friend = "";

	// cache some jQuery objects
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	// on connection to server get the id of person's room
	socket.on('connect', function(){

		socket.emit('load', id);
	});

	// save the gravatar url
	socket.on('img', function(data){
		img = data;
	});

	// receive the names and avatars of all people in the chat room
	socket.on('peopleinchat', function(data){

		if(data.number === 0) {
			showMessage("connected");
		} else {
			showMessage("personinchat",data);
		}

		loginForm.on('submit', function(e) {
			e.preventDefault();
			if (data.number === 0) {
				name = $.trim(yourName.val());
			} else {
				name = $.trim(hisName.val());
			}
			
			if(name.length < 1){
				alert("Please enter a nick name longer than 1 character!");
				return;
			}
			if (data.number === 0) {
				email = yourEmail.val();
			} else {
				email = $.trim(hisEmail.val());
			}
			
			if(!isValid(email)) {
				alert("Please enter a valid email!");
			} else {
				if (data.number === 0) {
					showMessage("inviteSomebody");
				}
				socket.emit('login', {user: name, avatar: email, id: id});
			}
		});
	});

	// Other useful 

	socket.on('startChat', function(data){
		console.log(data);
		if(data.boolean && data.id == id) {

			chats.empty();

			if(name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages",data);
			}
			else {

				showMessage("heStartedChatWithNoMessages",data);
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('tooMany', function(data){

		if(data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function(data){

		showMessage('chatStarted');

		/*if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
		*/
		createChatMessage(data.msg, data.user, data.img, moment());
		scrollToBottom();
	});

	textarea.keypress(function(e){

		// Submit the form on enter

		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();
		removeElement('quickreplies');

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();

			// Send the message to the other person in the chat
			socket.emit('msg', {msg: textarea.val(), user: name, img: img});

		}
		// Empty the textarea
		textarea.val("");
	});

	function removeElement(element) {
		var e = document.getElementById(element);
		if (e!==null) {
			e.parentNode.removeChild(e);
		}
	}

	// Update the relative time stamps on the chat messages every minute

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	// Function that creates a new chat message
	function createChatMessage(msg, user, imgg, now){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}
		create_li(who,msg, user, imgg, now);
		/*
		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + imgg + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');
			<input type="text" name="fname">
		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);
		*/
		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function create_li(who, msg, user, imgg, now) {
		if (Array.isArray(msg)) {
			msg.forEach(function(message) {
				//if (message.platform==='facebook') {
					if (message.type===0) {
						if (message.speech.trim().length) {
							var li = createElement(who, user, imgg, now, message.speech);
							chats.append(li);
						}
					}
					if (message.type===1) {
						var li = createElement(who, user, imgg, now, message);
						chats.append(li);
					}
					if (message.type===2) {
						if (message.title.trim().length) {
							var li = createElement(who, user, imgg, now, message.title, '', message.replies);
							chats.append(li);
						}
					}
					if (message.type===3) {
						var li = createElement(who, user, imgg, now, message, message.imageUrl);
						chats.append(li);
					}
				//}
				/*
				var li = $("<li></li>").addClass(who);
				var user_data = $("<div></div>").addClass("image").appendTo(li);
				var image = $("<img>").attr('src', imgg).appendTo(user_data);
				var b = $("<b></b>").appendTo(user_data);
				b.text(user);
				var i = $("<i></i>").addClass('timesent').attr('data-time', now).appendTo(user_data);
				//
				var p = $("<p></p>").appendTo(li);
				p.text(msg);
				//
				chats.append(li);
				*/
			});
		}
		else {
			var li = createElement(who, user, imgg, now, msg);
			chats.append(li);
		}		
	}
	function createElement(who, user, imgg, now, text, imageUrl, replies) {
		var li = $("<li></li>").addClass(who);
		var user_data = $("<div></div>").addClass("image").appendTo(li);
		var image = $("<img>").attr('src', imgg).appendTo(user_data);
		var b = $("<b></b>").appendTo(user_data);
		b.text(user);
		var i = $("<i></i>").addClass('timesent').attr('data-time', now).appendTo(user_data);
		//
		var p = $("<p></p>").addClass("msg").appendTo(li);
		imageUrl = imageUrl || '';
		if (imageUrl.trim().length) {
			var image_message = $("<img>").attr('src', imageUrl).appendTo(p);
			return li;
		}
		p.text(text);
		if (Array.isArray(replies)) {
				var div = $("<div></div>").attr("id", "quickreplies").appendTo(li);
			replies.forEach(function(reply) {
				var form = $("<form></form>").appendTo(div);
				var p_reply = $("<input>").addClass("quickreplies").attr("name", "reply").attr("type", "submit").attr("value", reply).appendTo(form);	

				form.on('submit', function(e) {
					e.preventDefault();
					//
					removeElement('quickreplies');
					if($(this).find("[name='reply']").val().trim().length) {
						createChatMessage($(this).find("[name='reply']").val(), name, img, moment());
						scrollToBottom();

						// Send the message to the other person in the chat
						socket.emit('msg', {msg: $(this).find("[name='reply']").val(), user: user, img: imgg});

					}
		// Empty the textarea
					textarea.val("");
					
				});
			});

		}

		return li;
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			// Set the invite link content
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}

		else if(status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}

});