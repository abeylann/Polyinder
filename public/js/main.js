requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        "jquery": "../bower_components/jquery/dist/jquery",
        "bootstrap": "../bower_components/bootstrap/dist/js/bootstrap"
    },
    shim: {
        "jquery": {
            "exports": "$"
        },
        "bootstrap": {
            "deps": "jquery"
        }
    }
});

define(['jquery', 'api'], function($, api) {


    api.getRandomQuestion(function(question) {
        $('#question_title').html(question.title);
        $('#question_picture').attr('src', 'img/' + question.picture);
    });

    /*var votes = {
        yes: 0,
        no: 0
    };

    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = function(event) {
        //console.log(event);

        for (var i = 0; i < event.results.length; i++) {
            var result = event.results[i];
            console.log('text: ' + result[0].transcript);
            switch(result[0].transcript) {
                case 'yes':
                    console.log('yes');
                    votes.yes++;
                    $('#count_yes').html(votes.yes);
                    break;
                case 'no':
                    console.log('no');
                    votes.no++;
                    $('#count_no').html(votes.no);
                    break;
            }
        }
    };
    recognition.start();
*/


});
