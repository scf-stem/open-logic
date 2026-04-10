// Auth View Logic

const t = (key, fallback, vars) => window.appT(key, fallback, vars);

function showAuthMessage(form, message, isError = true) {
    const existing = form.querySelector('.auth-msg-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = `feedback-banner auth-msg-banner ${isError ? 'error' : 'success'}`;
    banner.innerText = message;

    const submitBtn = form.querySelector('button[type="submit"]');
    form.insertBefore(banner, submitBtn);
}

function setButtonLoading(button, loadingLabel, loading) {
    if (!button) return;
    if (!button.dataset.defaultLabel) {
        button.dataset.defaultLabel = button.textContent.trim();
    }

    button.disabled = loading;
    button.classList.toggle('loading', loading);
    button.textContent = loading ? loadingLabel : button.dataset.defaultLabel;
}

function setupPasswordToggles() {
    document.querySelectorAll('[data-password-toggle]').forEach(toggleBtn => {
        const inputId = toggleBtn.dataset.passwordToggle;
        const input = document.getElementById(inputId);
        if (!input) return;

        toggleBtn.addEventListener('click', () => {
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            toggleBtn.setAttribute('aria-label', isPassword ? t('common.hide_password') : t('common.show_password'));
        });
    });
}

const authForm = document.getElementById('authForm');
const registerForm = document.getElementById('registerForm');

setupPasswordToggles();

if (authForm) {
    authForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = this.querySelector('button[type="submit"]');

        if (!username || !password) {
            showAuthMessage(this, t('auth.enter_credentials'));
            return;
        }

        try {
            setButtonLoading(submitBtn, t('auth.login_loading'), true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            localStorage.setItem('osi_user', JSON.stringify(result.data));

            showAuthMessage(this, t('auth.login_success'), false);
            setTimeout(() => {
                window.location.href = '/';
            }, 800);

        } catch (error) {
            showAuthMessage(this, t('auth.login_failed', '', { message: error.message || t('common.load_failed_retry') }));
            setButtonLoading(submitBtn, t('auth.login_loading'), false);
            console.error(error);
        }
    });
}

if (registerForm) {
    // Captcha Refresh
    const captchaImg = document.getElementById('captchaImg');
    if (captchaImg) {
        captchaImg.onclick = function () {
            this.src = '/api/auth/captcha?t=' + new Date().getTime();
        };
    }

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const captcha = document.getElementById('captcha').value;
        const submitBtn = this.querySelector('button[type="submit"]');

        if (!username || !password || !captcha) {
            showAuthMessage(this, t('auth.register_fill'));
            return;
        }

        try {
            setButtonLoading(submitBtn, t('auth.register_loading'), true);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, captcha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            showAuthMessage(this, t('auth.register_success'), false);
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 1200);

        } catch (error) {
            showAuthMessage(this, t('auth.register_failed', '', { message: error.message || t('common.load_failed_retry') }));
            if (captchaImg) captchaImg.click();
            document.getElementById('captcha').value = '';

            setButtonLoading(submitBtn, t('auth.register_loading'), false);
            console.error(error);
        }
    });
}
