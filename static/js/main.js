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

    $("#student_select").click(function(){
        $('#s_name').text('');
        $('#s_id').text('');
        $('#s_prog').text('');
        $('#s_email').text('');
        var selected_student = $(this).children("option:selected").val();
        var data = { student_id: selected_student };
        $.ajax({
            type: 'POST',
            url: '/get_student_progress',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response){
                var user_id = response.user_id;
                var user_email = response.email;
                var name = response.name;
                var prog = response.program;

                $('#s_name').text(name);
                $('#s_id').text(user_id);
                $('#s_prog').text(prog);
                $('#s_email').text(user_email);

                var complete = response.complete;
                var in_progress = response.in_progress;
                var waiting_app = response.waiting_approval;
                var required = response.required;

                var html = create_form(complete, false);
                $('#completed_cs .course_list').html(html);

                html = create_form(in_progress, true);
                $('#in_prog_cs .course_list').html(html);

                html = create_form(waiting_approval, true);
                $('#waiting_cs .course_list').html(html);

                html = create_form(required, false);
                $('#required_cs .course_list').html(html);
            },
            error: function(xhr, textStatus, error){
                console.log(xhr.statusText);
                console.log(textStatus);
                console.log(error);
            }
        });
    });

    $(".inner-nav a").click(function(event) {
        event.preventDefault();

        $('.inner-nav').removeClass("active");
        $(this).parent().addClass("active");
        var panel = $(this).attr('href');

        $(".panel").addClass('hide');
        $(panel).removeClass('hide');
    });

});

var create_form = function(input, checkbox) {
    var html = '<form action="/admin_update_courses" method="POST" class="form">';

    for (var i=0; i < input.length; i++) {
        var style = 'style="background-color:';
        if (i%2 === 0) {
            style += '#fff"';
        }else{
            style += '#E8E8E8"';
        }

        var cs_object = input[i];
        var c_id = cs_object.course_id;
        var c_name = cs_object.course_name;
        var c_number = cs_object.course_number;
        var credits = cs_object.credits;
        if (checkbox === true) {
            html += '<div class="admin_p row" ' + style + '><div class="admin_input"> <input type="checkbox" value="approve_' + c_id + '" class="admin_checkbox"/>';
            html += '<input type="checkbox" value="deny_' + c_id + '" class="admin_checkbox"/></div>';
        } else {
            html += '<div class="admin_p row" ' + style + '>';
        }
        html += '<div class="admin_input left">' + c_number + '</div>' + '<div class="admin_input mid">' + c_name + '</div><div class="admin_input right"> credits: ' + credits + '</div></div>';
    }
    html += '<input type="button" value="submit"/></form>';

    return html
};

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