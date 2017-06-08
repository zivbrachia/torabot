'use strict';
var express     = require('express');
var fileUpload  = require('express-fileupload');
//var format      = require('date-format');
var app         = express();
//var request     = require('request');
var admin       = require("firebase-admin");
var jsdom       = require("jsdom");
var bodyParser  = require('body-parser');
//https://graph.facebook.com/v2.6/1112428932213477?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAD9YvdlKUgBAMXakzgKX7G33uyhKZA2zjNIpryYCEab03ZAUgEAZCNioEBzJV0yTtGUuz2HxgQMNi32rWK8GJnZBGi0rSAHAkqZCfSjhOHmHqsQR65LVVrTEteOFcBb8QxZCqev8lCk122q3tMUzzWrBeZCHIjKc97zSDFH0Gy1gZDZD
var math         = require('math');
var serviceAccount = require(__dirname + '/src/views/torabot-2a48c-firebase-adminsdk-xqpcy-4cebf9d2ed');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://torabot-2a48c.firebaseio.com/",
});

var db = admin.database();

var port =process.env.PORT || 5000;

app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');
app.use(bodyParser.json());
app.use(fileUpload());

////// GET ////////
app.get('/wiki/:book/:perek', function (req, res) {
    res.render('wikiGet', { title: req.params.book + " " + req.params.perek });
});

app.get('/', function (req, res) {
    res.render('apiweb', { title: "Hello" });
});

app.get('/file', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="file_to_upload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});

////// POST ////////
app.post('/fileupload', function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
 
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
    let sampleFile = req.files.file_to_upload;
 
    // Use the mv() method to place the file somewhere on your server 
    sampleFile.mv('files_uploaded/' + sampleFile.name, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('File uploaded!');
        read_question_excel('files_uploaded/' + sampleFile.name);
    });
});

function endOfPerek(perek) {
    let messages = [];
    let title = "מגניב! סיימנו את פרק " + perek +", לאן ממשיכים עכשיו?";
    messages.push(buildMessageQuickReplies(title, ["דברים", "שמות", "במדבר"]));
    return messages;
}

