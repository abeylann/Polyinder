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

define(['jquery', 'material_design'], function($, material) {

    $(document).ready(function() {
        // This command is used to initialize some elements and make them work properly
        material.init();
    });

    return {
        signup: function(form) {
            var data = {};
            $(form).find('input').each(function(i, input) {
                data[input.name] = input.value;
            });

            $.ajax({
                url: '/create_user',
                method: 'POST',
                data: JSON.stringify(data),
                complete: function(res) {
                    console.log(res.responseText);
                    document.location.href = '/';
                }
            });
        }
    };
});
