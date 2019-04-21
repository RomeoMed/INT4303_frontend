var $window = $(window);
$(document).ready(function(){
    checkWidth();
    $(window).resize(checkWidth);

    $('.flow_header').click(function(){
        if ($window.width() < 800) {
            var id = $(this).attr('id');
            var el_class = '.' + id;
            console.log(el_class);
            $(el_class).each(function(){
                if ($(this).hasClass('hide')) {
                    $(this).removeClass('hide');
                }
                else {
                    $(this).addClass('hide');
                }
            });
        }
    });
});

var checkWidth = function() {
    var windowsize = $window.width();
    var flowcharts = $('.fc-content');

    if (windowsize < 800) {
        $('.fc-content .tile').each(function(){
            $(this).addClass('hide');
        });
    }
}