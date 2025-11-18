import com.bevywise.iot.simulator.IOTSimulatorAPI;
class APIExample
{
	public static void main(String arg[]) throws InterruptedException
	{
		IOTSimulatorAPI api=new IOTSimulatorAPI();

		// DISPLAYS NETWORK LIST
		System.out.println(api.getNetworkList());

		// CHOOSES A NEW NETWORK - NETWORK NAME SHOULD BE WITHIN THE NETWORK LIST
		System.out.println(api.chooseNetwork("BEVY_HEALTH_CARE"));
		System.out.println(api.getSubscriptionDetails("CO2_Sensor"));
		System.out.println(api.getNetworkStatus());

		System.out.println(api.startDevice("AC118"));

		System.out.println(api.chooseNetwork("BEVY_HEALTH_CARE"));

		System.out.println(api.getNetworkStatus());
		System.out.println(api.startNetwork());
		System.out.println(api.getNetworkStatus());

		System.out.println(api.stopNetwork());

		System.out.println(api.getNetworkStatus());

		System.out.println(api.chooseNetwork("BEVY_HEALTH_CARE"));

		System.out.println(api.startDevice("dummy"));
		System.out.println(api.startDevice("AC118"));

		System.out.println(api.getDeviceDetails("dummy"));
		System.out.println(api.getDeviceDetails("AC118"));

		String msg1="{\"data\":{\"Speed\":{\"type\":\"range\",\"value\":\"60-100\"}},\"Temperature\":{\"temp\":{\"type\":\"range\",\"value\":\"30-60\"}}}";
		String msg2="hello";
		String msg3="data corruption test";

		System.out.println(api.publish("AC118","pytopic1",msg1,0,0));
		System.out.println(api.publish("AC118","pytopic2",msg2,0,0));
		System.out.println(api.publish_with_error("AC118","pytopic2",msg3,0,0));

		//System.out.println(api.getDeviceDetails("AC118"));
		System.out.println(api.stopDevice("AC118"));
		System.out.println("Suspending");

		//Event_id can be retrieved from getDeviceDetails() API 
		//Events with publish_on: At Specific Interval, Whole Day can be stopped and resumed.
				
		int event_id=1;
		System.out.println(api.stopEvent(event_id));
		System.out.println(api.startDevice("AC118"));
		Thread.sleep(5000);		
		System.out.println(api.stopEvent(event_id));
		Thread.sleep(5000);
		System.out.println("Resuming");
		System.out.println(api.resumeEvent(event_id));

		System.out.println(api.addDevice("Client1","APIClient1","",""));
		System.out.println(api.addNewSubscribe("Client1","Topic"));
		System.out.println(api.addNewSubscribe("Client1","Topic1"));
		System.out.println(api.addDevice("Client2","APIClient2","",""));
		System.out.println(api.addNewSubscribe("Client2","Topic"));
		System.out.println(api.addNewSubscribe("Client2","Topic2"));
		System.out.println(api.addDevice("Client3","APIClient3","",""));
		System.out.println(api.addNewSubscribe("Client3","Topic"));
		System.out.println(api.addNewSubscribe("Client3","Topic3"));
		System.out.println(api.addResponseforRequest("Client1","Topic","Hello","Topic1","ReqRes1"));
		System.out.println(api.addResponseforRequest("Client2","Topic","Hello","Topic2","ReqRes2"));
		System.out.println(api.addResponseforRequest("Client3","Topic","Hello","Topic3","ReqRes3"));
		System.out.println(api.startDevice("Client1"));
		System.out.println(api.startDevice("Client2"));
		System.out.println(api.startDevice("Client3"));
		Thread.sleep(5000);
		System.out.println(api.publish("Client1","Topic","Hello"));
		Thread.sleep(3000);
		System.out.println(api.publish("Client2","Topic","Hello"));
		Thread.sleep(5000);
		System.out.println(api.publish("Client3","Topic","Hello"));


		System.out.println("Unsubscribing Topic1");
		System.out.println(api.unsubscribe("Client1","Topic1"));


	}
}
