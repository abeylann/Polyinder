define(['jquery'], function($) {

    var sampleData = [
        {
            id: '0',
            title: 'Should BattleHack be more often than once a year?',
            picture: '',
            impact: {
                no: [
                    'BattleHack will stay fun',
                    'It would be expensive to organise',
                    ''
                ],
                yes: [
                    '',
                    '',
                    ''
                ]
            }
        },
        {
            id: '1',
            title: 'Removal of tuition fees for students taking approved degrees in science, medicine, technology, engineering and maths on condition that they practise and work and pay tax in the UK for five years after graduation.',
            picture: 'TuitionFees.jpg',
            impact: {
                no: [],
                yes: []
            }
        },
        {
            id: '2',
            title: 'UK to leave the European Union. An Australian-style points based system and a five-year ban on unskilled immigration.',
            picture: 'NoEU.png',
            impact: {
                no: [],
                yes: []
            }
        },
        {
            id: '3',
            title: 'Abolish the bedroom tax.',
            picture: 'Bedroom.jpg',
            impact: {
                no: [],
                yes: []
            }
        },
        {
            id: '4',
            title: 'Increase the minimum wage to the living wage of £10 an hour by 2020, and to £8.10 an hour this year.',
            picture: 'Wage.jpg',
            impact: {
                no: [],
                yes: []
            }
        }
    ];


    var api = {
        startSession: function(cb) {

        },
        getRandomQuestion: function(cb) {
            if (!cb) return;
            var i = Math.floor(Math.random() * sampleData.length);
            cb(sampleData[i]);
        }
    };

    return api;
});
