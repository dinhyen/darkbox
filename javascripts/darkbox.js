/*global window */
var Darkbox = {
  KEY_CODES: { esc: 27, left: 37, right: 39 },
  _figs: [],
  _current_index: null,
  _initial_size: { w: 0, h: 0 },
  _duration: 200,
  init: function () {
    $('<div id="db-overlay">')
      .html('<div class="db-zoom"><figure><img/><figcaption/></figure><a class="db-prev" href="#"></a><a class="db-next" href="#"></a></div>')
      .appendTo('body')
      .click(Darkbox.dismiss)
      .on('click', '.db-prev', Darkbox.prev)
      .on('click', '.db-next', Darkbox.next);

    // Retrieve and store figure data. However, because the full-size images are not 
    // loaded yet, wait until before they're being shown before determining dimension.
    $('[data-darkbox]')
      .click(Darkbox.zoom)
      .each(function (index) {
        var $fig = $(this),
          src = $fig.prop('href'),
          caption = $fig.prop('title');

        $fig.data('index', index); // save array index in data attribute
        Darkbox._figs.push({
          src: src,
          caption: caption,
          isLandscape: function () {
            if (typeof this.size === 'object') {
              return this.size.w > this.size.h;
            }
          }
        });
      });
    $(document).keyup(function (event) {
      switch (event.keyCode) {
      case Darkbox.KEY_CODES.esc:
        Darkbox.dismiss(event);
        break;
      case Darkbox.KEY_CODES.left:
        Darkbox.prev(event);
        break;
      case Darkbox.KEY_CODES.right:
        Darkbox.next(event);
        break;
      }
    });
  },
  dismiss: function (event) {
    event.preventDefault();
    $('#db-overlay').css('opacity', 0).hide();
    Darkbox._initial_size = { w: 0, h: 0 };
  },
  display: function () {
    Darkbox._preanimate();
    Darkbox._loadImage().done(Darkbox._animate).fail(Darkbox._animate);
  },
  _loadImage: function () {
    var fig = Darkbox._figs[Darkbox._current_index],
      $deferred = $.Deferred(),
      $promise = $deferred.promise(),
      $img,
      img;

    $img = $('<img/>')
      .prop('src', fig.src)
      .on('load', function () {
        console.log('load ' + this.width + ' ' + this.height);
        fig.size = { w: this.width, h: this.height };
        $deferred.resolve(this); // resolve Deferred object, passing <img> to registered success handler
      })
      .on('error', function () {
        fig.size = { w: 400, h: 300 };
        img = $('<img src="images/not_found.jpg" />')[0];
        $deferred.reject(img);  // reject, passing <img> to error handler
      });

    // TODO: this doesn't get called
    img = $img[0];
    if (img.complete) {
      $deferred.resolve(img); // if <img> already loaded, immediately resolve Deferred object
    }

    return $promise;
  },
  _preanimate: function () {
    var $overlay = $('#db-overlay'),
      $zoom = $overlay.find('.db-zoom'),
      $zoom_img = $overlay.find('img'),
      $caption = $overlay.find('figcaption');

    $zoom_img.css('opacity', 0).hide();
    $caption.css('opacity', 0).hide();
    $zoom.css({
      'width': Darkbox._initial_size.w + 'px',
      'height': Darkbox._initial_size.h + 'px',
      'margin-top': -1 * Darkbox._initial_size.h / 2 + 'px',
      'margin-left': -1 * Darkbox._initial_size.w / 2 + 'px'
    });
  },
  _animate: function ($img) {
    var $win = $(window),
      $overlay = $('#db-overlay'),
      $zoom = $overlay.find('.db-zoom'),
      $zoom_img = $overlay.find('img'),
      $caption = $overlay.find('figcaption'),
      win_size = { w: $win.width(), h: $win.height() },
      scaled_size = { w: Math.round(win_size.w * 0.75), h: Math.round(win_size.h * 0.75) },
      fig = Darkbox._figs[Darkbox._current_index],
      size;

    if (fig.isLandscape()) {
      size = (fig.size.w < scaled_size.w)
                ? fig.size
                : { w: scaled_size.w, h: Math.round(fig.size.h * scaled_size.w / fig.size.w) };
    } else {
      size = (fig.size.h < scaled_size.h)
              ? fig.size
              : { w: Math.round(fig.size.w * scaled_size.h / fig.size.h), h: scaled_size.h };
    }

    if ($overlay.not(':visible')) {
      $overlay.show().css('opacity', 1);
    }
    $zoom
      .animate({
        width: size.w + 'px',
        marginLeft: -1 * size.w / 2 + 'px'
      }, Darkbox._duration)
      .animate({
        height: size.h + 'px',
        marginTop: -1 * size.h / 2 + 'px'
      }, Darkbox._duration)
      .promise().done(function () {
        $zoom_img.replaceWith($img).show().animate({ opacity: 1 }, Darkbox._duration * 2);
        if (fig.caption.length > 0) {
          $caption.text(fig.caption).show().animate({ opacity: 1 }, Darkbox._duration * 2);
        }
      });
    Darkbox._initial_size = size;
  },
  next: function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (Darkbox._current_index !== null) {
      Darkbox._current_index++;
      if (Darkbox._current_index >= Darkbox._figs.length) {
        Darkbox._current_index = 0;
      }
    }
    Darkbox.display();
  },
  prev: function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (Darkbox._current_index !== null) {
      Darkbox._current_index--;
      if (Darkbox._current_index < 0) {
        Darkbox._current_index = Darkbox._figs.length - 1;
      }
    }
    Darkbox.display();
  },
  zoom: function (event) {
    event.preventDefault();
    var $link = $(this),
      index = parseInt($link.data('index'), 10);
    Darkbox._current_index = index;
    Darkbox.display();
  }
};
$(Darkbox.init);

