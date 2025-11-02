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
    if (!window.rats.isTimerLaunch) {
        document.body.insertAdjacentHTML('afterbegin', `
    <nav class="navbar fixed-top navbar-dark navbar-expand bg-dark">
      <div class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
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
    const questionId = Math.floor(Math.random() * 11) + 1;

    try {
        const content: string = await (await fetch(`./questions/${questionId}.json`)).text();
        const question: Question = JSON.parse(content);

        const element = document.getElementById('question');

        function shuffleArray<T>(array: T[]): T[] {
            const arr = [...array]; // make a copy so original isn’t modified
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        if (window.rats.isTimerLaunch) {
            element.innerHTML += `<h3>${question.title}</h3><br>`;

            if (question.type == "multiple_choice") {

                const choicesWithIndex = question.choices.map((choice, idx) => ({ choice, idx }));
                const shuffledChoices = shuffleArray(choicesWithIndex);

                shuffledChoices.forEach(q => {
                    element.innerHTML += `<button type="button" id="submit${q.idx}">${q.choice}</button><br><br>`;
                });

                for (let i = 0; i < question.choices.length; i++) {
                    const item = shuffledChoices[i];
                    const id = `submit${item.idx}`
                    document.getElementById(id).addEventListener("click", () => {
                        verifyAnswer(question, item.idx, null);
                    });
                }
            }
            else if (question.type == "short_answer") {
                element.innerHTML += `
        <label for="resp">Response:</label>
        <input type="text" id="resp" name="resp"><br><br>
        <input type="button" type="submit" value="Submit" id="submit">`;

                document.getElementById('submit').addEventListener('click', () => {
                    verifyAnswer(question, null, document.getElementById('resp').value);
                });
            }

            document.getElementById("close").style.display = "none";
            document.getElementById("minimize").style.display = "none";
        }
        else {
            element.innerHTML += `<h1>Welcome to the rat community</h1><br>`;
            element.innerHTML += `<h4>You have no security tasks at the moment.</h4>`;
            element.innerHTML += `<img src="https://media1.tenor.com/m/zh1D_8taaNEAAAAd/i-miss-you.gif">`;
        }
    }
    catch (error) {
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
        console.log("good, encrypting files...");
        localStorage.setItem("goodAnswers", (parseInt(goodAnswers) + 1).toString());
        document.getElementById("question").style.display = "none";
        const yipee = document.getElementById("yipee");
        yipee.innerHTML += "<h3>Good job queen!</h3>";
        yipee.innerHTML += '<div id="bing"><img src="https://media1.tenor.com/m/pUNC06ehYBsAAAAC/erm-aksuali-veli.gif"></div>';
        document.getElementById("close").style.display = "inherit";
        document.getElementById("minimize").style.display = "inherit";
    }
    localStorage.setItem("totalAnswers", (parseInt(totalAnswers) + 1).toString());
}