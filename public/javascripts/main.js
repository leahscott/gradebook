$(function(){

	initPage();

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
			success: function(student) {
				document.getElementById('new-student').reset();
				addStudent(student, true);
				formatDates();
			}
		});
		event.preventDefault();
	});

	/*
	 * Filter form handleing
	 */
	$('form#student-filter').on('submit', function(event){
		event.preventDefault();

		var $this = $(this),
			gpaRange = $this.find('input[name="gpa"]').val().split(',');
			fromGpa = gpaRange[0],
			toGpa = gpaRange[1],
			joinDate = $this.find('input[name="date-joined"]').val(),
			activeIsChecked = $this.find('input[name="active"]').prop('checked'),
			inactiveIsChecked = $this.find('input[name="inactive"]').prop('checked');

		if (activeIsChecked && inactiveIsChecked) {
			var activity = 'any';
		} else if (activeIsChecked) {
			var activity = 'active';
		} else {
			var activity = 'inactive';
		}

		var querySlug = '/filter-students?fromGpa=' + fromGpa + '&toGpa=' + toGpa + '&dateJoined=' + joinDate + '&activity=' + activity;

		console.log(querySlug);

		var url = '';
		$.ajax({
			type: 'GET',
			url: querySlug,
			success: function(data) {
				clearStudentsTable();

				if (data.length == 0) {
					$('.no-students').removeClass('hidden');
				} else {
					$.each(data, function(index, student){
						addStudent(student, false);
					});
				}

				formatDates();
			}
		});

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
	 * Logic to be executed on page load
	 */
	function initPage(){
		// get featured students and update the DOM
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

		formatDates();

		$('input.gpa-slider').slider({});

		$('input.date-joined').datepicker({
			format: 'mm-dd-yyyy'
		});

		$('a.clear-filter').on('click', function(e){
			e.preventDefault();
			resetStudentsTable();
		});
	}

	/*
	 * Format student added date
	 */
	function formatDates(){
		var $dates = $('td.student-date-added');
		$.each($dates, function(index, date){
			var $initialDate = $(date),
			 	$dateText = $initialDate.text(),
				date = new Date($dateText),
				months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

			$initialDate.text( months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() );
		});
	}


	/*
	 * Add new student to the page
	 */
	function addStudent(student, notify) {
		// Create HTML string for new student
		var $newStudent = $('<tr class="student"><td class="student-activity"><div class="activity-btn ' + (student.active ? 'active' : 'inactive') + '"></div></td><td class="student-first-name">'+student.first_name+'</td><td class="student-last-name">'+student.last_name+'</td></td><td class="student-date-added">'+student.date_added+'</td><td class="student-class">'+student.class_id+'</td><td class="student gpa">'+student.gpa+'</td><td class="edit-link"><a title="Edit" href="/edit/'+student._id+'"><i class="glyphicon glyphicon-pencil"></i></a><a href="/destroy/'+student._id+'" title="Delete" class="text-danger" style="padding-left:20px"><i class="glyphicon glyphicon-trash"></i></a></td></tr>').hide();
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

	/*
	 * Reset students table to show all students
	 */
	function resetStudentsTable() {
		$.ajax({
			type: 'GET',
			url: 'get-all-students',
			success: function(data) {

				clearStudentsTable();

				if (data.length == 0) {
					$('.no-students').removeClass('hidden');
				} else {
					$.each(data, function(index, student){
						addStudent(student, false);
					});
				}

				formatDates();
			}
		});
	}
});