def update_course_results(result):
    tmp_list = []

    counter = 1
    for res in result:
        course_id = res.get('course_id')

        if course_id not in tmp_list:
            tmp_list.append(res.get('course_id'))
        else:
            new_course_id = 'el' + str(counter) + '_' + str(course_id)
            res['course_id'] = new_course_id
        counter += 1
    return result


def process_request(data):
    return_list = []

    for item in data.keys():
        value = data.get(item)
        tmp_dict = {}

        if value == '':
            continue
        else:
            if '_' in item:
                prefix, cid = item.split('_')
            else:
                cid = item
            tmp_dict['course_id'] = cid
            tmp_dict['value'] = value

            return_list.append(tmp_dict)
    return return_list


def process_flowchart_result(result):
    response = {}
    required = []
    waiting = []
    in_prog = []
    complete = []
    for res in result:
        status = res.get('class_status')
        tmp_dict = {
            'course_number': res.get('course_number'),
            'credits': res.get('credits'),
            'course_id': res.get('course_id'),
            'course_name': res.get('course_name')
        }

        if status == 'required':
            required.append(tmp_dict)
        elif status == 'waiting_approval':
            waiting.append(tmp_dict)
        elif status == 'in_progress':
            in_prog.append(tmp_dict)
        elif status == 'complete':
            complete.append(tmp_dict)

    response['required'] = required
    response['waiting_approval'] = waiting
    response['in_progress'] = in_prog
    response['complete'] = complete

    return response
