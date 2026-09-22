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
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
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
let lineIndex = 0;
let charIndex = 0;

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
let mediaRecorder = null;
let audioChunks = [];
let stream = null;
let chunkCount = 0;
let startTime = null;
let uptimeInterval = null;

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
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    uptimeEl.textContent = mins + ':' + secs;
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
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            if (audioBlob.size > 0) {
                await sendAudio(audioBlob);
                chunkCount++;
                chunkCountEl.textContent = chunkCount;
            }
            audioChunks = [];
        };
        
        mediaRecorder.start();
        
        setInterval(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                mediaRecorder.start();
            }
        }, 4000);
        
        uptimeInterval = setInterval(updateUptime, 1000);
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        updateStatus('RECORDING [LIVE]', '#00ff41');
        liveStatusEl.textContent = 'LIVE';
        liveStatusEl.style.color = '#00ff41';
        
    } catch (err) {
        updateStatus('ERROR: ' + err.message, '#ff3333');
    }
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (uptimeInterval) clearInterval(uptimeInterval);
    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('STOPPED', '#ffaa00');
    liveStatusEl.textContent = 'IDLE';
    liveStatusEl.style.color = '#ffaa00';
});

async function sendAudio(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'astra_' + Date.now() + '.wav');
    
    try {
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            updateStatus('CHUNK ' + (chunkCount + 1) + ' UPLOADED ✓', '#00ff41');
        } else {
            updateStatus('UPLOAD FAILED', '#ff3333');
        }
    } catch (err) {
        updateStatus('NETWORK ERROR', '#ff3333');
    }
}
