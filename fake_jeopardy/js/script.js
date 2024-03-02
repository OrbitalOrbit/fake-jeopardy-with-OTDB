const categories = {"Sports": 21, "Animals": 27, "Science & Nature": 17, "History": 23, "Art": 25}
const category_names = Object.keys(categories);

/* add event listeners for start & reset buttons here */
document.getElementById("startButton").addEventListener("click", setToken);
document.getElementById("resetButton").addEventListener("click", resetGame);


/* complete functions below */


function setToken() {
    document.getElementById("feedback").innerHTML = "Awaiting database response..."
    $.ajax({
        //https://opentdb.com/api_token.php?command=request.php
        url: "https://opentdb.com/api_token.php", 
        method: "GET",
        data: {"command": "request"},
        dataType: "json"
     })
     .done(function(response) {
        window.localStorage.setItem("token", response.token);
        console.log("setToken success, Token =", response.token);
        startGame();
     });
     
    console.log("setToken finished");
}

function loadQuestion() {
    console.log("In loadQuestion")
    console.log("question id = " + this.id);
    // If id is set earlier, saving it to local storage
    window.localStorage.setItem("currentIndex", this.id);
    document.getElementById("feedback").innerHTML = "Loading Question..."
    let cat = document.getElementById(this.id).getAttribute("data-cat");
    let diff = document.getElementById(this.id).getAttribute("data-diff");
    let token = window.localStorage.getItem("token");

    // Getting the questions
    $.ajax({
        url: "https://opentdb.com/api.php", 
        method: "GET",
        data: {"amount": 1, "category": cat, "difficulty": diff, "type": "multiple", "token": token},
        dataType: "json"
     })
     .done(function(response) {
        //console.log(response.results);
        viewQuestion(response.results[0]);
     });

     console.log("loadQuestion success");
}


function startGame(){
    document.getElementById("startButton").disabled=true;
    document.getElementById("resetButton").disabled=false;
    document.getElementById("total").innerHTML="0";
    document.getElementById("feedback").innerHTML="Game Started! Select a question.";
    document.getElementById("submitResponse").addEventListener("click", checkResponse);
    populateBoard();

} // Completed

function populateBoard(){
    console.log("got into populateBoard");
    let cat = document.getElementsByClassName("category");
    for (let i = 0; i < cat.length; i++) { // Adding the names of each category to the box and category number
        cat[i].innerHTML = category_names[i];
        //console.log("i = " + i);
    }  

    let quest = document.getElementsByClassName("question");
    console.log("question")
    let score = 0;
    let difficulty = ["easy", "medium", "hard"];
    let diff_id = 0;
    let cat_id = 0;
    for (let i = 0; i < quest.length; i++) {
        if (i % 5 == 0) {
            score += 10;
            cat_id = 0;
        }

        if (score == 10) {diff_id = 0}
        else if (score >= 20 && score <= 40) {diff_id = 1;}
        else {diff_id = 2;}
        
        quest[i].innerHTML = score;
        quest[i].setAttribute("id", i);
        quest[i].setAttribute("data-diff", difficulty[diff_id])
        quest[i].setAttribute("data-cat", categories[category_names[cat_id]]);
        quest[i].addEventListener("click", loadQuestion);
        cat_id += 1;
    }
    console.log("populateBoard done")
} 

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
  
      // swap elements array[i] and array[j]
      // we use "destructuring assignment" syntax to achieve that
      // you'll find more details about that syntax in later chapters
      // same can be written as:
      // let t = array[i]; array[i] = array[j]; array[j] = t
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function viewQuestion(response) {
    console.log("In viewQuestion");
    console.log(response);

    document.getElementById("questionArea").innerHTML = response.question;
    let questions = document.getElementsByName("qa");
    let correct = [response.correct_answer];
    let incorrect = response.incorrect_answers;
    let answers = correct.concat(incorrect);
    

    console.log("Incorrect =", incorrect);
    console.log("OG answers =", answers);
    shuffle(answers);
    console.log("Shuffled answers =", answers);

    for (let i in answers) {
        questions[i].nextSibling.textContent = answers[i];
        if (incorrect.includes(answers[i])) {
            console.log("incorrect list =", incorrect, "|| current answer =", answers[i]);
            questions[i].setAttribute("value", "incorrect");
        }
        else {
            questions[i].setAttribute("value", "correct");
        }
    }

    // Get the modal
    // Not using var makes it global
    modal = document.getElementById("qaModal");

    // Get the <span> element that closes the modal
    var closeX = document.getElementsByClassName("close")[0];

    // Display modal
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    closeX.onclick = function() {
        modal.style.display = "none";
    }

    
}


function checkResponse(){
    var index = window.localStorage.getItem("currentIndex");
    var question = document.getElementsByClassName("question");
    var correct = document.querySelector("input[value='correct']").parentElement.textContent;
    var answer = document.querySelector("input:checked").value;
    var total = document.getElementById("total").innerHTML;
    console.log("correct = "+ correct);
    console.log("answer = "+ toString(answer));
    console.log("total = "+ total);
    console.log("index = " + index);

    if (answer == "correct") {
        document.getElementById("feedback").innerHTML = "Correct!";
        document.getElementById("total").innerHTML = parseInt(total) + parseInt(document.getElementById(index).innerHTML);
        
        document.getElementById(index).removeEventListener("click", loadQuestion);
        document.getElementById(index).innerHTML = "";
        modal.style.display = "none";
    }
    else {
        document.getElementById("feedback").innerHTML = "Incorrect :( The correct answer is " + correct;
        document.getElementById("total").innerHTML = parseInt(total) - parseInt(document.getElementById(index).innerHTML);
        console.log("question score = " + document.getElementById(index).innerHTML);

        document.getElementById(index).removeEventListener("click", loadQuestion);
        document.getElementById(index).innerHTML = "";
        modal.style.display = "none";
    }

    /* for closing modal */
    //modal.style.display = "none";
} // Complete

function resetGame(){
    document.getElementById("startButton").disabled=false;
    document.getElementById("resetButton").disabled=true;
    let cat = document.getElementsByClassName("category");
    let question = document.getElementsByClassName("question");
    for (let i = 0; i < cat.length; i++) {
        cat[i].innerHTML = "";
    }
    for (let i = 0; i < question.length; i++) {
        question[i].innerHTML = "";
        question[i].removeEventListener("click", loadQuestion);
        question[i].removeAttribute("id");
    }
    document.getElementById("feedback").innerHTML = "Click Start to begin.";
    document.getElementById("total").innerHTML = "0";

} // Complete