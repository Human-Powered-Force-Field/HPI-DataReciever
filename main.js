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
  'name': 'Switch Device_9FA1'
});

// Start to monitor telegrams incoming from the Enocean devices
enocean.startMonitor().then(() => {
  // Set an event listener for 'data-known' events
  enocean.on('data-known', (telegram) => {
    let message = telegram['message'];
    console.log(message)
    var canon = "leftCanon";
    var isShooting = true
    if (message['desc'] == "AI pressed"){
      canon = "leftCanon"
    }
    else if(message['desc'] == "A0 pressed"){
      canon = "topCanon"
    }
    else if(message['desc'] == "B0 pressed"){
      canon = "rightCanon"
    }
    else if(message['desc'] == "BI pressed"){
      canon = "bottomCanon"
    }
    else{
      isShooting = false
    }

    if (isShooting){
      db.collection(collection).doc(canon).update({
          shooting: isShooting
        })
    }
    else{
      let canons = ["leftCanon", "topCanon", "rightCanon", "bottomCanon"]
      for (var i = 0; i < canons.length; i++) {
        db.collection(collection).doc(canons[i]).update({
            shooting: isShooting
          })
      }
    }


    console.log(message['device']['name'] + ': ' + message['desc']);
  });
}).catch((error) => {
  console.error(error);
});
