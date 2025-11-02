const addBtn=document.getElementById('add-btn');
const addLevel=document.getElementById('add-level');
const addQuestion=document.getElementById('add-question');
const addAnswers=document.getElementById('add-answers');
const addCorrect=document.getElementById('add-correct');
const selectLevel=document.getElementById('select-level');
const questionsList=document.getElementById('questions-list');

function loadQuestions(){
fetch('/api/questions').then(res=>res.json()).then(data=>{
const level=selectLevel.value;
questionsList.innerHTML='';
data[level].forEach((q,i)=>{
const li=document.createElement('li');
li.textContent=`${q.question} [${q.answers.join(', ')}] → ${q.correct}`;
const editBtn=document.createElement('button');editBtn.textContent='تعديل';editBtn.onclick=()=>editQuestion(level,i);
const delBtn=document.createElement('button');delBtn.textContent='حذف';delBtn.onclick=()=>deleteQuestion(level,i);
li.appendChild(editBtn);li.appendChild(delBtn);questionsList.appendChild(li);
});
});
}

addBtn.onclick=()=>{
const level=addLevel.value;
const question=addQuestion.value;
const answers=addAnswers.value.split(',').map(a=>a.trim());
const correct=addCorrect.value.trim();
fetch('/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({level,question,answers,correct})}).then(()=>{addQuestion.value='';addAnswers.value='';addCorrect.value='';loadQuestions();});
}

function editQuestion(level,index){
const newQuestion=prompt('السؤال الجديد؟');
const newAnswers=prompt('الإجابات الجديدة (افصلها بفواصل)')?.split(',').map(a=>a.trim());
const newCorrect=prompt('الإجابة الصحيحة الجديدة؟');
if(newQuestion && newAnswers && newCorrect){
fetch('/api/questions',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({level,index,question:newQuestion,answers:newAnswers,correct:newCorrect})}).then(()=>loadQuestions());
}
}

function deleteQuestion(level,index){
if(confirm('هل تريد حذف هذا السؤال؟')){
fetch('/api/questions',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({level,index})}).then(()=>loadQuestions());
}
}

selectLevel.onchange=loadQuestions;
loadQuestions();