app.post('/hook', function (req, res) {
    var b = "הביאור ל";
    var p = " פסוק ";
    var p2 = " פרק ";
    var h = " הוא: ";
    let speech_correct_answer = "אויי התשובה הנכונה היא:";
    let summery = "אז מה היה לנו עד כה:";
    let there_you_go = "כל הכבוד! איזה מגניב";
    
    var requestBody = req.body;
    console.log('hook request: ' + requestBody.result.resolvedQuery);
    try {
        var speech = 'empty speech';

        if (req.body) {

            if (requestBody.result) {

                if ((requestBody.result.action == "biur") || (requestBody.result.action == "biur1")) {
                    var num = "א"
                    if (requestBody.result.action == "biur") {
                        num = requestBody.result.parameters.number1;
                    }
                    var book1 = requestBody.result.parameters.book;
                    if ((book1 != "שמות") && (book1 != "במדבר") && (book1 != "דברים")) { //&& (book1 != "במדבר")&&(book1 != "בראשית")
                        let messages = [];
                        let title = "אני בשלבי פיתוח, עדיין לא ניתן לגשת לכל מקום בתנ״ך.";
                        messages.push(buildMessageQuickReplies(title, ["דברים", "שמות", "במדבר"]));
                        return res.json({
                            messages: messages
                        });
                    }
                    else {
                        speech = "קרתה תקלה, אפשר שוב? "

                        var ref = db.ref("Books/" + requestBody.result.parameters.book + " " + requestBody.result.parameters.number + "/" + num);
                        //ref.on("value", function (snapshot) {
                        ref.once("value", function (snapshot) {
                            //db.ref("Books/" + requestBody.result.parameters.book + " " + requestBody.result.parameters.number + "/" + nextpasuk(num)).on("value", function (snapshot_next) {
                            db.ref("Books/" + requestBody.result.parameters.book + " " + requestBody.result.parameters.number + "/" + nextpasuk(num)).once("value", function (snapshot_next) {
                                let next_pasuk = snapshot_next.val();
                                speech = snapshot.val();
                                if (speech === null) {
                                    let messages = endOfPerek(requestBody.result.parameters.number);
                                    return res.json({
                                        messages: messages
                                    }); 
                                }
                                else {
                                    var sender_id = (requestBody.originalRequest) && (requestBody.originalRequest.data) && (requestBody.originalRequest.data.sender) && (requestBody.originalRequest.data.sender.id);
                                    addQuestion(res, num, requestBody.result.parameters.number, requestBody.result.parameters.book, speech, sender_id, next_pasuk); 
                                }
                            }, function (errorObject) {
                                console.log(errorObject);
                            });
                        }, function (errorObject) {
                            console.log(errorObject);
                        });
                    }
                } else if (requestBody.result.action == "bye") {
                    return res.json({
                        speech: speech + "++",
                        displayText: speech + "--",
                        data: {
                            facebook: {

                                attachment: {
                                    type: "image",
                                    payload: {
                                        url: "http://www.seobook.com/images/smallfish.jpg"
                                    }
                                },


                            }
                        },
                    });
                } //http://sparks.simania.co.il/bibleSearch.php?query
                else if (requestBody.result.action == "findName") {
                    name = "נטע"
                    request("http://sparks.simania.co.il/bibleSearch.php?query=" + name, function (error, response, body) {
                        if (!error) {
                            jsdom.env({
                                html: body,
                                scripts: [
                                    'http://code.jquery.com/jquery-1.5.min.js'
                                ]
                                }, function (err, window) {
                                    var $ = window.jQuery;
                                    $("div > center > span > b:first").each(function () {
                                        console.log($(this).text());
                                    });
                            });
                            parseMyAwesomeHtml(body);
                        } else {
                            console.log(error);
                        }
                    });

                }
                else if (requestBody.result.action == "qa") {

                    db.ref('qa/שמות א/א').child(userId).once('value', function (snapshot) {
                        var exists = (snapshot.val() !== null);
                        userExistsCallback(userId, exists);
                    });

                }
                else if (requestBody.result.action == "unseen") {
                }
                else if (requestBody.result.action == "next") {
                    var senderId =  ((requestBody.originalRequest) && (requestBody.originalRequest.data) && (requestBody.originalRequest.data.sender) && (requestBody.originalRequest.data.sender.id)) || null;
                    if (senderId === null) return res.json({});
                    var ref = db.ref('/users/' + senderId);
                    //ref.on("value", function (snapshot) {
                    ref.once("value", function (snapshot) {
                        var exists = snapshot.val();
                        var pasuk = nextpasuk(exists.pasuk);

                        var m = exists.book + " פרק " + exists.perek + " פסוק " + pasuk + ": \n";

                        var book = exists.book;
                        var perek = exists.perek;

                        var ref = db.ref("Books/" + exists.book + " " + perek + "/" + pasuk);

                        //ref.on("value", function (snapshot1) {
                        ref.once("value", function (snapshot1) {
                            // console.log(snapshot.val());
                            if (snapshot1.val() === null) {
                                let messages = [];
                                messages.push(buildMessage("הפרק הסתיים"));
                                messages.push(buildMessageQuickReplies("לאן ממשיכים עכשיו?", ["דברים", "שמות", "במדבר"]));
                                return res.json({
                                    messages: messages
                                });
                            }
                            speech = m + snapshot1.val();
                            addQuestion(res, num, requestBody.result.parameters.number, requestBody.result.parameters.book, speech, requestBody.originalRequest.data.sender.id, snapshot1.val());
                        });      
                    });
                }
                else if (requestBody.result.action == "meaning") {
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);
                        var exists = snapshot.val();
                        let messages = [];
                        messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]))
                        return res.json({
                            messages: messages
                        });

                    });

                }
                else if (requestBody.result.action == "correct") {
                    // var next = "מושגים";
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);

                        var exists = snapshot.val();
                        var a = requestBody.result.fulfillment.speech;
                        let messages = [];
                        messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                        messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]));
                        return res.json({
                            messages: messages
                        });
                    });
                } else if (requestBody.result.action == "ques") {
                    if (requestBody.result.parameters.wrongQ) {

                        db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                            var exists = snapshot.val();
                            var a = requestBody.result.fulfillment.speech;
                            let messages = [];
                            messages.push(buildMessageQuickReplies(a + " התשובה הנכונה: " + exists.ans + ".", [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]));
                            return res.json({
                                messages: messages
                            });
                        });
                    } else {
                        var a = requestBody.result.fulfillment.speech;
                        db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                            //var exists = (snapshot.val() !== null);
                            var exists = snapshot.val();
                            if (exists.ans == requestBody.result.parameters.rightQ) {
                                let messages = [];
                                messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                                messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]));
                                return res.json({
                                    messages: messages
                                }); 
                            }
                            else{
                                let messages = [];
                                messages.push(buildMessageQuickReplies(speech_correct_answer + " " + exists.ans + "."))
                                return res.json({
                                    messages: messages
                                });
                            }
                        });
                    }
                }

                else if (requestBody.result.action == "q") {
                    /////////////////
                    var num1 = get_pasuk_number(requestBody.result.contexts[1].parameters.number1);
                    //db.ref("Books/" + requestBody.result.contexts[1].parameters.book + " " + requestBody.result.contexts[1].parameters.number + "/" + nextpasuk(num1)).on("value", function (snapshot_next) {
                    db.ref("Books/" + requestBody.result.contexts[1].parameters.book + " " + requestBody.result.contexts[1].parameters.number + "/" + nextpasuk(num1)).once("value", function (snapshot_next) {
                        let next_pasuk = snapshot_next.val();
                        ///////
                        let speech_next_pasuk = requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1);
                        if (next_pasuk === null) {
                            speech_next_pasuk = 'הפרק הסתיים';
                        }
                        //without koteret of last pskuim
                        if ((requestBody.result.contexts[0].parameters.koteret == '')||(requestBody.result.contexts[0].parameters.koteret == ' ')) {
                            // correct answer
                            if (requestBody.result.contexts[0].parameters.ans == requestBody.result.resolvedQuery) {
                                let messages = [];
                                messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                                messages.push(buildMessageQuickReplies(there_you_go, [speech_next_pasuk]));
                                return res.json({
                                    messages: messages
                                });
                            }
                            // wrong answer
                            else {
                                var messages = [];
                                messages.push(buildMessageQuickReplies(speech_correct_answer + ' ' + requestBody.result.contexts[0].parameters.ans + ".", [speech_next_pasuk]));
                                return res.json({
                                    messages: messages
                                });
                            }
                        }
                        //with sikum of last pskuim
                        else if (requestBody.result.contexts[0].parameters.ans == requestBody.result.resolvedQuery) {
                            // correct answer
                            let messages = [];
                            messages.push(buildMessage(there_you_go));
                            messages.push(buildMessageImage("https://preview.ibb.co/g66kSa/image.jpg"));
                            messages.push(buildMessageQuickReplies(summery + " " + requestBody.result.contexts[0].parameters.koteret, [speech_next_pasuk]));
                            return res.json({
                                messages: messages
                            });
                        } else {//witho sikum of last pskuim
                            // wrong answer
                            var messages = [];
                            messages.push(buildMessage(speech_correct_answer + " " + requestBody.result.contexts[0].parameters.ans + "."));
                            messages.push(buildMessageImage("https://preview.ibb.co/g66kSa/image.jpg"));
                            messages.push(buildMessageQuickReplies(summery + " " + requestBody.result.contexts[0].parameters.koteret, [speech_next_pasuk]));
                            return res.json({
                                messages: messages
                            });
                        }
                        ///////
                    }, function (errorObject) {
                        console.log(errorObject);
                    });
                    /////////////////
                    /*
                    var num1 = get_pasuk_number(requestBody.result.contexts[1].parameters.number1);
                    //without koteret of last pskuim
                    if ((requestBody.result.contexts[0].parameters.koteret == '')||(requestBody.result.contexts[0].parameters.koteret == ' ')) {
                        // correct answer
                        if (requestBody.result.contexts[0].parameters.ans == requestBody.result.resolvedQuery) {
                            let messages = [];
                            messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                            messages.push(buildMessageQuickReplies(there_you_go, [requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)]));
                            return res.json({
                                messages: messages
                            });
                        }
                        // wrong answer
                        else {
                            var messages = [];
                            messages.push(buildMessageQuickReplies(speech_correct_answer + ' ' + requestBody.result.contexts[0].parameters.ans + ".", [requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)]));
                            return res.json({
                                messages: messages
                            });
                        }
                    }
                    //with sikum of last pskuim
                    else if (requestBody.result.contexts[0].parameters.ans == requestBody.result.resolvedQuery) {
                        // correct answer
                        let messages = [];
                        messages.push(buildMessage(there_you_go));
                        messages.push(buildMessageImage("https://preview.ibb.co/g66kSa/image.jpg"));
                        messages.push(buildMessageQuickReplies(summery + " " + requestBody.result.contexts[0].parameters.koteret, [requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)]));
                        return res.json({
                            messages: messages
                        });
                    } else {//witho sikum of last pskuim
                        // wrong answer
                        var messages = [];
                        messages.push(buildMessage(speech_correct_answer + " " + requestBody.result.contexts[0].parameters.ans + "."));
                        messages.push(buildMessageImage("https://preview.ibb.co/g66kSa/image.jpg"));
                        messages.push(buildMessageQuickReplies(summery + " " + requestBody.result.contexts[0].parameters.koteret, [requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)]));
                        return res.json({
                            messages: messages
                        });
                    }
                    */
                }
                else if (requestBody.result.action == "incorrect") {
                //    var next = "מושגים";
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);
                        var exists = snapshot.val();
                            db.ref('/qa/' + exists.book + "/" + exists.perek + "/" + exists.pasuk).child("ans").once('value', function (snapshot) {
                                var val = snapshot.val();
                                var a = requestBody.result.fulfillment.speech;
                                let messages = [];
                                messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech + " התשובה הנכונה: " + val+"."), [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]);
                        return res.json({
                            messages: messages
                        });
                    });
                    });

                }
            else {
                var requestBody = req.body;

                if (requestBody.result) {
                    speech = '';

                    if (requestBody.result.fulfillment) {
                        speech += requestBody.result.fulfillment.speech;
                        speech += ' ';
                    }

                    if (requestBody.result.action) {
                        speech += 'action: ' + requestBody.result.action;
                    }
                }
            }
        }
        }
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

