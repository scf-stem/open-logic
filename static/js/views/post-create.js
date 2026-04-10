// Post Create View Logic

const t = (key, fallback, vars) => window.appT(key, fallback, vars);

function showPostMessage(form, message, isError = true) {
    const existing = form.querySelector('.auth-msg-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = `feedback-banner auth-msg-banner ${isError ? 'error' : 'success'}`;
    banner.innerText = message;

    const submitBtn = form.querySelector('.btn-group');
    form.insertBefore(banner, submitBtn);
}

document.getElementById('postForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const tags = document.getElementById('tags').value;

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    if (!title) {
        showPostMessage(this, t('create.missing_title'), true);
        return;
    }

    if (!content) {
        showPostMessage(this, t('create.missing_content'), true);
        return;
    }
    
    if (!tags) {
        showPostMessage(this, t('create.missing_tag'), true);
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.dataset.defaultLabel = originalText;
        submitBtn.innerText = t('create.publish_loading');

        let token = '';
        const userJsonStr = localStorage.getItem('osi_user');
        if (userJsonStr) {
            try {
                const user = JSON.parse(userJsonStr);
                token = user.token || ''; // Attempt to grab token if it exists
            } catch (e) {}
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ title, content, tags })
        });

        if (!response.ok) {
            if (response.status === 401) {
                showPostMessage(this, t('create.auth_required'));
                setTimeout(() => window.location.href = '/login', 1500);
                return;
            }
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP error! status: ${response.status}`);
        }

        showPostMessage(this, t('create.publish_success'), false);
        setTimeout(() => {
            window.location.href = '/#posts';
        }, 1200);

    } catch (error) {
        showPostMessage(this, t('create.publish_failed', '', { message: error.message || t('common.load_failed_retry') }));
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerText = originalText;
        console.error(error);
    }
});
