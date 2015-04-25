define(['jquery'], function($) {

    var apiUrl = 'http://localhost:4567';

    var sampleData = [
        {
            id: '0',
            title: 'Should BattleHack be more often than once a year?',
            picture: 'BH.jpg',
            yes: 13,
            no: 10,
            impact: [
                { title: 'BattleHack will stay fun', no: 5, yes: 0 },
                { title: 'BattleHack will remain free', no: 1, yes: 0 },
                { title: 'You can meet your fellow hackers more often', no: 0, yes: 8 }
            ]
        },
        {
            id: '1',
            title: 'Removal of tuition fees for students taking approved degrees in science, medicine, technology, engineering and maths on condition that they practise and work and pay tax in the UK for five years after graduation.',
            picture: 'TuitionFees.jpg',
            yes: 5,
            no: 10,
            impact: {
                no: [],
                yes: []
            }
        },
        {
            id: '2',
            title: 'UK to leave the European Union. An Australian-style points based system and a five-year ban on unskilled immigration.',
            picture: 'NoEU.png',
            yes: 7,
            no: 3,
            impact: {
                no: [],
                yes: []
            }
        },
        {
            id: '3',
            title: 'Abolish the bedroom tax.',
            picture: 'Bedroom.jpg',
            yes: 5,
            no: 5,
            impact: {
                no: [],
                yes: []
            }
        },
        {
            id: '4',
            title: 'Increase the minimum wage to the living wage of £10 an hour by 2020, and to £8.10 an hour this year.',
            picture: 'Wage.jpg',
            yes: 13,
            no: 6,
            impact: {
                no: [],
                yes: []
            }
        }
    ];


    var api = {
        getPolicies: function(cb) {
            if (!cb) return;
            $.ajax({
                url: apiUrl + '/policy',
                contentType: 'application/json',
                complete: function(jqXHR) {

                }
            });
        },
        getRandomPolicy: function(cb) {
            if (!cb) return;
            var i = 0; //Math.floor(Math.random() * sampleData.length);
            cb(sampleData[i]);
        },
        sendVote: function(id, yes, cb) {
            var policy = sampleData.filter(function(p) { return p.id === id; });
            if (!policy.length) return;

            policy[0][yes ? 'yes' : 'no']++;
            cb(policy[0]);
        }
    };

    return api;
});