app.listen(port, function (err) {
    console.log('listening on port ' + port);
});

/*
setInterval(function () {
   
    if ((parseInt(format.asString()[11] + format.asString()[12]) < 20) && (parseInt(format.asString()[11] + format.asString()[12]) > 3))
   
    request('http://torabot.herokuapp.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('13 minutes passed');

        }
    })
   
}, 700000); 
*/

function read_question_excel(file_name) {
    var convertExcel = require('excel-as-json').processFile;
    //convertExcel("questions.xlsx", 'coll.json', false, function (err, callback) {
    convertExcel(file_name, 'excel_to_json/coll.json', false, function (err, callback) {
        var jsonfile = require('jsonfile')
        var file = 'data.json'
        for (var i = 0; i < callback.length; i++) {
            if (callback[i].pasuk != "") {
                admin.database().ref('/qa/' + callback[i].sefer + '/' + callback[i].perek + '/' + callback[i].pasuk).set({
                    pasuk: callback[i].pasuk,
                    q1: callback[i].ans1,
                    q2: callback[i].ans2,
                    q3: callback[i].ans3,
                    ans: callback[i].realans,
                    title: callback[i].question,
                    koteret: callback[i].koteret,
                    summary: callback[i].summary
                });    
            }
        }
    });
}

function res_json() {
    let res_json = {
        //speech: 'speech',
        //displayText: 'speech' + "",
        //source: 'apiai-webhook-sample',
        messages: [
            {
                title: "בדיקה",
                replies: ['a', 'b', 'c'],
                type: 2
            }
        ]
    };
    return res_json;
}

