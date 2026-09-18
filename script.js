const API_URL = "https://test-blog-api.d18909156.workers.dev";


// -------------------------
// ЗАГРУЗКА СТАТЕЙ
// -------------------------

async function loadArticles() {

    try {

        const response =
            await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
            throw new Error("Не удалось загрузить статьи");
        }

        const articles =
            await response.json();

        return articles;

    } catch (error) {

        console.error("Ошибка загрузки статей:", error);

        return [];
    }
}

// -------------------------
// ЗАГРУЗКА ИНФОРМАЦИИ О САЛЛИ
// -------------------------

async function loadAbout() {

    try {

        const response =
            await fetch(`${API_URL}/api/about`);

        if (!response.ok) {
            throw new Error("Не удалось загрузить информацию о Салли");
        }

        const about =
            await response.json();

        const aboutTitle =
            document.getElementById("about-title");

        const aboutText =
            document.getElementById("about-text");

        if (aboutTitle) {
            aboutTitle.textContent =
                about.about_title || "";
        }

        if (aboutText) {
            aboutText.textContent =
                about.about_text || "";
        }

    } catch (error) {

        console.error(
            "Ошибка загрузки информации о Салли:",
            error
        );

    }
}
// -------------------------
// ГЛАВНАЯ СТРАНИЦА
// -------------------------

async function renderHomePage() {

    const postsList =
        document.getElementById("posts-list");

    if (!postsList) {
        return;
    }

    const articles =
        await loadArticles();

    postsList.innerHTML = "";

    if (!articles.length) {

        postsList.innerHTML = `
            <p>Пока нет опубликованных записей.</p>
        `;

        return;
    }

    articles.forEach(article => {

        const post =
            document.createElement("article");

        post.className = "post";

        post.innerHTML = `

            ${
                article.image
                    ? `
                        <a
                            href="article.html?id=${article.id}"
                            class="post-image"
                        >
                            <img
                                src="${article.image}"
                                alt="${article.title}"
                            >
                        </a>
                    `
                    : ""
            }

            <div class="post-content">

                <p class="date">
                    ${article.date}
                </p>

                <h2>
                    <a href="article.html?id=${article.id}">
                        ${article.title}
                    </a>
                </h2>

                ${
                    article.excerpt
                        ? `
                            <p>
                                ${article.excerpt}
                            </p>
                        `
                        : ""
                }

                <a
                    href="article.html?id=${article.id}"
                    class="read-more"
                >
                    Читать →
                </a>

            </div>
        `;

        postsList.appendChild(post);

    });
}


// -------------------------
// СТРАНИЦА СТАТЬИ
// -------------------------

async function renderArticlePage() {

    const articleContainer =
        document.getElementById("article");

    if (!articleContainer) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const articleId =
        params.get("id");

    if (!articleId) {

        articleContainer.innerHTML = `
            <h1>Статья не найдена</h1>

            <a href="index.html">
                Вернуться на главную
            </a>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/articles/${articleId}`
            );

        if (!response.ok) {
            throw new Error("Статья не найдена");
        }

        const article =
            await response.json();


        // -------------------------
        // SEO
        // -------------------------

        document.title =
            `${article.title} — Салли`;


        // Description

        const description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (description) {

            description.setAttribute(
                "content",
                article.excerpt ||
                `История о Салли: ${article.title}`
            );
        }


        // Open Graph

        const ogTitle =
            document.querySelector(
                'meta[property="og:title"]'
            );

        const ogDescription =
            document.querySelector(
                'meta[property="og:description"]'
            );

        const ogImage =
            document.querySelector(
                'meta[property="og:image"]'
            );


        if (ogTitle) {

            ogTitle.setAttribute(
                "content",
                article.title
            );
        }


        if (ogDescription) {

            ogDescription.setAttribute(
                "content",
                article.excerpt ||
                `История о Салли: ${article.title}`
            );
        }


        if (ogImage) {

            ogImage.setAttribute(
                "content",
                new URL(
                    article.image || "sally.jpg",
                    window.location.href
                ).href
            );
        }


        // Twitter

        const twitterTitle =
            document.querySelector(
                'meta[name="twitter:title"]'
            );

        const twitterDescription =
            document.querySelector(
                'meta[name="twitter:description"]'
            );

        const twitterImage =
            document.querySelector(
                'meta[name="twitter:image"]'
            );


        if (twitterTitle) {

            twitterTitle.setAttribute(
                "content",
                article.title
            );
        }


        if (twitterDescription) {

            twitterDescription.setAttribute(
                "content",
                article.excerpt ||
                `История о Салли: ${article.title}`
            );
        }


        if (twitterImage) {

            twitterImage.setAttribute(
                "content",
                new URL(
                    article.image || "sally.jpg",
                    window.location.href
                ).href
            );
        }


        // -------------------------
        // STRUCTURED DATA
        // -------------------------

        const schema =
            document.getElementById(
                "article-schema"
            );

        if (schema) {

            const schemaData = {

                "@context":
                    "https://schema.org",

                "@type":
                    "BlogPosting",

                "headline":
                    article.title,

                "description":
                    article.excerpt || "",

                "image": [

                    new URL(
                        article.image || "sally.jpg",
                        window.location.href
                    ).href

                ],

                "datePublished":
                    article.created_at ||
                    article.date,

                "dateModified":
                    article.created_at ||
                    article.date,

                "author": {

                    "@type":
                        "Person",

                    "name":
                        "Салли"
                }
            };

            schema.textContent =
                JSON.stringify(schemaData);
        }


        // -------------------------
        // САМА СТАТЬЯ
        // -------------------------

        articleContainer.innerHTML = `

            <div class="article-header">

                <p class="eyebrow">
                    ${article.date}
                </p>

                <h1>
                    ${article.title}
                </h1>

            </div>


            ${
                article.image
                    ? `
                        <img
                            class="article-image"
                            src="${article.image}"
                            alt="${article.title}"
                        >
                    `
                    : ""
            }


            <div class="article-text">

                ${article.content}

            </div>


            <a
                href="index.html#posts"
                class="back-link"
            >
                ← Все записи
            </a>

        `;

    } catch (error) {

        console.error(
            "Ошибка загрузки статьи:",
            error
        );

        articleContainer.innerHTML = `

            <h1>
                Статья не найдена
            </h1>

            <a href="index.html">
                Вернуться на главную
            </a>

        `;
    }
}


// -------------------------
// ЗАПУСК
// -------------------------

loadAbout();

renderHomePage();

renderArticlePage();