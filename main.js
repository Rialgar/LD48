import './lib/playground.js';

const app = playground({
    preload: function () {
        //load assets
    },
    create: function () {
        this.layer.canvas.id = 'game';
    },
    ready: function () {
        //set initial state
    },

    keydown: function (data) {
        //global key handler
    },
    //custom functions
});