const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.onOrderCreated = functions.region("europe-west1")
    .firestore.document("order/{orderId}").onCreate((snap, context) => {
        const doc = snap.data();
        let content;
        if (doc.orderLocation == 0) {
            content = `Table N. ${doc.tableAdress} - Total : ${doc.grandTotal} FBU`;
        } else if (doc.orderLocation == 1) {
            content = `Adress : ${doc.tableAdress} - Total : ${doc.grandTotal} FBU`;
        }

        const db = admin.firestore();
        const fcm = admin.messaging();

        db.collection("users").where("role", "==", "chef").get()
            .then((users) => {
                users.forEach((user) => {
                    const msg = {
                        notification: {
                            title: "Nouvelle Commande",
                            body: content,
                            badge: "1",
                            sound: "default",
                        },
                    };


                    if (user.data().token) {
                        const token = user.data().token;
                        fcm.sendToDevice(token, msg)
                            .then((response) => {
                                console.log("message Success:", response);
                            })
                            .catch((error) => {
                                console.log("Error sending message:", error);
                            });
                    } else {
                        console.log("Can not find pushToken target user");
                    }
                });
            });
    });

exports.onStatusUpdated = functions.region("europe-west1")
    .firestore.document("order/{orderId}").onUpdate((change, context) => {
        const oldDoc = change.before.data();
        const doc = change.after.data();
        if(oldDoc.status==doc.status){
            return;
        }else{
            let content;
        let title;

        if (doc.orderLocation == 0) {
            content = `Table N. ${doc.tableAdress} - Total : ${doc.grandTotal} FBU`;
        } else if (doc.orderLocation == 1) {
            content = `Adress : ${doc.tableAdress} - Total : ${doc.grandTotal} FBU`;
        }

        if (doc.status == 1) {
            return;
        } else if (doc.status == 2) {
            title = "Votre commande a été confirmée";
        } else if (doc.status == 3) {
            title = "Votre commande est en cours de préparation";
        } else if (doc.status == 4) {
            title = "Votre commande est servie. Bon appétit!";
        }

        const db = admin.firestore();
        const fcm = admin.messaging();

        db.collection("users").doc(doc.userId).get()
            .then((user) => {
                const msg = {
                    notification: {
                        title: title,
                        body: content,
                        badge: "1",
                        sound: "default",
                    },
                };

                if (user.data().token) {
                    const token = user.data().token;
                    fcm.sendToDevice(token, msg)
                        .then((response) => {
                            console.log("message Success:", response);
                        })
                        .catch((error) => {
                            console.log("Error sending message:", error);
                        });
                } else {
                    console.log("Can not find pushToken target user");
                }
            });
        }
        
    });