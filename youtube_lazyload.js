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
