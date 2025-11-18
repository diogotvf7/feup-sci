var network_chosen = "";
var old_network_chosen = "";
var id = "";
var publish_status = "";
var no_of_devices_old = 0;
var websocket_created = [];
var network_websockets = []
var template_chosen = false;
var scroll_end_index = 0;
var before_template_all_disconnected = true;
var licensed_count_exceed = false;
$('#on-connect-event').on('shown.bs.modal', function () {
  $('#conn_topic').focus();
});
$('#on-disconnect-event').on('shown.bs.modal', function () {
  $('#disconn_topic').focus();
});
$("#specific-interval-event").on('shown.bs.modal', function () {
  $('#specific_time_topic').focus();
});
$("#instant-event").on('shown.bs.modal', function () {
  $('#instant_topic').focus();
});
$("#specified-duration-event").on('shown.bs.modal', function () {
  $('#specific_duration_topic').focus();
});
$("#wholeday-event").on('shown.bs.modal', function () {
  $('#whole_day_topic').focus();
});
$("#from-csv-event").on('shown.bs.modal', function () {
  $('#from_csv_topic').focus();
});

$("#behaviour-command").on('shown.bs.modal', function () {
  $('#request_topic').focus();
});
$("#subscribe-command").on('shown.bs.modal', function () {
  $('#subscribe_topic').focus();
});
$("#network-modal").on('shown.bs.modal', function () {
  $('#network-name').focus();
});
$("#new-device").on('shown.bs.modal', function () {
  $('#device-name-txt').focus();
});
$("#device-template").on('shown.bs.modal', function () {
  $('#dev_name_prefix_txt_temp').focus();
});
$("#edit-device").on('shown.bs.modal', function () {
  if (network_chosen == 'bevy_sim_template')
    $('#edit-device-desc').focus();
  else
    $('#edit-device-name').focus();
});
$("#edit-device").on("hide.bs.modal", function () {
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("edit-template-icon").style.display = "inline-block";
  else
    document.getElementById("edit-device-icon").style.display = "inline-block";


});
function show_dashboard() {

  if (document.getElementById("dashboard_div"))
    document.getElementById("dashboard_div").style.backgroundColor = '#f1f1f1';
  if (document.getElementById("devices_div"))
    document.getElementById("devices_div").style.backgroundColor = '#fbfafa';
  if (document.getElementById("devices"))
    document.getElementById("devices").style.display = "none";
  if (document.getElementById("dashboard"))
    document.getElementById("dashboard").style.display = "block";
  var s = document.getElementsByClassName("treeview active devlist");
  document.getElementById("devices_header").style.display = "block";
  document.getElementById("template_header").style.display = "none";

  for (var xd = 0; xd < s.length; xd++) {
    s[xd].setAttribute("class", "treeview devlist");
  }
    var enabletemplates = true;
  var table_name = window.network_peru;
  $.ajax({
    url: '/api/get/simsettings?curr_time=' + new Date().getTime()+'&Table_name=' + table_name,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      //alert(msg);
      m = JSON.parse(msg);
      mg = m['mg_status'];
      if ((mg == 'Azure_IoT') || (mg == 'Aws_IoT'))
      {
        enabletemplates = false;
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");        
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }
    }
  });  

  var devices_count = 0;
  var all_disconnected;
 
  $.ajax({
    url: '/getNetworkStatus?curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "json",
    async: false,
    success: function (msg) {
      // console.log("getNetworkStatus:",msg);
      // m = JSON.parse(msg);
      m = msg;
      var total_topics_count = 0;
      var published_topics_count = 0;
      var subscribed_topics_count = 0;
      var active_devices_count = 0;
      for (var key in m) {
        if (key == "Total") {
          document.getElementById("total_devices").innerText = 'Total Devices : ' + m[key];
          devices_count = parseInt(m[key]);
          document.getElementById("devices_chart").setAttribute("data-max", devices_count);

        }
        else if (key == "Running") {
          document.getElementById("active_devices").innerText = 'Devices Active : ' + m[key];
          active_devices_count = parseInt(m[key]);
          if (active_devices_count == 0) {
            all_disconnected = true;
            $('.device-start').removeAttr('data-original-title').blur();
            $('.device-start').attr('data-original-title', 'Start Network');
            document.getElementById("startnetwork").checked = false;
            document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
          }
          else {
            all_disconnected = false;
            $('.device-start').removeAttr('data-original-title').blur();
            $('.device-start').attr('data-original-title', 'Stop Network');
            document.getElementById("startnetwork").checked = true;
            document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
          }

        }
        else if (key == "Not running")
          document.getElementById("inactive_devices").innerText = 'Devices Inactive : ' + m[key];
        else if (key == "pub_count") {
          document.getElementById("published_topics").innerText = 'Topics Published : ' + m[key];
          published_topics_count = parseInt(m[key]);
          total_topics_count = total_topics_count + published_topics_count;

        }
        else if (key == "sub_count") {
          document.getElementById("subscribed_topics").innerText = 'Topics Subscribed : ' + m[key];
          subscribed_topics_count = parseInt(m[key]);
          total_topics_count = total_topics_count + subscribed_topics_count;
        }
        else if (key == "Description") {
          document.getElementById("network_description").innerText = m[key];
        }
        else if (key == "Created_on") {
          document.getElementById("created_on").innerText = 'Created on : ' + m[key];
        }
        else if (key == "Edited_on") {
          document.getElementById("edited_on").innerText = 'Edited on : ' + m[key];
        }
      }
      document.getElementById("topics_chart").setAttribute("data-max", total_topics_count);
      //document.getElementById("topics_chart").setAttribute("value",published_topics_count);
      $('#devices_chart').trigger('configure', {
        'max': devices_count
      });

      $("#devices_chart").val(active_devices_count).trigger("change");

      $('#topics_chart').trigger('configure', {
        'max': total_topics_count
      });
      // $("#topics_chart").knob({ min: 0,max: total_topics_count});

      $("#topics_chart").val(published_topics_count).trigger("change");
    }
  });
  var s = document.getElementsByClassName("network_log");
  for (xd = 0; xd < s.length; xd++)
    s[xd].style.display = "none";
  document.getElementById("empty-network-log").style.display = "block";
  if (template_chosen == true) {
    if (document.getElementById("network_log_" + old_network_chosen.toUpperCase()).innerHTML == "")
      document.getElementById("empty-network-log").style.display = "block";
    else
      document.getElementById("empty-network-log").style.display = "none";

    document.getElementById("network_log_" + old_network_chosen.toUpperCase()).style.display = "block";
  }
  else {
    if (document.getElementById("network_log_" + network_chosen.toUpperCase()).innerHTML == "")
      document.getElementById("empty-network-log").style.display = "block";
    else
      document.getElementById("empty-network-log").style.display = "none";

    document.getElementById("network_log_" + network_chosen.toUpperCase()).style.display = "block";
  }
  if (devices_count > 0) {
    document.getElementById("devices").style.display = "none";
    document.getElementById("no_devices").style.display = "none";
    document.getElementById("right_side_content").removeAttribute("style");
    document.getElementById("device-delete1").style.display = "block";
    document.getElementById("alltables").style.display = "block";
    document.getElementById("device_menu").setAttribute("class", "menu events events-disabled")
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("search_lens").style.pointerEvents = "auto";
    document.getElementById("startnetworkicon").style.display = "block";
  }
  else {
    document.getElementById("devices").style.display = "none";
    document.getElementById("no_devices").style.display = "block";
    document.getElementById("device-delete1").style.display = "none";
    document.getElementById("alltables").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("search_lens").style.pointerEvents = "none";
    document.getElementById("device_menu").setAttribute("class", "menu events events-disabled");
    document.getElementById("no_device_text").innerText = "Start adding your devices now.";
    document.getElementById("right_side_content").setAttribute("style", "height:100vh");
    document.getElementById("no_network_buttons").style.display = "none";
    document.getElementById("no_device_buttons").style.display = "block";
      if (enabletemplates == false)
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");        
      }
    if (network_chosen == 'bevy_sim_template') {
      document.getElementById("no_device_buttons").style.display = "none";
      document.getElementById("no_template_buttons").style.display = "block";
      document.getElementById("no_device_text").innerText = "Start creating your Templates now.";
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-disabled");
      document.getElementById("right_side_content").setAttribute("style", "height:100vh");
      document.getElementById("template_menu").style.display = "none";

    }
    else {
      document.getElementById("no_device_buttons").style.display = "block";
      if (enabletemplates == false)
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }

      document.getElementById("no_template_buttons").style.display = "none";
      document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
      document.getElementById("right_side_content").setAttribute("style", "height:100vh");
    }

    document.getElementById("startnetworkicon").style.display = "none";

  }
  if (network_chosen != 'bevy_sim_template') {
    document.getElementById("template_top_content").style.display = "none";
    document.getElementById("alltables").style.display = "none";
    document.getElementById("device_sidebar").style.display = "block";
    document.getElementById("template_sidebar").style.display = "none";
    document.getElementById("devices_top_content").style.display = "block";
    document.getElementById("devices_header").style.display = "block";
    document.getElementById("template_header").style.display = "none";
  }
  document.getElementById("device-delete1").style.display = "none";
}
function update_active_count() {
  var total_text = document.getElementById("total_devices").innerText;
  var total_count = parseInt(total_text.substring(16));
  var active_text = document.getElementById("active_devices").innerText;
  var active_count = parseInt(active_text.substring(17));
  active_count = active_count + 1;
  var inactive_count = total_count - active_count;
  document.getElementById("inactive_devices").innerText = 'Devices Inactive : ' + inactive_count;
  document.getElementById("active_devices").innerText = 'Devices Active : ' + active_count;
  document.getElementById("devices_chart").setAttribute("data-max", total_count);
  $('#devices_chart').trigger('configure', {
    'max': total_count
  });
  $("#devices_chart").val(active_count).trigger("change");
}
function update_inactive_count() {
  var total_text = document.getElementById("total_devices").innerText;
  var total_count = parseInt(total_text.substring(16));
  var active_text = document.getElementById("active_devices").innerText;
  var active_count = parseInt(active_text.substring(17));
  active_count = active_count - 1;
  var inactive_count = total_count - active_count;
  document.getElementById("inactive_devices").innerText = 'Devices Inactive : ' + inactive_count;
  document.getElementById("active_devices").innerText = 'Devices Active : ' + active_count;
  document.getElementById("devices_chart").setAttribute("data-max", total_count);
  $('#devices_chart').trigger('configure', {
    'max': total_count
  });
  $("#devices_chart").val(active_count).trigger("change");
}

function show_devices() {
  show_dashboard()
  //WebSocketTest('BEVY_' + network_chosen.toUpperCase());
  var total_text = document.getElementById("total_devices").innerText;
  var total_count = parseInt(total_text.substring(16));
  var active_text = document.getElementById("active_devices").innerText;
  var active_count = parseInt(active_text.substring(17));
  document.getElementById("nw-name").innerText = network_chosen;

  if (total_count>active_count)
  {
    // alert("enabled");
    document.getElementById("add_blank_device").setAttribute("class", "enabled_here");
  }
  /*else
  {
    // alert("disabled");
    document.getElementById("add_blank_device").setAttribute("class", "disabled_here");
  }*/
  var enabletemplates = true;
  var table_name = window.network_peru;
  $.ajax({
    url: '/api/get/simsettings?curr_time=' + new Date().getTime()+'&Table_name=' + table_name,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      m = JSON.parse(msg);
      mg = m['mg_status'];
      if ((mg == 'Azure_IoT') || (mg == 'Aws_IoT'))
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
        enabletemplates = false;
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }
    }
  });  

  var devices_count = 1;
  var a = document.getElementsByClassName("detaill");
  if (a.length == 0)
    devices_count = 0;
  if (network_chosen == 'bevy_sim_template') {
    $.ajax({
      url: '/loadtemplates?curr_time=' + new Date().getTime(),
      dataType: 'text',
      type: "GET",
      async: false,
      success: function (msg) {
        var obj = JSON.parse(msg);
        var x = document.getElementById("template-name");
        x.innerHTML = "";
        for (var key in obj) {
          if ((key == "0") && obj[key][0] == 0)
            devices_count = 0;
          else
            break;
        }
      },
      error: function (m) {
      }
    });
    document.getElementById("devices_header").style.display = "none";
    document.getElementById("template_header").style.display = "block";
  }
  else {
    document.getElementById("devices_header").style.display = "block";
    document.getElementById("template_header").style.display = "none";
  }
  if (devices_count > 0) {
    document.getElementById("devices").style.display = "block";
    document.getElementById("no_devices").style.display = "none";
    document.getElementById("right_side_content").removeAttribute("style");
    document.getElementById("device-delete1").style.display = "block";
    document.getElementById("alltables").style.display = "block";
    if (document.getElementById("dashboard"))
      document.getElementById("dashboard").style.display = "none";
    document.getElementById("search_lens").style.pointerEvents = "auto";
    document.getElementById("device_menu").setAttribute("class", "menu events");
    document.getElementById("startnetworkicon").style.display = "block";
  }
  else {
    if (network_chosen == 'bevy_sim_template') {
      document.getElementById("template_header").style.display = "block";
      document.getElementById("template_top_content").style.display = "block";
      document.getElementById("device_sidebar").style.display = "none";
      document.getElementById("template_sidebar").style.display = "block";
      document.getElementById("devices_top_content").style.display = "none";
      document.getElementById("devices_header").style.display = "none";
    }

    document.getElementById("devices").style.display = "none";
    document.getElementById("no_devices").style.display = "block";
    document.getElementById("device-delete1").style.display = "none";
    document.getElementById("alltables").style.display = "none";
    if (document.getElementById("dashboard"))
      document.getElementById("dashboard").style.display = "none";
    document.getElementById("search_lens").style.pointerEvents = "none";
    document.getElementById("device_menu").setAttribute("class", "menu events events-disabled");
    document.getElementById("no_network_buttons").style.display = "none";
    document.getElementById("no_device_buttons").style.display = "block";
    if (enabletemplates == false)
    {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");      
    }
    else
    {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");      
    }
    if (network_chosen == 'bevy_sim_template') {
      document.getElementById("no_device_buttons").style.display = "none";
      document.getElementById("no_template_buttons").style.display = "block";
      document.getElementById("no_device_text").innerText = "Start creating your Templates now.";
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-disabled");
      document.getElementById("right_side_content").setAttribute("style", "height:100vh");
      document.getElementById("template_menu").style.display = "none";

    }
    else {
      document.getElementById("no_device_buttons").style.display = "block";
      if (enabletemplates == false)
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }

      document.getElementById("no_template_buttons").style.display = "none";
      document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
      document.getElementById("right_side_content").setAttribute("style", "height:100vh");
    }

    document.getElementById("startnetworkicon").style.display = "none";

  }
  //document.getElementById("dashboard").style.display="none";
  if (network_chosen != 'bevy_sim_template') {
    if (document.getElementById("dashboard_div"))
      document.getElementById("dashboard_div").style.backgroundColor = '#fbfafa';
    if (document.getElementById("devices_div"))
      document.getElementById("devices_div").style.backgroundColor = '#f1f1f1';
  }

}
function show_templates() {
  if (network_chosen != 'bevy_sim_template') {
    before_template_all_disconnected = true;
    if (network_chosen == 'network-deleted')
      before_template_all_disconnected = true;
    else {
      if (document.getElementById("startnetwork").checked == true)
        before_template_all_disconnected = false;
    }
  }
  document.getElementById("device_sidebar").style.display = "none";
  document.getElementById("template_sidebar").style.display = "block";
  document.getElementById("devices_top_content").style.display = "none";
  document.getElementById("template_top_content").style.display = "block";
  document.getElementById("alltables").style.display = "block";
  document.getElementById("devices_header").style.display = "none";
  document.getElementById("template_header").style.display = "block";
  set_network("bevy_sim_template");
}
function get_network_details() {
  var v = document.getElementById("nw-choose").value;
  document.getElementById("nw-name").innerText = v.toUpperCase();

  if (v == "")
    return;
  var urlcheck = '/networkdescriptionandcount?network_name=' + v + '&curr_time=' + new Date().getTime();
  $.ajax({

    url: urlcheck,
    type: "GET",
    dataType: "json",
    async: false,

    success: function (msg) {
      for (var k in msg) {
        if (k == "Description")
          document.getElementById("selected_nw_desc").value = msg[k];
        else if (k == 'Device_count')
          document.getElementById("selected_nw_dev_count").value = msg[k];
      }
    }
  });

}
function open_network() {
  var network = document.getElementById("nw-choose").value;
  var same_network_chosen = false;
  if (document.getElementById("delete_network_status").value == "not deleted") {
    if (network_chosen == 'bevy_sim_template') {
      if (network != document.getElementById("oldnetwork").value) {


        $.ajax({
          url: '/stopnetwork?network_chosen=' + document.getElementById("oldnetwork").value + '&curr_time=' + new Date().getTime(),

          dataType: 'text',
          type: "GET",
          async: false,
          success: function () {

          }
        });
      }
      else {
        same_network_chosen = true;
      }
    }
    else {
      if (network != network_chosen) {
        $.ajax({
          url: '/stopnetwork?network_chosen=' + network_chosen + '&curr_time=' + new Date().getTime(),

          dataType: 'text',
          type: "GET",
          async: false,
          success: function () {

          }
        });
      }
      else
        return;
    }
  }
  else
    document.getElementById("delete_network_status").value = "not deleted";
  set_network(network);
}
var network_peru;
function set_network(network_name) {
  network_peru = network_name;
  document.getElementById("settingsicon").style.display = "block";
  $.ajax({
    url: '/setnetwork?network=' + network_name + '&curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",

    async: false,
    success: function (msg) {
      m = msg;
      //document.getElementById("auth").disabled=true;
      if (network_name != 'bevy_sim_template')
        window.history.pushState('page2', 'Title', '/setnetwork?network=' + network_name);

    }
  });
  // $.ajax({
  //   url:'/api/get/simsettings?Table_name='+network_name,
  //   type:"GET",

  // })
  no_of_devices_old = (document.getElementsByClassName("detaill dname").length) / 2;
  if (network_chosen != network_name) {
    old_network_chosen = network_chosen;
    document.getElementById("oldnetwork").value = old_network_chosen;
  }
  network_chosen = network_name;
  scroll_end_index = 0;
  if (network_chosen != 'bevy_sim_template') {
    window.name = network_chosen;
    WebSocketTest('BEVY_' + network_chosen.toUpperCase());
  }
  if (network_chosen != 'bevy_sim_template') {
    document.getElementById("nw_device_delete").style.display = "block";
    var network_log = document.getElementById("network_log");
    network_log.innerHTML = "<div class=network_log id='network_log_" + network_chosen.toUpperCase() + "' name='network_log_" + network_chosen.toUpperCase() + "' style=display:none></div>" + network_log.innerHTML;
    template_chosen = false;
  }
  else {
    template_chosen = true;
  }
  if (document.getElementById("network_name"))
    document.getElementById("network_name").innerHTML = network_chosen;
  if (network_chosen == 'bevy_sim_template') {
    document.getElementById("network_name").innerHTML = 'Templates';
    document.getElementById("template_top_menu").style.display = "block";
    document.getElementById("device_top_menu").style.display = "none";
  }
  else {
    document.getElementById("template_top_menu").style.display = "none";
    document.getElementById("device_top_menu").style.display = "block";

  }
  document.getElementById("add_blank_device").setAttribute("class", "enabled_here");
    var table_name = window.network_peru;
  $.ajax({
    url: '/api/get/simsettings?curr_time=' + new Date().getTime()+'&Table_name=' + table_name,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      // Using double parsing here *** IMPORTANT Need the right FIX - Ranjith 
      m = JSON.parse(msg);
      mg = m['mg_status'];
      if ((mg == 'Azure_IoT') || (mg == 'Aws_IoT'))
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");

      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }
    }
  });  

  var r = adddevices("myform", 0, "addnew");
  if (network_chosen != 'bevy_sim_template') {
    document.getElementById("device_sidebar").style.display = "block";
    document.getElementById("template_sidebar").style.display = "none";
    document.getElementById("devices_top_content").style.display = "block";
    document.getElementById("template_top_content").style.display = "none";
    document.getElementById("alltables").style.display = "none";
    document.getElementById("devices_header").style.display = "block";
    document.getElementById("template_header").style.display = "none";

    if (r != "nodevice") {
      document.getElementById("template_top_content").style.display = "none";
      show_dashboard();
    }
  }
  else {
    if (r == "nodevice")
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-disabled")
    else
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-enabled");
    show_devices();
  }
  show_settings();
  device_cert_module(window.mg);
}
function check_network_exists() {
  var network_exists_here = true;

  $.ajax({
    url: '/networklist?curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      var obj = JSON.parse(msg);
      var x = document.getElementById("nw-choose");
      x.innerHTML = "";
      x.innerText = "";
      var m;
      try {
        m = obj['Network_LIST'];
      }
      catch (error) {
        network_exists_here = false;
      }
      if (m == undefined) {
        network_exists_here = false;
        document.getElementById("open_existing_network").setAttribute("class", "disabled_here");
      }
      else {
        document.getElementById("open_existing_network").setAttribute("class", "enabled_here");
        network_exists_here = true;
      }
    }
  });
  var table_name = window.network_peru;
  $.ajax({
    url: '/api/get/simsettings?curr_time=' + new Date().getTime()+'&Table_name=' + table_name,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      // Using double parsing here *** IMPORTANT Need the right FIX - Ranjith 
      m = JSON.parse(msg);
      mg = m['mg_status'];
      if ((mg == 'Azure_IoT') || (mg == 'Aws_IoT'))
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }
    }
  });



  return network_exists_here;
}
function confirm_show_network() {


  var current_all_disconnected = true;
  var show_network_now = false;
  if (network_chosen == 'bevy_sim_template') {
    current_all_disconnected = before_template_all_disconnected;
  }
  else if (network_chosen == 'network-deleted')
    current_all_disconnected = true;
  else {

    if (document.getElementById("startnetwork").checked == true)
      current_all_disconnected = false;

  }
  if (current_all_disconnected == false) {
    if ((network_chosen != 'bevy_sim_template') && (network_chosen != "")) {
      if (network_chosen != 'network-deleted') {
        var swal_title, swal_text;
        swal_title = "";
        swal_text = "Network " + network_chosen + " will be stopped. Are you sure to proceed?";
        swal({
          title: swal_title,
          text: swal_text,
          //type: "warning",   
          width: 300,
          height: 300,
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
          closeOnConfirm: true,
          closeOnCancel: true
        },
          function (isConfirm) {
            if (isConfirm) {
              show_network();
            }
          });
      }
      else {
        show_network();
      }

    }
    else if ((old_network_chosen != '') && (old_network_chosen != 'bevy_sim_template')) {
      if ((old_network_chosen != 'network-deleted') && (network_chosen != 'bevy_sim_template')) {
        var swal_title, swal_text;
        swal_title = "";
        swal_text = "Network " + old_network_chosen + " will be stopped. Are you sure to proceed?";
        swal({
          title: swal_title,
          text: swal_text,
          //type: "warning",   
          width: 300,
          height: 300,
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
          closeOnConfirm: true,
          closeOnCancel: true
        },
          function (isConfirm) {
            if (isConfirm) {
              show_network();
            }
          });
      }
      else
        show_network();
    }
  }
  else
    show_network();

}
function show_network() {

  $.ajax({
    url: '/networklist?curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      var obj = JSON.parse(msg);
      var x = document.getElementById("nw-choose");
      x.innerHTML = "";
      x.innerText = "";
      var m = obj['Network_LIST'];
      for (var i = 0; i < m.length; i++) {

        if (m[i].toUpperCase() == 'BEVYWISE_NETWORK');
        else if (m[i].toUpperCase() == 'BEVY_SIM_TEMPLATE');
        else if (m[i].toUpperCase() == 'BEVY_BEVY_SIM_TEMPLATE');
        else if (m[i].toUpperCase() == 'BEVYWISE');
        else if (m[i].toUpperCase() == 'BEVYWISE_SIMULATOR');
        else if (m[i].toUpperCase() == 'BEVY_NETWORK-DELETED');
        else {
          var option = document.createElement("option");
          option.text = m[i].substring(5);
          x.add(option);
        }
      }
    }
  });
  get_network_details();
  //$("#template-modal").modal('show');
  $("#template-choosen").modal('show');
}
function startdevice(dev_id) {
  id = document.getElementById("d_name").value = dev_id.substring(6);
  var start_network = document.getElementById("startnetwork").checked;
  var connected = true;
  $.ajax({
    url: '/startdevice?device_id=' + id + '&curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      if ((msg == "-6") || (msg.indexOf("exception: access violation reading") > -1)) {
        swal("", "Broker is not running. Start broker to connect the devices");
        document.getElementById("startnetwork").checked = start_network;
        connected = false;
      }
      else if (msg == "-5") {
        swal("", "Licensed Client Count Exceeded");
        licensed_count_exceed = true;
        connected = false;
      }
      else if (msg == "False") {
        swal("", "Check credential details");
        document.getElementById("startnetwork").checked = start_network;
        connected = false;
      }

    }
  });
  if (connected == true) {
    var start_network = document.getElementById("startnetwork").checked;
    if (start_network == false) {
      document.getElementById("startnetwork").checked = true;
      document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
      $('.device-start').removeAttr('data-original-title').blur();
      $('.device-start').attr('data-original-title', 'Stop Network');
    }
    /*else
    {
          $('.device-start').removeAttr('data-original-title').blur();
      $('.device-start').attr('data-original-title', 'Start Network');  
      document.getElementById("startnetwork").checked=false;
      document.getElementById("network_icon").setAttribute("class","fa fa-circle pull-right start-network");
    }*/

    document.getElementById("status" + id).setAttribute("class", "fa fa-circle pull-right start");
    document.getElementById("status" + id).setAttribute("onclick", "stopdevice(this.id)");
  }
}
function stopdevice(dev_id) {
  id = document.getElementById("d_name").value = dev_id.substring(6);
  document.getElementById("status" + id).setAttribute("class", "fa fa-circle pull-right stop");
  document.getElementById("status" + id).setAttribute("onclick", "startdevice(this.id)");
  $.ajax({
    url: '/stopdevice?device_id=' + id + '&curr_time=' + new Date().getTime(),
    dataType: "text",
    type: "GET",
    async: false,
    success: function (msg) {
      if (msg == 'False') {
        var start_network = document.getElementById("startnetwork").checked;
        if (start_network == false) {
          document.getElementById("startnetwork").checked = true;
          document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
          $('.device-start').removeAttr('data-original-title').blur();
          $('.device-start').attr('data-original-title', 'Stop Network');
        }
        else {
          $('.device-start').removeAttr('data-original-title').blur();
          $('.device-start').attr('data-original-title', 'Start Network');
          document.getElementById("startnetwork").checked = false;
          document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
        }

      }
    }
  });


}
function change_authentication_status() {
  var enable_device;
  var url_check;
  if (network_chosen == 'bevy_sim_template') {
    enable_device = document.getElementById("enable-template").checked;
  }
  else
  {
    enable_device = document.getElementById("enable-device").checked;
    if (enable_device == true)
    {
      document.getElementById("user_pwd_key").style.display = "block";
      document.getElementById("user_pwd_token").style.display = "block";
    }
  }

  if (enable_device == true) {
    // if(window.h=="Azure_IoT"){
    //   url_check = '/enableauthentication?device_id=' + document.getElementById("d_name").value + '&curr_time=' + new Date().getTime();
    // }
    url_check = '/enableauthentication?device_id=' + document.getElementById("d_name").value + '&curr_time=' + new Date().getTime();
  }
  else {
    url_check = '/disableauthentication?device_id=' + document.getElementById("d_name").value + '&curr_time=' + new Date().getTime();
  }
  $.ajax({
    url: url_check,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
    }
  });
}
function change_will_status() {
  var enable_will;
  var url_check;
  if (network_chosen == 'bevy_sim_template')
    enable_will = document.getElementById("enable-will-template").checked;
  else
    enable_will = document.getElementById("enable-will").checked;
  if (enable_will == true) {
    url_check = '/enablewill?device_id=' + document.getElementById("d_name").value + '&curr_time=' + new Date().getTime();
  }
  else {
    url_check = '/disablewill?device_id=' + document.getElementById("d_name").value + '&curr_time=' + new Date().getTime();
  }
  $.ajax({
    url: url_check,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
    }
  });
}
function check_will(will_id) {
  if (will_id == "will-enabled")
    other_id = "will-disabled";
  else
    other_id = "will-enabled";

  if (document.getElementById(will_id).checked) {
    document.getElementById(other_id).checked = false;
    if (will_id == "will-enabled") {
      $('.will_detail_info').slideDown();
    }
    else {
      $('.will_detail_info').slideUp();
    }
  }

}
function check_license() {
  var template_count_exceed = false;
  $.ajax({


    url: '/checktemplatecount?curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
      if (msg == "0") {
        swal("", "Licensed Template count exceeded");
        template_count_exceed = true;
      }

    },
    error: function (msg) {
    }

  });
  if (template_count_exceed == true)
    return;
  $("#template-modal").modal('show');
}

