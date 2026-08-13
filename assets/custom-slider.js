class CustomSlider {
  constructor(element, options = {}) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;

    this.wrapper = this.el.querySelector('.custom-slider-track') || this.el.querySelector('.swiper-wrapper') || this.el.firstElementChild;
    if (!this.wrapper) return;
    this.slides = Array.from(this.wrapper.children);

    this.options = Object.assign({
      loop: false,
      autoplay: false,
      autoplayDelay: 3000,
      navNext: null,
      navPrev: null,
      pagination: null
    }, options);

    this.init();
  }

  set allowTouchMove(val) {
    if (this.el) {
      this.el.style.overflowX = val ? 'auto' : 'hidden';
    }
  }

  get allowTouchMove() {
    return this.el ? this.el.style.overflowX !== 'hidden' : true;
  }

  init() {
    // Apply styling for native CSS scroll snap
    this.el.style.overflowX = 'auto';
    this.el.style.scrollSnapType = 'x mandatory';
    this.el.style.scrollBehavior = 'smooth';
    this.el.style.webkitOverflowScrolling = 'touch';
    this.el.style.scrollbarWidth = 'none';

    this.wrapper.style.display = 'flex';
    this.wrapper.style.flexDirection = 'row';
    this.wrapper.style.transition = 'none';
    this.wrapper.style.transform = 'none';

    this.slides.forEach(slide => {
      slide.style.flexShrink = '0';
      slide.style.scrollSnapAlign = 'start';
      slide.style.scrollSnapStop = 'always';
    });

    // Navigation arrows
    if (this.options.navigation) {
      const nav = this.options.navigation;
      const nextSelector = nav.nextEl;
      const prevSelector = nav.prevEl;

      if (nextSelector) {
        this.nextBtn = typeof nextSelector === 'string' ? (this.el.querySelector(nextSelector) || document.querySelector(nextSelector)) : nextSelector;
        if (this.nextBtn) {
          this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.next();
          });
        }
      }

      if (prevSelector) {
        this.prevBtn = typeof prevSelector === 'string' ? (this.el.querySelector(prevSelector) || document.querySelector(prevSelector)) : prevSelector;
        if (this.prevBtn) {
          this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.prev();
          });
        }
      }
    }

    // Autoplay
    if (this.options.autoplay) {
      const delay = typeof this.options.autoplay === 'object' ? (this.options.autoplay.delay || 3000) : 3000;
      this.startAutoplay(delay);
      this.el.addEventListener('mouseenter', () => this.stopAutoplay());
      this.el.addEventListener('mouseleave', () => this.startAutoplay(delay));
      this.el.addEventListener('touchstart', () => this.stopAutoplay(), { passive: true });
    }

    // Pagination
    if (this.options.pagination) {
      const pag = this.options.pagination;
      const pagSelector = pag.el;
      if (pagSelector) {
        this.paginationEl = typeof pagSelector === 'string' ? (this.el.querySelector(pagSelector) || document.querySelector(pagSelector)) : pagSelector;
        if (this.paginationEl) {
          this.createDots(pag.clickable);
          this.el.addEventListener('scroll', () => this.updateDots(), { passive: true });
        }
      }
    }

    this.updateNavigationButtons();
    this.el.addEventListener('scroll', () => this.updateNavigationButtons(), { passive: true });
  }

  getSlideWidth() {
    if (this.slides.length === 0) return 0;
    const style = window.getComputedStyle(this.slides[0]);
    const marginRight = parseFloat(style.marginRight) || 0;
    const marginLeft = parseFloat(style.marginLeft) || 0;
    return this.slides[0].getBoundingClientRect().width + marginRight + marginLeft;
  }

  next() {
    const width = this.getSlideWidth();
    const scrollLeft = this.el.scrollLeft;
    const maxScroll = this.el.scrollWidth - this.el.clientWidth;
    if (scrollLeft >= maxScroll - 5) {
      this.el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      this.el.scrollBy({ left: width, behavior: 'smooth' });
    }
  }

  prev() {
    const width = this.getSlideWidth();
    const scrollLeft = this.el.scrollLeft;
    if (scrollLeft <= 5) {
      const maxScroll = this.el.scrollWidth - this.el.clientWidth;
      this.el.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      this.el.scrollBy({ left: -width, behavior: 'smooth' });
    }
  }

  startAutoplay(delay) {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => this.next(), delay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  createDots(clickable) {
    // Check if the container is using custom-slider-bullet or swiper-pagination-bullet
    const bulletClass = this.el.classList.contains('custom-slider') ? 'custom-slider-bullet' : 'swiper-pagination-bullet';
    const activeBulletClass = this.el.classList.contains('custom-slider') ? 'custom-slider-bullet-active' : 'swiper-pagination-bullet-active';

    if (this.paginationEl.children.length === 0) {
      this.paginationEl.innerHTML = '';
      this.dots = [];
      const count = this.slides.length;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = bulletClass + (i === 0 ? ' ' + activeBulletClass : '');
        if (clickable) {
          dot.addEventListener('click', (e) => {
            e.preventDefault();
            const width = this.getSlideWidth();
            this.el.scrollTo({ left: i * width, behavior: 'smooth' });
          });
        }
        this.paginationEl.appendChild(dot);
        this.dots.push(dot);
      }
    } else {
      this.dots = Array.from(this.paginationEl.querySelectorAll('.' + bulletClass)) || Array.from(this.paginationEl.querySelectorAll('.swiper-pagination-bullet'));
      if (clickable) {
        this.dots.forEach((dot, i) => {
          dot.addEventListener('click', (e) => {
            e.preventDefault();
            const width = this.getSlideWidth();
            this.el.scrollTo({ left: i * width, behavior: 'smooth' });
          });
        });
      }
    }
  }

  updateDots() {
    if (!this.dots || this.dots.length === 0) return;
    const scrollLeft = this.el.scrollLeft;
    const width = this.getSlideWidth() || 1;
    const activeIndex = Math.round(scrollLeft / width);
    const activeBulletClass = this.el.classList.contains('custom-slider') ? 'custom-slider-bullet-active' : 'swiper-pagination-bullet-active';
    
    this.dots.forEach((dot, i) => {
      dot.classList.toggle(activeBulletClass, i === activeIndex);
    });
  }

  updateNavigationButtons() {
    if (!this.prevBtn && !this.nextBtn) return;
    const scrollLeft = this.el.scrollLeft;
    const maxScroll = this.el.scrollWidth - this.el.clientWidth;
    const disabledClass = this.el.classList.contains('custom-slider') ? 'custom-slider-button-disabled' : 'swiper-button-disabled';

    if (this.prevBtn) {
      this.prevBtn.classList.toggle(disabledClass, scrollLeft <= 5);
      this.prevBtn.setAttribute('aria-disabled', scrollLeft <= 5 ? 'true' : 'false');
    }
    if (this.nextBtn) {
      this.nextBtn.classList.toggle(disabledClass, scrollLeft >= maxScroll - 5);
      this.nextBtn.setAttribute('aria-disabled', scrollLeft >= maxScroll - 5 ? 'true' : 'false');
    }
  }
}

// Register global style helper for scrollbar hiding and disabled states
if (!document.getElementById('custom-slider-global-style')) {
  const style = document.createElement('style');
  style.id = 'custom-slider-global-style';
  style.textContent = `
    .swiper::-webkit-scrollbar, .swiper-container::-webkit-scrollbar, .custom-slider::-webkit-scrollbar { display: none !important; }
    .swiper-button-disabled, .custom-slider-button-disabled { opacity: 0.35; pointer-events: none; }
  `;
  document.head.appendChild(style);
}

window.CustomSlider = CustomSlider;
