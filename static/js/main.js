$(document).ready(function(){
    $('.selectable .tile_anchor').click(function(){
        var tile = $(this).parent();
        if (tile.hasClass('selected')) {
            tile.removeClass('selected');
        } else {
            tile.addClass('selected');
        }
    });

    $('.tile_anchor').hover(function(){
        var center = $(this).find('center');
        var text = $(center).find('b').text();
        var desc = descriptions[text];
        $(this).attr('title', desc);
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

var descriptions = {
	"COM_1103": "College Composition develops students' acquisition of the fundamental principles of academic writing. This course focuses on the development of writing thesis statements and main arguments, topic sentences, transitional words and phrases, supporting paragraphs, use of evidence, essay organization, and research skills. Extensive writing and research practice is required.",
	"MCS_1074": "Quadratic equations, functions and graphs, systems of equations, inequalities, logarithms, trigonometric functions, identities, equations. Lecture 4 hrs.",
	"ACC_2013": "Introduction to basic financial accounting principles for a business enterprise. Topics include the accounting cycle, analyzing business transactions, measuring income, evaluating financial reporting and analysis, recording of merchandising operations, accounting of inventories, cash, receivables, current liabilities, and the time value of money.",
	"MGT_2203": "This course provides an introduction to the role of the manager and the management process in the context of organizations and society. The focus of the course is on effective management of the organization in a changing society and on improved decision making and communication as they relate to planning, organizing, coordinating and controlling.",
	"COM_2103": "Training in a systematic method for producing effective technical communication, written reports, letters, and memos as well as oral presentations. Lecture 3 hours. 3 hours credit",
	"SSC_2403": "Aspects of philosophy, political theory, science, art and religion, from ancient Egypt to 1789, as they have contributed to the formation of the American experience Readings include selections from Plato, Aristotle, the Bible, Machiavelli, Hobbes, and other important thinkers. The student's ability to reflect critically upon the major ideas, values, institutions, events and personalities that have helped to shape the contemporary United States is emphasized. Seeks to foster an attitude of critical engagement and to develop students' writing and oral skills through papers and class participation. Lecture 3 hours. 3 hours credit. This course may be taken concurrently with COM1103 English Composition.",
	"INT_2103": "How information is used and managed within organizations. The use of information as a resource, developing and managing information systems, IS planning and implementation, reengineering, end-user computing, information systems strategies, network and telecommunications systems management, electronic commerce and societal and ethical issues relating to information systems design and use.",
	"ACC_2023": "Provides an overview of accounting information and the skills necessary to appraise and manage a business. Covers several current accounting topics to provide an understanding of how managers use accounting information to plan operations, control activities, and make decisions. Topics covered include product costing, cost behavior analysis, and budgeting.",
	"LLT_1213": "Exploration of the great works of world literature and art in their historical contexts so that students may discover the variety and development of human thought and feeling in various cultures. Works of the Classical, Medieval, and Renaissance periods in Europe as well as Asian and Middle-Eastern works that have influenced the West, in the forms of poetry, drama, fiction, visual art, and music. A writing-intensive course requiring outside papers and essay tests. Approximately 80 percent of the course is devoted to the study of literature. Lecture 3 hrs. 3 hours credit",
	"SSC_2303": "Survey of macroeconomics and microeconomics, with emphasis of fundamental tools of economic analysis and policy. Introduction of supply and demand, national income determination, theory of the firm, and market structure. Lecture 3 hours. 3 hours credit. The following courses can be taken concurrently with this course: MCS 0054, MCS 0055, MCS 1113, MCS 0083, MCS 0085, MCS 0093, MCS 0074, MCS 1414.",
	"FIN_3103": "Overview of the finance function of the firm, financial analysis, planning and budgeting, and the impact of alternative capital structures on the firm. Emphasis on understanding and utilizing present value and future value concepts.",
	"ACC/FIN/IT/MGT_XXX3": "Accounting, Finance, IT or Management Elective",
	"COM_2113": "Principles of individual and group speaking, with emphasis on structure, content, and delivery of ideas and arguments. This course may be taken concurrently with COM1103 English Composition.",
	"MGT_2113": "Introduction to U.S. legal system, its role in management of business and non-profit organizations, and its relationship to the international legal environment. Topics include a survey of constitutional law in business, administrative law, contract and UCC, tort law, agency law, and intellectual property. Regulatory issues associated employment, securities, competition, consumer protection, and environmental rules are covered. Issues of ethics and social responsibility are addressed.",
	"MGT_3033": "The theory of international trade with emphasis on gains from international trade, determination of the level and composition of trade, barriers to trade, balance of payments and the international monetary system.",
	"MGT_3053": "Directed work experience in the area of the student's designated business major. Detailed written report(s) and assigned readings are required.",
	"HRM_3023": "Provides an overview of the role and key functions of human resources management in organizations. Topics include human resource strategic planning, job analysis, staffing, training and development, performance appraisal, compensation, retention, labor relations, health and safety, and fairness concerns. Employment law and compliance, employee well-being, globalization and developing trends in human resources are also introduced.",
	"MGT_4023": "The fundamental concepts and problems of management science as applied to both the manufacturing and service organizations are covered in this course. Topics include concepts, models and problems of management science; extent, benefits, and limitations of the applications of the related tools, techniques, and philosophies; and mathematical/statistical thinking and quantitative models.",
	"MGT_3113": "Introduction to the field of operations management and relevant quantitative tools to manage cost, quality, time, and flexibility of business operations. Topics include operations strategy, manufacturing and service processes, supply chain management, lean operations, quality management and control, forecasting techniques, capacity and aggregate planning, inventory control, and project scheduling.",
	"MGT_4213": "This capstone course brings together the various disciplines in the business administration program that contribute to management strategies and policies. Addresses concepts and tools help students develop an understanding of how strategies and policies are formulated and implemented.",
	"MGT_4113": "This course covers the options available for dealing with decisions under uncertainty. It is designed to acquaint students with basic ideas from decision theory to examine how to make better decisions. Topics include judgment and choice biases, applying statistical data, dealing with risk and decision making under risk, decision making under uncertainty, assessment of probabilities, Bayesian statistics, value of information, decisions with multiple objectives, analytic hierarchy process (AHP), game theory, dynamic programing, and well-being theory.",
	"LTT_1213":"Exploration of the great works of world literature and art in their historical contexts so that students may discover the variety and development of human thought and feeling in various cultures. Works of the Classical, Medieval, and Renaissance periods in Europe as well as Asian and Middle-Eastern works that have influenced the West, in the forms of poetry, drama, fiction, visual art, and music. A writing-intensive course requiring outside papers and essay tests. Approximately 80 percent of the course is devoted to the study of literature. Lecture 3 hrs. 3 hours credit",
	"MCS_1224":"Must have placement. Limits and continuity, differentiation, curve sketching, applications of differentiation, integration, methods and applications of integration, multivariable calculus. Lecture: 4 hrs",
	"INT_2114":"This course is designed for beginners, typically for business students, to explore core concepts of programming logics and popular programming languages. Topics will include fundamental topics such as data types, variables, input, output, control structures, modules, functions, arrays, files, object-oriented concepts, GUI development, and event-driven programming. This course includes 3 lecture hours and 1 lab hour (4 credit hours). The lab exercises are designed to be completed online or during the on-ground lab sessions, which depends upon the instructorâ€™s guidance. No prior knowledge of programing is assumed.",
	"LLT_1223":"Works of the Neoclassical, Romantic, Modern and Post-Modern eras in Europe and North American, as well as those from Asia, Africa, and Latin America. Works selected may include poetry, drama, fiction, the visual arts, and music. A writing-intensive course requiring outside papers and essay tests. Approximately 80 percent of the course is devoted to the study of literature. Lecture 3 hours, 3 hours credit",
	"MCS_2124":"This course covers descriptive statistics, probability, and probability distributions with an emphasis on statistical inference such as confidence intervals, hypothesis testing, correlation and regression, chi-square tests, t- and F-distributions, and selected nonparametric tests. Students will also be introduced to related concepts and techniques of differential and integral calculus.",
	"INT_2134":"This course is designed for beginners, typically for business students, to explore core concepts of object-oriented programming (OOP) by using Java. Topics will include elementary programming, functions, strings, loops, methods, OOP design, data types, object and class, inheritance and polymorphism, event handling, binary I/O, and even recursion. This course includes three lecture hours and one lab hour (four credit hours). The lab exercises are designed to be completed online or during the on-ground lab sessions, which depends upon the instructor's guidance. No prior knowledge of programing is assumed.",
	"INT_3203":"This course is designed for beginners, who want to explore core concepts of computer networks. The aim of this course is to introduce fundamental concepts in the design and implementation of computer networks and the protocols such as TCP/IP, UDP and SSL. Students will learn how information is encoded into digital packets, how it is transported across local networks and how organizations interconnect over the Internet backbone. This course will emphasize the critical importance of open network standards and protocols, which allow software and hardware from a variety of vendors to inter-operate while also driving down the cost of network systems. In addition to the exploring the capabilities and limitations of todayâ€™s most popular networks, including Ethernet, Wi-Fi, and 2G/3G/4G, weâ€™ll also cover topics closely related to networks, including security. The lab exercises are designed to be completed online or during the on-ground lab sessions, which depends upon the instructorâ€™s guidance. No prior knowledge of computer networks is assumed.",
	"INT_2143":"This course covers the fundamentals of database management systems (DBMS) with an emphasis on the relational database systems. More specifically, it focuses on principles and methodologies of database modelling, design and manipulation of relational databases. Additionally, this course will explore big data and NoSQL. This course emphasizes on hands-on skills. Students are required to use database applications to practice database design and manipulation through assignments and lab exercises involving the data modelling, database development.",
	"INT_2123":"This course provides both â€˜theoryâ€™, e.g., web design and e-commerce and â€˜practiceâ€™, e.g., HyperText Markup Language (HTML), Cascading Style Sheets (CSS), and JavaScript to train students to create web pages. Students will develop web pages with current technologies and practices. In addition, hands-on practice, website case projects, and web research are emphasized in this class.",
	"SSC_2413":"Aspects of philosophy, political theory, science, art and religion, from ancient Egypt to 1789, as they have contributed to the formation of the American experience Readings include selections from Plato, Aristotle, the Bible, Machiavelli, Hobbes, and other important thinkers. The student's ability to reflect critically upon the major ideas, values, institutions, events and personalities that have helped to shape the contemporary United States is emphasized. Seeks to foster an attitude of critical engagement and to develop students' writing and oral skills through papers and class participation. Lecture 3 hours. 3 hours credit. This course may be taken concurrently with COM1103 English Composition.",
	"ANY_XXX4":"Any Elective",
	"SSC_2423":"A continuation of the study of philosophy, political theory, science, art and religion begun in Foundations of the American Experience. Discusses the framing of the United States Constitution in the late 18th century, and examines the works of important social documents of the 19th and 20th centuries. Both primary texts and selected readings in issues of contemporary importance are read. Develops students' writing and verbal skills through written assignments and class presentations. Lecture 3 hours. 3 hours credit",
	"INT_3603":"Ubiquitous computing is a reality into our workplaces and homes. Personal computing devices such as smartphones, tablets, laptops and notebooks surround us at home and work. The web too has grown from a largely academic network into the hub of business and everyday transactions. This course will focus on how people are a core component in the design and use of IT, and introduces aspects of human behavior that influence the design, development, and use of interactive computer systems. The course also considers a variety of methods that can be applied to the design and evaluation of interactive systems. The accessibility of the computer systems will be discussed as well, because of different needs that a human end-user might have. The student will study the entire cycle of HCI design and implementation, such as forming of HCI requirements, modeling the interaction process, designing the interface, implementing the resulting design, and evaluating the implemented product.",
	"INT_3803":"This course covers mostly hands-on topics in how to retrieve data from a relational database management systems (RDBMS) with an emphasis on Structured Query Language (SQL) queries. More specifically, it focuses on how to retrieve data from one or more tables, how to insert, update, and delete data, how to use functions, how to code summary and subqueries, and how to create and design database. Students are required to use database applications to practice database design and implementation through assignments and lab exercises and conduct a class project involving the database development and implementation.",
	"INT_3703":"This course will cover Enterprise Resource Planning (ERP) systems. Topics include rationale for acquiring and implementing ERP, selection of ERP software, integration of processes and transactions in ERP, and the challenges associated with successful implementation of global ERP applications. Students will use SAP ERP (enterprise resource planning) software throughout the course, the same software used by many organizations in industry.",
	"INT_4013":"This is an advanced course on computer networking. The aim of this course is to expand upon the fundamental and theoretical concepts covered in Computer Networks I and will emphasize network infrastructure design, advanced router configuration, configuring and managing the network infrastructure, analyzing network data traffic, Linux networking, Internet routing, voice over IP, and network security. Tools for vulnerability and port scanning, traffic monitoring, and digital forensics will also be introduced.",
	"INT_4023":"As networks continue to grow and as computing becomes more and more ubiquitous, today's IT Managers need to have a thorough understanding of security and the risks associated when inappropriate security exists. Students will explore basic security concepts, principles and strategy, how to develop and manage IT security program and how to strategize and plan an IT architecture. Students will also discuss other IT security issues as it relates to current market trends.",
	"COM_3000":"This course is a single-session timed essay exam that tests proficiency in written English.",
	"ANY_XXX3":"Any Elective",
	"INT_4203":"Developing an information system from concept to implementation. Various system development methodology techniques and introduction to the system development life cycle. Special emphasis on developing good communication skills between users, clients, team members and others that are associated with the project.",
	"MGT_3103":"Project is a temporary endeavor undertaken to create a unique product, service, or result. Project management is the application of knowledge, skills, tools and techniques to project activities to meet project requirements. Breaking down a big project into small, manageable and action-oriented steps adds value and benefits organizations and to all the team members involved. Ability to manage time, organize and prioritize is very important when leading teams. Project management is a growing career path that is highly rewarding and most organizations receive real benefits from it. Benefits include better control, better customer relations, increase in projects return on investment, etc. This course provides the foundation for successful project initiation, planning, executing, controlling, and terminating within the realm of practical applications. The course uses real-world examples and identifies common mistakes and pitfalls in project management. In accord with the established and common project management standards (PMBOK), topics covered include project chartering, scooping, estimating, scheduling, staffing, budgeting, tracking and controlling, and closing. The Microsoft Project software is utilized for project management.",
	"LLT/SSC/PSY_XXX3":"LLT, SSC, PSY elective",
	"INT_4303":"This course focuses on the ultimate goal of solving business problems with technology and/or solving business problems in the world of technology. Students will apply the knowledge and skills acquired from all areas of study during their undergraduate BSIT experience to analyze and develop solutions to address business challenges. This journey is taken via extensive use of case studies and outside readings.",
	"COM_XXX3":"Communication elective",
	"IT/MGT_XXX3":"IT or Management Elective",
	"BIO/CHM/FSC/PHY_XXX3": "BIO, CHM, FSC, PHY courses"
}