function adddevices(form_name, devtrackcnt, addnew_or_append) {
  var clientoffset = devtrackcnt * 20;
  var urlcheck;
  var enabletemplates=true;
  urlcheck = '/client/list?page=' + devtrackcnt + '&network=' + network_chosen + '&curr_time=' + new Date().getTime();
  var client_status = [];
  var dev_count = 0;
  if (network_chosen != 'bevy_sim_template') {
    $.ajax({
      url: '/get_all_clients_status?network=' + network_chosen + '&curr_time=' + new Date().getTime(),
      dataType: 'text',
      type: "GET",
      async: false,
      success: function (msg) {
        if (msg == "notavailable") {
          //swal("No Device is added to the network", {button: "OK",});
          x = document.getElementById("device");
          x.innerHTML = "";
          document.getElementById("devices").style.display = "none";
          document.getElementById("dashboard").style.display = "none";
          document.getElementById("no_devices").style.display = "block";
          document.getElementById("device-delete1").style.display = "none";
          document.getElementById("alltables").style.display = "none";
          document.getElementById("search_lens").style.pointerEvents = "none";
          document.getElementById("device_menu").setAttribute("class", "menu events events-disabled")
          document.getElementById("no_network_buttons").style.display = "none";
          document.getElementById("no_device_buttons").style.display = "block";
          document.getElementById("no_template_buttons").style.display = "none";
          document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
          document.getElementById("add_blank_device").setAttribute("class", "enabled_here");
          var table_name = window.network_peru;
          $.ajax({
            url: '/api/get/simsettings?curr_time=' + new Date().getTime()+'&Table_name=' + table_name,
            type: "GET",
            dataType: "text",
            async: false,
            success: function (msg) {
              // Using double parsing here *** IMPORTANT Need the right FIX - Ranjith 
              m = JSON.parse(msg);
              mg = m['mg_status'];
              if ((mg == 'Azure_IoT') || (mg == 'Aws_IoT'))
              {
                enabletemplates = false;
                document.getElementById("addfromtemplate").disabled = true;
                document.getElementById("open_templates").setAttribute("class","disabled_here");
                document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
              }
              else
              {
                document.getElementById("addfromtemplate").disabled = false;
                document.getElementById("open_templates").setAttribute("class","enabled_here");
                document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
              }
            }
          });  
          document.getElementById("right_side_content").setAttribute("style", "height:100vh");

          document.getElementById("startnetworkicon").style.display = "none";

          return;
        }
        dev_count = 1;
        // client_status = JSON.stringify(JSON.parse(msg));
        client_status = JSON.parse(msg);
      }
    });
  }
  if ((dev_count == 0) && (network_chosen != 'bevy_sim_template')) {
    var px = document.getElementById("pub_table");
    while (px.rows[1]) px.deleteRow(1);
    var sx = document.getElementById("sub_table");
    while (sx.rows[1]) sx.deleteRow(1);
    var rx = document.getElementById("reqres_table");
    while (rx.rows[2]) rx.deleteRow(2);
    document.getElementById("devices").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("no_devices").style.display = "block";
    document.getElementById("device-delete1").style.display = "none";
    document.getElementById("alltables").style.display = "none";
    document.getElementById("search_lens").style.pointerEvents = "none";
    document.getElementById("device_menu").setAttribute("class", "menu events events-disabled")
    document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
    document.getElementById("no_network_buttons").style.display = "none";
    document.getElementById("no_device_buttons").style.display = "block";
      if (enabletemplates == false)
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
      }

      document.getElementById("no_template_buttons").style.display = "none";
      document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
      document.getElementById("right_side_content").setAttribute("style", "height:100vh");
    


    document.getElementById("startnetworkicon").style.display = "none";

    return "nodevice";
  }

  $.ajax({

    url: urlcheck,
    type: "GET",
    dataType: "json",
    async: false,

    success: function (msg) { //alert (msg);
      obj = JSON.parse(msg);
      x = document.getElementById("device");
      if (network_chosen == 'bevy_sim_template')
        x = document.getElementById("template_device");
      if (addnew_or_append == "addnew")
        x.innerHTML = "";
      var key;
      var no_of_devices = 1;
      var dev_cnt = 1;
      var dev_key = [];

      for (key in obj) {
        if (key == "0") {
          no_of_devices = 0;
        }
        dev_key[dev_cnt] = key;
        dev_cnt++;
      }
      if ((addnew_or_append == "addnew") && (no_of_devices == 0)) {
        if (network_chosen == 'bevy_sim_template')
          document.getElementById("template_search_lens").style.pointerEvents = "none";
        else
          document.getElementById("search_lens").style.pointerEvents = "none";
        document.getElementById("device_menu").setAttribute("class", "menu events events-disabled");
        document.getElementById("devices").style.display = "none";
        document.getElementById("no_devices").style.display = "block";
        document.getElementById("startnetworkicon").style.display = "none";
        document.getElementById("alltables").style.display = "none";
        if (document.getElementById("dashboard"))
          document.getElementById("dashboard").style.display = "none";
        document.getElementById("device-delete1").style.display = "none";
        document.getElementById("no_network_buttons").style.display = "none";
        document.getElementById("no_device_buttons").style.display = "block";
        if (enabletemplates == false)
        {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
        }
        else
        {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
        }

        if (network_chosen == 'bevy_sim_template') {
          document.getElementById("no_device_buttons").style.display = "none";
          document.getElementById("no_template_buttons").style.display = "block";
          document.getElementById("no_device_text").innerText = "Start creating your Templates now.";
          document.getElementById("new_template_menu").setAttribute("class", "menu events events-disabled");
          document.getElementById("right_side_content").setAttribute("style", "height:100vh");
          document.getElementById("template_menu").style.display = "none";

          document.getElementById("right_side_content").setAttribute("style", "height:100vh");
          document.getElementById("template_menu").style.display = "none";
          document.getElementById("device_sidebar").style.display = "none";
          document.getElementById("template_sidebar").style.display = "block";
          document.getElementById("devices_top_content").style.display = "none";
          document.getElementById("template_top_content").style.display = "block";
          document.getElementById("alltables").style.display = "none";
          document.getElementById("devices_header").style.display = "none";
          document.getElementById("template_header").style.display = "block";
        }
        else {
          document.getElementById("no_device_buttons").style.display = "block";
          if (enabletemplates == false)
          {
            document.getElementById("addfromtemplate").disabled = true;
            document.getElementById("open_templates").setAttribute("class","disabled_here");
            document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
          }
          else
          {
            document.getElementById("addfromtemplate").disabled = false;
            document.getElementById("open_templates").setAttribute("class","enabled_here");
            document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");
          }

          document.getElementById("no_template_buttons").style.display = "none";
          document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
          document.getElementById("right_side_content").setAttribute("style", "height:100vh");
        }
        return;

      }
      if (network_chosen == 'bevy_sim_template') {
        document.getElementById("no_template_buttons").style.display = "none";
        document.getElementById("no_device_text").innerText = "Start creating your Templates now.";
        document.getElementById("template_menu").style.display = "none";
        document.getElementById("right_side_content").setAttribute("style", "height:100vh");
        document.getElementById("no_device_buttons").style.display = "none";
        document.getElementById("no_template_buttons").style.display = "block";
        document.getElementById("no_device_text").innerText = "Start creating your Templates now.";
        document.getElementById("new_template_menu").setAttribute("class", "menu events events-disabled");
        document.getElementById("right_side_content").setAttribute("style", "height:100vh");
        document.getElementById("template_menu").style.display = "none";
      }
      else {
        document.getElementById("no_device_buttons").style.display = "none";
        document.getElementById("no_template_buttons").style.display = "none";
        document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Device";
        document.getElementById("right_side_content").setAttribute("style", "height:100vh");
      }

      document.getElementById("no_devices").style.display = "none";
      document.getElementById("right_side_content").removeAttribute("style");
      document.getElementById("search_lens").style.pointerEvents = "auto";
      document.getElementById("device_menu").setAttribute("class", "menu events");
      document.getElementById("device-delete1").style.display = "block";
      if (network_chosen != 'bevy_sim_template')
        document.getElementById("startnetworkicon").style.display = "block";
      var cnt = 1;
      var first = "";
      var device_log = document.getElementById("device_log");
      if (no_of_devices != 0) {
        if (network_chosen == 'bevy_sim_template') {
          document.getElementById("template_menu").style.display = "block";
          document.getElementById("new_template_menu").setAttribute("class", "menu events events-enabled");
        }
        for (key in obj) {
          if (cnt == 1) {
            if (network_chosen == 'bevy_sim_template')
              x.innerHTML = x.innerHTML + "<li class='treeview active devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer >" + obj[key][2] + "</span></a></li>";
            else {
              if (document.getElementById("dashboard").style.display == "none") {
                if (client_status[key] == "connected")
                  x.innerHTML = x.innerHTML + "<li class='treeview active devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer >" + obj[key][2] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right start' onclick=stopdevice(this.id) style=cursor:pointer></i></a></li>";
                else
                  x.innerHTML = x.innerHTML + "<li class='treeview active devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer>" + obj[key][2] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>";
              }
              else {
                if (client_status[key] == "connected")
                  x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' ><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer >" + obj[key][2] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right start' onclick=stopdevice(this.id) style=cursor:pointer></i></a></li>";
                else
                  x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer>" + obj[key][2] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>";
              }
              device_log.innerHTML = "<div class=publish_log id='publish_log_" + key + "' name='publish_log_" + key + "' style=display:none></div>" + device_log.innerHTML;
            }
            first = key;
          }
          else {
            if (network_chosen == 'bevy_sim_template')
              x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' ><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer >" + obj[key][2] + "</span></a></li>";
            else {
              if (client_status[key] == "connected")
                x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' ><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer>" + obj[key][2] + "</span><i id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right start' onclick=stopdevice(this.id) style=cursor:pointer></i></a></li>";
              else
                x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer>" + obj[key][2] + "</span><i id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>";
              device_log.innerHTML = "<div class=publish_log id='publish_log_" + key + "' name='publish_log_" + key + "' style=display:none></div>" + device_log.innerHTML;
            }
          }
          cnt = cnt + 1;
        }
      }
      if (network_chosen == 'bevy_sim_template')
        disp_detail(first);
    },


    error: function (dd) {
    }

  });
}
function devclick(dev_id) {
  var xdetail = document.getElementsByClassName("devlist");
  var xd;
  for (xd = 0; xd < xdetail.length; xd++)
    xdetail[xd].className = "treeview devlist";
  document.getElementById(dev_id).setAttribute("class", "treeview active devlist");
  id = dev_id.substring(6);
  disp_detail(id);
}

function load_templates() {
  if ((window.h == "Azure_IoT") || (window.h == "Aws_IoT") || (window.mg_application == "Azure_IoT") || (window.mg_application == "Aws_IoT"))
  {
    //alert("Templates cannot be used in Azure_IoT and Aws_IoT");
    return;
  }
  
  var template_count = 1;
  $.ajax({
    url: '/loadtemplates?curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
      var obj = JSON.parse(msg);
      var x = document.getElementById("template-name");
      x.innerHTML = "";
      for (var key in obj) {
        if ((key == "0") && obj[key][0] == 0)
          template_count = 0;
        else {
          var option = document.createElement("option");
          option.text = obj[key][1];
          x.add(option);
        }
      }
    },
    error: function (m) {
    }
  });
  if (template_count == 0)
    swal("", "You don't have any Templates available now.");
  else
    $("#device-template").modal('show');
}

$("#bulk-save").click(function (event) {
  if (parseInt(document.getElementById("devices_count_txt_temp").value) > 10000) {
    swal("", "You can create only upto 10000 devices at a time.");
    return;
  }
  if ((document.getElementById("dev_name_prefix_txt_temp").value).trim() == "") {
    swal("", "Device_Name_Prefix could not be empty");
    return;
  }
  var devices_count = document.getElementById("devices_count_txt_temp").value;
  var device_name_prefix = document.getElementById("dev_name_prefix_txt_temp").value;
  var template_name = document.getElementById("template-name").value;
  
    $.ajax({


      url: '/addbulk?template_name=' + template_name + '&devices_count=' + devices_count + '&device_name_prefix=' + device_name_prefix + '&curr_time=' + new Date().getTime(),
      dataType: 'text',
      type: "GET",
      async: false,
      success: function (msg) {
      },
      error: function (msg) {
      }

    });
    set_network(network_chosen);
    $("#device-template").modal('hide');


  

});


$("#edit-device-save").click(function (event) {

  if ((document.getElementById("edit-device-name").value).trim() == "")
    swal("", "Device_Name could not be empty");

  else {

    $.ajax({


      url: '/edit/device?device_id=' + document.getElementById("d_name").value + '&new_device_name=' + document.getElementById("edit-device-name").value + '&new_device_description=' + document.getElementById("edit-device-desc").value + '&curr_time=' + new Date().getTime(),
      dataType: "text",
      type: "GET",
      async: false,
      success: function (msg) {
        if (msg == 'Edited') {
          if (network_chosen == 'bevy_sim_template') {
            document.getElementById("template_name").innerText = document.getElementById("edit-device-name").value;
            document.getElementById("template_desc").innerText = document.getElementById("edit-device-desc").value;
          }
          else {
            document.getElementById("device_name").innerText = document.getElementById("edit-device-name").value;
            document.getElementById("d_desc").innerText = document.getElementById("edit-device-desc").value;
          }
          var x = document.getElementsByClassName("detaill dname");
          for (var j = 0; j < x.length; j++) {
            var itext = "";
            if (network_chosen == 'bevy_sim_template')
              itext = 'device' + document.getElementById("template_name_lbl").innerText;
            else
              itext = 'device' + document.getElementById("dev_name_lbl").innerText;
            if ($(x[j]).attr('id') == itext)
            //if (x[j]==document.getElementById('device'+document.getElementById("dev_name_lbl").innerText))
            {
              if (network_chosen == 'bevy_sim_template')
                x[j].innerText = document.getElementById("template_name").innerText;
              else
                x[j].innerText = document.getElementById("device_name").innerText;
              break;
            }
          }
        }
        else {
          swal("", "Device Name should be unique");

        }
      },
      error: function (msg) {
      }

    });
    //set_network(network_chosen);
    if (network_chosen == 'bevy_sim_template')
      document.getElementById("edit-template-icon").style.display = "inline-block";
    else
      document.getElementById("edit-device-icon").style.display = "inline-block";

  }

});
function edit_device() {
  if (network_chosen == 'bevy_sim_template') {
    document.getElementById("edit-device-name").value = document.getElementById("template_name").innerText;
    document.getElementById("edit-device-desc").value = document.getElementById("template_desc").innerText;
    document.getElementById("edit_label").innerText = "Template Name";
    document.getElementById("edit-device-name").disabled = true;
    document.getElementById("edit-device-heading").innerText = "Edit Template";
  }
  else {
    document.getElementById("edit-device-name").value = document.getElementById("device_name").innerText;
    document.getElementById("edit-device-desc").value = document.getElementById("d_desc").innerText;
    document.getElementById("edit_label").innerText = "Device Name";
    document.getElementById("edit-device-name").disabled = false;
    document.getElementById("edit-device-heading").innerHTML = "Edit Device";

  }
  $("#edit-device").modal('show');
}
function confirm_delete_device() {
  var swal_title, swal_text;
  var device_id = document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template') {
    swal_title = "";
    swal_text = "Do you want to delete the template " + device_id + "?";
  }
  else {
    swal_title = "";
    swal_text = "Do you want to delete the device " + device_id + "?";
  }
  swal({
    title: swal_title,
    text: swal_text,
    //type: "warning",   
    width: 300,
    height: 300,
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    closeOnConfirm: true,
    closeOnCancel: true
  },
    function (isConfirm) {
      if (isConfirm) {
        delete_device();
      }
    });


}
function delete_device() {
  var device_id = document.getElementById("d_name").value;
  $.ajax({
    url: '/delete/device?device_id=' + device_id + '&curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
    },
    error: function (msg) {
    }
  });
  document.getElementById('delist' + device_id).style.display = 'none';
  if (network_chosen != 'bevy_sim_template')
    show_dashboard();
  else
    show_devices();
    // set_network('bevy_sim_template');

}
function confirm_delete_network() {
  var swal_title, swal_text;
  swal_title = "";
  swal_text = "Network " + network_chosen + " will be deleted permanently. Are you sure to proceed?";
  swal({
    title: swal_title,
    text: swal_text,
    width: 300,
    height: 300,
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    closeOnConfirm: true,
    closeOnCancel: true
  },
    function (isConfirm) {
      if (isConfirm) {
        delete_network();
      }
    });


}
function delete_network() {
  $.ajax({
    url: '/delete/network?curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
    },
    error: function (msg) {
    }
  });
  document.getElementById("delete_network_status").value = "deleted";
  document.getElementById("network_name").innerHTML = "No Network";
  document.getElementById("devices").style.display = "none";
  document.getElementById("no_devices").style.display = "block";
  document.getElementById("device-delete1").style.display = "none";
  document.getElementById("nw_device_delete").style.display = "none";
  document.getElementById("alltables").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("search_lens").style.pointerEvents = "none";
  document.getElementById("device_menu").setAttribute("class", "menu events events-disabled")
  document.getElementById("no_device_text").innerText = "Sorry we couldn't find any Network";
  document.getElementById("right_side_content").setAttribute("style", "height:100vh");
  var cn = check_network_exists();
  if (cn == false)
    document.getElementById("open_network_button").disabled = true;
  else
    document.getElementById("open_network_button").disabled = false;
  //document.getElementById("add_blank_device").setAttribute("class", "disabled_here");
  document.getElementById("add_device_from_templates").setAttribute("class", "disabled_here");
  document.getElementById("no_network_buttons").style.display = "block";
  document.getElementById("no_device_buttons").style.display = "none";
  document.getElementById("startnetworkicon").style.display = "none";
  document.getElementById("settingsicon").style.display = "none";
  document.getElementById("device").innerHTML = "";
  network_chosen = "network-deleted";
  window.name = network_chosen;


}

function scrolled(o) {
  //visible height + pixel scrolled = total height 
  if (o.offsetHeight + o.scrollTop == o.scrollHeight) {
    scroll_end_index = scroll_end_index + 1;
    var dashboard_or_devices = document.getElementById("dashboard").style.display;
    adddevices("myform", scroll_end_index, "append");
    if (dashboard_or_devices == "block")
      document.getElementById("device_menu").setAttribute("class", "menu events events-disabled");
  }
}

