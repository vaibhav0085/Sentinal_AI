/**
 * Sentinel AI - Navigation Handler
 * Highlights the active sidebar link based on current URL
 */

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

    navItems.forEach(item => {
        // Remove active class from all
        item.classList.remove('active');

        // Check if href matches current page
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });

    // Handle Logout
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            // Optional: Clear session or state if needed
            // localStorage.clear(); // Usually don't want to clear history on simple logout unless requested
        });
    }
});
