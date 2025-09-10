const path = require('path');
const crypto = require('crypto');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');

const captcha = require('./lib/captcha');

const app = express();
const port = 3000;

const db = new sqlite3.Database('/tmp/data.db', (err) => {
    if (err) {
        console.error("Could not connect to SQLite database", err);
        process.exit(1);
    }
    console.log("Connected to SQLite database");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS captchas (
        id TEXT PRIMARY KEY,
        solution TEXT,
        createdAt INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS validHashes (
        id TEXT PRIMARY KEY,
        hash TEXT,
        salt TEXT,
        solvedAt INTEGER,
        createdAt INTEGER
    )`);
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

const CAPTCHA_COUNT_REQUIRED = 10;
const TIME_LIMIT_SECONDS = 10;

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api/captcha', async (req, res) => {
    try {
        const captchaData = await captcha.generate();
        const captchaId = crypto.randomBytes(12).toString('hex');

        if (process.env.LOG_SOLVE) console.log(`[${new Date().toISOString()}] - ${captchaId} - Solution: ${captchaData.solution}`);

        db.run("INSERT INTO captchas (id, solution, createdAt) VALUES (?, ?, ?)",
            [captchaId, captchaData.solution, Date.now()], function (err) {
                if (err) {
                    console.error('Error inserting captcha:', err);
                    return res.status(500).json({ error: 'Failed to generate captcha' });
                }
                res.json({
                    captchaId: captchaId,
                    foreground: `data:image/png;base64,${captchaData.foreground.toString('base64')}`,
                    background: `data:image/png;base64,${captchaData.background.toString('base64')}`
                });
            });
    } catch (error) {
        console.error('Captcha generation failed:', error);
        res.status(500).json({ error: 'Failed to generate captcha' });
    }
});

app.post('/api/solve', async (req, res) => {
    const { captchaId, solution } = req.body;
    if (!captchaId || !solution) {
        return res.status(400).json({ success: false, message: 'Captcha ID and solution are required.' });
    }

    try {
        const storedCaptcha = await new Promise((resolve, reject) => {
            db.get("SELECT solution FROM captchas WHERE id = ?", [captchaId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!storedCaptcha) {
            return res.status(404).json({ success: false, message: 'Captcha not found or already solved.' });
        }

        const solutionBuffer = Buffer.from(solution.toLowerCase());
        const storedSolutionBuffer = Buffer.from(storedCaptcha.solution.toLowerCase());
        const isCorrect = solutionBuffer.length === storedSolutionBuffer.length &&
            crypto.timingSafeEqual(solutionBuffer, storedSolutionBuffer);

        if (!isCorrect) {
            return res.status(400).json({ success: false, message: 'Incorrect captcha. Please try again.' });
        }

        const solvedAt = Date.now();
        const token = crypto.randomBytes(16).toString('hex');
        const salt = crypto.randomBytes(16).toString('hex');

        const hash = await new Promise((resolve, reject) => {
            crypto.pbkdf2(token, salt, 100000, 64, "sha512", (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey.toString('hex'));
            });
        });

        await new Promise((resolve, reject) => {
            db.run("INSERT INTO validHashes (id, hash, salt, solvedAt, createdAt) VALUES (?, ?, ?, ?, ?)",
                [token, hash, salt, solvedAt, Date.now()], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });

        let solvedCaptchas = [];
        try {
            solvedCaptchas = JSON.parse(req.cookies.solvedCaptchas || '[]');
        } catch (e) {
            console.warn("Error parsing solvedCaptchas cookie:", e);
            solvedCaptchas = [];
        }

        solvedCaptchas.push(token);
        res.cookie('solvedCaptchas', JSON.stringify(solvedCaptchas), { httpOnly: true, secure: false });

        await new Promise((resolve, reject) => {
            db.run("DELETE FROM captchas WHERE id = ?", [captchaId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ success: true, message: 'Captcha solved correctly!', currentCount: solvedCaptchas.length });

    } catch (error) {
        console.error('Error solving captcha:', error);
        res.status(500).json({ error: 'Failed to solve captcha' });
    }
});

app.get('/protected', async (req, res) => {
    try {
        let solvedCaptchas = req.cookies.solvedCaptchas.split(',').map(token => token.trim());
        if (solvedCaptchas.length < CAPTCHA_COUNT_REQUIRED) {
            return res.status(403).send(`You need to solve ${CAPTCHA_COUNT_REQUIRED} captchas to access this page. You have solved ${solvedCaptchas.length}.`);
        }

        const solvedTimes = [];
        const verificationPromises = solvedCaptchas.map(token => {
            return new Promise((resolve, reject) => {
                db.get("SELECT hash, salt, solvedAt FROM validHashes WHERE id = ?", [token], async (err, storedHashData) => {
                    if (err) {
                        console.error("Error retrieving hash data:", err);
                        return resolve();
                    }

                    if (!storedHashData) {
                        console.error("Token not found or already used:", token);
                        return resolve();
                    }

                    const { hash, salt, solvedAt } = storedHashData;

                    try {
                        const recomputedHash = await new Promise((resolveHash, rejectHash) => {
                            crypto.pbkdf2(token, salt, 100000, 64, "sha512", (err, derivedKey) => {
                                if (err) rejectHash(err);
                                resolveHash(derivedKey.toString('hex'));
                            });
                        });

                        if (recomputedHash === hash) {
                            solvedTimes.push(solvedAt);
                            db.run("DELETE FROM validHashes WHERE id = ?", [token], (err) => {
                                if (err) {
                                    console.error("Error deleting hash:", err);
                                }
                                resolve();
                            });
                        } else {
                            console.error("Hash mismatch for token:", token);
                            resolve();
                        }
                    } catch (e) {
                        console.error("Error verifying token:", e);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(verificationPromises);

        solvedTimes.sort((a, b) => a - b);

        if (solvedTimes.length < CAPTCHA_COUNT_REQUIRED) {
            return res.status(403).send('Could not verify all solved captchas.');
        }

        const firstSolvedTime = solvedTimes[0];
        const lastSolvedTime = solvedTimes[solvedTimes.length - 1];
        const timeElapsed = (lastSolvedTime - firstSolvedTime) / 1000;

        if (timeElapsed <= TIME_LIMIT_SECONDS) {
            res.render('page', {
                flag: process.env.FLAG || "snakeCTF{f4k3_fl4g_f0r_t3st1ng}",
            });
        } else {
            res.status(403).send(`You solved 10 captchas, but it took you ${timeElapsed.toFixed(2)} seconds. You must solve them within ${TIME_LIMIT_SECONDS} seconds.`);
        }
    } catch (error) {
        res.status(403).send('You need to solve 10 captchas to access this page.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
