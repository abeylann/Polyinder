define(['jquery'], function($) {

    var apiUrl = 'http://localhost:4567';

    var api = {
        getSession: function() {
            // get current user session
            var session = localStorage.getItem('user_session');
            if (!session) {
                session = new Date().getTime() + '' + (Math.random() * 1000).toFixed(0);
                localStorage.setItem('user_session', session);
            }
            console.log('current session:', session);
            return session;
        },

        getPolicies: function(cb) {
            if (!cb) return;
            $.ajax({
                url: apiUrl + '/policy',
                contentType: 'application/json',
                complete: function(res) {
                    if (res.status !== 200)
                        return;
                    cb(JSON.parse(res.responseText));
                }
            });
        },
        getRandomPolicy: function(cb) {
            if (!cb) return;
            $.ajax({
                url: apiUrl + '/policy/random',
                contentType: 'application/json',
                complete: function(res) {
                    if (res.status !== 200)
                        return;
                    cb(JSON.parse(res.responseText));
                }
            });
        },
        sendVote: function(policy, yes, cb) {
            if (!policy || !cb) return;
            $.ajax({
                url: apiUrl + '/policy/' + policy.id + '/vote',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    session: api.getSession(),
                    vote: (yes ? 'yes' : 'no')
                }),
                complete: function(res) {
                    if (res.status !== 200)
                        return;
                    cb(JSON.parse(res.responseText));
                }
            });
        }
    };

    return api;
});
