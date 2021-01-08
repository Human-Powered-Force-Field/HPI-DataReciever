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
enocean.teach({
  'id'  : '00 00 01 A4 A2 C2',
  'eep' : 'F6-02-02',
  'name': 'Controller 3'
});
enocean.teach({
  'id'  : '00 00 01 A4 A6 79',
  'eep' : 'F6-02-02',
  'name': 'Shaker'
});

setInterval(myTimer, 500);

var shakes = []
var prevNrOfShakes = 0
function myTimer() {
  if (shakes.length != prevNrOfShakes){
    db.collection(collection).doc("shaker").update({
        value: shakes.length
      })
    prevNrOfShakes = shakes.length
    shakes = []

  }
}

function handlePullThingData(message, button){
  if (message['value'].pressed){
    if (button == "A0"){
      db.collection(collection).doc("pause").update({
          value: true
      })
    }
    else if(button == "B0"){
      db.collection(collection).doc("newField").update({
          generate: true
      })
    }
  }
  else{
    db.collection(collection).doc("pause").update({
        value: false
    })
    db.collection(collection).doc("newField").update({
        generate: false
    })
  }
}

// Start to monitor telegrams incoming from the Enocean devices
enocean.startMonitor().then(() => {
  // Set an event listener for 'data-known' events
  enocean.on('data-known', (telegram) => {
    let message = telegram['message'];
    console.log(message['device']['name'] + ': ' + message['desc']);
    let button = message['value'].button

    if (message['device']['name'] == "Shaker"){
      shakes.push(1)
    }
    else if (message['device']['name'] == "Controller 2"){
      handlePullThingData(message, button)
    }
    else{
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
    }



  });
}).catch((error) => {
  console.error(error);
});
