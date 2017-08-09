'use strict';
var express     = require('express');
var fileUpload  = require('express-fileupload');
//var format      = require('date-format');
var app         = express();
var request     = require("request");
var restify     = require('restify');
var admin       = require("firebase-admin");
var jsdom       = require("jsdom");
var bodyParser  = require('body-parser');
var fs          = require('fs');
var JSONStore   = require('json-store');
var jsonPersist = JSONStore(__dirname + '/userData.json');
//https://graph.facebook.com/v2.6/1112428932213477?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAD9YvdlKUgBAMXakzgKX7G33uyhKZA2zjNIpryYCEab03ZAUgEAZCNioEBzJV0yTtGUuz2HxgQMNi32rWK8GJnZBGi0rSAHAkqZCfSjhOHmHqsQR65LVVrTEteOFcBb8QxZCqev8lCk122q3tMUzzWrBeZCHIjKc97zSDFH0Gy1gZDZD
var math         = require('math');
var serviceAccount = require(__dirname + '/src/views/torabot-2a48c-firebase-adminsdk-xqpcy-4cebf9d2ed');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://torabot-2a48c.firebaseio.com/",
});

var db = admin.database();

var port =process.env.PORT || 5000;

var io = require('socket.io').listen(app.listen(port));

//app.configure(function () {
//    app.use(express.bodyParser());
//});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static('public'));
app.use(express.static('dist'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');
app.use(bodyParser.json());
app.use(fileUpload());

require('./socket_event')(io, restify);

////// GET ////////
app.get('/wiki/:book/:perek', function (req, res) {
    //res.render('wikiGet', { title: req.params.book + " " + req.params.perek });

    let j = require('./Books/jonah');
    admin.database().ref('/Books/' + "יונה" + " " + 'א').set(j.chapter[0]);
    admin.database().ref('/Books/' + "יונה" + " " + 'ב').set(j.chapter[1]);
    admin.database().ref('/Books/' + "יונה" + " " + 'ג').set(j.chapter[2]);
    admin.database().ref('/Books/' + "יונה" + " " + 'ד').set(j.chapter[3]);
});

app.get('/', function (req, res) {
    res.render('apiweb', { title: "Hello" });
});
/*
app.get('/chat', function (req, res) {
    let html = fs.readFileSync(__dirname + '/views/chat.html', 'utf8');
    res.end(html);
});*/

app.get('/file', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="file_to_upload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
});

app.get('/cet', function (req, res) {
    var client = restify.createJsonClient({
        url: 'http://documentservice.cet.ac.il',
        version: '*'
    });

    client.get('/api/DocumentVersions/3a02b5a3-3c94-419a-8806-8bcd7b17882e/he', function(err, request, response, obj) {
        let documentVersions = JSON.parse(response.body);
        let minorVersion = documentVersions.MinorVersion;
        let majorVersion = documentVersions.MajorVersion;

        client.get('/api/DocumentRevisions/3a02b5a3-3c94-419a-8806-8bcd7b17882e/he/' + majorVersion + '/' + minorVersion, function(err, request, response, obj) {
            let documentRevisions = JSON.parse(response.body);
            let a = parsedocumentRevisions(documentRevisions);
            return res.json(a);
        });
    });
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

function parsedocumentRevisions(documentRevisions) {
    let a = {};
    a.pasuk = {};
    a.title = documentRevisions.title;
    a.documentId = documentRevisions.documentId;
    documentRevisions.documentModel.e_questionnaire.e_page.forEach(function(page) {
        a.pasuk[page.pageTitle] = {};
        a.pasuk[page.pageTitle].questions = [];
        page.e_question.forEach(function(question) {
            let questionElement = {};
            questionElement.title = question.instructions;
            questionElement.answers = question.e_singleChoice.e_option;
            questionElement.koteret = question.e_questionAssistants.assistant1;
            questionElement.summary = question.e_questionAssistants.assistant2;
            a.pasuk[page.pageTitle].questions.push(questionElement);
        });
    });
    return a;
}

function endOfPerek(book, perek) {
    let messages = [];
    let title = "מגניב! סיימנו את " + book + " פרק " + perek +", לאן ממשיכים עכשיו?";
    /*if (perek==="לד") {
        messages.push(buildMessageQuickReplies(title, ["סקר"]));    
    } else {
        messages.push(buildMessageQuickReplies(title, ["דברים", "שמות", "במדבר", "יונה"]));
    }*/
    messages.push(buildMessageQuickReplies(title, ["דברים", "שמות", "במדבר", "יונה"]));
    return messages;
}

function writeUserData(req, res, next) {
    req.source = (req.body.originalRequest) && (req.body.originalRequest.source);
    if (req.source === undefined) {
         req.source = (req.body.result) && (req.body.result.source);
    }
    if (req.body.originalRequest===undefined) {
        req.sender_id = req.body.sessionId  // if it from the web
        req.source = "sessionId"
    }
    else {
        req.sender_id = (req.body.originalRequest) && (req.body.originalRequest.data) && (req.body.originalRequest.data.sender) && (req.body.originalRequest.data.sender.id);
        req.source = (req.body.originalRequest) && (req.body.originalRequest.source);
    }
     
    req.userData = jsonPersist.get(req.sender_id) || {};
    
    next();
}

function buildMessages(req, res, next) {
    var b = "הביאור ל";
    var p  = " פסוק ";
    var p2 = " פרק ";
    var h = " הוא: ";
    let speech_correct_answer = "❌ אויי. התשובה הנכונה היא...";
    let summery = "אז מה היה לנו עד כה:";
    let there_you_go = "✅ כל הכבוד! איזה מגניב";
    
    var requestBody = req.body;
    console.log('hook request: ' + requestBody.result.resolvedQuery);
    try {
        var speech = 'empty speech';

        if (req.body) {

            if (requestBody.result) {

                if ((requestBody.result.action == "biur")) {
                    var pasuk = requestBody.result.parameters.pasuk || "א";
                    var book = requestBody.result.parameters.book;
                    var perek = requestBody.result.parameters.perek || "א";
                    //console.log('book: ' + book);
                    if ((book != "שמות") && (book != "במדבר") && (book != "דברים") && (book != "יונה")) {
                        let messages = [];
                        let title = "אני בשלבי פיתוח, עדיין לא ניתן לגשת לכל מקום בתנ״ך.";
                        messages.push(buildMessageQuickReplies(title, ["דברים", "שמות", "במדבר", "יונה"]));
                        req.send_messages = {messages: messages}
                        next();
                    }
                    else {
                        speech = "קרתה תקלה, אפשר שוב? "
                        ////
                        let messages = [];
                        var ref = db.ref("Books/" + requestBody.result.parameters.book + " " + perek);
                        ref.once("value", function (snapshot) {
                            let psukim = snapshot.val();
                            if (psukim===null) {
                                let title = "אני בשלבי פיתוח, עדיין לא ניתן לגשת לכל מקום בתנ״ך.";
                                messages.push(buildMessageQuickReplies(title, ["דברים", "שמות", "במדבר", "יונה"]));
                                req.send_messages = {messages: messages}
                                next();
                            }
                            else {
                                let psukim_arr = Object.keys(psukim);
                                req.userData.book = requestBody.result.parameters.book;
                                req.userData.perek = perek;
                                req.userData.pasuk = pasuk;
                                speech = psukim[pasuk];
                                req.userData.last_pasuk = gematria("string", (psukim_arr.length));
                                let next_pasuk = nextpasuk(pasuk);
                                if ((psukim[pasuk]===undefined) && (psukim[next_pasuk]===undefined)) {
                                    req.userData.next_pasuk = undefined;
                                    let messages = endOfPerek(req.userData.book, perek);
                                    req.send_messages = {messages: messages}
                                    next(); 
                                }
                                else {
                                      //var sender_id = (requestBody.originalRequest) && (requestBody.originalRequest.data) && (requestBody.originalRequest.data.sender) && (requestBody.originalRequest.data.sender.id);
                                    req.userData.next_pasuk = next_pasuk;
                                    addQuestion(res, pasuk, perek, requestBody.result.parameters.book, speech, next_pasuk, req, next, req.userData.last_pasuk); 
                                }
                            }
                        }, function (errorObject) {
                                console.log(errorObject);
                        });
                    }
                } else if (requestBody.result.action == "bye") {
                } else if (requestBody.result.action == "end_of_chapter") {
                    let messages = endOfPerek(req.userData.book, req.userData.perek);
                    req.send_messages = { messages: messages }
                    next(); 
                }
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
                else if (requestBody.result.action == "whatis") {
                    let messages = [];
                    //let snap = { title: req.userData.title, q1: req.userData.q1, q2: req.userData.q2, q3: req.userData.q3};
                    let speech = "שאלת מה זה " + requestBody.result.parameters.any;
                    let jsonObj = qExistsCallback(req.userData.pasuk, req.userData.perek, req.userData.book, req.userData.snap, speech, req.userData.next_pasuk, req, req.userData.last_pasuk, true);
                    req.send_messages = jsonObj
                    next();
                }
                else if (requestBody.result.action == "whois") {
                    let messages = [];
                    //let snap = { title: req.userData.title, q1: req.userData.q1, q2: req.userData.q2, q3: req.userData.q3};
                    let speech = "שאלת מי זה " + requestBody.result.parameters.any;
                    let jsonObj = qExistsCallback(req.userData.pasuk, req.userData.perek, req.userData.book, req.userData.snap, speech, req.userData.next_pasuk, req, req.userData.last_pasuk, true);
                    req.send_messages = jsonObj
                    next();
                }
                else if (requestBody.result.action == "qa") {
                }
                else if (requestBody.result.action == "unseen") {
                }
                else if (requestBody.result.action == "next") {
                    var senderId =  ((requestBody.originalRequest) && (requestBody.originalRequest.data) && (requestBody.originalRequest.data.sender) && (requestBody.originalRequest.data.sender.id)) || null;
                    if (senderId === null) {
                        let messages = [];
                        messages.push(messages.push(buildMessage("תרשמו לי באופן מלא לדוגמא: 'שמות יז פסוק א'")));
                        req.send_messages = {messages: messages}
                        next();
                    }
                    var pasuk = nextpasuk(req.userData.pasuk);
                    var m = req.userData.book + " פרק " + req.userData.perek + " פסוק " + pasuk + ": \n";
                    var ref = db.ref("Books/" + req.userData.book + " " + req.userData.perek + "/" + pasuk);
                    ref.once("value", function (snapshot1) {
                        if (snapshot1.val() === null) {
                            let messages = [];
                            messages.push(buildMessage("הפרק הסתיים"));
                            messages.push(buildMessageQuickReplies("לאן ממשיכים עכשיו?", ["דברים", "שמות", "במדבר", "יונה"]));
                            req.send_messages = {messages: messages};
                            next();
                        }
                        speech = m + snapshot1.val();
                        addQuestion(res, pasuk, req.userData.perek, req.userData.book, speech, snapshot1.val(), req, next);
                    });
                    /*
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
                                req.send_messages = {messages: messages}
                                next();
                            }
                            speech = m + snapshot1.val();
                            //(res, pasuk, perek, book, speech, id, next_pasuk)
                            addQuestion(res, pasuk, perek, book, speech, senderId, snapshot1.val(), req, next);
                        });      
                    });
                    */
                }
                else if (requestBody.result.action == "meaning") {
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);
                        var exists = snapshot.val();
                        let messages = [];
                        messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]))
                        req.send_messages = {messages: messages}
                        next();
                    });

                }
                else if (requestBody.result.action == "correct") {
                    // var next = "מושגים";
                    var a = requestBody.result.fulfillment.speech;
                    let messages = [];
                    messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                    messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [req.userData.book + p2 + req.userData.perek + p + nextpasuk(req.userData.pasuk)]));
                    req.send_messages = {messages: messages}
                    next();
                    /*
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);

                        var exists = snapshot.val();
                        var a = requestBody.result.fulfillment.speech;
                        let messages = [];
                        messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                        messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]));
                        req.send_messages = {messages: messages}
                        next();
                    });
                    */
                } 
                else if (requestBody.result.action == "ques") {
                    if (requestBody.result.parameters.wrongQ) {
                        var a = requestBody.result.fulfillment.speech;
                        let messages = [];
                        //messages.push(buildMessageQuickReplies(a + " התשובה הנכונה: " + req.userData.ans + ".", [req.userData.book + p2 + req.userData.perek + p + nextpasuk(req.userData.pasuk)]));
                        messages.push(buildMessage("❌ " + a + " התשובה הנכונה: "));
                        messages.push(buildMessageQuickReplies(req.userData.ans, [req.userData.book + p2 + req.userData.perek + p + nextpasuk(req.userData.pasuk)]));
                        req.send_messages = {messages: messages};
                        next();
                    } else {
                        var a = requestBody.result.fulfillment.speech;
                        if (req.userData.ans == requestBody.result.parameters.rightQ) {
                            let messages = [];
                            messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                            messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech, [req.userData.book + p2 + req.userData.perek + p + nextpasuk(req.userData.pasuk)]));
                            req.send_messages = {messages: messages};
                            next(); 
                        } else {
                            let messages = [];
                            messages.push(buildMessageQuickReplies(speech_correct_answer + " " + req.userData.ans + "."))
                            req.send_messages = {messages: messages};
                            next();
                        }
                    }
                }
                else if (requestBody.result.action == "q") {
                    /////////////////
                    //var num1 = get_pasuk_number(requestBody.result.contexts[0].parameters.number1);
                    var qContext = requestBody.result.contexts.find(find_context_q);
                    var pasukContext = requestBody.result.contexts.find(find_context_pasuk);
                    pasukContext.parameters.pasuk = get_pasuk_number(pasukContext.parameters.pasuk);
                    //pasukContext.parameters.last_pasuk = req.userData.last_pasuk;
                    db.ref("Books/" + pasukContext.parameters.book + " " + pasukContext.parameters.perek + "/" + nextpasuk(pasukContext.parameters.pasuk)).once("value", function (snapshot_next) {
                        let next_pasuk = snapshot_next.val();
                        ///////
                        let speech_next_pasuk = pasukContext.parameters.book + p2 + pasukContext.parameters.perek + p + nextpasuk(pasukContext.parameters.pasuk);
                        if (next_pasuk === null) {
                            speech_next_pasuk = 'הפרק הסתיים';
                        }
                        //without koteret of last pskuim
                        if ((qContext.parameters.koteret == '')||(qContext.parameters.koteret == ' ')) {
                            // correct answer
                            if (qContext.parameters.ans == requestBody.result.resolvedQuery) {
                                let messages = [];
                                messages.push(buildMessageImage(gifs[math.floor(math.random() * gifs.length)]));
                                messages.push(buildMessageQuickReplies(there_you_go, [speech_next_pasuk]));
                                req.send_messages = {messages: messages};
                                next();
                            }
                            // wrong answer
                            else {
                                var messages = [];
                                messages.push(buildMessageQuickReplies(speech_correct_answer + ' ' + qContext.parameters.ans + ".", [speech_next_pasuk]));
                                req.send_messages = {messages: messages};
                                next();
                            }
                        }
                        //with sikum of last pskuim
                        else if (qContext.parameters.ans == requestBody.result.resolvedQuery) {
                            // correct answer
                            let messages = [];
                            messages.push(buildMessage(there_you_go));
                            let summary_pic = qContext.parameters.summary_pics || "https://preview.ibb.co/g66kSa/image.jpg";
                            messages.push(buildMessageImage(summary_pic));
                            messages.push(buildMessageQuickReplies(summery + " " + qContext.parameters.koteret, [speech_next_pasuk]));
                            req.send_messages = {messages: messages};
                            next();
                        } else {//witho sikum of last pskuim
                            // wrong answer
                            var messages = [];
                            //messages.push(buildMessage(speech_correct_answer + " " + qContext.parameters.ans + "."));
                            messages.push(buildMessage(speech_correct_answer));
                            messages.push(buildMessage(qContext.parameters.ans));
                            let summary_pic = qContext.parameters.summary_pics || "https://preview.ibb.co/g66kSa/image.jpg";
                            messages.push(buildMessageImage(summary_pic));
                            messages.push(buildMessageQuickReplies(summery + " " + qContext.parameters.koteret, [speech_next_pasuk]));
                            req.send_messages = {messages: messages};
                            next();
                        }
                        ///////
                    }, function (errorObject) {
                        console.log(errorObject);
                    });
                    /////////////////
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
                                //messages.push(buildMessageQuickReplies(requestBody.result.fulfillment.speech + " התשובה הנכונה: " + val+"."), [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]);
                                messages.push(buildMessage("❌ " + requestBody.result.fulfillment.speech + " התשובה הנכונה: "));
                                messages.push(buildMessageQuickReplies(val), [exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)]);
                                req.send_messages = {messages: messages};
                                next();
                            });
                    });

                }
                else if (requestBody.result.action == "math") {
                    var result = eval(requestBody.result.parameters.a + requestBody.result.parameters.operator + requestBody.result.parameters.b);
                    let messages = [];
                    messages.push(buildMessage(requestBody.result.parameters.a + requestBody.result.parameters.operator + requestBody.result.parameters.b + " = " + result));
                    req.send_messages = {messages: messages}
                    next();
                }
                else {
                    var requestBody = req.body;
                    req.send_messages = requestBody.result.fulfillment.messages;
                    next();
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
}