function parseJson(o) {
  var m = '{';
  for (var a in o) {
    if (typeof o[a] == 'object') {
      m += '"' + a + '":"';
      m += parseJson(o[a]);
      //s+=parseJson(o[a]);
    } else {
      var xyz = o[a].split('-');
      var msg_type = xyz[xyz.length - 1];
      if ((msg_type == 'SYSTEMVARIABLE') || (msg_type == 'CONSTANT') || (msg_type == 'RANGE') || (msg_type == 'RANDOM') || (msg_type == 'INCREMENT') || (msg_type == 'DECREMENT'))
        m += '"' + a + '":{"type":"' + msg_type + '","value":"' + o[a].substr(0, o[a].length - (msg_type.length + 1)) + '"},';
      else
        m += '"' + a + '":"' + o[a] + '"';
    }//end if
  }//end for
  //return s;
  return m + '"},';
}//end function


function disp_detail(id) {
  var pub_count = 0;
  var sub_count = 0;
  var connect_status = 0;
  show_devices();
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("template_name_lbl").innerText = id;
  else
    document.getElementById("dev_name_lbl").innerText = id;
  document.getElementById("d_name").value = id;

  var auth_type, auth_block, device_cert, device_key;
  var authentication_enabled = 0;
  var will_flag = 0;
  $.ajax({


    url: '/getcredential?device_id=' + id + '&curr_time=' + new Date().getTime(),

    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      m = JSON.parse(msg);
      var im = 0;
      for (var key in m) {
        if (im == 0) {
          if (network_chosen == 'bevy_sim_template')
            document.getElementById("template_username").value = m[key];
          else
            document.getElementById("username").value = m[key];

        }
        else if (im == 1) {
          if (network_chosen == 'bevy_sim_template')
            document.getElementById("template_password").value = m[key];
          else
            document.getElementById("password").value = m[key];
        }
        else if (im == 2) {
          authentication_enabled = m[key];
        }
        else if (im == 3) {
          will_flag = m[key];
        }
        else if (im == 4) {
          auth_type = m[key];
        }
        else if (im == 5) {
          auth_block = m[key];
        }
  else if (im == 6)
  {
    device_cert = m[key];
  }
  else if (im ==7)
  {
    device_key = m[key];
  }
        im = im + 1;
      }
    },
    error: function (data) {
    }
  });
  if (network_chosen != 'bevy_sim_template') {
    if (authentication_enabled == 0) {
      document.getElementById("enable-device").checked = false;
      document.getElementById("device-info").style.display = "none";
    }
    else {
      document.getElementById("enable-device").checked = true;
      document.getElementById("device-info").style.display = "block";
      document.getElementById("auth").value = auth_type;
      device_cert_module(window.h);
      if (auth_type == "selfsigned") {
        $("#certificate-module").attr("style", "display: block;");
  if ((device_cert == $("#myFile1").val()) || ("C:\\fakepath\\"+device_cert == $("#myFile1").val()))
    ;
  else
  {
    var myfile = document.getElementById("myFile1");
    var rootform = document.getElementById("device_cert_form");
    var rootlabel = document.getElementById("device_cert_label");
    var newfile = document.createElement("input");
    newfile.setAttribute("type","file");
    newfile.setAttribute("id","newfile");
    $(newfile).insertAfter(rootlabel);
    //myfile.remove();
    document.getElementById("myFile1").outerHTML = "";
    newfile.setAttribute("id","myFile1");
    newfile.setAttribute("style","width:38%;font-weight: 500;");
  }
  if ((device_key == $("#myFile2").val()) || ("C:\\fakepath\\"+device_key == $("#myFile2").val()))
    ;
  else
  {
    var myfile = document.getElementById("myFile2");
    var rootform = document.getElementById("device_key_form");
    var rootlabel = document.getElementById("device_key_label");
    var newfile = document.createElement("input");
    newfile.setAttribute("type","file");
    newfile.setAttribute("id","newfile");
    $(newfile).insertAfter(rootlabel);
    //myfile.remove();
    document.getElementById("myFile2").outerHTML = "";
    newfile.setAttribute("id","myFile2");
    newfile.setAttribute("style","width:38%;font-weight: 500;");
  }

      }
      else if (auth_type == "sastoken") {
        $("#certificate-module").attr("style", "display:none");
      }
      if (auth_block == '1') {
        document.getElementById("auth").disabled = true;
      }
      else {
        document.getElementById("auth").disabled = false;
      }
    }
    if (will_flag == 0) {
      document.getElementById("enable-will").checked = false;
      document.getElementById("will-info").style.display = "none";
    }
    else {
      document.getElementById("enable-will").checked = true;
      document.getElementById("will-info").style.display = "block";
    }
  }
  else {
    if (authentication_enabled == 0) {
      document.getElementById("enable-template").checked = false;
      document.getElementById("template-info").style.display = "none";
    }
    else {
      document.getElementById("enable-template").checked = true;
      document.getElementById("template-info").style.display = "block";
    }
    if (will_flag == 0) {
      document.getElementById("enable-will-template").checked = false;
      document.getElementById("template-will-info").style.display = "none";
    }
    else {
      document.getElementById("enable-will-template").checked = true;
      document.getElementById("template-will-info").style.display = "block";
    }
  }
  publish_status = "";
  if (network_chosen == 'bevy_sim_template')
    publish_status = "";
  else {
    $.ajax({


      url: '/getpublishstatus?device_id=' + id + '&curr_time=' + new Date().getTime(),
      type: "GET",
      dataType: "text",
      async: false,
      success: function (msg) {
        if (msg == "not connected") {
          connect_status = 0;
        }
        else {
          connect_status = 1;
          publish_status = JSON.parse(msg);
        }
      },
      error: function (m) {
      }
    });
  }
  var s = document.getElementsByClassName("publish_log");
  for (xd = 0; xd < s.length; xd++)
    s[xd].style.display = "none";
  document.getElementById("empty-device-log").style.display = "block";
  if ((template_chosen == false) && (document.getElementById("publish_log_" + id))) {
    if (document.getElementById("publish_log_" + id).innerHTML == "")
      document.getElementById("empty-device-log").style.display = "block";
    else
      document.getElementById("empty-device-log").style.display = "none";
    document.getElementById("publish_log_" + id).style.display = "block";
  }

  devid = 0;
  var u = '/client/get?a=' + id + '&curr_time=' + new Date().getTime();
  $.ajax({
    url: '/getdevicedetails?device_id=' + id + '&curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",
    async: false,
    success: function (m) {
      var msg = JSON.parse(m);

      var client_msg = msg["client_details"];
      var will_msg = msg["WILL_Details"];

      if (network_chosen == 'bevy_sim_template') {
        document.getElementById("template_name").innerText = client_msg["Client_Name"];
        document.getElementById("template_desc").innerText = client_msg["Client_Desc"];
        document.getElementById("template_will_topic").value = will_msg["Topic"];
        document.getElementById("template_will_msg").value = will_msg["Data"];
        document.getElementById("template_will_qos").value = will_msg["QoS"];
        document.getElementById("template_will_retain").value = will_msg["Retain"];
      }
      else {
        document.getElementById("device_name").innerText = client_msg["Client_Name"];
        document.getElementById("d_desc").innerText = client_msg["Client_Desc"];
        document.getElementById("will_topic").value = will_msg["Topic"];
        document.getElementById("will_msg").value = will_msg["Data"];
        document.getElementById("will_qos").value = will_msg["QoS"];
        document.getElementById("will_retain").value = will_msg["Retain"];
      }
      var p_aid, s_aid;
      for (var key in msg) {
        if (key == 'Behavior') {
          var px = document.getElementById("reqres_table");
          while (px.rows[2]) px.deleteRow(2);
          var rownumber = 2;
          for (var innerkey = 0; innerkey < msg[key].length; innerkey++) {
            var m = msg[key][innerkey];


            var res_status = "data_available";
            try {
              res_status = m["Status"];
            }
            catch (error) {
              res_status = "data_available";
            }
            if (res_status != undefined) {
              var px11 = document.getElementById("reqres_table");
              px11.setAttribute("class", "behaviour-table table table-responsive mt10 hidden")
              var px1 = document.getElementById("no_reqres_table");
              px1.setAttribute("class", "behaviour-table table table-responsive mt10")
              while (px1.rows[1]) px1.deleteRow(1);
              var row = px1.insertRow(1);
              var temp1 = row.insertCell(0);
              temp1.colSpan = "9";
              temp1.style.fontWeight = "normal";
              temp1.style.textAlign = "center";
              temp1.innerHTML = "No Behavior Simulation";
              break;
            }
            else {
              var px11 = document.getElementById("reqres_table");
              px11.setAttribute("class", "behaviour-table table table-responsive mt10");
              var px1 = document.getElementById("no_reqres_table");
              px1.setAttribute("class", "behaviour-table table table-responsive mt10 hidden");

              s_aid = m["Behavior_ID"];
              var row = px.insertRow(rownumber);
              var subindex = 0;
              for (subindex = 0; subindex < 6; subindex++) {
                var cell1 = row.insertCell(subindex);
                cell1.id = "resr" + s_aid + "c" + subindex;
                cell1.setAttribute("name", "resr" + s_aid + "c" + subindex);
                switch (subindex) {
                  case 0:
                    {
                      cell1.innerHTML = cell1.value = m["Command_Topic"];
                      break;
                    }
                  case 1:
                    {
                      cell1.innerHTML = cell1.value = m["Command_Data"];
                      break;
                    }
                  case 2:
                    {
                      cell1.innerHTML = cell1.value = m["Event_Topic"];
                      break;
                    }
                  case 3:
                    {
                      cell1.innerHTML = cell1.value = m["Event_Data"];
                      break;
                    }
                  case 4:
                    {
                      var pqos = "0-Atmost Once";
                      if (m["QoS"] == 0) pqos = "0-Atmost Once";
                      else if (m["QoS"] == 1) pqos = "1-Atleast Once";
                      else if (m["QoS"] == 2) pqos = "2-Exactly Once";

                      cell1.innerHTML = cell1.value = pqos;
                      break;
                    }
                  case 5:
                    {
                      var prtn = "0-Retain Flag is not set";
                      if (m["Retain"] == 0)
                        prtn = "0-Retain Flag is not set";
                      else
                        prtn = "1-Retain Flag is set";
                      cell1.innerHTML = cell1.value = prtn;
                      break;
                    }
                }

              }
              var scell2 = row.insertCell(subindex);
              scell2.setAttribute("class", "text-right");
              scell2.innerHTML = '<span class="ml10" id=res' + s_aid + 'edit' + id + ' name=res' + s_aid + 'edit' + id + ' onclick=fnedit(this.id); style=display:none><i class="fa fa-edit" data-toggle="tooltip" title="edit"></i></span><span class="ml10" id=res' + s_aid + 'drop' + id + ' name=res' + s_aid + 'drop' + id + ' onclick=fndrop(this.id);><i class="fa fa-trash" data-toggle="tooltip" title="delete"></i></span>';

              rownumber = rownumber + 1;
            }
          }
        }
        if (key == 'Subscription') {
          var px = document.getElementById("sub_table");
          while (px.rows[1]) px.deleteRow(1);
          var rownumber = 1;
          for (var innerkey = 0; innerkey < msg[key].length; innerkey++) {
            var m = JSON.parse(JSON.stringify(msg[key][innerkey]));
            var sub_status = "data_available";
            try {
              sub_status = m["Status"];
            }
            catch (error) {
              sub_status = "data_available";
            }
            if (sub_status != undefined) {
              var px11 = document.getElementById("sub_table");
              px11.setAttribute("class", "behaviour-table table table-responsive mt10 hidden")
              var px1 = document.getElementById("no_sub_table");
              px1.setAttribute("class", "behaviour-table table table-responsive mt10")
              while (px1.rows[1]) px1.deleteRow(1);
              var row = px1.insertRow(1);
              var temp1 = row.insertCell(0);
              temp1.colSpan = "9";
              temp1.style.fontWeight = "normal";
              temp1.style.textAlign = "center";
              temp1.innerHTML = "Not listening to any command";
              break;
            }
            else {
              var px11 = document.getElementById("sub_table");
              px11.setAttribute("class", "behaviour-table table table-responsive mt10");
              var px1 = document.getElementById("no_sub_table");
              px1.setAttribute("class", "behaviour-table table table-responsive mt10 hidden");

              s_aid = m["Command_ID"];
              var row = px.insertRow(rownumber);
              var subindex = 0;
              for (subindex = 0; subindex < 3; subindex++) {
                var cell1 = row.insertCell(subindex);
                cell1.id = "subr" + s_aid + "c" + subindex;
                cell1.setAttribute("name", "subr" + s_aid + "c" + subindex);
                switch (subindex) {
                  case 0:
                    {
                      cell1.innerHTML = cell1.value = m["Command_Topic"];
                      break;
                    }
                  case 1:
                    {
                      var pqos = "0-Atmost Once";
                      if (m["QoS"] == 0) pqos = "0-Atmost Once";
                      else if (m["QoS"] == 1) pqos = "1-Atleast Once";
                      else if (m["QoS"] == 2) pqos = "2-Exactly Once";

                      cell1.innerHTML = cell1.value = pqos;
                      break;
                    }
                  case 2:
                    {
                      if (m["Time"] == undefined)
                        cell1.innerHTML = cell1.value = m["Subscribe_On"]
                      else
                        cell1.innerHTML = cell1.value = m["Time"]
                      //cell1.setAttribute("class","text-right");
                      break;
                    }
                }

              }
              var scell2 = row.insertCell(subindex);
              scell2.setAttribute("class", "text-right");
              scell2.innerHTML = '<span class="ml10" id=sub' + s_aid + 'edit' + id + ' name=sub' + s_aid + 'edit' + id + ' onclick=fnedit(this.id); style=display:none><i class="fa fa-edit" data-toggle="tooltip" title="edit"></i></span><span class="ml10" id=sub' + s_aid + 'drop' + id + ' name=sub' + s_aid + 'drop' + id + ' onclick=fndrop(this.id);><i class="fa fa-trash" data-toggle="tooltip" title="delete"  id=sub' + s_aid + 'drop' + id + ' name=sub' + s_aid + 'drop' + id + ' onclick=fndrop(this.id);></i></span>';

              rownumber = rownumber + 1;
            }
          }
        }
        if (key == 'Events') {
          var px = document.getElementById("pub_table");
          while (px.rows[1]) px.deleteRow(1);
          var rownumber = 1;
          for (var innerkey = 0; innerkey < msg[key].length; innerkey++) {
            var m;
            try {
              m = JSON.parse(msg[key][innerkey]);
            }
            catch (error) {
              m = msg[key][innerkey];
            }
            var pub_status;
            try {
              pub_status = m["Status"];
            }
            catch (error) {
              pub_status = "data_available";
            }
            if (pub_status != undefined) {
              var px11 = document.getElementById("pub_table");
              px11.setAttribute("class", "table table-responsive mt10 hidden");

              var px1 = document.getElementById("no_pub_table");
              px1.setAttribute("class", "table table-responsive mt10");

              while (px1.rows[1]) px1.deleteRow(1);
              var row = px1.insertRow(1);
              var temp1 = row.insertCell(0);
              temp1.colSpan = "9";
              temp1.style.fontWeight = "normal";
              temp1.style.textAlign = "center";
              temp1.innerHTML = "No Event is configured";
            }
            else {
              var px11 = document.getElementById("pub_table");
              px11.setAttribute("class", "table table-responsive mt10");

              var px1 = document.getElementById("no_pub_table");
              px1.setAttribute("class", "table table-responsive mt10 hidden");
              p_aid = m["Event_ID"];
              var row = px.insertRow(rownumber);
              var sp_time = "";
              var hr = "", min = "", sec = "";
              try {
                //if (innerkey=="Time")
                sp_time = m["Time"];
              }
              catch (error) { }
              if ((sp_time != "") && (sp_time != undefined)) {
                var hr_min_sec = sp_time.split(':');
                hr = hr_min_sec[0];
                min = hr_min_sec[1];
                sec = hr_min_sec[2];
              }
              //if (innerkey=="Publish_On")
              //{
              //var pub_innerkey_msg=m["Publish_On"];
              //var pub_on;

              var pub_on = m["Publish_On"];
              var publish_on_value;
              switch (pub_on) {
                case "On Start":
                  publish_on_value = 0;
                  break;
                case "On Action":
                  publish_on_value = 1;
                  break;
                case "At Specific Interval":
                  publish_on_value = 2;
                  break;
                case "At Specific Time":
                  publish_on_value = 3;
                  break;
                case "Whole Day":
                  publish_on_value = 4;
                  break;
                case "On Disconnect":
                  publish_on_value = 5;
                  break;
              }
              // }
              var pub_on_interval = "";
              try {
                //if (innerkey=="Interval")
                pub_on_interval = m["Interval"];
              }
              catch (error) { }
              var start_hr = "", start_min = "";
              var end_hr = "", end_min = "";
              try {
                var start_time, start_time_t, end_time, end_time_t;
                var start_time_t = m["Start_Time"];
                var start_time = start_time_t.split(':');
                start_hr = start_time[0];
                start_min = start_time[1];
                var end_time_t = m["End_Time"];
                var end_time = end_time_t.split(':');
                end_hr = end_time[0];
                end_min = end_time[1];
              }
              catch (error) { }
              var pubindex;
              for (pubindex = 0; pubindex < 15; pubindex++) {
                var cell1 = row.insertCell(pubindex);
                cell1.id = "pubr" + p_aid + "c" + pubindex;
                cell1.setAttribute("name", "pubr" + p_aid + "c" + pubindex);
                switch (pubindex) {
                  case 0:
                    {
                      cell1.style.width = '180px';
                      document.getElementById("pubr" + p_aid + "c0").innerHTML = '<p><span class="col-md-4 pl0"><b>Topic </b></span><span id="topic' + p_aid + 'c0" name="topic' + p_aid + 'c0">' + m["Topic"] + '</span></p><p><span class="col-md-4 pl0"><b>Qos </b></span> <span>' + m["QoS"] + '</span></p>';
                      document.getElementById("pubr" + p_aid + "c0").innerHTML = document.getElementById("pubr" + p_aid + "c0").innerHTML + '<p><span class="col-md-4 pl0"><b>Retain </b></span> <span>' + m["Retain"] + '</span></p>';
                      break;
                    }
                  case 1:
                    {
                      if (m["Message_Type"] == 6) {
                        cell1.innerHTML = cell1.value = m["Data"];
                      }
                      else {
                        cell1.innerHTML = cell1.value = m["Data"];
                      }
                      break;
                    }
                  case 2:
                    {
                      var pqos = "0-Atmost Once";
                      if (m["QoS"] == 0) pqos = "0-Atmost Once";
                      else if (m["QoS"] == 1) pqos = "1-Atleast Once";
                      else if (m["QoS"] == 2) pqos = "2-Exactly Once";

                      cell1.innerHTML = cell1.value = pqos;
                      cell1.style.display = "none";
                      break;
                    }
                  case 3:
                    {
                      var prtn = "0-Retain Flag is not set";
                      if (m["Retain"] == 0)
                        prtn = "0-Retain Flag is not set";
                      else
                        prtn = "1-Retain Flag is set";
                      cell1.innerHTML = cell1.value = prtn;

                      cell1.style.display = "none";
                      break;
                    }
                  case 4:
                    {
                      cell1.innerHTML = cell1.value = hr;
                      cell1.style.display = "none";
                      break;
                    }
                  case 5:
                    {
                      cell1.innerHTML = cell1.value = min;
                      cell1.style.display = "none";
                      break;
                    }
                  case 6:
                    {
                      cell1.innerHTML = cell1.value = sec;
                      cell1.style.display = "none";
                      break;
                    }
                  case 7:
                    {
                      cell1.innerHTML = cell1.value = m["Message_Type"];
                      cell1.style.display = "none";
                      break;
                    }
                  case 8:
                    {
                      cell1.innerHTML = cell1.value = publish_on_value;
                      cell1.style.display = "none";
                      break;
                    }
                  case 9:
                    {
                      cell1.innerHTML = cell1.value = pub_on_interval;
                      cell1.style.display = "none";
                      break;
                    }
                  case 10:
                    {
                      cell1.innerHTML = cell1.value = start_hr;
                      cell1.style.display = "none";
                      break;
                    }
                  case 11:
                    {
                      cell1.innerHTML = cell1.value = start_min;
                      cell1.style.display = "none";
                      break;
                    }
                  case 12:
                    {
                      cell1.innerHTML = cell1.value = end_hr;
                      cell1.style.display = "none";
                      break;
                    }
                  case 13:
                    {
                      cell1.innerHTML = cell1.value = end_min;
                      cell1.style.display = "none";
                      break;
                    }
                  case 14:
                    {
                      cell1.innerHTML = cell1.value = m["Data"];
                      cell1.style.display = "none";
                      break;
                    }
                }

              }
              var cell2 = row.insertCell(pubindex);
              cell2.setAttribute("style", "width:15%");
              if (publish_on_value == 1)
                cell2.innerHTML = "On Action";
              else if (publish_on_value == 0)
                cell2.innerHTML = "On Start";
              else if (publish_on_value == 5)
                cell2.innerHTML = "On Disconnect";
              else if (publish_on_value == 2)
                cell2.innerHTML = pub_on_interval;
              else if (publish_on_value == 4)
                cell2.innerHTML = pub_on_interval;
              else {
                cell2.innerHTML = sp_time;
              }
              //cell2.setAttribute("class","actiondb");
              var cell3 = row.insertCell(pubindex + 1);
              //cell3.setAttribute("class","text-right");
              cell3.innerHTML = '<span class="ml10" style=cursor:pointer id=pubnow' + p_aid + ' name=pubnow' + p_aid + ' onclick=fnaction(this.id);><i class="fa fa-upload" data-toggle="tooltip" title="Publish"></i></span><span style=cursor:pointer class="ml10" id=suspen' + p_aid + ' name=suspen' + p_aid + ' onclick=fnaction(this.id);><i class="fa fa-pause" data-toggle="tooltip" title="Pause"></i></span></span><span style=cursor:pointer class="ml10" id=resume' + p_aid + ' name=resume' + p_aid + ' onclick=fnaction(this.id);><i class="fa fa-play" data-toggle="tooltip" title="Resume"></i></span><span class="ml10" id=pub' + p_aid + 'edit' + id + ' name=pub' + p_aid + 'edit' + id + ' onclick=fnedit(this.id); style=display:none><i class="fa fa-edit" data-toggle="tooltip" title="edit"></i></span><span class="ml10" id=pub' + p_aid + 'drop' + id + ' name=pub' + p_aid + 'drop' + id + ' onclick=fndrop(this.id);><i class="fa fa-trash" data-toggle="tooltip" title="delete"></i></span>';
              if (publish_on_value == 1) {
                if (connect_status == 1) {
                  document.getElementById("pubnow" + p_aid).disabled = false;
                }
                else {

                  document.getElementById("pubnow" + p_aid).style.pointerEvents = "none";
                  document.getElementById("pubnow" + p_aid).disabled = true;
                }

                document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10");
                document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");
              }
              else if ((publish_on_value == 0) || (publish_on_value == 5)) {

                document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");

              }
              else if ((publish_on_value == 2) || (publish_on_value == 4)) {
                if (connect_status == 1) {
                  document.getElementById("suspen" + p_aid).disabled = false;
                }
                else {
                  document.getElementById("suspen" + p_aid).style.pointerEvents = "none";
                  document.getElementById("suspen" + p_aid).disabled = true;
                }
                document.getElementById("suspen" + p_aid).setAttribute("class", "ml10");
                document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");


              }

              else {
                document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");
              }
              if ((publish_on_value == 2) || (publish_on_value == 4) || (publish_on_value == 1)) {
                if (publish_status != "") {
                  for (var pub_key in publish_status) {
                    var aid = pub_key.replace("pub" + id, "");
                    if (aid == p_aid + "") {
                      if ((publish_status[pub_key] == "publishing") || (publish_status[pub_key] == "resume now")) {
                        document.getElementById("suspen" + p_aid).setAttribute("class", "ml10");
                        document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
                        document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");

                      }
                      else if (publish_status[pub_key] == "suspend now") {
                        document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
                        document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
                        document.getElementById("resume" + p_aid).setAttribute("class", "ml10");


                      }
                      else if (publish_status[pub_key] == "publish now") {
                        document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
                        document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10");
                        document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");


                      }


                    }
                  }
                }
              }
              if (network_chosen == 'bevy_sim_template') {
                document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
                document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");

              }
              rownumber = rownumber + 1;


            }
          }


        }
      }

    },
    error: function () {
    }

  });

}

