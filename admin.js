const form = document.getElementById("article-form");
const message = document.getElementById("message");
const editor = document.getElementById("content");
const articlesList = document.getElementById("articles-list");

const API_URL = "https://test-blog-api.d18909156.workers.dev";

let editingArticleId = null;


// =========================
// ФОРМАТИРОВАНИЕ
// =========================

function formatText(command, value = null) {
    editor.focus();
    document.execCommand(command, false, value);
}


// =========================
// ССЫЛКА
// =========================

function addLink() {
    editor.focus();

    const url = prompt("Вставь URL ссылки:");

    if (url) {
        document.execCommand("createLink", false, url);
    }
}


// =========================
// ПОЛУЧИТЬ ПАРОЛЬ
// =========================

function getAdminSecret() {
    return document.getElementById("admin-secret").value.trim();
}
// =========================
// О САЛЛИ
// =========================

async function loadAbout() {

    try {

        const response = await fetch(
            `${API_URL}/api/about`
        );

        if (!response.ok) {
            throw new Error(
                "Не удалось загрузить информацию о Салли"
            );
        }

        const about = await response.json();

        const aboutTitle =
            document.getElementById("about-title");

        const aboutText =
            document.getElementById("about-text");

        const aboutImage =
            document.getElementById("about-image");


        // Заголовок
        if (aboutTitle) {
            aboutTitle.value =
                about.about_title || "";
        }


        // Текст
        if (aboutText) {
            aboutText.value =
                about.about_text || "";
        }


        // Изображение
        if (aboutImage) {
            aboutImage.value =
                about.about_image || "";
        }


    } catch (error) {

        console.error(
            "LOAD ABOUT ERROR:",
            error
        );

    }
}


async function saveAbout() {

    const aboutTitle =
        document.getElementById("about-title").value.trim();

    const aboutText =
        document.getElementById("about-text").value.trim();

    const aboutImage =
        document.getElementById("about-image").value.trim();

    const aboutMessage =
        document.getElementById("about-message");

    const adminSecret =
        getAdminSecret();


    if (!aboutTitle || !aboutText) {

        aboutMessage.textContent =
            "Заполни заголовок и текст.";

        return;
    }


    if (!adminSecret) {

        aboutMessage.textContent =
            "Введи пароль администратора.";

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/about`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${adminSecret}`
                },

                body: JSON.stringify({
                    about_title: aboutTitle,
                    about_text: aboutText,
                    about_image: aboutImage
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                `Ошибка сохранения (${response.status})`
            );
        }


        aboutMessage.textContent =
            "Информация о Салли сохранена.";

    } catch (error) {

        console.error("SAVE ABOUT ERROR:", error);

        aboutMessage.textContent =
            "Ошибка: " + error.message;
    }
}


document
    .getElementById("save-about")
    .addEventListener("click", saveAbout);

// =========================
// ЗАГРУЗИТЬ СПИСОК СТАТЕЙ
// =========================

async function loadArticles() {

    if (!articlesList) {
        return;
    }

    articlesList.innerHTML = "<p>Загрузка...</p>";

    try {

        const response = await fetch(
            `${API_URL}/api/articles`
        );

        if (!response.ok) {
            throw new Error(
                `Не удалось загрузить статьи (${response.status})`
            );
        }

        const articles = await response.json();

        if (!Array.isArray(articles)) {
            throw new Error("Сервер вернул неверный формат данных");
        }

        if (articles.length === 0) {

            articlesList.innerHTML =
                "<p>Пока нет опубликованных статей.</p>";

            return;
        }

        articlesList.innerHTML = articles.map(article => {

            return `
                <div class="admin-article">

                    <div>
                        <p class="date">
                            ${escapeHtml(article.date || "")}
                        </p>

                        <h3>
                            ${escapeHtml(article.title || "Без названия")}
                        </h3>
                    </div>

                    <div class="admin-article-actions">

                        <button
                            type="button"
                            onclick="editArticle(${article.id})"
                        >
                            ✏️ Редактировать
                        </button>

                        <button
                            type="button"
                            onclick="deleteArticle(${article.id})"
                        >
                            🗑️ Удалить
                        </button>

                    </div>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error("LOAD ARTICLES ERROR:", error);

        articlesList.innerHTML = `
            <p>
                Не удалось загрузить статьи.
            </p>
        `;
    }
}


// =========================
// ЭКРАНИРОВАНИЕ ТЕКСТА
// =========================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================
// РЕДАКТИРОВАТЬ СТАТЬЮ
// =========================

async function editArticle(id) {

    try {

        const response = await fetch(
            `${API_URL}/api/articles/${id}`
        );

        if (!response.ok) {
            throw new Error(
                `Не удалось загрузить статью (${response.status})`
            );
        }

        const article = await response.json();

        editingArticleId = id;

        document.getElementById("title").value =
            article.title || "";

        document.getElementById("excerpt").value =
            article.excerpt || "";

        document.getElementById("image").value =
            article.image || "";

        editor.innerHTML =
            article.content || "";

        // Сохраняем существующую дату.
        // При редактировании поле даты можно оставить пустым.
        document.getElementById("date").value = "";

        document.querySelector(".admin h1").textContent =
            "Редактировать статью";

        const submitButton =
            form.querySelector('button[type="submit"]');

        submitButton.textContent =
            "Сохранить изменения";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error("EDIT ERROR:", error);

        message.textContent =
            "Ошибка: " + error.message;
    }
}


// =========================
// УДАЛИТЬ СТАТЬЮ
// =========================

async function deleteArticle(id) {

    const confirmed = confirm(
        "Удалить эту статью?\n\nЭто действие нельзя отменить."
    );

    if (!confirmed) {
        return;
    }

    const adminSecret = getAdminSecret();

    if (!adminSecret) {

        message.textContent =
            "Сначала введи пароль администратора.";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/articles/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${adminSecret}`
                }
            }
        );

        const text = await response.text();

        let result = {};

        try {
            result = JSON.parse(text);
        } catch {
            result = {
                error: text
            };
        }

        if (!response.ok) {

            throw new Error(
                result.error ||
                `Ошибка удаления (${response.status})`
            );
        }

        message.textContent =
            "Статья удалена.";

        await loadArticles();

    } catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        message.textContent =
            "Ошибка удаления: " +
            error.message;
    }
}