function saveUserData(req, res, next) {
    jsonPersist.set(req.sender_id, req.userData);
    next();
}

function sendMessages(req, res) {
    //console.log(JSON.stringify(req.send_messages));
    res.header("Content-Type", "application/json; charset=utf-8");
    return res.json(req.send_messages);
}

app.post('/hook', [writeUserData, buildMessages, saveUserData, sendMessages]);

app.post('/webhook', function (req, res) {
    var client = restify.createJsonClient({
        url: 'https://api.api.ai',
        version: '*'
    });

    var options = {
        path: '/v1/query?v=20150910',
        headers: {
            'Authorization': 'Bearer 711c08d8f0bd400caa86312c68bc4b25',
            'content-type': 'application/json; charset=utf-8'
        }
    }
    console.log(JSON.stringify(req.body));
    var body = {
        "query": req.body.msg,
        //"timezone": "America/New_York",
        "lang": "en",
        "sessionId": req.body.id || req.body.user || 'something'
    }

    client.post(options, body, function(err, req, resApi, obj) {
        if (obj.status.code!==200) {
            console.log(JSON.stringify(obj.status));
            return res.status(500).json(obj.status);
        }
        let messages = mergeMessageType1(obj.result.fulfillment.messages);
        messages[0].showIcon = true;    // for web
        if (messages.length-1!==0) {
            messages[messages.length-1].last_msg = true;    // for web
        }
        let percent = 0;
        let result = {};
        result.msg = messages;
        //result.bg = 'https://s12.postimg.org/9weuz3svx/bkg_img.jpg';
                
        if (obj.result.action === "biur") {
            var pasukContext = obj.result.contexts.find(find_context_pasuk);
            if (pasukContext===undefined) {
                return res.json(result);
            }
            result.bg = pasukContext.parameters.bkg || 'https://s12.postimg.org/9weuz3svx/bkg_img.jpg';
            pasukContext.parameters.pasuk = get_pasuk_number(pasukContext.parameters.pasuk);
            pasukContext.parameters.last_pasuk = pasukContext.parameters.last_pasuk || 0
            let current = gematria("number", pasukContext.parameters.pasuk);
            let size = gematria("number", pasukContext.parameters.last_pasuk);
            result.status = {};
            result.color = "color2" // "color1", "color2", "color3", "color4"
            result.status.book = pasukContext.parameters.book;
            result.status.perek = pasukContext.parameters.perek;
            result.status.from = "א";
            result.status.to = pasukContext.parameters.last_pasuk ;
            result.status.current = pasukContext.parameters.pasuk;
            console.log(current + "/" + size + "=" + (current / size));
            result.status.percent = (current / size); // 0-1
            return res.json(result);
            /*
            var pasukContext = obj.result.contexts.find(find_context_pasuk);
            if (pasukContext===undefined) {
                return res.json(result);
            }
            pasukContext.parameters.pasuk = get_pasuk_number(pasukContext.parameters.pasuk);
            pasukContext.parameters.book;
            pasukContext.parameters.perek;
            let current = gematria("number", pasukContext.parameters.pasuk);
            result.status = {};
            db.ref("Books/" + pasukContext.parameters.book + " " + pasukContext.parameters.perek).once("value", function (snapshot) {
                let psukim = snapshot.val();
                let psukim_arr = Object.keys(psukim);
                let size = psukim_arr.length;
                result.color = '' // "color1", "color2", "color3", "color4"
                result.status.from = psukim_arr[0];
                result.status.to = psukim_arr[size-1];
                result.status.current = pasukContext.parameters.pasuk;
                result.status.percent = current / (size-1); // 0-1
                return res.json(result);
            }, function (errorObject) {
                console.log(errorObject);
            });
            */
        }
        else {
            return res.json(result);
        }
    });
});