$("#on_connect_save").click(function (event) {
  var add_or_edit = document.getElementById("add_connect").value;
  var invalid = 0;
  var urlcheck = '/';
  var message_type;
  var action_id = 0;

  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 0;
  document.getElementById("pubt_txt").value = document.getElementById("conn_topic").value;
  if (document.getElementById("pubt_txt").value.trim() == "") {
    invalid = 1;
    swal("", "Topic cannot be empty");
    //$("#on-connect-event").modal('show');

    return;
  }
  document.getElementById("pqos_txt").value = document.getElementById("con_pqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("con_prtn_txt").value;

  if (document.getElementById("message-text").checked == true) {
    var value_type = document.getElementById("value_type").value;
    if (value_type == "constant") {
      //document.getElementById("message_type").value=1;
      message_type = 1;
      document.getElementById("pubm_txt").value = document.getElementById("constant").value;
      if (document.getElementById("constant").value.trim() == "") {
        swal("", "Message cannot be empty");
        //$("#on-connect-event").modal('show');
        return;
      }
    }
    else if (value_type == "system-variable") {
      var system_var_value = document.getElementById("system-variable").value;
      message_type = 21;
      switch (system_var_value) {
        case '$Client_uptime':
          message_type = 21;
          break;
        case '$Current_time':
          message_type = 22;
          break;
        case '$Client_ID':
          message_type = 23;
          break;
      }
      //document.getElementById("message_type").value=msg_type;
      document.getElementById("pubm_txt").value = document.getElementById("system-variable").value;
    }
    else if (value_type == "random") {
      message_type = 3;
      //document.getElementById("message_type").value=3;
      document.getElementById("pubm_txt").value = document.getElementById("random").value
    }
    else {
      var start_value = parseInt(document.getElementById("range_start_value").value);
      var end_value = parseInt(document.getElementById("range_end_value").value);
      if (start_value > end_value)
        document.getElementById("pubm_txt").value = end_value + ' - ' + start_value;
      else
        document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
      //document.getElementById("message_type").value=4;
      message_type = 4;
    }
  }
  else {
    //document.getElementById("message_type").value=6;
    message_type = 6;
    var actual_json_msg = document.getElementById("json_txt").value;
    document.getElementById("pubm_txt").value = document.getElementById("json_txt").value;
    if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubm_txt").value.trim() == "{}")) {
      swal("", "Message cannot be empty");
      //$("#on-connect-event").modal('show');
      return;
    }
    var json_valid = 0;
    if (document.getElementById("pubm_txt").value.trim() == '{}') {
      swal("", "JSON message cannot be empty");
      return;
    }

    try {
      var temp = JSON.parse(actual_json_msg);
      json_valid = 1;
    }
    catch (error) {
      json_valid = 0;
    }
    if (json_valid == 0) {
      swal("", "JSON is not well formed");
      //$("#on-connect-event").modal('show');
      return;
    }

  }
  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("conn_topic").value;
  var message = document.getElementById("pubm_txt").value;
  var qos = document.getElementById("con_pqos_txt").value;
  var retain = document.getElementById("con_prtn_txt").value;
  var publish_on = 0; // 0-OnStart
  var event_data;
  if (add_or_edit == "add_connect") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on });
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id });
  }
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data, 
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#on-connect-event").modal('hide');
      $("#json_txt").val("{}");
      $('.deleteKeyBtn').click();
    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);
});

$("#on_disconnect_save").click(function (event) {
  var message_type;
  var action_id = 0;
  var add_or_edit = document.getElementById("add_disconnect").value;
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 5;
  document.getElementById("pubt_txt").value = document.getElementById("disconn_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("dis_pqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("dis_prtn_txt").value;

  if (document.getElementById("disconnect-text").checked == true) {
    var value_type = document.getElementById("dis_value_type").value;
    if (value_type == "dis_constant") {
      message_type = 1;
      document.getElementById("pubm_txt").value = document.getElementById("dis_constant").value;
    }
    else if (value_type == "dis-system-variable") {
      var system_var_value = document.getElementById("dis-system-variable").value;
      message_type = 21;
      switch (system_var_value) {
        case '$Client_uptime':
          message_type = 21;
          break;
        case '$Current_time':
          message_type = 22;
          break;
        case '$Client_ID':
          message_type = 23;
          break;
      }
      //document.getElementById("message_type").value=msg_type;
      document.getElementById("pubm_txt").value = document.getElementById("dis-system-variable").value;
    }
    else if (value_type == "dis_random") {
      message_type = 3;
      document.getElementById("pubm_txt").value = document.getElementById("dis-random").value
    }
    else {
      var start_value = parseInt(document.getElementById("dis_range_start_value").value);
      var end_value = parseInt(document.getElementById("dis_range_end_value").value);
      if (start_value > end_value)
        document.getElementById("pubm_txt").value = end_value + ' - ' + start_value;
      else
        document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
      message_type = 4;
    }
  }
  else {
    message_type = 6;
    var actual_json_msg = document.getElementById("dis_json_txt").value;
    document.getElementById("pubm_txt").value = document.getElementById("dis_json_txt").value;
    var json_valid = 0;
    if (document.getElementById("pubm_txt").value.trim() == '{}') {
      swal("", "JSON message cannot be empty");
      return;
    }

    try {
      var temp = JSON.parse(actual_json_msg);
      json_valid = 1;
    }
    catch (error) {
      json_valid = 0;
    }
    if (json_valid == 0) {
      swal("", "JSON is not well formed");
      //$("#on-disconnect-event").modal('show');
      return;
    }

  }
  if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubt_txt").value.trim() == "")) {
    swal("", "Topic/Message cannot be empty");
    //$("#on-disconnect-event").modal('show');
    return;
  }

  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("disconn_topic").value;
  var message = document.getElementById("pubm_txt").value;
  var qos = document.getElementById("dis_pqos_txt").value;
  var retain = document.getElementById("dis_prtn_txt").value;
  var publish_on = 5; // 5-OnDisconnect
  var event_data;
  if (add_or_edit == "add_disconnect") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on });
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id });
  }
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#on-disconnect-event").modal('hide');
      $("#dis_json_txt").val("{}");
      $('.deleteKeyBtn').click();

    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);
});

$("#specific-time-save").click(function (event) {
  var add_or_edit = document.getElementById("add_specific_time").value;
  var message_type;
  var action_id = 0;
  var time1 = document.getElementById("specifictimepicker").value;
  var time_elements = time1.split(' ');
  var am_pm = time_elements[1];
  var hr_min = time_elements[0].split(':');
  var hr = hr_min[0];
  var min = hr_min[1];
  if ((am_pm == 'PM') && (parseInt(hr) != 12))
    hr = (parseInt(hr) + 12) % 24;
  if ((am_pm == 'AM') && (parseInt(hr) == 12))
    hr = (parseInt(hr) + 12) % 24;

  document.getElementById("hr").value = hr;
  document.getElementById("min").value = min;
  document.getElementById("sec").value = '00';
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 3;
  document.getElementById("pubt_txt").value = document.getElementById("specific_time_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("spt_pqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("spt_prtn_txt").value;
  if (document.getElementById("interval-text").checked == true) {
    var value_type = document.getElementById("specific_time_value_type").value;
    if (value_type == "specific_time_constant") {
      message_type = 1;
      document.getElementById("pubm_txt").value = document.getElementById("specific_time_constant").value;
    }
    else if (value_type == "specific_time_system_variable") {
      var system_var_value = document.getElementById("specific_time_system_variable").value;
      message_type = 21;
      switch (system_var_value) {
        case '$Client_uptime':
          message_type = 21;
          break;
        case '$Current_time':
          message_type = 22;
          break;
        case '$Client_ID':
          message_type = 23;
          break;
      }
      document.getElementById("pubm_txt").value = document.getElementById("specific_time_system_variable").value;
    }
    else if (value_type == "specific_time_random") {
      message_type = 3;
      document.getElementById("pubm_txt").value = document.getElementById("specific_time_random").value
    }
    else {
      var start_value = parseInt(document.getElementById("specific_time_range_start_value").value);
      var end_value = parseInt(document.getElementById("specific_time_range_end_value").value);
      if (start_value > end_value)
        document.getElementById("pubm_txt").value = end_value + ' - ' + start_value;
      else
        document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
      message_type = 4;
    }
  }
  else {
    message_type = 6;
    var actual_json_msg = document.getElementById("specific_time_json_txt").value;
    document.getElementById("pubm_txt").value = document.getElementById("specific_time_json_txt").value;
    var json_valid = 0;
    if (document.getElementById("pubm_txt").value.trim() == '{}') {
      swal("", "JSON message cannot be empty");
      return;
    }

    try {
      var temp = JSON.parse(actual_json_msg);
      json_valid = 1;
    }
    catch (error) {
      json_valid = 0;
    }
    if (json_valid == 0) {
      swal("", "JSON is not well formed");
      //$("#specific-interval-event").modal('show');
      return;
    }
  }
  if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubt_txt").value.trim() == "")) {
    swal("", "Topic/Message cannot be empty");
    //$("#specific-interval-event").modal('show');
    return;
  }
  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("specific_time_topic").value;
  var message = document.getElementById("pubm_txt").value;
  var qos = document.getElementById("spt_pqos_txt").value;
  var retain = document.getElementById("spt_prtn_txt").value;
  var publish_on = 3; // 3-AtSpecificTime
  var hour = document.getElementById("hr").value;
  var minute = document.getElementById("min").value;
  var second = document.getElementById("sec").value;
  var event_data;
  if (add_or_edit == "add_specific_time") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'hour': hour, 'minute': minute, 'second': second });
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id, 'hour': hour, 'minute': minute, 'second': second });
  }
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#specific-interval-event").modal('hide');
      $("#specific_duration_json_txt").val("{}");
      $('.deleteKeyBtn').click();

    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);
});

$("#instant-save").click(function (event) {
  var add_or_edit = document.getElementById("add_instant").value;
  var message_type;
  var action_id = 0;
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 1;
  document.getElementById("pubt_txt").value = document.getElementById("instant_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("instant_pqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("instant_prtn_txt").value;
  if (document.getElementById("instant-text").checked == true) {
    var value_type = document.getElementById("instant_value_type").value;
    if (value_type == "instant_constant") {
      message_type = 1;
      document.getElementById("pubm_txt").value = document.getElementById("instant_constant").value;
    }
    else if (value_type == "instant_system_variable") {
      var system_var_value = document.getElementById("instant_system_variable").value;
      message_type = 21;
      switch (system_var_value) {
        case '$Client_uptime':
          message_type = 21;
          break;
        case '$Current_time':
          message_type = 22;
          break;
        case '$Client_ID':
          message_type = 23;
          break;
      }
      //document.getElementById("message_type").value=msg_type;
      document.getElementById("pubm_txt").value = document.getElementById("instant_system_variable").value;
    }
    else if (value_type == "instant_random") {
      message_type = 3;
      document.getElementById("pubm_txt").value = document.getElementById("instant_random").value
    }
    else {
      var start_value = parseInt(document.getElementById("instant_range_start_value").value);
      var end_value = parseInt(document.getElementById("instant_range_end_value").value);
      if (start_value > end_value)
        document.getElementById("pubm_txt").value = end_value + ' - ' + start_value;
      else
        document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
      message_type = 4;
    }
  }
  else {
    message_type = 6;
    var actual_json_msg = document.getElementById("instant_json_txt").value;
    document.getElementById("pubm_txt").value = document.getElementById("instant_json_txt").value;
    var json_valid = 0;
    if (document.getElementById("pubm_txt").value.trim() == '{}') {
      swal("", "JSON message cannot be empty");
      return;
    }

    try {
      var temp = JSON.parse(actual_json_msg);
      json_valid = 1;
    }
    catch (error) {
      json_valid = 0;
    }
    if (json_valid == 0) {
      swal("", "JSON is not well formed");
      //$("#instant-event").modal('show');
      return;
    }
  }
  if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubt_txt").value.trim() == "")) {
    swal("", "Topic/Message cannot be empty");
    //$("#instant-event").modal('show');
    return;
  }

  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("instant_topic").value;
  var message = document.getElementById("pubm_txt").value;
  var qos = document.getElementById("instant_pqos_txt").value;
  var retain = document.getElementById("instant_prtn_txt").value;
  var publish_on = 1; // 1-OnAction
  var event_data;
  if (add_or_edit == "add_instant") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on });
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id });
  }
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#instant-event").modal('hide');
      $("#instant_json_txt").val("{}");
      $('.deleteKeyBtn').click();
    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);
});

$("#specific-duration-save").click(function (event) {
  var add_or_edit = document.getElementById("add_specific_duration").value;
  var message_type;
  var action_id = 0;
  var time1 = document.getElementById("specific_duration_start_time").value;
  var time_elements = time1.split(' ');
  var am_pm = time_elements[1];
  var hr_min = time_elements[0].split(':');
  var hr = hr_min[0];
  var min = hr_min[1];
  if (am_pm == 'PM') {
    if (parseInt(hr) != 12)
      hr = (parseInt(hr) + 12) % 24;
  }
  if ((am_pm == 'AM') && (parseInt(hr) == 12))
    hr = (parseInt(hr) + 12) % 24;

  document.getElementById("start_hr_temp").value = hr;
  document.getElementById("start_min_temp").value = min;
  var time2 = document.getElementById("specific_duration_end_time").value;
  var time2_elements = time2.split(' ');
  var am_pm2 = time2_elements[1];
  var hr_min2 = time2_elements[0].split(':');
  var hr2 = hr_min2[0];
  var min2 = hr_min2[1];
  if (am_pm2 == 'PM') {
    if (hr2 != 12)
      hr2 = (parseInt(hr2) + 12) % 24;
  }
  if ((am_pm2 == 'AM') && (parseInt(hr2) == 12))
    hr2 = (parseInt(hr2) + 12) % 24;

  document.getElementById("end_hr_temp").value = hr2;
  document.getElementById("end_min_temp").value = min2;
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 2;
  document.getElementById("pubt_txt").value = document.getElementById("specific_duration_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("specific_duration_pqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("specific_duration_prtn_txt").value;
  document.getElementById("interval_temp").value = document.getElementById("specific_duration_interval").value;
  if (document.getElementById("duration-text").checked == true) {
    var value_type = document.getElementById("specific_duration_value_type").value;
    if (value_type == "specific_duration_constant") {
      message_type = 1;
      document.getElementById("pubm_txt").value = document.getElementById("specific_duration_constant").value;
    }
    else if (value_type == "specific_duration_system_variable") {
      var system_var_value = document.getElementById("specific_duration_system_variable").value;
      message_type = 21;
      switch (system_var_value) {
        case '$Client_uptime':
          message_type = 21;
          break;
        case '$Current_time':
          message_type = 22;
          break;
        case '$Client_ID':
          message_type = 23;
          break;
      }
      document.getElementById("pubm_txt").value = document.getElementById("specific_duration_system_variable").value;
    }
    else if (value_type == "specific_duration_random") {
      message_type = 3;
      document.getElementById("pubm_txt").value = document.getElementById("specific_duration_random").value
    }
    else if (value_type == "specific_duration_range") {
      var start_value = parseInt(document.getElementById("specific_duration_range_start_value").value);
      var end_value = parseInt(document.getElementById("specific_duration_range_end_value").value);
      if (start_value > end_value)
        document.getElementById("pubm_txt").value = end_value + ' - ' + start_value;
      else
        document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
      message_type = 4;
    }
    else if (value_type == "specific_duration_linear") {
      var start_value = parseInt(document.getElementById("specific_duration_linear_start_value").value);
      var end_value = parseInt(document.getElementById("specific_duration_linear_end_value").value);
      if (start_value > end_value)
        message_type = 72;
      else
        message_type = 71;
      document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
    }
  }
  else {
    message_type = 6;
    var actual_json_msg = document.getElementById("specific_duration_json_txt").value;
    document.getElementById("pubm_txt").value = document.getElementById("specific_duration_json_txt").value;
    var json_valid = 0;
    if (document.getElementById("pubm_txt").value.trim() == '{}') {
      swal("", "JSON message cannot be empty");
      return;
    }

    try {
      var temp = JSON.parse(actual_json_msg);
      json_valid = 1;
    }
    catch (error) {
      json_valid = 0;
    }
    if (json_valid == 0) {
      swal("", "JSON is not well formed");
      //$("#specified-duration-event").modal('show');
      return;
    }
  }
  if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubt_txt").value.trim() == "")) {
    swal("", "Topic/Message cannot be empty");
    //$("#specified-duration-event").modal('show');
    return;
  }

  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("specific_duration_topic").value;
  var message = document.getElementById("pubm_txt").value;
  var qos = document.getElementById("specific_duration_pqos_txt").value;
  var retain = document.getElementById("specific_duration_prtn_txt").value;
  var publish_on = 2; // 1-AtSpecificDuration
  var start_hour = hr;
  var start_minute = min;
  var end_hour = hr2;
  var end_minute = min2;
  var interval = document.getElementById("specific_duration_interval").value;

  var event_data;
  if (add_or_edit == "add_specific_duration") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'start_hour': start_hour, 'start_minute': start_minute, 'end_hour': end_hour, 'end_minute': end_minute, 'interval': interval });
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id, 'start_hour': start_hour, 'start_minute': start_minute, 'end_hour': end_hour, 'end_minute': end_minute, 'interval': interval });
  }
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#specified-duration-event").modal('hide');
      $("#specific_duration_json_txt").val("{}");
      $('.deleteKeyBtn').click();

    },
    error: function (data) {
    }
  });

  disp_detail(dev_id);
});

$("#no_of_events").click(function (event) {
  var k = document.getElementById("upload_csv")['files'][0];
  if (k == undefined)
  {
    alert("Please choose a CSV file to import...");
    return;
  }
})

$("#whole-day-save").click(function (event) {
  var add_or_edit = document.getElementById("add_whole_day").value;
  var message_type;
  var action_id = 0;
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 4;
  document.getElementById("pubt_txt").value = document.getElementById("whole_day_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("whole_day_pqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("whole_day_prtn_txt").value;
  document.getElementById("interval_temp").value = document.getElementById("whole_day_interval").value;
  if (document.getElementById("wholeday-text").checked == true) {
    var value_type = document.getElementById("whole_day_value_type").value;
    if (value_type == "whole_day_constant") {
      message_type = 1;
      document.getElementById("pubm_txt").value = document.getElementById("whole_day_constant").value;
    }
    else if (value_type == "whole_day_system_variable") {
      var system_var_value = document.getElementById("whole_day_system_variable").value;
      var msg_type = 21;
      switch (system_var_value) {
        case '$Client_uptime':
          msg_type = 21;
          break;
        case '$Current_time':
          msg_type = 22;
          break;
        case '$Client_ID':
          msg_type = 23;
          break;
      }
      message_type = msg_type;
      document.getElementById("pubm_txt").value = document.getElementById("whole_day_system_variable").value;
    }
    else if (value_type == "whole_day_random") {
      message_type = 3;
      document.getElementById("pubm_txt").value = document.getElementById("whole_day_random").value
    }
    else {
      var start_value = parseInt(document.getElementById("whole_day_range_start_value").value);
      var end_value = parseInt(document.getElementById("whole_day_range_end_value").value);
      if (start_value > end_value)
        document.getElementById("pubm_txt").value = end_value + ' - ' + start_value;
      else
        document.getElementById("pubm_txt").value = start_value + ' - ' + end_value;
      message_type = 4;
    }
  }
  else {
    message_type = 6;
    var actual_json_msg = document.getElementById("whole_day_json_txt").value;
    document.getElementById("pubm_txt").value = document.getElementById("whole_day_json_txt").value;
    var json_valid = 0;
    if (document.getElementById("pubm_txt").value.trim() == '{}') {
      swal("", "JSON message cannot be empty");
      return;
    }
    try {
      var temp = JSON.parse(actual_json_msg);
      json_valid = 1;
    }
    catch (error) {
      json_valid = 0;
    }
    if (json_valid == 0) {
      swal("", "JSON is not well formed");
      //$("#wholeday-event").modal('show');
      return;
    }
  }
  if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubt_txt").value.trim() == "")) {
    swal("", "Topic/Message cannot be empty");
    //$("#wholeday-event").modal('show');
    return;
  }
  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("whole_day_topic").value;
  var message = document.getElementById("pubm_txt").value;
  var qos = document.getElementById("whole_day_pqos_txt").value;
  var retain = document.getElementById("whole_day_prtn_txt").value;
  var publish_on = 4; // 4-WholeDay
  var interval = document.getElementById("whole_day_interval").value;

  var event_data;
  if (add_or_edit == "add_whole_day") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'interval': interval });
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id, 'interval': interval });
  }
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#wholeday-event").modal('hide');
      $("#whole_day_json_txt").val("{}");
      $('.deleteKeyBtn').click();

    },
    error: function (data) {
    }
  });

  disp_detail(dev_id);
});

