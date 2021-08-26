var FCM = require('fcm-node');
var serverKey = require('./firebase_kmax.json');
var fcm = new FCM(serverKey);

exports.SendFirebaseMessage = async ({ data, notification, to }) => {
  fcm.send(
    {
      data,
      notification,
      // priority: 'normal',
      to,
    },
    function (err, response) {
      if (err) {
        console.log('Something has gone wrong!', err);
      } else {
        console.log(
          'Successfully sent with response: ',
          JSON.stringify(response)
        );
      }
    }
  );
};
