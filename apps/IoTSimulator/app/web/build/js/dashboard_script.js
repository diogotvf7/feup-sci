var network_chosen="";
var old_network_chosen="";
var id="";
var publish_status="";
var no_of_devices_old=0;

function set_network(network_name)
{
	document.getElementById("choice").value='dbselect';
	$.ajax({
	   	url: '/?config='+network_name,
		data: $("form[name='myform']").serialize(),
	    type: "POST",
	    async:false,
	     success:function (msg) {
        m=msg;
        for (var key in m)
        {
          if (key=="Description")
            document.getElementById("network_description").innerText=m[key];
          else
            document.getElementById("created_on").innerText='Created on: '+m[key];
        }
	     }
	});
  document.getElementById("choice").value='getNetworkStatus';
  $.ajax({
      url: '/?config='+network_name,
    data: $("form[name='myform']").serialize(),
      type: "POST",
      async:false,
       success:function (msg) {
        m=msg;
        for (var key in m)
        {
          if (key=="Total")
            document.getElementById("total_devices").innerText='Total Devices : '+m[key];
          else if (key=="Running")
            document.getElementById("active_devices").innerText='Devices Active : '+m[key];
          else
            document.getElementById("inactive_devices").innerText='Devices Inactive : '+m[key];
        }
       }
  });  
  no_of_devices_old=(document.getElementsByClassName("detail").length)/2;
  old_network_chosen=network_chosen;
	network_chosen=network_name;
}

