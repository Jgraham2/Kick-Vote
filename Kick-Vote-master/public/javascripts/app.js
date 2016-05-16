var socket = io.connect(window.location.origin);
window.votes = {};

socket.on('votes', function(votes){
    console.log(votes);
    window.votes = votes;
    $('#votes').html("Demo 1 " + votes.demo1 + " vs " + votes.demo2 + " Demo 2 " + " vs " + votes.demo3 + " Demo 3 " + " vs " + votes.demo4 + " Demo 4 " + " vs " + votes.demo5 + " Demo 5 " + " vs " + votes.demo6 + " Demo6");
});

socket.on('percentages', function(percentages){
    $('.column .demo1').css('height', percentages.demo1 + '%');
    $('.column .demo2').css('height', percentages.demo2 + '%');
    $('.column .demo3').css('height', percentages.demo3 + '%');
    $('.column .demo4').css('height', percentages.demo4 + '%');
    $('.column .demo5').css('height', percentages.demo5 + '%');
    $('.column .demo6').css('height', percentages.demo6 + '%');
    $('.column-demo6 .percentage').html(percentages.demo6 + '%');
    $('.column-demo5 .percentage').html(percentages.demo5 + '%');
    $('.column-demo4 .percentage').html(percentages.demo4 + '%');
    $('.column-demo3 .percentage').html(percentages.demo3 + '%');
    $('.column-demo2 .percentage').html(percentages.demo2 + '%');
    $('.column-demo1 .percentage').html(percentages.demo1 + '%');
});

socket.on('animate', function(side){
    $('.column .' + side + ' .img').addClass('spin');
    setTimeout(function(){
        $('.column .' + side + ' .img').removeClass('spin');
    }, 1000);
})
