$(function(){

	/*
	 * Submit new student form data to the application
	 * for processing
	 */
	$('form#new-student').on('submit', function(event){
		var values = $(this).serializeArray();
		$.ajax({
			type: 'POST',
			data: JSON.stringify(values),
			contentType: 'application/json',
			url: '/create-student',
			success: function(data) {
				document.getElementById('new-student').reset();
				addStudent(data[0].value, data[1].value, data[2].value, data[3].value, data[4].value, true);
			}
		});
		event.preventDefault();
	});

	/*
	 * Search form handleing
	 */
	$('form#student-search').on('submit', function(event){
		var query = $(this).find('input').val().trim();
		console.log(query);
		$.ajax({
			type: 'POST',
			data: { name: query },
			url: '/student-search',
			success: function(data) {
				clearStudentsTable();

				if (data.length == 0) {
					$('.no-students').removeClass('hidden');
				} else {
					$.each(data, function(index, student){
						addStudent(student.first_name, student.last_name, student.class_id, student.gpa, student.id, false);
					});
				}
			}
		});
		event.preventDefault();
	});

	$.ajax({
		type: 'GET',
		url: 'get-featured-students',
		success: function(data) {
			var bestStudent = data[0],
				worstStudent = data[1],
				$highestGpa = $('.highest-gpa'),
				$lowestGpa = $('.lowest-gpa')

			$highestGpa.find('.featured-name').text(bestStudent.first_name + " " + bestStudent.last_name);
			$highestGpa.find('.featured-class').text("Class: " + bestStudent.class_id);

			$lowestGpa.find('.featured-name').text(worstStudent.first_name + " " + worstStudent.last_name);
			$lowestGpa.find('.featured-class').text("Class: " + worstStudent.class_id);
		}
	});

	/*
	 * Format form data
	 */
	$('form#new-student').find('input').each(function(){
		$(this).on('blur', function(){
			this.value = $.trim( $(this).val() );

			if ($(this).attr('name') == 'gpa') {
				this.value = parseFloat($(this).val()).toFixed(1);
			}
		});
	});

	/*
	 * Delete Student
	 */
	$('td.edit-link').find('a[title="Delete"]').on('click', function(e){
		var $this = $(this);
		e.preventDefault();
		$.ajax({
			type: 'GET',
			url: $(this).attr('href'),
			success: function(data) {
				$this.closest('tr.student').fadeOut(300, function(){
					$(this).remove();
				});
				$('.student-deleted').removeClass('hidden');
			}
		});
	});

	/*
	 * Add new student to the document
	 */
	function addStudent(firstName, lastName, classId, gpa, id, notify) {
		// Create HTML string for new student
		var $newStudent = $('<tr class="student"><td class="student-activity"><div class="activity-btn active"></div></td><td class="student-first-name">'+firstName+'</td><td class="student-last-name">'+lastName+'</td><td class="student-class">'+classId+'</td><td class="student gpa">'+gpa+'</td><td class="edit-link"><a title="Edit" href="/edit/'+id+'"><i class="glyphicon glyphicon-pencil"></i></a><a href="/destroy/'+id+'" title="Delete" class="text-danger" style="padding-left:20px"><i class="glyphicon glyphicon-trash"></i></a></td></tr>').hide();
		// Add new student to document
		$('table#current-students').append($newStudent);
		$newStudent.fadeIn('slow');
		// Trigger success banner
		if (notify) {
			$('.student-created').removeClass('hidden');
		}

	}

	/*
	 * Delete all student rows from the current students table
	 */
	function clearStudentsTable() {
		// Hide the no students found message if it is active
		$('.no-students').addClass('hidden');
		// Clear table
		var students = $('table#current-students').find('tr.student');
		students.fadeOut(100);
	}
});