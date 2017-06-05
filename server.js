'use strict';
var express = require('express');
var format = require('date-format');
var app = express();
var request = require('request');
//var cheerio = require('cheerio');
//var async = require("async");
var admin = require("firebase-admin");
var jsdom = require("jsdom");
//let EventEmitter = require('events').EventEmitter;
var bodyParser = require('body-parser');
//https://graph.facebook.com/v2.6/1112428932213477?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAD9YvdlKUgBAMXakzgKX7G33uyhKZA2zjNIpryYCEab03ZAUgEAZCNioEBzJV0yTtGUuz2HxgQMNi32rWK8GJnZBGi0rSAHAkqZCfSjhOHmHqsQR65LVVrTEteOFcBb8QxZCqev8lCk122q3tMUzzWrBeZCHIjKc97zSDFH0Gy1gZDZD
app.use(express.static('public'));
app.set('views', __dirname + '/src/views');
var math = require('math');
var serviceAccount = require(__dirname + '/src/views/torabot-2a48c-firebase-adminsdk-xqpcy-4cebf9d2ed');
console.log(parseInt(format.asString()[11]+ format.asString()[12]) );
//console.log(math.floor(math.random() * (5)));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://torabot-2a48c.firebaseio.com/",
  //  serviceAccount: "ToraBot-a106f81597a6.json"
});
// read question excel
/*var convertExcel = require('excel-as-json').processFile;
convertExcel("questions.xlsx", 'coll.json', false, function (err, callback) {
    var jsonfile = require('jsonfile')
    var file = 'data.json'
    for (var i = 0; i < callback.length; i++) {

        if (callback[i].pasuk != "")
            admin.database().ref('/qa/' + callback[i].sefer + '/' + callback[i].perek + '/' + callback[i].pasuk).set(
                {
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
});
*/
var db = admin.database();



var port =process.env.PORT || 5000;



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/wiki', function (req, res) {

    res.render('wikiGet', { title: req.query.text });
});
app.get('/', function (req, res) {
    res.render('apiweb', { title: "Hello" });
});

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

