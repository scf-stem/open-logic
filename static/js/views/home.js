// Home View Logic

document.addEventListener('DOMContentLoaded', () => {
    const t = (key, fallback, vars) => window.appT(key, fallback, vars);
    loadPosts('all');

    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadPosts(tab.dataset.tag);
        });
    });

    const modalTriggers = document.querySelectorAll('[data-action="open-code-runner"]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modal = document.getElementById('scf-code-runner-modal');
            if (modal) modal.style.display = 'flex';
        });
    });

    const el1 = document.getElementById('type-text-1');
    const el2 = document.getElementById('type-text-2');
    
    if (el1 && el2) {
        const text1 = t('home.line1');
        const text2 = t('home.line2');

        async function typeWriter(text, element) {
            for (let i = 0; i < text.length; i++) {
                element.textContent += text.charAt(i);
                await new Promise(r => setTimeout(r, 150));
            }
        }

        async function startTyping() {
            await new Promise(r => setTimeout(r, 2000));
            while (true) {
                el1.textContent = '\u200B';
                el2.textContent = '\u200B';

                await new Promise(r => setTimeout(r, 500));
                await typeWriter(text1, el1);
                await new Promise(r => setTimeout(r, 300)); 
                await typeWriter(text2, el2);
                await new Promise(r => setTimeout(r, 4000));
            }
        }

        startTyping();
    }
});

async function loadPosts(tag) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = `<div class="posts-empty-state">${window.appT('home.posts_loading')}</div>`;

    try {
        let url = '/api/posts';
        if (tag && tag !== 'all') {
            url += `?tag=${tag}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        renderPosts(result.data, container);

    } catch (error) {
        console.error('Failed to load posts:', error);
        container.innerHTML = `<div class="posts-empty-state">${window.appT('home.posts_load_failed')}</div>`;
    }
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderPosts(posts, container) {
    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = `<div class="posts-empty-state">${window.appT('home.posts_empty')}</div>`;
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'posts-feed__card';
        card.onclick = () => window.location.href = `/post/${post.id}`;

        const aiBadge = post.has_ai ? '🤖 1' : '0';
        const tag = post.tags && post.tags.length > 0 ? post.tags[0] : window.appT('common.general');
        const title = escapeHtml(post.title);
        const excerpt = escapeHtml(`${post.content.substring(0, 100)}...`);
        const author = escapeHtml(post.author);
        const createdAt = escapeHtml(post.created_at);

        card.innerHTML = `
            <div class="posts-feed__meta">
                <span class="tag">#${escapeHtml(tag)}</span>
                <span class="posts-feed__time">${createdAt}</span>
            </div>
            <h3 class="posts-feed__title">${title}</h3>
            <p class="posts-feed__excerpt">${excerpt}</p>
            <div class="posts-feed__footer">
                <div class="posts-feed__author-wrap">
                    <div class="posts-feed__avatar">${author[0] || 'U'}</div>
                    <span class="posts-feed__author">${author}</span>
                </div>
                <span class="posts-feed__stats">💬 ${post.comments_count} (${aiBadge})</span>
            </div>
        `;
        container.appendChild(card);
    });
}