$("#from-csv-save").click(function(event) {
  var today = new Date();
  var day = today.getDay();
  var daylist = ["Sunday","Monday","Tuesday","Wednesday ","Thursday","Friday","Saturday"];
  console.log("Today is : " + daylist[day] + ".");
  var cur_hour = today.getHours();
  var cur_minute = today.getMinutes();
  var second = today.getSeconds();
  var prepand = (cur_hour >= 12)? " PM ":" AM ";
  // cur_hour = (cur_hour >= 12)? cur_hour - 12: cur_hour;
  if (cur_hour===0 && prepand===' PM ') 
  { 
  if (cur_minute===0 && second===0)
  { 
  cur_hour=12;
  prepand=' Noon';
  } 
  else
  { 
  cur_hour=12;
  prepand=' PM';
  } 
  } 
  if (cur_hour===0 && prepand===' AM ') 
  { 
  if (cur_minute===0 && second===0)
  { 
  cur_hour=12;
  prepand=' Midnight';
  } 
  else
  { 
  cur_hour=12;
  prepand=' AM';
  } 
  }
  if (cur_hour<10)
  {
    cur_hour="0"+cur_hour
  }
  if (cur_minute<10) 
  {
    cur_minute="0"+cur_minute
  }
  var from_csv = document.getElementById("from_csv").value;
  var time1 = document.getElementById("csvtimepicker").value;
  var interval = document.getElementById("from_csv_interval").value;
  var no_of_events = document.getElementById("no_of_events").value;
  var time_elements = time1.split(' ');
  var am_pm = time_elements[1];
  var hr_min = time_elements[0].split(':');
  var hr = hr_min[0];
  var min = hr_min[1];
  if ((am_pm == 'PM') && (parseInt(hr) != 12))
    hr = (parseInt(hr) + 12) % 24;
  if ((am_pm == 'AM') && (parseInt(hr) == 12))
    hr = (parseInt(hr) + 12) % 24;
  document.getElementById("hr").value = hr;
  document.getElementById("min").value = min;
  document.getElementById("sec").value = '00';
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("publish_on_temp").value = 3;
  document.getElementById("pubt_txt").value = document.getElementById("from_csv_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("from_csvqos_txt").value;
  document.getElementById("prtn_txt").value = document.getElementById("from_csvrtn_txt").value;
  message_type = 1;
  if ((document.getElementById("pubt_txt").value.trim() == "") || (document.getElementById("no_of_events").value.trim() == ""))
  {
    swal("", "Topic/No_of_Events cannot be empty");
    //$("#specific-interval-event").modal('show');
    return;
  }
  var device_id = document.getElementById("d_name").value;
  var topic = document.getElementById("from_csv_topic").value;
  var message = "";
  var qos = document.getElementById("from_csvqos_txt").value;
  var retain = document.getElementById("from_csvrtn_txt").value;
  var publish_on = 6; // 3-AtSpecificTime
  var hour = document.getElementById("hr").value;
  var minute = document.getElementById("min").value;
  var second = document.getElementById("sec").value;
  var event_data;
  var k = document.getElementById("upload_csv")['files'][0];
  if (cur_hour<=hour) {
    if (cur_hour == hour && cur_minute<=minute) {

    }
    else if (cur_hour < hour) {}
    else{
      alert("past time not accepted")
      return;
    }
  }
  else{
    alert("past time not accepted")
    return;
  }

  if (k == undefined)
  {
    swal("", "Please choose a CSV file to import...");
    return;
  }
  var formData = new FormData();
  formData.append('csvname', k);
  // alert(formData);
  $.ajax({
    url: "/csv/upload",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    method: "POST",
    async : false,
    success: function (res) {
    if (res == "Failed")
      swal("Error in Uploading ");
    else{
      //swal("Uploaded successfully", "", "success");
    }
    },
    error: function (err) {
      swal("Error in Uploading");
    }
  })
  csvname = k.name
  if (from_csv == "from_csv") {
    urlcheck = '/addevent';
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'interval': interval, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'hour': hour, 'minute': minute, 'second': second, 'csvname': csvname, 'no_of_events': no_of_events});
  }
  else {
    urlcheck = '/updateevent';
    action_id = document.getElementById("paid_txt").value;
    event_data = JSON.stringify({ 'device_id': device_id, 'topic': topic, 'message': message, 'message_type': message_type, 'qos': qos, 'retain': retain, 'publish_on': publish_on, 'action_id': action_id, 'hour': hour, 'minute': minute, 'second': second });
  }
  //alert(event_data);
  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: event_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#from-csv-event").modal('hide');
      $("#specific_duration_json_txt").val("{}");
      $('.deleteKeyBtn').click();
    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);     
});

$("#subscribe-save").click(function (event) {
  var add_or_edit = document.getElementById("add_subscribe").value;
  var urlcheck;
  var subscribe_on = document.getElementById("subscribe_on").value;
  if (subscribe_on == 'on-start') {
    document.getElementById("hr").value = '-1';
    document.getElementById("min").value = '-1';
    document.getElementById("sec").value = '-1';
  }
  else {
    var time1 = document.getElementById("subscribe_timepicker").value;
    var time_elements = time1.split(' ');
    var am_pm = time_elements[1];
    var hr_min = time_elements[0].split(':');
    var hr = hr_min[0];
    var min = hr_min[1];
    if (am_pm == 'PM')
      hr = (parseInt(hr) + 12) % 24;
    var sec = '00';
    document.getElementById("hr").value = hr;
    document.getElementById("min").value = min;
    document.getElementById("sec").value = sec;
  }
  var dev_id = document.getElementById("d_name").value;
  document.getElementById("pubt_txt").value = document.getElementById("subscribe_topic").value;
  document.getElementById("pqos_txt").value = document.getElementById("subscribe_qos").value;
  document.getElementById("prtn_txt").value = 0;
  document.getElementById("pubm_txt").value = '';
  if (document.getElementById("pubt_txt").value.trim() == "") {
    swal("", "Topic cannot be empty");
    //$("#subscribe-command").modal('show');
    return;
  }
  var topic = document.getElementById("subscribe_topic").value;
  var qos = document.getElementById("subscribe_qos").value;
  var hour = document.getElementById("hr").value;
  var minute = document.getElementById("min").value;
  var second = document.getElementById("sec").value;
  var command_data;
  if (add_or_edit == "add_subscribe") {
    urlcheck = '/addcommand';
    command_data = JSON.stringify({ 'device_id': dev_id, 'topic': topic, 'qos': qos, 'hour': hour, 'minute': minute, 'second': second });
  }
  else {
    urlcheck = '/updatecommand';
    var action_id = document.getElementById("paid_txt").value;
    command_data = JSON.stringify({ 'device_id': dev_id, 'action_id': action_id, 'topic': topic, 'qos': qos, 'hour': hour, 'minute': minute, 'second': second });
  }

  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: command_data,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#subscribe-command").modal('hide');
    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);
});

$("#behavior-save").click(function (event) {
  var add_or_edit = document.getElementById("add_behavior").value;
  var urlcheck;

  var dev_id = document.getElementById("d_name").value;
  document.getElementById("pubt_txt").value = document.getElementById("request_topic").value;
  document.getElementById("pubm_txt").value = document.getElementById("request_message").value;
  document.getElementById("pqos_txt").value = document.getElementById("behavior_qos").value;
  document.getElementById("prtn_txt").value = document.getElementById("behavior_rtn").value;
  if ((document.getElementById("pubm_txt").value.trim() == "") || (document.getElementById("pubt_txt").value.trim() == "") || (document.getElementById("resm_txt").value.trim() == "") || (document.getElementById("rest_txt").value.trim() == "")) {
    swal("", "Topic/Message cannot be empty");
    //$("#behaviour-command").modal('show');
    return;
  }
  var command_topic = document.getElementById("request_topic").value;
  var command_message = document.getElementById("request_message").value;
  var event_topic = document.getElementById("rest_txt").value;
  var event_message = document.getElementById("resm_txt").value;
  var qos = document.getElementById("behavior_qos").value;
  var retain = document.getElementById("behavior_rtn").value;


  var behaviordata;

  if (add_or_edit == "add_behavior") {
    urlcheck = '/addbehavior';
    behaviordata = JSON.stringify({ 'device_id': dev_id, 'event_topic': event_topic, 'event_data': event_message, 'command_topic': command_topic, 'command_data': command_message, 'qos': qos, 'retain': retain });
  }
  else {
    urlcheck = '/updatebehavior';
    var action_id = document.getElementById("paid_txt").value;
    behaviordata = JSON.stringify({ 'device_id': dev_id, 'action_id': action_id, 'event_topic': event_topic, 'event_data': event_message, 'command_topic': command_topic, 'command_data': command_message, 'qos': qos, 'retain': retain });
  }

  $.ajax({
    url: urlcheck,
    contentType: 'application/json',
    data: behaviordata,
    type: "POST",
    //async:false,
    success: function (msg) {
      $("#behaviour-command").modal('hide');
    },
    error: function (data) {
    }
  });
  disp_detail(dev_id);
});


function fnaction(id2) {
  var p_version = false;
  $.ajax({
    url: '/checkversion?curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      if (msg == "0") {
        swal("", "Publish suspend/resume - Feature available only for paid version");
        return;
      }
      else
        p_version = true;

    },
    error: function (data) {
    }
  });
  if (p_version == false)
    return;

  var chk = id2;
  var p_aid = chk.slice(6);
  var urlcheck;
  var event_data = '?action_id=' + p_aid + '&device_id=' + document.getElementById("d_name").value;
  if (chk.indexOf("suspen") > -1) {
    document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
    document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
    document.getElementById("resume" + p_aid).setAttribute("class", "ml10");
    urlcheck = '/suspend';
  }
  else if (chk.indexOf("resume") > -1) {
    document.getElementById("suspen" + p_aid).setAttribute("class", "ml10");
    document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10 hidden");
    document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");
    urlcheck = '/resume';
  }
  else {
    document.getElementById("suspen" + p_aid).setAttribute("class", "ml10 hidden");
    document.getElementById("pubnow" + p_aid).setAttribute("class", "ml10");
    document.getElementById("resume" + p_aid).setAttribute("class", "ml10 hidden");
    urlcheck = '/publishnow';
  }

  document.getElementById("paid_txt").value = p_aid;

  $("#paid_txt").appendTo("#myform");

  $.ajax({


    url: urlcheck + event_data + '&curr_time=' + new Date().getTime(),

    type: "GET",
    dataType: "text",
    async: false,
    success: function () {

    }

  });
  document.getElementById("paid_txt").style.display = "none";
}

function addconnect() {
  document.getElementById("add_connect").value = "add_connect";
  document.getElementById("connectModalLabel").innerText = "Event on connect - " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("topic_help").style.display = "block";
  else
    document.getElementById("topic_help").style.display = "none";
  // $("#conn_topic").focus();
  $("#on-connect-event").modal('show');
}
function adddisconnect() {
  document.getElementById("add_disconnect").value = "add_disconnect";
  document.getElementById("disconnectModalLabel").innerText = "Event on Disconnect - " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("disconnect_topic_help").style.display = "block";
  else
    document.getElementById("disconnect_topic_help").style.display = "none";

  $("#on-disconnect-event").modal('show');
}
function addwholeday() {
  document.getElementById("add_whole_day").value = "add_whole_day";
  document.getElementById("whole_dayModalLabel").innerText = "Event for Whole day -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("wholeday_topic_help").style.display = "block";
  else
    document.getElementById("wholeday_topic_help").style.display = "none";

  $("#wholeday-event").modal('show');
}
function fromcsv() {
  var today = new Date();
  var day = today.getDay();
  var daylist = ["Sunday","Monday","Tuesday","Wednesday ","Thursday","Friday","Saturday"];
  console.log("Today is : " + daylist[day] + ".");
  var hour = today.getHours();
  var minute = today.getMinutes();
  var second = today.getSeconds();
  var prepand = (hour >= 12)? " PM ":" AM ";
  hour = (hour >= 12)? hour - 12: hour;
  if (hour===0 && prepand===' PM ') 
  { 
  if (minute===0 && second===0)
  { 
  hour=12;
  prepand=' Noon';
  } 
  else
  { 
  hour=12;
  prepand=' PM';
  } 
  } 
  if (hour===0 && prepand===' AM ') 
  { 
  if (minute===0 && second===0)
  { 
  hour=12;
  prepand=' Midnight';
  } 
  else
  { 
  hour=12;
  prepand=' AM';
  } 
  }
  if (hour<10)
  {
    hour="0"+hour
  }
  if (minute<10) 
  {
    minute="0"+minute
  }
  document.getElementById("csvtimepicker").value= hour+":"+ minute+""+prepand

  document.getElementById("from_csv").value = "from_csv";
  document.getElementById("from_csvModalLabel").innerText = "Event for From CSV -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("from_csv_topic_help").style.display = "block";
  else
    document.getElementById("from_csv_topic_help").style.display = "none";

  $("#from-csv-event").modal('show');
}
function addsubscribe() {
  document.getElementById("add_subscribe").value = "add_subscribe";
  document.getElementById("subscribeModalLabel").innerText = "Subscribe for command -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("subscribe_topic_help").style.display = "block";
  else
    document.getElementById("subscribe_topic_help").style.display = "none";

  $("#subscribe-command").modal('show');
}
function addbehavior() {
  document.getElementById("add_behavior").value = "add_behavior";
  document.getElementById("behaviorModalLabel").innerText = "Add New Behavior -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("behaviour_topic_help").style.display = "block";
  else
    document.getElementById("behaviour_topic_help").style.display = "none";

  $("#behaviour-command").modal('show');
}
function addinstant() {
  document.getElementById("add_instant").value = "add_instant";
  document.getElementById("instantModalLabel").innerText = "Instant Event -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("instant_topic_help").style.display = "block";
  else
    document.getElementById("instant_topic_help").style.display = "none";

  $("#instant-event").modal('show');
}
function addspecificduration() {
  document.getElementById("add_specific_duration").value = "add_specific_duration";
  document.getElementById("specific_durationModalLabel").innerText = "Event for Specific Duration -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("duration_topic_help").style.display = "block";
  else
    document.getElementById("duration_topic_help").style.display = "none";

  $("#specified-duration-event").modal('show');
}
function addspecifictime() {
  document.getElementById("add_specific_time").value = "add_specific_time";
  document.getElementById("specific_timeModalLabel").innerText = "Event for Specific Time -  " + document.getElementById("d_name").value;
  if (network_chosen == 'bevy_sim_template')
    document.getElementById("sp_time_topic_help").style.display = "block";
  else
    document.getElementById("sp_time_topic_help").style.display = "none";
  $("#specific-interval-event").modal('show');
}
function enable_textfield(field_name) {
  document.getElementById(field_name).setAttribute("class", "");
  $("#" + field_name).focus();
}
function username_update() {
  var url_check;
  var user_data;
  if (network_chosen == 'bevy_sim_template') {
    if (document.getElementById("template_username").value.trim() == "") {
      $(this).addClass('disabled_text');
      swal("", "Access key cannot be empty");
      return;
    }

    $("#template_username").trigger("blur");
    document.getElementById("template_username").setAttribute("class", "disabled_text");
    user_data = JSON.stringify({ 'device_id': document.getElementById("d_name").value, 'user': document.getElementById("template_username").value });
    url_check = '/save/username';
  }
  else {
    if (document.getElementById("username").value.trim() == "") {

      $(this).addClass('disabled_text');
      swal("", "Access key cannot be empty");
      return;
    }

    $("#username").trigger("blur");
    document.getElementById("username").setAttribute("class", "disabled_text");
    var auth_type="";
    if ((window.h == "Azure_IoT") || (window.h == "Aws_IoT") || (window.mg_application == "Azure_IoT") || (window.mg_application == "Aws_IoT"))
    {
      auth_type = document.getElementById("auth").value;
    }
    user_data = JSON.stringify({ 'device_id': document.getElementById("d_name").value, 'user': document.getElementById("username").value, 'auth_Type':auth_type, 'auth_Block': '1' });
    url_check = '/save/username';
  }
  $.ajax({
    url: url_check,
    contentType: 'application/json',
    data: user_data,
    type: "POST",
    success: function (msg) {
    },
    error: function (data) {
    }
  });
}
function password_update() {
  var url_check;
  var user_data;
  if (network_chosen == 'bevy_sim_template') {

    if (document.getElementById("template_password").value.trim() == "") {
      $(this).addClass('disabled_text');
      swal("", "Access Token cannot be empty");
      return;
    }
    //document.getElementById("password_txt").value=document.getElementById("template_password").value;
    $("#template_password").trigger("blur");
    document.getElementById("template_password").setAttribute("class", "disabled_text");
    url_check = '/save/password';
    user_data = JSON.stringify({ 'device_id': document.getElementById("d_name").value, 'pwd': document.getElementById("template_password").value });
  }
  else {

    if (document.getElementById("password").value.trim() == "") {
      $(this).addClass('disabled_text');
      swal("", "Access Token cannot be empty");
      return;
    }


    //document.getElementById("password_txt").value=document.getElementById("password").value;
    $("#password").trigger("blur");
    document.getElementById("password").setAttribute("class", "disabled_text");
    var auth_type="";
    if ((window.h == "Azure_IoT") || (window.h == "Aws_IoT") || (window.mg_application == "Azure_IoT") || (window.mg_application == "Aws_IoT"))
    {
      auth_type = document.getElementById("auth").value;
    }    
    user_data = JSON.stringify({ 'device_id': document.getElementById("d_name").value, 'pwd': document.getElementById("password").value, 'auth_Type': auth_type, 'auth_Block': '1' });
    url_check = '/save/password';
  }
  $.ajax({
    url: url_check,
    contentType: 'application/json',
    data: user_data,
    type: "POST",
    success: function (msg) {

      document.getElementById("auth").disabled = true;

    },
    error: function (data) {
    }
  });
}

