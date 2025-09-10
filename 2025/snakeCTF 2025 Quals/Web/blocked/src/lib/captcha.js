const { createCanvas } = require('canvas');

const SCALE = 4;
const IMG_WIDTH = 500;
const IMG_HEIGHT = 120;
const BG_WIDTH = 900;
const CHAR_COUNT = 6;
const MISSING_COUNT = 2;
const FONT_SIZE = 55 / SCALE;
const FONT = `bold ${FONT_SIZE}px sans-serif`;
const CHAR_SPACING = 65 / SCALE;

function generateCaptchaText(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

function addExtremeVisualNoise(ctx, width, height) {
    for (let i = 0; i < width * height * 0.5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
        ctx.fillRect(x, y, 1, 1);
    }
    for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.4 + 0.1})`;
        ctx.lineWidth = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }
}

function drawCharacters(ctx, chars, startX, isVisibleLayer) {
    ctx.font = FONT;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    chars.forEach(item => {
        const char = item.char;
        const x = startX + item.index * CHAR_SPACING;
        const y = (IMG_HEIGHT / SCALE) / 2;
        const angle = (Math.random() - 0.5) * 0.2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.fillStyle = isVisibleLayer ? '#222' : '#111';

        const charWidth = ctx.measureText(char).width;
        const halfWidth = charWidth / 2;
        const halfHeight = (FONT_SIZE * 1.2) / 2;
        const offset = 8 / SCALE;

        const quadrantOffsets = [
            { x: -halfWidth, y: -halfHeight, w: halfWidth, h: halfHeight, ox: (Math.random() - 0.5) * offset, oy: (Math.random() - 0.5) * offset }, // Top-Left
            { x: 0,         y: -halfHeight, w: halfWidth, h: halfHeight, ox: (Math.random() - 0.5) * offset, oy: (Math.random() - 0.5) * offset }, // Top-Right
            { x: -halfWidth, y: 0,         w: halfWidth, h: halfHeight, ox: (Math.random() - 0.5) * offset, oy: (Math.random() - 0.5) * offset }, // Bottom-Left
            { x: 0,         y: 0,         w: halfWidth, h: halfHeight, ox: (Math.random() - 0.5) * offset, oy: (Math.random() - 0.5) * offset }  // Bottom-Right
        ];

        quadrantOffsets.forEach(q => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(q.x, q.y, q.w, q.h);
            ctx.clip();
            ctx.fillText(char, q.ox, q.oy);
            ctx.restore();
        });

        ctx.restore();
    });
}

function toFinalBuffer(canvas, format) {
    const finalCanvas = createCanvas(canvas.width * SCALE, canvas.height * SCALE);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = false;
    finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);

    if (format === 'jpeg') {
        return finalCanvas.toBuffer('image/jpeg', { quality: 0.2 });
    } else {
        return finalCanvas.toBuffer('image/png');
    }
}

async function generate() {
    const fullText = generateCaptchaText(CHAR_COUNT);
    const missingIndexes = new Set();
    while (missingIndexes.size < MISSING_COUNT) {
        missingIndexes.add(Math.floor(Math.random() * CHAR_COUNT));
    }

    const visibleChars = [];
    const missingChars = [];
    let solution = '';
    for (let i = 0; i < fullText.length; i++) {
        const charInfo = { char: fullText[i], index: i };
        if (missingIndexes.has(i)) {
            missingChars.push(charInfo);
            solution += charInfo.char;
        } else {
            visibleChars.push(charInfo);
        }
    }

    const fgCanvas = createCanvas(IMG_WIDTH / SCALE, IMG_HEIGHT / SCALE);
    const fgCtx = fgCanvas.getContext('2d');
    const fgStartX = (fgCanvas.width - (CHAR_COUNT - 1) * CHAR_SPACING) / 2;
    drawCharacters(fgCtx, visibleChars, fgStartX, true);
    addExtremeVisualNoise(fgCtx, fgCanvas.width, fgCanvas.height);

    const bgCanvas = createCanvas(BG_WIDTH / SCALE, IMG_HEIGHT / SCALE);
    const bgCtx = bgCanvas.getContext('2d');
    bgCtx.fillStyle = '#f0f0f0';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    const solutionStartX = (50 / SCALE) + Math.random() * (bgCanvas.width - (IMG_WIDTH / SCALE));
    drawCharacters(bgCtx, missingChars, solutionStartX + fgStartX, false);
    addExtremeVisualNoise(bgCtx, bgCanvas.width, bgCanvas.height);

    return {
        solution: fullText,
        
        foreground: toFinalBuffer(fgCanvas, 'png'),
        background: toFinalBuffer(bgCanvas, 'png')
    };
}

module.exports = { generate };