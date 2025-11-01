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
          <li><a class="nav-item nav-link" href="roulette.html">Roulette</a></li>
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

        if (question.type == "multiple_choice") {
            let index = 0;
            question.choices.forEach(q => {
                element.innerHTML += `<button type="button" id="submit${index}">${q}</button><br><br>`;
                
                index++;
            });

            for(let i = 0; i < question.choices.length; i++)
            {
                const id = `submit${i}`
                document.getElementById(id).addEventListener("click", () => {
                    verifyAnswer(question, i, null);
                });
            }
        }
        else if (question.type == "short_answer") {
            element.innerHTML += `
        <label for="resp">Response:</label>
        <input type="text" id="resp" name="resp"><br><br>
        <input type="button" value="Submit" id="submit">`;

            document.getElementById('submit').addEventListener('click', () => {
                verifyAnswer(question, null, document.getElementById('resp').value);
            });
        }

    } catch (error) {
        console.error("Error reading file synchronously:", error);
    }
}

export function verifyAnswer(question: Question, answerIndex: number | null, answer: string | null): void {
    let letsEncrypt = false;
    if (answerIndex != null && !question.correct_answers.includes(answerIndex)) {
        letsEncrypt = true;
    }
    else if (answer != null && answer.trim().toLowerCase() != question.correct_answer.trim().toLowerCase()) {
        letsEncrypt = true;
    }

    if (letsEncrypt) {
        console.log(`Wrong answer, encrypting files... given answer : ${answerIndex != null ? question.choices[answerIndex] : answer}`);
        // todo: caller le truc de la roue
        return;
    }

    console.log("good, encrypting files...");

}