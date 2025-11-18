
$(document).ready(function(){

		$(".select2").select2();

		$('[data-toggle="tooltip"]').tooltip();
		
		$("[data-mask]").inputmask();

		$('#upcoming-log').fadeIn(2000);
		
		$('.start').attr('data-original-title', 'Stop Device');
		$('.stop').attr('data-original-title', 'Start Device');


		$(".timepicker").timepicker({
		  showInputs: false
		});

		$('.fa-edit').click(function(){
			$(this).hide();
			$(this).siblings().show();
			$(this).siblings('.device-name').removeAttr('contenteditable').blur();
			$(this).siblings('.device-name').attr('contenteditable','true');
			$(this).parent().siblings().children('.detail').attr('contenteditable','true');
		});

		$('.save').click(function(){
			$(this).hide().siblings().removeAttr('contenteditable').blur();
			$(this).parent().siblings().children('.detail').removeAttr('contenteditable').blur();
			$(this).siblings('.close').hide().siblings('.fa-edit').show();
		});

				$('.save1').click(function(){
			$(this).hide().siblings().removeAttr('contenteditable').blur();
			$(this).parent().siblings().children('.detail').removeAttr('contenteditable').blur();
			$(this).siblings('.close').hide().siblings('.fa-edit').show();
		});
      $('.username_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
              $('.password_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
       $('.will_topic_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
       $('.will_msg_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
       $('.template_username_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
              $('.template_password_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
       $('.template_will_topic_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });
       $('.template_will_msg_save').click(function(){
      $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
      $(this).siblings('.close').hide().siblings('.fa-edit').show();
    });

		$('.close').click(function(){
			$(this).hide().siblings().removeAttr('contenteditable').blur();
			$(this).parent().siblings().children('.detail').removeAttr('contenteditable').blur();
			$(this).siblings('.save').hide().siblings('.fa-edit').show();
		});

		$('.sidebar-menu .fa-circle').click(function(){
			$(this).hide();
			$(this).siblings().show();
		});

		$("#nw-choose").change(function(){
			var choose_value = $(this).find('option:selected').val();
			$('#nw-name').text(choose_value);
			$('#'+choose_value).show();
			$('#'+choose_value).siblings().hide();
		});
		
		$('.navbar-nav li a ').hover(function(){
			$('.fa-plus').parent().parent('li').attr('data-original-title', 'Add');
			$('.fa-folder-open').parent().parent('li').attr('data-original-title', 'Open');
		});

		var start_btn = $('#startnetwork');
		if (start_btn.is(':checked')) {
            $('.device-start').attr('data-original-title', 'Stop Network');
        }else{
			$('.device-start').removeAttr('data-original-title').blur();
			$('.device-start').attr('data-original-title', 'Start Network');
		} 
		
		/*$('#startnetwork').on('click' , function(){
			var start_btn = $('#startnetwork');
			if (start_btn.is(':checked')) {
				$('.device-start').attr('data-original-title', 'Stop Network');
				alert('hello');
			}else{
				$('.device-start').removeAttr('data-original-title').blur();
				$('.device-start').attr('data-original-title', 'Start Network');
				alert('hai');
			} 
		});*/
				
		$('#nw-delete').click(function(){
			nw_deletealert();
		});
		
		function nw_deletealert(){
			swal("This operation will permenantly delete the network.", {
				buttons: ["Cancel", "yes"],
			});
		}

		$('#device-delete').click(function(){
			device_deletealert();
		});
		
		function device_deletealert(){
			swal("This operation will permenantly delete the device.", {
				buttons: ["Cancel", "yes"],
			});
		}
	
});