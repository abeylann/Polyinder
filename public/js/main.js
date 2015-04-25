requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        "jquery": "../dist/jquery.min",
        "bootstrap": "../dist/js/bootstrap.min",
        "material_ripples": "../dist/js/ripples.min",
        "material_design": "../dist/js/material.min"
    },
    shim: {
        "jquery": {
            "exports": "$"
        },
        "bootstrap": {
            "deps": ["jquery"]
        },
        "material_ripples": {
            "deps": ["jquery"],
            "exports": "$.fn.ripples"
        },
        "material_design": {
            "deps": ["jquery", "material_ripples"],
            "exports": "$.material"
        }
    }
});

define(['jquery', 'material_design', 'api'], function($, material, api) {

    $(document).ready(function() {
        // This command is used to initialize some elements and make them work properly
        material.init();
    });

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
