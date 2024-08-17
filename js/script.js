document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    initializeTheme();
    loadTranslations();
    loadArticles();
    startClock();
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('checkbox').checked = savedTheme === 'dark';
    }

    document.getElementById('checkbox').addEventListener('change', switchTheme);
}

function switchTheme(event) {
    const theme = event.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

let currentLanguage = 'en'; // 默认语言为英语

function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        document.getElementById('language-select').value = savedLanguage;
    } else {
        currentLanguage = 'en';
    }
}

function switchLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('language', language);
    loadTranslations();
    loadArticles();
    startClock();  // 重新启动时钟以使用新语言格式
}

function loadTranslations() {
    fetch('data/translations.json')
        .then(response => response.json())
        .then(data => {
            const translations = data[currentLanguage];
            if (translations) {
                document.getElementById('subtitle').textContent = translations.subtitle;
                document.getElementById('mission-statement').textContent = translations.mission;
            } else {
                console.error(`Translation for language ${currentLanguage} not found.`);
            }
        })
        .catch(error => console.error('Error loading translations:', error));
}

let timeInterval;

function startClock() {
    if (timeInterval) clearInterval(timeInterval);
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
}

function updateTime() {
    fetch('data/translations.json')
        .then(response => response.json())
        .then(data => {
            const translations = data[currentLanguage];
            if (translations) {
                const date = new Date();
                const day = date.getDate();
                const month = translations.monthNames[date.getMonth()];
                const weekday = translations.dayNames[date.getDay()];
                const year = date.getFullYear();
                const suffix = (day > 3 && day < 21) ? 'th' : ['st', 'nd', 'rd', 'th'][Math.min(day % 10, 4)];

                document.getElementById('time').textContent = `${weekday} ${day}${suffix}, ${month} ${year}`;
            }
        })
        .catch(error => console.error('Error updating time:', error));
}

function loadArticles() {
    const articles = [
        { file: 'world_currency.json', folder: 'articles' },
        { file: 'ai_investment.json', folder: 'articles' },
        { file: 'japan_trip.json', folder: 'articles' }
    ];

    const articlesSection = document.getElementById('articles-section');
    articlesSection.innerHTML = '';

    articles.forEach(article => {
        const path = `${article.folder}/${article.file}`;
        fetch(path)
            .then(response => response.json())
            .then(data => {
                const content = data[currentLanguage];
                const articleElement = document.createElement('article');
                articleElement.classList.add('the-grid');

                // 使用相对路径和正确的 URL 参数
                const articleLink = `./page_templates/article-template.html?file=${encodeURIComponent(article.file)}&lang=${encodeURIComponent(currentLanguage)}`;

                articleElement.innerHTML = `
                    <div class="the-grid-content">
                        <div class="headline">
                            <a href="${articleLink}">
                                <h2 class="title">${content.title}</h2>
                                <figure>
                                    <img alt="${content.title}" src="${content.image}"/>
                                </figure>
                            </a>
                        </div>
                        <p>${content.content}</p>
                        <div class="button">
                            <a href="${articleLink}">Read More</a>
                        </div>
                    </div>
                `;

                articlesSection.appendChild(articleElement);
            })
            .catch(error => console.error('Error loading article:', error));
    });
}