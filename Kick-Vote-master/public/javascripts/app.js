var socket = io.connect(window.location.origin);
window.votes = {};

socket.on('votes', function(votes){
    console.log(votes);
    window.votes = votes;
    $('#votes').html("Demo 1 " + votes.demo1 + " vs " + votes.demo2 + " Demo 2");
});

socket.on('percentages', function(percentages){
    $('.column .demo1').css('height', percentages.demo1 + '%');
    $('.column .demo2').css('height', percentages.demo2 + '%');
    $('.column .demo3').css('height', percentages.demo3 + '%');
    $('.column .demo4').css('height', percentages.demo4 + '%');
        $('.column .demo5').css('height', percentages.demo5 + '%');
    $('.column .demo6').css('height', percentages.demo6 + '%');
    $('.column-demo2 .percentage').html(percentages.demo2 + '%');
    $('.column-demo1 .percentage').html(percentages.demo1 + '%');
});

socket.on('animate', function(side){
    $('.column .' + side + ' .img').addClass('spin');
    setTimeout(function(){
        $('.column .' + side + ' .img').removeClass('spin');
    }, 1000);
})

// socket.on('number', function(number){
//     $('#number').html(number);
//     $('#qr').attr('src', "http://chart.apis.google.com/chart?cht=qr&chs=200x200&chl=sms:" + number.replace('+', ''));
// });


// socket.on('numbers', function(numbers){
//     var html = "";
//     numbers.reverse();
//     $.each(numbers, function(i, number){
//         html += "<li>" + number + "</li>";
//     });
//     $('#numbers').html(html);
// });
