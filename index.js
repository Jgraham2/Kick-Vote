
var sms = require('./sms');

var twilio = require('twilio');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var votes = {
    yes: 0,
    no: 0
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

    if(answer == 'yes' || answer == 'no'){
        if(numberVoted(voter)) {
            sms.send(voter, 'Sorry, you have already voted')
        }
        else{
            if(answer == 'yes'){
                vote(voter, 'yes');
            }else if (answer == 'no'){
                vote(voter, 'no');
            }
        }
    }
    else if(answer == 'score'){
        sms.send(voter, getScore());
    }
    else{
        sms.send(voter, 'Sorry, I did not understand. Please respond with either YES, NO or SCORE"');
    }

    var twiml = new twilio.TwimlResponse();
    twiml.say('');

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());

});

if(process.env.CHEAT == "TRUE"){
    app.get('/vote/yes', function(req, res){
        vote(null, 'yes');
        res.send("Thanks for your Vote.");
    });

    app.get('/vote/no', function(req, res){
        vote(null, 'no');
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
        if(answer == 'yes'){
            sms.send(number, 'You Voted Yes. ' + getScore());
        }
        else if(answer == 'no'){
            sms.send(number, 'You Voted No. ' + getScore());
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
    var pY = (votes.yes / (votes.yes + votes.no) * 100).toFixed(0);
    var pN = (votes.no / (votes.yes + votes.no) * 100).toFixed(0);
    if (isNaN(pY)){
        pY = 50;
    }
    if (isNaN(pN)){
        pN = 50;
    }
    return {
        yes: pY,
        no: pN
    }
}

function getScore(){
    var percentages = getPercentages();
    return 'Score: YES ' + percentages.yes + '% vs. NO ' + percentages.no + '%';
}