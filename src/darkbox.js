/*jslint browser: true */
/*global window, jQuery */
(function (window, $) {
  "use strict";
  var KEY_CODES = { esc: 27, left: 37, right: 39 };
  var figs = [],
    current_index = null,
    initial_size = { w: 0, h: 0 },
    duration = 200,
    $win = $(window);

  function loadImage() {
    var fig = figs[current_index],
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
  }

  function preanimate() {
    var $overlay = $('#db-overlay'),
      $zoom = $overlay.find('.db-zoom'),
      $zoom_img = $overlay.find('img'),
      $caption = $overlay.find('figcaption');

    $zoom_img.css('opacity', 0).hide();
    $caption.css('opacity', 0).hide();
    $zoom.css({
      'width': initial_size.w + 'px',
      'height': initial_size.h + 'px',
      'margin-top': -1 * initial_size.h / 2 + 'px',
      'margin-left': -1 * initial_size.w / 2 + 'px'
    });
  }

  function doAnimate($img) {
    var $overlay = $('#db-overlay'),
      $zoom = $overlay.find('.db-zoom'),
      $zoom_img = $overlay.find('img'),
      $caption = $overlay.find('figcaption'),
      win_size = { w: $win.width(), h: $win.height() },
      scaled_size = { w: Math.round(win_size.w * 0.75), h: Math.round(win_size.h * 0.75) },
      fig = figs[current_index],
      size;

    if (fig.isLandscape()) {
      size = (fig.size.w < scaled_size.w) ? fig.size
                : { w: scaled_size.w, h: Math.round(fig.size.h * scaled_size.w / fig.size.w) };
    } else {
      size = (fig.size.h < scaled_size.h) ? fig.size
              : { w: Math.round(fig.size.w * scaled_size.h / fig.size.h), h: scaled_size.h };
    }

    if ($overlay.not(':visible')) {
      $overlay.show().css('opacity', 1);
    }
    $zoom
      .animate({
        width: size.w + 'px',
        marginLeft: -1 * size.w / 2 + 'px'
      }, duration)
      .animate({
        height: size.h + 'px',
        marginTop: -1 * size.h / 2 + 'px'
      }, duration)
      .promise().done(function () {
        $zoom_img.replaceWith($img).show().animate({ opacity: 1 }, duration * 2);
        if (fig.caption.length > 0) {
          $caption.text(fig.caption).show().animate({ opacity: 1 }, duration * 2);
        }
      });
    initial_size = size;
  }

  var Darkbox = {
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
          figs.push({
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
        case KEY_CODES.esc:
          Darkbox.dismiss(event);
          break;
        case KEY_CODES.left:
          Darkbox.prev(event);
          break;
        case KEY_CODES.right:
          Darkbox.next(event);
          break;
        }
      });
    },
    dismiss: function (event) {
      event.preventDefault();
      $('#db-overlay').css('opacity', 0).hide();
      initial_size = { w: 0, h: 0 };
    },
    display: function () {
      preanimate();
      loadImage().done(doAnimate).fail(doAnimate);
    },
    next: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (current_index !== null) {
        current_index++;
        if (current_index >= figs.length) {
          current_index = 0;
        }
      }
      Darkbox.display();
    },
    prev: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (current_index !== null) {
        current_index--;
        if (current_index < 0) {
          current_index = figs.length - 1;
        }
      }
      Darkbox.display();
    },
    zoom: function (event) {
      event.preventDefault();
      var $link = $(this),
        index = parseInt($link.data('index'), 10);
      current_index = index;
      Darkbox.display();
    }
  };
  $(Darkbox.init);
}(window, jQuery));