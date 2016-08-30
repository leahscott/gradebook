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
				addStudent(data[0].value, data[1].value, data[2].value, data[3].value, data[4].value);
			}
		});
		event.preventDefault();
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
	function addStudent(firstName, lastName, classId, gpa, id) {
		// Get index of the new student based on current last student index
		var currentIndex = parseInt( $('table#current-students .student:last-child').find('.student-num').text() ) || 0;
		var newIndex = currentIndex + 1;
		// Create HTML string for new student
		var $newStudent = $('<tr class="student"><th class="student-num">'+newIndex+'</th><td class="student-first-name">'+firstName+'</td><td class="student-last-name">'+lastName+'</td><td class="student-class">'+classId+'</td><td class="student gpa">'+gpa+'</td><td class="edit-link"><a title="Edit" href="/edit/'+id+'"><i class="glyphicon glyphicon-pencil"></i></a><a href="/destroy/'+id+'" title="Delete" class="text-danger" style="padding-left:20px"><i class="glyphicon glyphicon-trash"></i></a></td></tr>').hide();
		// Add new student to document
		$('table#current-students').append($newStudent);
		$newStudent.fadeIn('slow');
		// Trigger success banner
		$('.student-created').removeClass('hidden');
	}
});