// ===================================
// MAIN JAVASCRIPT - SHARED UTILITIES
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // ===== MOBILE MENU TOGGLE =====
    const nav = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');

    // Make hamburger keyboard accessible
    if (hamburger) {
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // Close menu when a link is clicked
    if (nav) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                if (hamburger) hamburger.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // ===== IMAGE LOADING STATES =====
    const images = document.querySelectorAll('.image-wrapper img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
            img.parentElement.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
                img.parentElement.classList.add('loaded');
            });
        }
    });

    // ===== DRAG TO SCROLL FOR FILTER BUTTONS =====
    const slider = document.querySelector('.filter-container');
    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let isDragging = false;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            isDragging = false;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
            setTimeout(() => { isDragging = false; }, 50);
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX);
            if (Math.abs(walk) > 5) isDragging = true;
            slider.scrollLeft = scrollLeft - walk;
        });

        // ===== FILTER FUNCTIONALITY =====
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        const emptyState = document.getElementById('empty-state');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Prevent filter if dragging
                if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                // Update active state
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');

                // Filter projects
                const filterValue = btn.getAttribute('data-filter');
                let visibleCount = 0;

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || filterValue === category) {
                        card.classList.remove('hidden');
                        visibleCount++;
                        card.style.opacity = '0';
                        setTimeout(() => card.style.opacity = '1', 50);
                    } else {
                        card.classList.add('hidden');
                    }
                });

                // Show/hide empty state
                if (emptyState) {
                    if (visibleCount === 0) {
                        emptyState.classList.add('visible');
                    } else {
                        emptyState.classList.remove('visible');
                    }
                }
            });
        });
    }

    // ===== HERO TEXT SWAP =====
    const heroText = document.querySelector('.light-text');
    if (heroText) {
        const originalText = heroText.textContent;
        const newText = "Product Builder";

        heroText.addEventListener('mouseenter', () => {
            heroText.textContent = newText;
        });

        heroText.addEventListener('mouseleave', () => {
            heroText.textContent = originalText;
        });
    }
});

// ===== MOBILE MENU TOGGLE FUNCTION =====
function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');

    if (nav) nav.classList.toggle('active');
    if (hamburger) hamburger.classList.toggle('active');

    // Toggle scrolling on body when menu is open
    if (nav && nav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}