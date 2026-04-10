document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentUser = null;
    let currentLang = 'zh';

    // Elements
    const views = {
        'forum': document.getElementById('view-forum'),
        'post-detail': document.getElementById('view-post-detail'),
        'login': document.getElementById('view-login')
    };
    const langToggle = document.getElementById('lang-toggle');
    const loginBtn = document.getElementById('nav-login-btn');
    const newPostBtn = document.getElementById('new-post-btn');

    // I18N
    const translations = {
        'en': {
            'features': 'Features', 'about': 'About', 'community': 'Community',
            'login': 'Login / Register', 'logout': 'Logout',
            'hero_title': 'Community Forum', 'hero_subtitle': 'Ask questions, get AI answers, and learn together.',
            'new_post': 'New Post', 'back': 'Back',
            'post_title': 'Title', 'post_content': 'Content', 'submit': 'Submit',
            'login_title': 'Login', 'username': 'Username', 'password': 'Password', 'register': 'Register',
            'register_success': 'Registration successful! Please login.'
        },
        'zh': {
            'features': '功能特性', 'about': '关于我们', 'community': '社区',
            'login': '登录 / 注册', 'logout': '退出登录',
            'hero_title': '社区问答', 'hero_subtitle': '提问、获取 AI 解答，共同进步。',
            'new_post': '发布新帖', 'back': '返回',
            'post_title': '标题', 'post_content': '内容', 'submit': '提交',
            'login_title': '登录', 'username': '用户名', 'password': '密码', 'register': '注册',
            'register_success': '注册成功！请登录。', 'add_comment': '发表评论'
        }
    };

    function t(key) {
        return translations[currentLang][key] || key;
    }

    function updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        if (currentUser) {
            loginBtn.textContent = `${currentUser} (${t('logout')})`;
        } else {
            loginBtn.textContent = t('login');
        }
    }

    // Navigation
    function showView(viewName) {
        Object.values(views).forEach(el => el.style.display = 'none');
        if (views[viewName]) views[viewName].style.display = 'block';
    }

    // --- API Calls ---

    async function fetchPosts() {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        renderPosts(posts);
    }

    async function fetchPostDetail(id) {
        const res = await fetch(`/api/posts/${id}`);
        const post = await res.json();
        renderPostDetail(post);
        showView('post-detail');
    }

    async function login(username, password) {
        try {
            const res = await fetch('/api/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                currentUser = username;
                showView('forum');
                updateUI();
                fetchPosts();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (e) {
            console.error(e);
            alert('Network error during login');
        }
    }

    async function register(username, password) {
        try {
            const res = await fetch('/api/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t('register_success') || 'Registered! Please login.');
                showView('login');
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (e) {
            console.error(e);
            alert('Network error during registration');
        }
    }

    async function createPost(title, content) {
        if (!currentUser) return alert('Please login to post');
        const category = document.getElementById('new-post-category').value;
        const postType = document.querySelector('input[name="post-type"]:checked').value;

        const res = await fetch('/api/posts', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, language: currentLang, category, post_type: postType })
        });
        if (res.ok) {
            document.getElementById('post-form').reset();
            document.getElementById('modal-new-post').style.display = 'none';
            fetchPosts();
        }
    }

    // --- Rendering ---

    // --- Utils ---
    function parseMarkdown(text) {
        // Simple MVP Markdown Parser
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
            .replace(/`(.*?)`/g, '<code>$1</code>') // Inline Code
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px;">') // Image
            .replace(/\n/g, '<br>'); // Line breaks
        return html;
    }

    async function toggleLike(postId, btnElement) {
        if (!currentUser) return alert('Please login to like');
        try {
            const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                // Update UI locally without full re-render for smoothness
                const span = btnElement.querySelector('span');
                span.textContent = data.likes_count;
                // Toggle active class color
                if (data.message.includes('unliked')) {
                    btnElement.style.color = 'var(--text-muted)';
                } else {
                    btnElement.style.color = 'var(--secondary)'; // Pink for like
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function renderPosts(posts) {
        const container = document.getElementById('posts-container');
        container.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';

            // Category Badge Style
            const catColor = {
                'Arduino': '#00bcd4', 'Python': '#ffeb3b', 'Math': '#e91e63', 'Hardware': '#ff9800', 'Other': '#9e9e9e'
            }[post.category] || '#9e9e9e';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3>${post.title}</h3>
                    <span style="background:${catColor}; color:black; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.7rem; font-weight:bold;">${post.category}</span>
                </div>
                <p>${post.post_type === 'project' ? '<b>[Project]</b> ' : ''}${post.content.substring(0, 100)}...</p>
                <div class="meta" style="justify-content:space-between;">
                    <div>
                        <span>By ${post.author}</span>
                        <span>${post.date || ''}</span>
                    </div>
                    <div style="display:flex; gap:1rem;">
                         <span>❤️ ${post.likes_count}</span>
                         <span>💬 ${post.comment_count}</span>
                    </div>
                </div>
            `;
            card.onclick = () => fetchPostDetail(post.id);
            container.appendChild(card);
        });
    }

    function renderPostDetail(post) {
        document.getElementById('detail-title').textContent = post.title;
        // Use Markdown Parser
        document.getElementById('detail-content').innerHTML = parseMarkdown(post.content);

        // Meta with Like Button (and Delete for Author)
        const isAuthor = currentUser === post.author;
        const metaDiv = document.getElementById('detail-meta');
        metaDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>By ${post.author} at ${post.created_at} • <span style="background:#333; padding:2px 6px; border-radius:4px;">${post.category}</span></span>
                <div style="display:flex; gap:0.5rem;">
                    ${isAuthor ? `<button id="delete-post-btn" type="button" style="background:transparent; border:1px solid #ef5350; color:#ef5350; padding:0.5rem; border-radius:20px; cursor:pointer;">🗑️ Delete</button>` : ''}
                    <button id="like-btn-${post.id}" type="button" style="background:transparent; border:1px solid var(--border); padding:0.5rem 1rem; border-radius:20px; cursor:pointer; color:${post.user_liked ? 'var(--secondary)' : 'var(--text-muted)'}; display:flex; align-items:center; gap:0.5rem;">
                        ❤️ <span>${post.likes_count}</span>
                    </button>
                </div>
            </div>
        `;

        // Bind Delete Event
        if (isAuthor) {
            document.getElementById('delete-post-btn').onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                deletePost(post.id);
            };
        }

        // Bind Like Event
        document.getElementById(`like-btn-${post.id}`).onclick = function (e) {
            e.stopPropagation(); // Prevent bubbling if needed
            toggleLike(post.id, this);
        };

        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';

        post.comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = `comment ${comment.is_ai ? 'ai-reply' : ''}`;
            div.innerHTML = `
                <div class="comment-author">${comment.author} ${comment.is_ai ? '🤖' : ''}</div>
                <div class="comment-body">${comment.content}</div>
                <div class="comment-date">${comment.created_at}</div>
            `;
            commentsContainer.appendChild(div);
        });

        // Add Comment Form
        const formDiv = document.createElement('div');
        formDiv.className = 'comment-form';
        formDiv.innerHTML = `
            <h3 style="margin-top:2rem;">${t('add_comment') || 'Add a Comment'}</h3>
            <textarea id="new-comment-content" rows="3" style="width:100%; padding:0.8rem; margin:1rem 0; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--surface-light); color:var(--text-main);"></textarea>
            <button id="submit-comment" style="background:var(--primary); border:none; padding:0.5rem 1.5rem; border-radius:var(--radius-full); cursor:pointer; font-weight:bold;">${t('submit')}</button>
        `;
        commentsContainer.appendChild(formDiv);

        document.getElementById('submit-comment').onclick = () => {
            const content = document.getElementById('new-comment-content').value;
            submitComment(post.id, content);
        };
    }

    async function submitComment(postId, content) {
        if (!currentUser) return alert('Please login to comment');
        if (!content.trim()) return alert('Comment cannot be empty');

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (res.ok) {
                fetchPostDetail(postId); // Refresh
            } else {
                alert('Failed to add comment');
            }
        } catch (e) {
            console.error(e);
            alert('Error adding comment');
        }
    }

    async function deletePost(postId) {
        // Direct delete without confirmation
        try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Post deleted');
                showView('forum');
                fetchPosts();
            } else {
                alert('Failed to delete post');
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting post');
        }
    }

    // Event Listeners
    document.querySelector('.logo').addEventListener('click', (e) => {
        e.preventDefault();
        showView('forum');
        fetchPosts();
    });
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'zh' : 'en';
        updateUI();
    });

    loginBtn.addEventListener('click', () => {
        if (currentUser) {
            // Logout logic
            fetch('/api/logout').then(() => {
                currentUser = null;
                updateUI();
            });
        } else {
            showView('login');
        }
    });

    document.getElementById('login-form-submit').addEventListener('click', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        login(u, p);
    });

    document.getElementById('register-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const u = document.getElementById('login-username').value;
        const p = document.getElementById('login-password').value;
        register(u, p);
    });

    newPostBtn.addEventListener('click', () => {
        if (!currentUser) return alert('Please login to post');
        document.getElementById('modal-new-post').style.display = 'flex';
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('modal-new-post').style.display = 'none';
    });

    document.getElementById('submit-post').addEventListener('click', () => {
        const title = document.getElementById('new-post-title').value;
        const content = document.getElementById('new-post-content').value;
        createPost(title, content);
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        showView('forum');
    });

    // Init
    updateUI();
    fetchPosts();
});
