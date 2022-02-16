my_widget_script =
{
    initDynamicContent: function (parsedJson) {
        // for (var i = 0; i < parsedJson.addedRows; i++) {
        // };
    },

    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
        }
    },

    setUpInitialState: function () {
        $("#DOB").on("change", (e)=> {
            this.printPND_days();
            this.getPND_today();
        });

        this.printPND_days();
        this.getPND_today();
        this.resize();
    },
    
    resize: function () {
        //resize the container
        this.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var dynamicContent = {};
        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

    getPND_today: function () {
        var $DOBVal = $("#DOB").val();

        if($DOBVal){
            var startDate = luxon.DateTime.fromISO($DOBVal).startOf("day");
            var todayDate = luxon.DateTime.now().startOf("day")
            var dateDiff_days = todayDate.diff(startDate, "days").as("day");
            // console.log(dateDiff_days);
    
            var pndTodayString = ".pnd.pnd" + dateDiff_days;
            var pndNotTodayString = ".pnd:not(.pnd" + dateDiff_days + ")";
    
            $(pndTodayString).css("color", "red");
            $(pndNotTodayString).css("color", "black");
    
            $(".pndToday").text(dateDiff_days);

            // This prints at the top what needs to be done today and switches the Mass and AGD selector 
            this.updateToDoStatus(dateDiff_days);
            this.updateCycleStatus(dateDiff_days);
    
            return(dateDiff_days);
        } else {
            this.switchMassTable($("#massSelect").val());
        }
    },
    
    // dateInputVal needs to be in "yyyy-mm-dd" format, such as what comes out of date input
    getPND: function (dateInputVal, DOBisDay = 0) {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var textOutput;
        var DOB_val = $("#dateOfBirth").val()
        if(DOB_val){
            if(dateInputVal){
                var compDate = luxon.DateTime.fromISO(dateInputVal).startOf("day");
                var DOB = luxon.DateTime.fromISO(DOB_val).startOf("day").minus({ days: DOBisDay });
                var pnd = compDate.diff(DOB, "days").as("day");
                // console.log(pnd);
                textOutput = pnd;
            } else {
                textOutput = "[Enter Date]";
            }
        } else {
            textOutput = "[Enter DOB]";
        }
        
        return textOutput;
    },

    updateToDoStatus: function (PND_today) {
        // TO DO - Change these to match your tasks and output divs
        var $toDoStatus = $(".toDo_status");
        if ($.inArray(PND_today, [28, 35, 42, 49, 56, 63]) !== -1)  { //if PND_today is one of these values
            $toDoStatus.html("<span style='color:blue'>Take mass today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            this.switchMassTable("pnd"+PND_today);
        } else if ($.inArray(PND_today, [22, 23, 24, 70, 71, 72]) !== -1) {
            $toDoStatus.html("<span style='color:blue'>Take mass and AGD today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            this.switchMassTable("pnd"+PND_today);
        } else if (PND_today === 21) {
            $toDoStatus.html("<span style='color:blue'>Wean and take mass today - enter in litter widget</span>");
            $("#massSelect").val("");
            this.switchMassTable("");
        } else {
            $toDoStatus.html("<em>No mass or AGD today</em>");
            $("#massSelect").val("");
            this.switchMassTable($("#massSelect").val());
        }
    },

    updateCycleStatus: function (PND_today){
        var $cycling_status = $(".cycling_status");
        if(PND_today >= 70 && PND_today <= 91){ // TO DO - change this for the PNDs that you want to cycle between
            $cycling_status.css("background-color", "yellow");
        } else {
            $cycling_status.css("background-color", "none");
        }
    },

    /**
     * This function takes a startDateVal from a date input and adds a certain 
     * numDays (number of days), and replaces the text in the $newDate element 
     * which can be either an id or a class with date string of that addition
     * 
     * @param {*} $startDateVal - the value from the data input
     * @param {*} $newDateClass - the element where the text with the date string will be printed. jQuery obj
     * @param {*} numDays - number of days to add 
    **/
    addDays: function ($startDateVal, $newDateClass, numDays) {
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toISODate();
        $newDateClass.text(newDate);
    },

    printPND_days: function () {
        // If there's a DOB
        if($("#DOB").val()){
            // TO DO - change this to include all PNDs that you need to print
            var pndDays = [21, 22, 23, 24, 28, 35, 42, 49, 56, 63, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91]
            
            for(i = 0; i < pndDays.length; i ++ ) { 
                //For each PND
                var pnd = pndDays[i];
                // Run the addDays function and update elements that have the .pnd class and the .pnd# corresponding to the pnd with the date string
                this.addDays($("#DOB").val(), $(".pnd"+pnd), pnd);
            }
        }

        this.resize();
    },
};