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

    update(dt){
        const dx = this.target.x - this.position.x
        if(dx !== 0){
            const mx = Math.sign(dx) * dt * 10;
            this.position.x += (Math.abs(dx) <= Math.abs(mx)) ? dx : mx;
        }
        const dy = this.target.y - this.position.y
        if(dy !== 0){
            const my = Math.sign(dy) * dt * 10;
            this.position.y += (Math.abs(dy) <= Math.abs(my)) ? dy : my;
        }
    }
}

export default Mob;