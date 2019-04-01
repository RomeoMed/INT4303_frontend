$(document).ready(function(){
    $('#reg').submit(function(e){
        if($('#password').val() !== $('#confirm').val()) {
            e.preventDefault();
            $('#password').addClass('error_highlight');
            $('#confirm').addClass('error_highlight');
            $('#reg .err').removeClass('hidden');
        }
    });

    $('#email').focusout(function(){
        $.ajax({
            url: '/check_email/' + $('#email').val(),
            type: 'POST',
            success: function(response) {
                if (response.exists === 1) {
                    $('#email').addClass('error_highlight');
                    $('#reg .email_err').removeClass('hidden');
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    $('#password').keyup(function(){
        var pwd = $('#password');
        var confirm = $('#confirm');
        var err = $('#reg .err');

        if (pwd.hasClass('error_highlight')) {
            pwd.removeClass('error_highlight');
        }
        if (confirm.hasClass('error_highlight')) {
            confirm.removeClass('error_highlight');
        }
        if (!err.hasClass('hidden')) {
            err.addClass('hidden');
        }
    });

    $('#email').keyup(function(){
        if (!$('#reg .email_err').hasClass('hidden')) {
            $('#reg .email_err').addClass('hidden');
        }
        if ($('#email').hasClass('error_highlight')) {
            $('#email').removeClass('error_highlight');
        }
    });
});