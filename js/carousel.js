// ===================================
// CAROUSEL FUNCTIONALITY
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('projectCarousel');

    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextBtn = carousel.querySelector('.next-btn');
    const prevBtn = carousel.querySelector('.prev-btn');
    const counter = carousel.querySelector('.carousel-counter');
    const captionEl = carousel.querySelector('.carousel-active-caption');
    const progressBar = carousel.querySelector('.carousel-progress-bar');

    let currentIndex = 0;
    const totalSlides = slides.length;

    // Initialize progress bar width
    progressBar.style.width = `${100 / totalSlides}%`;

    const updateCarousel = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        const currentNum = (currentIndex + 1).toString().padStart(2, '0');
        const totalNum = totalSlides.toString().padStart(2, '0');
        counter.textContent = `${currentNum} / ${totalNum}`;

        const currentSlide = slides[currentIndex];
        const captionText = currentSlide.getAttribute('data-caption');
        captionEl.textContent = captionText;

        progressBar.style.transform = `translateX(${currentIndex * 100}%)`;
    };

    // Initial update
    updateCarousel();

    // Next button
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    });

    // Previous button
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn.click();
        }
    });

    // Update on window resize
    window.addEventListener('resize', updateCarousel);

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next slide
                nextBtn.click();
            } else {
                // Swiped right - previous slide
                prevBtn.click();
            }
        }
    }
});
