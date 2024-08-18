// article-script.js

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.addEventListener('DOMContentLoaded', () => {
    const selectedLanguage = getQueryParameter('lang') || localStorage.getItem('language') || 'en';
    const articleFile = getQueryParameter('file');

    if (!articleFile) {
        console.error('No article file specified in the URL.');
        return;
    }

    articleLoadHeaderTranslations(selectedLanguage);
    initializeTheme();
    articleLoadContent(articleFile, selectedLanguage);

    // 设置语言选择器的值为当前语言
    document.getElementById('language-select').value = selectedLanguage;

    // 添加语言切换的事件处理
    document.getElementById('language-select').addEventListener('change', (event) => {
        const newLanguage = event.target.value;
        localStorage.setItem('language', newLanguage);
        articleLoadHeaderTranslations(newLanguage);
        articleLoadContent(articleFile, newLanguage);

        // 更新 URL 中的语言参数
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLanguage);
        window.history.pushState({}, '', url);
    });
});

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function articleLoadHeaderTranslations(language) {
    fetch('../data/translations.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const translations = data[language];
            if (translations) {
                document.getElementById('subtitle').textContent = translations.subtitle;
                document.getElementById('mission-statement').textContent = translations.mission;
            } else {
                console.error(`Translation for language ${language} not found.`);
            }
        })
        .catch(error => console.error('Error loading translations:', error));
}

function articleLoadContent(file, language) {
    fetch(`../articles/${file}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const content = data[language];
            if (content) {
                const articleSection = document.getElementById('article-content');
                if (articleSection) {
                    articleSection.innerHTML = `
                        <article class="article_grid">
                            <div class="article_grid_content">
                                <h2 class="article_title">${content.title}</h2>
                                <figure class="article_figure">
                                    <img class="article_img" src="${content.image}" alt="${content.title}">
                                    <figcaption class="article_figcaption">${content.imageSourceText} - <a href="${content.imageSource}" target="_blank">${content.imageSource}</a></figcaption>
                                </figure>
                                <p class="article_content">${content.content}</p>
                                <div class="article_divider"><span></span></div>
                                <div class="article_text">
                                    <p>${content.article_text.replace(/\n/g, '</p><p>').replace(/\\lb/g, '<b>').replace(/\\rb/g, '</b>').replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\\pagebreak/g, '<div class="article_divider"><span></span></div>')}</p>
                                </div>
                            </div>
                        </article>
                    `;
                } else {
                    console.error('Element with ID "article-content" not found.');
                }
            } else {
                console.error(`Content for language ${language} not found in the article file.`);
            }
        })
        .catch(error => console.error('Error loading article content:', error));
}

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
