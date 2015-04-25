define(['jquery'], function($) {

    var apiUrl = 'http://localhost:4567';

    var api = {
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
        sendVote: function(id, yes, cb) {
            $.ajax({
                url: apiUrl + '/policy/' + id + '/vote',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({vote: (yes ? 'yes' : 'no')}),
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
