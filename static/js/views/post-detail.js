// Post Detail Interactions

const t = (key, fallback, vars) => window.appT(key, fallback, vars);

function getAuthHeader() {
    let token = '';
    const userJsonStr = localStorage.getItem('osi_user');
    if (userJsonStr) {
        try {
            const user = JSON.parse(userJsonStr);
            token = user.token || '';
        } catch (e) {}
    }
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    const postId = pathParts[pathParts.length - 1];

    if (postId) {
        loadPostDetail(postId);
    }
});

async function loadPostDetail(postId) {
    const container = document.querySelector('.detail-container');
    if (!container) return;

    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) throw new Error(t('post.load_failed'));
        
        const result = await response.json();
        const post = result.data;
        renderPostDetail(post, container);
    } catch (error) {
        console.error('Failed to load post:', error);
        container.innerHTML = `<div class="surface-panel detail-card">${t('post.load_failed')}</div>`;
    }
}

function renderPostDetail(post, container) {
    const aiComments = post.comments.filter(c => c.is_ai);
    const mainAiAnswer = aiComments.length > 0 ? aiComments[0] : null;
    const aiReplies = aiComments.length > 1 ? aiComments.slice(1) : [];
    const discussionComments = [...post.comments.filter(c => !c.is_ai), ...aiReplies].sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at);
    });

    let html = `
        <article class="surface-panel detail-card tech-card">
            <div class="detail-meta post-meta">
                <span class="tag tech-tag">#${post.tags && post.tags.length > 0 ? post.tags[0] : t('common.general')}</span>
                <span class="detail-meta__author meta-text">${t('post.published_meta', '', { author: post.author, date: post.created_at })}</span>
            </div>
            
            <h1 class="detail-title post-title">${post.title}</h1>
            
            <div class="detail-body post-body">
                ${marked.parse(post.content)}
            </div>

            <div class="detail-actions action-bar">
                <button id="likeBtn" class="btn btn-outline" data-action="like-post" data-post-id="${post.id}">👍 ${t('post.like', '', { count: post.likes || 0 })}</button>
                <button class="btn btn-outline" data-action="focus-reply">💬 ${t('post.comment')}</button>
            </div>
        </article>
    `;

    if (mainAiAnswer) {
        const aiAnswer = mainAiAnswer;
        html += `
        <div class="surface-panel ai-answer ai-card">
            <div class="ai-answer__header ai-header">
                <div class="ai-answer__badge ai-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    ${t('post.ai_route')}
                </div>
                <span class="ai-answer__meta meta-text">${t('post.generated_now')}</span>
            </div>
            
            <div class="ai-answer__content ai-content">
                ${marked.parse(aiAnswer.content)}
            </div>
            
            <div class="ai-answer__feedback ai-feedback">
                <span class="ai-answer__prompt">${t('post.helpful_prompt')}</span>
                <button class="btn btn-outline btn-sm">👍 ${t('common.yes')}</button>
                <button class="btn btn-outline btn-sm">👎 ${t('common.no')}</button>
            </div>
        </div>
        `;
    }

    html += `<h3 class="section-title">${t('post.discussion_count', '', { count: discussionComments.length })}</h3>
             <div class="surface-panel discussion-card tech-card">
                 <div class="comment-list">`;

    if (discussionComments.length === 0) {
        html += `<p class="discussion-empty">${t('post.no_discussion')}</p>`;
    } else {
        discussionComments.forEach(comment => {
            const isAi = comment.is_ai;
            html += `
            <div class="discussion-item comment-item">
                <div class="discussion-item__meta comment-header">
                    <div class="discussion-item__author user-wrap">
                        <div class="discussion-item__avatar avatar-sm ${isAi ? 'discussion-item__avatar--ai' : ''}">
                            ${isAi ? '🤖' : comment.author[0]}
                        </div>
                        <span class="discussion-item__name comment-author">${isAi ? t('post.ai_interactive') : comment.author}</span>
                    </div>
                    <span class="discussion-item__time comment-time">${comment.created_at}</span>
                </div>
                <div class="discussion-item__content comment-text">
                    ${isAi ? marked.parse(comment.content) : comment.content.replace(/\n/g, '<br>')}
                </div>
            </div>
            `;
        });
    }
    html += `    </div>
             </div>`;

    html += `
        <div class="surface-panel reply-card tech-card">
            <h4 class="reply-card__title section-title">${t('post.reply_title')}</h4>
            <textarea id="replyContent" class="reply-input reply-area" rows="4" placeholder="${t('post.reply_placeholder')}"></textarea>
            <div class="reply-card__actions">
                <button class="btn btn-primary" data-action="submit-reply" data-post-id="${post.id}">${t('post.reply_submit')}</button>
            </div>
        </div>
    `;

    container.innerHTML = html;
    bindDiscussionActions(container);
}

function bindDiscussionActions(container) {
    container.querySelector('[data-action="like-post"]')?.addEventListener('click', (event) => {
        const button = event.currentTarget;
        likePost(button.dataset.postId);
    });

    container.querySelector('[data-action="focus-reply"]')?.addEventListener('click', () => {
        container.querySelector('#replyContent')?.focus();
    });

    container.querySelector('[data-action="submit-reply"]')?.addEventListener('click', (event) => {
        const button = event.currentTarget;
        submitReply(button.dataset.postId);
    });
}

async function submitReply(postId) {
    const content = document.getElementById('replyContent').value;
    if (!content) return alert(t('post.reply_empty'));

    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error(t('common.load_failed_retry'));
        }

        // alert('提交成功'); <-- Skipping native alert in favor of quiet reload or minimal UI
        loadPostDetail(postId); // Reload
    } catch (error) {
        alert(t('post.reply_failed', '', { message: error.message }));
    }
}

async function likePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) window.location.href = '/login';
            throw new Error('Action failed');
        }

        const result = await response.json();
        const btn = document.getElementById('likeBtn');
        btn.innerHTML = `👍 ${t('post.like', '', { count: result.likes })}`;
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-outline');
    } catch (error) {
        console.error(error);
    }
}
