window.appT = function appT(key, fallback, vars) {
    const translations = window.APP_TRANSLATIONS || {};
    let message = translations[key];

    if (message === undefined || message === null) {
        message = fallback !== undefined ? fallback : key;
    }

    if (vars && typeof message === 'string') {
        Object.entries(vars).forEach(([name, value]) => {
            message = message.replaceAll(`{${name}}`, String(value));
        });
    }

    return message;
};
