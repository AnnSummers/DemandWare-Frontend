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

        $('.topspot__slider').as_slider({
            dots: true,
            autoplay: true,
            autoplaySpeed: 4000
        });
    });

    $(document).ready(function(){
        $('.youtube_video').each(function() {
            var vw = $(window).width(),
                tgt = vw > 620 ? $(this).data('target') : this,
                my_id = 'yt_' + Math.floor(Math.random()*90000) + 10000;

            $(window).resize(function() {
                vw = $(window).width()
            });

            // Overlay the Play icon to make it look like a video player
            $(this).append($('<div/>', {'class': 'play'}));

            $(document).delegate('#'+this.id, 'click', function() {
                // Create an iFrame with autoplay set to true
                var iframe_url = 'https://www.youtube.com/embed/' + this.id + '?autoplay=1&autohide=1';
                if ($(this).data('params')) iframe_url+='&'+$(this).data('params');
                // The height and width of the iFrame should be the same as parent
                var iframe = $('<iframe/>', {'id': my_id, 'frameborder': '0', 'src': iframe_url, 'width': $(tgt).width(), 'height': $(tgt).height(), 'class':'youtube_embed' })

                // Replace the YouTube thumbnail with YouTube HTML5 Player
                $(tgt).append(iframe).hide().fadeIn(1000);
                $(tgt).append('<div class="yt_close" id="'+my_id+'_btn"><span>x</span> CLOSE</div>');
                $('#'+my_id+'_btn').click(function(){
                    $('#'+my_id+', #'+my_id+'_btn').remove();
                });
            });
        });

    });
});