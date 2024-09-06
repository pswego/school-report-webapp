const express = require('express');
const db = require('../db/database');
const router = express.Router();
const cors = require('cors');
router.use(cors());

// 관리 페이지 접근 제한을 위한 미들웨어 (예시로 간단한 기본 인증 사용)
router.use((req, res, next) => {
    const auth = { login: 'admin', password: 'password' }; // 기본 로그인 정보

    // 브라우저에 기본 인증 창 표시
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // 인증 정보가 맞지 않으면 접근 금지
    if (login && password && login === auth.login && password === auth.password) {
        return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="401"'); // 인증 실패 시 401 상태 코드 반환
    res.status(401).send('인증이 필요합니다.');
});

// 학교 추가 API
router.post('/add-school', (req, res) => {
    const { name, latitude, longitude } = req.body;
    if (!name || !latitude || !longitude) {
        return res.status(400).json({ error: '모든 필드를 입력하세요.' });
    }

    const query = `INSERT INTO schools (name, latitude, longitude) VALUES (?, ?, ?)`;
    db.run(query, [name, latitude, longitude], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: '학교가 성공적으로 추가되었습니다.', id: this.lastID });
    });
});

// 학교 이름으로 삭제 API
router.delete('/delete-school/:name', (req, res) => {
    const { name } = req.params;
    const query = `DELETE FROM schools WHERE name = ?`;

    db.run(query, [name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: '해당 학교를 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: '학교가 성공적으로 삭제되었습니다.' });
    });
});

module.exports = router;
