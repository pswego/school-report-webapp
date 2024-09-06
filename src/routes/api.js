const express = require('express');
const db = require('../db/database');
const nodemailer = require('nodemailer');
const router = express.Router();

// 학교 검색 API
router.get('/search', (req, res) => {
    const query = req.query.name;
    db.all('SELECT * FROM schools WHERE name LIKE ?', [`%${query}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 학교 제보 API
router.post('/report', (req, res) => {
    const currentTime = Date.now();
    if (req.session.lastReportTime && currentTime - req.session.lastReportTime < 60000) {
        return res.status(429).json({ error: '1분 후 다시 시도해주세요.' });
    }

    const { email, message } = req.body;

    // Nodemailer 설정
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '',      // 실제 Gmail 계정
            pass: '',       // Gmail 계정의 비밀번호 또는 앱 비밀번호
        },
    });

    let mailOptions = {
        from: email,
        to: '',     // 개발자의 이메일
        subject: '새로운 학교 제보',
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        req.session.lastReportTime = currentTime;
        res.status(200).json({ message: '제보가 성공적으로 전송되었습니다.' });
    });
});

module.exports = router;