function willtopic_update() {
  var url_check;
  var will_topic, will_message, will_qos, will_retain;
  if (network_chosen == 'bevy_sim_template') {

    if (document.getElementById("template_will_topic").value.trim() == "") {
      swal("", "Will Topic cannot be empty");
      return;
    }
    will_topic = document.getElementById("template_will_topic").value;
    will_message = document.getElementById("template_will_msg").value;
    will_qos = document.getElementById("template_will_qos").value;
    will_retain = document.getElementById("template_will_retain").value;
    $("#template_will_topic").trigger("blur");
    document.getElementById("template_will_topic").setAttribute("class", "disabled_text");
  }
  else {

    if (document.getElementById("will_topic").value.trim() == "") {
      swal("", "Will Topic cannot be empty");
      return;
    }
    $("#will_topic").trigger("blur");
    document.getElementById("will_topic").setAttribute("class", "disabled_text");
    will_topic = document.getElementById("will_topic").value;
    will_message = document.getElementById("will_msg").value;
    will_qos = document.getElementById("will_qos").value;
    will_retain = document.getElementById("will_retain").value;

  }
var will_data = JSON.stringify({ 'device_id': document.getElementById("d_name").value, 'will_topic': will_topic, 'will_message': will_message, 'will_qos': will_qos, 'will_retain': will_retain });

  $.ajax({
    url:'/save/willdetails',
    type: "POST",
    data: will_data,
    contentType: 'application/json',
    //async: false,
    success: function (msg) {
    },
    error: function (data) {
    }
  });
}
function willmessage_update() {
  var url_check;
  var will_topic, will_message, will_qos, will_retain;

  if (network_chosen == 'bevy_sim_template') {
    if ((document.getElementById("template_will_topic").value.trim() == "") || (document.getElementById("template_will_msg").value.trim() == "")) {
      swal("", "Will Topic/Message cannot be empty");
      return;
    }
    $("#template_will_msg").trigger("blur");
    document.getElementById("template_will_msg").setAttribute("class", "disabled_text");
    will_topic = document.getElementById("template_will_topic").value;
    will_message = document.getElementById("template_will_msg").value;
    will_qos = document.getElementById("template_will_qos").value;
    will_retain = document.getElementById("template_will_retain").value;
  }
  else {

    if ((document.getElementById("will_topic").value.trim() == "") || (document.getElementById("will_msg").value.trim() == "")) {
      swal("", "Will Topic/Message cannot be empty");
      return;
    }
    $("#will_msg").trigger("blur");
    document.getElementById("will_msg").setAttribute("class", "disabled_text");

    will_topic = document.getElementById("will_topic").value;
    will_message = document.getElementById("will_msg").value;
    will_qos = document.getElementById("will_qos").value;
    will_retain = document.getElementById("will_retain").value;

  }
var will_data = JSON.stringify({ 'device_id': document.getElementById("d_name").value, 'will_topic': will_topic, 'will_message': will_message, 'will_qos': will_qos, 'will_retain': will_retain });
  $.ajax({
    url: '/save/willdetails',
    type: "POST",
    data: will_data,
    contentType: 'application/json',
    success: function (msg) {
    },
    error: function (data) {
    }
  });
}
function start_or_stop_network() {
  var start_network = document.getElementById("startnetwork").checked;
  var active_devices_count = 0;
  var urlcheck;
  if (start_network == false) {
    $('.device-start').attr('data-original-title', 'Stop Network');
    if (licensed_count_exceed == true) {
      swal("", "Licensed Client Count Exceeded. Contact www.bevywise.com for further assistance");
      $('.device-start').removeAttr('data-original-title').blur();
      $('.device-start').attr('data-original-title', 'Start Network');
      document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
      document.getElementById("startnetwork").checked = false;
      document.getElementById("startnetwork").disabled = true;
      return;
    }
    urlcheck = '/startnetwork?curr_time=' + new Date().getTime();
    document.getElementById("startnetwork").checked = true;
    document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
    $('.device-start').removeAttr('data-original-title').blur();
    $('.device-start').attr('data-original-title', 'Stop Network');

  }
  else {
    $('.device-start').attr('data-original-title', 'Start Network');
    urlcheck = '/stopnetwork?network_chosen=' + network_chosen + '&curr_time=' + new Date().getTime();
    document.getElementById("startnetwork").checked = false;
    document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
  }
  $.ajax({
    url: urlcheck,
    dataType: "text",
    type: "GET",
    async: false,
    success: function (msg) {

      if ((msg == "-6") || (msg.indexOf("exception: access violation reading") > -1)) {
        swal("", "Broker is not running. Start broker to connect the devices");
        document.getElementById("startnetwork").checked = start_network;
        if (start_network == false)
          document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
        else
        {
          document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
        }
        brokerfound = 0;
        $('.device-start').attr('data-original-title', 'Start Network');

      }
      else if (msg == "-5") {
        swal("", "Licensed Client Count Exceeded");
        licence_exceed = 1;
        licensed_count_exceed = false;
      }
      else if (msg == "False") {
        swal("", "Check credential details");
        brokerfound = 0;
      }
      /*if(document.getElementById("startnetwork").checked==true)
      {
        document.getElementById("add_blank_device").setAttribute("class", "disabled_here");
      }
      else
      {
        document.getElementById("add_blank_device").setAttribute("class", "enabled_here");
      }*/
    },
    error: function (mm) {
    }

  });
  var client_status = [];
  if (network_chosen != 'bevy_sim_template') {
    $.ajax({
      url: '/get_all_clients_status?network=' + network_chosen + '&curr_time=' + new Date().getTime(),
      dataType: 'text',
      type: "GET",
      async: false,
      success: function (msg) {
        if (msg == "notavailable") {
          return;
        }
        var m = JSON.parse(msg);
        for (var key in m) {
          client_status[key] = m[key];
          if (document.getElementById("status" + key)) {
            if (m[key] == "connected") {
              document.getElementById("status" + key).setAttribute("class", 'fa fa-circle pull-right start');
              document.getElementById("status" + key).setAttribute("onclick", 'stopdevice(this.id)');
            }
            else {
              document.getElementById("status" + key).setAttribute("class", 'fa fa-circle pull-right stop');
              document.getElementById("status" + key).setAttribute("onclick", 'startdevice(this.id)');
            }
          }
        }
      }
    });
  }
  var devices_count = 0;

  $.ajax({
    url: '/getNetworkStatus?curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",

    async: false,
    success: function (msg) {
      m = JSON.parse(msg);
      var total_topics_count = 0;
      var published_topics_count = 0;
      var subscribed_topics_count = 0;
      for (var key in m) {
        if (key == "Total") {
          document.getElementById("total_devices").innerText = 'Total Devices : ' + m[key];
          devices_count = parseInt(m[key]);
          document.getElementById("devices_chart").setAttribute("data-max", devices_count);

        }
        else if (key == "Running") {
          document.getElementById("active_devices").innerText = 'Devices Active : ' + m[key];
          //document.getElementById("devices_chart").setAttribute("value",m[key]);
          active_devices_count = parseInt(m[key]);
        }
        else if (key == "Not running")
          document.getElementById("inactive_devices").innerText = 'Devices Inactive : ' + m[key];
        else if (key == "pub_count") {
          document.getElementById("published_topics").innerText = 'Topics Published : ' + m[key];
          published_topics_count = parseInt(m[key]);
          total_topics_count = total_topics_count + published_topics_count;

        }
        else if (key == "sub_count") {
          document.getElementById("subscribed_topics").innerText = 'Topics Subscribed : ' + m[key];
          subscribed_topics_count = parseInt(m[key]);
          total_topics_count = total_topics_count + subscribed_topics_count;
        }
      }
      document.getElementById("topics_chart").setAttribute("data-max", total_topics_count);
      //document.getElementById("topics_chart").setAttribute("value",published_topics_count);

      //  $(".knob").knob();
      $('#topics_chart').trigger('configure', {
        'max': total_topics_count
      });

      //$("#topics_chart").knob({ min: 0,max: total_topics_count});
      $("#topics_chart").val(published_topics_count).trigger("change");
      //$(".knob").trigger("change");
      $('#devices_chart').trigger('configure', {
        'max': devices_count
      });



      $("#devices_chart").val(active_devices_count).trigger("change");
      //$(".knob").knob();
      if (active_devices_count == 0) {
        $('.device-start').removeAttr('data-original-title').blur();
        $('.device-start').attr('data-original-title', 'Start Network');
        document.getElementById("startnetwork").checked = false;
        document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
      }
      else {
        $('.device-start').removeAttr('data-original-title').blur();
        $('.device-start').attr('data-original-title', 'Stop Network');
        document.getElementById("startnetwork").checked = true;
        document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
      }

    }
  });
}
function randomize() {
  var brokerfound;
  $.ajax({
    url: '/randomize?curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
      if ((msg == "-6") || (msg.indexOf("exception: access violation reading") > -1)) {
        swal("", "Broker is not running. Start broker to connect the devices");
        document.getElementById("startnetwork").checked = start_network;
        if (start_network == false)
          document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
        else
          document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
        brokerfound = 0;
        $('.device-start').attr('data-original-title', 'Start Network');
        document.getElementById("randomize_btn").disabled = false;
      }
      else if (msg == "-5") {
        swal("", "Licensed Client Count Exceeded");
        licence_exceed = 1;
        licensed_count_exceed = false;
        document.getElementById("randomize_btn").disabled = true;
      }
      else if (msg == "False") {
        swal("", "Check credential details");
        brokerfound = 0;
        document.getElementById("randomize_btn").disabled = true;
      }

    },
    error: function (mm) {
    }

  });
  var client_status = [];
  if (network_chosen != 'bevy_sim_template') {
    $.ajax({
      url: '/get_all_clients_status?network=' + network_chosen + '&curr_time=' + new Date().getTime(),
      dataType: 'text',
      type: "GET",
      async: false,
      success: function (msg) {
        if (msg == "notavailable") {
          return;
        }
        var m = JSON.parse(msg);
        for (var key in m) {
          client_status[key] = m[key];
          if (document.getElementById("status" + key)) {
            if (m[key] == "connected") {
              document.getElementById("status" + key).setAttribute("class", 'fa fa-circle pull-right start');
              document.getElementById("status" + key).setAttribute("onclick", 'stopdevice(this.id)');
            }
            else {
              document.getElementById("status" + key).setAttribute("class", 'fa fa-circle pull-right stop');
              document.getElementById("status" + key).setAttribute("onclick", 'startdevice(this.id)');
            }
          }
        }
      }
    });
  }
  var devices_count = 0;

  $.ajax({
    url: '/getNetworkStatus?curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",

    async: false,
    success: function (msg) {
      m = JSON.parse(msg);
      var total_topics_count = 0;
      var published_topics_count = 0;
      var subscribed_topics_count = 0;
      for (var key in m) {
        if (key == "Total") {
          document.getElementById("total_devices").innerText = 'Total Devices : ' + m[key];
          devices_count = parseInt(m[key]);
          document.getElementById("devices_chart").setAttribute("data-max", devices_count);

        }
        else if (key == "Running") {
          document.getElementById("active_devices").innerText = 'Devices Active : ' + m[key];
          //document.getElementById("devices_chart").setAttribute("value",m[key]);
          active_devices_count = parseInt(m[key]);
        }
        else if (key == "Not running")
          document.getElementById("inactive_devices").innerText = 'Devices Inactive : ' + m[key];
        else if (key == "pub_count") {
          document.getElementById("published_topics").innerText = 'Topics Published : ' + m[key];
          published_topics_count = parseInt(m[key]);
          total_topics_count = total_topics_count + published_topics_count;

        }
        else if (key == "sub_count") {
          document.getElementById("subscribed_topics").innerText = 'Topics Subscribed : ' + m[key];
          subscribed_topics_count = parseInt(m[key]);
          total_topics_count = total_topics_count + subscribed_topics_count;
        }
      }
      document.getElementById("topics_chart").setAttribute("data-max", total_topics_count);
      //document.getElementById("topics_chart").setAttribute("value",published_topics_count);

      //  $(".knob").knob();
      $('#topics_chart').trigger('configure', {
        'max': total_topics_count
      });

      //$("#topics_chart").knob({ min: 0,max: total_topics_count});
      $("#topics_chart").val(published_topics_count).trigger("change");
      //$(".knob").trigger("change");
      $('#devices_chart').trigger('configure', {
        'max': devices_count
      });



      $("#devices_chart").val(active_devices_count).trigger("change");
      //$(".knob").knob();
      if (active_devices_count == 0) {
        $('.device-start').removeAttr('data-original-title').blur();
        $('.device-start').attr('data-original-title', 'Start Network');
        document.getElementById("startnetwork").checked = false;
        document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right start-network");
        document.getElementById("randomize_btn").disabled = false;
      }
      else {
        $('.device-start').removeAttr('data-original-title').blur();
        $('.device-start').attr('data-original-title', 'Stop Network');
        document.getElementById("startnetwork").checked = true;
        document.getElementById("network_icon").setAttribute("class", "fa fa-circle pull-right stop-network");
        document.getElementById("randomize_btn").disabled = true;
      }

    }
  });
}
function show_searched_device() {
  var search_txt;
  if (network_chosen == 'bevy_sim_template')
    search_txt = document.getElementById("d_name_txt").value = document.getElementById("template_search").value;
  else
    search_txt = document.getElementById("d_name_txt").value = document.getElementById("device_search").value;
  var client_available = false;
  var name_available = false;
  var desc_available = false;
  var client_status = [];
  var client_id = document.getElementById("d_name_txt").value;
  $.ajax({
    url: '/get_all_clients_status?network=' + network_chosen + '&curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
      var m = JSON.parse(msg);
      for (var key in m) {
        client_status[key] = m[key];
      }
    }
  });

  $.ajax({
    url: '/searchdevice?search_txt=' + search_txt + '&curr_time=' + new Date().getTime(),
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      if (msg == "0")
        ;
      else {
        m = JSON.parse(msg);
        if (network_chosen == 'bevy_sim_template')
          x = document.getElementById("template_device");
        else
          x = document.getElementById("device");
        x.innerHTML = "";
        var cnt = 1;
        var first = "";
        for (var key in m) {
          if (cnt == 1) {
            if (network_chosen == 'bevy_sim_template')
              x.innerHTML = x.innerHTML + "<li class='treeview active devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span></a></li>";
            else {
              var device_log = document.getElementById("device_log");
              if (document.getElementById("dashboard").style.display == "none") {
                if (client_status[key] == "connected")
                  x.innerHTML = x.innerHTML + "<li class='treeview active devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right start' onclick=stopdevice(this.id) style=cursor:pointer></i></a></li>";
                else
                  x.innerHTML = x.innerHTML + "<li class='treeview active devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>";
              }
              else {
                if (client_status[key] == "connected")
                  x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right start' onclick=stopdevice(this.id) style=cursor:pointer></i></a></li>";
                else
                  x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span><i  id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>";
              }
              if (document.getElementById("publish_log_" + key))
                ;
              else
                device_log.innerHTML = "<div class=publish_log id='publish_log_" + key + "' name='publish_log_" + key + "' style=display:none></div>" + device_log.innerHTML;
              //device_log.innerHTML=device_log.innerHTML+"<div class=subscribe_log id='subscribe_log_"+key+"' name='subscribe_log_"+key+"' style=display:none></div>"
            }
            first = key;
          }
          else {
            if (network_chosen == 'bevy_sim_template')
              x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span></a></li>";
            else {
              if (client_status[key] == "connected")
                x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span><i id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right start' onclick=stopdevice(this.id) style=cursor:pointer></i></a></li>";
              else
                x.innerHTML = x.innerHTML + "<li class='treeview devlist' id='delist" + key + "' name='delist" + key + "' onclick=devclick(this.id)><a class=detaill id='device" + key + "' name='device" + key + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + key + "' name='device" + key + "' style=cursor:pointer onclick=devclick(this.id)>" + m[key] + "</span><i id='status" + key + "' name='status" + key + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>";
              if (document.getElementById("publish_log_" + key))
                ;
              else

                device_log.innerHTML = "<div class=publish_log id='publish_log_" + key + "' name='publish_log_" + key + "' style=display:none></div>" + device_log.innerHTML;
              // device_log.innerHTML=device_log.innerHTML+"<div class=subscribe_log id='subscribe_log_"+key+"' name='subscribe_log_"+key+"' style=display:none></div>"
            }
          }
          cnt = cnt + 1;
        }
        //disp_detail(first);
      }

    },
    error: function (data) {
    }
  });
}
$("#device-save").click(function (event) {
  if ((document.getElementById("device-id").value.trim() == "") || (document.getElementById("device-name-txt").value.trim() == "")) {
    swal("", "Device ID/Name cannot be empty");
    return;
  }
  document.getElementById("d_name_txt").value = document.getElementById("device-id").value;
  document.getElementById("d_desc_txt").value = document.getElementById("device-name-txt").value;
  if (document.getElementById("device-desc").value.trim() == "")
    document.getElementById("device-desc").value = "IoT-Simulator Device";
  document.getElementById("d_desc_msg_txt").value = document.getElementById("device-desc").value;
  //document.getElementById("username_txt").value=document.getElementById("device-username").value;
  //document.getElementById("password_txt").value=document.getElementById("device-password").value;

  var client_available = false;
  var name_available = false;
  var desc_available = false;
  var client_id = document.getElementById("d_name_txt").value;
  var client_name = document.getElementById("d_desc_txt").value;
  var client_description = document.getElementById("device-desc").value;
  $.ajax({
    url: '/adddevice?device_id=' + client_id + '&device_name=' + client_name + '&device_description=' + client_description + '&curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
      if ((msg == 0) || (msg == -1)) {
        client_available = true;
        if (msg == -1)
          name_available = true;
      }
      document.getElementById("auth").disabled = false;
    },
    error: function (data) {
    }
  });

  if (client_available == true) {
    document.getElementById("auth").disabled = true;
    if (name_available == true) {

      swal("", "Device Name/ID already exist. Use different Name/ID");
    }
    else {
      swal("", "Device Name/ID already exist. Use different Name/ID");
    }
  }
  else {
    var x = document.getElementById("device");
    if (network_chosen == 'bevy_sim_template') {
      x = document.getElementById("template_device");
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-enabled");
    }

    var xdetail = document.getElementsByClassName("devlist");
    var xd;
    for (xd = 0; xd < xdetail.length; xd++)
      xdetail[xd].className = "treeview devlist";

    //document.getElementById(dev_id).setAttribute("class","treeview active devlist");


    //device_log.innerHTML=device_log.innerHTML+"<div class=subscribe_log id='subscribe_log_"+client_id+"' name='subscribe_log_"+client_id+"' style=display:none></div>"    
    if (template_chosen == false) {
      var device_log = document.getElementById("device_log");
      //WebSocketTest(client_id,client_name,network_chosen);
      device_log.innerHTML = "<div class=publish_log id='publish_log_" + client_id + "' name='publish_log_" + client_id + "' style=display:none></div>" + device_log.innerHTML;
      x.innerHTML = "<li class='treeview active devlist' id='delist" + client_id + "' name='delist" + client_id + "' onclick=devclick(this.id)><a class=detaill id='device" + client_id + "' name='device" + client_id + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + client_id + "' name='device" + client_id + "' style=cursor:pointer>" + client_name + "</span> <i  id='status" + client_id + "' name='status" + client_id + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>" + x.innerHTML;
    }
    else
      x.innerHTML = "<li class='treeview active devlist' id='delist" + client_id + "' name='delist" + client_id + "' onclick=devclick(this.id)><a class=detaill id='device" + client_id + "' name='device" + client_id + "'><i class='fa fa-dashboard'></i> <span  class='detaill dname' id='device" + client_id + "' name='device" + client_id + "' style=cursor:pointer>" + client_name + "</span></a></li>" + x.innerHTML;
    document.getElementById("search_lens").style.pointerEvents = "auto";
    if (network_chosen != 'bevy_sim_template')
      show_devices();
    else {
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-enabled");
      show_templates();
      document.getElementById("new_template_menu").setAttribute("class", "menu events events-enabled");
    }
    disp_detail(client_id);

  }

});
function template_save() {
  if ((document.getElementById("template-id").value.trim() == "") || (document.getElementById("template-name-txt").value.trim() == "")) {
    swal("", "Template ID/Name cannot be empty");
    return;
  }

  document.getElementById("d_name_txt").value = document.getElementById("template-id").value;
  document.getElementById("d_desc_txt").value = document.getElementById("template-name-txt").value;
  if (document.getElementById("template-desc").value.trim() == "")
    document.getElementById("template-desc").value = "IoT-Simulator Template";

  document.getElementById("d_desc_msg_txt").value = document.getElementById("template-desc").value;
  var client_available = false;
  var name_available = false;
  var desc_available = false;
  var client_id = document.getElementById("d_name_txt").value;
  var client_name = document.getElementById("d_desc_txt").value;
  var client_description = document.getElementById("d_desc_msg_txt").value;
  $.ajax({
    url: '/adddevice?device_id=' + client_id + '&device_name=' + client_name + '&device_description=' + client_description + '&curr_time=' + new Date().getTime(),
    dataType: 'text',
    type: "GET",
    async: false,
    success: function (msg) {
      if ((msg == 0) || (msg == -1)) {
        client_available = true;
        if (msg == -1)
          name_available = true;
      }
    },
    error: function (data) {
    }
  });

  if (client_available == true) {
    if (name_available == true) {
      swal("", "Template Name/ID already exist. Use different Name/ID.");
    }
    else {
      swal("", "Template Name/ID already exist. Use different Name/ID.");
    }
  }
  else {
    var x = document.getElementById("device");
    if (network_chosen == 'bevy_sim_template') {
      x = document.getElementById("template_device");
      document.getElementById("template_menu").style.display = "block";

    }

    var xdetail = document.getElementsByClassName("devlist");
    var xd;
    for (xd = 0; xd < xdetail.length; xd++)
      xdetail[xd].className = "treeview devlist";

    if (template_chosen == false) {
      var device_log = document.getElementById("device_log");
      //WebSocketTest(client_id,client_name,network_chosen);
      device_log.innerHTML = "<div class=publish_log id='publish_log_" + client_id + "' name='publish_log_" + client_id + "' style=display:none></div>" + device_log.innerHTML;
      x.innerHTML = "<li class='treeview active devlist' id='delist" + client_id + "' name='delist" + client_id + "' onclick=devclick(this.id)><a class=detaill id='device" + client_id + "' name='device" + client_id + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class=detaill id='device" + client_id + "' name='device" + client_id + "' style=cursor:pointer onclick=devclick(this.id)>" + client_name + "</span> <i  id='status" + client_id + "' name='status" + client_id + "' class='fa fa-circle pull-right stop' onclick=startdevice(this.id) style=cursor:pointer></i></a></li>" + x.innerHTML;
    }
    else
      x.innerHTML = "<li class='treeview active devlist' id='delist" + client_id + "' name='delist" + client_id + "' onclick=devclick(this.id)><a class=detaill id='device" + client_id + "' name='device" + client_id + "' onclick=devclick(this.id)><i class='fa fa-dashboard'></i> <span  class=detaill id='device" + client_id + "' name='device" + client_id + "' style=cursor:pointer onclick=devclick(this.id)>" + client_name + "</span></a></li>" + x.innerHTML;
    document.getElementById("template_search_lens").style.pointerEvents = "auto";
    document.getElementById("new_template_menu").setAttribute("class", "menu events events-enabled");
    disp_detail(client_id);

  }

}
function fnedit(id2) {
  // $("#on-connect-event").modal('show');

  var btnid = id2;
  var ind1 = btnid.indexOf('edit');
  var rownum = btnid.slice(3, ind1);
  var d_id = btnid.slice(ind1 + 4);
  pubflag = btnid.indexOf('pub');
  editflag = btnid.indexOf('sub');
  resflag = btnid.indexOf('res');
  if (pubflag != -1)
    s = "pub";
  else if (editflag != -1)
    s = "sub";
  else
    s = "res";
  document.getElementById("paid_txt").value = rownum;
  if (s == "sub") {
    var subscribe_on = document.getElementById(s + "r" + rownum + "c2").value;
    if (subscribe_on == "On Start") {
      //document.getElementById("subscribe_on").setAttribute("class","modal-input");
      document.getElementById("subscribe_on").value = "on-start";
      document.getElementById("subscribe_timepicker_div").style.display = "none";
      //document.getElementById("subscribe_timepicker").setAttribute("class","modal-input timepicker hidden");
    }
    else {
      //document.getElementById("subscribe_on").setAttribute("class","form-control");
      document.getElementById("subscribe_on").value = "specific-time";
      //document.getElementById("subscribe_qos").setAttribute("class","modal-input");
      //document.getElementById("subscribe_timepicker").style.display="block";
      document.getElementById("subscribe_timepicker_div").style.display = "block";
      document.getElementById("subscribe_timepicker").value = subscribe_on;
    }
    document.getElementById("subscribe_topic").value = document.getElementById(s + "r" + rownum + "c0").value;
    document.getElementById("subscribe_qos").value = parseInt(document.getElementById(s + "r" + rownum + "c1").value.substr(0, 1));
    //document.getElementById(s+"r"+rownum+"c4").value;
    document.getElementById("add_subscribe").value = "edit_subscribe";
    document.getElementById("subscribeModalLabel").innerText = "Subscribe for command -  " + document.getElementById("d_name").value;
    if (network_chosen == 'bevy_sim_template')
      document.getElementById("subscribe_topic_help").style.display = "block";
    else
      document.getElementById("subscribe_topic_help").style.display = "none";

    $("#subscribe-command").modal('show');
  }
  else if (s == "res") {
    document.getElementById("request_topic").value = document.getElementById(s + "r" + rownum + "c0").value;
    document.getElementById("request_message").value = document.getElementById(s + "r" + rownum + "c1").value;
    document.getElementById("rest_txt").value = document.getElementById(s + "r" + rownum + "c2").value;
    document.getElementById("resm_txt").value = document.getElementById(s + "r" + rownum + "c3").value;
    document.getElementById("behavior_qos").value = document.getElementById(s + "r" + rownum + "c4").value.substr(0, 1);
    document.getElementById("behavior_rtn").value = document.getElementById(s + "r" + rownum + "c5").value.substr(0, 1);
    document.getElementById("behaviorModalLabel").innerText = "Edit Behavior -  " + document.getElementById("d_name").value; document.getElementById("add_behavior").value = "edit_behavior";
    if (network_chosen == 'bevy_sim_template')
      document.getElementById("behaviour_topic_help").style.display = "block";
    else
      document.getElementById("behaviour_topic_help").style.display = "none";

    $("#behaviour-command").modal('show');
    //document.getElementById("behaviorModalLabel").innerText="Add New Behavior"; 
  }
  else {
    var publish_on = document.getElementById(s + "r" + rownum + "c8").value;
    if (publish_on == 0) {
      document.getElementById("conn_topic").value = document.getElementById("topic" + rownum + "c0").innerText;
      document.getElementById("con_pqos_txt").value = document.getElementById(s + "r" + rownum + "c2").value.substr(0, 1);
      document.getElementById("con_prtn_txt").value = document.getElementById(s + "r" + rownum + "c3").value.substr(0, 1);
      var message_type = document.getElementById(s + "r" + rownum + "c7").value;
      if ((message_type == 5) || (message_type == 6)) {
        document.getElementById("message-json").checked = true;
        document.getElementById("connect-json-field").style.display = "block";
        document.getElementById("connect-text-field").style.display = "none";
        document.getElementById("json_txt").value = document.getElementById(s + "r" + rownum + "c1").value;
        document.getElementById("json_txt").value = document.getElementById("json_txt").value + " ";
        var e = $.Event("keypress", { which: 13, keyCode: 13 });
        $('#json_txt').trigger(e);
        $("#json_txt").val($("#json_txt").val() + String.fromCharCode(e.which));
        //$("#json_txt").val(document.getElementById(s+"r"+rownum+"c1").value).trigger("keypress");
        //document.getElementById("json_txt").disabled=true;

      }
      else {
        document.getElementById("message-text").checked = true;
        document.getElementById("connect-json-field").style.display = "none";
        document.getElementById("connect-text-field").style.display = "block";

        if (message_type == 1) {
          document.getElementById("value_type").value = "constant";
          document.getElementById("conn_constant_div").style.display = "block";
          document.getElementById("conn_system_variable_div").style.display = "none";
          document.getElementById("conn_random_div").style.display = "none";
          document.getElementById("conn_range_div").style.display = "none";
          document.getElementById("constant").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if ((message_type == 21) || (message_type == 22) || (message_type == 23)) {
          document.getElementById("value_type").value = "system-variable";
          document.getElementById("conn_constant_div").style.display = "none";
          document.getElementById("conn_system_variable_div").style.display = "block";
          document.getElementById("conn_random_div").style.display = "none";
          document.getElementById("conn_range_div").style.display = "none";
          document.getElementById("system-variable").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 3) {
          document.getElementById("value_type").value = "random";
          document.getElementById("conn_constant_div").style.display = "none";
          document.getElementById("conn_system_variable_div").style.display = "none";
          document.getElementById("conn_random_div").style.display = "block";
          document.getElementById("conn_range_div").style.display = "none";
          document.getElementById("random").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 4) {
          document.getElementById("value_type").value = "range";
          document.getElementById("conn_constant_div").style.display = "none";
          document.getElementById("conn_system_variable_div").style.display = "none";
          document.getElementById("conn_random_div").style.display = "none";
          document.getElementById("conn_range_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("range_start_value").value = values[0];
          document.getElementById("range_end_value").value = values[1];
        }
      }
      document.getElementById("add_connect").value = "edit_connect";
      document.getElementById("connectModalLabel").innerText = "Event on connect " + document.getElementById("d_name").value;
      if (network_chosen == 'bevy_sim_template')
        document.getElementById("topic_help").style.display = "block";
      else
        document.getElementById("topic_help").style.display = "none";


      $("#on-connect-event").modal('show');
    }
    else if (publish_on == 1) {
      document.getElementById("instant_topic").value = document.getElementById("topic" + rownum + "c0").innerText;
      document.getElementById("instant_pqos_txt").value = document.getElementById(s + "r" + rownum + "c2").value.substr(0, 1);
      document.getElementById("instant_prtn_txt").value = document.getElementById(s + "r" + rownum + "c3").value.substr(0, 1);
      var message_type = document.getElementById(s + "r" + rownum + "c7").value;
      if ((message_type == 5) || (message_type == 6)) {
        document.getElementById("instant-json").checked = true;
        document.getElementById("instant-json-field").style.display = "block";
        document.getElementById("instant-text-field").style.display = "none";
        document.getElementById("instant_json_txt").value = document.getElementById(s + "r" + rownum + "c1").value;
        $("#instant_json_txt").val(document.getElementById(s + "r" + rownum + "c1").value).trigger("keypress");
      }
      else {
        document.getElementById("instant-text").checked = true;
        document.getElementById("instant-json-field").style.display = "none";
        document.getElementById("instant-text-field").style.display = "block";

        if (message_type == 1) {
          document.getElementById("instant_value_type").value = "instant_constant";
          document.getElementById("instant_constant_div").style.display = "block";
          document.getElementById("instant_system_variable_div").style.display = "none";
          document.getElementById("instant_random_div").style.display = "none";
          document.getElementById("instant_range_div").style.display = "none";
          document.getElementById("instant_constant").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if ((message_type == 21) || (message_type == 22) || (message_type == 23)) {
          document.getElementById("instant_value_type").value = "instant_system_variable";
          document.getElementById("instant_constant_div").style.display = "none";
          document.getElementById("instant_system_variable_div").style.display = "block";
          document.getElementById("instant_random_div").style.display = "none";
          document.getElementById("instant_range_div").style.display = "none";
          document.getElementById("instant_system_variable").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 3) {
          document.getElementById("instant_value_type").value = "instant_random";
          document.getElementById("instant_constant_div").style.display = "none";
          document.getElementById("instant_system_variable_div").style.display = "none";
          document.getElementById("instant_random_div").style.display = "block";
          document.getElementById("instant_range_div").style.display = "none";
          document.getElementById("instant_random").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 4) {
          document.getElementById("instant_value_type").value = "instant_range";
          document.getElementById("instant_constant_div").style.display = "none";
          document.getElementById("instant_system_variable_div").style.display = "none";
          document.getElementById("instant_random_div").style.display = "none";
          document.getElementById("instant_range_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("instant_range_start_value").value = values[0];
          document.getElementById("instant_range_end_value").value = values[1];
        }
      }
      document.getElementById("add_instant").value = "edit_instant";
      document.getElementById("instantModalLabel").innerText = "Instant Event -  " + document.getElementById("d_name").value;
      if (network_chosen == 'bevy_sim_template')
        document.getElementById("instant_topic_help").style.display = "block";
      else
        document.getElementById("instant_topic_help").style.display = "none";

      $("#instant-event").modal('show');
    }
    else if (publish_on == 2) {
      document.getElementById("specific_duration_topic").value = document.getElementById("topic" + rownum + "c0").innerText;
      document.getElementById("specific_duration_pqos_txt").value = document.getElementById(s + "r" + rownum + "c2").value.substr(0, 1);
      document.getElementById("specific_duration_prtn_txt").value = document.getElementById(s + "r" + rownum + "c3").value.substr(0, 1);
      document.getElementById("specific_duration_interval").value = document.getElementById(s + "r" + rownum + "c9").value;
      var start_hr = document.getElementById(s + "r" + rownum + "c10").value;
      var start_min = document.getElementById(s + "r" + rownum + "c11").value;
      var start_time;
      var end_hr = document.getElementById(s + "r" + rownum + "c12").value;
      var end_min = document.getElementById(s + "r" + rownum + "c13").value;
      var end_time;
      if (parseInt(start_hr) > 12) {
        start_hr = parseInt(start_hr) - 12;
        start_time = start_hr + ":" + start_min + " PM";
      }
      else if (parseInt(start_hr) == 12) {
        start_time = start_hr + ":" + start_min + " PM";
      }
      else if (parseInt(start_hr) == 0)
        start_time = "12:" + start_min + " AM";

      else
        start_time = start_hr + ":" + start_min + " AM";
      if (parseInt(end_hr) > 12) {
        end_hr = parseInt(end_hr) - 12;
        end_time = end_hr + ":" + end_min + " PM";
      }
      else if (parseInt(end_hr) == 12) {
        end_time = end_hr + ":" + end_min + " PM";
      }
      else if (parseInt(end_hr) == 0)
        end_time = "12:" + end_min + " AM";

      else
        end_time = end_hr + ":" + end_min + " AM";
      document.getElementById("specific_duration_start_time").value = start_time;
      document.getElementById("specific_duration_end_time").value = end_time;
      var message_type = document.getElementById(s + "r" + rownum + "c7").value;
      if ((message_type == 5) || (message_type == 6)) {
        document.getElementById("duration-json").checked = true;
        document.getElementById("specific-duration-json-field").style.display = "block";
        document.getElementById("specific-duration-text-field").style.display = "none";
        document.getElementById("specific_duration_json_txt").value = document.getElementById(s + "r" + rownum + "c1").value;
        $("#specific_duration_json_txt").val(document.getElementById(s + "r" + rownum + "c1").value).trigger("keypress");
      }
      else {
        document.getElementById("duration-text").checked = true;
        document.getElementById("specific-duration-json-field").style.display = "none";
        document.getElementById("specific-duration-text-field").style.display = "block";

        if (message_type == 1) {
          document.getElementById("specific_duration_value_type").value = "specific_duration_constant";
          document.getElementById("specific_duration_constant_div").style.display = "block";
          document.getElementById("specific_duration_system_variable_div").style.display = "none";
          document.getElementById("specific_duration_random_div").style.display = "none";
          document.getElementById("specific_duration_range_div").style.display = "none";
          document.getElementById("specific_duration_linear_div").style.display = "none";
          document.getElementById("specific_duration_constant").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if ((message_type == 21) || (message_type == 22) || (message_type == 23)) {
          document.getElementById("specific_duration_value_type").value = "specific_duration_system_variable";
          document.getElementById("specific_duration_constant_div").style.display = "none";
          document.getElementById("specific_duration_system_variable_div").style.display = "block";
          document.getElementById("specific_duration_random_div").style.display = "none";
          document.getElementById("specific_duration_range_div").style.display = "none";
          document.getElementById("specific_duration_linear_div").style.display = "none";
          document.getElementById("specific_duration_system_variable").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 3) {
          document.getElementById("specific_duration_value_type").value = "specific_duration_random";
          document.getElementById("specific_duration_constant_div").style.display = "none";
          document.getElementById("specific_duration_system_variable_div").style.display = "none";
          document.getElementById("specific_duration_random_div").style.display = "block";
          document.getElementById("specific_duration_range_div").style.display = "none";
          document.getElementById("specific_duration_linear_div").style.display = "none";
          document.getElementById("specific_duration_random").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 4) {
          document.getElementById("specific_duration_value_type").value = "specific_duration_range";
          document.getElementById("specific_duration_constant_div").style.display = "none";
          document.getElementById("specific_duration_system_variable_div").style.display = "none";
          document.getElementById("specific_duration_random_div").style.display = "none";
          document.getElementById("specific_duration_linear_div").style.display = "none";
          document.getElementById("specific_duration_range_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("specific_duration_range_start_value").value = values[0];
          document.getElementById("specific_duration_range_end_value").value = values[1];
        }
        else if ((message_type == 71) || (message_type == 72)) {
          document.getElementById("specific_duration_value_type").value = "specific_duration_linear";
          document.getElementById("specific_duration_constant_div").style.display = "none";
          document.getElementById("specific_duration_system_variable_div").style.display = "none";
          document.getElementById("specific_duration_random_div").style.display = "none";
          document.getElementById("specific_duration_range_div").style.display = "none";
          document.getElementById("specific_duration_linear_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("specific_duration_linear_start_value").value = values[0];
          document.getElementById("specific_duration_linear_end_value").value = values[1];
        }

      }
      document.getElementById("add_specific_duration").value = "edit_specific_duration";
      document.getElementById("specific_durationModalLabel").innerText = "Event for Specific Duration -  " + document.getElementById("d_name").value;
      if (network_chosen == 'bevy_sim_template')
        document.getElementById("duration_topic_help").style.display = "block";
      else
        document.getElementById("duration_topic_help").style.display = "none";

      $("#specified-duration-event").modal('show');
    }
    else if (publish_on == 3) {
      document.getElementById("specific_time_topic").value = document.getElementById("topic" + rownum + "c0").innerText;
      document.getElementById("spt_pqos_txt").value = document.getElementById(s + "r" + rownum + "c2").value.substr(0, 1);
      document.getElementById("spt_prtn_txt").value = document.getElementById(s + "r" + rownum + "c3").value.substr(0, 1);
      var hr = document.getElementById(s + "r" + rownum + "c4").value;
      var min = document.getElementById(s + "r" + rownum + "c5").value;
      var sec = document.getElementById(s + "r" + rownum + "c6").value;
      var specific_time;
      if (parseInt(hr) > 12) {
        hr = parseInt(hr) - 12;
        specific_time = hr + ":" + min + " PM";
      }
      else if (parseInt(hr) == 12)
        specific_time = hr + ":" + min + " PM";
      else if (parseInt(hr) == 0)
        specific_time = "12:" + min + " AM";
      else
        specific_time = hr + ":" + min + " AM";
      document.getElementById("specifictimepicker").value = specific_time;
      var message_type = document.getElementById(s + "r" + rownum + "c7").value;
      if ((message_type == 5) || (message_type == 6)) {
        document.getElementById("interval-json").checked = true;
        document.getElementById("specific-time-json-field").style.display = "block";
        document.getElementById("specific-time-text-field").style.display = "none";
        document.getElementById("specific_time_json_txt").value = document.getElementById(s + "r" + rownum + "c1").value;
        $("#specific_time_json_txt").val(document.getElementById(s + "r" + rownum + "c1").value).trigger("keypress");
      }
      else {
        document.getElementById("interval-text").checked = true;
        document.getElementById("specific-time-json-field").style.display = "none";
        document.getElementById("specific-time-text-field").style.display = "block";

        if (message_type == 1) {
          document.getElementById("specific_time_value_type").value = "specific_time_constant";
          document.getElementById("specific_time_constant_div").style.display = "block";
          document.getElementById("specific_time_system_variable_div").style.display = "none";
          document.getElementById("specific_time_random_div").style.display = "none";
          document.getElementById("specific_time_range_div").style.display = "none";
          document.getElementById("specific_time_constant").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if ((message_type == 21) || (message_type == 22) || (message_type == 23)) {
          document.getElementById("specific_time_value_type").value = "specific_time_system_variable";
          document.getElementById("specific_time_constant_div").style.display = "none";
          document.getElementById("specific_time_system_variable_div").style.display = "block";
          document.getElementById("specific_time_random_div").style.display = "none";
          document.getElementById("specific_time_range_div").style.display = "none";
          document.getElementById("specific_time_system_variable").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 3) {
          document.getElementById("specific_time_value_type").value = "specific_time_random";
          document.getElementById("specific_time_constant_div").style.display = "none";
          document.getElementById("specific_time_system_variable_div").style.display = "none";
          document.getElementById("specific_time_random_div").style.display = "block";
          document.getElementById("specific_time_range_div").style.display = "none";
          document.getElementById("specific_time_random").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 4) {
          document.getElementById("specific_time_value_type").value = "instant_range";
          document.getElementById("specific_time_constant_div").style.display = "none";
          document.getElementById("specific_time_system_variable_div").style.display = "none";
          document.getElementById("specific_time_random_div").style.display = "none";
          document.getElementById("specific_time_range_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("specific_time_range_start_value").value = values[0];
          document.getElementById("specific_time_range_end_value").value = values[1];
        }
      }
      document.getElementById("add_specific_time").value = "edit_specific_time";
      document.getElementById("specific_timeModalLabel").innerText = "Event for Specific Time -  " + document.getElementById("d_name").value;
      if (network_chosen == 'bevy_sim_template')
        document.getElementById("sp_time_topic_help").style.display = "block";
      else
        document.getElementById("sp_time_topic_help").style.display = "none";

      $("#specific-interval-event").modal('show');
    }
    else if (publish_on == 4) {
      document.getElementById("whole_day_topic").value = document.getElementById("topic" + rownum + "c0").innerText;
      document.getElementById("whole_day_pqos_txt").value = document.getElementById(s + "r" + rownum + "c2").value.substr(0, 1);
      document.getElementById("whole_day_prtn_txt").value = document.getElementById(s + "r" + rownum + "c3").value.substr(0, 1);
      document.getElementById("whole_day_interval").value = document.getElementById(s + "r" + rownum + "c9").value;
      var message_type = document.getElementById(s + "r" + rownum + "c7").value;
      if ((message_type == 5) || (message_type == 6)) {
        document.getElementById("wholeday-json").checked = true;
        document.getElementById("wholeday-json-field").style.display = "block";
        document.getElementById("wholeday-text-field").style.display = "none";
        document.getElementById("whole_day_json_txt").value = document.getElementById(s + "r" + rownum + "c1").value;
        $("#whole_day_json_txt").val(document.getElementById(s + "r" + rownum + "c1").value).trigger("keypress");
      }
      else {
        document.getElementById("wholeday-text").checked = true;
        document.getElementById("wholeday-json-field").style.display = "none";
        document.getElementById("wholeday-text-field").style.display = "block";

        if (message_type == 1) {
          document.getElementById("whole_day_value_type").value = "whole_day_constant";
          document.getElementById("whole_day_constant_div").style.display = "block";
          document.getElementById("whole_day_system_variable_div").style.display = "none";
          document.getElementById("whole_day_random_div").style.display = "none";
          document.getElementById("whole_day_range_div").style.display = "none";
          document.getElementById("whole_day_constant").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if ((message_type == 21) || (message_type == 22) || (message_type == 23)) {
          document.getElementById("whole_day_value_type").value = "whole_day_system_variable";
          document.getElementById("whole_day_constant_div").style.display = "none";
          document.getElementById("whole_day_system_variable_div").style.display = "block";
          document.getElementById("whole_day_random_div").style.display = "none";
          document.getElementById("whole_day_range_div").style.display = "none";
          document.getElementById("whole_day_system_variable").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 3) {
          document.getElementById("whole_day_value_type").value = "whole_day_random";
          document.getElementById("whole_day_constant_div").style.display = "none";
          document.getElementById("whole_day_system_variable_div").style.display = "none";
          document.getElementById("whole_day_random_div").style.display = "block";
          document.getElementById("whole_day_range_div").style.display = "none";
          document.getElementById("whole_day_random").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 4) {
          document.getElementById("whole_day_value_type").value = "instant_range";
          document.getElementById("whole_day_constant_div").style.display = "none";
          document.getElementById("whole_day_system_variable_div").style.display = "none";
          document.getElementById("whole_day_random_div").style.display = "none";
          document.getElementById("whole_day_range_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("whole_day_range_start_value").value = values[0];
          document.getElementById("whole_day_range_end_value").value = values[1];
        }
      }
      document.getElementById("add_whole_day").value = "edit_whole_day";
      document.getElementById("whole_dayModalLabel").innerText = "Event for Whole day -  " + document.getElementById("d_name").value;
      if (network_chosen == 'bevy_sim_template')
        document.getElementById("wholeday_topic_help").style.display = "block";
      else
        document.getElementById("wholeday_topic_help").style.display = "none";

      $("#wholeday-event").modal('show');
    }
    else if (publish_on == 5) {
      document.getElementById("disconn_topic").value = document.getElementById("topic" + rownum + "c0").innerText;
      document.getElementById("dis_pqos_txt").value = document.getElementById(s + "r" + rownum + "c2").value.substr(0, 1);
      document.getElementById("dis_prtn_txt").value = document.getElementById(s + "r" + rownum + "c3").value.substr(0, 1);
      var message_type = document.getElementById(s + "r" + rownum + "c7").value;
      if ((message_type == 5) || (message_type == 6)) {
        document.getElementById("disconnect-json").checked = true;
        document.getElementById("disconnect-json-field").style.display = "block";
        document.getElementById("disconnect-text-field").style.display = "none";
        document.getElementById("dis_json_txt").value = document.getElementById(s + "r" + rownum + "c1").value;
        $("#dis_json_txt").val(document.getElementById(s + "r" + rownum + "c1").value).trigger("keypress");
      }
      else {
        document.getElementById("disconnect-text").checked = true;
        document.getElementById("disconnect-json-field").style.display = "none";
        document.getElementById("disconnect-text-field").style.display = "block";

        if (message_type == 1) {
          document.getElementById("dis_value_type").value = "dis_constant";
          document.getElementById("disconn_constant_div").style.display = "block";
          document.getElementById("disconn_system_variable_div").style.display = "none";
          document.getElementById("disconn_random_div").style.display = "none";
          document.getElementById("disconn_range_div").style.display = "none";
          document.getElementById("dis_constant").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if ((message_type == 21) || (message_type == 22) || (message_type == 23)) {
          document.getElementById("dis_value_type").value = "dis-system-variable";
          document.getElementById("disconn_constant_div").style.display = "none";
          document.getElementById("disconn_system_variable_div").style.display = "block";
          document.getElementById("disconn_random_div").style.display = "none";
          document.getElementById("disconn_range_div").style.display = "none";
          document.getElementById("dis-system-variable").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 3) {
          document.getElementById("dis_value_type").value = "dis_random";
          document.getElementById("disconn_constant_div").style.display = "none";
          document.getElementById("disconn_system_variable_div").style.display = "none";
          document.getElementById("disconn_random_div").style.display = "block";
          document.getElementById("disconn_range_div").style.display = "none";
          document.getElementById("dis-random").value = document.getElementById(s + "r" + rownum + "c1").value;
        }
        else if (message_type == 4) {
          document.getElementById("dis_value_type").value = "dis_range";
          document.getElementById("disconn_constant_div").style.display = "none";
          document.getElementById("disconn_system_variable_div").style.display = "none";
          document.getElementById("disconn_random_div").style.display = "none";
          document.getElementById("disconn_range_div").style.display = "block";
          var msg = document.getElementById(s + "r" + rownum + "c1").value;
          var values = msg.split(' - ');
          document.getElementById("dis_range_start_value").value = values[0];
          document.getElementById("dis_range_end_value").value = values[1];
        }
      }
      document.getElementById("add_disconnect").value = "edit_disconnect";
      document.getElementById("disconnectModalLabel").innerText = "Event on Disconnect " + document.getElementById("d_name").value;
      if (network_chosen == 'bevy_sim_template')
        document.getElementById("disconnect_topic_help").style.display = "block";
      else
        document.getElementById("disconnect_topic_help").style.display = "none";

      $("#on-disconnect-event").modal('show');
    }
  }
}
function fndrop(id1) {
  var btnid = id1;
  var ind1 = btnid.indexOf('drop');
  var rownum = btnid.slice(3, ind1);
  var d_id = btnid.slice(ind1 + 4);
  id = d_id;
  var dropflag = btnid.indexOf('pub');
  var dropsub = btnid.indexOf('sub');
  var sdrop;
  var url_check;
  if (dropflag != -1) {
    sdrop = 'pub';
    url_check = '/delete/event?action_id=' + rownum + '&device_id=' + id;
  }
  else if (dropsub != -1) {
    sdrop = 'sub';
    url_check = '/delete/command?action_id=' + rownum + '&device_id=' + id;
  }
  else {
    sdrop = 'res';
    url_check = '/delete/behavior?action_id=' + rownum + '&device_id=' + id;
  }
  document.getElementById("paid_txt").value = rownum;

  $.ajax({


    url: url_check + '&curr_time=' + new Date().getTime(),

    dataType: "text",
    type: "GET",
    async: false,
    success: function () {

    }

  });
  disp_detail(id);
}
function open_modal_network() {
  if ((network_chosen == 'network-deleted') || (network_chosen == 'bevy_sim_template'))
    $("#open-modal").modal('show');
  else {
    var all_disconnected = true;
    $.ajax({


      url: '/client/get_connection_status?curr_time=' + new Date().getTime(),

      type: "GET",
      dataType: "text",
      async: false,

      success: function (msg) {
        if ((msg == "all_disconnected") || (msg == "No device")) {
          all_disconnected = true;
        }
        else
          all_disconnected = false;

      },
      error: function (mm) {
      }

    });
    if (all_disconnected == false) {
      if (network_chosen == 'bevy_sim_template') {
        if (no_of_devices_old > 0) {
          if ((network_chosen != "") && (network_chosen != 'network-deleted'))
            swal("", "Network " + network_chosen + " will be stopped if new network is loaded");
          else if ((old_network_chosen != '') && (old_network_chosen != 'bevy_sim_template') && (old_network_chosen != 'network-deleted'))
            swal("", "Network " + old_network_chosen + " will be stopped if new network is loaded");
        }
      }
      else if (document.getElementsByClassName("detaill dname").length > 0) {
        if ((network_chosen != 'bevy_sim_template') && (network_chosen != "") && (network_chosen != 'network-deleted'))
          swal("", "Network " + network_chosen + " will be stopped if new network is loaded");
        else if ((old_network_chosen != '') && (old_network_chosen != 'bevy_sim_template') && (old_network_chosen != 'network-deleted'))
          swal("", "Network " + old_network_chosen + " will be stopped if new network is loaded");
      }
    }

    $("#open-modal").modal('show');
  }
}


function create_conf() {
  var current_all_disconnected = true;
  if (network_chosen == 'bevy_sim_template') {
    current_all_disconnected = before_template_all_disconnected;
  }
  else if (network_chosen == 'network-deleted')
    current_all_disconnected = true;

  else {
    if (document.getElementById("startnetwork").checked == true)
      current_all_disconnected = false;

  }
  if (current_all_disconnected == false) {
    if ((network_chosen != 'bevy_sim_template') && (network_chosen != "")) {
      if (network_chosen != 'network-deleted') {
        var swal_title, swal_text;
        swal_title = "";
        swal_text = "Network " + network_chosen + " will be stopped. Are you sure to proceed?";
        swal({
          title: swal_title,
          text: swal_text,
          //type: "warning",   
          width: 300,
          height: 300,
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
          closeOnConfirm: true,
          closeOnCancel: true
        },
          function (isConfirm) {
            if (isConfirm) {
              $("#network-modal").modal('show');
            }
          });
      }
      else {
        $("#network-modal").modal('show');
      }

      // swal("Network "+network_chosen+" will be stopped if new network is loaded", {button: "OK",});
    }
    else if ((old_network_chosen != '') && (old_network_chosen != 'bevy_sim_template')) {
      if (old_network_chosen != 'network-deleted') {
        var swal_title, swal_text;
        swal_title = "";
        swal_text = "Network " + old_network_chosen + " will be stopped. Are you sure to proceed?";
        swal({
          title: swal_title,
          text: swal_text,
          //type: "warning",   
          width: 300,
          height: 300,
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
          closeOnConfirm: true,
          closeOnCancel: true
        },
          function (isConfirm) {
            if (isConfirm) {
              $("#network-modal").modal('show');
            }
          });
      }
      else {
        $("#network-modal").modal('show');
        //swal("Network "+old_network_chosen+" will be stopped if new network is loaded", {button: "OK",});
      }
    }
  }
  else
    $("#network-modal").modal('show');

}


$("#network-save").click(function (event) {
  //document.getElementById('envcreate').value=env;
  document.getElementById("new_network_name").value = document.getElementById("network-name").value;
  document.getElementById("new_network_desc").value = document.getElementById("network-desc").value;
  var network = document.getElementById("network-name").value;
  var network_exists = false;
  var env = network.trim();


  if (env.trim() != "") {
    if (env.indexOf('_') == 0)
      swal("", "Network Name should not start with underscore. Can be alphanumeric or combined with underscore");
    else {
      var u_score = /^[_]+$/;
      if (env.match(u_score))
        swal("", "Network Name should not contain only underscore. Can be alphanumeric or combined with underscore");
      else {
        var numbers = /^[0-9]+$/;
        if (env.match(numbers)) {
          swal("", "Network Name should not contain only numbers. Can be alphanumeric or combined with underscore");
        }
        else {

          var date = new Date().getTime();
          var letters = /^[0-9a-zA-Z_]+$/;
          if (env.match(letters)) {
            $.ajax({


              url: '/addnetwork?network_name=' + env + '&network_description=' + document.getElementById("network-desc").value + '&curr_time=' + new Date().getTime(),

              dataType: 'text',
              type: "GET",
              async: false,
              success: function (msg) {
                if (msg == "available") {
                  swal("", "Network Name already used. Use a different name.");

                  network_exists = true;
                }

              },
              error: function (m) {
              }
            });
            if (network_exists == true)
              return;

            if (document.getElementById("open_network_button").disabled == false) {
              $.ajax({


                url: '/stopnetwork?network_chosen=' + network_chosen + '&curr_time=' + new Date().getTime(),

                dataType: 'text',
                type: "GET",
                async: false,
                success: function () {

                }
              });
            }
            document.getElementById("device_sidebar").style.display = "block";
            document.getElementById("template_sidebar").style.display = "none";
            document.getElementById("devices_top_content").style.display = "block";
            document.getElementById("template_top_content").style.display = "none";
            document.getElementById("alltables").style.display = "none";
            document.getElementById("devices_header").style.display = "block";
            document.getElementById("template_header").style.display = "none";
            set_network(env);
            $("#settingsicon").click();
            document.getElementById("settings-brk-address").disabled = false;
            document.getElementById("settings-enable-root").disabled = false;
            device_cert_module(window.mg_application);
          }
          else
            swal("", "Network Name should contain only alphabets, numbers and underscore");
        }
      }
    }
  }
  else
    swal("", "Network Name cannot be empty");
});

function WebSocketTest(network_name) {
  if ("WebSocket" in window) {
    var ws = new WebSocket("ws://" + window.location.hostname + ":12345");
    var client_id;
    var network_id = network_name.substring(5);
    ws.onopen = function () {
      ws.send("simulatorpublish" + network_name);
    };

    ws.onmessage = function (evt) {
      var received_raw_msg = evt.data;
      var received_msg = JSON.parse(received_raw_msg);
      var topic = "";
      var qos = "";
      var qos_find = false;
      var messsage = "";
      var ctime = "";
      var publish_status = "";
      var randomstartstop = false;
      for (var key in received_msg) {
        var rss_clientid;
        if ((key == "Client_ID") || (key == "ON/OFF")) {
          if (key == "Client_ID") {
            rss_clientid = received_msg[key];
          }
          if (key == "ON/OFF") {
            randomstartstop = true;
            status = received_msg[key];
            if (status == "0") {
              if (document.getElementById("status" + rss_clientid)) {
                document.getElementById("status" + rss_clientid).setAttribute("class", "fa fa-circle pull-right stop");
                document.getElementById("status" + rss_clientid).setAttribute("onclick", "startdevice(this.id)");
              }
              update_inactive_count();
            }
            else {
              if (document.getElementById("status" + rss_clientid)) {
                document.getElementById("status" + rss_clientid).setAttribute("class", "fa fa-circle pull-right start");
                document.getElementById("status" + rss_clientid).setAttribute("onclick", "stopdevice(this.id)");
              }
              update_active_count();
            }
          }
        }
        else
          break;

      }
      if (randomstartstop == true)
        return;
      for (var key in received_msg) {
        if (key == "ClientID")
          client_id = received_msg[key];
        else if (key == "Topic")
          topic = received_msg[key];
        else if (key == "QoS") {
          qos = received_msg[key];
          qos_find = true;
        }
        else if (key == "Message")
          message = JSON.stringify(received_msg[key]);
        else if (key == "Time")
          ctime = received_msg[key];
        else if (key == "Status")
          publish_status = received_msg[key];
      }
      if (qos_find == true) {
        document.getElementById("empty-network-log").style.display = "none";
        document.getElementById("empty-device-log").style.display = "none";
        var sample = document.getElementById("upcoming-log");
        var log = document.getElementById("network_log_" + network_id);
        if (log) {
          var newnode = sample.cloneNode(true);
          newnode.setAttribute("id", "cloned");
          newnode.style.display = "block";
          var clientlog = document.getElementById("publish_log_" + client_id);
          $(log).prepend(newnode);
          if (publish_status == "success") {
            $('h4', $('#cloned')).each(function () {
              this.innerHTML = "Event from Device " + client_id + '<span class="pull-right"><i class="fa fa-upload text-green"></i></span>'; //log every element found to console output
            });
          }
          else {
            $('h4', $('#cloned')).each(function () {
              this.innerHTML = "Event from Device " + client_id + '<span class="pull-right"><i class="fa fa-upload text-red"></i></span>'; //log every element found to console output
            });
          }

          $('.logs-time', $('#cloned')).each(function () {
            this.innerText = "" + ctime; //log every element found to console output
          });
          $('.topic_from', $('#cloned')).each(function () {
            this.innerText = topic; //log every element found to console output
          });
          $('.qos_from', $('#cloned')).each(function () {
            this.innerText = qos; //log every element found to console output
          });
          $('.message_from', $('#cloned')).each(function () {
            this.innerText = message; //log every element found to console output
          });
          newnode.removeAttribute("id");
          var pubnode = newnode.cloneNode(true);
          var clientlog = document.getElementById("publish_log_" + client_id);
          if (clientlog)
            $(clientlog).prepend(pubnode);


        }
      }
      else {
        document.getElementById("empty-network-log").style.display = "none";
        document.getElementById("empty-device-log").style.display = "none";
        var sample = document.getElementById("subscribing-log");
        var log = document.getElementById("network_log_" + network_id);
        if (log) {
          var newnode = sample.cloneNode(true);
          newnode.setAttribute("id", "cloned");
          var clientlog = document.getElementById("publish_log_" + client_id);
          newnode.style.display = "block";
          $(log).prepend(newnode);
          $('h4', $('#cloned')).each(function () {
            this.innerHTML = "Command received by Device " + client_id + '<span class="pull-right"><i class="fa fa-download text-green"></i></span>'; //log every element found to console output
          });

          $('.logs-time', $('#cloned')).each(function () {
            this.innerText = "" + ctime; //log every element found to console output
          });
          $('.topic_from', $('#cloned')).each(function () {
            this.innerText = topic; //log every element found to console output
          });
          $('.message_from', $('#cloned')).each(function () {
            this.innerText = message; //log every element found to console output
          });
          newnode.removeAttribute("id");
          var pubnode = newnode.cloneNode(true);
          var clientlog = document.getElementById("publish_log_" + client_id);
          if (clientlog)
            $(clientlog).prepend(pubnode);


        }
      }


    };
    ws.onclose = function (evt) {
      var received_msg = evt.data;
    };

    window.onbeforeunload = function (event) {
      ws.close();
    };
  }

  else {
    ;
  }
}
function call_toggle(event) {
  event = event || window.event;
  var target = event.target || event.srcElement;
  $(target).nextAll(".detail-info").slideToggle();
  if ($(target).attr('class') == 'log-header') {
    $(target).find('span .ion-arrow-left-b').toggle();
    $(target).find('span .ion-arrow-down-b').toggle();
  }
}

var mg, root1;
function show_settings() {

  var table_name = window.network_peru;
  $.ajax({
    url: '/api/get/simsettings?curr_time=' + new Date().getTime()+'&Table_name=' + table_name,
    type: "GET",
    dataType: "text",
    async: false,
    success: function (msg) {
      // Using double parsing here *** IMPORTANT Need the right FIX - Ranjith 
      m = JSON.parse(msg);
      mg = m['mg_status'];
      root1 = m['root_cert'];
      $("#settings-enable-root").val(m['mg_status']);
  if ((m['root_cert'] == $("#myFile").val()) || ("C:\\fakepath\\"+m['root_cert'] == $("#myFile").val()))
    ;
  else
  {
    var myfile = document.getElementById("myFile");
    var rootform = document.getElementById("root-form");
    var rootlabel = document.getElementById("root-label");
    var newfile = document.createElement("input");
    newfile.setAttribute("type","file");
    newfile.setAttribute("id","newfile");
    $(newfile).insertAfter(rootlabel);
    document.getElementById("myFile").outerHTML = "";
    //myfile.remove();
    newfile.setAttribute("id","myFile");
    newfile.setAttribute("style","width:49%");
  }

      //var root=(document.getElementById("myFile"))
      //root.value=m['root_cert'];
      //document.getElementById("settings-enable-root").value = m['mg_status']
      //mg_app.value=m['mg_status'];
      //(document.getElementById("settings-brk-address")).value = m['brokerip'];
      // (document.getElementById("settings-brk-port")).value = m['brokerport'];
      // var tls_e = document.getElementById("settings-tls-status");
      // tls_e.value = m['TLS_status'];
      // var clientip_e = document.getElementById("settings-clientip-enabled");
      // clientip_e.value = m['clientip_enabled'];
      if ((m['clientip_enabled']) == "Enabled") {
        document.getElementById("settings-start-ip").disabled = false;
        document.getElementById("settings-end-ip").disabled = false;
      }
      else {
        document.getElementById("settings-start-ip").disabled = true;
        document.getElementById("settings-end-ip").disabled = true;
      }
      // var random_e = document.getElementById("settings-random-ss");
      // random_e.value = m['randomstartstop'];
      if ((m['randomstartstop']) == "Enabled") {
        document.getElementById("ettings-min-uptime").disabled = false;
      }
      else {
        document.getElementById("ettings-min-uptime").disabled = true;
      }
      // var interceptor_field = document.getElementById("settings-interceptor");
      // interceptor_field.value = m['use_interceptor'];
      
      if ((m['use_interceptor']) == "Enabled") {
        document.getElementById("file-path-settings").disabled = false;
      }
      else {
        document.getElementById("file-path-settings").disabled = true;
      }
      if ((m['auto_reconnect']) == "true") {
        document.getElementById("settings-auto-reconnect").checked = true;
      }
      else {
        document.getElementById("settings-auto-reconnect").checked = false;
      }

    }
  });


//document.getElementById("settings-brk-address").value = m['brokerip'];
$("#settings-brk-address").val(m['brokerip']);
$("#settings-brk-port").val(m['brokerport']);
$("#settings-tls-status").val(m['TLS_status']);
$("#settings-clientip-enabled").val(m['clientip_enabled']);
$("#settings-random-ss").val(m['randomstartstop']);
$("#settings-interceptor").val(m['use_interceptor']);
$("#settings-start-ip").val(m['start_ip']);
$("#settings-end-ip").val(m['end_ip']);
$("#ettings-min-uptime").val(m['uptime_min']);
$("#settings-clean-session").val(m['clean_session']);
$("#settings-auto-reconnect").val(m['auto_reconnect']);
$("#file-path-settings").val(m['interceptor_path']);

  $("#settings-sim").modal('show');
}

function saveSettings() {

  mg_application = ((document.getElementById("settings-enable-root")).value).trim();
  var network_Name = window.network_peru;

  var root_cert;
  if (window.k == null) {

    root_cert = window.root1;
  }
  else {
    root_cert = window.k.name;
    window.k = null;
  }

  var brkAddress = ((document.getElementById("settings-brk-address")).value).trim();
  if (brkAddress == "") {
    alert("Broker Address cannot be Empty");
    document.getElementById("settings-brk-address").focus();
    return false;
  }
  var brkport = ((document.getElementById("settings-brk-port")).value).trim();
  var x = parseInt(brkport, 10);
  if (isNaN(x) || x < 1 || x > 65535) {
    alert("Broker Port must be between 1 and 65535");
    document.getElementById("settings-brk-port").focus();
    return false;
  }
  var tls_e = document.getElementById("settings-tls-status");
  var tls_status = tls_e.options[tls_e.selectedIndex].text;
  var clientip_e = document.getElementById("settings-clientip-enabled");
  if (clientip_e.value == "") {
    document.getElementById("settings-clientip-enabled").value = "Disabled"
    return false;
  }
  var clientip_enable = clientip_e.options[clientip_e.selectedIndex].text;
  var startip = ((document.getElementById("settings-start-ip")).value).trim();
  if (clientip_e.value == "Enabled") {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(startip) == false) {
      alert("You have entered an invalid IP address!");
      return false;
    }
  }

  var endip = ((document.getElementById("settings-end-ip")).value).trim();
  if (clientip_e.value == "Enabled") {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(endip) == false) {
      alert("You have entered an invalid IP address!");
      return false;
    }
  }
  var random_e = document.getElementById("settings-random-ss");
  var randomss = random_e.options[random_e.selectedIndex].text;
  var min_uptime = ((document.getElementById("ettings-min-uptime")).value).trim();
  var cleansession = ((document.getElementById("settings-clean-session")).value).trim();
  // var auto_reconnect = ((document.getElementById("settings-auto-reconnect")).value).trim();
  var x = parseInt(cleansession, 10);
  if (isNaN(x) || x < 0 || x > 1) {
    alert("Clean Session should be 0 or 1. 0 = False , 1 = True");
    document.getElementById("settings-clean-session").focus();
    return false;
  }
  var x = parseInt(min_uptime, 10);
  if (isNaN(x) || x < 1 || x > 99) {
    alert("The Minimum uptime should be between 1 and 99.");
    document.getElementById("settings-min-uptime").focus();
    return false;
  }
  var interceptor_field = document.getElementById("settings-interceptor");
  var use_interceptor = interceptor_field.options[interceptor_field.selectedIndex].text;
  var file_path = (document.getElementById("file-path-settings")).value;
  if (file_path == "") {
    alert("The Python interceptor file cannot be empty.");
    document.getElementById("file-path-settings").focus();
    return false;
  }
  //alert(file_path);
  var auto_reconnect= false

  form_data = JSON.stringify({ 'network_name': network_Name, 'manager_app': mg_application, 'brokerip': brkAddress, 'brokerport': brkport, 'TLS_status': tls_status, 'root_cert': root_cert, 'clientip_enabled': clientip_enable, 'start_ip': startip, 'end_ip': endip, 'randomstartstop': randomss, 'uptime_min': min_uptime, 'clean_session': cleansession, 'use_interceptor': use_interceptor, 'interceptor_path': file_path, 'auto_reconnect': auto_reconnect });

  $.ajax({

    url: '/api/updatesettings',

    contentType: 'application/json',
    type: "POST",
    data: form_data,
    //async:false,
    success: function (msg) {
      if ((mg_application == "Azure_IoT") || (mg_application == "Aws_IoT"))
      {
        document.getElementById("addfromtemplate").disabled = true;
        document.getElementById("open_templates").setAttribute("class","disabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","disabled_here");
      }
      else
      {
        document.getElementById("addfromtemplate").disabled = false;
        document.getElementById("open_templates").setAttribute("class","enabled_here");
        document.getElementById("add_device_from_templates").setAttribute("class","enabled_here");        
      }      

      document.getElementById("settings-brk-address").disabled = true;
      document.getElementById("settings-enable-root").disabled = true;
      device_cert_module(mg_application);
      swal("Configuration Saved", "", "success");
      $('#settings-sim').modal('toggle');

    },
    error: function (m) {
      swal("Error while Saving configuration")
      $('#settings-sim').modal('toggle');
    }
  });
}


var k;

$(document).ready(function () {

  var initial_network_name;
  var previous_network_loaded = window.name;
  if ((previous_network_loaded == null) || (previous_network_loaded == "") || (previous_network_loaded == "network-deleted"))
    initial_network_name = 'HEALTH_CARE';
  else
    initial_network_name = previous_network_loaded;
  document.getElementById("upcoming-log").style.display = "none";
  document.getElementById("network_description").value = "Includes Sensors and its details of a hospital";
  set_network(initial_network_name);
  var device_authentication_value = $('#auth-enabled');
  if (device_authentication_value.is(':checked')) {
    $('.auth_detail_info').slideDown();
  }
  else {
    $('.auth_detail_info').slideUp();
  }

  var authentication_value = $('#enable-device');
  var will_value = $('#enable-will');
  $('.device-pageheader #delete-page').click(function () {
    deletealert();
  });
  $(".knob").knob();

  if (authentication_value.is(':checked')) {
    $('.authentication .detail-info').slideDown();
  }
  if (will_value.is(':checked')) {
    $('.will-block .detail-info').slideDown();
  }

  $('#enable-device').on('click', function () {
    if (authentication_value.is(':checked')) {
      $('.authentication .detail-info').slideDown();
    } else {
      $('.authentication .detail-info').slideUp();
    }
  });
  $('#enable-will').on('click', function () {
    if (will_value.is(':checked')) {
      $('.will-block .detail-info').slideDown();
    } else {
      $('.will-block .detail-info').slideUp();
    }
  });


  var template_authentication_value = $('#enable-template');
  var template_will_value = $('#enable-will-template');

  if (template_authentication_value.is(':checked')) {
    $('.template-authentication .detail-info').slideDown();
  }
  if (template_will_value.is(':checked')) {
    $('.template-will-block .detail-info').slideDown();
  }

  $('#enable-template').on('click', function () {
    if (template_authentication_value.is(':checked')) {
      $('.template-authentication .detail-info').slideDown();
    } else {
      $('.template-authentication .detail-info').slideUp();
    }
  });
  $('#enable-will-template').on('click', function () {
    if (template_will_value.is(':checked')) {
      $('.template-will-block .detail-info').slideDown();
    } else {
      $('.template-will-block .detail-info').slideUp();
    }
  });

  $('.key-save').on('keypress', function () {
    $(this).addClass('disabled_text');
  });

  $('.detail-info .fa-edit').click(function () {
    $(this).closest('.fa-edit').hide().closest('.detail-info .editable').attr('contenteditable', 'true').addClass('detail-editable');
    $(this).siblings('.save').show().siblings('.close').show();
  });
  $('.detail-info .fa-edit').click(function () {
    $(this).closest('.fa-edit').hide().parent().siblings('input').removeAttr('readonly');
    $(this).siblings('.save').show().siblings('.close').show();
  });
  $('.close').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.save').hide();
    $(this).siblings('.fa-edit').show();
    $(this).parent().siblings('input').addClass('disabled_text');

  });
  $('.save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').addClass('disabled_text');
  });
  $('.username_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').addClass('disabled_text');
    $(this).parent().siblings('input').blur();

  });
  $('.password_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });
  $('.will_topic_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });
  $('.will_msg_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });
  $('.template_username_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });
  $('.template_password_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });
  $('.template_will_topic_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });
  $('.template_will_msg_save').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.close').hide().siblings('.fa-edit').show();
    $(this).parent().siblings('input').blur();
  });


  $('.close').click(function () {
    $(this).hide().closest('.detail-info .editable').removeClass('detail-editable').removeAttr('contenteditable').blur();
    $(this).siblings('.save').hide().siblings('.fa-edit').show();
  });
  $('.table tr td .fa-trash').click(function () {
    tabledeletealert();
  });
  function tabledeletealert() {
    swal("Are you sure you want to delete this row?", {
      buttons: ["Cancel", "Yes"],
    });
  }

  $('.glyphicon-trash').click(function () {
    tabledeletealert();
  });

  $('.ng-scope #btn-addkey').on('click', function () {
    console.log("eee");
  });

  /* js for modal boxes  */

  $('.text-field .form-group select').on('change', function () {
    var value = $(this).find('option:selected').data('value');
    $(this).parent().parent().siblings().children('.' + value).show();
    $(this).parent().parent().siblings().children('.' + value).siblings().hide();
  });

  $('input[type="radio"]').click(function () {
    var type = $(this).val();
    $(this).parent().parent().parent().siblings().children('.' + type).show();
    $(this).parent().parent().parent().siblings().children('.' + type).siblings().hide();
  });

  $('.subscribe-select').on('change', function () {
    var value = $(this).find('option:selected').val();
    if (value == 'specific-time') {
      $('.specific-time').show();
    } else {
      $('.specific-time').hide();
    }
  });

  $('.device-search input').focus(function () {
    document.getElementById("devices_heading").style.display = "none";
  }).blur(function () {
    document.getElementById("devices_heading").style.display = "block";
  });
  /*$('#file-path-settings').click(function(e) { 
    $('#file-path-chooser').trigger('click');
  
  });
    
    $("#template-id").keypress(function( e ) {
    if(e.which === 32) 
      return false;
  }); 
  
  
  $('#file-path-chooser').change(function() { 
    var value_file = $('#file-path-chooser').val();
    alert($('#file-path-chooser').value);
     while( value_file.indexOf("\\") > -1) { 
      value_file = value_file.replace("\\", "/");
    }
    (document.getElementById('file-path-settings')).value = value_file;
  
  });*/


  document.getElementById("settings-enable-root").disabled = true;
  document.getElementById("settings-brk-address").disabled = true;
  $("#upload").click(function (event) {
    event.preventDefault();//this line will stop submitting the form
    k = document.getElementById("myFile")['files'][0];
    //syntax:document.getElementById("ID")["name"][0];
    var formData = new FormData();
    formData.append('root', k);
    $.ajax({
      url: "/api/rootupload",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      method: "POST",
      success: function (res) {
  if (res == "Failed")
    swal("Error in Uploading Root Certificate");
  else
          swal("Root Certificate Uploaded successfully", "", "success");
      },
      error: function (err) {
        swal("Error in Uploading Root Certificate");
      }
    })
  })


  $("#upload-device-cert").click(function (event) {
    event.preventDefault();//this line will stop submitting the form
    var y = document.getElementById("myFile1")['files'][0];
    //syntax:document.getElementById("ID")["name"][0];
    var formData = new FormData();
    formData.append('dev', y);
    //formData.append('dev_id',document.getElementById("d_name").value);
    $.ajax({
      url: "/api/devicecertupload?dev_id=" + document.getElementById("d_name").value,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      method: "POST",
      success: function (res) {
  if (res == "Failed")
    swal("Device  Certificate Upload failed");
  else
          swal("Device Certificate Uploaded successfully", "", "success");
      },
      error: function (err) {
        swal("Device  Certificate Upload failed");
      }
    })
  })



  $("#upload-device-key").click(function (event) {
    event.preventDefault();//this line will stop submitting the form
    var z = document.getElementById("myFile2")['files'][0];
    //syntax:document.getElementById("ID")["name"][0];
    // var y = x.files[0];
    var formData = new FormData();
    formData.append('key', z);
    $.ajax({
      url: "/api/devicekeyupload?dev_key=" + document.getElementById("d_name").value + "&auth_type=" + document.getElementById("auth").value,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      method: "POST",
      success: function (res) {
  if (res == "Failed")
    swal("Device Key Upload failed");
  else
  {
          swal("Device Key Uploaded successfully", "", "success");
          document.getElementById("auth").disabled = true;
  }
      },
      error: function (err) {
        swal("Device Key Upload failed");
      }
    })
  })


  // if (window.mg_application != "Azure_IoT" ) {
  //   // document.getElementById("myFile").disabled = true;
  //   // document.getElementById("myFile").value = ""
  //   document.getElementById("upload").disabled = true;
  //   document.getElementById("upload").value = "upload"
  //   document.getElementById("authentication-type").disabled = true;
  //   document.getElementById("authentication-type").value = "";
  //   $("#authentication-type").attr("style", "display:none");
  //   $("#certificate-module").attr("style", "display:none");

  // }
  // else {
  //   // document.getElementById("myFile").disabled = false;
  //   // document.getElementById("myFile").value = "";
  //   document.getElementById("upload").disabled = false;
  //   document.getElementById("upload").value = "upload";
  //   document.getElementById("authentication-type").disabled = false;
  //   document.getElementById("authentication-type").value = "upload";
  //   $("#authentication-type").attr("style", "display:block");
  //   $("#certificate-module").attr("style", "display:block");
  // }

  $("#auth").change(function () {
    if (window.h != "Azure_IoT") {
      return false;
    }
    if ($(this).val() == "selfsigned") {
      $("#certificate-module").attr("style", "display: block;");
    }
    else {
      $("#certificate-module").attr("style", "display:none");
    }
  })



});




function before_save_settings() {
  var swal_title = "";
  var swal_text = "Broker IP will not be changed after saving settings. Are you sure to proceed?";
  if (document.getElementById("settings-brk-address").disabled != true) {
    swal({
      title:swal_title,
      text:swal_text,
      width:300,
      height:300,
      showCancelButton:true,
      confirmButtonColor:"#008d4c",
      confirmButtonText:"Yes",
      cancelButtonText:"cancel",
      closeOnConfirm:true,
      closeOnCancel:true
    },
    function(isConfirm){
      if(isConfirm){
        $("#settings-trail").modal("hide");
        saveSettings();
        
      }
      else{
        $("#settingsicon").click();
      }
    });
  }
  else {
    saveSettings();
    $("#settings-trail").modal("hide");
  }
}
var h;
function device_cert_module(x) {
  h = x;
  if (x != "Azure_IoT") {
    $("#authentication-type").attr("style", "display:none");
    if (x == "Aws_IoT") {
      $("#certificate-module").attr("style", "display:block");
    }
    else {
      $("#authentication-type").attr("style", "display:none");
      $("#certificate-module").attr("style", "display:none");
    }
  }
  else {
    $("#authentication-type").attr("style", "display:block");
    if (document.getElementById("auth").value == "selfsigned")
    {
      $("#certificate-module").attr("style", "display:block");

    }
    else
      $("#certificate-module").attr("style", "display:none");
  }
}
