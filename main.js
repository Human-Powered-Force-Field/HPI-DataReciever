var admin = require('firebase-admin');
var serviceAccount = require("./dbkey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hpforcefield.firebaseio.com"
});

var db = admin.firestore();
var collection = "canons"

const enocean = require('node-enocean-utils');

// Teach the information of Enocean devices
enocean.teach({
  'id'  : '00 00 00 2D 9F A1',
  'eep' : 'F6-02-02',
  'name': 'Controller 1'
});
enocean.teach({
  'id'  : '00 00 00 2D 9F 39',
  'eep' : 'F6-02-02',
  'name': 'Controller 2'
});
// Start to monitor telegrams incoming from the Enocean devices
enocean.startMonitor().then(() => {
  // Set an event listener for 'data-known' events
  enocean.on('data-known', (telegram) => {
    let message = telegram['message'];
    console.log(message['device']['name'] + ': ' + message['desc']);
    let button = message['value'].button

    var canon = "";

    if (button == "AI"){
      canon = "leftCanon"
    }
    else if(button == "A0"){
      canon = "topCanon"
    }
    else if(button == "B0"){
      canon = "rightCanon"
    }
    else if(button == "BI"){
      canon = "bottomCanon"
    }

    if (message['value'].pressed){
      db.collection(collection).doc(canon).update({
          shooting: true
        })
    }
    else{
      let canons = ["leftCanon", "topCanon", "rightCanon", "bottomCanon"]
      for (var i = 0; i < canons.length; i++) {
        db.collection(collection).doc(canons[i]).update({
            shooting: false
          })
      }
    }


  });
}).catch((error) => {
  console.error(error);
});
