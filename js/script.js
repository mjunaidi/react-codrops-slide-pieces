const sliderFn = (function() {

    // Get all images and texts, get the `canvas` element, and save slider length
    var sliderCanvas = document.querySelector('.pieces-slider__canvas');
    var imagesEl = [].slice.call(document.querySelectorAll('.pieces-slider__image'));
    var textEl = [].slice.call(document.querySelectorAll('.pieces-slider__text'));
    var slidesLength = imagesEl.length;

    // Define indexes related variables and functions
    var currentIndex = 0, currentImageIndex, currentTextIndex, currentNumberIndex;
    // Update current indexes for image, text and number
    function updateIndexes() {
        currentImageIndex = currentIndex * 3;
        currentTextIndex = currentImageIndex + 1;
        currentNumberIndex = currentImageIndex + 2;
    }
    updateIndexes();
    var textIndexes = [];
    var numberIndexes = [];

    // Some other useful variables
    var windowWidth = window.innerWidth;
    var piecesSlider;

    // Options for images
    var imageOptions = {
        angle: 45,
        extraSpacing: {extraX: 100, extraY: 200},
        piecesWidth: function() { return Pieces.random(50, 200); },
        ty: function() { return Pieces.random(-400, 400); }
    };

    // Options for texts
    var textOptions = {
        color: 'white',
        backgroundColor: '#5104ab',
        fontSize: function() { return windowWidth > 720 ? 50 : 30; },
        padding: '15 20 10 20',
        angle: -45,
        piecesSpacing: 2,
        extraSpacing: {extraX: 0, extraY: 300},
        piecesWidth: function() { return Pieces.random(50, 200); },
        ty: function() { return Pieces.random(-200, 200); },
        translate: function() {
            if (windowWidth > 1120) return {translateX: 200, translateY: 200};
            if (windowWidth > 720) return {translateX: 0, translateY: 200};
            return {translateX: 0, translateY: 100};
        }
    };

    // Options for numbers
    var numberOptions = {
        color: 'white',
        backgroundColor: '#5104ab',
        fontSize: function() { return windowWidth > 720 ? 60 : 20; },
        padding: function() { return windowWidth > 720 ? '18 35 10 38' : '18 25 10 28'; },
        angle: 0,
        piecesSpacing: 2,
        extraSpacing: {extraX: 10, extraY: 10},
        piecesWidth: 35,
        ty: function() { return Pieces.random(-200, 200); },
        translate: function() {
            if (windowWidth > 1120) return {translateX: -340, translateY: -180};
            if (windowWidth > 720) return {translateX: -240, translateY: -180};
            return {translateX: -140, translateY: -100};
        }
    };

    // Build the array of items to draw using Pieces
    var items = [];
    var imagesReady = 0;
    for (var i = 0; i < slidesLength; i++) {
        // Wait for all images to load before initializing the slider and event listeners
        var slideImage = new Image();
        slideImage.onload = function() {
            if (++imagesReady == slidesLength) {
                initSlider();
                initEvents();
            }
        };
        // Push all elements for each slide with the corresponding options
        items.push({type: 'image', value: imagesEl[i], options: imageOptions});
        items.push({type: 'text', value: textEl[i].innerText, options: textOptions});
        items.push({type: 'text', value: i + 1, options: numberOptions});
        // Save indexes
        textIndexes.push(i * 3 + 1);
        numberIndexes.push(i * 3 + 2);
        // Set image src
        slideImage.src = imagesEl[i].src;
    }

    // Initialize a Pieces instance with all items we want to draw
    function initSlider() {
        // Stop any current animation if the slider was initialized before
        if (piecesSlider) {
            piecesSlider.stop();
        }

        // Save the new Pieces instance
        piecesSlider = new Pieces({
            canvas: sliderCanvas,
            items: items,
            x: 'centerAll',
            y: 'centerAll',
            piecesSpacing: 1,
            fontFamily: ["'Helvetica Neue', sans-serif"],
            animation: {
                duration: function() { return Pieces.random(1000, 2000); },
                easing: 'easeOutQuint'
            },
            // debug: true
        });

        // Animate all numbers to rotate clockwise indefinitely
        piecesSlider.animateItems({
            items: numberIndexes,
            duration: 20000,
            angle: 360,
            loop: true
        });

        // Show current items: image, text and number
        showItems();
    }

    // Init Event Listeners
    function initEvents() {
        // Select prev or next slide using buttons
        document.querySelector('.pieces-slider__button--prev').addEventListener('click', prevItem);
        document.querySelector('.pieces-slider__button--next').addEventListener('click', nextItem);

        // Select prev or next slide using arrow keys
        document.addEventListener('keydown', function (e) {
            if (e.keyCode == 37) { // left
                prevItem();
            } else if (e.keyCode == 39) { // right
                nextItem();
            }
        });

        // Handle `resize` event
        window.addEventListener('resize', resizeStart);
    }

    // Show current items: image, text and number
    function showItems() {
        // Show image pieces
        piecesSlider.showPieces({items: currentImageIndex, ignore: ['tx'], singly: true, update: (anim) => {
            // Stop the pieces animation at 60%, and run a new indefinitely animation of `ty` for each piece
            if (anim.progress > 60) {
                var piece = anim.animatables[0].target;
                var ty = piece.ty;
                anime.remove(piece);
                anime({
                    targets: piece,
                    ty: piece.h_ty < 300
                        ? [{value: ty + 10, duration: 1000}, {value: ty - 10, duration: 2000}, {value: ty, duration: 1000}]
                        : [{value: ty - 10, duration: 1000}, {value: ty + 10, duration: 2000}, {value: ty, duration: 1000}],
                    duration: 2000,
                    easing: 'linear',
                    loop: true
                });
            }
        }});
        // Show pieces for text and number, using alternate `ty` values
        piecesSlider.showPieces({items: currentTextIndex});
        piecesSlider.showPieces({items: currentNumberIndex, ty: function(p, i) { return p.s_ty - [-3, 3][i % 2]; }});
    }

    // Hide current items: image, text and number
    function hideItems() {
        piecesSlider.hidePieces({items: [currentImageIndex, currentTextIndex, currentNumberIndex]});
    }

    // Select the prev item: hide current items, update indexes, and show the new current item
    function prevItem() {
        hideItems();
        currentIndex = currentIndex > 0 ? currentIndex - 1 : slidesLength - 1;
        updateIndexes();
        showItems();
    }

    // Select the next item: hide current items, update indexes, and show the new current item
    function nextItem() {
        hideItems();
        currentIndex = currentIndex < slidesLength - 1 ? currentIndex + 1 : 0;
        updateIndexes();
        showItems();
    }

    // Handle `resize` event

    var initial = true, hideTimer, resizeTimer;

    // User starts resizing, so wait 300 ms before reinitialize the slider
    function resizeStart() {
        if (initial) {
            initial = false;
            if (hideTimer) clearTimeout(hideTimer);
            sliderCanvas.classList.add('pieces-slider__canvas--hidden');
        }
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeEnd, 300);
    }

    // User ends resizing, then reinitialize the slider
    function resizeEnd() {
        initial = true;
        windowWidth = window.innerWidth;
        initSlider();
        hideTimer = setTimeout(() => {
            sliderCanvas.classList.remove('pieces-slider__canvas--hidden');
        }, 500);
    }
})

