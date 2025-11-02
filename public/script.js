const socket = io();
const startBtn=document.getElementById('start-btn');
const restartBtn=document.getElementById('restart-btn');
const startScreen=document.getElementById('start-screen');
const quizScreen=document.getElementById('quiz-screen');
const resultScreen=document.getElementById('result-screen');
const questionEl=document.getElementById('question');
const answersEl=document.getElementById('answers');
const scoreEl=document.getElementById('score');
const finalScoreEl=document.getElementById('final-score');
const leaderboardEl=document.getElementById('leaderboard');
const timerEl=document.getElementById('timer');

let questions=[],currentQuestionIndex=0,score=0,questionTimer;
const timePerQuestion=15;

startBtn.addEventListener('click',()=>{
const level=document.getElementById('level-select').value;
startScreen.classList.add('hidden');
quizScreen.classList.remove('hidden');
socket.emit('startGame',level);
});

socket.on('questions',(data)=>{questions=data;currentQuestionIndex=0;score=0;scoreEl.textContent=`النقاط: ${score}`;showQuestion();});
socket.on('scoreUpdate',(newScore)=>{score=newScore;scoreEl.textContent=`النقاط: ${score}`;});
socket.on('leaderboard',(data)=>{leaderboardEl.innerHTML='';data.forEach(player=>{const li=document.createElement('li');li.textContent=`${player.name} - ${player.score} نقطة`;leaderboardEl.appendChild(li);});});

function showQuestion(){
if(currentQuestionIndex>=questions.length){endGame();return;}
const current=questions[currentQuestionIndex];
questionEl.textContent=current.question;
answersEl.innerHTML='';
current.answers.forEach(ans=>{const btn=document.createElement('button');btn.textContent=ans;btn.addEventListener('click',()=>selectAnswer(ans));answersEl.appendChild(btn);});
let timeLeft=timePerQuestion;
timerEl.textContent=`الوقت: ${timeLeft}s`;
clearInterval(questionTimer);
questionTimer=setInterval(()=>{timeLeft--;timerEl.textContent=`الوقت: ${timeLeft}s`;if(timeLeft<=0){clearInterval(questionTimer);currentQuestionIndex++;showQuestion();}},1000);
}

function selectAnswer(answer){clearInterval(questionTimer);socket.emit('answer',{answer:answer,index:currentQuestionIndex});currentQuestionIndex++;showQuestion();}
function endGame(){clearInterval(questionTimer);quizScreen.classList.add('hidden');resultScreen.classList.remove('hidden');finalScoreEl.textContent=`نقاطك: ${score}`;}
restartBtn.addEventListener('click',()=>location.reload());
