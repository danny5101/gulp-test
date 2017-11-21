$(function(){
	//文本框效果
	$('.eval-text>textarea').focus(function(event) {
		if ($(this).val() === this.defaultValue) {
			$(this).val('');
		}
	}).blur(function(event) {
		if ($(this).val() === '') {
			$(this).val(this.defaultValue);
		}
	}).on('input', function(event) {
        //限制字数最大为500	
		var len = $(this).val().length;
		if (len>500) {
			$(this).val($(this).val().substring(0,500));
		}
	});

	//点击星星评分
	$('.eval .stars>li').on('click', function(event) {
		var index = $(this).index()+1;
		var starLi = $('.eval .stars>li');
		starLi.css('background-position', '0 0');
		for (var i = 0; i < index; i++) {
			starLi.eq(i).css('background-position', '0 -80px');
		}
	}).eq(4).trigger('click');
})