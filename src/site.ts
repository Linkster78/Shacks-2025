
import './index.css';
import * as fs from 'fs';

console.log(window.rats);

let isQuestionning: boolean = false;


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
          <li><a class="nav-item nav-link" href="src/sniff.html">Sniff Sniff😢</a></li>
          <li><a class="nav-item nav-link" href="src/stats.html">Statistics</a></li>
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
    correctAnswer: Int32Array;
}

export async function getRandomQuestion(): Promise<void> {
    const files = await window.rats.getFiles('src/questions');

    const randomNumber: number = Math.random() * files.length; // probably to change

    const filePath = files.at(randomNumber);

    try {
        const content: string = window.rats.readFile(filePath!);
        const question: Question = JSON.parse(content);

        const element = document.getElementById('question');
        element.innerHTML += `<h3>${question.title}</h3><br>`;

        if (question.type == "multiple_choice") {
            question.choices.forEach(q => {
                element.innerHTML += `<button type="button">${q}</button><br><br>`;
            });
        }
        else if (question.type == "short_answer") {
            element.innerHTML += `<label for="resp">Response:</label>
            <input type="text" id="resp" name="resp"><br><br>
            <input type="submit" value="Submit"><style>#resp
            {
                height:200px;
                font-size:14pt;
            }</style>`;
        }

    } catch (error) {
        console.error("Error reading file synchronously:", error);
    }

}