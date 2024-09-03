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

                // Determine the correct suffix
                let suffix = 'th';
                if (day % 10 === 1 && day !== 11) {
                    suffix = 'st';
                } else if (day % 10 === 2 && day !== 12) {
                    suffix = 'nd';
                } else if (day % 10 === 3 && day !== 13) {
                    suffix = 'rd';
                }

                document.getElementById('time').textContent = `${weekday} ${day}, ${month} ${year}`;
            }
        })
        .catch(error => console.error('Error updating time:', error));
}

function loadArticles() {
    const articles = [
        { file: 'world_currency.json', folder: 'articles' },
        { file: 'ai_3d_framework.json', folder: 'articles' },
        { file: 'beyond_bancor.json', folder: 'articles' },
        { file: 'global_energy.json', folder: 'articles' },
        { file: 'japan_trip.json', folder: 'articles' }
    ];

    const articlesSection = document.getElementById('articles-section');
    articlesSection.innerHTML = '';

    // 更新后的 translations.json 路径
    fetch('./data/translations.json')
        .then(response => response.json())
        .then(translations => {
            const readMoreText = translations[currentLanguage]?.readMore || "Read More";

            const articlePromises = articles.map(article => {
                const path = `${article.folder}/${article.file}`;
                return fetch(path)
                    .then(response => response.json())
                    .then(data => ({ article, content: data[currentLanguage] }));
            });

            Promise.all(articlePromises)
                .then(results => {
                    results.forEach(({ article, content }) => {
                        const articleElement = document.createElement('article');
                        articleElement.classList.add('the-grid');

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
                                    <a href="${articleLink}">${readMoreText}</a> <!-- 使用翻译后的 "Read More" 文本 -->
                                </div>
                            </div>
                        `;

                        articlesSection.appendChild(articleElement);
                    });
                })
                .catch(error => console.error('Error loading articles:', error));
        })
        .catch(error => console.error('Error loading translations:', error));
}