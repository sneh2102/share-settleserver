const {CronTime} = require('cron-time-generator');
 
function calculatePeriodFromString(settlementPeriod){
    let parts = settlementPeriod.split(" ");
    let numerical = parseInt(parts[0]);
    let unit = parts[1].toLowerCase();
 
    let days = getNumberOfDays(numerical, unit);
    
    // not valid numercials or units
    if(numerical < 0 || isNaN(numerical) || !isValidUnit(unit)){
        return null;
    }
 
    let timeUnits = getNumberOfDays(numerical, unit);
    let dateObj = getDate(timeUnits, unit);
    return dateObj;
}
 
function getDate(timeUnits, unit){
    let dateObj = {};
    if(!isValidUnit(unit)){
        return null;
    }
    else if(unit == "minute" || unit == "minutes"){
        dateObj = CronTime.every(timeUnits).minutes();
    } else {
        dateObj = CronTime.every(timeUnits).days();
    }
    return dateObj;
}
 
function isValidUnit(unit){
    let units = ["minute", "minutes", "day", "days", "week", "weeks", "month", "months", "year", "years"];
    if(units.includes(unit)){
        return true;
    }
    return false;
}

// get days based on the unit and value
function getNumberOfDays(numerical, unit){
    let daysInWeek = 7;
    let avgDaysInMonth = 30;
    let avgDaysInYear = 365;

    if(!isValidUnit(unit)){
        return 0;
    }
 
    let numDays = 0;
    switch(unit){
        case "week":
        case "weeks":
            numDays = daysInWeek*numerical;
            break;
        case "month":
        case "months":
            numDays = avgDaysInMonth*numerical;
            break;
        case "year":
        case "years":
            numDays = avgDaysInYear*numerical;
            break;
        default:
            numDays = numerical;
            break;
    }
    return numDays;
}
 
module.exports = {calculatePeriodFromString, getDate, getNumberOfDays};