my_widget_script =
{
    possibleMassDays: [],
    treatStart: NaN,
    treatEnd: NaN,

    init: function (mode, json_data) {
        //this method is called when the form is being constructed
        // parameters
        // mode = 'view' 'edit' 'view_dev' or 'edit_dev'

        // json_data will contain the data to populate the form with, it will be in the form of the data
        // returned from a call to to_json or empty if this is a new form.
        //By default it calls the parent_class's init.

        //uncomment to inspect and view code while developing
        //debugger;

        my_widget_script.createMassDivs();

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

        //Define behavior when buttons are clicked or checkboxes/selctions change
        this.addEventListeners();

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));
        
        // Set up the form based on previously entered form input
        this.setUpInitialState(parsedJson);
        
        //adjust form design and buttons based on mode
        this.adjustForMode(mode);
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
            numPupsStart: dynamicContent.numPupsStart,
            numPupsEnd: dynamicContent.numPupsEnd,
            tailMarksEnd: dynamicContent.tailMarksEnd,
            selectedDays: dynamicContent.selectedDays
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

        var tailMarksEnd = [];
        tailMarksEnd[0] = "<span style='color:blue'>Test</span>"
        tailMarksEnd[1] = "<span style='color:red'>Test2</span>"

        var tailMarksP9 = [];
        tailMarksP9[0] = "<span style='color:blue'>P9 Test</span>"
        tailMarksP9[1] = "<span style='color:red'>P9 Test2</span>"
        tailMarksP9[2] = "<span style='color:blue'>P9 Test3</span>"

        var output = {
            widgetData: testData,
            numPupsStart: 3,
            numPupsEnd: 2,
            tailMarksEnd: tailMarksEnd,
            selectedDays: [14, 15]
        }
        //return the stringified output for use by the init function
        return JSON.stringify(output);
    },

    /**
    * Determines whether or not the user is allowed to save the widget to the page
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

        $("input[type='date']").each(function () {
            var date = $(this).val();
            if(date){
                var validDate = my_widget_script.isValidDate(date);
                if(!validDate){
                    fail = true;
                    fail_log += "Please enter valid date in form 'YYYY-MM-DD'";
                }
            }
        });

        $("input[type='time']").each(function () {
            var time = $(this).val();
            if(time){
                var validtime = my_widget_script.isValidTime(time);
                if(!validtime){
                    fail = true;
                    fail_log += "Please enter valid time in form 'hh:mm' - 24 hr time";
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
        for (var i = 0; i < parsedJson.numPupsStart; i++) {
            var $avgMass = $(".avgMassStart");
            my_widget_script.createRow_startPara($avgMass);
        }

        for (var i = 0; i < parsedJson.numPupsEnd; i++) {
            my_widget_script.createRow_offDemo();

            var mouseNum = i + 1;
            var dataSearch = my_widget_script.dataSearch("mouse", mouseNum);
            var $tailMark = $(".tailMark"+dataSearch);
            $tailMark.html(parsedJson.tailMarksEnd[i]);

            my_widget_script.createRows_allMassDivs();
        }

        // Added; not sure why start wasn't here before
        $(".numPupsStart").text(parsedJson.numPupsStart);
        $(".numPupsEnd").text(parsedJson.numPupsEnd);

    },

    /**
    * TO DO: edit this function to define how the HTML elements should be adjusted
    * based on the current mode.
    */
    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".hideView").hide();
            $(".massDiv.demo").show();
            $(".offspringDemoEnd").hide();
            if ($("#treatmentPeriod").val()) {
                $("#offspringMassOutDiv").show();
                $("#damOutDiv").show();
            }
            $("input[type='date']").removeClass(".hasDatePicker");
        } else{
            $("input[type='date']").each(function () {
                my_widget_script.checkDateFormat($(this));
            });
            
            $("input[type='time']").each(function () {
                my_widget_script.checkTimeFormat($(this));
            });
        }
    },

    /**
    * TO DO: edit this function to define behavior when the user interacts with the form.
    * This could include when buttons are clicked or when inputs change.
    */
    addEventListeners: function () {
        //When DamID changes, update pup IDs
        $("#damID").on("input", function () {
            // TO-DO: Change searching
            for (var i = 0; i < my_widget_script.countPups($(".offspringDemoEnd")); i++) {
                var mouseNum = i + 1;
                var earTag = $(".offID"+my_widget_script.dataSearch("mouse", mouseNum)).val();
                // console.log(mouseNum, earTag);
                my_widget_script.updateOffspringID(mouseNum, earTag);
            }
        });
        
        $("#changeSelMassDays").on("change", function () {
            my_widget_script.showWithCheck($(this), $("#selectMassDays"));
        });

        $("#selectMassDays").on("input", function () {
            my_widget_script.updateSelectedMassDays();
        });

        //Show/hide the table
        $("#toggleTable").on("click", function () { //when the showTable button is clicked. Run this function
            my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
            $("#offspringMassOutDiv").toggle();
            my_widget_script.resize();
        });

        $("#toggleTableDemo").on("click", function () { //when the showTable button is clicked. Run this function
            my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
            $("#offspringDemoOutDiv").toggle();
            my_widget_script.resize();
        });

        $("#toggleTableDam").on("click", function () { //when the showTable button is clicked. Run this function
            my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
            $("#damOutDiv").toggle();
            my_widget_script.resize();
        });

        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSV').on("click", function () {
            my_widget_script.runCSV_buttonFunc("offspring");
        });

        $('#toCSVDemo').on("click", function () {
            my_widget_script.runCSV_buttonFunc("demo");
        });

        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSVDam').on("click", function () {
           my_widget_script.runCSV_buttonFunc("dam");
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            my_widget_script.copyData_buttonFunc("offspring", $("#copyHead"));
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButtonDemo").on("click", function () {
            my_widget_script.copyData_buttonFunc("demo", $("#copyHeadDemo"));
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButtonDam").on("click", function () {
            my_widget_script.copyData_buttonFunc("dam", $("#copyHeadDam"));
        });

        $("#DOB").on("input", function () {
            my_widget_script.printPND_days();
            var pndToday = my_widget_script.getPND_today();
            my_widget_script.switchMassDiv(pndToday);
            // console.log(my_widget_script.possibleMassDays);
            if(($.inArray(pndToday, my_widget_script.possibleMassDays) !== -1)) {
                // console.log("pnd today is in array");
                $("#massDay").val(pndToday);
            } else {
                $("#massDay").val("0");
            }
            my_widget_script.resize();
        });

        $("#treatmentPeriod").on("change", function () {
            my_widget_script.switchTreatmentPeriod($(this).val());
            my_widget_script.resize();
        });

        $("#showDates").on("change", function () {
            if ($(this).is(":checked")) {
                $("#datesList").show();
            } else {
                $("#datesList").hide();
            }
            my_widget_script.resize();
        });

        $("#addPupStart").on("click", function () {
            var $table = $("#offspringMassStart");
            var $numPups = $(".numPupsStart");
            var $avgMass = $(".avgMassStart");
            my_widget_script.addPupStartFuncs($table, $numPups, $avgMass);
        });

        $("#removePupStart").on("click", function () {
            var $div = $("#offspringMassStart");
            var $avgMass = $(".avgMassStart");
            var $numPups = $(".numPupsStart");
            my_widget_script.removePupStartFuncs($div, $numPups, $avgMass);
        });

        $("#addPupEnd").on("click", function () {
            var $div = $(".offspringDemoEnd");
            var $numPups = $(".numPupsEnd");
            my_widget_script.addPupEndFuncs($div, $numPups);
        });

        $("#removePupEnd").on("click", function () {
            var $div = $(".offspringDemoEnd");
            var $numPups = $(".numPupsEnd");
            my_widget_script.removePupEndFuncs($div, $numPups);
        });

        $("#massDay").on("change", function () {
            var day = parseInt($(this).val());
            my_widget_script.switchMassDiv(day);
            my_widget_script.resize();
        });
    },

    isValidTime: function (timeString) {
        var regEx = "^(((([0-1][0-9])|(2[0-3])):[0-5][0-9]))$";
        if(!timeString.match(regEx)){
            return false;
        } else {
            return true;
        }
    },

    isTimeSupported: function () {
        // Check if browser has support for input type=time
        var input = document.createElement('input');
        input.setAttribute('type', 'time');
        var supported = true;
        if(input.type !== "time"){
            supported = false;
        }
        my_widget_script.timeSupported = supported;
        input.remove();
        return (supported);
    },

    timeSupported: true,

    checkTimeFormat: function ($timeInput) {
        if(!my_widget_script.timeSupported){ // if not supported
            $timeInput.next(".timeWarning").remove();
            var time = $timeInput.val();
            var isValid = my_widget_script.isValidTime(time);
            if(!isValid){
                $timeInput.after('<div class="text-danger timeWarning">Enter time as "hh:mm" in 24-hr format</div>');
            }
            my_widget_script.resize();
        }
    },

    isValidDate: function (dateString) {
        // https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery/18759013
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateString.match(regEx)) return false;  // Invalid format
        var d = new Date(dateString);
        var dNum = d.getTime();
        if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
        return d.toISOString().slice(0,10) === dateString;
    },

    isDateSupported: function () {
        // https://gomakethings.com/how-to-check-if-a-browser-supports-native-input-date-pickers/
        // Check if browser has support for input type=date
        var input = document.createElement('input');
        // var value = 'a';
        input.setAttribute('type', 'date');
        var supported = true;
        if(input.type !== "date"){
            supported = false;
        }
        my_widget_script.dateSupported = supported;
        input.remove();
        return (supported);
    },

    dateSupported: true,

    checkDateFormat: function ($dateInput) {
        if(!my_widget_script.dateSupported){ // if not supported
            $dateInput.next(".dateWarning").remove();
            var date = $dateInput.val();
            var isValid = my_widget_script.isValidDate(date);
            if(!isValid){
                $dateInput.after('<div class="text-danger dateWarning">Enter date as "YYYY-MM-DD"</div>');
            }
            $dateInput.datepicker({dateFormat: "yy-mm-dd"})
            my_widget_script.resize();
        }
    },

    setUpInitialState: function (parsedJson) {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 text-left text-sm-right");
        $('.myLeftCol2').addClass("col-6 col-md-4 col-lg-3 col-xl-2 text-right");

        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();
        
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        });
        
        //Print PND dates
        if ($("#DOB").val()) {
            my_widget_script.printPND_days();
        }

        // Show/hide with change selected mass days
        my_widget_script.showWithCheck($("#changeSelMassDays"), $("#selectMassDays"));

        //Show/hide based on treatment period
        my_widget_script.switchTreatmentPeriod($("#treatmentPeriod").val());

        //Calculate the individual masses at paradigm start
        $(".totalMass").each(function () {
            var $totalMass = $(this);
            my_widget_script.getIndividualMass($totalMass);
        });

        //Calculate number of pups and avg mass from P4 paradigm start
        my_widget_script.offspringCalculations($("#offspringMassStart"), $(".numPupsStart"), $(".avgMassStart"));
        
        my_widget_script.showWithCheck($("#showDates"), $("#datesList"));

        if(parsedJson.selectedDays){
            // Update multi-select list
            $("#selectMassDays").val(parsedJson.selectedDays);
        }

        my_widget_script.updateSelectedMassDays();

        var numPupsEnd = my_widget_script.countPups($(".offspringDemoEnd"));

        for (var i = 0; i < numPupsEnd; i++) {
            var mouseNum = i + 1;
            var mouseSearch = my_widget_script.dataSearch("mouse", mouseNum);
            var earTag = $(".offID"+mouseSearch).val();
            // console.log(mouseNum, earTag);
            my_widget_script.updateOffspringID(mouseNum, earTag);

            var sex = $(".sex"+mouseSearch).val();
            my_widget_script.updateOffspringSex(mouseNum, sex);

            my_widget_script.updateTailMark(mouseNum, "");

            var massDays = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
            for( var j = 0; j < massDays.length; j ++){
                my_widget_script.updateOffspringMass(massDays[j], mouseNum);
            }

            // TO-DO: may need a final function for output table; not sure yet if captured above
            // my_widget_script.refillEndParaDivs(rowCount, $demoDiv);
        }

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

        // doing things with data-pnd here gets screwing if it's different than initial setup, so this seems to be safer
        $(".start.damMass").on("input", function () {
            var massPrint = "NA";
            var mass = $(this).val()
            if(mass){
                massPrint = parseFloat(mass).toFixed(1);
            }
            if(my_widget_script.treatStart == 2){
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 2)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 4)).text("NA");
            } else if(my_widget_script.treatStart == 4) {
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 4)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 2)).text("NA");
            }
        }).each(function () {
            var massPrint = "NA";
            var mass = $(this).val()
            if(mass){
                massPrint = parseFloat(mass).toFixed(1);
            }
            if(my_widget_script.treatStart == 2){
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 2)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 4)).text("NA");
            } else if(my_widget_script.treatStart == 4) {
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 4)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 2)).text("NA");
            }
        });

        $(".end.damMass").on("input", function () {
            var massPrint = "NA";
            var mass = $(this).val()
            if(mass){
                massPrint = parseFloat(mass).toFixed(1);
            }
            if(my_widget_script.treatEnd == 9){
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 9)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 11)).text("NA");
            } else if(my_widget_script.treatEnd == 11) {
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 11)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 9)).text("NA");
            }
        }).each(function () {
            var massPrint = "NA";
            var mass = $(this).val()
            if(mass){
                massPrint = parseFloat(mass).toFixed(1);
            }
            if(my_widget_script.treatEnd == 9){
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 9)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 11)).text("NA");
            } else if(my_widget_script.treatEnd == 11) {
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 11)).text(massPrint);
                $(".damMassCalc"+my_widget_script.dataSearch("pnd", 9)).text("NA");
            }
        });

        my_widget_script.resize();
    },

    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var numPupsStart = my_widget_script.countPups($("#offspringMassStart"));
        var numPupsEnd = my_widget_script.countPups($(".offspringDemoEnd"));
        var tailMarksEnd = [];
        // TO-DO: Adjust for new structure
        for (var i = 0; i < numPupsEnd; i++) {
            var mouseNum = i + 1;
            var tailMarkText = my_widget_script.updateTailMark(mouseNum, "");
            tailMarksEnd[i] = tailMarkText;
        }

        $("#selectMassDays").prop("disabled", false);
        $("#selectMassDays").find("option").prop("disabled", false);
        var dynamicContent = {
            numPupsStart: numPupsStart,
            numPupsEnd: numPupsEnd,
            tailMarksEnd: tailMarksEnd,
            selectedDays: $("#selectMassDays").val()
        }

        // console.log(dynamicContent);
        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

    /** -----------------------------------------------------------------------------
    * VALIDATE FORM ENTRY BEFORE COPYING OR SAVING TABLE TO CSV
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

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
        } else {
            $toToggle.hide();
        }
        my_widget_script.resize();
    },

    hideWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.hide();
        } else {
            $toToggle.show();
        }
        my_widget_script.resize();
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    getLocalDateString: function () {
        var dateTodayString = luxon.DateTime.now().toISODate();
        // console.log(dateTodayString);
        return(dateTodayString);
    },

    switchTreatmentPeriod: function (selectionVal) {
        var start, end; 
        var possibleDays = []; selectedDays = [];
        switch (selectionVal) {
            case '':
                start = ""; end = ""; possibleDays = []; selectedDays = [];
                $(".selectPara").hide();
                break;
            case "p2_9":
                start = 2; end = 9;
                possibleDays = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                selectedDays = [true, true, true, true, false, true, false, true, false, true, false];
                $(".selectPara").show();
                break;
            case "p4_11":
                start = 4; end = 11;
                possibleDays = [12, 13, 14, 15, 16, 17, 18, 19, 20];
                selectedDays = [true, true, true, true, true, true, true, true, true];
                $(".selectPara").show();
                break;
        }
        // Add data attribute - need to do it this way so that it stays in the dom
        $(".start").attr("data-pnd", start);
        $(".end").attr("data-pnd", end);

        my_widget_script.treatStart = start;
        my_widget_script.treatEnd = end;
        $(".paraTypeCalc").text(start);
        
        // Print number
        $(".start.pndNum").text(start);
        $(".end.pndNum").text(end);

        // Change selection option for end
        if(end){
            $(".end.massSelectOption").text("PND " + end).val(end);
        }else {
            $(".end.massSelectOption").text("[Select Paradigm Days]").val("");
        }

        var damPNDs = [2, 9, 4, 11];
        for(i = 0; i < damPNDs.length; i++ ){
            var pnd = damPNDs[i];
            my_widget_script.updateDamMass(pnd);
        }

        // Change select days list from possible days
        var $selectDays = $("#selectMassDays");
        $selectDays.html("");

        for (i = 0; i < possibleDays.length; i++ ){
            var pnd = possibleDays[i];
            var daySelected = selectedDays[i];

            $selectDays.append(
                $("<option/>", {
                    value: pnd,
                    selected: daySelected
                }).append(
                    "P" + pnd
                )
            );
        }

        my_widget_script.updateSelectedMassDays();

        // TO-DO: need to calculate dates based on DOB
        // Probably just run the function here
    },

    updateSelectedMassDays: function () {
        // console.log($("#selectMassDays").val());
        var massDays = $("#selectMassDays").val(); // this is an array
        var $select = $("#massDay");
        var $datesList = $("#datesList");

        // Remove not original options
        $select.find(".added").remove();
        $datesList.find(".added").remove();

        var divClass = "col-12 col-sm-6 col-md-4 added"
        
        if(massDays){
            for(i = 0; i < massDays.length; i++ ){
                var pnd = massDays[i];
                $select.find(".last").before(
                    $("<option/>", {
                        value: pnd, 
                        "data-pnd": pnd,
                        "class": "added"
                    }).append(
                        "PND " + pnd
                    )
                );

                $datesList.find(".last").before(
                    $("<div/>", {
                        "class": divClass
                    }).append(
                        "<strong class='pndNum' data-pnd='"+ pnd +"'>PND " + pnd + ": </strong>"
                    ).append(
                        $("<span/>", {
                            "class": "pndDateShort",
                            "data-pnd": pnd
                        })
                    )
                );
            }
        }

        // Update list of possible mass days
        var possibleMassDays = [];

        $("#massDay option").each(function() {
            possibleMassDays[possibleMassDays.length] = parseInt($(this).val());
        });

        my_widget_script.possibleMassDays = possibleMassDays;
        var pndToday = my_widget_script.getPND_today();
        my_widget_script.switchMassDiv(pndToday);

        if(pndToday && $.inArray(pndToday, possibleMassDays) !== -1) {
            $("#massDay").val(pndToday);
        } else {
            $("#massDay").val("0");
        }

        my_widget_script.updateMassOutput();
        my_widget_script.printPND_days();
    },

    switchMassDiv: function (selectionVal) {
        if(selectionVal && $.inArray(selectionVal, my_widget_script.possibleMassDays) !== -1) {
            // console.log("in switchMassDiv, searching", selectionVal);
            var dataSearch = my_widget_script.dataSearch("pnd", selectionVal);
            // console.log(dataSearch);
            $(".massDiv" + dataSearch).show();
            $(".massDiv").not(dataSearch).hide();
        } else {
            // console.log("in switchMassDiv, using demo");
            $(".massDiv").hide();
            $(".massDiv.demo").show();
        }
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toLocaleString({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
        $newDateClass.text(newDate);
    },

    addDaysShort: function ($startDateVal, $newDateClass, numDays) {
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toLocaleString({ weekday: 'long', month: 'short', day: 'numeric'});
        $newDateClass.text(newDate);
    },

    printPND_days: function () {
        var $DOBVal = $("#DOB").val();

        if($DOBVal){
            var pnds = [2, 4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
            for (i = 0; i < pnds.length; i++ ){
                var pnd = pnds[i];
                var dataSearch = my_widget_script.dataSearch("pnd", pnd);
                my_widget_script.addDays($("#DOB").val(), $(".pndDate"+dataSearch), pnd);
                my_widget_script.addDaysShort($("#DOB").val(), $(".pndDateShort"+dataSearch), pnd);
            }
        }
        my_widget_script.resize();
    },

    getPND_today: function () {
        var $DOBVal = $("#DOB").val();

        if($DOBVal){
            var startDate = luxon.DateTime.fromISO($DOBVal).startOf("day");
            var todayDate = luxon.DateTime.now().startOf("day")
            var dateDiff_days = todayDate.diff(startDate, "days").as("day");
            // console.log(dateDiff_days);
            
            var dataSearch = my_widget_script.dataSearch("pnd", dateDiff_days)
            $(".pndDateShort"+dataSearch).css("color", "red");
            $(".pndDateShort").not(dataSearch).css("color", "black");
    
            $(".pndToday").text(dateDiff_days);

            // This prints at the top what needs to be done today and switches the Mass and AGD selector 
            my_widget_script.updateToDoStatus(dateDiff_days);
    
            return(dateDiff_days);
        } 
    },

    updateToDoStatus: function (PND_today) {
        var $toDoStatus = $(".toDoStatus");
        if (PND_today == my_widget_script.treatStart){
            $toDoStatus.html("<span style='color:red'>Start the paradigm today and take masses</span>");
        } else if (my_widget_script.treatStart > 0 && PND_today == my_widget_script.treatStart + 1){
            $toDoStatus.html("<span style='color:black'>Begin video monitoring today</span>");
        } else if (my_widget_script.treatStart > 0 && PND_today == my_widget_script.treatStart + 2){
            $toDoStatus.html("<span style='color:black'>End video monitoring today</span>");
        } else if (my_widget_script.treatEnd > 0 && PND_today == my_widget_script.treatEnd){
            $toDoStatus.html("<span style='color:red'>Stop the paradigm today, ear tag, and take masses</span>");
        } else if (PND_today == 21){
            $toDoStatus.html("<span style='color:red'>Wean and take masses</span>");
        } else if ($.inArray(PND_today, my_widget_script.possibleMassDays) !== -1)  {
            $toDoStatus.html("<span style='color:blue'>Take mass today</span>");
        } else {
            $toDoStatus.html("<em>No mass today</em>");
        }
    },

    createMassDivs: function (){
        var massDays = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
        for (i = 0; i < massDays.length; i++ ){
            var massDay = massDays[i];
            
            var $div = $(".addedMassDivs");
            var outerDivClasses = "massDiv added"
            // if(massDay == 11){
            //     outerDivClasses = outerDivClasses + " p11"
            // }
            var row1DivClasses = "row align-items-end mt-2 blackBackground original"

            $div.append(
                $("<div/>", {
                    "class": outerDivClasses,
                    "data-pnd": massDay
                }).append(
                    $("<div/>", {
                        "class": row1DivClasses
                    }).append(
                        '<div class="myLeftCol2">PND '+massDay+': </div>'
                    ).append(
                        '<div class="col pndDate" data-pnd="'+massDay+'"></div>'
                    )
                ).append(
                    $("<div/>", {
                        "class": "row original"
                    }).append(
                        $("<div/>", {
                            "class": "col"
                        }).append(
                            "<strong>Tail</strong>"
                        )
                    ).append(
                        $("<div/>", {
                            "class": "col"
                        }).append(
                            "<strong>Ear Tag</strong>"
                        )
                    ).append(
                        $("<div/>", {
                            "class": "col"
                        }).append(
                            "<strong>Sex</strong>"
                        )
                    ).append(
                        $("<div/>", {
                            "class": "col"
                        }).append(
                            "<strong>Mass</strong>"
                        )
                    )  
                )
            )
        }
    },

    createRow_startPara: function ($avgMass) {
        var $div = $("#offspringMassStart");
        var rowCount = $div.find(".totalMass").last().data("mouse");
        // console.log(rowCount);
        if(rowCount){
            rowCount = rowCount + 1;
        } else {
            rowCount = 1;
        }
        
        $div.append(
            $("<div/>", {
                "class": "row mt-1",
                "data-mouse": rowCount
            }).append(
                $("<div/>", {
                    "class": "col text-center"
                }).append(
                    $("<input/>", {
                        id: "total_mass_" + rowCount,
                        name: "total_mass_" + rowCount,
                        type: "number", 
                        "class": "totalMass fullWidth",
                        step: 0.1,
                        "data-mouse": rowCount
                    }).on("input", function () {
                        $(".totalMass").each(function () {
                            my_widget_script.getIndividualMass($(this));
                        });
                        var avgMass = my_widget_script.getAvgMass();
                        $avgMass.text(avgMass);
                    })
                )
            ).append(
                $("<div/>", {
                    "class": "col justify-content-center individualMass text-center",
                    "data-mouse": rowCount
                })
            )
        )

        //resize the container
        my_widget_script.resize();
    },

    updateOffspringID: function (mouseNum, earTag) {
        var damID = $("#damID").val();
        var offID = damID + "_" + earTag;
        var dataSearch = my_widget_script.dataSearch("mouse", mouseNum);
        $(".idCalc"+dataSearch).text(offID);
        $(".earTagCalc"+dataSearch).text(earTag);
    },

    updateOffspringSex: function (mouseNum, sex) {
        var dataSearch = my_widget_script.dataSearch("mouse", mouseNum);
        $(".sexCalc"+dataSearch).text(sex);
    },

    updateTailMark: function (mouseNum, action) {
        var dataSearch = my_widget_script.dataSearch("mouse", mouseNum);
        var $tailMark = $(".tailMark" + dataSearch);
        var redMark = "<span style='color:red'>|</span>";
        var blackMark = "<span style='color:black'>|</span>";

        if(action == "red"){
            $tailMark.append(redMark);
        } else if(action == "black") {
            $tailMark.append(blackMark);
        } else if(action == "clear"){
            $tailMark.text("");
        }

        return($tailMark.html())
    },

    updateOffspringMass: function (pnd, mouse) {
        var pndSearch = my_widget_script.dataSearch("pnd", pnd);
        var mouseSearch = my_widget_script.dataSearch("mouse", mouse);
        var massPrint = "NA"
        if($.inArray(pnd, my_widget_script.possibleMassDays) !== -1){
            var mass = $(".offMass" + mouseSearch + pndSearch).val();
            if(mass){
                mass = parseFloat(mass);
                massPrint = mass.toFixed(1);
            }
        }
        // console.log(massPrint);
        $(".massCalc" + mouseSearch + pndSearch).text(massPrint);
    },

    updateMassOutput: function () {
        var numPupsEnd = my_widget_script.countPups($(".offspringDemoEnd"));

        for (var i = 0; i < numPupsEnd; i++) {
            var mouseNum = i + 1;
            var massDays = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
            for( var j = 0; j < massDays.length; j ++){
                my_widget_script.updateOffspringMass(massDays[j], mouseNum);
            }

            // TO-DO: may need a final function for output table; not sure yet if captured above
            // my_widget_script.refillEndParaDivs(rowCount, $demoDiv);
        }
    },

    updateDamMass: function (pnd){
        var pndSearch = my_widget_script.dataSearch("pnd", pnd);
        var $damMass = $(".damMass"+pndSearch);
        var massPrint = "NA"
        if($damMass){
            var mass = $damMass.val();
            if(mass){
                massPrint = parseFloat(mass).toFixed(1);
            }
        }
        $(".damMassCalc"+pndSearch).text(massPrint);
    },

    createRow_offDemo: function () {
        var $div = $(".offspringDemoEnd");
        var lastMouseNum = $div.find(".row").last().data("mouse");
        var mouseNum;
        if(lastMouseNum){
            mouseNum = lastMouseNum + 1;
        } else {
            mouseNum = 1
        }

        var rowClass = "added demoEnd row mt-1 align-items-center";
        var redButtonID = "redbutton_" + mouseNum;
        var blackButtonID = "blackbutton_" + mouseNum;
        var clearButtonID = "clearbutton_" + mouseNum;

        var idID = "id_" + mouseNum; idClass = "offID";
        var sexID = "sex_" + mouseNum; sexClass = "sex";

        $div.append(
            $('<div/>', { //add a new row
                "class": rowClass,
                "data-mouse": mouseNum
            }).append(
                $('<div class="col"/>').append( //append a new col to the row
                    $('<input/>', { //append a new input to the col
                        id: redButtonID,
                        name: redButtonID,
                        type: "button",
                        class: "redButton",
                        value: "Red |",
                        "data-mouse": mouseNum
                    }).on("click", function () {
                        var mouseNum = $(this).data("mouse");
                        my_widget_script.updateTailMark(mouseNum, "red");
                    })
                ).append(
                    $('<input/>', { //append a new input to the td
                        id: blackButtonID,
                        name: blackButtonID,
                        type: "button",
                        class: "blackButton",
                        value: "Black |",
                        "data-mouse": mouseNum
                    }).on("click", function () {
                        var mouseNum = $(this).data("mouse");
                        my_widget_script.updateTailMark(mouseNum, "black");
                    })
                ).append(
                    $('<input/>', { //append a new input to the td
                        id: clearButtonID,
                        name: clearButtonID,
                        type: "button",
                        class: "clearButton",
                        value: "Clear",
                        "data-mouse": mouseNum
                    }).on("click", function () {
                        var mouseNum = $(this).data("mouse");
                        my_widget_script.updateTailMark(mouseNum, "clear");
                    })
                ).append(
                    $('<span></span>', {
                        "class": "tailMark",
                        "data-mouse": mouseNum
                    })
                )
            ).append(
                $('<div class="col"/>').append(
                    $('<select></select>', {
                        id: idID,
                        name: idID,
                        "class": idClass + " needForTable",
                        "data-mouse": mouseNum
                    }).append(
                        "<option value=''>[Select]</option>",
                        "<option value='04'>04</option>",
                        "<option value='06'>06</option>",
                        "<option value='40'>40</option>",
                        "<option value='60'>60</option>",
                        "<option value='44'>44</option>",
                        "<option value='66'>66</option>",
                        "<option value='46'>46</option>",
                        "<option value='64'>64</option>",
                    ).on("input", function () {
                       var mouseNum = $(this).data("mouse");
                       var earTag = $(this).val();
                       my_widget_script.updateOffspringID(mouseNum, earTag);
                    })
                )
            ).append(
                $('<div class="col"/>').append( //append a new col to the row
                    $('<select></select>', { //append a new select to the col
                        id: sexID,
                        name: sexID,
                        "class": sexClass,
                        "data-mouse": mouseNum
                    }).append( //append options to the select tag
                        "<option value=''>[Select]</option>",
                        "<option value='F'>Female</option>",
                        "<option value='M'>Male</option>"
                    ).on("input", function () {
                        var mouseNum = $(this).data("mouse");
                        var sex = $(this).val();
                        my_widget_script.updateOffspringSex(mouseNum, sex);
                    })
                )
            )
        );

        //resize the container
        my_widget_script.resize();
    },

    createRow_massDiv: function (whichDay) {
        var $outerDiv = $(".addedMassDivs");
        var dataSearchDay = my_widget_script.dataSearch("pnd", whichDay);
        var $div = $(".massDiv" +dataSearchDay); 
        // console.log("Div in createRow_massDiv", $div);
        var $demoDiv = $(".offspringDemoEnd");
        var lastMouseNum = $div.find(".row").last().data("mouse");
        var mouseNum;
        if(lastMouseNum){
            mouseNum = lastMouseNum + 1;
        } else {
            mouseNum = 1
        }

        var rowClass = "row added mt-1 align-items-center";

        var idClass = "idCalc";
        var sexClass = "sexCalc";
        var tailClass = "tailMark";

        var massID = "mass_" + whichDay + "_" + mouseNum;
        var massClass = "offMass";

        var dropMassCol = false;
        if ($div.find(".original").find(".col").length === 3) {
            dropMassCol = true;
        }

        var dataSearchMouse = my_widget_script.dataSearch("mouse", mouseNum);

        $div.append(
            $('<div/>', { //add a new row
                "class": rowClass,
                "data-pnd": whichDay,
                "data-mouse": mouseNum
            }).append(
                $('<div/>', {
                    "class": "col " + tailClass,
                    "data-pnd": whichDay,
                    "data-mouse": mouseNum
                }).append(
                    $(".tailMark"+dataSearchMouse).html()
                )
            ).append(
                $('<div/>', {
                    "class": "col " + idClass,
                    "data-pnd": whichDay,
                    "data-mouse": mouseNum
                }).append(
                    $(".offID"+dataSearchMouse).val()
                )
            ).append(
                $('<div/>', {
                    "class": "col " + sexClass,
                    "data-pnd": whichDay,
                    "data-mouse": mouseNum
                }).append(
                    $(".sex"+dataSearchMouse).val()
                )
            ).append(
                $('<div/>', {
                    "class": "col massCol",
                    "data-pnd": whichDay,
                    "data-mouse": mouseNum
                }).append(
                    $('<input/>', {
                        id: massID,
                        name: massID,
                        type: "number",
                        "data-pnd": whichDay,
                        "data-mouse": mouseNum,
                        "class": massClass + " fullWidth"
                    }).on("input", function () {
                        var pnd = $(this).data("pnd");
                        var mouse = $(this).data("mouse");
                        my_widget_script.updateOffspringMass(pnd, mouse);
                    })
                )
            )
        );

        if (dropMassCol) {
            $div.find(".massCol").remove();
        }

        //resize the container
        my_widget_script.resize();
    },

    createRow_summaryMassTable: function () {
        var $table = $("#offspringMassOutTable");
        var $demoTable = $("#offspringDemoOutTable");
        var lastMouseNum = $table.find(".myRow").last().data("mouse");
        var mouseNum;
        if(lastMouseNum){
            mouseNum = lastMouseNum + 1;
        } else {
            mouseNum = 1;
        }

        $table.find("tbody").append(
            $('<tr></tr>', { //add a new row
                "class": "myRow added",
                "data-mouse": mouseNum
            }).append( //Mouse_ID
                $('<td></td>', {
                    "class": "idCalc",
                    "data-mouse": mouseNum
                })
            ).append( //ParaType
                $('<td></td>', {
                    "class": "paraTypeCalc"
                }).append(
                    my_widget_script.treatStart
                )
            )
        );

        $demoTable.find("tbody").append(
            $('<tr></tr>', { //add a new row
                "class": "myRow added",
                "data-mouse": mouseNum
            }).append( //Mouse_ID
                $('<td></td>', {
                    "class": "idCalc",
                    "data-mouse": mouseNum
                })
            ).append( //earTag
                $('<td></td>', {
                    "class": "earTagCalc",
                    "data-mouse": mouseNum
                })
            ).append( // sex
                $('<td></td>', {
                    "class": "sexCalc",
                    "data-mouse": mouseNum
                })
            ).append( // damID
                $('<td></td>', {
                    "class": "damID_calc",
                    "data-mouse": mouseNum
                })
            )
        )

        var massDays = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
        for(i = 0; i < massDays.length; i++ ){
            var pnd = massDays[i];
            $table.find("tbody tr").last().append(
                $("<td/>", {
                    "class": "massCalc",
                    "data-mouse": mouseNum,
                    "data-pnd": pnd
                })
            );
        }

        my_widget_script.updateMassOutput();

        //resize the container
        my_widget_script.resize();
    },

    createRows_allMassDivs: function () {
        // Want to create the row for all of them now
        var massDays = [0, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

        if (massDays) {
            // console.log("in createRows_allMassDivs");
            for (var i = 0; i < massDays.length; i++) {
                var whichDay = massDays[i];
                my_widget_script.createRow_massDiv(whichDay);
            }
        }

        //Create row in summary table
        my_widget_script.createRow_summaryMassTable();
    },

    deleteRow: function ($div) {
        $div.find(".row:not(.original)").last().remove();        

        //resize the container
        my_widget_script.resize();
    },

    deleteRows_allmassDivs: function () {
        // Want to delete the row for all of them now
        var massDays = [0, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

        if (massDays) {
            for (var i = 0; i < massDays.length; i++) {
                var whichDay = massDays[i];
                var pndSearch = my_widget_script.dataSearch("pnd", whichDay);
                var $div = $(".massDiv"+pndSearch);
                my_widget_script.deleteRow($div);
            }
        }

        //Delete row in summary table
        $("#offspringMassOutTable").find(".myRow").last().remove();

    },

    getIndividualMass: function ($totalMass) {
        var thisMouse = $totalMass.data("mouse");
        var prevMouse = thisMouse - 1;

        var dataSearchPrev = my_widget_script.dataSearch("mouse", prevMouse);
        var dataSearchThis = my_widget_script.dataSearch("mouse", thisMouse);
        // //Get the total mass of the previous row - if this is blank, will be NaN
        var prevTotal = parseFloat($(".totalMass"+dataSearchPrev).val());

        //Get the total mass from this row
        var currentTotal = parseFloat($totalMass.val());

        if (!prevTotal) { // if the previous total is NaN
            //use this total
            $(".individualMass"+dataSearchThis).text(currentTotal.toFixed(1));
        } else {
            //Calculate the difference between the current total and the previous total
            var massDiff = currentTotal - prevTotal;
            $(".individualMass"+dataSearchThis).text(massDiff.toFixed(1));
        }
    },

    getAvgMass: function () {
        var totalMass;
        var numberPups = my_widget_script.countPups($("#offspringMassStart"));

        var $lastTotalMass = $("#offspringMassStart").find(".totalMass").last();

        if ($lastTotalMass.val()) {
            totalMass = parseFloat($lastTotalMass.val())
        } else { totalmass = "NaN" }

        var avgMass = totalMass / numberPups;
        if (avgMass) {
            return avgMass.toFixed(2);
        } else {
            return "NA";
        }

    },

    countPups: function ($div) {
        var numberPups;
        numberPups = $div.find(".row").last().data("mouse");
        if(!numberPups){
            numberPups = 0;
        }
        return numberPups;
    },

    offspringCalculations: function ($div, $numPups, $avgMass) {
        //Count Pups
        var numberPups = my_widget_script.countPups($div);
        $numPups.text(numberPups);

        //Update Avg
        var avgMass = my_widget_script.getAvgMass();
        $avgMass.text(avgMass);
    },

    watchValue: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
        my_widget_script.resize();
    },

    // To-do: remove; redundant
    updateCalculation: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
    },

    addPupStartFuncs: function ($table, $numPups, $avgMass) {
        my_widget_script.createRow_startPara($avgMass);
        my_widget_script.offspringCalculations($table, $numPups, $avgMass);
        my_widget_script.resize();
    },

    removePupStartFuncs: function ($div, $numPups, $avgMass) {
        var proceed = confirm("Are you sure that you want to remove the last pup?");

        if(proceed){
            my_widget_script.deleteRow($div);
            my_widget_script.offspringCalculations($div, $numPups, $avgMass);
            my_widget_script.resize();
        }
    },

    addPupEndFuncs: function ($tableDemo, $numPups) {
        my_widget_script.createRow_offDemo();
        my_widget_script.createRows_allMassDivs();

        //Count Pups
        var numberPups = my_widget_script.countPups($tableDemo);
        $numPups.text(numberPups);
        my_widget_script.resize();
    },

    removePupEndFuncs: function ($div, $numPups) {
        var proceed = confirm("Are you sure that you want to remove the last pup?");

        if(proceed){
            my_widget_script.deleteRow($div);
            my_widget_script.deleteRows_allmassDivs();

            //Count Pups
            var numberPups = my_widget_script.countPups($div);
            $numPups.text(numberPups);
            my_widget_script.resize();
        }
    },

    runCSV_buttonFunc: function (whichGeneration) {
        var fileName, outTable;
        if (whichGeneration === "dam") {
            fileName = "damData";
            outTable = "damOutTable";
        } else if (whichGeneration === "offspring") {
            fileName = "massOffspring";
            outTable = "offspringMassOutTable";
        } else if(whichGeneration === "demo"){
            fileName = "offspringDemo";
            outTable = "offspringDemoOutTable";
        }

        var data_valid = my_widget_script.data_valid_form();
        //alert(data_valid);
        if (data_valid) {
            my_widget_script.exportTableToCSV(fileName, outTable);
            $("#errorMsg").html("<span style='color:grey; font-size:24px;'>Saved successfully</span>")
        } else {
            $("#errorMsg").append("<br/><span style='color:grey; font-size:24px;'>Did not export</span><br/>");
        }
    },

    // source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
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

    // source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
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

        // Download CSV file
        this.downloadCSV(csv.join("\n"), filename);
    },

    copyData_buttonFunc: function (whichGeneration, $copyHead) {
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        //select output div and output table based on generation and paradigm
        var $outDiv, $outTable
        if (whichGeneration === "dam") {
            $outDiv = $("#damOutDiv");
            $outTable = $("#damOutTable");
        } else if (whichGeneration === "offspring") {
            $outDiv = $("#offspringMassOutDiv");
            $outTable = $("#offspringMassOutTable");
        } else if (whichGeneration === "demo") {
            $outDiv = $("#offspringDemoOutDiv");
            $outTable = $("#offspringDemoOutTable");
        }

        var data_valid = my_widget_script.data_valid_form();
        //alert(data_valid);
        if (data_valid) {
            $outDiv.show();
            my_widget_script.resize();
            my_widget_script.copyTable($outTable, copyHead);
            $("#errorMsg").html("<span style='color:grey; font-size:24px;'>Copied successfully</span>")
        } else {
            $("#errorMsg").append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span><br/>");
        }
    },

    copyTable: function ($table, copyHead) {
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

        $temp.appendTo($('#forCopy')).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    }
};