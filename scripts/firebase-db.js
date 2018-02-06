var db = firebase.database();
var browserKey = null;

function sendDeviceKeytoFirebase(key) {
  browserKey = 'users/browserKey-' + getID();
  return db.ref(browserKey).set({
    key: key,
    time: getCurrentTime()
  }).then(function () {
    console.log("The key has been sent to Firebase DB");
  }).catch(function () {
    console.error('Sending a key to server has been failed');
  });
}

function removeDeviceKeyinFirebase(key){
  return db.ref(browserKey).remove()
    .then(function(){
      console.log("The key has been removed in Firebase DB");
      browserKey = null;
    }).catch(function(err){
      console.log('Removing a key in server has been failed', err);
    });
}

function getID() {
  var date = new Date();
  return date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
}

function getCurrentTime() {
  return new Date().toLocaleString();
}
