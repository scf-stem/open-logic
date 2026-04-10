const t = (key, fallback, vars) => window.appT(key, fallback, vars);

document.addEventListener('DOMContentLoaded', async () => {
    const userStr = localStorage.getItem('osi_user');
    if (!userStr) {
        window.location.href = '/login';
        return;
    }
    const user = JSON.parse(userStr);

    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileAvatar').textContent = user.username[0].toUpperCase();
    if (user.created_at) {
        document.getElementById('profileDate').textContent = t('profile.joined_on', '', {
            date: new Date(user.created_at).toLocaleDateString(window.APP_UI_LOCALE || 'en')
        });
    }

    await loadUserPosts(user.id);
});

async function loadUserPosts(userId) {
    const container = document.getElementById('userPosts');
    try {
        const result = await api.get(`/api/posts?user_id=${userId}`);
        const posts = result.data;

        document.getElementById('postCount').textContent = posts.length;

        if (posts.length === 0) {
            container.innerHTML = `<div class="profile-empty">${t('profile.empty')}</div>`;
            return;
        }

        container.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'profile-post';
            card.onclick = () => window.location.href = `/post/${post.id}`;

            const aiBadge = post.has_ai ? '🤖 1' : '0';

            card.innerHTML = `
                <div class="profile-post__meta">
                    <span class="tag">#${post.tags && post.tags.length > 0 ? post.tags[0] : t('common.general')}</span>
                    <span class="profile-post__stats">${post.created_at}</span>
                </div>
                <h3 class="profile-post__title">${post.title}</h3>
                <div class="profile-post__footer">
                    <div class="profile-post__stats">
                        <span>💬 ${t('profile.comments')} ${post.comments_count} (${aiBadge})</span>
                        <span>👍 ${t('profile.likes')} ${post.likes || 0}</span>
                    </div>
                    <button class="btn btn-outline btn-sm profile-post__delete delete-btn" data-id="${post.id}">${t('profile.delete')}</button>
                </div>
            `;

            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm(t('profile.delete_confirm'))) {
                    await deletePost(post.id);
                }
            };

            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="profile-empty">${t('profile.load_failed')}</div>`;
    }
}

async function deletePost(postId) {
    try {
        await api.delete(`/api/posts/${postId}`);
        alert(t('profile.delete_success'));
        const userStr = localStorage.getItem('osi_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            loadUserPosts(user.id);
        }
    } catch (error) {
        alert(t('profile.delete_failed', '', { message: error.message }));
    }
}
