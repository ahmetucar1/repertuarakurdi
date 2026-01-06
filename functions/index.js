const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

// Mail bildirimleri kaldırıldı. Bu fonksiyonlar sadece tetiklenip çıkıyor.
exports.notifySubmission = functions
  .region("us-central1")
  .firestore.document("song_submissions/{id}")
  .onWrite(() => null);

exports.notifyContactMessage = functions
  .region("us-central1")
  .firestore.document("contact_messages/{id}")
  .onCreate(() => null);
