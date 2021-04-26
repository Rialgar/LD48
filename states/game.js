import DungeonMap from '../dungeonMap.js';
import Mob from '../mob.js';

const tileSize = 32;
const gameSize = {
    x: 200 * tileSize / 16,
    y: 150 * tileSize / 16
}

const playerOffsets = {
    'straight': 0,
    'up': 16,
    'down': 32,
    'left': 48,
    'right': 64
}
const maxEnergy = 500;

let fps = 60;
let intro, outro;

const GameState = () => ({
    scale: 0,
    offset: {
        x: 0,
        y: 0
    },
    scroll: {
        x: 0,
        y: 0
    },
    scrollTarget: {
        x: 0,
        y: 0
    },

    map: null,
    player: new Mob(),
    energy: maxEnergy,

    score: 0,
    levelScore: 0,
    torchesCollected: 0,
    splotchesPlaced: 0,
    stepsMoved: 0,

    paused: true,
    endCounter: 1,

    create: function () {
        this.lightCircle = document.createElement('canvas');
        this.resize();
        this.mapSize = 2;
        this.nextMap();

        intro = document.getElementById('intro');
        outro = document.getElementById('outro');
        intro.style.display = "block";
    },
    resize: function () {
        const prevScale = this.scale;
        this.scale = Math.floor(Math.min(this.app.width / gameSize.x, this.app.height / gameSize.y));
        this.offset.x = Math.round((this.app.width - this.scale * gameSize.x) / 2);
        this.offset.y = Math.round((this.app.height - this.scale * gameSize.y) / 2);

        document.body.style.fontSize = this.scale*8 + 'px';
        document.body.style.setProperty('--game-left', this.offset.x + 'px');
        document.body.style.setProperty('--game-top', this.offset.y + 'px');
        document.body.style.setProperty('--game-width', this.scale * gameSize.x + 'px');
    },

    step: function (dt) {
        if(this.paused){
            return;
        }
        if(this.energy <= 0){
            if(this.endCounter > 0){
                this.endCounter -= dt;
                if(this.endCounter <= 0){
                    outro.style.display = 'block';
                    document.getElementById("score").textContent = this.score;
                    document.getElementById("level").textContent = this.mapSize-2;
                    document.getElementById("steps").textContent = this.stepsMoved;
                    document.getElementById("splotches").textContent = this.splotchesPlaced;
                    document.getElementById("torches").textContent = this.torchesCollected;
                }
            }
        }
        this.levelScore = Math.max(0, this.levelScore - Math.round(1000*dt));
        this.player.update(dt, this.scale);
        const px = Math.round(this.player.position.x);
        const py = Math.round(this.player.position.y);
        if(this.map.tiles[px][py].item === 'battery'){
            this.energy = Math.min(this.energy + 50, maxEnergy);
            this.torchesCollected++;
        }
        if(this.map.tiles[px][py].item !== 'splotch' && this.map.tiles[px][py].item !== 'goal'){
            this.map.setItem(px, py, 'splotch');
            this.splotchesPlaced++;
        }
        const scrollDX = gameSize.x/2 - (this.player.position.x+0.5) * tileSize - this.scroll.x
        if(scrollDX !== 0){
            const scrollMX = Math.max(Math.abs(scrollDX) * dt * 4, 1/4);
            this.scroll.x += scrollMX > Math.abs(scrollDX) ? scrollDX : Math.sign(scrollDX) * scrollMX;
        }
        const scrollDY = gameSize.y/2 - (this.player.position.y+0.5) * tileSize - this.scroll.y
        if(scrollDY !== 0){
            const scrollMY = Math.max(Math.abs(scrollDY) * dt * 4, 1/4);
            this.scroll.y += scrollMY > Math.abs(scrollDY) ? scrollDY : Math.sign(scrollDY) * scrollMY;
        }
        if(scrollDX == 0 && scrollDY == 0 && this.player.position.x === this.map.goal.x && this.player.position.y == this.map.goal.y){
            this.nextMap();
        }
        if (this.mapTransition < 1) {
            this.mapTransition = Math.min(this.mapTransition + dt, 1);
        }
    },
    render: function (dt) {
        const ctx = this.app.layer.context;

        //force discard previous image to clean up graphics memory, apparently this is something we have to do these days...
        this.app.layer.canvas.height += 1;
        this.app.layer.canvas.height -= 1;
        ctx.clearRect(0, 0, this.app.width, this.app.height);
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.app.width, this.app.height);

        ctx.imageSmoothingEnabled = false;

        ctx.save();
        ctx.transform(this.scale, 0, 0, this.scale, this.offset.x, this.offset.y);

        ctx.rect(0, 0, gameSize.x, gameSize.y)
        ctx.clip();

        const tx = Math.round(this.scroll.x*this.scale)/this.scale;
        const ty = Math.round(this.scroll.y*this.scale)/this.scale;

        if(this.mapTransition == 1){
            ctx.translate(tx, ty);
            this.map.render(ctx);
        } else {
            ctx.save();
            ctx.translate(gameSize.x/2, gameSize.y/2);
            ctx.scale(this.mapTransition, this.mapTransition);
            ctx.translate(-gameSize.x/2, -gameSize.y/2);
            ctx.translate(tx, ty);
            this.map.render(ctx);
            ctx.restore();

            if(this.prevMap){
                const ptx = Math.round(this.prevScroll.x*this.scale)/this.scale;
                const pty = Math.round(this.prevScroll.y*this.scale)/this.scale;

                ctx.save();
                ctx.translate(gameSize.x/2, gameSize.y/2);
                ctx.scale(1/(1-this.mapTransition), 1/(1-this.mapTransition));
                ctx.translate(-gameSize.x/2, -gameSize.y/2);
                ctx.translate(ptx, pty);
                this.prevMap.render(ctx);
                ctx.restore();
            }

            ctx.translate(tx, ty);
        }

        const playerXOffset = playerOffsets[this.player.looking];
        const playerYOffset = Math.floor((1-this.energy/maxEnergy)*4) * 16;

        ctx.drawImage(this.app.images.objects, 32+playerXOffset, playerYOffset, 16, 16, this.player.position.x * tileSize + 8, this.player.position.y * tileSize + 8, 16, 16);

        ctx.restore();
        const cx = ((this.player.position.x+0.5) * tileSize + tx) * this.scale + this.offset.x;
        const cy = ((this.player.position.y+0.5) * tileSize + ty) * this.scale + this.offset.y;

        const innerRadius = this.scale * (16 + (gameSize.y / 3 - 16) * this.energy / maxEnergy);
        const outerRadius = this.scale * (17 + (gameSize.y / 2 - 17) * this.energy / maxEnergy);

        const lightGradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
        lightGradient.addColorStop(0, "rgba(0,0,0,0)");
        lightGradient.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = lightGradient;
        ctx.fillRect(this.offset.x, this.offset.y, gameSize.x * this.scale, gameSize.y * this.scale);

        ctx.font = this.scale*8+"px 'Press Start 2P'";
        ctx.fillStyle = 'white';
        ctx.textAlign = 'right';
        const textOffset = this.app.width - this.offset.x - this.scale * 5;
        ctx.fillText(this.score, textOffset, this.offset.y + this.scale * 12);
        ctx.fillText(this.levelScore, textOffset, this.offset.y + this.scale * 24);

        //DEBUG INFO
        if (localStorage.debug) {
            ctx.strokeStyle = 'white';
            ctx.strokeRect(this.offset.x, this.offset.y, gameSize.x * this.scale, gameSize.y * this.scale);

            fps = (fps * 29 + 1 / dt) / 30;
            ctx.font = "20px sans-serif";
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText(Math.round(fps), 10, 30);
        }
    },

    keydown: function (data) {
        if(this.energy <= 0){
            return;
        }
        if(this.paused){
            if(data.key === 'space'){
                this.paused = false;
                intro.style.display = 'none';
            }
            return;
        }
        switch (data.key) {            
            case 'left':
            case 'a':
                this.player.looking = 'left';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "left")){
                    this.player.move(-1, 0);
                    this.energy -= 1;
                    this.stepsMoved++;
                }
                break;
            case 'right':
            case 'd':
                this.player.looking = 'right';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "right")){
                    this.player.move(1, 0);
                    this.energy -= 1;
                    this.stepsMoved++;
                }
                break;
            case 'up':
            case 'w':
                this.player.looking = 'up';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "top")){
                    this.player.move(0, -1);
                    this.energy -= 1;
                    this.stepsMoved++;
                }
                break;
            case 'down':
            case 's':
                this.player.looking = 'down';
                if(!this.map.collides(this.player.target.x, this.player.target.y, "bottom")){
                    this.player.move(0, 1);
                    this.energy -= 1;
                    this.stepsMoved++;
                }
                break;
            case 'x':
                if(localStorage.debug){
                    this.energy = 5;
                }
        }
    },
    keyup: function (data) {
        switch (data.key) {
            case 'left':
            case 'a':
            case 'right':
            case 'd':
            case 'up':
            case 'w':
            case 'down':
            case 's':
                this.player.looking = 'straight';
                break;
        }
    },

    mousedown: function (data) { },
    mouseup: function (data) { },
    mousemove: function (data) { },

    gamepaddown: function (data) { },
    gamepadhold: function (data) { },
    gamepadup: function (data) { },
    gamepadmove: function (data) { },

    //custom functions

    nextMap: function (){
        if(this.prevMap){
            this.prevMap.discardImage();
        }
        this.mapSize++;
        this.prevMap = this.map;
        this.mapTransition = 0;

        if(this.prevMap){
            this.prevMap.removeGoal();
            this.prevScroll = {
                x :gameSize.x/2 - (this.player.position.x+0.5) * tileSize,
                y :gameSize.y/2 - (this.player.position.y+0.5) * tileSize
            };
        }

        this.map = new DungeonMap(this.app.images["walls"+tileSize], this.app.images.objects, tileSize, this.mapSize);
        this.player.setPosition(this.map.start.x, this.map.start.y);
        this.scroll.x = gameSize.x/2 - (this.player.position.x+0.5) * tileSize;
        this.scroll.y = gameSize.y/2 - (this.player.position.y+0.5) * tileSize;

        this.score += this.levelScore;
        this.levelScore = 5000 + Math.round(Math.pow(this.mapSize, 1.5))*500;
    }
});

export default GameState;