function nextpasuk(response) {
   /* db.ref('users/').set({
        username: "test2",
        email: "tes2t@mail.com"
    });*/
    
    var b = response.charCodeAt(0);
    //var b1 = response.charCodeAt(0);
    var a1 = 1;
    var c = "AB";


    if (response.length == 1) {
        if (b < 1496) { response = String.fromCharCode(b + 1); }
        if (b == 1496) { response = String.fromCharCode(1497); }
        if (b > 1496) { response = String.fromCharCode(b, 1488); }
        
    }
    else{
        var b2 = response.charCodeAt(1);
        if (b2 < 1496) { response = String.fromCharCode(b,b2+1); }
        if (b2 == 1496) {
            if (b + 1 == 1498 || b + 1 == 1501 || b + 1 == 1503)
                response = String.fromCharCode(b + 2);
            else response = String.fromCharCode(b + 1);
        }
        //if (b2 > 1496) { response = String.fromCharCode(b, 1488); }
    }
   // if response.
    if (response == "יה") return "טו";
    if (response == "טח") return "יז";
    return response;

};

function get_pasuk_number(pasuk_number) {
    if (pasuk_number) {
        return pasuk_number;
    } else {
        return "א";
    }
}

function setUser(id, book, perek, pasuk, ans) {
    if (id === undefined) {
        return;
    }
    db.ref('/users/' + id).set({
        book: book,
        perek: perek,
        pasuk: pasuk,
        ans: ans || ''
    });
};