function pasukNum(response) {
    var b;
    if (response.length == 1) {
      b = (response.charCodeAt(0) - 1487);
        return b;
    }
    else {
        return ((response.charCodeAt(0) - 1487) + (response.charCodeAt(1) - 1487));
        }
   

};
function qExistsCallback(pasuk, perek, book, snap, res, exist, speech,id) {
    var next = "";
    var b = "הביאור ל";
    var p = " פסוק ";
    var p2 = " פרק ";
    var h = " הוא: ";
    var pic = null;

   // if (snap1 == null) pic = null;
    //  else if ((perek == "יט") && (book == "שמות")) { pic = snap1.pic; next = snap1.pasuk; }
    if (exist) {
        if (snap.koteret) { //(pic == " " || pic == "" || pic ==null) {    no pics*****************************
            
            if (snap.ans) {
                /// question and kotert
                setUsera(id, book, perek, pasuk, snap.ans);
                return {

                    speech: speech + "++",
                    displayText: speech + "--",
                    source: 'apiai-webhook-sample',
                    contextOut: [
                        {
                            name: "q",
                            parameters: {
                                ans: snap.ans,
                                koteret: snap.summary
                            },
                            "lifespan": 1
                        },
                        {
                            name: "pasuk",
                            parameters: {
                                book: book,
                                number: perek,
                                number1: pasuk
                            },
                            "lifespan": 99
                        }
                    ],
                    messages: [
                        {
                            type: 0,
                            speech: "בפסוקים הבאים נדבר על: " + snap.koteret
                        },
                        {
                            type: 0,
                            speech: book + " " + perek + " " + pasuk + ":" + speech
                        },

                        {
                            title: snap.title,
                            replies: [
                                snap.q1, snap.q2, snap.q3//«¿§»Ð
                            ],
                            "type": 2
                        },


                    ]
                };

            } else {/// no question with kotert
                setUser(id, book, perek, pasuk);
                return {

                    speech: speech + "++",
                    displayText: speech + "--",
                    source: 'apiai-webhook-sample',
                    contextOut: [

                        {
                            name: "pasuk",
                            parameters: {
                                book: book,
                                number: perek,
                                number1: pasuk
                            },
                            "lifespan": 99
                        }],
                    messages: [
                        {
                            type: 0,
                            speech: "בפסוקים הבאים נדבר על " + snap.koteret
                        },

                        {
                            title: book + " " + perek + " " + pasuk + ":" + speech,
                            replies: [
                                book + p2 + perek + p + nextpasuk(pasuk)
                            ],
                            "type": 2
                        },

                    ]
                };
                
            }

        } else {
            if (!(snap.summary)) {
                /// question and no kotert and no summary
                setUsera(id, book, perek, pasuk, snap.ans);
                return {

                    speech: speech + "++",
                    displayText: speech + "--",
                    source: 'apiai-webhook-sample',
                    contextOut: [
                        {
                            "name": "q",
                            "parameters": {
                                ans: snap.ans,
                                koteret: ''
                            },
                            "lifespan": 1
                        }
                        ,
                        {
                            name: "pasuk",
                            parameters: {
                                book: book,
                                number: perek,
                                number1: pasuk
                            },
                            "lifespan": 99
                        }
                    ],
                    messages: [

                        {
                            type: 0,
                            speech: speech
                        },

                        {
                            title: snap.title,
                            replies: [
                                snap.q1, snap.q2, snap.q3//«¿§»Ð
                            ],
                            "type": 2
                        },


                    ]
                };
            }
            else { /// question and no kotert and  summary
                setUsera(id, book, perek, pasuk, snap.ans);
                return {

                    speech: speech + "++",
                    displayText: speech + "--",
                    source: 'apiai-webhook-sample',
                    contextOut: [
                        {
                            "name": "q",
                            "parameters": {
                                ans: snap.ans,
                                koteret: snap.summary
                            },
                            "lifespan": 1
                        }
                        ,
                        {
                            name: "pasuk",
                            parameters: {
                                book: book,
                                number: perek,
                                number1: pasuk
                            },
                            "lifespan": 99
                        }
                    ],
                    messages: [

                        {
                            type: 0,
                            speech: speech
                        },

                        {
                            title: snap.title,
                            replies: [
                                snap.q1, snap.q2, snap.q3//«¿§»Ð
                            ],
                            "type": 2
                        },


                    ]
                };
            }
    }

    } else {
      /// no question or kotert
            setUser(id, book, perek, pasuk);
            return {

                speech: speech + "++",
                displayText: speech + "--",
                source: 'apiai-webhook-sample',
                contextOut: [

                    {
                        name: "pasuk",
                        parameters: {
                            book: book,
                            number: perek,
                            number1: pasuk
                        },
                        "lifespan": 99
                    }],
                messages: [
                    /*      {
                              type: 0,
                              speech: b + book + " " + perek + p + pasuk + h
                          },
                         {
                              type: 0,
                              speech: speech
                          },
                      */
                    {
                        title: speech,
                        replies: [
                            book + p2 + perek + p + nextpasuk(pasuk)
                        ],
                        "type": 2
                    },


                ]
            };
        

    }

};
function addQuestion(res, pasuk, perek, book, speech,id) {
    // db.ref('json/').child(pasukNum(pasuk)).once('value', function (snapshot1) {

    db.ref('qa/'+book+"/"+perek).child(pasuk).once('value', function (snapshot) {
        var exists = (snapshot.val() !== null);
      
        // return qExistsCallback(pasuk, perek, book, snapshot.val(), res, exists, speech, snapshot1.val(),id);

        //return qExistsCallback(pasuk, perek, book, snapshot.val(), res, exists, speech, id);
        let jsonObj = qExistsCallback(pasuk, perek, book, snapshot.val(), res, exists, speech, id);
        return res.json(jsonObj);
    });
 
   // });

};

function setUsera(id, book, perek, pasuk,ans) {
    db.ref('/users/' + id).set({
        book: book,
        perek: perek,
        pasuk: pasuk,
        ans:ans
    });
};
function setUser(id,book,perek,pasuk) {
    db.ref('/users/' +id).set({
        book: book,
        perek: perek,
        pasuk: pasuk,
        ans:""
    });
};


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
    "http://i.giphy.com/3o6ZsXoYhtUlGEyIRa.gif"]


