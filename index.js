// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const { Payload } = require("dialogflow-fulfillment");
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function liveChat(agent){
    const myDay = new Date();
    const h = myDay.getHours();
    const noww = Math.round((18 - h) / (1000 * 60 * 60));
    const userName = agent.parameters.name;
    const today = new Date();
    const date = today.getDate()+'-'+(today.getMonth()+1)+'-'+ today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const day = myDay.getDay();
    const conv = agent.conv();
    
    if(day == 0){
      conv.ask('You are now being transferred to one of our Live Chat agents');
      conv.ask('Sorry our agents are not available on Sunday. Please try tomorrow from 9 AM EST');
      agent.add(conv);
    }
    if(day == 6){
      conv.ask('You are now being transferred to one of our Live Chat agents');
      conv.ask('Sorry our agents are not available on Saturday. Please try on Monday from 9 AM EST');
      agent.add(conv);
    }else{
      if(h > 17){
        conv.ask('You are now being transferred to one of our Live Chat agents');
        conv.ask('Our agent are not available at the moment. Please try tomorrow from 9 AM EST');
        agent.add(conv);
      }
      if(h < 9){
        conv.ask('You are now being transferred to one of our Live Chat agents');
        conv.ask('Our agent are not available at the moment. Please try from 9 AM EST');
        agent.add(conv);
      }else{
        agent.add(new Payload("PLATFORM_UNSPECIFIED", [{
  			"platform": "kommunicate",
  			"message": "our agents will get back to you", 
  			"metadata": {
    			"KM_ASSIGN_TO": ""  
  			}
		}]));
        
      }
    }
  }
  
  function liveAgent(agent){
    agent.add(new Payload("PLATFORM_UNSPECIFIED", [{
    "platform": "kommunicate",
      "message": "Can I connect you to one of our Live Agents who can best help you?", //optional
    "metadata": {
        "contentType": "300",
        "templateId": "6",
        "payload": [{
            "title": "Yes",
            "message": "I want to talk to a human",
            "replyMetadata": {
                "actionRequest": "fetchAgentAvailability"
            	}
        	}]
    		}
	}]));
    
  }
  
  function talkToHuman(agent){
    let payload = request.body.originalDetectIntentRequest.payload.actionResponse;
    console.log(payload);
    console.log(payload[0]);
    payload = payload[0].payload.availabilityStatus;
    console.log(payload);
    if(payload == 'online'){
      agent.add(new Payload("PLATFORM_UNSPECIFIED", [{
  			"platform": "kommunicate",
  			"message": "our agents will get back to you in a moment", 
  			"metadata": {
    			"KM_ASSIGN_TO": ""  
  			}
		}]));
    }
    if(payload == 'offline'){
      agent.add('Sorry, our agents are not available at the moment,we will gwt back to you at the earliest convience');
    }
    if(payload == 'away'){
      agent.add('Sorry, our agents are not available at the moment,we will gwt back to you at the earliest convience');
    }
    /*
    payload.map((resp)=>{
      console.log("response: ", resp);
      resp.map((resp3)=>{
        if(resp3.){}
      });
      
      //if(resp.payload.availabilityStatus){}
    });
    */
    //let agentStatus = request.body.originalDetectIntentRequest.payload.actionResponse.payload.availabilityStatus ;
    
    //console.log("agentStatus", agentStatus);
    //agentStatus = JSON.parse(agentStatus);
    //console.log("agentStatus_after_parsing", agentStatus);
    //payload = JSON.parse(payload);
    //console.log(parsed);
    //console.log(parsed[0].payload.availabilityStatus);
    //const agentAvailability = parsed[0].payload.availabilityStatus;
    //console.log(agentAvailability);
  }

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('5,6', liveAgent);
  intentMap.set('5,6 - talk to human', talkToHuman);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
