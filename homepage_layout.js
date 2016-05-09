function defer(method) {
    if (window.jQuery) { method(window.jQuery); }
    else  { setTimeout(function() { defer(method) }, 100); }
}

function waitForPlugin(method) {
    if (jQuery().as_slider) { method(jQuery().as_slider); }
    else  { setTimeout(function() { waitForPlugin(method) }, 100); }
}

defer(function($){
    waitForPlugin(function(as_slider){
        jQuery().as_slider = as_slider;
        window.initSlider = function (el) {
            var tgt = $(el).data('target'),
                $target = $('.' + tgt);

            if ( $(el).hasClass('btn--active') ) return;

            $('.product_reel .slider-initialized').hide();

            $('.product_reel__controls .btn--active').removeClass('btn--active');
            $(el).addClass('btn--active');

            if (!$target.hasClass('slider-initialized')) {
                $target.as_slider({
                    slidesToShow: 6,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false,
                    speed: 200,
                    responsive: [
                        {
                            breakpoint: 1100,
                            settings: { slidesToShow: 5 }
                        },
                        {
                            breakpoint: 860,
                            settings: { slidesToShow: 4 }
                        },
                        {
                            breakpoint: 750,
                            settings: { slidesToShow: 3 }
                        },
                        {
                            breakpoint: 490,
                            settings: { slidesToShow: 2 }
                        }
                    ]
                });
            }
            $target.show();
        }
        initSlider( $('.js-lingerie_slider') );

        $('.js-lingerie_slider').click(function(){ initSlider( this ) });
        $('.js-sextoy_slider').click(function(){ initSlider( this ) });
        $('.js-erotic_slider').click(function(){ initSlider( this ) });

        $('#horizontal-carousel').as_slider({
          speed: 800,
          slidesToShow: 6,
          slidesToScroll: 6,
          responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 4
              }
            },
            {
              breakpoint: 800,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 3
              }
            },
            {
              breakpoint: 580,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2
              }
            }
          ]
        });

        $('.topspot__slider').as_slider({
            dots: true,
            autoplay: true,
            autoplaySpeed: 4000
        });
    });
});
