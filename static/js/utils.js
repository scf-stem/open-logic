// Shared Utility Functions

const utils = {
    // Format Date
    formatDate: (dateStr) => {
        return new Date(dateStr).toLocaleDateString();
    },

    // Debounce function for search
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
