import './index.css';

console.log(window.rats);

document.getElementById('minimize')?.addEventListener('click', () => {
    window.electronAPI.minimize();
});

document.getElementById('maximize')?.addEventListener('click', () => {
    window.electronAPI.maximize();
});

document.getElementById('close')?.addEventListener('click', () => {
    window.electronAPI.close();
});


const element = document.getElementById('content');
console.log('Searching for element with id "content"...');
if (element) {
    console.log('Element found:', element);
}

export function addNavBar() {
    if (!window.rats.isQuestionning) {
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