function addQuestion(res, pasuk, perek, book, speech, id, next_pasuk) {
    db.ref('qa/'+book+"/"+perek).child(pasuk).once('value', function (snapshot) {
        let jsonObj = qExistsCallback(pasuk, perek, book, snapshot.val(), speech, id, next_pasuk);
        return res.json(jsonObj);
    });
 };

 function qExistsCallback(pasuk, perek, book, snap, speech, id, next_pasuk) {
    let jsonObj = buildCallback(pasuk, perek, book, snap, speech, next_pasuk);
    setUser(id, book, perek, pasuk, (snap && snap.ans) || '');
    return jsonObj;
};

function buildCallback(pasuk, perek, book, snap, speech, next_pasuk) {
    var next = "";
    var b = "הביאור ל";
    var p = " פסוק ";
    var p2 = " פרק ";
    var h = " הוא: ";
    var pic = null;
    
    let speech_next_pasuk = book + p2 + perek + p + nextpasuk(pasuk);
    let end = "מגניב! סיימנו את פרק"
    //let messages_end_perek = [];
    
    let callback = {};

    callback.contextOut = [];
    callback.messages = [];
    
    if (next_pasuk === null) {
        speech_next_pasuk = 'הפרק הסתיים';
        //messages_end_perek.push(buildMessage(end + " " + perek));
        //messages_end_perek.push(buildMessageQuickReplies("לאן ממשיכים עכשיו?"), ["דברים", "שמות", "במדבר"]);
        //callback.messages = messages_end_perek;
    }

    callback.contextOut.push(buildContextOutElement('pasuk', { book: book, number: perek, number1: pasuk }, 99));

    if (snap === null) {
        if (book === undefined) {
            console.log('buildCallback: book, ' + book);
        }
        callback.messages.push(buildMessageQuickReplies(speech, [speech_next_pasuk]));
    }
    else {
        if (snap.koteret) {
            if (snap.ans) {
                callback.contextOut.push(buildContextOutElement('q', { ans: snap.ans, koteret: snap.summary }, 1));

                callback.messages.push(buildMessage("בפסוקים הבאים נדבר על: " + snap.koteret));
                callback.messages.push(buildMessage(book + " " + perek + " " + pasuk + ":" + speech));
                callback.messages.push(buildMessageQuickReplies(snap.title, [snap.q1, snap.q2, snap.q3]));
            }
            else {
                callback.messages.push(buildMessage("בפסוקים הבאים נדבר על: " + snap.koteret));
                callback.messages.push(buildMessageQuickReplies(book + " " + perek + " " + pasuk + ":" + speech, [speech_next_pasuk]));        
            }
        }
        else if (!(snap.summary)) {
            callback.contextOut.push(buildContextOutElement('q', { ans: snap.ans, koteret: '' }, 1));

            callback.messages.push(buildMessage(speech));
            callback.messages.push(buildMessageQuickReplies(snap.title, [snap.q1, snap.q2, snap.q3]));
        } else {
            callback.contextOut.push(buildContextOutElement('q', { ans: snap.ans, koteret: snap.summary }, 1));

            callback.messages.push(buildMessage(speech));
            callback.messages.push(buildMessageQuickReplies(snap.title, [snap.q1, snap.q2, snap.q3]));
        }
    }

    return callback;
}

function buildContextOutElement(name, parameters, lifespan) {
    let contextOut = {};

    contextOut.name = name;
    contextOut.parameters = parameters;
    contextOut.lifespan = lifespan;

    return contextOut;
}

function buildMessage(speech) {
    let message = {};
    message.speech = speech;
    message.type = 0;
    return message;
}

