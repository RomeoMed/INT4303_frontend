$(document).ready(function(){
    $('.selectable .tile_anchor').click(function(){
        var tile = $(this).parent();
        if (tile.hasClass('selected')) {
            tile.removeClass('selected');
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

                var html = create_form(complete, false, '');
                $('#completed_cs .course_list').html(html);

                html = create_form(in_progress, true, '/in_progress');
                $('#in_prog_cs .course_list').html(html);

                html = create_form(waiting_app, true, '/waiting_approval');
                $('#waiting_cs .course_list').html(html);

                html = create_form(required, false, '');
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

    $('#flowchart-submit').click(function(e){
        e.preventDefault();
        if (!($('.error_msg').hasClass('hide'))) {
            $('.error_msg').addClass('hide');
        }

        var request = [];
        var errors = 0;
        var el;
        $('.selected').each(function(){
            var input;
            var id = $(this).attr('id');
            var status;
            if ($(this).hasClass('red')) {
                status = 'required';
            }
            else if ($(this).hasClass('blue')) {
                status = 'in_progress';
            }

            if ($(this).has('input')) {
                el = $(this).find('input');
                input = $(el).val();
            }
            else {
                input = id;
            }
            if (input === '' || input === null) {
                el.addClass('error_highlight');
                errors+=1;
            }
            else {
                request.push({'id': id, 'value': input, 'status': status});
            }
        });

        if (errors > 0) {
            request = [];
            $('.error_msg').removeClass('hide');
            return;
        }
        else {
            $.ajax({
                type: 'POST',
                url: '/submit_flowchart',
                contentType: 'application/json',
                data: JSON.stringify(request),
                success: function(response){
                    window.location.href = response.redirect_tgt;
                },
                error: function(xhr, textStatus, error){
                    console.log(xhr.statusText);
                    console.log(textStatus);
                    console.log(error);
                }
            });
        }
    });

});

var create_form = function(input, checkbox, current) {
    var html = '<form action="/admin_update_courses'+ current +'" method="POST" class="form">';

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
            html += '<div class="admin_p row" ' + style + '><div class="admin_input"> <input title="Approve/Confirm" type="checkbox" value="' + c_id + '" name="approve-' + c_number + '" class="admin_checkbox"/>';
            html += '<input title="Deny/Cancel" name="deny-' + c_number + '" type="checkbox" value="' + c_id + '" class="admin_checkbox"/></div>';
        } else {
            html += '<div class="admin_p row" ' + style + '>';
        }
        html += '<div class="admin_input left">' + c_number + '</div>' + '<div class="admin_input mid">' + c_name + '</div><div class="admin_input right"> credits: ' + credits + '</div></div>';
    }
    if (checkbox === true) {
        html += '<input class="btn btn-primary btn-lg btn-block admin_btn" value="submit" type="submit"/></form>';
    }
    else {
        html += '</form>'
    }
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

function openNav() {
    document.getElementById("sideNavigation").style.width = "250px";
    //document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("sideNavigation").style.width = "0";
    //document.getElementById("main").style.marginLeft = "0";
}

