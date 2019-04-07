$(document).ready(function(){
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