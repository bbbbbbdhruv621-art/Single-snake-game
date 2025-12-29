const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ===== RESIZE ===== */
function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* ===== MOUSE ===== */
const mouse = { x: innerWidth/2, y: innerHeight/2 };
addEventListener("mousemove", e=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* ===== CURSOR PARTICLES ===== */
const particles = [];
const MAX_PARTICLES = 40;

function createParticle(x,y){
  particles.push({
    x, y,
    vx: (Math.random()-0.5),
    vy: (Math.random()-0.5),
    life: 20 + Math.random()*30,
    color: `hsl(${Math.random()*360},100%,50%)`,
    size: 2 + Math.random()*3
  });
}

/* ===== SNAKE SPINE ===== */
const spine = [];
const COUNT = 90;
const DIST = 8;
const SPEED = 0.005;

for(let i=0;i<COUNT;i++){
  spine.push({ x: mouse.x - i*DIST, y: mouse.y, a: 0 });
}

let time = 0;

/* ===== COLOR CHANGER ===== */
const colors = ["#ff0000","#00ff00","#ffff00","#00ffff","#ff00ff","#ffa500"];
let currentColor = "#ffff00";

/* ===== MAIN LOOP ===== */
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  time += 0.07;

  createParticle(mouse.x, mouse.y);

  spine[0].x += (mouse.x - spine[0].x) * SPEED;
  spine[0].y += (mouse.y - spine[0].y) * SPEED;

  const dx = mouse.x - spine[0].x;
  const dy = mouse.y - spine[0].y;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if(dist < 20){
    currentColor = colors[Math.floor(Math.random()*colors.length)];
  }

  for(let i=1;i<spine.length;i++){
    const dx = spine[i-1].x - spine[i].x;
    const dy = spine[i-1].y - spine[i].y;
    const a = Math.atan2(dy,dx);

    spine[i].x = spine[i-1].x - Math.cos(a)*DIST;
    spine[i].y = spine[i-1].y - Math.sin(a)*DIST;
    spine[i].a = a;
  }

  drawEnergyBody();
  drawSkeleton();
  drawCobraHead();
  drawParticles();

  requestAnimationFrame(animate);
}

/* ===== ENERGY BODY ===== */
function drawEnergyBody(){
  for(let i=0;i<spine.length;i++){
    const p = spine[i];
    const glow = Math.sin(time + i*0.25) * 0.5 + 0.5;

    const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,18);
    grad.addColorStop(0,`rgba(${hexToRgb(currentColor)},${0.25*glow})`);
    grad.addColorStop(0.5,`rgba(${hexToRgb(currentColor)},${0.18*glow})`);
    grad.addColorStop(1,"rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x,p.y,18,0,Math.PI*2);
    ctx.fill();
  }
}

/* ===== PARTICLES ===== */
function drawParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    ctx.globalAlpha = p.life/50;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if(p.life <= 0) particles.splice(i,1);
  }

  if(particles.length > MAX_PARTICLES){
    particles.splice(0, particles.length - MAX_PARTICLES);
  }
}

/* ===== SKELETON ===== */
function drawSkeleton(){
  ctx.strokeStyle="#e5e7eb";
  ctx.lineWidth=1.3;
  ctx.shadowColor="rgba(255,255,255,.5)";
  ctx.shadowBlur=6;

  ctx.beginPath();
  ctx.moveTo(spine[0].x, spine[0].y);
  spine.forEach(p => ctx.lineTo(p.x,p.y));
  ctx.stroke();

  for(let i=10;i<spine.length;i+=5){
    rib(spine[i].x, spine[i].y, spine[i].a + Math.PI/2);
    rib(spine[i].x, spine[i].y, spine[i].a - Math.PI/2);
  }
}

function rib(x,y,a){
  ctx.beginPath();
  ctx.moveTo(x,y);
  ctx.lineTo(x+Math.cos(a)*7,y+Math.sin(a)*7);
  ctx.stroke();
}

/* ===== COBRA HEAD ===== */
function drawCobraHead(){
  const h = spine[0];
  const angle = Math.atan2(mouse.y-h.y, mouse.x-h.x);
  const pulse = Math.sin(time*1.6)*2;

  ctx.save();
  ctx.translate(h.x,h.y);
  ctx.rotate(angle);

  ctx.strokeStyle="#f8fafc";
  ctx.lineWidth=2;
  ctx.shadowColor="rgba(0,255,150,.9)";
  ctx.shadowBlur=25;

  ctx.beginPath();
  ctx.arc(-5,0,18+pulse,Math.PI/2,Math.PI*1.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-5,0,18+pulse,-Math.PI/2,Math.PI/2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(18,0);
  ctx.stroke();

  ctx.fillStyle="#ffff66";
  ctx.beginPath();
  ctx.arc(8,-4,2,0,Math.PI*2);
  ctx.arc(8,4,2,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

/* ===== HELPER ===== */
function hexToRgb(hex){
  hex = hex.replace("#","");
  const n = parseInt(hex,16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

animate();
