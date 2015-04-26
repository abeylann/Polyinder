/* initialize keyword recognition for shouting votes */

define(['gest'], function() {

    var shout = {
        init: function() {

            gest.start();
            gest.options.sensitivity(80);
            //gest.options.skinFilter(true);

            shout.startRecord();
        },
        subscribe: function(cb) {
            gest.options.subscribeWithCallback(function(e) {
                if (!e.direction)
                    return;
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
        },

        startRecord: function() {
            if (this.recognition)
                return;
            var self = this;
            this.recording = '';

            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = "en-US";
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.onresult = function(event) {
                for (var i = 0; i < event.results.length; i++) {
                    var result = event.results[i];
                    if (result.isFinal)
                        self.recording = result[0].transcript;
                    else
                        self.recording += result[0].transcript;
                }
            };
            this.recognition.start();
        },

        clearRecording: function() {
            this.recording = '';
        },

        getRecording: function() {
            return this.recording;
        }
    };
    return shout;
});
