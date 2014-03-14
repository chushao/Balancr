  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-48534451-1', 'balancr.herokuapp.com');
  ga('send', 'pageview');


$(document).ready(function() {
	var abCookie = $.cookie('__utmx');
	console.log(abCookie);
	if (!(abCookie === undefined)) {
		if (abCookie.charAt(abCookie.length - 1) == '1') {
			console.log("ChangeD");
			$("#workplay").remove();
			$("<li id='workplay'> <a href='/workplay'>work/play</a></li>").insertAfter("#doughnut");
		}
	}

	$("#workplay").click(function() {
		console.log("workplay clicked");
		ga("send", "event", "pressed", "click", "workplay");
		ga("send", "event", "workplay", "click");
	})

	$("#doughnut").click(function() {
		console.log("category clicked");
		ga("send", "event", "pressed", "click", "category");
		ga("send", "event", "category", "click");
	})
})