function mergeMessageType1(messages) {
    let new_messages = [];
    let card_message = {};
    messages.forEach(function(message) {
        if (message.type!==1) {
            if (card_message.type) {
                new_messages.push(card_message);    
            }
            card_message = {};
            new_messages.push(message);
        } else {
            card_message.type = 1;
            card_message.messages = card_message.messages || [];
            card_message.messages.push(message);
        }
    });
    if (card_message.type) {
        new_messages.push(card_message);    
    }
    return new_messages;
}

function gematria(to, pasuk) {
    let sum = 0;
    if (to==="string") {
        let digit = 0
        let digitToLetter = {
            "1" : "א",
            "2" : "ב",
            "3" : "ג",
            "4" : "ד",
            "5" : "ה",
            "6" : "ו",
            "7" : "ז",
            "8" : "ח",
            "9" : "ט",
            "10" : "י",
            "20" : "כ",
            "30" : "ל",
            "40" : "מ",
            "50" : "נ",
            "60" : "ס",
            "70" : "ע",
            "80" : "פ",
            "90" : "צ",
            "100" : "ק",
            "200" : "ר",
            "300" : "ש",
            "400" : "ת"
        };
        sum = '';
        if (pasuk >= 400) {
            pasuk = pasuk - 400;
            sum = sum + digitToLetter[400];
        } 
        if ((300 <= pasuk) && (pasuk < 400)) {
            pasuk = pasuk - 300;
            sum = sum + digitToLetter[300];
        }if ((200 <= pasuk) && (pasuk < 300)) {
            pasuk = pasuk - 200;
            sum = sum + digitToLetter[200];
        }if ((100 <= pasuk) && (pasuk < 200)) {
            pasuk = pasuk - 100;
            sum = sum + digitToLetter[100];
        }if ((90 <= pasuk) && (pasuk < 100)) {
            pasuk = pasuk - 90;
            sum = sum + digitToLetter[90];
        }if ((80 <= pasuk) && (pasuk < 90)) {
            pasuk = pasuk - 80;
            sum = sum + digitToLetter[80];
        }if ((70 <= pasuk) && (pasuk < 80)) {
            pasuk = pasuk - 70;
            sum = sum + digitToLetter[70];
        }if ((60 <= pasuk) && (pasuk < 70)) {
            pasuk = pasuk - 60;
            sum = sum + digitToLetter[60];
        }if ((50 <= pasuk) && (pasuk < 60)) {
            pasuk = pasuk - 50;
            sum = sum + digitToLetter[50];
        }if ((40 <= pasuk) && (pasuk < 50)) {
            pasuk = pasuk - 40;
            sum = sum + digitToLetter[40];
        }if ((30 <= pasuk) && (pasuk < 40)) {
            pasuk = pasuk - 30;
            sum = sum + digitToLetter[30];
        }if ((20 <= pasuk) && (pasuk < 30)) {
            pasuk = pasuk - 20;
            sum = sum + digitToLetter[20];
        }if ((10 <= pasuk) && (pasuk < 20)) {
            pasuk = pasuk - 10;
            sum = sum + digitToLetter[10];
        }if (9 === pasuk) {
            pasuk = pasuk - 9;
            sum = sum + digitToLetter[9];
        }if (8 === pasuk) {
            pasuk = pasuk - 8;
            sum = sum + digitToLetter[8];
        }if (7 === pasuk) {
            pasuk = pasuk - 7;
            sum = sum + digitToLetter[7];
        }if (6 === pasuk) {
            pasuk = pasuk - 6;
            sum = sum + digitToLetter[6];
        }if (5 === pasuk) {
            pasuk = pasuk - 5;
            sum = sum + digitToLetter[5];
        }if (4 === pasuk) {
            pasuk = pasuk - 4;
            sum = sum + digitToLetter[4];
        }if (3 === pasuk) {
            pasuk = pasuk - 3;
            sum = sum + digitToLetter[3];
        }if (2 === pasuk) {
            pasuk = pasuk - 2;
            sum = sum + digitToLetter[2];
        }if (1 === pasuk) {
            pasuk = pasuk - 1;
            sum = sum + digitToLetter[1];
        }
    } else if (to==="number") {
        let letterToDigit = {
            "א" : "1",
            "ב" : "2",
            "ג" : "3",
            "ד" : "4",
            "ה" : "5",
            "ו" : "6",
            "ז" : "7",
            "ח" : "8",
            "ט" : "9",
            "י" : "10",
            "כ" : "20",
            "ל" : "30",
            "מ" : "40",
            "נ" : "50",
            "ס" : "60",
            "ע" : "70",
            "פ" : "80",
            "צ" : "90",
            "ק" : "100",
            "ר" : "200",
            "ש" : "300",
            "ת" : "400"
        }
        for(let i=0; i < pasuk.length; i++) {
            sum = sum + parseInt(letterToDigit[pasuk.charAt(i)]);
        } 
    }
    if (sum==="יה") sum = "טו";
    if (sum==="יו") sum = "טז";
    return sum;
}

