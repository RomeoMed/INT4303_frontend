$(document).ready(function(){
    $('.tile_anchor').click(function(){
        var tile = $(this).parent();
        if (tile.hasClass('selected')) {
            if (confirm('Cancel selection?')) {
                tile.removeClass('selected');
            } else {
            }
        } else {
            tile.addClass('selected');
        }
    });
});

function fixDiv() {
    var $div = $("#stickynav");
    if ($(window).scrollTop() > $div.data("top")) {
        $('#stickynav').css({'position': 'fixed', 'top': '0', 'width': '100%', 'z-index': '10'});
    }
    else {
        $('#stickynav').css({'position': 'static', 'top': 'auto', 'width': '100%'});
    }
}

$("#stickynav").data("top", $("#stickynav").offset().top); // set original position on load
$(window).scroll(fixDiv);