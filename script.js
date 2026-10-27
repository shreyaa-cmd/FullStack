// JS Quiz Arena - quiz logic
const questions = [
  {
    question: "Which keyword declares a variable that cannot be reassigned?",
    options: ["var", "let", "const", "static"],
    answer: 2,
    explanation: "const creates a variable whose value can't be reassigned."
  },
  {
    question: "What does typeof null return?",
    options: ["null", "object", "undefined", "number"],
    answer: 1,
    explanation: "It's an old bug in JavaScript, typeof null gives 'object'."
  },
  {
    question: "Which array method adds an item to the end?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    answer: 0,
    explanation: "push() adds to the end, pop() removes from the end."
  },
  {
    question: "What does === check?",
    options: ["Only value", "Only type", "Value and type", "Nothing"],
    answer: 2,
    explanation: "=== is strict equality, so both value and type must match."
  },
  {
    question: "Which of these is NOT a JavaScript data type?",
    options: ["string", "boolean", "float", "symbol"],
    answer: 2,
    explanation: "JS has a single number type, there is no separate float."
  },
  {
    question: "How do you write a single line comment in JavaScript?",
    options: ["# comment", "// comment", "<!-- comment -->", "** comment"],
    answer: 1,
    explanation: "// is used for single line comments."
  },
  {
    question: "What does Array.isArray([]) return?",
    options: ["true", "false", "undefined", "error"],
    answer: 0,
    explanation: "[] is an array so it returns true."
  },
  {
    question: "Which method turns a JSON string into an object?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.object()", "JSON.convert()"],
    answer: 1,
    explanation: "JSON.parse() converts a JSON string to a JS object."
  },
  {
    question: "What is the result of \"5\" + 2 ?",
    options: ["7", "52", "NaN", "error"],
    answer: 1,
    explanation: "The + operator joins them as strings, so you get \"52\"."
  },
  {
    question: "Which symbol is used for an arrow function?",
    options: ["->", "=>", "==>", "::"],
    answer: 1,
    explanation: "Arrow functions are written with =>"
  }
];

const TIME_LIMIT = 30;

let current = 0;
let score = 0;
let locked = false;
let timeLeft = TIME_LIMIT;
let timerId = null;
let wrongAnswers = []; // stores the questions the user got wrong or missed

const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const explanationEl = document.getElementById("explanation");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const reviewBtn = document.getElementById("reviewBtn");
const reviewEl = document.getElementById("review");
const quizArea = document.getElementById("quizArea");

function showQuestion() {
  const q = questions[current];
  locked = false;

  quizArea.style.display = "block";
  reviewEl.style.display = "none";
  reviewBtn.style.display = "none";

  progressEl.textContent = "Q " + (current + 1) + "/" + questions.length;
  scoreEl.textContent = "Score: " + score;
  questionEl.textContent = q.question;
  explanationEl.style.display = "none";
  optionsEl.innerHTML = "";

  nextBtn.disabled = true;
  nextBtn.style.display = "inline-block";
  nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";

  q.options.forEach(function (text, index) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = "option";
    btn.addEventListener("click", function () {
      selectAnswer(index, btn);
    });
    optionsEl.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_LIMIT;
  timerEl.textContent = "Time: " + timeLeft + "s";
  timerEl.classList.remove("low");
  timerEl.style.display = "block";

  timerId = setInterval(function () {
    timeLeft--;
    timerEl.textContent = "Time: " + timeLeft + "s";

    if (timeLeft <= 5) {
      timerEl.classList.add("low");
    }
    if (timeLeft <= 0) {
      timeUp();
    }
  }, 1000);
}

function timeUp() {
  clearInterval(timerId);
  if (locked) return;
  locked = true;

  const q = questions[current];
  const allButtons = document.querySelectorAll(".option");

  allButtons.forEach(function (b) {
    b.disabled = true;
  });
  allButtons[q.answer].classList.add("correct");

  // no answer was picked, so this counts as a wrong one for the review
  wrongAnswers.push({
    question: q.question,
    yourAnswer: "No answer (time ran out)",
    correctAnswer: q.options[q.answer],
    explanation: q.explanation
  });

  explanationEl.textContent = "Time's up! " + q.explanation;
  explanationEl.style.display = "block";
  nextBtn.disabled = false;
}

function selectAnswer(index, clickedBtn) {
  if (locked) return;
  locked = true;
  clearInterval(timerId);

  const q = questions[current];
  const allButtons = document.querySelectorAll(".option");

  if (index === q.answer) {
    clickedBtn.classList.add("correct");
    score++;
  } else {
    clickedBtn.classList.add("wrong");
    allButtons[q.answer].classList.add("correct");

    wrongAnswers.push({
      question: q.question,
      yourAnswer: q.options[index],
      correctAnswer: q.options[q.answer],
      explanation: q.explanation
    });
  }

  allButtons.forEach(function (b) {
    b.disabled = true;
  });

  scoreEl.textContent = "Score: " + score;
  explanationEl.textContent = q.explanation;
  explanationEl.style.display = "block";
  nextBtn.disabled = false;
}

function getRating() {
  const percent = (score / questions.length) * 100;
  if (percent >= 90) {
    return "Excellent! You really know your JavaScript.";
  } else if (percent >= 60) {
    return "Good job! A little more practice and you'll be perfect.";
  } else {
    return "Keep practicing, you'll get better!";
  }
}

function showResult() {
  clearInterval(timerId);
  progressEl.textContent = "Done";
  timerEl.style.display = "none";
  questionEl.textContent = "Final score: " + score + " / " + questions.length;
  optionsEl.innerHTML = "";
  explanationEl.textContent = getRating();
  explanationEl.style.display = "block";
  nextBtn.style.display = "none";

  // only show the review button if there is something to review
  if (wrongAnswers.length > 0) {
    reviewBtn.style.display = "inline-block";
  }
}

function showReview() {
  quizArea.style.display = "none";
  reviewEl.style.display = "block";
  reviewEl.innerHTML = "<h2>Review wrong answers</h2>";

  wrongAnswers.forEach(function (item, i) {
    const box = document.createElement("div");
    box.className = "review-item";
    box.innerHTML =
      "<p class='review-q'>" + (i + 1) + ". " + item.question + "</p>" +
      "<p class='your'>Your answer: " + item.yourAnswer + "</p>" +
      "<p class='right'>Correct answer: " + item.correctAnswer + "</p>" +
      "<p class='why'>" + item.explanation + "</p>";
    reviewEl.appendChild(box);
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "Back to result";
  backBtn.className = "btn";
  backBtn.addEventListener("click", function () {
    quizArea.style.display = "block";
    reviewEl.style.display = "none";
  });
  reviewEl.appendChild(backBtn);
}

nextBtn.addEventListener("click", function () {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener("click", function () {
  current = 0;
  score = 0;
  wrongAnswers = [];
  showQuestion();
});

reviewBtn.addEventListener("click", showReview);

showQuestion();
