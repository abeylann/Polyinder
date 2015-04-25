/* initialize keyword recognition for shouting votes */

define(['gest'], function() {

    var shout = {
        init: function() {

            gest.start();

            /*var recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en';
            recognition.onresult = function(event) {
                //console.log(event);

                for (var i = 0; i < event.results.length; i++) {
                    var result = event.results[i];
                    console.log('text: ' + result[0].transcript, result.isFinal, result[0].confidence, result.length);
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
            recognition.start();*/

        },
        subscribe: function(cb) {
            gest.options.subscribeWithCallback(function(e) {
                //console.log(e.direction);
                switch(e.direction.toLowerCase()) {
                    case 'left':
                        cb('no');
                        break;
                    case 'right':
                        cb('yes');
                        break;
                }
            });
        }
    };
    return shout;
});
