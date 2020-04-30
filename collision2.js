var canvas=document.querySelector('canvas');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

var c=canvas.getContext('2d');

var mouse={
	x:undefined,
	y:undefined
}

var colorArray=['#ffaa33','#99ffaa','#00ffhh','#224488','#aabb11','#13d56f'];

window.addEventListener('mousemove',function(event)
{
	mouse.x=event.x;
	mouse.y=event.y;
});

window.addEventListener('resize',function()
{
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	init();
});

function getDistance(x1,y1,x2,y2)
{
	let xDistance=x2-x1;
	let yDistance=y2-y1;
	return Math.sqrt(Math.pow(xDistance,2)+Math.pow(yDistance,2));
}

function randomIntFromRange(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) 
    {
        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

function Particle(x,y,radius,color)
{
	this.x=x;
	this.y=y;
	this.velocity={
					x:(Math.random()-0.5)*5,
					y:(Math.random()-0.5)*5
				  };
	this.radius=radius;
	this.color=color;
	this.mass=1;
	this.opacity=0;
	this.draw=function()
				{
					c.beginPath();
					c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
					c.save();					//saving current state
					c.globalAlpha=this.opacity;			//opacity of entire window
					c.fillStyle=this.color;
					c.fill();
					c.restore();				//restoring saved state
					c.strokeStyle=this.color;
					c.stroke();
					c.closePath();					
				}
	this.update=function(paricles)
				{	
					this.draw();
					for(let i=0;i<particles.length;i++)
					{
						if(this==particles[i])
							continue;
						if(getDistance(this.x,this.y,particles[i].x,particles[i].y)-this.radius*2<0)
						{
							resolveCollision(this,particles[i]);
						}
					}

					if(this.x+this.radius>=innerWidth||this.x-this.radius<=0)
					{
						this.velocity.x=-this.velocity.x;
					}
					if(this.y+this.radius>=innerHeight||this.y-this.radius<=0)
					{
						this.velocity.y=-this.velocity.y;
					}

					//mouse detection
					if(getDistance(mouse.x,mouse.y,this.x,this.y)<80 && this.opacity<0.6)
					{
						this.opacity+=0.2;
					}
					else if(this.opacity>0)
					{
						this.opacity-=0.2;
						this.opacity=Math.max(0,this.opacity);
					}

					this.x+=this.velocity.x;
					this.y+=this.velocity.y;
				}
}

var particles;

function init()
{
	particles=[];
	for(var i=0;i<150;i++)
	{
		const radius=25;
		let x=randomIntFromRange(radius,canvas.width-radius);
		let y=randomIntFromRange(radius,canvas.height-radius);
		const color=colorArray[Math.floor(Math.random()*colorArray.length)];

		if(i!=0)
		{
			for(let j=0;j<particles.length;j++)
			{
				if(getDistance(x,y,particles[j].x,particles[j].y)-radius*2<0)
				{
					x=randomIntFromRange(radius,canvas.width-radius);
					y=randomIntFromRange(radius,canvas.height-radius);
					j=-1;
				}
			}
		}

		particles.push(new Particle(x,y,radius,color));
	}
}

function animate()
{
	requestAnimationFrame(animate);
	c.clearRect(0,0,innerWidth,innerHeight);
	particles.forEach(particle=>{particle.update(particles);});
}
init();
animate();