console.log('Your application is running on http://localhost:' + port);
function find_context_q(context) {
    return (context.name === "q");
}

function find_context_pasuk(context) {
    return (context.name === "pasuk");
}
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
        var a = {};
        a.book = {};
        for (var i = 0; i < callback.length; i++) {
            if (callback[i].pasuk != "") {
                let perek = gematria("number", callback[i].perek);
                let pasuk = gematria("number", callback[i].pasuk);
                a.book[callback[i].sefer] = a.book[callback[i].sefer] || {};
                a.book[callback[i].sefer].perek = a.book[callback[i].sefer].perek || {};
                a.book[callback[i].sefer].perek[perek] = a.book[callback[i].sefer].perek[perek] || {};
                a.book[callback[i].sefer].perek[perek].pasuk = a.book[callback[i].sefer].perek[perek].pasuk || {};
                a.book[callback[i].sefer].perek[perek].pasuk[pasuk] = a.book[callback[i].sefer].perek[perek].pasuk[pasuk] || {};
                a.book[callback[i].sefer].perek[perek].pasuk[pasuk] = callback[i];
            }
        }
        for (var i = 0; i < callback.length; i++) {
            if (callback[i].pasuk != "") {
                let perek = gematria("number", callback[i].perek);
                let pasuk = gematria("number", callback[i].pasuk);
                callback[i].bkg_pics = callback[i].bkg_pics || a.book[callback[i].sefer].perek[perek].pasuk[1].bkg_pics;
                admin.database().ref('/qa/' + callback[i].sefer + '/' + callback[i].perek + '/' + callback[i].pasuk).set({
                    pasuk: callback[i].pasuk,
                    q1: callback[i].ans1,
                    q2: callback[i].ans2,
                    q3: callback[i].ans3,
                    ans: callback[i].realans,
                    title: callback[i].question,
                    koteret: callback[i].koteret,
                    summary: callback[i].summary,
                    summary_pics: callback[i].summary_pics,
                    bkg_pics : callback[i].bkg_pics

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

function addQuestion(res, pasuk, perek, book, speech, next_pasuk, req, next, last_pasuk) {
    addQuestionCet(res, pasuk, perek, book, speech, next_pasuk, req, next, last_pasuk);
 };

 function addQuestionCet(res, pasuk, perek, book, speech, next_pasuk, req, next, last_pasuk) {
    db.ref('cet/books/' + book + '/perek/' + perek + '/questionnaire').once('value', function (snapshot) {
        let item_id = snapshot.val();
        if (item_id === null) {
            db.ref('qa/'+book+"/"+perek).child(pasuk).once('value', function (snapshot) {
                let jsonObj = qExistsCallback(pasuk, perek, book, snapshot.val(), speech, next_pasuk, req, last_pasuk, false);
                req.send_messages = jsonObj
                next();
            });    
        } else {
            var client = restify.createJsonClient({
                url: 'http://documentservice.cet.ac.il',
                version: '*'
            });

            client.get('/api/DocumentVersions/' + item_id + '/he', function(err, request, response, obj) {
                let documentVersions = JSON.parse(response.body);
                let minorVersion = documentVersions.MinorVersion;
                let majorVersion = documentVersions.MajorVersion;

                client.get('/api/DocumentRevisions/' + item_id + '/he/' + majorVersion + '/' + minorVersion, function(err, request, response, obj) {
                    let documentRevisions = JSON.parse(response.body);
                    let a = parsedocumentRevisions(documentRevisions);
                    //
                    let b = "פסוק:"
                    let ques = (a.pasuk[b + pasuk]) && (a.pasuk[b + pasuk].questions[0]) || null;
                    let snap = buildSnapFromCet(ques);
                                
                    let jsonObj = qExistsCallback(pasuk, perek, book, snap, speech, next_pasuk, req, last_pasuk, false);
                    req.send_messages = jsonObj;
                    next();
                });
            });
        }
    });
 }

 function buildSnapFromCet(pasuk) {
    let snap = {};
    if (pasuk===null) return null;
    snap.title = cleanHtmlTags(pasuk.title);
    snap.koteret = cleanHtmlTags(pasuk.koteret);
    snap.summary = cleanHtmlTags(pasuk.summary);
    pasuk.answers.forEach(function(answer, i) {
        snap["q" + (i + 1)] = cleanHtmlTags(answer.labelHtml);
        if (answer.correct === true) {
            snap.ans = cleanHtmlTags(answer.labelHtml);
        }
    });
    return snap;
 }

 function cleanHtmlTags(string) {
     if (string===null) return string;
     return string.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, '');
 }

 function qExistsCallback(pasuk, perek, book, snap, speech, next_pasuk, req, last_pasuk, whatis) {
    let jsonObj = buildCallback(pasuk, perek, book, snap, speech, next_pasuk, last_pasuk, whatis);
    req.userData.snap = snap;
    req.userData.ans = (snap && snap.ans) || '';
    if (req.userData.ans) {
        req.userData.title = snap.title;
        req.userData.q1 = snap.q1;
        req.userData.q2 = snap.q2;
        req.userData.q3 = snap.q3;
    } else {
        req.userData.title = "";
        req.userData.q1 = "";
        req.userData.q2 = "";
        req.userData.q3 = "";
    }
    return jsonObj;
};

function buildCallback(pasuk, perek, book, snap, speech, next_pasuk, last_pasuk, whatis) {
    var next = "";
    var b = "הביאור ל";
    var p = " פסוק ";
    var p2 = " פרק ";
    var h = " הוא: ";
    var pic = null;
    
    let speech_next_pasuk = book + p2 + perek + p + nextpasuk(pasuk);
    let end = "מגניב! סיימנו את פרק"
    //let messages_end_perek = [];
    
    whatis = whatis || false;
    let callback = {};

    callback.contextOut = [];
    callback.messages = [];
    
    if (next_pasuk === null) {
        speech_next_pasuk = 'הפרק הסתיים';
    }
    let bkg_pics = snap && snap.bkg_pics || '';
    callback.contextOut.push(buildContextOutElement('pasuk', { book: book, perek: perek, pasuk: pasuk, last_pasuk: last_pasuk, bkg: bkg_pics}, 1));

    if (snap === null) {
        if (book === undefined) {
            console.log('buildCallback: book, ' + book);
        }
        callback.messages.push(buildMessageQuickReplies(speech, [speech_next_pasuk]));
    }
    else {
        if (snap.koteret) {
            if (snap.ans) {
                callback.contextOut.push(buildContextOutElement('q', { ans: snap.ans, koteret: snap.summary, summary_pics: snap.summary_pics }, 1));
                if (whatis===false) {
                    callback.messages.push(buildMessage("בפסוקים הבאים נדבר על: " + snap.koteret));
                    callback.messages.push(buildMessage(book + " " + perek + " " + pasuk + ":" + speech));
                    callback.messages.push(buildMessageQuickReplies(snap.title, [snap.q1, snap.q2, snap.q3]));
                }
                else if (whatis===true) {
                    callback.messages.push(buildMessage(speech));
                    callback.messages.push(buildMessageQuickReplies(snap.title, [snap.q1, snap.q2, snap.q3]));
                }
                
            }
            else {
                if (whatis===false) {
                    callback.messages.push(buildMessage("בפסוקים הבאים נדבר על: " + snap.koteret));
                    callback.messages.push(buildMessageQuickReplies(book + " " + perek + " " + pasuk + ":" + speech, [speech_next_pasuk]));
                } else if (whatis===true) {
                    callback.messages.push(buildMessage(speech));
                    callback.messages.push(buildMessageQuickReplies(book + " " + perek + " " + pasuk + ":" + speech, [speech_next_pasuk]));
                }
            }
        }
        else if (!(snap.summary)) {
            callback.contextOut.push(buildContextOutElement('q', { ans: snap.ans, koteret: ''}, 1));

            callback.messages.push(buildMessage(speech));
            callback.messages.push(buildMessageQuickReplies(snap.title, [snap.q1, snap.q2, snap.q3]));
        } else {
            callback.contextOut.push(buildContextOutElement('q', { ans: snap.ans, koteret: snap.summary, summary_pics: snap.summary_pics}, 1));

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