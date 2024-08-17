// article-script.js

// 读取从index页面传递的URL参数
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

document.addEventListener('DOMContentLoaded', () => {
    const articleImage = getQueryParameter('image');
    const articleTitle = getQueryParameter('title');
    const articleContent = getQueryParameter('content');

    const articleSection = document.getElementById('article-content');

    // 创建文章内容并插入到页面
    articleSection.innerHTML = `
        <article class="the-grid">
            <div class="the-grid-content">
                <h2 class="title">${articleTitle}</h2>
                <figure>
                    <img src="${articleImage}" alt="${articleTitle}">
                </figure>
                <p>${articleContent}</p>
            </div>
        </article>
    `;
});
