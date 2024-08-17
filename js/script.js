// script.js
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    initializeTheme();  // 初始化主题
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

                const articleLink = `./articles/article-template.html?image=${encodeURIComponent(content.image)}&title=${encodeURIComponent(content.title)}&content=${encodeURIComponent(content.content)}`;

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
