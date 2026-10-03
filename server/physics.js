import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Composite, Vector } = Matter;

const CATEGORY_WALL = 0x0001;
const CATEGORY_COUNTRY = 0x0002;
const CATEGORY_SENSOR = 0x0004;

export class PhysicsEngine {
    constructor() {
        this.width = 1080;
        this.height = 1440;
        this.engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
        
        this.engine.positionIterations = 8;
        this.engine.velocityIterations = 8;

        this.countries = []; this.deadCountriesList = [];
        this.stardust = [];
        this.aliveStardust = [];
        this.spikes = [];
        this.events = [];
        
        this.matchTimer = 0;
        this.isInvincible = true;
        if (typeof this.phaseTimer === "undefined") this.phaseTimer = 0;
        if (typeof this.tournamentTimer === "undefined") this.tournamentTimer = 0;

        // Native Matter.js elastic collision listener for country vs country bounces!
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                let b1 = pair.bodyA;
                let b2 = pair.bodyB;
                if (b1.label === 'country' && b2.label === 'country') {
                    let now = Date.now();
                    b1.plugin.stunTimer = now + 500; // Stun AI so they shoot away!
                    b2.plugin.stunTimer = now + 500;
                    if (now - b1.plugin.lastBounce > 100) {
                        this.events.push({ type: 'bounce', id: b1.plugin.id, impact: 20 });
                        b1.plugin.lastBounce = now;
                    }
                }
            });
        });
    }

    initMatch(participants, phase) {
        Engine.clear(this.engine);
        Composite.clear(this.engine.world);
        
        this.countries = []; this.deadCountriesList = [];
        this.stardust = [];
        this.aliveStardust = [];
        this.spikes = [];
        this.events = [];
        this.matchTimer = 0;
        this.isInvincible = true;
        if (typeof this.phaseTimer === "undefined") this.phaseTimer = 0;
        if (typeof this.tournamentTimer === "undefined") this.tournamentTimer = 0;

        const wallOptions = { 
            isStatic: true, restitution: 1.2, friction: 0,
            collisionFilter: { category: CATEGORY_WALL }
        };
        const t = 100;
        Composite.add(this.engine.world, [
            Bodies.rectangle(this.width/2, 20 - t/2, this.width, t, wallOptions),
            Bodies.rectangle(this.width/2, this.height - 20 + t/2, this.width, t, wallOptions),
            Bodies.rectangle(20 - t/2, this.height/2, t, this.height, wallOptions),
            Bodies.rectangle(this.width - 20 + t/2, this.height/2, t, this.height, wallOptions)
        ]);

        let baseRadius = phase === 1 ? 15 : (phase === 2 ? 35 : 70);

        participants.forEach(p => {
            let x = Math.random() * (this.width - 200) + 100;
            let y = Math.random() * (this.height - 200) + 100;
            let wCount = p.wins || 1;
            let radius = Math.sqrt(Math.pow(baseRadius, 2) * wCount);
            
            let body = Bodies.circle(x, y, radius, {
                restitution: 1.1, // Extra bouncy natively!
                frictionAir: 0.01, 
                friction: 0,
                density: 0.001,
                label: 'country',
                // Natively fully solid against walls AND other countries
                collisionFilter: { category: CATEGORY_COUNTRY, mask: CATEGORY_WALL | CATEGORY_COUNTRY },
                plugin: { id: p.iso, iso: p.iso, name: p.name, radius: radius, alive: true, lastBounce: 0 }
            });
            
            let initialSpeed = 10 + Math.random() * 15; 
            let angle = Math.random() * Math.PI * 2;
            Body.setVelocity(body, { 
                x: Math.cos(angle) * initialSpeed, 
                y: Math.sin(angle) * initialSpeed 
            });

            this.countries.push(body);
            Composite.add(this.engine.world, body);
        });

        let numSpikes = phase === 5 ? 0 : phase * 5;
        for (let i = 0; i < numSpikes; i++) {
            let body = Bodies.circle(Math.random() * (this.width - 200) + 100, Math.random() * (this.height - 200) + 100, 40, {
                isStatic: true,
                isSensor: true,
                collisionFilter: { category: CATEGORY_SENSOR },
                label: 'spike',
                plugin: { radius: 40 }
            });
            this.spikes.push(body);
            Composite.add(this.engine.world, body);
        }

        for (let i = 0; i < 200; i++) {
            let body = Bodies.circle(
                Math.random() * (this.width - 100) + 50, 
                Math.random() * (this.height - 100) + 50, 
                4, {
                isStatic: true,
                isSensor: true,
                collisionFilter: { category: CATEGORY_SENSOR },
                label: 'stardust',
                plugin: { id: 'sd_'+i, radius: 4, alive: true }
            });
            this.stardust.push(body);
            Composite.add(this.engine.world, body);
        }
        
    }

    update(dt) {
        this.matchTimer += dt;
        if (typeof this.phaseTimer === "undefined") this.phaseTimer = 0;
        if (typeof this.tournamentTimer === "undefined") this.tournamentTimer = 0;
        this.phaseTimer += dt;
        this.tournamentTimer += dt;
        if (this.matchTimer > 5) this.isInvincible = false;

        let aliveCountries = this.countries.filter(c => c.plugin.alive);

        // Continuous Stardust Replenishment: Keep arena lush with ~160-170 stardust at all times
        let aliveStardustCount = this.stardust.filter(s => s.plugin.alive).length;
        if (aliveStardustCount < 170) {
            const spawnBatch = aliveStardustCount < 100 ? 2 : 1;
            for (let k = 0; k < spawnBatch; k++) {
                let dead = this.stardust.find(s => !s.plugin.alive);
                if (dead) {
                    dead.plugin.alive = true;
                    Body.setPosition(dead, {
                        x: Math.random() * (this.width - 100) + 50,
                        y: Math.random() * (this.height - 100) + 50
                    });
                    Composite.add(this.engine.world, dead);
                    
                } else {
                    break;
                }
            }
        }

        // 1. AI Steering & Reset Collision Masks
        aliveCountries.forEach(c => {
            // Re-enable solid body collisions for EVERYBODY by default
            c.collisionFilter.mask = CATEGORY_WALL | CATEGORY_COUNTRY;

            let now = Date.now();
            if (c.plugin.stunTimer && now < c.plugin.stunTimer) return; // Stun AI for a moment after bouncing!
            
            let speedFactor = 0.05 / c.plugin.radius; 
            if (speedFactor > 0.01) speedFactor = 0.01; 
            if (c.plugin.chewTimer && now < c.plugin.chewTimer) {
                speedFactor *= 0.2; // 80% slower while chewing! (Food coma)
            }
            
            let target = null;
            let nearestDist = Infinity;

            if (this.isInvincible) {
                this.stardust.forEach(sd => {
                    if (!sd.plugin.alive) return;
                    let _sdx = c.position.x - sd.position.x;
                    let _sdy = c.position.y - sd.position.y;
                    let d = Math.sqrt(_sdx*_sdx + _sdy*_sdy);
                    if (d < nearestDist) { nearestDist = d; target = sd.position; }
                });
            } else {
                let danger = null;
                aliveCountries.forEach(other => {
                    if (other === c) return;
                    let _ox = c.position.x - other.position.x;
                    let _oy = c.position.y - other.position.y;
                    let d = Math.sqrt(_ox*_ox + _oy*_oy);
                    if (other.plugin.radius > c.plugin.radius * 1.05 && d < 200) {
                        danger = other.position;
                    }
                    if (!danger && c.plugin.radius > other.plugin.radius * 1.05 && d < nearestDist) {
                        nearestDist = d; target = other.position;
                    }
                });

                if (danger) {
                    target = { x: c.position.x - (danger.x - c.position.x), y: c.position.y - (danger.y - c.position.y) };
                } else if (!target) {
                    this.stardust.forEach(sd => {
                        if (!sd.plugin.alive) return;
                        let _sdx2 = c.position.x - sd.position.x;
                        let _sdy2 = c.position.y - sd.position.y;
                        let d = Math.sqrt(_sdx2*_sdx2 + _sdy2*_sdy2);
                        if (d < nearestDist) { nearestDist = d; target = sd.position; }
                    });
                }
            }

            // Wander Mode: If still no target, roam randomly
            if (!target) {
                if (!c.plugin.wanderTarget || now > (c.plugin.wanderTimer || 0)) {
                    c.plugin.wanderTarget = {
                        x: Math.random() * (this.width - 200) + 100,
                        y: Math.random() * (this.height - 200) + 100
                    };
                    c.plugin.wanderTimer = now + 2000 + Math.random() * 3000;
                }
                target = c.plugin.wanderTarget;
                speedFactor *= 0.5; // Wander a bit slower than hunting
            }

            if (target) {
                let dir = Vector.normalise(Vector.sub(target, c.position));
                Body.applyForce(c, c.position, Vector.mult(dir, speedFactor * c.mass));
            }
        });

        // 2. Dynamic Ghosting (Only when a predator is close to a prey, the prey becomes a ghost to countries so it can overlap!)
        if (!this.isInvincible) {
            for (let i = 0; i < aliveCountries.length; i++) {
                let c1 = aliveCountries[i];
                for (let j = i + 1; j < aliveCountries.length; j++) {
                    let c2 = aliveCountries[j];
                    let dist = Vector.magnitude(Vector.sub(c1.position, c2.position));
                    if (dist < c1.plugin.radius + c2.plugin.radius + 30) {
                        if (c1.plugin.radius > c2.plugin.radius * 1.05) {
                            c2.collisionFilter.mask = CATEGORY_WALL; // prey ignores country collisions
                        } else if (c2.plugin.radius > c1.plugin.radius * 1.05) {
                            c1.collisionFilter.mask = CATEGORY_WALL; // prey ignores country collisions
                        }
                    }
                }
            }
        }

        // 3. Native Engine Physics Step
        Engine.update(this.engine, 1000 / 60);

        // 4. Handle wall clamps, stardust eating, and country eating
        for (let i = 0; i < aliveCountries.length; i++) {
            let c1 = aliveCountries[i];
            if (!c1.plugin.alive) continue;

            let r = c1.plugin.radius;
            let px = c1.position.x;
            let py = c1.position.y;
            let vx = c1.velocity.x;
            let vy = c1.velocity.y;
            let clamped = false;
            
            if (px < 20 + r) { px = 20 + r; vx = Math.abs(vx) * 0.9; clamped = true; }
            if (px > this.width - 20 - r) { px = this.width - 20 - r; vx = -Math.abs(vx) * 0.9; clamped = true; }
            if (py < 20 + r) { py = 20 + r; vy = Math.abs(vy) * 0.9; clamped = true; }
            if (py > this.height - 20 - r) { py = this.height - 20 - r; vy = -Math.abs(vy) * 0.9; clamped = true; }
            
            // Safety limit to prevent Matter.js math crash
            if (vx > 50) vx = 50; if (vx < -50) vx = -50;
            if (vy > 50) vy = 50; if (vy < -50) vy = -50;
            
            if (clamped) {
                Body.setPosition(c1, { x: px, y: py });
                Body.setVelocity(c1, { x: vx, y: vy });
                let now = Date.now();
                c1.plugin.stunTimer = now + 500; // Stun for 0.5s so it shoots off!
                if (now - c1.plugin.lastBounce > 100) {
                    this.events.push({ type: 'bounce', id: c1.plugin.id, impact: Math.sqrt(vx*vx + vy*vy) * 10 });
                    c1.plugin.lastBounce = now;
                }
            }

            this.stardust.forEach(sd => {
                if (!sd.plugin.alive) return;
                let _sdx3 = c1.position.x - sd.position.x;
                let _sdy3 = c1.position.y - sd.position.y;
                let dist = Math.sqrt(_sdx3*_sdx3 + _sdy3*_sdy3);
                if (dist < c1.plugin.radius) {
                    sd.plugin.alive = false;
                    Composite.remove(this.engine.world, sd);
                    this.events.push({ type: 'pop' });
                    let oldR = c1.plugin.radius;
                    let newR = Math.sqrt(Math.pow(oldR, 2) + Math.pow(sd.plugin.radius, 2));
                    c1.plugin.radius = newR;
                    Body.scale(c1, newR / oldR, newR / oldR);
                }
            });

            for (let j = i + 1; j < aliveCountries.length; j++) {
                let c2 = aliveCountries[j];
                if (!c2.plugin.alive) continue;

                let _ex = c1.position.x - c2.position.x;
                let _ey = c1.position.y - c2.position.y;
                let dist = Math.sqrt(_ex*_ex + _ey*_ey);
                
                let eatDist1 = c1.plugin.radius;
                let eatDist2 = c2.plugin.radius;
                
                // Corner trap fix: if predator is pushed into a corner, increase its reach!
                if (c1.position.x < c1.plugin.radius + 5 && c1.position.y < c1.plugin.radius + 5) eatDist1 *= 1.5;
                if (c1.position.x > this.width - c1.plugin.radius - 5 && c1.position.y < c1.plugin.radius + 5) eatDist1 *= 1.5;
                if (c1.position.x < c1.plugin.radius + 5 && c1.position.y > this.height - c1.plugin.radius - 5) eatDist1 *= 1.5;
                if (c1.position.x > this.width - c1.plugin.radius - 5 && c1.position.y > this.height - c1.plugin.radius - 5) eatDist1 *= 1.5;

                if (c2.position.x < c2.plugin.radius + 5 && c2.position.y < c2.plugin.radius + 5) eatDist2 *= 1.5;
                if (c2.position.x > this.width - c2.plugin.radius - 5 && c2.position.y < c2.plugin.radius + 5) eatDist2 *= 1.5;
                if (c2.position.x < c2.plugin.radius + 5 && c2.position.y > this.height - c2.plugin.radius - 5) eatDist2 *= 1.5;
                if (c2.position.x > this.width - c2.plugin.radius - 5 && c2.position.y > this.height - c2.plugin.radius - 5) eatDist2 *= 1.5;

                if (!this.isInvincible && dist < Math.max(eatDist1, eatDist2)) {
                    let now = Date.now();
                    let chewCooldown = 1500 + Math.random() * 1500; // Base: 1.5-3.0s
                    if (aliveCountries.length < 10) chewCooldown = 400 + Math.random() * 400; // Top 10: 0.4-0.8s
                    else if (aliveCountries.length < 50) chewCooldown = 800 + Math.random() * 800; // Top 50: 0.8-1.6s

                    
                    if (c1.plugin.radius > c2.plugin.radius * 1.05 && (!c1.plugin.chewTimer || now > c1.plugin.chewTimer)) {
                        c2.plugin.alive = false;
                        Composite.remove(this.engine.world, c2);
                        this.events.push({ type: 'kill', id: c1.plugin.id }); this.deadCountriesList.push(c2.plugin.iso);
                        c1.plugin.chewTimer = now + chewCooldown;
                        let newR = Math.sqrt(Math.pow(c1.plugin.radius, 2) + Math.pow(c2.plugin.radius, 2));
                        let scaleF = newR / c1.plugin.radius;
                        c1.plugin.radius = newR;
                        Body.scale(c1, scaleF, scaleF);
                    } else if (c2.plugin.radius > c1.plugin.radius * 1.05 && (!c2.plugin.chewTimer || now > c2.plugin.chewTimer)) {
                        c1.plugin.alive = false;
                        Composite.remove(this.engine.world, c1);
                        this.events.push({ type: 'kill', id: c2.plugin.id }); this.deadCountriesList.push(c1.plugin.iso);
                        c2.plugin.chewTimer = now + chewCooldown;
                        let newR = Math.sqrt(Math.pow(c2.plugin.radius, 2) + Math.pow(c1.plugin.radius, 2));
                        let scaleF = newR / c2.plugin.radius;
                        c2.plugin.radius = newR;
                        Body.scale(c2, scaleF, scaleF);
                        break; // c1 is dead, stop checking!
                    }
                }
            }

            if (!c1.plugin.alive) continue;

            this.spikes.forEach(sp => {
                let _spx = c1.position.x - sp.position.x;
                let _spy = c1.position.y - sp.position.y;
                let dist = Math.sqrt(_spx*_spx + _spy*_spy);
                if (!this.isInvincible && dist < c1.plugin.radius && c1.plugin.radius > sp.plugin.radius * 1.25) {
                    this.events.push({ type: 'shatter', id: c1.plugin.id });
                    
                    let keptArea = (Math.PI * Math.pow(c1.plugin.radius, 2)) * 0.25;
                    let newR = Math.sqrt(keptArea / Math.PI);
                    if (newR < 5) newR = 5; // Enforce minimum radius to avoid Matter.js math crash
                    let scaleF = newR / c1.plugin.radius;
                    c1.plugin.radius = newR;
                    Body.scale(c1, scaleF, scaleF);
                }
            });
        }
    }

    getState() {
        return {
            countries: this.countries.filter(c => c.plugin.alive).map(c => ({ 
                id: c.plugin.id, iso: c.plugin.iso, name: c.plugin.name, 
                x: c.position.x, y: c.position.y, radius: c.plugin.radius, 
                vx: c.velocity.x, vy: c.velocity.y 
            })),
            stardust: this.stardust.filter(s => s.plugin.alive).map(s => ({ 
                id: s.plugin.id, x: s.position.x, y: s.position.y, radius: s.plugin.radius 
            })),
            spikes: this.spikes.map(s => ({ x: s.position.x, y: s.position.y, radius: s.plugin.radius })),
            timer: this.matchTimer,
            phaseTimer: this.phaseTimer || 0,
            tournamentTimer: this.tournamentTimer || 0,
            bounds: { xMin: 20, xMax: this.width - 20, yMin: 20, yMax: this.height - 20 },
            isInvincible: this.isInvincible, deadCountriesList: this.deadCountriesList
        };
    }
}


