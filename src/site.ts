import * as fs from 'fs';

console.log(window.rats);

const isQuestionning = false;


document.getElementById('minimize')?.addEventListener('click', () => {
    window.electronAPI.minimize();
});

document.getElementById('maximize')?.addEventListener('click', () => {
    window.electronAPI.maximize();
});

document.getElementById('close')?.addEventListener('click', () => {
    window.electronAPI.close();
});

export function addNavBar() {
    if (!isQuestionning) {
        document.body.insertAdjacentHTML('afterbegin', `
    <nav class="navbar fixed-top navbar-dark navbar-expand bg-dark">
      <div class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
          <li><a class="nav-item nav-link" href="">Main</a></li>
          <li><a class="nav-item nav-link" href="sniff.html">Sniff Sniff😢</a></li>
          <li><a class="nav-item nav-link" href="stats.html">Statistics</a></li>
        </ul>
      </div>
    </nav>
    <br><br>
  `);
    }
}

interface Question {
    type: string;
    title: string;
    choices: string[];
    correct_answers: number[];
    correct_answer: string;
}

export async function getRandomQuestion(): Promise<void> {
    const questionId = Math.floor(Math.random() * 11);

    try {
        const content: string = await (await fetch(`./questions/${questionId}.json`)).text();
        const question: Question = JSON.parse(content);

        const element = document.getElementById('question');
        element.innerHTML += `<h3>${question.title}</h3><br>`;

        function shuffleArray<T>(array: T[]): T[] {
            const arr = [...array]; // make a copy so original isn’t modified
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        if (question.type == "multiple_choice") {

            const choicesWithIndex = question.choices.map((choice, idx) => ({ choice, idx }));
            const shuffledChoices = shuffleArray(choicesWithIndex);

            shuffledChoices.forEach(q => {
                element.innerHTML += `<button type="button" id="submit${q.idx}">${q.choice}</button><br><br>`;
            });

            for(let i = 0; i < question.choices.length; i++)
            {
                const item = shuffledChoices[i];
                const id = `submit${item.idx}`
                document.getElementById(id).addEventListener("click", () => {
                    verifyAnswer(question, item.idx, null);
                });
            }
        }
        else if (question.type == "short_answer") {
            element.innerHTML += `
        <textarea name="resp" rows="10" cols="120" placeholder="Response..."></textarea><br><br>
        <input type="button" type="submit" value="Submit" id="submit">`;

            document.getElementById('submit').addEventListener('click', () => {
                verifyAnswer(question, null, document.getElementById('resp').value);
            });
        }

    } catch (error) {
        console.error("Error reading file synchronously:", error);
    }
}

export function getAnswers() {
    let totalAnswers = "0";
    let goodAnswers = "0";
    let created = localStorage.getItem("totalAnswers");

    if (!created) {
        localStorage.setItem("totalAnswers", "0");
        localStorage.setItem("goodAnswers", "0");
    }
    else {
        totalAnswers = created;
        goodAnswers = localStorage.getItem("goodAnswers");
    }
    return [totalAnswers, goodAnswers];
}

export function verifyAnswer(question: Question, answerIndex: number | null, answer: string | null): void {
    let letsEncrypt = false;
    let [totalAnswers, goodAnswers] = getAnswers();

    if (answerIndex != null && !question.correct_answers.includes(answerIndex)) {
        letsEncrypt = true;
    }
    else if (answer != null && answer.trim().toLowerCase() != question.correct_answer.trim().toLowerCase()) {
        letsEncrypt = true;
    }

    if (letsEncrypt) {
        console.log(`Wrong answer, encrypting files... given answer : ${answerIndex != null ? question.choices[answerIndex] : answer}`);
        window.location.href = "roulette.html";
    }
    else {
        localStorage.setItem("goodAnswers", (parseInt(goodAnswers) + 1).toString());
        document.getElementById("question").style.display = "none";
        const yipee = document.getElementById("yipee");
        yipee.innerHTML += "<h3>Good job queen!</h3>";
        yipee.innerHTML += '<div id="bing"><img src="https://media1.tenor.com/m/pUNC06ehYBsAAAAC/erm-aksuali-veli.gif"></div>';
    }
    localStorage.setItem("totalAnswers", (parseInt(totalAnswers) + 1).toString());

    console.log("good, encrypting files...");
}