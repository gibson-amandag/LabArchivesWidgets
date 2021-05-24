my_widget_script =
{
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

        //Uncomment to print parsedJson to console
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
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode);

        // uncomment to print name log to check for uppercase letters
        // var name_log = ''
        // $("body").find("[name]").each(function () {
        //     var thisName = this.getAttribute("name");
        //     name_log += thisName + "\n";
        // });
        // console.log(name_log);
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
            tailMark: dynamicContent.tailMark,
            addedRows_PPS: dynamicContent.addedRows_PPS,
            dates_PPS: dynamicContent.dates_PPS
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

        //If no additional dynamic content 
        var output = { 
            widgetData: testData,
            tailMark: "<span style='color:blue'>|||</span>",
            addedRows_PPS: 2,
            dates_PPS: ["2021-01-31", "2021-02-04"]
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
        $(".tailMark").html(parsedJson.tailMark);
        $(".tailMark_calc").html(parsedJson.tailMark);

        for (var i = 0; i < parsedJson.addedRows_PPS; i++) {
            my_widget_script.createMaturationRow_PPS(parsedJson.dates_PPS[i]);
        };
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
            $(".massDiv").hide();
            $("#showDates").prop("checked", true).closest(".container").hide();
            $("#datesList").show().after($("#outputDiv"));
            $(".tableDiv").show();
        } else {
            if($("#DOB").val()) {
                $("#entryDiv").insertAfter("#titleDiv");
                $("#editDemo").prop("checked", false);
                $(".editDemoChecked").hide();
            } else {
                $("#editDemo").prop("checked", true);
                $(".editDemoChecked").show();
            }
            // Add * and # to mark required field indicators
            my_widget_script.addRequiredFieldIndicators();
            // $(".hideEdit").hide();
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        // Add red tail mark
        $(".redButton").on("click", function () {
            $(this).parent().find(".tailMark").append(
                "<span style='color:red'>|</span>"
            );
            // Update any other fields for tail markings. If use multiple animals in same widget, then would need to change calc class
            $(".tailMark_calc").html(
                $(this).parent().find(".tailMark").html()
            );
        });

        $(".blackButton").on("click", function () {
            $(this).parent().find(".tailMark").append(
                "<span style='color:black'>|</span>"
            );
            // Update any other fields for tail markings. If use multiple animals in same widget, then would need to change calc class
            $(".tailMark_calc").html(
                $(this).parent().find(".tailMark").html()
            );
        });

        $(".clearButton").on("click", function () {
            $(this).parent().find(".tailMark").text(
                ""
            );
            // Update any other fields for tail markings. If use multiple animals in same widget, then would need to change calc class
            $(".tailMark_calc").html(
                $(this).parent().find(".tailMark").html()
            );
        });

        // Output table calculations
        $(".simpleCalc").on("input", function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });

        // Show the demographics input boxes when checked
        $("#editDemo").on("change", function () {
            if($(this).is(":checked")){
                $(".editDemoChecked").show();
            } else {
                $(".editDemoChecked").hide();
            }
        });

        $("#DOB").on("change", function () {
            my_widget_script.printPND_days();
            my_widget_script.getPND_today();
            my_widget_script.updateMatPND();
            my_widget_script.watchForPPS();
        });

        $("#showDates").on("change", function () {
            if($(this).is(":checked")){
                $("#datesList").show();
            } else {
                $("#datesList").hide();
            }
            my_widget_script.resize();
        });
        
        $("#massSelect").on("change", function () {
            var pnd = $(this).val();
            if (pnd) {
                my_widget_script.switchMassTable(pnd);
            } else {
                $(".massDiv").hide();
            }
        });

        $(".addMatCheck").on("click", function () {
            var $dateVal = $(this).parent().next().children(".addMatDate").val();
            if ($dateVal) {
                if($(this).hasClass("PPS")) {
                    my_widget_script.createMaturationRow_PPS($dateVal);
                } 

            } else {
                alert("Enter a Date");
            }
        });

        $(".removeMatCheck").on("click", function () {
            var proceed = confirm("Are you sure that you want to remove the last date?");
            if(proceed){
                if($(this).hasClass("PPS")){
                    my_widget_script.removeMaturationRow("PPS");
                    my_widget_script.watchForPPS();
                }
            }
        });

        $("#PPS_mass").on("input", function () {
            my_widget_script.watchPPS_mass();
        });

        // Output Table Buttons

        //Show/hide the table
        $(".toggleTable").on("click", function () { //when the showTable button is clicked. Run this function
            var $tableDiv, $errorMsgDiv;
            if($(this).hasClass("maturation")) {
                $tableDiv = $(".tableDiv.maturation");
                $errorMsgDiv = $(".errorMsg.maturation");
            } else if($(this).hasClass("mass")){
                $tableDiv = $(".tableDiv.mass");
                $errorMsgDiv = $(".errorMsg.mass");
            }

            if($tableDiv && $errorMsgDiv){
                my_widget_script.toggleTableFuncs($tableDiv, $errorMsgDiv);
            }
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('.toCSV').on("click", function () {
            var fileName; 
            var tableID 
            var $errorMsg 
            if($(this).hasClass("maturation")) {
                fileName = "maturation_" + $("#mouseID").val();
                tableID = "maturationTable";
                $errorMsg = $(".errorMsg.maturation");
            } else if($(this).hasClass("mass")){
                fileName = "mass_" + $("#mouseID").val();
                tableID = "massTable";
                $errorMsg = $(".errorMsg.mass");
            }

            if(fileName && tableID && $errorMsg){
                my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
            }
        });

        //When the copy button is clicked, run the copyTable function
        $(".copyDataButton").on("click", function () {
            var $copyHead //TO DO add table
            var $tableToCopy //TO DO add table
            var $tableDiv //TO DO add tableDiv
            var $errorMsg //TO DO add error message
            var $divForCopy //TO DO add div where the table copies to

            if($(this).hasClass("maturation")) {
                $copyHead = $(".copyHead.maturation");
                $tableToCopy = $("#maturationTable");
                $tableDiv = $(".tableDiv.maturation");
                $errorMsg = $(".errorMsg.maturation");
                $divForCopy = $(".forCopy.maturation");
            } else if($(this).hasClass("mass")) {
                $copyHead = $(".copyHead.mass");
                $tableToCopy = $("#massTable");
                $tableDiv = $(".tableDiv.mass");
                $errorMsg = $(".errorMsg.mass");
                $divForCopy = $(".forCopy.mass");
            }
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy);
        });
    },

    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForTableLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each(function () { //find element with class "needForTableLab"
            //alert($(this).val());
            $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            //alert($(this).val());
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        $('.myLeftCol2').addClass("col-6 col-md-4 col-lg-3 text-right");

        if($("#editDemo").is(":checked")){
            $(".editDemoChecked").show();
        } else {
            $(".editDemoChecked").hide();
        }

        $(".simpleCalc").each(function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });

        
        if($("#showDates").is(":checked")){
            $("#datesList").show();
        } else {
            $("#datesList").hide();
        }

        $(".addMatDate").val(my_widget_script.getLocalDateString());

        my_widget_script.printPND_days();
        my_widget_script.getPND_today();
        // update mat pnd before watching for values, otherwise, there's not DOB because the rows are initialized before the widget data is reloaded
        my_widget_script.updateMatPND();
        my_widget_script.watchForPPS();
        my_widget_script.calcValues();

        my_widget_script.resize();
    },

    getLocalDateString: function () {
        var dateTodayString = luxon.DateTime.now().toISODate();
        // console.log(dateTodayString);
        return(dateTodayString);
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
        var tailMark, addedRows_PPS;

        tailMark = $(".tailMark").html();
        addedRows_PPS = $("#PPS_div").find(".addedRow").length;

        var dates_PPS = [];
        for (var i = 0; i < addedRows_PPS; i++) {
            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            var thisDate = $("#PPS_div").find(rowClassName).find(".mat_date").html();
            dates_PPS[i] = thisDate;
        }

       var dynamicContent = {
            tailMark: tailMark,
            addedRows_PPS: addedRows_PPS,
            dates_PPS: dates_PPS
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
    data_valid_form: function ($errorMsgDiv) {
        var valid = true; //begin with a valid value of true
        //var fail_log = ''; //begin with an empty fail log
        //var name; //create a name variable

        //search the_form for all elements that are of class "needForTable"
        $('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(this).attr('id'); //replace the name variable with the id attribute of this element
                //fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $errorMsgDiv.html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $errorMsgDiv.html("");
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
        my_widget_script.resize();
    },

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
            my_widget_script.updateToDoStatus(dateDiff_days);
            my_widget_script.updateCycleStatus(dateDiff_days);
    
            return(dateDiff_days);
        } else {
            my_widget_script.switchMassTable($("#massSelect").val());
        }
    },

    getPND: function (dateInputVal) {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var DOBisDay = 0;
        var textOutput;
        if($("#DOB").val()){
            if(dateInputVal){
                var compDate = luxon.DateTime.fromISO(dateInputVal).startOf("day");
                var DOB = luxon.DateTime.fromISO($("#DOB").val()).startOf("day").minus({ days: DOBisDay });
                var pnd = compDate.diff(DOB, "days").as("day");
                // console.log(pnd);
                textOutput = pnd;
            } else {
                textOutput = "[Enter Date of PPS Check]";
            }
        } else {
            textOutput = "[Enter DOB]";
        }
        
        return textOutput;
    },

    updateMatPND: function () {
        $(".mat_pnd").each(function () {
            var dateVal = $(this).prev(".mat_date").text();
            var pnd = my_widget_script.getPND(dateVal);
            $(this).text(pnd);
        });
    },

    updateToDoStatus: function (PND_today) {
        var $toDoStatus = $(".toDo_status");
        if ($.inArray(PND_today, [28, 35, 42, 49, 56, 63]) !== -1)  {
            $toDoStatus.html("<span style='color:blue'>Take mass today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            my_widget_script.switchMassTable("pnd"+PND_today);
        } else if ($.inArray(PND_today, [22, 23, 24, 70, 71, 72]) !== -1) {
            $toDoStatus.html("<span style='color:blue'>Take mass and AGD today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            my_widget_script.switchMassTable("pnd"+PND_today);
        } else if (PND_today === 21) {
            $toDoStatus.html("<span style='color:blue'>Wean and take mass today - enter in litter widget</span>");
            $("#massSelect").val("");
            my_widget_script.switchMassTable("");
        } else {
            $toDoStatus.html("<em>No mass or AGD today</em>");
            $("#massSelect").val("");
            my_widget_script.switchMassTable($("#massSelect").val());
        }
    },

    updateCycleStatus: function (PND_today){
        var $cycling_status = $(".cycling_status");
        if(PND_today >= 70 && PND_today <= 91){
            $cycling_status.css("background-color", "yellow");
        } else {
            $cycling_status.css("background-color", "none");
        }
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toLocaleString({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
        $newDateClass.text(newDate);
    },

    printPND_days: function () {
        if($("#DOB").val()){
            my_widget_script.addDays($("#DOB").val(), $(".pnd21"), 21);
            my_widget_script.addDays($("#DOB").val(), $(".pnd22"), 22);
            my_widget_script.addDays($("#DOB").val(), $(".pnd23"), 23);
            my_widget_script.addDays($("#DOB").val(), $(".pnd24"), 24);
            my_widget_script.addDays($("#DOB").val(), $(".pnd28"), 28);
            my_widget_script.addDays($("#DOB").val(), $(".pnd35"), 35);
            my_widget_script.addDays($("#DOB").val(), $(".pnd42"), 42);
            my_widget_script.addDays($("#DOB").val(), $(".pnd49"), 49);
            my_widget_script.addDays($("#DOB").val(), $(".pnd56"), 56);
            my_widget_script.addDays($("#DOB").val(), $(".pnd63"), 63);
            my_widget_script.addDays($("#DOB").val(), $(".pnd70"), 70);
            my_widget_script.addDays($("#DOB").val(), $(".pnd71"), 71);
            my_widget_script.addDays($("#DOB").val(), $(".pnd72"), 72);
            my_widget_script.addDays($("#DOB").val(), $(".pnd73"), 73);
            my_widget_script.addDays($("#DOB").val(), $(".pnd74"), 74);
            my_widget_script.addDays($("#DOB").val(), $(".pnd75"), 75);
            my_widget_script.addDays($("#DOB").val(), $(".pnd76"), 76);
            my_widget_script.addDays($("#DOB").val(), $(".pnd77"), 77);
            my_widget_script.addDays($("#DOB").val(), $(".pnd78"), 78);
            my_widget_script.addDays($("#DOB").val(), $(".pnd79"), 79);
            my_widget_script.addDays($("#DOB").val(), $(".pnd80"), 80);
            my_widget_script.addDays($("#DOB").val(), $(".pnd81"), 81);
            my_widget_script.addDays($("#DOB").val(), $(".pnd82"), 82);
            my_widget_script.addDays($("#DOB").val(), $(".pnd83"), 83);
            my_widget_script.addDays($("#DOB").val(), $(".pnd84"), 84);
            my_widget_script.addDays($("#DOB").val(), $(".pnd85"), 85);
            my_widget_script.addDays($("#DOB").val(), $(".pnd86"), 86);
            my_widget_script.addDays($("#DOB").val(), $(".pnd87"), 87);
            my_widget_script.addDays($("#DOB").val(), $(".pnd88"), 88);
            my_widget_script.addDays($("#DOB").val(), $(".pnd89"), 89);
            my_widget_script.addDays($("#DOB").val(), $(".pnd90"), 90);
            my_widget_script.addDays($("#DOB").val(), $(".pnd91"), 91);
        }
    },

    watchForPPS: function () {
        // Function to check if PPS has happened, and find what the earliest date with open PPS marked is

        var hasReachedPPS = false;
        var thisPndAtPPS, thisPPSDate;
        var pndAtPPS, dateAtPPS;

        $(".PPS_state").each(function () {
            var $this = $(this);
            // if the state is PPS
            if($this.val()==="PPS") {
                $(".ifPPS").show();
                hasReachedPPS = true;
                thisPndAtPPS = $this.closest(".addedRow").find(".mat_pnd").text();
                thisPPSDate = $this.closest(".addedRow").find(".mat_date").text();

                if(dateAtPPS) { //if there's a value for dateAtPPS
                    if(new Date(thisPPSDate).getTime() < new Date(dateAtPPS).getTime()) { //if this date is earlier than current dateAtPPS
                        dateAtPPS = thisPPSDate;
                        pndAtPPS = thisPndAtPPS;
                    }
                } else { //if no dateAtPPS
                    dateAtPPS = thisPPSDate;
                    pndAtPPS = thisPndAtPPS;
                }

                $this.css("background-color", "yellow").closest(".row").css("background-color", "yellow"); 
            } else {
                $this.css("background-color", "").closest(".row").css("background-color", ""); 
            }
        });

        if(hasReachedPPS){
            $(".PPS_status").removeClass("notReached").addClass("reached").text("has");
            $(".PPS_PND_calc").text(pndAtPPS);
            $(".PPS_date_calc").text(dateAtPPS);
            my_widget_script.watchPPS_mass(true);
        } else {
            $(".ifPPS").hide();
            $(".PPS_status").removeClass("reached").addClass("notReached").text("has NOT yet");
            $(".PPS_PND_calc").text("NA");
            $(".PPS_mass_calc").text("NA");
            $(".PPS_date_calc").text("NA");
        }

        my_widget_script.resize();
    },

    watchPPS_mass: function (knownStatus) {
        var hasReachedPPS = false;
        
        if(knownStatus === true) {
            hasReachedPPS = true;
        } else {
            $(".PPS_state").each(function () {
                $this = $(this);
                // if the state is PPS
                if($this.val()==="PPS") {
                    hasReachedPPS = true;
                    return false;
                }
            });
        }

        if(hasReachedPPS){
            var $PPS_massVal = $("#PPS_mass").val();
            if($PPS_massVal) {
                $(".PPS_mass_calc").text($PPS_massVal);
            } else {
                $(".PPS_mass_calc").text("[Enter PPS Mass]")
            }
        } else {
            $(".PPS_mass_calc").text("NA");
        }
    },

    switchMassTable: function (pnd) {
        if(pnd){
            var $massDiv = $("._"+pnd);
            $massDiv.show();
            $(".massDiv:not(._"+pnd).hide();
            my_widget_script.resize();
        } else {
            $(".massDiv").hide();
        }

        my_widget_script.resize();
    },

    createMaturationRow_PPS: function (dateInputVal) {
        var $div, selectBaseName, textareaBaseName, rowCount, selectName, textareaName, pndValue;
        $div = $("#PPS_div");
        selectBaseName = "ppscheck_";
        textareaBaseName = "ppscheck_other_";

        rowCount = $div.find(".addedRow").length + 1;
        rowClassName = "Row_" + rowCount;
        selectName = selectBaseName + rowCount;
        textareaName = textareaBaseName + rowCount;
        
        pndValue = my_widget_script.getPND(dateInputVal);


        $div.append(
            $("<div/>", {
                "class": "row mt-2 addedRow " + rowClassName
            }).append(
                $("<div/>", {
                    "class": "col"
                }).append(
                    $("<select/>", {
                        name: selectName,
                        id: selectName,
                        "class": "PPS_state fullWidth PPS"
                    }).append(
                        '<option value="No">No</option>',
                        '<option value="Almost">Almost</option>',
                        '<option value="No Red">No Red</option>',
                        '<option value="PPS">Open</option>',
                        '<option value="Other">Other</option>'
                    ).on("change", function () {
                        my_widget_script.watchForPPS();
                        if($(this).val() === "Other") {
                            $(this).next(".ifOther").show();
                        } else {
                            $(this).next(".ifOther").hide();
                        }
                    })
                ).append(
                    $("<text" + "area></text" + "area>", {
                        name: textareaName,
                        id: textareaName,
                        rows: 2,
                        "class": "PPS fullWidth ifOther"
                    })
                )
            ).append(
                $("<div/>", {
                    "class": "col mat_date"
                }).append(dateInputVal)
            ).append(
                $("<div/>", {
                    "class": "col mat_pnd"
                }).append(pndValue)
            )
        );

        my_widget_script.resize();
    },

    removeMaturationRow: function (whichPheno) {
        if(whichPheno === "PPS"){
            var $div = $("#PPS_div");
        }
        $div.find(".addedRow").last().remove();
    },

    calcValues: function () {
        $(".tableDiv").find("tr").each(function () { //for each row
            $("td", this).each(function () { //for each cell
                var value = $(this).text(); //get the value of the text
                if (value === "" || value === "NaN") { //if blank or NaN
                    $(this).text("NA"); //make NA
                }
            })
        });

        //resize the tableDiv
        my_widget_script.resize();
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

        // the div has to be showing in order to be copied
        $divForCopy.show();
        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $divForCopy.hide();
        $temp.remove(); //remove temp
    },

    toggleTableFuncs: function ($tableDiv, $errorMsgDiv) {
        my_widget_script.resize();
        my_widget_script.data_valid_form($errorMsgDiv); //run to give error, but allow to calc regardless
        my_widget_script.calcValues();
        $tableDiv.toggle();
        my_widget_script.parent_class.resize_container();
    },

    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form($errorMsg);

        if (data_valid) {
            my_widget_script.calcValues();
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form($errorMsg);
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
    }
};