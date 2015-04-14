/*------------------
Carousel
------------------*/
function carousel( element, options ) {

    this.element = element;
    this.init( this.element );

}


carousel.prototype = {

    init: function(carousel) {

        this._elements = {
            carousel: carousel,
            container: carousel.querySelector('.carousel-container'),
            inner: carousel.querySelector('.carousel-inner'),
            slides: carousel.querySelectorAll('[carousel-slide]'),
        }

        // more variables
        this.width = +carousel.clientWidth;
        this.numberOfSlides = this._elements.slides.length;
        this.scrollCount = 0;
        this.currentPosition = 0;
        this.currentSlide = 0;
        this.slideInView = 1;
        this.layer = 1;

        // append navigation items
        this._elements.container.appendChild(this.createNavigation('next'));
        this._elements.container.appendChild(this.createNavigation('prev'));
        this._elements.carousel.appendChild(this.createPips());

        // navigation items
        this.navigationNext = carousel.querySelector('.nav-next');
        this.navigationPrev = carousel.querySelector('.nav-prev');
        this.pips = carousel.querySelector('.pips');

        // left and right position values
        this.currentLeftPosition = parseInt('-' + this.width);
        this.currentRightPosition = (this.numberOfSlides * this.width) - (this.width * 2);

        // add event listeners
        this.addEvents();

        // set width & left position of slides
        this.resizeSlides();
        this.repositionSlides();

        // create empty modal window
        this.createModal();
    },


    /*------------------
    Create modal window
    ------------------*/
    createModal: function() {

        this.modal = document.querySelector('.modal');
        if (this.modal != null) return;

        var body = document.querySelector('body');

        var item = document.createElement('div');
            item.classList.add('modal');
            item.setAttribute('hidden', '');

        body.appendChild(item);

        this.modal = document.querySelector('.modal');

        // store this
        var _this = this;

        this.modal.addEventListener('click', function(e) {

            if (e.target.classList.contains('modal')) {
                _this.closeModal();
            }
        })
    },


    /*------------------
    Open modal window
    ------------------*/
    openModal: function(id, type, provider) {

        if (type == 'video') {

            if (provider == 'vimeo') {

                var iframe = document.createElement('iframe');
                    iframe.src = 'http://player.vimeo.com/video/' + id;
                    iframe.setAttribute('webkitallowfullscreen', '');
                    iframe.setAttribute('mozallowfullscreen', '');
                    iframe.setAttribute('allowfullscreen', '');

                this.modal.appendChild(iframe);
            }
        }

        this.modal.removeAttribute('hidden');
    },


    /*------------------
    Close modal window
    ------------------*/
    closeModal: function() {
        this.modal.innerHTML = '';
        this.modal.setAttribute('hidden', 'hidden');
    },


    /*------------------
    Open media
    ------------------*/
    openMedia: function(e) {

        var type = e.target.getAttribute('media-type');
        var provider = e.target.getAttribute('media-provider');
        var id = e.target.getAttribute('media-id');

        if (type == 'video') {
            this.openModal(id, type, provider);
        }
    },


    /*------------------
    Add event listeners for clicking / swiping / resizing
    ------------------*/
    addEvents: function() {

        // store this
        var _this = this;

        // touch events
        var options = { preventDefault: true };
        var mc = new Hammer(this._elements.carousel, options);

        mc.on('swipeleft swiperight', function(e) {
            _this.handleEvent(e);
        })

        // on clicking slide
        for (var i = 0; i < this._elements.slides.length; i++) {

            this._elements.slides[i].addEventListener('click', function(e) {
                _this.openMedia(e);
            })
        }

        // on clicking forward / backwards arrows
        this.navigationNext.addEventListener('click', function(e) {
            _this.handleEvent(e);
        })

        this.navigationPrev.addEventListener('click', function(e) {
            _this.handleEvent(e);
        })

        // on resizing window
        window.addEventListener('resize', function(e) {
            _this.resizeSlide(_this.slideInView);
        })

        // on stop resizing window
        window.resizeStop.bind(function() {
            _this.resizeSlides();
            _this.repositionSlides();
            _this.layer = _this.layer + 1;
        })
    },


    /*------------------
    Click / Swipe left or right
    ------------------*/
    handleEvent: function(e) {

        // set transform on carousel inner
        var isTouch = e.pointerType; //touch

        // touch
        if (isTouch == 'touch') {

            var isLast = e.isFinal;
            if (!isLast) return;

            var type = e.type;
            var direction = (type == 'swipeleft') ? 'next' : 'prev';

        // not touch
        } else {

            var target = e.target;
            if (!target.hasAttribute('nav-direction')) return;

            // check it's not already animating
            var moving = target.getAttribute('is-moving');
            if (moving == 'yes') return;

            // add moving class to active slide
            target.setAttribute('is-moving', 'yes');

            var direction = target.getAttribute('nav-direction');
        }

        this.width = this._elements.carousel.clientWidth;

        // add transition back to inner
        this._elements.inner.style.transition = 'transform 0.3s ease-out';

        // get current position
        var currentPositionOffset = Math.abs(this.scrollCount) * this.width;
        var currentPositionOffset = parseInt((this.scrollCount > 0) ? '-' + currentPositionOffset : currentPositionOffset);

        // set transform on carousel inner
        this.currentPosition = (direction == 'next') ? currentPositionOffset - this.width : currentPositionOffset + this.width;
        this._elements.inner.style.transform = ("translate3d(" + this.currentPosition + "px, 0, 0)");

        var _this = this;

        // if only two slides, move the next before the transition
        if (this.numberOfSlides == 2 && direction == 'next') {
            this.moveSlides(direction);
        }

        // when transition ends
        this._elements.carousel.addEventListener('transitionend', function switchIt() {

            _this._elements.carousel.removeEventListener('transitionend', switchIt);

            if (_this.numberOfSlides == 2) {
                if (direction == 'prev') {
                    _this.moveSlides(direction);
                }
            } else {
                _this.moveSlides(direction);
            }

            if (isTouch != 'touch') {
                target.setAttribute('is-moving', '');
            }

        })
    },


    /*------------------
    Reposition slides
    ------------------*/
    repositionSlides: function() {

        this.width = this._elements.carousel.clientWidth;

        // Positive scroll count
        var scrollCount = Math.abs(this.scrollCount);

        // Set transform on carousel inner
        this.currentPosition = (this.scrollCount >= 1) ? '-' + Math.abs(this.scrollCount * this.width) : Math.abs(this.scrollCount * this.width);
        this._elements.inner.style.transform = ( "translate3d(" + this.currentPosition + "px, 0, 0)" );

        // if in the positive
        if (this.scrollCount >= 0) {
            var first = (scrollCount <= this.numberOfSlides && scrollCount >= 0) ? scrollCount : Math.floor(scrollCount % this.numberOfSlides);

        // if in the negative
        } else {
            var first = (scrollCount % this.numberOfSlides == 0) ? 0 : this.numberOfSlides - (scrollCount % this.numberOfSlides);
        }

        // Set slides left position
        var firstLeftValue = (this.scrollCount * this.width) - this.width;

        // update left and right stored positions
        this.currentLeftPosition = firstLeftValue;
        this.currentRightPosition = firstLeftValue + ((this.numberOfSlides - 1) * this.width);

        for (var j = 0; j < this._elements.slides.length; j++) {

            first = (first > (this.numberOfSlides - 1)) ? 0 : first;
            first = (first <= -1) ? (this.numberOfSlides - 1) : first;

            this._elements.slides[first].style.left = firstLeftValue + 'px';
            firstLeftValue = firstLeftValue + this.width;

            first = parseInt(first) + 1;
        }
    },


    /*------------------
    Resize slides width
    ------------------*/
    resizeSlides: function() {

        this.width = this._elements.carousel.clientWidth;

        for (var k = 0; k < this._elements.slides.length; k++) {
            this._elements.slides[k].style.width = this.width + 'px';
        }
    },


    /*------------------
    Resize single slide width
    ------------------*/
    resizeSlide: function(target) {

        this.width = this._elements.carousel.clientWidth;
        this._elements.slides[target].style.width = this.width + 'px';

        // set z-index so it's always on top
        this._elements.slides[target].style.zIndex = this.layer;

        // remove transition so it doesn't jump
        this._elements.inner.style.transition = 'none';

    },


    /*------------------
    Calculate which slide needs repositioning at the start or end of the carousel
    ------------------*/
    calculateSlideToMove: function(direction) {

        // scrolling right
        if (direction == 'next') {
            this.currentSlide = (this.currentSlide >= this.numberOfSlides) ? 0 : this.currentSlide;

        // scrolling left
        } else if (direction == 'prev') {
            this.currentSlide = (this.currentSlide <= 0) ? this.numberOfSlides - 1 : this.currentSlide - 1;
        }

        return this.currentSlide;
    },


    /*------------------
    Move slides left or right
    ------------------*/
    moveSlides: function(direction) {

        var slideToMove = this.calculateSlideToMove(direction);
        var active = this._elements.carousel.querySelector('[carousel-slide="' + slideToMove + '"]');

        this._elements.carousel.setAttribute('slidetomove', slideToMove);

        // scrolling right
        if (direction == 'next') {

            this.currentRightPosition = this.currentRightPosition + this.width;
            this.currentLeftPosition = this.currentLeftPosition + this.width;

            active.style.left = this.currentRightPosition + 'px';

            this.scrollCount = this.scrollCount + 1;
            this.currentSlide = this.currentSlide + 1;

            this.slideInView = (this.slideInView >= (this.numberOfSlides - 1)) ? 0 : this.slideInView + 1;

        // scrolling left
        } else if (direction == 'prev') {

            this.currentRightPosition = this.currentRightPosition - this.width;
            this.currentLeftPosition = this.currentLeftPosition - this.width;

            active.style.left = this.currentLeftPosition + 'px';

            this.scrollCount = this.scrollCount - 1;

            this.slideInView = (this.slideInView <= 0) ? this.numberOfSlides - 1 : this.slideInView - 1;
        }

        this.updatePips();
    },


    /*------------------
    Create pips
    ------------------*/
    createPips: function() {

        var pips = document.createElement('ul');
            pips.classList.add('pips');

        for (var l = 0; l < this.numberOfSlides; l++) {

            var item = document.createElement('li');

                if (l == 0) {
                    item.classList.add('active');
                }

                item.setAttribute('carousel-pip', l);
            pips.appendChild(item);
        }

        return pips;
    },


    /*------------------
    Update pips
    ------------------*/
    updatePips: function() {

        var pips = this.pips;

        // get active pip
        var activePip = pips.querySelector('[carousel-pip].active');

        activePip.classList.remove('active');

        // get next pip
        var target = (this.currentSlide >= this.numberOfSlides) ? 0 : this.currentSlide;
        var nextPip = pips.querySelector('[carousel-pip="' + target + '"]');
        nextPip.classList.add('active');
    },


    /*------------------
    Create left / right navigation arrows
    ------------------*/
    createNavigation: function(direction) {

        var item = document.createElement('span');
            item.classList.add('nav');
            item.classList.add('nav-' + direction);
            item.setAttribute('nav-direction', direction);
            item.setAttribute('is-moving', '');

        return item;
    }
}


/*------------------
Start carousel...
------------------*/
var carousels = document.querySelectorAll('.carousel');

for (var c = 0; c < carousels.length; c++) {
    var newCarousel = new carousel( carousels[c]);
}
