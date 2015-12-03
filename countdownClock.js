(function($){
    $.countdownClock = function(el){
        var cc = this;
        cc.$el = $(el);
        cc.el = el;

        var html = '<div class="count_days"><span>--</span><div class="smalltext">Days</div></div><div class="count_hours"><span>--</span><div class="smalltext">Hrs</div></div><div class="count_minutes"><span>--</span><div class="smalltext">Mins</div></div><div class="count_seconds"><span>--</span><div class="smalltext">Secs</div></div>';

        // Add a reverse reference to the DOM object
        cc.$el.data("countdownClock", cc);

        cc.init = function(){
            cc.$el.append(html);
            cc.end = cc.$el.data('enddate');
            cc.update();
            cc.timeinterval = setInterval(cc.update,1000);
            $(document).on('updateTimer', function(event, timer, t){
              $('.count_days span', timer).html( t.days );
              $('.count_hours span', timer).html( ('0' + t.hours).slice(-2) );
              $('.count_minutes span', timer).html( ('0' + t.minutes).slice(-2) );
              $('.count_seconds span', timer).html( ('0' + t.seconds).slice(-2) );
            })
        };

        cc.update = function(){
            var t = cc.timeLeft();
            $(document).trigger('updateTimer', [cc.el, t]);
            if(t.total<=0) clearInterval(cc.timeinterval);
        }

        cc.timeLeft = function(){
            var t= Date.parse(cc.end) - Date.parse(new Date());
            var seconds = Math.floor( (t/1000) % 60);
            var minutes = Math.floor( (t/1000/60) % 60);
            var hours = Math.floor( (t/(1000*60*60)) %24);
            var days = Math.floor( t/(1000*60*60*24) );
            return{
                'total': t,
                'days' : days,
                'hours': hours,
                'minutes' : minutes,
                'seconds': seconds
            };
        }

        cc.init();
    };
    $.fn.countdownClock = function(){
        return this.each(function(){
            (new $.countdownClock(this));
        });
    };
})(jQuery);
