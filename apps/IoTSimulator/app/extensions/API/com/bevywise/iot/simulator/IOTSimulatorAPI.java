/*########################################################################
#
# Bevywise Networks
#
# The Java Wrapper class for the simulator REST API 
# You can publish data dynamically or add and remove data from simulator db.
# Usage : 
# simulator = new IOTSimulatorAPI(SIMULATOR_IP , PORT)  
# simulator.addDevice("water_level_sensor")
# simulator.publish("water_level_sensor" , "overheadtank/water_level" , "3m")
#
########################################################################*/


package com.bevywise.iot.simulator;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.*;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class IOTSimulatorAPI {

	
	public String API_SERVER = "localhost";
	public String port = "9000";
	public String network_chosen="";
	Properties prop = new Properties();
	InputStream input = null;


	public IOTSimulatorAPI(String API_SERVER , String port) { 
		this.API_SERVER = API_SERVER;
		this.port = port;
	}
	
	public IOTSimulatorAPI()
	{
	
	try {

		input = new FileInputStream("api.conf");

		prop.load(input);

		API_SERVER=prop.getProperty("SERVER_IP");
		port=prop.getProperty("API_PORT");

	} catch (IOException ex) {
		System.out.println("The conf file is not specified.");
	} finally {
		if (input != null) {
			try {
				input.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

  

	}

	public  String addDevice(String deviceID, String deviceName)
	{
		String s=addDevice(deviceID,deviceName,"","",0,0," "," ",0,0);
		return s;
	}
	public  String addDevice(String deviceID, String deviceName,String username)
	{
		String s=addDevice(deviceID,deviceName,username,"",0,0," "," ",0,0);
		return s;
	}

	public  String addDevice(String deviceID, String deviceName ,String username,String password)
	{
		String s=addDevice(deviceID,deviceName,username,password,0,0," "," ",0,0);
		return s;
	}
	public  String addDevice(String deviceID, String deviceName,String username,String password , int clean_session)
	{
		String s=addDevice(deviceID,deviceName,username,password,clean_session,0," "," ",0,0);
		return s;
	}
	public  String addDevice(String deviceID , String deviceName,String username,String password, int clean_session,int will_flag,String willtopic,String willmessage)
	{
		String s=addDevice(deviceID,deviceName,username,password,clean_session,will_flag,willtopic,willmessage,0,0);
		return s;
	}
	public  String addDevice(String deviceID , String deviceName,String username,String password , int clean_session,int will_flag,String willtopic,String willmessage,int willqos)
	{
		String s=addDevice(deviceID,deviceName,username,password,clean_session,will_flag,willtopic,willmessage,willqos,0);
		return s;
	}


	public  String addDevice(String deviceID , String deviceName,String username,String password, int clean_session,int will_flag,String willtopic,String willmessage,int willqos,int willretain)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";
		
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";
		if (!deviceName.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid device name. Only alphabets,numbers,/,_,space are allowed";
		if (!willtopic.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid willtopic. Only alphabets,numbers,/,_,space are allowed";
		if (!willmessage.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid willmessage. Only alphabets,numbers,/,_,space are allowed";
		if (clean_session < 0 || clean_session >1)
			return "Invalid clean session. Value should be 0 or 1";
		if (will_flag < 0 || will_flag >1)
			return "Invalid will flag. Value should be 0 or 1";
		if (willqos < 0 || willqos >2)
			return "Invalid will qos. Value should be 0,1 or 2";
		if (willretain < 0 || willretain >1)
			return "Invalid will retain. Value should be 0 or 1";
		if (will_flag==1)
			if (willtopic==" " || willmessage==" ")
				return "Willflag is set. Will topic/message cannot be empty";



		String urlParameters  = "device_id="+deviceID+"&description="+deviceName+"&clean_session="+clean_session+"&will_flag="+will_flag+"&willtopic="+willtopic+"&willmessage="+willmessage+"&willqos="+willqos+"&willretain="+willretain+"&username="+username+"&password="+password+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8);
		String API_URL = "http://"+API_SERVER+":"+port+"/api/addclient";
		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}
	}
	public  String removeDevice(String deviceID)
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";;

		try
		{
			deviceID=java.net.URLEncoder.encode(deviceID, "UTF-8");
		}
		catch(java.io.UnsupportedEncodingException e)
		{
			return "UTF-8 Encoding is not supported";
		}

		if (!deviceID.matches("[a-zA-Z 0-9/_+]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";

		String API_URL="http://"+API_SERVER+":"+port+"/api/get/removeclient?device_id="+deviceID+"&network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
		 
	}

	public String stopEvent(int event_id)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";

		if (event_id<=0)
			return "{\"Status\":\"Invalid Event_ID\"}";

		String API_URL="http://"+API_SERVER+":"+port+"/api/get/stopevent?network_chosen="+network_chosen+"&event_id="+event_id;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
		 
	}
	public String resumeEvent(int event_id)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";

		if (event_id<=0)
			return "{\"Status\":\"Invalid Event_ID\"}";;

		String API_URL="http://"+API_SERVER+":"+port+"/api/get/resumeevent?network_chosen="+network_chosen+"&event_id="+event_id;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
		 
	}


	public  String getDevicesList()
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";;
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/deviceslist?network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
	}

	public String startNetwork()
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/startalldevices?network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
	}

	
	public String getNetworkStatus()
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/networkstatus?network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
	}


	public String stopNetwork()
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/stopalldevices?network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			network_chosen="";
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
	}


	public String getNetworkList()
	{
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/networklist";
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}		
	}


	public  String getDeviceDetails(String deviceID)
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";;

		try
		{
			deviceID=java.net.URLEncoder.encode(deviceID, "UTF-8");
		}
		catch(java.io.UnsupportedEncodingException e)
		{
			return "UTF-8 Encoding is not supported";
		}

		if (!deviceID.matches("[a-zA-Z 0-9/_+]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";

		String API_URL="http://"+API_SERVER+":"+port+"/api/get/devicedetails?device_id="+deviceID+"&network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
		 
	}



	public  String getSubscriptionDetails(String deviceID)
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";;

		try
		{
			deviceID=java.net.URLEncoder.encode(deviceID, "UTF-8");
		}
		catch(java.io.UnsupportedEncodingException e)
		{
			return "UTF-8 Encoding is not supported";
		}

		if (!deviceID.matches("[a-zA-Z 0-9/_+]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";

		String API_URL="http://"+API_SERVER+":"+port+"/api/get/subscribedetails?device_id="+deviceID+"&network_chosen="+network_chosen;
		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
		 
	}

	public  String chooseNetwork(String networkname)
	{
		try
		{
			networkname=java.net.URLEncoder.encode(networkname, "UTF-8");
		}
		catch(java.io.UnsupportedEncodingException e)
		{
			return "UTF-8 Encoding is not supported";
		}

		if (!networkname.matches("[a-zA-Z0-9_+]+"))
			return "Invalid networkname";
		if (network_chosen.equals(networkname))
			return "{\"Network_name\":\""+network_chosen+"\",\"Status\":\"Network is already chosen\"}";

		if (network_chosen=="");
		else
			return "{\"Status\":\"Network "+network_chosen+" has to be stopped before choosing another network\"}";


		String API_URL="http://"+API_SERVER+":"+port+"/api/get/setnetwork?network_chosen="+networkname;
		try
		{
			String s=sendGET(API_URL);
			int i=s.indexOf("not chosen");
			if (i==-1)
			{
				network_chosen=networkname;
			}
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}
		 
	}


	

	public  String unsubscribe(String deviceID,String topic)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";
		if ((deviceID=="") || (topic==""))
			return "{\"Status\":\"DeviceID / Topic cannot be empty\"}";
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";


		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );
		String API_URL = "http://"+API_SERVER+":"+port+"/api/unsubscribe";
		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String unsubscribeAll()
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";


		String API_URL = "http://"+API_SERVER+":"+port+"/api/unsubscribeall";
		String urlParameters  = "network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String startDevice(String deviceID)
	{
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";;
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/startdevice?network_chosen="+network_chosen+"&device_id="+deviceID;

		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}

	}

	public  String stopDevice(String deviceID)
	{
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";
		String API_URL = "http://"+API_SERVER+":"+port+"/api/get/stopdevice?network_chosen="+network_chosen+"&device_id="+deviceID;

		try
		{
			String s=sendGET(API_URL);
			return s;
		}
		catch(Exception e)
		{
			return e+"";
		}

	}


	public  String subscribe()
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/subscribe";
		String urlParameters  = "network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String subscribe(String deviceID,String topic)
	{
		String s=subscribe(deviceID,topic,0,false);
		return s;
	}

	public  String subscribe(String deviceID,String topic,int qos)
	{
		String s=subscribe(deviceID,topic,qos,false);
		return s;

	}
	public  String subscribe(String deviceID,String topic,int qos,boolean addtodb)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";		
		if (qos < 0 || qos >2)
			return "{\"Status\":\"Invalid QoS\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/subscribeclient";
		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&qos="+qos+"&addtodb="+addtodb+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}




	public  String publish(String deviceID,String topic,String message)
	{
		String s=publish(deviceID,topic,message,0,1);
		return s;
	}


	public  String publish(String deviceID,String topic,String message,int qos)
	{
		String s=publish(deviceID,topic,message,qos,1);
		return s;

	}


	public  String publish(String deviceID,String topic,String message,int qos,int retain)
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";
		if ((deviceID=="") || (topic=="") || (message==""))
			return "{\"status\":\"Device Name / Topic / Message cannot be empty\"}";
		
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";
		if (!topic.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid topic. Only alphabets,numbers,/,_,space are allowed";
		if (qos < 0 || qos >2)
			return "Invalid qos. Value should be 0,1 or 2";
		if (retain < 0 || retain >1)
			return "Invalid retain. Value should be 0 or 1";

		String API_URL = "http://"+API_SERVER+":"+port+"/api/publishclient";
		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&message="+message+"&qos="+qos+"&retain="+retain+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
			e.printStackTrace();
		 	return e+"";
		}

	}

	public  String publish_with_error(String deviceID,String topic,String message)
	{
		String s=publish(deviceID,topic,message,0,1);
		return s;
	}


	public  String publish_with_error(String deviceID,String topic,String message,int qos)
	{
		String s=publish(deviceID,topic,message,qos,1);
		return s;

	}


	public  String publish_with_error(String deviceID,String topic,String message,int qos,int retain)
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";
		if ((deviceID=="") || (topic=="") || (message==""))
			return "{\"status\":\"Device Name / Topic / Message cannot be empty\"}";
		
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid deviceID. Only alphabets,numbers,/,_,space are allowed";
		if (!topic.matches("[a-zA-Z 0-9/_]+"))
			return "Invalid topic. Only alphabets,numbers,/,_,space are allowed";
		if (qos < 0 || qos >2)
			return "Invalid qos. Value should be 0,1 or 2";
		if (retain < 0 || retain >1)
			return "Invalid retain. Value should be 0 or 1";

		String API_URL = "http://"+API_SERVER+":"+port+"/api/publishclient_with_corruption";
		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&message="+message+"&qos="+qos+"&retain="+retain+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
			e.printStackTrace();
		 	return e+"";
		}

	}

	public  String addResponseforRequest(String deviceID, String request_topic, String request_message, String response_topic, String response_message)
	{
		String s=addResponseforRequest(deviceID,request_topic,request_message,response_topic,response_message,0,0);
		return s;
	}

	public  String addResponseforRequest(String deviceID, String request_topic, String request_message, String response_topic, String response_message,int qos)
	{
		String s=addResponseforRequest(deviceID,request_topic,request_message,response_topic,response_message,qos,0);
		return s;

	}


	public  String addResponseforRequest(String deviceID, String request_topic, String request_message, String response_topic, String response_message,int qos,int retain)
	{
		if (network_chosen=="")
			return "{\"status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid deviceID\"}";
		if (!request_topic.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid Command Topic\"}";
		if (!response_topic.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid Event Topic\"}";

		if (qos < 0 || qos >2)
			return "{\"Status\":\"Invalid QoS\"}";
		if (retain < 0 || retain >1)
			return "{\"Status\":\"Invalid Retain\"}";


		String API_URL = "http://"+API_SERVER+":"+port+"/api/addresponse";
		String urlParameters  = "device_id="+deviceID+"&event_topic="+request_topic+"&event_data="+request_message+"&command_topic="+response_topic+"&command_data="+response_message+"&qos="+qos+"&retain="+retain+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String addNewSubscribe(String deviceID, String topic)
	{
		String s=addNewSubscribe(deviceID,topic,0);
		return s;
	}


	public  String addNewSubscribe(String deviceID, String topic,int qos)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		
		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";		
		if (qos < 0 || qos >2)
			return "{\"Status\":\"Invalid QoS\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/addsubscribe";
		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&qos="+qos+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String removePublishMessage(String deviceID)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";		

		if (deviceID=="")
			return "{\"Status\":\"DeviceID cannot be empty\"}";		


		String API_URL = "http://"+API_SERVER+":"+port+"/api/removeallpublish";
		String urlParameters  = "device_id="+deviceID+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String removePublishMessage(String deviceID, String topic)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";	

		if (deviceID=="")
			return "{\"Status\":\"DeviceID cannot be empty\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/removepublish";
		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}


	public  String removeSubscribe(String deviceID)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";	

		if (deviceID=="")
			return "{\"Status\":\"DeviceID cannot be empty\"}";		
		String API_URL = "http://"+API_SERVER+":"+port+"/api/removeallsubscribe";
		String urlParameters  = "device_id="+deviceID+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String removeSubscribe(String deviceID, String topic)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";	

		if (deviceID=="")
			return "{\"Status\":\"DeviceID cannot be empty\"}";		
		String API_URL = "http://"+API_SERVER+":"+port+"/api/removesubscribe";
		String urlParameters  = "device_id="+deviceID+"&topic="+topic+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}
	public  String removeResponseforRequest(String deviceID)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";	

		if (deviceID=="")
			return "{\"Status\":\"DeviceID cannot be empty\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/removeallresponse";
		String urlParameters  = "device_id="+deviceID+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String removeResponseforRequest(String deviceID, String req_topic)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";	

		if (deviceID=="")
			return "{\"Status\":\"DeviceID cannot be empty\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/removeresponse";
		String urlParameters  = "device_id="+deviceID+"&event_topic="+req_topic+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}
	public  String stopBehaviorSimulation(String deviceID, String request_topic)
	{
		if (network_chosen=="")
			return "{\"Status\":\"Network is not chosen\"}";		

		if (!deviceID.matches("[a-zA-Z 0-9/_]+"))
			return "{\"Status\":\"Invalid DeviceID\"}";	

		if ((deviceID=="") || (request_topic==""))
			return "{\"Status\":\"DeviceID / Topic cannot be empty\"}";		

		String API_URL = "http://"+API_SERVER+":"+port+"/api/stopres";
		String urlParameters  = "device_id="+deviceID+"&event_topic="+request_topic+"&network_chosen="+network_chosen;
		byte[] postData = urlParameters.getBytes(StandardCharsets.UTF_8 );

		try
		{
			String s=sendPOST(API_URL,postData);
		
			return s;
		}
		catch(Exception e)
		{
		 	return e+"";
		}

	}

	public  String sendGET(String API_URL) throws IOException {
		URL obj = new URL(API_URL);
		HttpURLConnection con;
		int responseCode;
		try
		{
			con = (HttpURLConnection) obj.openConnection();
			con.setRequestMethod("GET");
			responseCode = con.getResponseCode();
		}
		catch(java.net.ConnectException e)
		{
			return "{\"Status\":\"Unable to bind with Port "+port+". Please restart the simulator\"}";
		}
		if (responseCode == HttpURLConnection.HTTP_OK) { 
			BufferedReader in = new BufferedReader(new InputStreamReader(
					con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();

			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();

	
			return(response.toString());
		} else {
			return("{\"Status\":\"Unable to perform the required function\"}");
		}

	}

	public  String sendPOST(String API_URL , byte[] postData) throws IOException {

			System.out.println("Start of Send post");
		URL obj = new URL(API_URL);
		HttpURLConnection con;
		int responseCode;
		try
		{
			con = (HttpURLConnection) obj.openConnection();
			con.setRequestMethod("POST");
			con.setDoOutput(true);
			OutputStream os = con.getOutputStream();
			os.write(postData);
			os.flush();
			os.close();
			responseCode = con.getResponseCode();
			System.out.println("The response code  -- "+responseCode);
		}
		catch(java.net.ConnectException e)
		{
			System.out.println("The port is not working");
			return "{\"Status\":\"Unable to bind with Port "+port+" . Please restart the simulator\"}";
		}


		if (responseCode == HttpURLConnection.HTTP_OK) { 
			BufferedReader in = new BufferedReader(new InputStreamReader(
					con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();

			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();

			
			return(response.toString());
		} else {
			return("{\"Status\":\"Unable to perform the required function\"}");
		}
	}

}

