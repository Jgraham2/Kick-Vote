
var sms = require('./sms');

var twilio = require('twilio');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var votes = {
    demo1: 0,
    demo2: 0
};

var numbers = [];
var censoredNumbers = [];

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/sms', function(req, res){

    console.log('Recieved an SMS');
    var message = req.body;
    var answer = message.Body.toLowerCase();
    var voter = message.From;

    if(answer == 'Demo 1' || answer == 'Demo 2'){
        if(numberVoted(voter)) {
            sms.send(voter, 'Sorry, you have already voted')
        }
        else{
            if(answer == 'Demo 1'){
                vote(voter, 'demo1');
            }else if (answer == 'Demo 2'){
                vote(voter, 'demo2');
            }
        }
    }
    else if(answer == 'score'){
        sms.send(voter, getScore());
    }
    else{
        sms.send(voter, 'Sorry, I did not understand. Please respond with either Demo 1, Demo 2 or SCORE"');
    }

    var twiml = new twilio.TwimlResponse();
    twiml.say('');

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());

});

if(process.env.CHEAT == "TRUE"){
    app.get('/vote/demo1', function(req, res){
        vote(null, 'demo1');
        res.send("Thanks for your Vote.");
    });

    app.get('/vote/demo2', function(req, res){
        vote(null, 'demo2');
        res.send("Thanks for your Vote." + Math.floor(Math.random()*100000000000) + "-" + Math.floor(Math.random()*1000) + ".");
    });
}

app.set('port', (process.env.PORT || 1337));

var server = app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.emit('votes', votes);
    socket.emit('number', process.env.TWILIO_NUMBER);
    socket.emit('numbers', numbers);
    socket.emit('percentages', getPercentages());
});





function numberVoted(number){
    return (numbers.indexOf(number) > -1);
}

function vote(number, answer){

    votes[answer]++;

    var percentages = getPercentages();

    io.emit('votes', votes);
    io.emit('percentages', percentages);
    io.emit('animate', answer);

    if(number){
        if(answer == 'demo1'){
            sms.send(number, 'You Voted Demo 1. ' + getScore());
        }
        else if(answer == 'demo2'){
            sms.send(number, 'You Voted Demo 2. ' + getScore());
        }
        else{
            return 1;
        }
    }
    if(number){
        numbers.push(number);
        censoredNumbers.push("xxx-xxx-" + number.substr(number.length - 4));
    }
    else{
        censoredNumbers.push("xxx-xxx-xxxx");
    }

    io.emit('numbers', censoredNumbers);
}

function getPercentages(){
    var pY = (votes.demo1 / (votes.demo1 + votes.demo2) * 100).toFixed(0);
    var pN = (votes.demo2 / (votes.demo1 + votes.demo2) * 100).toFixed(0);
    if (isNaN(pY)){
        pY = 50;
    }
    if (isNaN(pN)){
        pN = 50;
    }
    return {
        demo1: pY,
        demo2: pN
    }
}

function getScore(){
    var percentages = getPercentages();
    return 'Score: Demo 1 ' + percentages.demo1 + '% vs. Demo 2 ' + percentages.demo2 + '%';
}