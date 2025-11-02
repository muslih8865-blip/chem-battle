const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

const questionsFile = path.join(__dirname, 'questions.json');
let questionsDB = {};

// تحميل وحفظ الأسئلة
function loadQuestions() {
    try {
        const data = fs.readFileSync(questionsFile, 'utf8');
        questionsDB = JSON.parse(data);
    } catch(err) {
        questionsDB = { beginner: [], intermediate: [], advanced: [] };
    }
}
function saveQuestions() {
    fs.writeFileSync(questionsFile, JSON.stringify(questionsDB, null, 2));
}
loadQuestions();

// API إدارة الأسئلة
app.get('/api/questions', (req, res) => res.json(questionsDB));

app.post('/api/questions', (req, res) => {
    const { level, question, answers, correct } = req.body;
    if(!questionsDB[level]) questionsDB[level] = [];
    questionsDB[level].push({ question, answers, correct });
    saveQuestions();
    res.json({ status: "success" });
});

app.put('/api/questions', (req, res) => {
    const { level, index, question, answers, correct } = req.body;
    if(questionsDB[level] && questionsDB[level][index]){
        questionsDB[level][index] = { question, answers, correct };
        saveQuestions();
        res.json({ status: "success" });
    } else res.status(400).json({ status: "error" });
});

app.delete('/api/questions', (req, res) => {
    const { level, index } = req.body;
    if(questionsDB[level] && questionsDB[level][index]){
        questionsDB[level].splice(index,1);
        saveQuestions();
        res.json({ status: "success" });
    } else res.status(400).json({ status: "error" });
});

// لعبة ChemBattle
let players = {};
let leaderboard = [];

function getRandomQuestions(level, count=4){
    const pool = questionsDB[level] || [];
    return pool.sort(() => 0.5 - Math.random()).slice(0, count);
}

io.on('connection', (socket) => {
    players[socket.id] = { score: 0, name: `لاعب_${socket.id.slice(0,4)}` };
    socket.emit('leaderboard', leaderboard);

    socket.on('startGame', (level='beginner') => {
        const questions = getRandomQuestions(level, 4);
        socket.questions = questions;
        socket.currentQuestionIndex = 0;
        socket.score = 0;
        socket.emit('questions', questions);
    });

    socket.on('answer', (data) => {
        const { answer, index } = data;
        const correct = socket.questions[index].correct;
        if(answer === correct) socket.score += 10;
        else socket.score -= 5;
        players[socket.id].score = socket.score;
        socket.emit('scoreUpdate', socket.score);
        updateLeaderboard();
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        updateLeaderboard();
    });
});

function updateLeaderboard(){
    leaderboard = Object.values(players)
        .sort((a,b) => b.score - a.score)
        .map(p => ({ name: p.name, score: p.score }));
    io.emit('leaderboard', leaderboard);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