const randomInt = (n)=>{
  if (typeof(n)==='number'&&n>0) {
    return Math.floor(Math.random()*n+1)
  }
  return randomInt(1000)
}

const lipsum = (n)=>{
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'vivamus', 'et', 'accumsan', 'augue', 'duis', 'eget', 'nunc', 'id', 'sodales', 'finibus', 'vestibulum', 'sagittis', 'magna', 'nec', 'rutrum', 'volutpat', 'risus', 'tincidunt', 'justo', 'non', 'gravida', 'tortor', 'enim', 'in', 'urna', 'ut', 'vel', 'metus', 'pellentesque', 'porttitor', 'vitae', 'nisi', 'nullam', 'faucibus', 'condimentum', 'quam', 'imperdiet', 'class', 'aptent', 'taciti', 'sociosqu', 'ad', 'litora', 'torquent', 'per', 'conubia', 'nostra', 'inceptos', 'himenaeos', 'interdum', 'malesuada', 'fames', 'ac', 'ante', 'primis', 'curabitur', 'nibh', 'quis', 'iaculis', 'cras', 'mollis', 'eu', 'congue', 'leo']
  const count = randomInt(n)
  const sentence = []
  const indexes = (new Array(count)).fill(0).map(index=>{
    return Math.floor(Math.random()*words.length)
  })
  indexes.forEach((index,i)=>{
    const word = words[index]
    if (i===0)
      sentence.push(word.charAt(0).toUpperCase()+word.substr(1))
    else
      sentence.push(word)
  })
  return sentence.join(' ')
}

class Root extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      slides: [],
      viewIndex: 0,
    }
  }
  componentDidMount() {
    const count = 10
    this.createSlides(count, ()=>{
      sliderFn()
    })
  }
  createSlides(n=10, callback) {
    if (typeof(n)==='number'&&n>0) {
      this.createSlide(()=>{
        this.createSlides(n-1, callback)
      })
    } else {
      if (typeof(callback)==='function') {
        callback()
      }
    }
  }
  createSlide(callback) {
    const slides = this.state.slides
    const slide = {
      name: lipsum(3),
      src: `https://picsum.photos/200/150/?random=${randomInt()}`,
    }
    slides.push(slide)
    this.setState({slides:slides}, ()=>{
      if (typeof(callback)==='function') {
        callback()
      }
    })
  }
  render() {
    return (
      <div className="pieces-slider">
        {
          this.state.slides.map((slide,index)=>(
            <div className="pieces-slider__slide">
              <img className="pieces-slider__image" src={slide.src} alt="" />
              <div className="pieces-slider__text">{slide.name}</div>
            </div>
          ))
        }
        <canvas className="pieces-slider__canvas"></canvas>
        <button className="pieces-slider__button pieces-slider__button--prev">prev</button>
        <button
          className="pieces-slider__button pieces-slider__button--next"
          onClick={(e)=>{
            this.setState({viewIndex:this.state.viewIndex+1},()=>{
              if (this.state.viewIndex>=this.state.slides.length/2) {
                this.createSlides(10, ()=>{
                  //sliderFn()
                })
              }
            })
          }}
        >next</button>
      </div>
    )
  }
}

ReactDOM.render(
  <Root/>,
  document.getElementById('root')
)
