import './lib/playground.js';

import GameState from './states/game.js';

const app = playground({
    create: function () {
        this.layer.canvas.id = 'game';
        this.loadImage("walls16");
        this.loadImage("walls32");
    },
    ready: function () {
        this.setState(GameState());
    },

    keydown: function (data) {
        //global key handler
    },
    //custom functions
});