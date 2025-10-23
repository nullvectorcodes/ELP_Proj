document.addEventListener('DOMContentLoaded', function() {

    // --- Custom Slider Logic ---
    const track = document.querySelector('.slider-track');
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('next-slide');
    const prevButton = document.getElementById('prev-slide');
    const dotsNav = document.getElementById('slider-dots');

    // Check if slider elements exist
    if (track && slides.length > 0) {
        let slideWidth = slides[0].getBoundingClientRect().width;
        let currentIndex = 0;

        // Create dots
        slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            
            dot.addEventListener('click', e => {
                currentIndex = index;
                updateSliderPosition();
            });
            dotsNav.appendChild(dot);
        });

        const dots = Array.from(dotsNav.children);

        // Function to update the slider's position and active dot
        const updateSliderPosition = () => {
            // Update slide position
            track.style.transform = 'translateX(-' + (slideWidth * currentIndex) + 'px)';
            
            // Update active dot
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');

            // Update arrow states (optional but good UI)
            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === slides.length - 1;
        };

        // Next slide
        nextButton.addEventListener('click', () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateSliderPosition();
            }
        });

        // Previous slide
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSliderPosition();
            }
        });

        // Recalculate width on window resize
        window.addEventListener('resize', () => {
            slideWidth = slides[0].getBoundingClientRect().width;
            updateSliderPosition();
        });

        // Initialize slider
        updateSliderPosition();
    }


    // --- Footer Copyright Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

});