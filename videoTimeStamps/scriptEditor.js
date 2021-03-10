my_widget_script =
{
    // Variables
    _numEntries: 0,
    _numExits: 0,
    _duration: NaN,
    _fileName: "",
    _startState: "",
    _vid: document.getElementById("videoPlayer"),
    _timeOffNest: 0,
    _timeOnNest: 0,
    _stampTimes: [],
    _stampStates: [],
    _allDurations: [],
    _entryStamps: [],
    _exitStamps: [],
    _entryDurs: [],
    _exitDurs: [],
    _percOffNest: 0,
    _percOnNest: 0,

    init: function (mode, json_data) {
        //this method is called when the form is being constructed
        // parameters
        // mode = if it equals 'view' than it should not be editable
        //        if it equals 'edit' then it will be used for entry
        //        if it equals 'view_dev' same as view,  does some additional checks that may slow things down in production
        //        if it equals 'edit_dev' same as edit,   does some additional checks that may slow things down in production

        // json_data will contain the data to populate the form with, it will be in the form of the data
        // returned from a call to to_json or empty if this is a new form.
        //By default it calls the parent_class's init.

        //uncomment to inspect and view code while developing
        //debugger;

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;
        window.onresize = this.GoogleChartTimeLine;

        //Define behavior when buttons are clicked or checkboxes/selctions change
        this.addEventListeners();

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        // Add * and # to mark required field indicators
        this.addRequiredFieldIndicators();

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode);

        this.GoogleChartTimeLine();
    },
    
    to_json: function () {
        //should return a json string containing the data entered into the form by the user
        //whatever is return from the method is persisted in LabArchives.  must not be binary data.
        //called when the user hits the save button, when adding or editing an entry

        //Acquire input data from the form using the parent_class.to_json() function
        var widgetJsonString = this.parent_class.to_json();

        //Get information about any dynamic content that may have been created
        var dynamicContent = this.getDynamicContent();

        // Add widgetData and any additional dynamic content to an output object
        // Will be accessed within the init and from_json methods
        var output = { 
            widgetData: JSON.parse(widgetJsonString),
            fileName: dynamicContent.fileName,
            startState: dynamicContent.startState,
            duration: dynamicContent.duration,
            numExits: dynamicContent.numExits,
            numEntries: dynamicContent.numEntries,
            stampTimes: dynamicContent.stampTimes,
            stampStates: dynamicContent.stampStates,
            allDurations: dynamicContent.allDurations
        };

        //uncomment to check stringified output
        //console.log("to JSON", JSON.stringify(output));

        // return stringified output
        return JSON.stringify(output);
    },

    from_json: function (json_data) {
        //populates the form with json_data

        // all data in string format within json_data is parsed into an object parsedJson
        var parsedJson = JSON.parse(json_data);

        //use parsedJson to get widgetData and turn into a string
        //parent class uses the widget data to fill in inputs
        this.parent_class.from_json(JSON.stringify(parsedJson.widgetData));
    },

    /**
     * In preview, the form is populated with test data when the
     * parent_class.test_data() function is called. This randomly selects options for 
     * dropdown select menus, radio buttons, and checkboxes.
     */
    test_data: function () {
        //during development this method is called to populate your form while in preview mode

        // ORIGINAL LABARCHIVES RETURN FOR TEST DATA
        //return this.parent_class.test_data();

        // CUSTOM TEST DATA

        //store the outcome of the the test data within the testData variable
        var testData = JSON.parse(this.parent_class.test_data());

        var stampStates = ["entry", "exit", "entry", "exit", "entry", "exit", "entry"];
        var stampTimes = [0, 1, 3, 6, 10, 15, 21];
        var allDurations = [1, 2, 3, 4, 5, 6, 979];

        //If no additional dynamic content 
        var output = {
            fileName: "test", 
            widgetData: testData,
            startState: "on",
            duration: 1000,
            numEntries: 3,
            numExits: 3,
            stampStates: stampStates,
            stampTimes: stampTimes,
            allDurations: allDurations
        };

        //Add additional content to match the objects in to_json
        //var output = { widgetData: testData, addedRows: 2 }; //When in development, initialize with 2 addedRows

        //return the stringified output for use by the init function
        return JSON.stringify(output);
    },

    /**
     * This function determines whether or not the user is allowed to save the widget to the page
     * 
     * The original LabArchives function checks for fields that have _mandatory appended to the name attribute
     * 
     * The custom function checks for fields with the required attribute. If any of these fields are blank, 
     * an alert is returns that provides a fail log with the ids of the elements that are missing. If there are
     * no blank required fields, an empty array is returned.
     * 
     * source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     */
    is_valid: function (b_suppress_message) {
        //called when the user hits the save button, to allow for form validation.
        //returns an array of dom elements that are not valid - default is those elements marked as mandatory
        // that have no data in them.
        //You can modify this method, to highlight bad form elements etc...
        //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
        //Returning an empty array [] or NULL equals no error
        //TO DO write code specific to your form

        //ORIGINAL LABARCHIVES IS_VALID FUNCTION
        //return this.parent_class.is_valid(b_suppress_message);

        //CUSTOM FUNCTION TO CHECK REQUIRED ITEMS
        var fail = false; //begin with a fail variable that is false
        var fail_log = ''; //begin with an empty fail log
        var name; //create a name variable

        //search the_form for all elements that are of type select, textarea, or input
        $('#the_form').find('select, textarea, input').each(function () {
            if (!$(this).prop('required')) { //if this element does not have a required attribute
                //don't change anything (fail remains false)
            } else { //if there is a required attribute
                if (!$(this).val()) { //if there is not a value for this input
                    fail = true; //change fail to true
                    name = $(this).attr('id'); //replace the name variable with the name attribute of this element
                    fail_log += name + " is required \n"; //add to the fail log that this name is required
                }

            }
        });

        if (fail) { //if fail is true (meaning a required element didn't have a value)
            return alert(fail_log); //return the fail log as an alert
        } else {
            var noErrors = [];
            return noErrors;
        } //otherwise, return empty array
    },

    is_edited: function () {
        //should return true if the form has been edited since it was loaded or since reset_edited was called
        return this.parent_class.is_edited();
    },

    reset_edited: function () {
        //typically called have a save
        //TO DO write code specific to your form
        return this.parent_class.reset_edited();
    },

    // ********************** CUSTOM METHODS USED BY INIT METHOD **********************
    parseInitJson: function (json_data) {
        var jsonString;
        //check if string or function because preview test is function and page is string
        if (typeof json_data === "string") {
            jsonString = json_data;
        } else {
            jsonString = json_data();
        }
        //Take input string into js object to be able to use elsewhere
        var parsedJson = JSON.parse(jsonString);
        return (parsedJson);
    },

    /**
     * TO DO: edit this function to reinitialize any dynamic content that is not explicity
     * defined within the HTML code. 
     * 
     * This function requires the parsedJson object.
     */
    initDynamicContent: function (parsedJson) {
        // Fill filePath in widget
        $(".filePath").text(parsedJson.fileName);
        // Update fileName variable
        my_widget_script._fileName = parsedJson.fileName;
        $(".clearOnLoad").text("");

        my_widget_script._numExits = parsedJson.numExits;
        my_widget_script._numEntries = parsedJson.numEntries;

        // Update duration
        my_widget_script._duration = parsedJson.duration;
        $("#videoDur").val(my_widget_script._duration);

        var startState = parsedJson.startState;
        // Update global startState variable
        my_widget_script._startState = parsedJson.startState;
        my_widget_script.changeToState(my_widget_script._startState);
        // my_widget_script.resetStamps(startState);

        // Update global arrays
        if(parsedJson.stampStates) {
            my_widget_script._stampStates = parsedJson.stampStates;
        }
        if(parsedJson.stampTimes){
            my_widget_script._stampTimes = parsedJson.stampTimes;
        }
        if(parsedJson.allDurations){
            my_widget_script._allDurations = parsedJson.allDurations;
        }

        for(i = 0; i < my_widget_script._stampStates.length; i++ ){
            var movement = "", time = NaN, duration = NaN;
            movement = my_widget_script._stampStates[i];
            time = my_widget_script._stampTimes[i];
            duration = my_widget_script._allDurations[i];
            var $stampsDiv = $(".stampsDiv");

            if(movement == "exit") {
                var newState = "OFF";
                var stateForButton = "off";
            }else if(movement == "entry"){
                var newState = "ON";
                var stateForButton = "on";
            } else {
                var newState = "";
                var stateForButton = "";
            }

            my_widget_script.makeStampRow($stampsDiv, movement, newState, time, duration);

            if(i == my_widget_script._stampStates.length - 1){
                my_widget_script.changeToState(stateForButton);
            }
        }

        my_widget_script.calcValues();
    },

    /**
     * TO DO: edit this function to define how the HTML elements should be adjusted
     * based on the current mode.
     * 
     * Here, a subset of buttons are disabled when the widget is not being edited.
     * There may be other elements that should be shown/hidden based on the mode
     */
    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
            $(".hideView").hide();
            $(".bookmarkLink").parent().addClass("noPlay");
        } else {
            $(".hideEdit").hide();
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        $("#myfile").on("input", function () {
            // Get selected file
            var file = document.getElementById('myfile').files[0];
            //console.log(file);

            var proceed = false;
            if( ! my_widget_script._fileName ){ // if no current file name
                proceed = true;
            } else if( file.name == my_widget_script._fileName) { // if matches current file name
                proceed = true;
            } else { // confirm if doesn't match
                proceed = confirm("This is a different file than was previously analyzed in this widget. Do you want to proceed?");
            }

            if( proceed ){
                $(".filePath").text(file.name);
                my_widget_script._fileName = file.name;
                
                var fileURL = URL.createObjectURL(file);
                // Add file URL to source for video player
                my_widget_script._vid.src = fileURL;
    
                // var vid = document.getElementById("videoPlayer");
                my_widget_script._vid.playbackRate = $("#changeSpeed").val();
    
                $("#addStampButton").removeAttr("disabled");
                $("#removeStampButton").removeAttr("disabled");
            }

            my_widget_script.resize();
        });

        $("#videoPlayer").on("durationchange", function () {
            my_widget_script.getDuration();
            var lastDuration = my_widget_script._duration - my_widget_script._stampTimes[my_widget_script._stampTimes.length - 1];
            my_widget_script._allDurations[my_widget_script._allDurations.length - 1] = lastDuration;
            $(".stampRow").last().find(".duration").text(lastDuration.toFixed(2));
            my_widget_script.GoogleChartTimeLine();
            my_widget_script.resize();
        });

        $("#getDur").on("input", function () {
            my_widget_script.getDuration();
            var lastDuration = my_widget_script._duration - my_widget_script._stampTimes[my_widget_script._stampTimes.length - 1];
            my_widget_script._allDurations[my_widget_script._allDurations.length - 1] = lastDuration;
            $(".stampRow").last().find(".duration").text(lastDuration.toFixed(2));
            my_widget_script.GoogleChartTimeLine();
            my_widget_script.resize();
        });

        $("#videoDur").on("input", function () {
            my_widget_script.getDuration();
            var lastDuration = my_widget_script._duration - my_widget_script._stampTimes[my_widget_script._stampTimes.length - 1];
            my_widget_script._allDurations[my_widget_script._allDurations.length - 1] = lastDuration;
            $(".stampRow").last().find(".duration").text(lastDuration.toFixed(2));
            my_widget_script.GoogleChartTimeLine();
            my_widget_script.resize();
        });

        $("#changeSpeed").on("input", function () {
            my_widget_script._vid.playbackRate = $(this).val();
        });

        $("#startState").on("input", function () {
            if(! my_widget_script._numEntries > 0 &&  ! my_widget_script._numExits > 0){
                var proceed = true;
            } else {
                var proceed = confirm("Changing this will remove all stamps. Do you wish to proceed?");
            }
            if(proceed){
                var startState = $(this).val();
                my_widget_script._startState = $(this).val();
                my_widget_script.resetStamps(startState);                
            }
        });

        $("#addStampButton").on("click", function () {
            var currentState = $(this).data("state");
            if(currentState){
                my_widget_script.addStampFuncs(currentState);
            } else {
                alert("Enter the starting state of the dam");
            }
        });

        $("#removeStampButton").on("click", function () {
            var currentState = $("#addStampButton").data("state");
            my_widget_script.removeStampFuncs(currentState);
        });

        $("#clearStamps").on("click", function () {
            var proceed = confirm("Are you sure that you want to remove all time stamps?");
            if (proceed) {
                my_widget_script.resetStamps(my_widget_script._startState);
            }
        });

        $('#copyDursButton').on("click", function () {
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            my_widget_script.copyDurationsFuncs($errorMsg, $divForCopy);
        });

        $('#copyTimesButton').on("click", function () {
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            my_widget_script.copyTimeStampsFuncs($errorMsg, $divForCopy);
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('#toCSV').on("click", function () {
            var fileName = "damVideoMonitor";
            var tableID = "outTable";
            var $errorMsg = $("#errorMsg"); 
            
            my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            var $copyHead = $("#copyHead");
            var $tableToCopy = $("#outTable");
            var $tableDiv = $(".outTableDiv");
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
        });

        // Output table calculations
        $(".simpleCalc").each(function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        }).on("input", function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });

        //Jump to place in video and select add stamp button if there's a video file
        $(document).on('click', ".stampMin:not(.noPlay) a", function() {
            var vid = document.getElementById("videoPlayer");
            if(vid.src){
                vid.currentTime = $(this).attr('rel');
                vid.play();
                $("#videoPlayer").focus();
                $("#addStampButton").select();
            } else {
                alert("Select a Video File");
            }
        });
    },

    changeToState: function (state) {
        if(state == "off"){
            $("#addStampButton").val("Dam Enters Nest").data("state", "off");
        } else if(state == "on") {
            $("#addStampButton").val("Dam Exists Nest").data("state", "on");
        } else {
            $("#addStampButton").val("[Enter Start State]").data("state", "");
        }
    },

    toggleState: function (currentState) {
        if (currentState == "off") {
            my_widget_script.changeToState("on");
        } else if (currentState == "on") {
            my_widget_script.changeToState("off");
        }
    },

    addStampFuncs: function (currentState){
        if(my_widget_script._vid.src){
            my_widget_script.getDuration();
            var $stampsDiv = $(".stampsDiv");
            var timeInSec = parseFloat(my_widget_script.getTimeStamp());

            if(timeInSec < my_widget_script._duration){         
                var $previousRow = $stampsDiv.find(".stampRow").last();

                // Get previous stamp
                var previousTime = my_widget_script._stampTimes[my_widget_script._stampTimes.length - 1];

                if(timeInSec > previousTime){ // if after previous stamp
                    // Get the time between this stamp and previous stamp
                    var lastDuration = timeInSec - previousTime;
                    // Replace duration in previous row
                    $previousRow.find(".duration").text(lastDuration.toFixed(2));
                    // Replace duration in durations array
                    my_widget_script._allDurations[my_widget_script._allDurations.length - 1] = lastDuration;

                    // Add time to all stamps array
                    my_widget_script._stampTimes[my_widget_script._stampTimes.length] = timeInSec;

                    // Get the duration from this time to the end of the recording
                    var thisDuration = my_widget_script._duration - timeInSec;
                    // Add this duration to the all durations array
                    my_widget_script._allDurations[my_widget_script._allDurations.length] = thisDuration

                    if (currentState == "on"){
                        var movementType = "exit";
                        var newState = "OFF";
                    } else if(currentState == "off"){
                        var movementType = "entry";
                        var newState = "ON";
                    }

                    my_widget_script._stampStates[my_widget_script._stampStates.length] = movementType;

                    my_widget_script.makeStampRow($stampsDiv, movementType, newState, timeInSec, thisDuration);

                    my_widget_script.addOneToVar(movementType);
                    my_widget_script.calcValues();
                    my_widget_script.toggleState(currentState);

                    // console.log(my_widget_script._stampTimes, my_widget_script._stampStates, my_widget_script._allDurations);
                } else {
                    my_widget_script._vid.pause();
                    alert("Must be after previous stamp");
                }
            }
            
            my_widget_script.resize();
        }
    },

    makeStampRow: function ($div, className, newState, timeInSec, thisDuration){
        var timeStamp = my_widget_script.getTimeFromSec(timeInSec);

        $div.append(
            $("<div/>", {
                "class": "row stampRow " + className
            }).append(
                $("<div/>", {
                    "class": "col state " + className
                }).append(newState)
            ).append(
                $("<div/>", {
                    "class": "col stamp " + className,
                    "data-movement": className
                }).append(timeInSec.toFixed(2))
            ).append(
                $("<div/>", {
                    "class": "col stampMin " + className
                }).append(
                    "<a href='javascript:;' rel='" + timeInSec + "' class='bookmarkLink'>" + timeStamp + "</a>"
                )
            ).append(
                $("<div/>", {
                    "class": "col duration " + className
                }).append(thisDuration.toFixed(2))
            )
        );
    },

    removeStampFuncs: function (currentState) {
        if(my_widget_script._vid.src){
            if (currentState == "off"){
                var className = "exit";
                var currentNum = my_widget_script._numExits;
            } else if(currentState == "on"){
                var className = "entry";
                var currentNum = my_widget_script._numEntries;
            }

            if(currentNum > 0){
                my_widget_script.getDuration();
                $(".stampRow").last().remove();

                // Remove the last values from the arrays
                my_widget_script._stampTimes.pop();
                my_widget_script._stampStates.pop();
                my_widget_script._allDurations.pop();

                // Replace the last duration with time to end from last event
                var lastDuration = my_widget_script._duration - my_widget_script._stampTimes[my_widget_script._stampTimes.length - 1];
                my_widget_script._allDurations[my_widget_script._allDurations.length - 1] = lastDuration
                $(".stampRow").last().find(".duration").text(lastDuration.toFixed(2));

                // console.log(
                //     my_widget_script._stampTimes,
                //     my_widget_script._stampStates,
                //     my_widget_script._allDurations
                // );

                my_widget_script.toggleState(currentState);
                my_widget_script.removeOneFromVar(className);
                my_widget_script.calcValues();
                my_widget_script._vid.pause();
            } else {
                alert("No stamps to remove");
            }

            my_widget_script.resize();
        }
    },

    resetStamps: function (startState) {
        my_widget_script.changeToState(startState);

        // Reset parameters
        my_widget_script._numEntries = 0;
        my_widget_script._numExits = 0;
        my_widget_script._stampTimes = [];
        my_widget_script._stampStates = [];
        my_widget_script._allDurations = [];

        $(".stampRow").remove();

        if(startState == "off") {
            var startState = "exit";
            var newState = "OFF";
        } else if(startState == "on"){
            var startState = "entry";
            var newState = "ON";
        }

        my_widget_script.getDuration();
        my_widget_script.makeStampRow($(".stampsDiv"), startState, newState, 0, my_widget_script._duration);

        my_widget_script._stampTimes = [0];
        my_widget_script._stampStates = [startState];
        my_widget_script._allDurations = [my_widget_script._duration];

        my_widget_script.calcValues();
        my_widget_script.resize();
    },

    getDuration: function () {
        if($("#getDur").is(":checked") && my_widget_script._vid.src) {
                var duration = my_widget_script._vid.duration;
        } else {
            var duration = $("#videoDur").val();
            if (duration) {
                duration = parseFloat(duration);
            } else {
                duration = 3600;
            }
        }

        $("#videoDur").val(duration);
        my_widget_script._duration = duration;
        $(".videoDur_calc").text(duration);
    },

    getTimeStamp: function () {
        var timeStamp = "";
        if(my_widget_script._vid.src){
            var timeStamp = my_widget_script._vid.currentTime;
        }
        return (timeStamp)
    },

    getExistingText: function (txtarea) {
        var existingText = txtarea.value;
        if (existingText){
            existingText = existingText + "\n";
        }
        return (existingText)
    },

    addOneToVar: function (exitOrEntry) {
        if(exitOrEntry == "entry"){
            my_widget_script._numEntries++;
            // console.log(my_widget_script._numEntries);
        } else if(exitOrEntry == "exit"){
            my_widget_script._numExits++;
        }
    },

    removeOneFromVar: function (exitOrEntry) {
        if(exitOrEntry == "entry"){
            my_widget_script._numEntries--;
        } else if(exitOrEntry == "exit"){
            my_widget_script._numExits--;
        }
    },

    addOneToCounter: function ($counter) {
        var val = $counter.val();
        if (val){
            var count = parseInt(val);
        } else {
            var count = 0;
        }

        count = count + 1;
        $counter.val(count);
    },

    removeOneFromCounter: function ($counter) {
        var val = $counter.val();
        if(val > 0) {
            var count = parseInt(val);
            count = count - 1;
        } else {
            var count = 0;
        }
        $counter.val(count);
    },

    // return time as hh:mm:ss from a certain number of seconds
    getTimeFromSec: function (timeInSec) {
        var asDate = new Date();
        asDate.setHours(0, 0, timeInSec, 0);
        //console.log(asDate);
        var hours = ("0" + asDate.getHours()).slice(-2);
        var mins = ("0" + asDate.getMinutes()).slice(-2);
        var secs = ("0" + asDate.getSeconds()).slice(-2);
        var time = hours + ":" + mins + ":" + secs
        return(time)
    },

    getHoursMin: function (timeString) {
        timeString = timeString.split(":");
        var hours = parseInt(timeString[0], 10), mins = parseInt(timeString[1], 10);
        return( 
            split = {
                hours: hours,
                mins: mins
            }
        )
    },

    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForFormLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each(function () { //find element with class "needForFormLab"
            //alert($(this).val());
            $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            //alert($(this).val());
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });
    },

    adjustTextareaHeight: function (txtarea) {
        txtarea.style.height = "auto";
        txtarea.style.height = (txtarea.scrollHeight) + 'px';
        my_widget_script.resize();
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-4 text-left text-sm-right");

        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            my_widget_script.adjustTextareaHeight(this);
        });

        my_widget_script.calcValues();

        my_widget_script.resize();
    },

    /**
     * TO DO: edit this function to define which <div>s or other elements
     * should be adjusted based on the current width of the window
     */
    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var dynamicContent = {
            fileName: my_widget_script._fileName,
            startState: my_widget_script._startState,
            duration: my_widget_script._duration,
            numExits: my_widget_script._numExits,
            numEntries: my_widget_script._numEntries,
            stampTimes: my_widget_script._stampTimes,
            stampStates: my_widget_script._stampStates,
            allDurations: my_widget_script._allDurations
        };
        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

    /** -----------------------------------------------------------------------------
     * VALIDATE FORM ENTRY BEFORE COPYING OR SAVING TABLE TO CSV
     *
     * This function will check that elements with a class "needForTable"
     * are not blank. If there are blank elements, it will return false
     * and will post an error message "Please fill out all elements marked by a blue #"
     *
     * source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     * -----------------------------------------------------------------------------
     */
    data_valid_form: function () {
        var valid = true; //begin with a valid value of true
        //var fail_log = ''; //begin with an empty fail log
        //var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(this).attr('id'); //replace the name variable with the id attribute of this element
                //fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $("#errorMsg").html("");
        }

        return valid;
    },

    /**
     * This takes the value of the input for the $elToWatch and then updates the text of 
     * $elToUpdate to match whenever watchValue is called
     * @param {*} $elToWatch - jQuery object with the input element whose value will be used to update
     * @param {*} $elToUpdate - jQuery object of the element whose text will be updated based on the element to watch
     */
     watchValue: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
    },

    /**
    * This function takes form input and adds them to the corresponding
    * divs within the output table.
    * 
    * For elements that are blank or NaN, the function provides an output of NA
    * 
    * Calls the resize function at the end
    */
    calcValues: function () {
        my_widget_script.getDuration();

        $(".numEntries_calc").text(my_widget_script._numEntries);
        $(".numExits_calc").text(my_widget_script._numExits);

        my_widget_script._entryStamps = [];
        my_widget_script._entryDurs = [];
        my_widget_script._exitStamps = [];
        my_widget_script._exitDurs = [];
        my_widget_script._timeOnNest = 0;
        my_widget_script._timeOffNest = 0;
        my_widget_script._avgDurOnNest = 0;
        my_widget_script._avgDurOffNest = 0;

        // console.log(
        //     my_widget_script._stampTimes,
        //     my_widget_script._stampStates,
        //     my_widget_script._allDurations
        // );

        for(i = 0; i < my_widget_script._stampStates.length; i++ ){
            if(my_widget_script._stampStates[i] == "exit") {
                my_widget_script._exitStamps[my_widget_script._exitStamps.length] = my_widget_script._stampTimes[i];
                my_widget_script._exitDurs[my_widget_script._exitDurs.length] = my_widget_script._allDurations[i];
            }else if(my_widget_script._stampStates[i] == "entry"){
                my_widget_script._entryStamps[my_widget_script._entryStamps.length] = my_widget_script._stampTimes[i];
                my_widget_script._entryDurs[my_widget_script._entryDurs.length] = my_widget_script._allDurations[i];
            }
        }

        // Sum of off nest durations
        my_widget_script._timeOffNest = my_widget_script._exitDurs.reduce(function(a, b){
            return a + b;
        }, 0);

        // Sum of on nest durations
        my_widget_script._timeOnNest = my_widget_script._entryDurs.reduce(function(a, b){
            return a + b;
        }, 0);

        $(".timeOffNest_calc").text(my_widget_script._timeOffNest.toFixed(2));
        $(".timeOnNest_calc").text(my_widget_script._timeOnNest.toFixed(2));

        // Avg of off nest durations
        my_widget_script._avgDurOffNest = my_widget_script._timeOffNest / my_widget_script._exitDurs.length;
        
        // Avg of on nest durations
        my_widget_script._avgDurOnNest = my_widget_script._timeOnNest / my_widget_script._entryDurs.length;

        $(".avgDurOffNest_calc").text(my_widget_script._avgDurOffNest.toFixed(2));
        $(".avgDurOnNest_calc").text(my_widget_script._avgDurOnNest.toFixed(2));      
        
        my_widget_script._percOffNest = (my_widget_script._timeOffNest / my_widget_script._duration) * 100;
        my_widget_script._percOnNest = (my_widget_script._timeOnNest / my_widget_script._duration) * 100;
        
        $(".percOffNest_calc").text(my_widget_script._percOffNest.toFixed(2));
        $(".percOnNest_calc").text(my_widget_script._percOnNest.toFixed(2));
        
        // console.log(
        //     my_widget_script._exitStamps,
        //     my_widget_script._exitDurs,
        //     my_widget_script._entryStamps,
        //     my_widget_script._entryDurs,
        //     my_widget_script._timeOffNest,
        //     my_widget_script._timeOnNest,
        //     my_widget_script._percOffNest,
        //     my_widget_script._percOnNest,
        // );

        $("#outTable tr").each(function () { //for each row
            $("td", this).each(function () { //for each cell
                var value = $(this).text(); //get the value of the text
                if (value === "" || value === "NaN") { //if blank or NaN
                    $(this).text("NA"); //make NA
                }
            })
        });

        my_widget_script.GoogleChartTimeLine();

        //resize the tableDiv
        my_widget_script.resize();

    },

    /**
     * This function takes a csv element and filename that are passed from the
     * exportTableToCSV function.
     * 
     * This creates a csvFile and builds a download link that references this file.
     * The download link is "clicked" by the function to prompt the browser to 
     * download this file
     * 
     * source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
     * 
     * @param {*} csv - This is the csv passed from the exportToCSV function
     * @param {*} filename - This is the name of the file passed from exportToCSV function
     */
    downloadCSV: function (csv, filename) {
        var csvFile;
        var downloadLink;

        // CSV file
        csvFile = new Blob([csv], { type: "text/csv" });

        // Download link
        downloadLink = document.createElement("a");

        // File name
        downloadLink.download = filename;

        // Create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);

        // Hide download link
        downloadLink.style.display = "none";

        // Add the link to DOM
        document.body.appendChild(downloadLink);

        // Click download link
        downloadLink.click();
    },
    
    /**
     * This function takes a filename and table name (both strings) as input
     * It then creates a csv element from the table
     * This csv element is passed to the downloadCSV function along with the filename
     * 
     * source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
     * @param {string} filename the name of the CSV file that will be downloaded
     * @param {string} table the id of the table that will be exported
     */
    exportTableToCSV: function (filename, table) {
        var csv = [];
        var datatable = document.getElementById(table);
        var rows = datatable.querySelectorAll("tr");

        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");

            for (var j = 0; j < cols.length; j++) {
                var cellText = '"' + cols[j].innerText + '"'; //add to protect from commas within cell
                row.push(cellText);
            };

            csv.push(row.join(","));
        }

        var exitStamps = my_widget_script._exitStamps;
        var entryStamps = my_widget_script._entryStamps;

        var row = [];
        row.push("OnTimes");
        row.push("OffTimes");
        csv.push(row.join(","));

        for(i = 0; i < exitStamps.length || i < entryStamps.length; i++){
            if(exitStamps[i]) {
                var exitTime = exitStamps[i]; 
            } else { var exitTime = "NA"}

            if(entryStamps[i]) {
                var entryTime = entryStamps[i]; 
            } else { var entryTime = "NA"}

            var row = [];
            row.push(entryTime);
            row.push(exitTime);
            csv.push(row.join(","));
        }

        var exitDurs = my_widget_script._exitDurs;
        var entryDurs = my_widget_script._entryDurs;

        var row = [];
        row.push("OnDurations");
        row.push("OffDurations");
        csv.push(row.join(","));

        for(i = 0; i < exitDurs.length || i < entryDurs.length; i++){
            if(exitDurs[i]) {
                var exitDur = exitDurs[i]; 
            } else { var exitDur = "NA"}

            if(entryDurs[i]) {
                var entryDur = entryDurs[i]; 
            } else { var entryDur = "NA"}

            var row = [];
            row.push(entryDur);
            row.push(exitDur);
            csv.push(row.join(","));
        }

        // Download CSV file
        this.downloadCSV(csv.join("\n"), filename);
    },

    /**
     * This function creates a temporary textarea and then appends the contents of the
     * specified table body to this textarea, separating each cell with a tab (\t).
     * Because the script editor in LA is within a <textarea> the script cannot contain
     * the verbatim string "textarea" so this must be separated as "text" + "area"
     * to avoid errors.
     * 
     * If copying a table that has form inputs, then need to refer to the children of 
     * <td> tags, and get the values by using .val() instead of .text()
     * 
     * If copying a table that could have multiple table rows (<tr>), the use the 
     * \n new line separator
     * 
     * The temporary <textarea> is appended to the HTML form, focused on, and selected.
     * Note that this moves the literal page focus, so having this append near the 
     * button that calls this function is best. After the <textarea> is copied, it is
     * then removed from the page.
     * @param {*} $table - jQuery object for the table that will be copied
     * @param {*} copyHead - true/false for whether or not the table head should be copied
     */
    copyTable: function ($table, copyHead, $divForCopy) {
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";
        if (copyHead) {
            $table.find("thead").children("tr").each(function () { //add each child of the row
                var addTab = "";
                $(this).children().each(function () {
                    $temp.text($temp.text() + addTab + $(this).text());
                    addTab = "\t";
                });
            });
            addLine = "\n";
        }

        $table.find("tbody").children("tr").each(function () { //add each child of the row
            $temp.text($temp.text() + addLine);
            var addTab = "";
            $(this).find("td").each(function () {
                if ($(this).text()) {
                    var addText = $(this).text();
                } else {
                    var addText = "NA"
                }
                $temp.text($temp.text() + addTab + addText);
                addTab = "\t";
                addLine = "\n";
            });
        });

        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    copyDurations: function ($divForCopy) {
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";

        $temp.text("OnDurations\tOffDurations");

        var exitDurs = my_widget_script._exitDurs;
        var entryDurs = my_widget_script._entryDurs;

        for(i = 0; i < exitDurs.length || i < entryDurs.length; i++){
            if(exitDurs[i]) {
                var exitDur = exitDurs[i]; 
            } else { var exitDur = "NA"}

            if(entryDurs[i]) {
                var entryDur = entryDurs[i]; 
            } else { var entryDur = "NA"}

            $temp.text($temp.text() + "\n" + entryDur + "\t" + exitDur);
        }

        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    copyTimeStamps: function ($divForCopy) {
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";

        $temp.text("OnTimes\tOffTimes");

        var exitStamps = my_widget_script._exitStamps;
        var entryStamps = my_widget_script._entryStamps;

        for(i = 0; i < exitStamps.length || i < entryStamps.length; i++){
            if(exitStamps[i]) {
                var exitTime = exitStamps[i]; 
            } else { var exitTime = "NA"}

            if(entryStamps[i]) {
                var entryTime = entryStamps[i]; 
            } else { var entryTime = "NA"}

            $temp.text($temp.text() + "\n" + entryTime + "\t" + exitTime);
        }

        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    /**
     * Set of functions when calcValuesButton clicked
     * Run data_valid_form
     * Calculate values
     */
    calcTableFuncs: function() {
        my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
        my_widget_script.calcValues();
    },

    /**
     * Set of functions when toCSVButton clicked
     * 
     * Checked if data is valid, then re-calculates values, exports the table to a CSV
     * Updates the error message accordingly
     * 
     * @param {string} fileName - fileName for the CSV that will be produced
     * @param {string} tableID - tableID as a string for the table that will be copied
     * @param $errorMsg - error message div as jQuery object
     */
    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) {
            my_widget_script.calcValues();
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    /**
     * The steps that should be taken when the copy data button is pressed
     * Checks if the $copyHead is checked, runs the calcValues function and then
     * checks if the data is valid. If it is, it shows the table, resizes, and then
     * copies the table (via a temporary textarea that is then removed). 
     * 
     * @param $copyHead - checkbox for whether or not to copy the table head as jQuery object
     * @param $tableToCopy - table to copy as jQuery object
     * @param $tableDiv - div containing table to copy
     * @param $errorMsg - error message div as jQuery object
     * @param $divForCopy - div where the output should copy to
     */
    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form();
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        my_widget_script.calcValues();

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            my_widget_script.resize(); //resize
            my_widget_script.copyTable($tableToCopy, copyHead, $divForCopy); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },

    copyDurationsFuncs: function ($errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form();

        my_widget_script.calcValues();

        if (data_valid) { //if data is valid
            my_widget_script.copyDurations($divForCopy); //copy durations
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },

    copyTimeStampsFuncs: function ($errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form();

        my_widget_script.calcValues();

        if (data_valid) { //if data is valid
            my_widget_script.copyTimeStamps($divForCopy); //copy durations
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },

    GoogleChartTimeLine: function () {
        google.charts.load("current", {packages:["timeline"]});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {

            var container = document.getElementById('example3.1');
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn({ type: 'string', id: 'Position' });
            dataTable.addColumn({ type: 'date', id: 'Start' });
            dataTable.addColumn({ type: 'date', id: 'End' });

            var startTime = $("#recTime").val();
            if(startTime){
                var splitTime = my_widget_script.getHoursMin(startTime);
                var startHour = splitTime.hours;
            } else{
                startHour = 0;
            }


            for(i = 0; i < my_widget_script._stampStates.length; i++ ){
                var movement = "", time = NaN, duration = NaN;
                movement = my_widget_script._stampStates[i];
                time = my_widget_script._stampTimes[i];
                duration = my_widget_script._allDurations[i];

                var state = ""
                if(movement == "exit"){
                    state = "OFF Nest"
                } else if(movement == "entry") {
                    state = "ON Nest"
                }

                dataTable.addRows([
                    [ state, new Date(0, 0, 0, startHour, 0, time), new Date(0, 0, 0, startHour, 0, time + duration) ]
                ]);
            }

            if(my_widget_script._startState == "off"){
                colors = ['#f4c8ce', '#ccdbf6']
            } else if(my_widget_script._startState == "on"){
                colors = ['#ccdbf6', '#f4c8ce']
            }
            var options = {
                hAxis: {
                title: 'Time'
                },
                colors: colors,
                avoidOverlappingGridLines: false
            };
            var container = document.getElementById("chart_div");
            var chart = new google.visualization.Timeline(container);
            chart.draw(dataTable, options);
        }
    }
};