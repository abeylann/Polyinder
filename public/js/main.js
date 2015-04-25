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

    var currentPolicy = null;

    var showVotes = function(policy) {
        $('#stats').html('Results for this policy: ' + policy.yes + ' yes / ' + policy.no + ' no');
    };

    $('#button_no').click(function() {
        if (!currentPolicy) return;
        api.sendVote(currentPolicy.id, false, function(policy) {
            nextQuestion();
            showVotes(policy);
        });
    });
    $('#button_yes').click(function() {
        if (!currentPolicy) return;
        api.sendVote(currentPolicy.id, true, function(policy) {
            nextQuestion();
            showVotes(policy);
        });
    });

    var displayImpact = function(id, values) {
        var html = '';
        values.forEach(function(impact) {
            if (!impact.title) return;
            var conf = ((impact.confidence - 0.5) * 200).toFixed(0);
            html += '<div class="impact panel panel-default"><div class="confidence">'+ conf +'%</div>...'+ impact.title +'</div>';
        });
        if (!values.length) {
            html = '<div class="no-data"></div>'
        }
        $('#' + id).html(html);
    };

    var nextQuestion = function() {
        api.getRandomPolicy(function(policy) {
            currentPolicy = policy;

            $('#question_title').html(policy.title);
            $('#question_picture').attr('src', 'img/' + policy.picture);

            // display impact
            if (policy.votes > 0) {
                displayImpact('impact_no', policy.impact
                    .filter(function (impact) {
                        return impact.no > impact.yes && (impact.no + impact.yes) > 0;
                    })
                    .map(function (impact) {
                        return {
                            title: impact.title,
                            confidence: (impact.no + (policy.votes / 2)) / policy.votes
                        };
                    }));
                displayImpact('impact_yes', policy.impact
                    .filter(function (impact) {
                        return impact.yes > impact.no && (impact.no + impact.yes) > 0;
                    })
                    .map(function (impact) {
                        return {
                            title: impact.title,
                            confidence: (impact.yes + (policy.votes / 2)) / policy.votes
                        };
                    }));
            }
        });
    };
    nextQuestion();

    /*var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = function(event) {
        //console.log(event);

        for (var i = 0; i < event.results.length; i++) {
            var result = event.results[i];
            console.log('text: ' + result[0].transcript, result.isFinal, result[0].confidence);
            switch(result[0].transcript) {
                case 'vote yes':
                    nextQuestion();
                    break;
                case 'vote no':
                    nextQuestion();
                    break;
            }
        }
    };
    recognition.onend = function(event) {
        //console.log(event);
    };
    recognition.start();*/


});