// =========================
// СБРОС ФОРМЫ
// =========================

function resetForm() {

    editingArticleId = null;

    form.reset();

    editor.innerHTML = "";

    document.querySelector(".admin h1").textContent =
        "Новая статья";

    const submitButton =
        form.querySelector('button[type="submit"]');

    submitButton.textContent =
        "Опубликовать";
}


// =========================
// СОХРАНИТЬ / ОПУБЛИКОВАТЬ
// =========================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const title =
            document.getElementById("title")
                .value
                .trim();

        const date =
            document.getElementById("date")
                .value;

        const excerpt =
            document.getElementById("excerpt")
                .value
                .trim();

        const image =
            document.getElementById("image")
                .value
                .trim();

        const content =
            editor.innerHTML;

        const adminSecret =
            getAdminSecret();


        // Проверка текста

        if (!editor.innerText.trim()) {

            message.textContent =
                "Напиши текст статьи.";

            return;
        }


        // Проверка пароля

        if (!adminSecret) {

            message.textContent =
                "Введи пароль администратора.";

            return;
        }


        // Дата обязательна только для новой статьи

        if (!editingArticleId && !date) {

            message.textContent =
                "Выбери дату.";

            return;
        }


        let articleDate = date;


        // Если редактируем статью
        // и дата не указана — сохраняем старую

        if (editingArticleId && !date) {

            try {

                const existingResponse =
                    await fetch(
                        `${API_URL}/api/articles/${editingArticleId}`
                    );

                if (!existingResponse.ok) {

                    throw new Error(
                        "Не удалось получить статью"
                    );
                }

                const existingArticle =
                    await existingResponse.json();

                articleDate =
                    existingArticle.date;

            } catch (error) {

                console.error(
                    "DATE ERROR:",
                    error
                );

                message.textContent =
                    "Не удалось получить дату статьи.";

                return;
            }

        } else if (date) {

            articleDate =
                new Date(date).toLocaleDateString(
                    "ru-RU",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );
        }


        // Данные статьи

        const article = {

            title: title,

            date: articleDate,

            image: image,

            excerpt: excerpt,

            content: content
        };


        try {

            let response;


            // =========================
            // РЕДАКТИРОВАНИЕ
            // =========================

            if (editingArticleId) {

                response = await fetch(
                    `${API_URL}/api/articles/${editingArticleId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${adminSecret}`
                        },

                        body:
                            JSON.stringify(article)
                    }
                );


            // =========================
            // НОВАЯ СТАТЬЯ
            // =========================

            } else {

                response = await fetch(
                    `${API_URL}/api/articles`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${adminSecret}`
                        },

                        body:
                            JSON.stringify(article)
                    }
                );
            }


            const text =
                await response.text();

            let result = {};

            try {
                result = JSON.parse(text);
            } catch {
                result = {
                    error: text
                };
            }


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    `Ошибка сохранения (${response.status})`
                );
            }


            // Сообщение

            if (editingArticleId) {

                message.textContent =
                    "Изменения сохранены.";

            } else {

                message.textContent =
                    "Статья опубликована!";
            }


            // Сбрасываем форму

            resetForm();


            // Обновляем список

            // Ставим сегодняшнюю дату при открытии админки
const dateInput = document.getElementById("date");

const today = new Date();

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

dateInput.value = `${year}-${month}-${day}`;

loadArticles();


        } catch (error) {

            console.error(
                "SAVE ERROR:",
                error
            );

            message.textContent =
                "Ошибка: " +
                error.message;
        }

    }
);


// =========================
// ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА
// =========================

loadAbout();
loadArticles();