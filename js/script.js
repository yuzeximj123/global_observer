// 时间显示功能
function checkTime() {
    var date = new Date();
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var day = date.getDate();
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var month = monthNames[date.getMonth()];
    var weekday = dayNames[date.getDay()];
    var year = date.getFullYear();
    var suffix = (day > 3 && day < 21) ? 'th' : ['st', 'nd', 'rd', 'th'][Math.min(day % 10, 4)];
    document.getElementById('time').innerHTML = `${weekday} ${day}${suffix}, ${month} ${year}`;
}
setInterval(checkTime, 1000);

// 黑夜模式切换功能
const toggleSwitch = document.querySelector('.dark_mode_switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

toggleSwitch.addEventListener('change', function (e) {
    const theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// 语言切换功能
let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    loadTranslations();
    loadArticles();
    checkTime();
});

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
            // document.getElementById('page-title').textContent = translations.title;
            document.getElementById('subtitle').textContent = translations.subtitle;
            document.getElementById('mission-statement').textContent = translations.mission;
        });
}

function loadArticles() {
    fetch('data/articles.json')
        .then(response => response.json())
        .then(data => {
            const articlesSection = document.getElementById('articles-section');
            articlesSection.innerHTML = ''; // 清空现有内容
            const articles = data[currentLanguage].articles;
            articles.forEach(article => {
                const articleElement = document.createElement('article');
                articleElement.classList.add('the-grid');

                const articleLink = `./articles/article-template.html?image=${encodeURIComponent(article.image)}&title=${encodeURIComponent(article.title)}&content=${encodeURIComponent(article.content)}`;

                articleElement.innerHTML = `
                    <div class="the-grid-content">
                        <div class="headline">
                            <a href="${articleLink}">
                                <h2 class="title">${article.title}</h2>
                                <figure>
                                    <img alt="${article.title}" src="${article.image}"/>
                                </figure>
                            </a>
                        </div>
                        <p>${article.content}</p>
                        <div class="button">
                            <a href="${articleLink}">${article.linkText}</a>
                        </div>
                    </div>
                `;

                articlesSection.appendChild(articleElement);
            });
        });
}
