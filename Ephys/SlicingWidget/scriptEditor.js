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

        // Add * and # to mark required field indicators
        this.addRequiredFieldIndicators();

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode, parsedJson);

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
            numExtAdds: dynamicContent.numExtAdds,
            numIntAdds: dynamicContent.numIntAdds
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
            numExtAdds: 1,
            numIntAdds: 1
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
        for (var i = 0; i < parsedJson.numExtAdds; i++) {
            my_widget_script.addSoln("external");
        };

        for (var i=0; i < parsedJson.numIntAdds; i++) {
            my_widget_script.addSoln("internal");
        }
    },

    /**
     * TO DO: edit this function to define how the HTML elements should be adjusted
     * based on the current mode.
     * 
     * Here, a subset of buttons are disabled when the widget is not being edited.
     * There may be other elements that should be shown/hidden based on the mode
     */
    adjustForMode: function (mode, parsedJson) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);

            $("#tableDiv").show();
        }
    },

    checkSexAndGonadStatus: function () {
        if ($("#sex").val() === "female") { //if female
            $(".female:not(.isIntact)").show(); //show female class elements that don't have isIntact class
            $(".anySex:not(.isIntact)").show(); // show anySex class elements that don't have isIntact class
            if ($("#gonadstatus").val() === "intact") {
                $(".cycle").show(); //only show cycle if female and intact
                $(".isIntact").show();  // show isIntact class elements
                $(".gdx").hide();
            } else if($("#gonadstatus").val() === "gdx") {
                $(".isIntact").hide();
                $(".gdx").show();
                $(".cycle").hide();
            } else {
                $(".isIntact").hide();
                $(".gdx").hide();
                $(".cycle").hide();
            }
            $(".male").hide(); //hide all male class elements. At end to resolve any isIntact male class elements
        } else if ($("#sex").val() === "male") { //if male
            $(".male:not(.isIntact)").show(); //show male class elements
            $(".anySex:not(.isIntact)").show();
            if ($("#gonadstatus").val() === "intact") {
                $(".isIntact").show();  // show isIntact class elements
                $(".gdx").hide();
            } else if($("#gonadstatus").val() === "gdx") {
                $(".isIntact").hide();
                $(".gdx").show();
            } else {
                $(".isIntact").hide();
                $(".gdx").hide();
            }
            $(".female").hide(); //hide female class elements
            $(".cycle").hide(); //hide cycles for male
        } else { //if no sex
            if ($("#gonadstatus").val() === "intact") {
                $(".isIntact").show();  // show isIntact class elements
            } else if($("#gonadstatus").val() === "gdx") {
                $(".isIntact").hide();
                $(".gdx").show();
            } else {
                $(".isIntact").hide();
                $(".gdx").hide();
            }
            $(".female").hide(); //hide female class elements
            $(".male").hide(); //hide male class elements
            $(".cycle").hide(); //hide cycles
            $(".anySex").hide(); //hide anySex
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        //Show/hide the table
        $("#selectTable").on("change", function () { //when the showTable button is clicked. Run this function
            var tableID = $(this).val();
            if(tableID) {
                my_widget_script.toggleTableFuncs(tableID);
            } else {
                $(".outTable").hide();
                $("#errorMsg").text("");
            }
        });

        //when the calculate button is clicked, run the calcValues function
        $('#calculate').on("click", function () {
            my_widget_script.calcTableFuncs();
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('#toCSV').on("click", function () {
            var selectedTable = prompt(
                "Which table would you like to copy?\n" +
                "Enter '1' for KNDy PNA Extracellular Analysis Project\n" +
                "Enter '2' for the standard lab output table\n" + 
                "Enter '3' for the external additions table\n" + 
                "Enter '4' for the internal additions table\n"
            );
            var tableID, fileName;
            switch (selectedTable) {
                case '1':
                    tableID = "AmandaOutTable";
                    fileName = "recordingNotes_" + $("#MouseID").val();
                    break;
                case '2':
                    tableID = "labOutTable";
                    fileName = "recordingNotes_" + $("#MouseID").val();
                    break;
                case '3':
                    tableID = "externalAdditionsTable";
                    fileName = "externalSolutionAdditions_" + $("#MouseID").val();
                    break;
                case '4': 
                    tableID = "internalAdditionsTable";       
                    fileName = "internalSolutionAdditions_" + $("#MouseID").val();
                    break;     
                default:
                    tableID = "labOutTable";
                    fileName = "recordingNotes_" + $("#MouseID").val();
                    break;
            }

            var $errorMsg = $("#errorMsg");
            
            my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            var selectedTable = prompt(
                "Which table would you like to copy?\n" +
                "Enter '1' for KNDy PNA Extracellular Analysis Project\n" +
                "Enter '2' for the standard lab output table\n" + 
                "Enter '3' for the external additions table\n" + 
                "Enter '4' for the internal additions table\n"
            );
            
            var $tableToCopy;
            switch (selectedTable) {
                case '1':
                    $tableToCopy = $("#AmandaOutTable");
                    break;
                case '2':
                    $tableToCopy = $("#labOutTable");
                    break;
                case '3':
                    $tableToCopy = $("#externalAdditionsTable");
                    break;
                case '4': 
                    $tableToCopy = $("#internalAdditionsTable");       
                    break;     
                default:
                    $tableToCopy = $("#labOutTable");
                    break;
            }
            var $copyHead = $("#copyHead");
            var $tableDiv = $("#tableDiv");
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
        });

        //when the showGoogleDoc button is clicked, resize the containers, and toggle visability
        $("#showGoogleDoc").on("click", function () {
            $("#labGoogleSheet").toggle();
            my_widget_script.resize();
            $("#forFocus").focus();
        });

        //Show/hide elements based on sex
        $("#sex").on("change", function () { //when sex is changed
            my_widget_script.checkSexAndGonadStatus();
        });

        //Show/hide elements based on gonad status
        $("#gonadstatus").on("change", function () { //when gonad status is changed
            my_widget_script.checkSexAndGonadStatus();
            my_widget_script.calcSurgeryDate();
        });

        $("#surgerydate").on("input", function () {
            my_widget_script.calcSurgeryDate();
        })

        $("#implantBox").on("change", function () {
            if ($("#implantBox").is(":checked")) {
                $(".implant").show() //show implant class elements
            } else {
                $(".implant").hide()
            }
        });

        $("#addToExternal").on("click", function () {
            my_widget_script.addSoln("external");
        });

        $("#addToInternal").on("click", function () {
            my_widget_script.addSoln("internal");
        });

        $("#removeLastExternal").on("click", function () {
            my_widget_script.removeSoln("external");
        });

        $("#removeLastInternal").on("click", function () {
            my_widget_script.removeSoln("internal");
        });
        
        // Output table calculations
        $(".simpleCalc").on("input", function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });
        
        $(".implantCalc").on("change", function () {
            my_widget_script.calcImplant();
        });

        $("#Treatment").on("change", function () {
            my_widget_script.calcGenTreatment();
        });

        $(".cycleCalc").on("change", function () {
            my_widget_script.calcCycleStage();
        });

        $(".massCalc").on("input", function () {
            my_widget_script.calcUterineMass();
            my_widget_script.calcUterineMass_perBodyMass();
            my_widget_script.calcGonadMass_perBodyMass();
        });

        $(".ageCalc").on("input", function () {
            my_widget_script.calcAgeInDays();
        });

        $("#Saved_pit").on("change", function () {
            my_widget_script.calcSavedPit();
        });

        $(".timeCalc").on("input", function () {
            my_widget_script.calcHoursPostLightsOn();
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

        my_widget_script.checkSexAndGonadStatus();

        if ($("#implantBox").is(":checked")) {
            $(".implant").show() //show implant class elements
        } else {
            $(".implant").hide()
        };
        
        //Run the calculate values function to fill with the loaded data
        this.calcValues();

        $("#selectTable").val("labOutTable");

        $("#labOutTable").show();

        my_widget_script.resize();
    },

    /**
     * TO DO: edit this function to define which <div>s or other elements
     * should be adjusted based on the current width of the window
     */
    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();

        //Change height of frame
        var frameHeight = window.innerHeight;

        //Change width of frame
        var frameWidth = window.innerWidth * .9;

        $("#sheetFrame").prop("height", frameHeight).prop("width", frameWidth);
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        numExtAdds = $("#externalAdditionsTable").find("tbody tr").length;
        numIntAdds = $("#internalAdditionsTable").find("tbody tr").length;
        var dynamicContent = {
            numExtAdds: numExtAdds,
            numIntAdds: numIntAdds
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

        //search the_form for all elements that are of class "needForTable"
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

    calcGenTreatment: function () {
        // for normal treatment
        // if want text from selected, instead of value $("#Treatment").children("option:selected").text())

        if (
            $("#Treatment").val() === "CON" || //if Treatment_calc equals CON, CON_main, or VEH,
            $("#Treatment").val() === "CON_main" ||
            $("#Treatment").val() === "VEH"
            ) {
                $(".GenTreatment_calc").text("Control"); //GenTreatment_calc equals "Control"
        } else if($("#Treatment").val() === "DHT") {
            $(".GenTreatment_calc").text("PNA"); //else equals "PNA"
        } else {
            $(".GenTreatment_calc").text("NA");
        }
    },

    calcCycleStage: function () {
        if ($("#sex").val() === "female" && $("#gonadstatus").val() === "intact") { //only for intact females
            $(".CycleStage_calc").text($("#CycleStage").val());
            my_widget_script.watchValue($("#stageComment"), $(".stageComment_calc"));
        } else {
            $(".CycleStage_calc").text("NA");
            $(".stageComment_calc").text("NA");
        }
    },

    calcUterineMass: function () {
        var gonadMass;
        if ($("#sex").val() === "female") {
            var gonadMass = $("#gonadMass").val();
        }

        if (isFinite(gonadMass) && gonadMass) {
            $(".uterineMass_calc").text(gonadMass);
        } else {
            $(".uterineMass_calc").text("NA");
        }
    },

    calcUterineMass_perBodyMass: function () {
        var uterine_mg_per_g;
        if ($("#sex").val() === "female") {
            var uterine_mg_per_g = $("#gonadMass").val() / $("#BodyMass_g").val();
        }

        if (isFinite(uterine_mg_per_g) && uterine_mg_per_g) {
            $(".uterine_mg_per_g_calc").text(uterine_mg_per_g.toFixed(4));
        } else {
            $(".uterine_mg_per_g_calc").text("NA");
        }
    },

    calcGonadMass_perBodyMass: function () {
        var gonad_mg_per_g = $("#gonadMass").val() / $("#BodyMass_g").val();
        if(isFinite(gonad_mg_per_g) && gonad_mg_per_g){
            $(".gonad_mg_per_g_calc").text(gonad_mg_per_g.toFixed(4));
        } else {
            $(".gonad_mg_per_g_calc").text("NA");
        }
    },

    calcAgeInDays: function () {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var DOBisDay = parseInt($("#DOB_equals").val());
        var Recording_date_as_ms = new Date($("#Recording_date").val()).getTime();
        var DOB_as_ms = new Date($("#Date_of_birth").val()).getTime();
        var Age_in_days = (Recording_date_as_ms - DOB_as_ms) / (1000 * 3600 * 24) + DOBisDay;
        if(isFinite(Age_in_days)){
            $(".Age_in_days_calc").text(Age_in_days);
        } else {
            $(".Age_in_days_calc").text("NA");
        }
    },

    calcSavedPit: function () {
        if ($("#Saved_pit").is(":checked")) {
            var Saved_pit = "Y";
        } else {
            var Saved_pit = "N";
        }
        $(".Saved_pit_calc").text(Saved_pit);
    },

    calcHoursPostLightsOn: function () {
        //http://jsfiddle.net/44NCk/4/
        var time_sac = $("#Time_sac").val().split(":");
        if ($("#Daylight_Savings").val() === "Y") { //if daylight savings time
            var lights_on = "04:00"; //lights on at 4am
            var lights_on_split = lights_on.split(":");
        } else if ($("#Daylight_Savings").val() === "N") {
            var lights_on = "03:00" //otherwise, lights on at 3a
            var lights_on_split = lights_on.split(":");
        } else {
            $(".Sac_hr_calc").text("Select daylight saving");
            return
        }
        var hours_sac = parseInt(time_sac[0], 10), //get the hours component for time sac
            hours_lights = parseInt(lights_on_split[0], 10),
            min_sac = parseInt(time_sac[1], 10), //get the min component
            min_lights = parseInt(lights_on_split[1], 10);
        var hours = hours_sac - hours_lights, mins = 0; //subtract time of sac from lights on
        if (hours < 0) hours = 24 + hours; //if a negative number, add 24
        if (min_sac >= min_lights) { //if the min time of sac is greater than min time lights on
            mins = min_sac - min_lights; //subtract as is
        } else {
            mins = (min_sac + 60) - min_lights; //otherwise add 60 min and remove an hour
            hours--;
        }

        mins = mins / 60; //divide min by 60 to get decimal
        hours += mins; //add min to hours
        hours = hours.toFixed(3); //three decimal points
        if (isFinite(hours)) {
            $(".Sac_hr_calc").text(hours);
        } else {
            $(".Sac_hr_calc").text("NA");
        }
        
    },

    calcSurgeryDate: function () {
        if($("#gonadstatus").val()==="gdx") {
            my_widget_script.watchValue($("#surgerydate"), $(".surgerydate_calc"));
        } else {
            $(".surgerydate_calc").text("NA");
        }
    },

    calcImplant: function () {
        if ($("#implantBox").is(":checked")) {
            $(".implant_calc").text("TRUE");
            my_widget_script.watchValue($("#implantType"), $(".implantType_calc"));
            my_widget_script.watchValue($("#implantDate"), $(".implantDate_calc"));
            my_widget_script.watchValue($("#implantcomment"), $(".implantcomment_calc"));
        } else {
            $(".implant_calc").text("FALSE");
            $(".implantType_calc").text("NA");
            $(".implantDate_calc").text("NA");
            $(".implantcomment_calc").text("NA");
        }
    },

    calcValues: function () {

        //Elements that just update based on input value
        $(".simpleCalc").each(function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });

        //generic treatment
        my_widget_script.calcGenTreatment();

        //Cycle stage
        my_widget_script.calcCycleStage();

        //uterine mass
        my_widget_script.calcUterineMass();

        //uterine mass per body mass
        my_widget_script.calcUterineMass_perBodyMass();

        //gonad mass per body mass
        my_widget_script.calcGonadMass_perBodyMass();

        //Age in days
        my_widget_script.calcAgeInDays();

        //saved pituitary
        my_widget_script.calcSavedPit();

        //Hours since lights on
        my_widget_script.calcHoursPostLightsOn();

        //Surgery date
        my_widget_script.calcSurgeryDate();

        //Implant calculations
        my_widget_script.calcImplant();

        $(".outTable tr").each(function () { //for each row
            $("td", this).each(function () { //for each cell
                var value = $(this).text(); //get the value of the text
                if (value === "" || value === "NaN" || value === "___" || value === "Select daylight saving") { //if blank or NaN
                    $(this).text("NA"); //make NA
                }
            })
        });

        //resize the container
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
                    // console.log($(this).text());
                    $temp.text($temp.text() + addTab + $(this).text());
                    addTab = "\t";
                });
            });
            addLine = "\n";
        }

        // console.log("temp after head: " + $temp.text());

        $table.find("tbody").children("tr").each(function () { //add each child of the row
            $temp.text($temp.text() + addLine);
            var addTab = "";
            $(this).find("td").each(function () {
                // console.log($(this).text());
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
        // console.log($temp.text());
        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    /**
     * Set of functions when toggleTableButton clicked
     * resize, run data_valid_form, run calcValues, 
     * toggle the table (show/hide), resize the container
     * 
     * @param {*} $table - jQuery object that is the table that will be shown/hidden
     */
    toggleTableFuncs: function (tableName) {
        my_widget_script.resize();
        my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
        my_widget_script.calcValues();
        var $table = $("#"+tableName);
        $table.show();
        $(".outTable:not(#"+tableName).hide();
        my_widget_script.parent_class.resize_container();
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

    makeSheetIframe: function (show) {
        if(show){
            var frameHeight = window.innerHeight;
            var frameWidth = window.innerWidth * .9;
            var iframeHTML = '<iframe id="sheetFrame" width="' + frameWidth + 'px" height="' + frameHeight + 'px" src="https://docs.google.com/spreadsheets/d/18s84qpAjEYcbvC4cn_6BaMAZXi8em_mEMkldO7pK_0Y/edit?usp=sharing&amp;single=true&amp;widget=true&amp;headers=false" frameborder="0" scrolling="auto"></iframe><p>&nbsp;</p>'
            $("#labGoogleSheet").html(iframeHTML).show();
            $("#forCopy").focus();
        } else {
            $("#labGoogleSheet").html("").hide();
        }
    },

    addSoln: function (internalOrExternal) {
        var $solnDiv, basename
        if(internalOrExternal === "internal") {
            $solnDiv = $("#internalAdditionsDiv");
            basename = "internal";
            $solnTable = $("#internalAdditionsTable");
        } else {
            $solnDiv = $("#externalAdditionsDiv");
            basename = "external";
            $solnTable = $("#externalAdditionsTable");
        }

        var additionCount = $solnDiv.find(".addition").length + 1;
        var additionID = basename + "_addition_" + additionCount;
        var calcClass = additionID + "_calc"; 
        var additionDateID = basename + "_additiondate_" + additionCount;
        var dateCalcClass = additionDateID + "_calc";

        var additionLabelHTML = '<div class="mt-2">Addition ' + additionCount + ' Name</div>';
        var additionalDateLabelHTML = '<div class="mt-2">Addition ' + additionCount + ' Date</div>';

        $solnDiv.append(
            $('<div></div>', {
                class: "addition",
                id: additionID + "_div"
            }).append(
                additionLabelHTML
            ).append(
                $('<div></div>').append(
                    $('<input/>', {
                        id: additionID,
                        name: additionID,
                        class: "fullWidth simpleCalc"
                    }).on("input", function () {
                        var elementID = this.id;
                        var calcID = "." + elementID + "_calc";
                        my_widget_script.watchValue($(this), $(calcID));
                    })
                )
            ).append(
                additionalDateLabelHTML
            ).append(
                $('<div></div>').append(
                    $('<input/>', {
                        id: additionDateID,
                        name: additionDateID,
                        class: "fullWidth simpleCalc",
                        type: "date"
                    }).on("input", function () {
                        var elementID = this.id;
                        var calcID = "." + elementID + "_calc";
                        my_widget_script.watchValue($(this), $(calcID));
                    })
                )
            )
        );

        $solnTable.find("tbody").append(
            $('<tr></tr>').append(
                $('<td></td>', {
                    class: calcClass
                })
            ).append(
                $('<td></td>', {
                    class: dateCalcClass
                })
            )
        )

        //resize the container
        my_widget_script.resize();
    },

    removeSoln: function (internalOrExternal) {
        var $solnDiv, basename
        if(internalOrExternal === "internal") {
            $solnDiv = $("#internalAdditionsDiv");
            basename = "internal";
            $solnTable = $("#internalAdditionsTable");
        } else {
            $solnDiv = $("#externalAdditionsDiv");
            basename = "external";
            $solnTable = $("#externalAdditionsTable");
        }

        $solnDiv.find(".addition").last().remove();
        $solnTable.find("tbody tr").last().remove();
    }
};