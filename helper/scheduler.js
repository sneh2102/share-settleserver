const schedule = require('node-schedule');

const {makeSettlement} = require('./makeSettlement');
const split = require('./spliting');
const {processPayment} = require('../PaymentProcessor/processor');
const {CronTime} = require('cron-time-generator');
const {calculatePeriodFromString, getDate} = require('./dateConversion');

const user = require('../Models/userModel');
const group = require('../Models/groupModel');
const notificationHandler = require('./NotificationHandler');

// create a job based on the settlement period (a cron expression)
const jobForSettlement = async (settlementPeriod, groupId) => {

        const date = calculatePeriodFromString(settlementPeriod);
        console.log("Date:  ",date);
        const job = schedule.scheduleJob(date, async function(){
        console.log("settlement job started");
        groupObj = await group.findById(groupId);

        // no group present
        if(!groupObj){
            console.log("No group is present");
            console.log("Cancelling the job");
            // cancel associated scheduler
            job.cancel();
            return;
        }

        // no members present in the group
        if(groupObj.members.length == 0){
            console.log("No group members present in the group");
            console.log("Cancelling the job as no members are present");
            // cancel associated scheduler
            job.cancel();
            return;
        }
        
        // split the expenses among the members
        settlementAmountArray = split(groupObj.groupExpensesList[0]);
        
        // payment processing and settlement between members
        settlementAmountArray.forEach(async function(settlementInfo){

            const action = "settlement";
            let status = "successful";

            const senderEmail = settlementInfo[0];
            const receiverEmail = settlementInfo[1];
            const amount = settlementInfo[2];

            const senderName = await getUserFromEmail(senderEmail);
            const receiverName = await getUserFromEmail(receiverEmail);

            // if there is no amount to settle then return
            if(amount == 0){
                return;
            }

            // settlementInfo consists of these information -> from, to, amount
            let paymentReq = {
                body:{
                    sender: senderEmail,
                    receiver: receiverEmail,
                    amount: amount
                }
            };
            let paymentRes = await processPayment(paymentReq);

            console.log("payment res", paymentRes);
            // retry payment if failed
            if(paymentRes.error){
                console.log("Error in payment processor");

                let retryCount = 3;
                console.log("retrying payment");
                while(retryCount > 0){
                    retryCount--;
                    paymentRes = await processPayment(paymentReq);
                    if(paymentRes.error){
                        break;
                    }
                }

                if(paymentRes.error){
                    console.log("Payment failed");
                    status = "failed";

                    // send notifications
                    pushNotification(senderEmail, senderName, receiverEmail, receiverName, amount, groupObj.name, action, status);
                    return;
                }
            }

            console.log(`making settlement for everyone in group id: ${groupObj.name}`);

            let settlementReq = {
                body:{
                    id: groupId,
                    From: senderEmail,
                    To: receiverEmail,
                    Amount: amount
                }
            }
            // make settlement
            let settlementRes = makeSettlement(settlementReq);

            // retry settlement if failed
            if(settlementRes.error){
                console.log("Error in making settlement");
                retryCount = 3;
                while(retryCount > 0){
                    retryCount--;
                    console.log("retrying settlement");
                    settlementRes = makeSettlement(settlementReq);
                    if(!settlementRes.error){
                        break;
                    }
                }
            }

            if(!settlementRes.error){
                console.log("Settlement successful");
                status = "successful";
            }
            else{
                console.log("Settlement failed");
                status = "failed";
            }

            // send notifications
            pushNotification(senderEmail, senderName, receiverEmail, receiverName,amount, groupObj.name, action, status);
        });
    });
};


// create a scheduler for email notifications for reminding users to settle their expenses
// notifications are sent 2 days before the settlement period
const jobForEmailNotification = async (numberOfDays,unit, groupId) => {

    const date = getDate(numberOfDays,unit)
    const jobId = schedule.scheduleJob(date, async function(){
     const groupObj = await group.findById(groupId);
     console.log("Group: -----------------------------",groupObj);
        console.log("email notification job started for group: ",groupObj.name);

        if(!groupObj){
            console.log("No group is present");
            console.log("Cancelling the job");
            // cancel associated scheduler
            jobId.cancel();
            return;
        }

        // no members present in the group
        if(groupObj.members.length == 0){
            console.log("No group members present in the group");
            console.log("Cancelling the job as no members are present");
            // cancel associated scheduler
            jobId.cancel();
            return;
        }

        // send email notifications to all the members
        settlementAmountArray = split(groupObj.groupExpensesList[0]);

        settlementAmountArray.forEach(async function(settlementInfo){
            const senderEmail = settlementInfo[0];
            const receiverEmail = settlementInfo[1];
            const amount = settlementInfo[2];

            if(amount == 0){
                return;
            }
            const senderName = await getUserFromEmail(senderEmail);
            const receiverName = await getUserFromEmail(receiverEmail);

            const action = "settlementReminder";

            // send notifications
            pushNotification(senderEmail, senderName, receiverEmail, receiverName, amount, groupObj.name, action, null);
        });
    });
}

async function getUserFromEmail(userEmail){
    console.log(userEmail);
    const userObj = await user.findOne({email: userEmail});
    console.log(userObj.email);
    if(!userObj){
        return null;
    }
    return userObj.name;
}

async function pushNotification(senderEmail, senderName, receiverEmail, receiverName, amount, groupName, action, status){
    // send notification to sender
    notificationHandler({
        email: senderEmail,
        user1: senderName,
        groupName: groupName,
        action: action,
        user2: receiverName,
        status: status,
        amount: amount,
        date: new Date()
    });

    // send notification to receiver
    notificationHandler({
        email: receiverEmail,
        user1: senderName,
        groupName: groupName,
        action: action,
        user2: receiverName,
        status: status,
        amount: amount,
        date: new Date()
    });
}

module.exports = {jobForSettlement, jobForEmailNotification};