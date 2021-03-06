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
        "gest": "../dist/js/gest.min",
        "material_ripples": "../dist/js/ripples.min",
        "material_design": "../dist/js/material.min",
        "touchSwipe": "../js/jquery.touchSwipe.min"
    },
    shim: {
        "jquery": {
            "exports": "$"
        },
        "bootstrap": {
            "deps": ["jquery"]
        },
        "gest": {
            "deps": []
        },
        "material_ripples": {
            "deps": ["jquery"],
            "exports": "$.fn.ripples"
        },
        "material_design": {
            "deps": ["jquery", "material_ripples"],
            "exports": "$.material"
        },
        "touchSwipe": {
            "deps": ["jquery"],
            "exports": "$.fn.swipe"
        }
    }
});

define(['jquery', 'material_design', 'api', 'touchSwipe', 'shout'], function($, material, api, swipe, shout) {

    var currentPolicy = null;
    var currentPage = null;
    var votesBlocked = false;

    var showPage = function(page) {
        var pages = ['voting', 'stats', 'done'];
        pages.forEach(function(p) {
            $('#page_' + p).css('display', (page === p ? '' : 'none'));
        });
        currentPage = page;
    };

    $(document).ready(function() {
        // This command is used to initialize some elements and make them work properly
        material.init();

        $('#vote_policy').swipe({
            swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
                console.log("You swiped " + direction );
                if (direction === "left") {
                    // voted NO
                    $('#vote_decision').attr('src', 'img/cross.png').css('display','block');
                } else {
                    // voted YES
                    $('#vote_decision').attr('src', 'img/check.png').css('display','block');
                }
            },
            threshold: 10
        });

        shout.init();
        shout.subscribe(function(vote) {
            sendVote(vote);
        });
    });

    var showVotes = function(policy, vote) {
        showPage('stats');
        if (policy.status === 'fail')
            $('#votes_cur').html(policy.message);
        else
            $('#votes_cur').html('<div class="btn btn-fab btn-raised '+ (vote === 'yes' ? 'btn-success mdi-action-thumb-up' : 'btn-danger mdi-action-thumb-down') +'"></div>');

        var total = currentPolicy.no + currentPolicy.yes;
        $('#votes_no').html(currentPolicy.no);
        $('#votes_no').stop().animate({width: 100*currentPolicy.no/total + '%'}, 'slow');
        $('#votes_yes').html(currentPolicy.yes);
        $('#votes_yes').stop().animate({width: 100*currentPolicy.yes/total + '%'}, 'slow');

        var recording = shout.getRecording();
        $('#votes_recording').html(!recording ? '' : '<b>While you thought about your vote, you said:</b><br/>' + recording);
    };

    $('#button_no').click(function() {
        if (!currentPolicy) return;
        sendVote('no');
    });
    $('#button_yes').click(function() {
        if (!currentPolicy) return;
        sendVote('yes');
    });

    var sendVote = function(vote) {
        if (votesBlocked)
            return;
        if (currentPage === 'voting') {
            votesBlocked = true;
            api.sendVote(currentPolicy, vote === 'yes', function (policy) {
                console.log('voted', vote);
                if (vote === 'no') {
                    // voted NO
                    $('#vote_decision').attr('src', 'img/cross.png').css('display', 'block');
                } else {
                    // voted YES
                    $('#vote_decision').attr('src', 'img/check.png').css('display', 'block');
                }
                window.setTimeout(function() {
                    showVotes(policy, vote);
                    window.setTimeout(function() {
                        votesBlocked = false;
                    }, 500);
                }, 500);
            });
        } else {
            nextQuestion();
        }
    };

    var displayImpact = function(id, values) {
        var html = '';
        values.forEach(function(impact) {
            if (!impact.title) return;
            var conf = ((impact.confidence - 0.5) * 200).toFixed(0);
            html += '<div class="impact panel panel-default"><div class="confidence">'+ conf +'% say</div>...'+ impact.title +'</div>';
        });
        if (!values.length) {
            html = '<div class="no-data"></div>'
        }
        $('#' + id).html(html);
    };

    var nextQuestion = function(e) {
        if (e && e.preventDefault) e.preventDefault();
        $('#vote_decision').css('display', 'none');

        api.getRandomPolicy(function(policy) {
            currentPolicy = policy;

            if (policy) {
                $('#question_title').html(policy.title);
                //$('#question_picture').attr('src', 'img/' + policy.picture);
                $('#vote_policy').css({
                    'background-image': 'url("img/' + (policy.picture || 'BH.jpg') + '")'
                });
                $('#vote_pledged').html('For voting you will get your share of: £' + (policy.pledged || 0).toFixed(2));

                $('#vote_share').html("£"+policy.share+" of £"+(policy.pledged || 0).toFixed(2));

                // display impact
                var votes = policy.yes + policy.no;
                if (votes > 0) {
                    displayImpact('impact_no', policy.impact
                        .filter(function (impact) {
                            return impact.no > impact.yes && (impact.no + impact.yes) > 0;
                        })
                        .map(function (impact) {
                            return {
                                title: impact.title,
                                confidence: (impact.no + (votes / 2)) / votes
                            };
                        }));
                    displayImpact('impact_yes', policy.impact
                        .filter(function (impact) {
                            return impact.yes > impact.no && (impact.no + impact.yes) > 0;
                        })
                        .map(function (impact) {
                            return {
                                title: impact.title,
                                confidence: (impact.yes + (votes / 2)) / votes
                            };
                        }));
                }
                showPage('voting');


                shout.clearRecording();

            } else {
                // display hint that no more voting is possible
                $('#question_title').html('Thank you for Waving Your Votes. Come back later for more!');
                showPage('done');
            }
        });
    };
    nextQuestion();

    return {
        nextPolicy: nextQuestion
    }
});
