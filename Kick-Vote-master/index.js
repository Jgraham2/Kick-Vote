
var sms = require('./sms');

var twilio = require('twilio');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var votes = {
    demo1: 0,
    demo2: 0,
    demo3: 0,
    demo4: 0,
    demo5: 0,
    demo6: 0
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

    if(answer == 'demo1' || answer == 'demo2' || answer == 'demo3' || answer == 'demo4' || answer == 'demo5' || answer == 'demo6'){
        if(numberVoted(voter)) {
            sms.send(voter, 'Sorry, you have already voted')
        }
        else{
            if(answer == 'demo1'){
                vote(voter, 'demo1');
                
            } 
            if (answer == 'demo2'){
                vote(voter, 'demo2');
            }
            if (answer == 'demo3'){
                vote(voter, 'demo3');
            }
            if (answer == 'demo4'){
                vote(voter, 'demo4');
            }
            if (answer == 'demo5'){
                vote(voter, 'demo5');
            }
            else if (answer == 'demo6'){
                vote(voter, 'demo6');
            }
        }
    }
    else if(answer == 'score'){
        sms.send(voter, getScore());
    }
    else{
        sms.send(voter, 'Sorry, I did not understand. Please respond with either "demo1, demo2, demo3, demo4, demo5, demo6"');
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
        res.send("Thanks for your Vote.");
    });
    
    app.get('/vote/demo3', function(req, res){
        vote(null, 'demo3');
        res.send("Thanks for your Vote.");
    });
    
    app.get('/vote/demo4', function(req, res){
        vote(null, 'demo4');
        res.send("Thanks for your Vote.");
    });
    
    app.get('/vote/demo5', function(req, res){
        vote(null, 'demo6');
        res.send("Thanks for your Vote.");
    });
    
    app.get('/vote/demo6', function(req, res){
        vote(null, 'demo6');
        res.send("Thanks for your Vote.");
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
            sms.send(number, 'You Voted Demo 1. ');
        }
        else if(answer == 'demo2'){
            sms.send(number, 'You Voted Demo 2. ');
        }
        else if(answer == 'demo3'){
            sms.send(number, 'You Voted Demo 3. ');
        }
        else if(answer == 'demo4'){
            sms.send(number, 'You Voted Demo 4. ');
        }
        else if(answer == 'demo5'){
            sms.send(number, 'You Voted Demo 5. ');
        }
        else if(answer == 'demo6'){
            sms.send(number, 'You Voted Demo 6. ');
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
    var p1 = (votes.demo1 / (votes.demo1 + votes.demo2 + votes.demo3 + votes.demo4 + votes.demo5 + votes.demo6) * 100).toFixed(0);
    var p2 = (votes.demo2 / (votes.demo1 + votes.demo2 + votes.demo3 + votes.demo4 + votes.demo5 + votes.demo6) * 100).toFixed(0);
    var p3 = (votes.demo3 / (votes.demo1 + votes.demo2 + votes.demo3 + votes.demo4 + votes.demo5 + votes.demo6) * 100).toFixed(0);
    var p4 = (votes.demo4 / (votes.demo1 + votes.demo2 + votes.demo3 + votes.demo4 + votes.demo5 + votes.demo6) * 100).toFixed(0);
    var p5 = (votes.demo5 / (votes.demo1 + votes.demo2 + votes.demo3 + votes.demo4 + votes.demo5 + votes.demo6) * 100).toFixed(0);
    var p6 = (votes.demo6 / (votes.demo1 + votes.demo2 + votes.demo3 + votes.demo4 + votes.demo5 + votes.demo6) * 100).toFixed(0);
    if (isNaN(p1)){
        p1 = 16.67;
    }
    if (isNaN(p2)){
        p2 = 16.67;
    }
    if (isNaN(p3)){
        p3 = 16.67;
    }
    if (isNaN(p4)){
        p4 = 16.67;
    }
    if (isNaN(p5)){
        p5 = 16.67;
    }
    if (isNaN(p6)){
        p6 = 16.67;
    }
    return {
        demo1: p1,
        demo2: p2,
        demo3: p3,
        demo4: p4,
        demo5: p5,
        demo6: p6
    }
}
