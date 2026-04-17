const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
const launchBtn = document.getElementById('launch-btn');

let particles = [];
let connectionDistance = 150;
let mouse = { x: null, y: null };
let launchBtnRect = launchBtn ? launchBtn.getBoundingClientRect() : null;

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (launchBtn) launchBtnRect = launchBtn.getBoundingClientRect();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mouse interaction
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Update button rect on scroll/resize
window.addEventListener('scroll', () => {
    if (launchBtn) launchBtnRect = launchBtn.getBoundingClientRect();
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseSpeedX = (Math.random() - 0.5) * 0.5;
        this.baseSpeedY = (Math.random() - 0.5) * 0.5;
        this.speedX = this.baseSpeedX;
        this.speedY = this.baseSpeedY;
        this.color = Math.random() > 0.5 ? '#00f2ea' : '#00ff9d'; // Cyan or Green
    }

    update() {
        // Accelerate towards launch button on hover
        let targetX = mouse.x;
        let targetY = mouse.y;
        let isHoveringButton = false;

        if (launchBtn && launchBtn.matches(':hover')) {
            isHoveringButton = true;
            // Target the center of the button
            targetX = launchBtnRect.left + launchBtnRect.width / 2;
            targetY = launchBtnRect.top + launchBtnRect.height / 2;
        }

        if (isHoveringButton && targetX != null) {
            let dx = targetX - this.x;
            let dy = targetY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Stronger attraction to button
            if (distance < 400) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (400 - distance) / 400; // Stronger force
                this.speedX += forceDirectionX * force * 0.2; // Acceleration
                this.speedY += forceDirectionY * force * 0.2;
            }
        } else {
            // Return to normal speed logic (with slight friction)
            this.speedX = this.speedX * 0.95 + this.baseSpeedX * 0.05;
            this.speedY = this.speedY * 0.95 + this.baseSpeedY * 0.05;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
            this.speedX = -this.speedX;
            this.baseSpeedX = -this.baseSpeedX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.speedY = -this.speedY;
            this.baseSpeedY = -this.baseSpeedY;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    let numberOfParticles = (canvas.width * canvas.height) / 15000;
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Connect particles
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 242, 234, ${1 - distance / connectionDistance})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// Re-init particles on drastic resize to maintain density
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initParticles, 100);
});

// --- Live Platform Pulse Logic ---
function loadRealStats() {
    const scannedEl = document.getElementById('stat-scanned');
    const threatsEl = document.getElementById('stat-threats');

    if (scannedEl && threatsEl && typeof SentinelState !== 'undefined') {
        const history = SentinelState.getHistory();
        const totalScanned = history.length;
        const totalThreats = history.filter(item => item.is_malware).length;

        scannedEl.innerText = totalScanned.toLocaleString();
        threatsEl.innerText = totalThreats.toLocaleString();
    }
}

// Load stats on page load
loadRealStats();

// --- Login Modal Logic ---
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeLogin = document.querySelector('.close-login');
const loginForm = document.getElementById('login-form');

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('active');
    });
}

if (closeLogin) {
    closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
}

// Redirect on Login Submit
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulate auth delay
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Authenticating...';
        btn.style.opacity = '0.7';

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
}

// --- Demo Modal Logic ---
const demoBtn = document.getElementById('demo-btn');
const demoModal = document.getElementById('demo-modal');
const closeDemo = document.querySelector('.close-demo');
const startDemoBtn = document.getElementById('start-demo-btn');

if (demoBtn) {
    demoBtn.addEventListener('click', () => {
        demoModal.classList.add('active');
    });
}

if (closeDemo) {
    closeDemo.addEventListener('click', () => {
        demoModal.classList.remove('active');
    });
}

if (startDemoBtn) {
    startDemoBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.remove('active');
    if (e.target === demoModal) demoModal.classList.remove('active');
});

// --- Subscription Logic ---
const subBtn = document.getElementById('sub-btn');
const subEmail = document.getElementById('sub-email');
const toast = document.getElementById('toast');

if (subBtn && subEmail) {
    subBtn.addEventListener('click', () => {
        if (subEmail.value && subEmail.value.includes('@')) {
            // Show success
            toast.classList.remove('hidden');
            toast.classList.add('show');
            subEmail.value = ''; // Clear input

            // Hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.classList.add('hidden'), 500);
            }, 3000);
        } else {
            alert('Please enter a valid email address.');
        }
    });
}

// --- Smooth Scroll Logic ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- Scroll Animation Logic ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.anim-on-scroll').forEach(el => {
    observer.observe(el);
});

// --- Page Transition Logic ---
if (launchBtn) {
    launchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = launchBtn.getAttribute('href');
        }, 500); // 500ms match CSS transition
    });
}
// --- 3D Tilt Effect for Cards ---
document.querySelectorAll('.feature-card, .solution-card, .enterprise-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// --- Magical Cursor Trail ---
const cursorParticles = [];
class MagicParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = Math.random() > 0.5 ? 'rgba(0, 242, 234, 0.8)' : 'rgba(157, 0, 255, 0.8)';
        this.life = 1.0; // Opacity
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.95; // Shrink
        this.life -= 0.03; // Fade out
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Create separate canvas for cursor trail to avoid conflict with bg particles
const cursorCanvas = document.createElement('canvas');
cursorCanvas.id = 'cursor-canvas';
cursorCanvas.style.position = 'fixed';
cursorCanvas.style.top = '0';
cursorCanvas.style.left = '0';
cursorCanvas.style.width = '100%';
cursorCanvas.style.height = '100%';
cursorCanvas.style.pointerEvents = 'none';
cursorCanvas.style.zIndex = '9999'; // On top of everything
document.body.appendChild(cursorCanvas);

const cursorCtx = cursorCanvas.getContext('2d');
function resizeCursorCanvas() {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCursorCanvas);
resizeCursorCanvas();

window.addEventListener('mousemove', (e) => {
    // Spawn particles on move
    for (let i = 0; i < 3; i++) {
        cursorParticles.push(new MagicParticle(e.clientX, e.clientY));
    }
});

function animateCursor() {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    for (let i = 0; i < cursorParticles.length; i++) {
        cursorParticles[i].update();
        cursorParticles[i].draw(cursorCtx);
        if (cursorParticles[i].life <= 0 || cursorParticles[i].size <= 0.2) {
            cursorParticles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();