app.use(bodyParser.json());
app.post('/hook', function (req, res) {
    //return res.json(res_json());
    var b = "הביאור ל";
    var p = " פסוק ";
    var p2 = " פרק ";
    var h = " הוא: ";
    
    console.log('hook request');
    var requestBody = req.body;
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
                        return res.json({

                            speech: speech + "",
                            displayText: speech + "",
                            source: 'apiai-webhook-sample',
                            messages: [
               
                                {
                                    title: "אני בשלבי פיתוח, עדיין לא ניתן לגשת לכל מקום בתנ״ך. ",
                                    replies: [
                                        "דברים", "שמות", "במדבר"
                                    ],
                                    "type": 2
                                },


                            ]
                        });



                    }
                    else {
                        speech = "קרתה תקלה, אפשר שוב? "

                        var ref = db.ref("Books/" + requestBody.result.parameters.book + " " + requestBody.result.parameters.number + "/" + num);
                        ref.on("value", function (snapshot) {
                            speech = snapshot.val();
                            if (speech == undefined)
                                return res.json({

                                speech: speech + "",
                                displayText: speech + "",
                                source: 'apiai-webhook-sample',
                                messages: [

                                    {
                                        title: "מגניב! סיימנו את פרק " + requestBody.result.parameters.number +", לאן ממשיכים עכשיו?" ,
                                        replies: [
                                            "דברים", "שמות", "במדבר"
                                        ],
                                        "type": 2
                                    },


                                ]
                            });
                            else{
                                return addQuestion(res, num, requestBody.result.parameters.number, requestBody.result.parameters.book, speech, requestBody.originalRequest.data.sender.id);
                            }}, function (errorObject) {
                                console.log("The read failed: " + errorObject.code);
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

                    var ref = db.ref('/users/'+requestBody.originalRequest.data.sender.id);
                    ref.on("value", function (snapshot) {
                        //var exists = (snapshot.val() !== null);

                        var exists = snapshot.val();
                        var pasuk = nextpasuk(exists.pasuk);

                        var m = exists.book + " פרק " + exists.perek + " פסוק " + pasuk + ": \n";

                        var book = exists.book;
                        var perek = exists.perek;


                        //      setUser(requestBody.originalRequest.data.sender.id, book, perek, pasuk);

                        var ref = db.ref("Books/" + exists.book + " " + perek + "/" + pasuk);

                        ref.on("value", function (snapshot1) {
                            // console.log(snapshot.val());
                            speech = m + snapshot1.val();
                            return addQuestion(res, pasuk, perek, book, speech, requestBody.originalRequest.data.sender.id);
                        });      
                    });
                }
                else if (requestBody.result.action == "meaning") {
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);
                        var exists = snapshot.val();

                        return res.json({

                            speech: speech + "++",
                            displayText: speech + "--",
                            source: 'apiai-webhook-sample',
                            messages: [

                                {
                                    title: requestBody.result.fulfillment.speech,
                                    replies: [
                                        // next,
                                        exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)
                                    ],
                                    "type": 2
                                },


                            ]
                        });

                    });

                }
                else if (requestBody.result.action == "correct") {
                    // var next = "מושגים";
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);

                        var exists = snapshot.val();
                        var a = requestBody.result.fulfillment.speech;
                        return res.json({

                            speech: speech + "++",
                            displayText: speech + "--",
                            source: 'apiai-webhook-sample',
                            messages: [
                                {
                                    "imageUrl": gifs[math.floor(math.random() * (20))],
                                    "type": 3
                                },
                                {
                                    title: a,
                                    replies: [
                                        // next,
                                        exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)
                                    ],
                                    "type": 2
                                },
                            ]
                        });
                    });
                } else if (requestBody.result.action == "ques") {
                    if (requestBody.result.parameters.wrongQ) {

                        db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                            //var exists = (snapshot.val() !== null);
                            var exists = snapshot.val();
                            var a = requestBody.result.fulfillment.speech;
                            return res.json({

                                speech: speech + "++",
                                displayText: speech + "--",
                                source: 'apiai-webhook-sample',
                                messages: [

                                    {
                                        title: a + " התשובה הנכונה: " + exists.ans + ".",
                                        replies: [
                                            //  next,
                                            exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)
                                        ],
                                        "type": 2
                                    },
                                ]
                            });
                        });
                    } else {
                        var a = requestBody.result.fulfillment.speech;
                        db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                            //var exists = (snapshot.val() !== null);
                            var exists = snapshot.val();
                            if (exists.ans == requestBody.result.parameters.rightQ) {
                                return res.json({

                                    speech: speech + "++",
                                    displayText: speech + "--",
                                    source: 'apiai-webhook-sample',
                                    messages: [
                                        {
                                            "imageUrl": gifs[math.floor(math.random() * (20))],
                                            "type": 3
                                        },
                                        {
                                            title: requestBody.result.fulfillment.speech,
                                            replies: [
                                                // next,
                                                exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)
                                            ],
                                            "type": 2
                                        },
                                    ]
                                }); 
                            }
                            else{
                                var a = "אויי התשובה הנכונה היא: ";
                                return res.json({

                                    speech: speech + "++",
                                    displayText: speech + "--",
                                    source: 'apiai-webhook-sample',
                                    messages: [
                                        {
                                            title: a  + exists.ans + ".",
                                            replies: [
                                                //  next,
                                                exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)
                                            ],
                                            "type": 2
                                        }
                                    ]
                                });
                            }
                        });
                    }
                }

                else if (requestBody.result.action == "q") {
                    if (requestBody.result.contexts[1].parameters.number1)
                        var num1 = requestBody.result.contexts[1].parameters.number1;
                    else
                        var num1 = "א";
                    //    var next = "מושגים";
                    if ((requestBody.result.contexts[0].parameters.koteret == '')||(requestBody.result.contexts[0].parameters.koteret == ' '))
                    {//without sikum of last pskuim
                        if (requestBody.result.contexts[0].parameters.ans == requestBody.result.resolvedQuery) {
                          /*  if (requestBody.result.contexts[0]){
                                return res.json({

                                    speech: speech + "++",
                                    displayText: speech + "--",
                                    source: 'apiai-webhook-sample',
                                    messages: [

                                        {
                                            title: "כל הכבוד! המשך כך",
                                            replies: [
                                                //  next,
                                                requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(requestBody.result.contexts[1].parameters.number1)
                                            ],
                                            "type": 2
                                        },


                                    ]
                                });
                            }

                            else*/

                            return res.json({

                                speech: speech + "++",
                                displayText: speech + "--",
                                source: 'apiai-webhook-sample',
                                messages: [
                                    {
                                        "imageUrl": gifs[math.floor(math.random() * (46))],
                                        "type": 3
                                    },
                                    {
                                        title: "כל הכבוד! איזה מגניב",
                                        replies: [
                                            //  next,
                                            requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)
                                        ],
                                        "type": 2
                                    },


                                ]
                            });
                        }
                        else//without sikum of last pskuim
                            return res.json({

                                speech: speech + "++",
                                displayText: speech + "--",
                                source: 'apiai-webhook-sample',
                                messages: [

                                    {
                                        title: "אוי.. התשובה הנכונה היא: " + requestBody.result.contexts[0].parameters.ans + ".",
                                        replies: [
                                            //  next,
                                            requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)
                                        ],
                                        "type": 2
                                    },


                                ]
                            });
                }
                        else

                    if (requestBody.result.contexts[0].parameters.ans == requestBody.result.resolvedQuery)
                    {//with sikum of last pskuim
                        return res.json({

                            speech: speech + "++",
                            displayText: speech + "--",
                            source: 'apiai-webhook-sample',
                            messages: [
                                {
                                    speech: "כל הכבוד! איזה מגניב",

                                    "type": 0
                                },
                                {
                                    "imageUrl": "https://preview.ibb.co/g66kSa/image.jpg",
                                    "type": 3
                                },
                                {
                                    title: "אז מה היה לנו עד כה: " + requestBody.result.contexts[0].parameters.koteret,
                                    replies: [
                                        //  next,
                                        requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)
                                    ],
                                    "type": 2
                                },


                            ]
                        });}
                    else //witho sikum of last pskuim
                        return res.json({

                            speech: speech + "++",
                            displayText: speech + "--",
                            source: 'apiai-webhook-sample',
                            messages: [
                                {
                                    type: 0,
                                    speech: "אוי.. התשובה הנכונה היא: " + requestBody.result.contexts[0].parameters.ans + "."
                                },
                                {
                                    "imageUrl": "https://preview.ibb.co/g66kSa/image.jpg",
                                    "type": 3
                                },
                                {
                                    title: "אז מה היה לנו עד כה: " + requestBody.result.contexts[0].parameters.koteret,
                                    replies: [
                                        //  next,
                                        requestBody.result.contexts[1].parameters.book + p2 + requestBody.result.contexts[1].parameters.number + p + nextpasuk(num1)
                                    ],
                                    "type": 2
                                },


                            ]
                        });



                }
                else if (requestBody.result.action == "incorrect") {
                //    var next = "מושגים";
                    db.ref('/users/').child(requestBody.originalRequest.data.sender.id).once('value', function (snapshot) {
                        //var exists = (snapshot.val() !== null);
                        var exists = snapshot.val();
                            db.ref('/qa/' + exists.book + "/" + exists.perek + "/" + exists.pasuk).child("ans").once('value', function (snapshot) {
                                var val = snapshot.val();
                                var a = requestBody.result.fulfillment.speech;
                        return res.json({

                            speech: speech + "++",
                            displayText: speech + "--",
                            source: 'apiai-webhook-sample',
                            messages: [

                                {
                                    title: a+ " התשובה הנכונה: " + val+".",
                                    replies: [
                                      //  next,
                                        exists.book + p2 + exists.perek + p + nextpasuk(exists.pasuk)
                                    ],
                                    "type": 2
                                },


                            ]
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

        console.log('result: ', speech);


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

setInterval(function () {
   
    if ((parseInt(format.asString()[11] + format.asString()[12]) < 20) && (parseInt(format.asString()[11] + format.asString()[12]) > 3))
   
    request('http://torabot.herokuapp.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('13 minutes passed');

        }
    })
   
}, 700000); 
/*var http = require('http');
var port = process.env.port || 1337;
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/

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