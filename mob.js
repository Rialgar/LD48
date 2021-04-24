class Mob {
    position = {
        x: 0,
        y: 0
    };

    target = {
        x: 0,
        y: 0
    };

    speed = 1;

    move(dx, dy){
        this.target.x += dx;
        this.target.y += dy;
    }

    setPosition(x, y){
        this.position.x = x;
        this.position.y = y;
        this.target = {...this.position};
    }

    update(dt, scale){
        const dx = this.target.x - this.position.x
        if(dx !== 0){
            this.position.x += (Math.abs(dx) <= 0.1/scale) ? dx : (Math.sign(dx) * dt * 10);
        }
        const dy = this.target.y - this.position.y
        if(dy !== 0){
            this.position.y += (Math.abs(dy) <= 0.1/scale) ? dy : (Math.sign(dy) * dt * 10);
        }
    }
}

export default Mob;