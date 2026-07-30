/**
 * CHANDRA PAINTS - INTERACTIVE JAVASCRIPT LOGIC
 * Includes mobile menu toggle, smooth scroll, interactive wall shade preview,
 * gallery filters, and contact form validation.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. MOBILE MENU TOGGLE
    // =========================================================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            
            // Toggle hamburger icon between bars and X
            if (navLinks.classList.contains('show')) {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-xmark');
            } else {
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
            }
        });

        // Close mobile nav when clicking any nav link
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
            });
        });
    }


    // =========================================================================
    // 2. ACTIVE NAVIGATION HIGHLIGHT ON SCROLL
    // =========================================================================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');

    function updateActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);


    // =========================================================================
    // 3. INTERACTIVE WALL SHADE PREVIEW VISUALIZER
    // =========================================================================
    const swatchButtons = document.querySelectorAll('.swatch-btn');
    const mockWallElement = document.getElementById('mock-wall-element');
    const selectedShadeName = document.getElementById('selected-shade-name');

    if (swatchButtons.length > 0 && mockWallElement) {
        swatchButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all swatch buttons
                swatchButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');

                // Get selected color hex and shade name from data attributes
                const hexColor = btn.getAttribute('data-color');
                const shadeName = btn.getAttribute('data-name');

                // Update mock wall background color and text display
                mockWallElement.style.backgroundColor = hexColor;
                if (selectedShadeName) {
                    selectedShadeName.textContent = shadeName;
                }
            });
        });
    }


    // =========================================================================
    // 4. IMAGE GALLERY FILTER TABS
    // =========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hide');
                    } else {
                        item.classList.add('hide');
                    }
                });
            });
        });
    }


    // =========================================================================
    // 5. CONTACT FORM HANDLER & VALIDATION
    // =========================================================================
    const contactForm = document.getElementById('contact-form');
    const formResponse = document.getElementById('form-response');
    const formSubmitBtn = document.getElementById('form-submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation check
            const nameInput = document.getElementById('user-name').value.trim();
            const phoneInput = document.getElementById('user-phone').value.trim();
            const messageInput = document.getElementById('user-message').value.trim();

            if (!nameInput || !phoneInput || !messageInput) {
                alert('Please fill out all required fields marked with *.');
                return;
            }

            // Disable button during submission simulation
            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

            setTimeout(() => {
                // Display success message
                formResponse.className = 'form-response-msg success';
                formResponse.innerHTML = `
                    <i class="fa-solid fa-circle-check"></i> Thank you, <strong>${nameInput}</strong>! Your inquiry has been received. We will contact you at <strong>${phoneInput}</strong> shortly.
                `;

                // Reset form fields
                contactForm.reset();

                // Re-enable button
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
            }, 1000);
        });
    }


    // =========================================================================
    // 6. DYNAMIC COPYRIGHT YEAR
    // =========================================================================
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

});