function buildMessageQuickReplies(title, repliesArray) {
    if (typeof repliesArray !== 'undefined' && repliesArray.length > 0) {
        let message = {};
        message.title = title;
        message.replies = repliesArray;
        message.type = 2;
        return message;
    } else {
        return buildMessage(title);
    }
}

function buildMessageImage(imageUrl) {
    let message = {};
    message.imageUrl = imageUrl;
    message.type = 3;
    return message;
}

var gifs = ["https://media.giphy.com/media/TdfyKrN7HGTIY/giphy.gif",
    "https://media.giphy.com/media/IzVwOO8xZsfks/giphy.gif",
    "https://media.giphy.com/media/l0IyccEqUTO7xy9Ec/giphy.gif",
    "https://media.giphy.com/media/J93sVmfYBtsRi/giphy.gif",
    "https://media.giphy.com/media/10UeedrT5MIfPG/giphy.gif",
    "https://media.giphy.com/media/dchERAZ73GvOE/giphy.gif",
    "https://media.giphy.com/media/F9hQLAVhWnL56/giphy.gif",
    "https://media.giphy.com/media/fMfVV4yJCsBcA/giphy.gif",
    "https://media.giphy.com/media/10AoZDUmPrhguQ/giphy.gif",
    "https://media.giphy.com/media/OK27wINdQS5YQ/giphy.gif",
    "https://media.giphy.com/media/13zazU4zSlJCiA/giphy.gif",
    "https://media.giphy.com/media/8RxCFgu88jUbe/giphy.gif",
    "https://media.giphy.com/media/tIeCLkB8geYtW/giphy.gif",
    "https://media.giphy.com/media/3o6Zt7mutmbv76m0ko/giphy.gif",
    "https://media.giphy.com/media/l0HlMOmfyQsSuWTo4/giphy.gif",
    "https://media.giphy.com/media/l3vRnfGSGfpYk1r4A/giphy.gif",
    "https://media.giphy.com/media/26ufbLWPFHkhwXcpW/giphy.gif",
    "https://media.giphy.com/media/3o6ZtrizIMAWPkziXC/giphy.gif",
    "https://media.giphy.com/media/3oEjHCiAhQ8Kl0Skz6/giphy.gif",
    "https://media.giphy.com/media/26xBuwDvSNN9w8sda/giphy.gif",
    "https://media.giphy.com/media/DKnMqdm9i980E/giphy.gif",
    "https://media.giphy.com/media/xUySTDROpTveu0l6GA/giphy.gif",
    "https://media.giphy.com/media/l46CqXakVBc5ivUS4/giphy.gif",
    "https://media.giphy.com/media/1mW3bDTf348H6/giphy.gif",
    "https://media.giphy.com/media/J4ufHCZTcroys/giphy.gif",
    "https://media.giphy.com/media/7JYWGKgwxga5i/giphy.gif",
    "https://media.giphy.com/media/9rMvwuIpMBKU0/giphy.gif",
    "http://i.giphy.com/DYH297XiCS2Ck.gif",
    "http://i.giphy.com/6nuiJjOOQBBn2.gif",
    "http://i.giphy.com/inyqrgp9o3NUA.gif",
    "http://i.giphy.com/kwP6zStmgqdpe.gif",
    "http://i.giphy.com/wORkexswPznJC.gif",
    "http://i.giphy.com/FlWgXEtj5aM5G.gif",
    "http://i.giphy.com/11sBLVxNs7v6WA.gif",
    "http://i.giphy.com/pyw3lYQE4WE8.gif",
    "http://i.giphy.com/KkOwPDQP4hEas.gif",
    "http://i.giphy.com/MY0oIn9V44e8o.gif",
    "http://i.giphy.com/6QPbugKcP5hQs.gif",
    "http://i.giphy.com/emMufGgIdA3bq.gif",
    "http://i.giphy.com/F88KJcHzz5yJG.gif",
    "http://i.giphy.com/mpTCwKs2IGFSo.gif",
    "http://i.giphy.com/spRpesrLgALv2.gif",
    "http://i.giphy.com/wEL1mmGlveiCA.gif",
    "http://i.giphy.com/14t5vDlfXMzqfK.gif",
    "http://i.giphy.com/l44QePXW2Tf2swCru.gif",
    "http://i.giphy.com/3o6ZtnFVPBdcfpY22I.gif",
    "http://i.giphy.com/3o6ZsXoYhtUlGEyIRa.gif"];