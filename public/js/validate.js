function validate() {
	console.log("MOO");
	var form = $('.validatedForm').validate({
				rules : {
					email: {
						required : true,
						email: true
					},
					password : {
						required : true,
						minlength : 5
					},
					confirmPassword : {
						required : true,
						minlength : 5,
						equalTo : "#password"
					}
				}
			});
	if(form.form()) {
		$('.validatedForm').submit();
	}
}