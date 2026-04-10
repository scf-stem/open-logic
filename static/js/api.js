// API Wrapper

const api = {
    get: async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'API Error');
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    },

    post: async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'API Error');
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    },

    delete: async (url) => {
        try {
            const response = await fetch(url, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'API Error');
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    }
};
