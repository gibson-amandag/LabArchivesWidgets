my_widget_script =
{
    init: function (mode, json_data) {
        //this method is called when the form is being constructed
        // parameters
        // mode = 'view' 'edit' 'view_dev' or 'edit_dev'

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

        // Set up the form based on previously entered form input
        this.setUpInitialState();

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
            numPupsP4: dynamicContent.numPupsP4,
            numPupsP11: dynamicContent.numPupsP11,
            tailMarksP11: dynamicContent.tailMarksP11,
            numPupsP2: dynamicContent.numPupsP2,
            numPupsP9: dynamicContent.numPupsP9,
            tailMarksP9: dynamicContent.tailMarksP9
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

        var tailMarksP11 = [];
        tailMarksP11[0] = "<span style='color:blue'>Test</span>"
        tailMarksP11[1] = "<span style='color:red'>Test2</span>"

        var tailMarksP9 = [];
        tailMarksP9[0] = "<span style='color:blue'>P9 Test</span>"
        tailMarksP9[1] = "<span style='color:red'>P9 Test2</span>"
        tailMarksP9[2] = "<span style='color:blue'>P9 Test3</span>"

        var output = {
            widgetData: testData,
            numPupsP4: 2,
            numPupsP11: 2,
            tailMarksP11: tailMarksP11,
            numPupsP2: 3,
            numPupsP9: 3,
            tailMarksP9: tailMarksP9,
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
        for (var i = 0; i < parsedJson.numPupsP4; i++) {
            var $table = $("#offspringMassP4");
            var $avgMass = $(".avgMassP4");
            var whichPara = "p4_11";
            my_widget_script.createRow_startPara($table, $avgMass, whichPara);
        }

        for (var i = 0; i < parsedJson.numPupsP11; i++) {
            var $tableDemo = $("#offspringDemoP11");
            var whichPara = "p4_11";
            my_widget_script.createRow_offDemo($tableDemo, whichPara);

            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            $("#offspringDemoP11").find(rowClassName).find(".tailMark").html(parsedJson.tailMarksP11[i]);

            my_widget_script.createRows_allMassTables(whichPara);
        }

        for (var i = 0; i < parsedJson.numPupsP2; i++) {
            var $table = $("#offspringMassP2");
            var $avgMass = $(".avgMassP2");
            var whichPara = "p2_9";
            my_widget_script.createRow_startPara($table, $avgMass, whichPara);
        }

        for (var i = 0; i < parsedJson.numPupsP9; i++) {
            var $tableDemo = $("#offspringDemoP9");
            var whichPara = "p2_9";
            my_widget_script.createRow_offDemo($tableDemo, whichPara);

            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            $("#offspringDemoP9").find(rowClassName).find(".tailMark").html(parsedJson.tailMarksP9[i]);

            my_widget_script.createRows_allMassTables(whichPara);
        }

        $(".numPupsP11").text(parsedJson.numPupsP11);
        $(".numPupsP9").text(parsedJson.numPupsP9);

    },

    /**
    * TO DO: edit this function to define how the HTML elements should be adjusted
    * based on the current mode.
    */
    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $("#addPupP4").prop('disabled', true);
            $("#removePupP4").prop('disabled', true);
            $("#addPupP11").prop('disabled', true);
            $("#removePupP11").prop('disabled', true);
            $("#addPupP2").prop('disabled', true);
            $("#removePupP2").prop('disabled', true);
            $("#addPupP9").prop('disabled', true);
            $("#removePupP9").prop('disabled', true);
            $(".hideView").hide();
            $(".massTable.demo").show();
            $(".massTableP2.demo").show();
            $("#offspringDemoP11").hide();
            if ($("#treatmentPeriod").val()) {
                $("#offspringMassOutDiv").show();
                $("#damOutDiv").show();
            }
        }
    },

    /**
    * TO DO: edit this function to define behavior when the user interacts with the form.
    * This could include when buttons are clicked or when inputs change.
    */
    addEventListeners: function () {
        //When DamID changes, update pup IDs
        $("#damID").on("input", function () {
            for (var i = 0; i < my_widget_script.countPups($("#offspringDemoP11")); i++) {
                var rowCount = i + 1;
                var whichPara = "p4_11"
                var rowClass = ".Row_" + rowCount;
                var col2CalcClass = ".idcalc_" + whichPara + "_" + rowCount;
                var $tableDemoP11 = $("#offspringDemoP11");
                $(col2CalcClass).text(
                    $("#damID").val() + "_" + $tableDemoP11.find(rowClass).find(".idCol").val()
                );
            }

            for (var i = 0; i < my_widget_script.countPups($("#offspringDemoP9")); i++) {
                var rowCount = i + 1;
                var whichPara = "p2_9"
                var rowClass = ".Row_" + rowCount;
                var col2CalcClass = ".idcalc_" + whichPara + "_" + rowCount;
                var $tableDemoP9 = $("#offspringDemoP9");
                $(col2CalcClass).text(
                    $("#damID").val() + "_" + $tableDemoP9.find(rowClass).find(".idCol").val()
                );
            }
        });

        //Show/hide the table
        $("#toggleTable").on("click", function () { //when the showTable button is clicked. Run this function
            my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
            $("#offspringMassOutDiv").toggle();
            my_widget_script.resize();
        });

        $("#toggleTableDam").on("click", function () { //when the showTable button is clicked. Run this function
            my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
            $("#damOutDiv").toggle();
            my_widget_script.resize();
        });

        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSV').on("click", function () {
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.runCSV_buttonFunc(whichPara, "offspring");
        });

        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSVDam').on("click", function () {
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.runCSV_buttonFunc(whichPara, "dam");
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.copyData_buttonFunc(whichPara, "offspring", $("#copyHead"));
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButtonDam").on("click", function () {
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.copyData_buttonFunc(whichPara, "dam", $("#copyHeadDam"));
        });

        $("#DOB").on("input", function () {
            my_widget_script.printPND_days();
            my_widget_script.resize();
        });

        $("#treatmentPeriod").on("change", function () {
            my_widget_script.switchTreatmentPeriod($(this).val());
            my_widget_script.resize();
        });

        $("#showDatesP4").on("change", function () {
            if ($(this).is(":checked")) {
                $("#datesList").show();
            } else {
                $("#datesList").hide();
            }
            my_widget_script.resize();
        });

        $("#showDatesP2").on("change", function () {
            if ($(this).is(":checked")) {
                $("#datesListP2").show();
            } else {
                $("#datesListP2").hide();
            }
            my_widget_script.resize();
        });

        $("#addPupP4").on("click", function () {
            var $table = $("#offspringMassP4");
            var $numPups = $(".numPupsP4");
            var $avgMass = $(".avgMassP4");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.addPupStartFuncs($table, $numPups, $avgMass, whichPara);
        });

        $("#addPupP2").on("click", function () {
            var $table = $("#offspringMassP2");
            var $numPups = $(".numPupsP2");
            var $avgMass = $(".avgMassP2");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.addPupStartFuncs($table, $numPups, $avgMass, whichPara);
        });

        $("#removePupP4").on("click", function () {
            var $table = $("#offspringMassP4");
            var $avgMass = $(".avgMassP4");
            var $numPups = $(".numPupsP4");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.removePupStartFuncs($table, $numPups, $avgMass, whichPara);
        });

        $("#removePupP2").on("click", function () {
            var $table = $("#offspringMassP2");
            var $avgMass = $(".avgMassP2");
            var $numPups = $(".numPupsP2");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.removePupStartFuncs($table, $numPups, $avgMass, whichPara);
        });

        $("#addPupP11").on("click", function () {
            var $tableDemo = $("#offspringDemoP11");
            var $numPups = $(".numPupsP11");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.addPupEndFuncs($tableDemo, $numPups, whichPara);
        });

        $("#addPupP9").on("click", function () {
            var $tableDemo = $("#offspringDemoP9");
            var $numPups = $(".numPupsP9");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.addPupEndFuncs($tableDemo, $numPups, whichPara);
        });

        $("#removePupP11").on("click", function () {
            var $tableDemo = $("#offspringDemoP11");
            var $numPups = $(".numPupsP11");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.removePupEndFuncs($tableDemo, $numPups, whichPara);
        });

        $("#removePupP9").on("click", function () {
            var $tableDemo = $("#offspringDemoP9");
            var $numPups = $(".numPupsP9");
            var whichPara = $("#treatmentPeriod").val();
            my_widget_script.removePupEndFuncs($tableDemo, $numPups, whichPara);
        });

        $("#massDayP4_11").on("change", function () {
            my_widget_script.switchMassTable($(this).val());
            my_widget_script.resize();
        });

        $("#massDayP2_9").on("change", function () {
            my_widget_script.switchMassTableP2($(this).val());
            my_widget_script.resize();
        });

        $("#damMassP4").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".damMassP4_calc"));
        });

        $("#damMassP11").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".damMassP11_calc"));
        });

        $("#damMass_p4_11_p21").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".damMass_p4_11_p21_calc"));
        });

        $("#cameraP4").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".cameraP4_calc"));
        });

        $("#damMassP2").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".damMassP2_calc"));
        });

        $("#damMassP9").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".damMassP9_calc"));
        });

        $("#damMass_p2_9_p21").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".damMass_p2_9_p21_calc"));
        });

        $("#cameraP2").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".cameraP2_calc"));
        });

        $("#sacOrStop").on("input", function () {
            my_widget_script.updateCalculation($(this), $(".sacOrStop_calc"));
        })

    },

    /**
    * TO DO: edit this function to define how the form should be initilized based 
    * on the existing form values. This is particularly important for when the 
    * widget already has data entered, such as when saved to a page.
    */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 text-left text-sm-right");
        $('.myLeftCol2').addClass("col-6 col-md-4 col-lg-3 col-xl-2 text-right");

        //Print PND dates
        if ($("#DOB").val()) {
            my_widget_script.printPND_days();
        }

        //Show/hide based on treatment period
        my_widget_script.switchTreatmentPeriod($("#treatmentPeriod").val());

        //Calculate the individual masses at paradigm start
        $(".totalMass").each(function () {
            var $totalMass = $(this);
            my_widget_script.getIndividualMass($totalMass);
        });

        //Calculate number of pups and avg mass from P4 paradigm start
        my_widget_script.offspringCalculations($("#offspringMassP4"), $(".numPupsP4"), $(".avgMassP4"), "p4_11");

        //Calculate number of pups and avg mass from P2 paradigm start
        my_widget_script.offspringCalculations($("#offspringMassP2"), $(".numPupsP2"), $(".avgMassP2"), "p2_9");

        if ($("#showDatesP4").is(":checked")) {
            $("#datesList").show();
        } else { $("#datesList").hide(); }

        if ($("#showDatesP2").is(":checked")) {
            $("#datesListP2").show();
        } else { $("#datesListP2").hide(); }

        my_widget_script.switchMassTable($("#massDayP4_11").val());
        my_widget_script.switchMassTableP2($("#massDayP2_9").val());

        var numPupsP11 = my_widget_script.countPups($("#offspringDemoP11"));
        var numPupsP9 = my_widget_script.countPups($("#offspringDemoP9"));

        for (var i = 0; i < numPupsP11; i++) {
            var rowCount = i + 1;
            var whichPara = "p4_11";
            var $demoTable = $("#offspringDemoP11");

            my_widget_script.remakeEndParaTables(rowCount, whichPara, $demoTable);
        }

        for (var i = 0; i < numPupsP9; i++) {
            var rowCount = i + 1;
            var whichPara = "p2_9";
            var $demoTable = $("#offspringDemoP9");

            my_widget_script.remakeEndParaTables(rowCount, whichPara, $demoTable);
        }

        my_widget_script.updateCalculation($("#damMassP11"), $(".damMassP11_calc"));
        my_widget_script.updateCalculation($("#damMass_p4_11_p21"), $(".damMass_p4_11_p21_calc"));
        my_widget_script.updateCalculation($("#cameraP4"), $(".cameraP4_calc"));
        my_widget_script.updateCalculation($("#damMassP2"), $(".damMassP2_calc"));
        my_widget_script.updateCalculation($("#damMassP9"), $(".damMassP9_calc"));
        my_widget_script.updateCalculation($("#damMass_p2_9_p21"), $(".damMass_p2_9_p21_calc"));
        my_widget_script.updateCalculation($("#cameraP2"), $(".cameraP2_calc"));
        my_widget_script.updateCalculation($("#sacOrStop"), $(".sacOrStop_calc"));

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
        var numPupsP4 = my_widget_script.countPups($("#offspringMassP4"));
        var numPupsP11 = my_widget_script.countPups($("#offspringDemoP11"));
        var tailMarksP11 = [];
        for (var i = 0; i < numPupsP11; i++) {
            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            var tailMarkText = $("#offspringDemoP11").find(rowClassName).find(".tailMark").html();
            tailMarksP11[i] = tailMarkText;
        }

        var numPupsP2 = my_widget_script.countPups($("#offspringMassP2"));
        var numPupsP9 = my_widget_script.countPups($("#offspringDemoP9"));
        var tailMarksP9 = [];
        for (var i = 0; i < numPupsP11; i++) {
            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            var tailMarkText = $("#offspringDemoP9").find(rowClassName).find(".tailMark").html();
            tailMarksP9[i] = tailMarkText;
        }

        var dynamicContent = {
            numPupsP4: numPupsP4,
            numPupsP11: numPupsP11,
            tailMarksP11: tailMarksP11,
            numPupsP2: numPupsP2,
            numPupsP9: numPupsP9,
            tailMarksP9: tailMarksP9,
        }

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

    switchTreatmentPeriod: function (selectionVal) {
        switch (selectionVal) {
            case '':
                $(".p2_9").hide();
                $(".p4_11").hide();
                $(".selectPara").hide();
                break;
            case "p2_9":
                $(".p2_9").show();
                $(".p4_11").hide();
                $(".selectPara").show();
                break;
            case "p4_11":
                $(".p2_9").hide();
                $(".p4_11").show();
                $(".selectPara").show();
                break;
        }
    },

    switchMassTable: function (selectionVal) {
        switch (selectionVal) {
            case "demo":
                $(".massTable.demo").show();
                $(".massTable:not(.demo)").hide();
                break;
            case "p11":
                $(".massTable.p11").show();
                $(".massTable:not(.p11)").hide();
                break;
            case "p12":
                $(".massTable.p12").show();
                $(".massTable:not(.p12)").hide();
                break;
            case "p13":
                $(".massTable.p13").show();
                $(".massTable:not(.p13)").hide();
                break;
            case "p14":
                $(".massTable.p14").show();
                $(".massTable:not(.p14)").hide();
                break;
            case "p15":
                $(".massTable.p15").show();
                $(".massTable:not(.p15)").hide();
                break;
            case "p16":
                $(".massTable.p16").show();
                $(".massTable:not(.p16)").hide();
                break;
            case "p19":
                $(".massTable.p19").show();
                $(".massTable:not(.p19)").hide();
                break;
            case "p21":
                $(".massTable.p21").show();
                $(".massTable:not(.p21)").hide();
                break;
        }
    },

    switchMassTableP2: function (selectionVal) {
        switch (selectionVal) {
            case "demo":
                $(".massTableP2.demo").show();
                $(".massTableP2:not(.demo)").hide();
                break;
            case "p9":
                $(".massTableP2.p9").show();
                $(".massTableP2:not(.p9)").hide();
                break;
            case "p10":
                $(".massTableP2.p10").show();
                $(".massTableP2:not(.p10)").hide();
                break;
            case "p11":
                $(".massTableP2.p11").show();
                $(".massTableP2:not(.p11)").hide();
                break;
            case "p12":
                $(".massTableP2.p12").show();
                $(".massTableP2:not(.p12)").hide();
                break;
            case "p13":
                $(".massTableP2.p13").show();
                $(".massTableP2:not(.p13)").hide();
                break;
            case "p15":
                $(".massTableP2.p15").show();
                $(".massTableP2:not(.p15)").hide();
                break;
            case "p17":
                $(".massTableP2.p17").show();
                $(".massTableP2:not(.p17)").hide();
                break;
            case "p19":
                $(".massTableP2.p19").show();
                $(".massTableP2:not(.p19)").hide();
                break;
            case "p21":
                $(".massTableP2.p21").show();
                $(".massTableP2:not(.p21)").hide();
                break;
        }
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        var dateString = $startDateVal; //get the date string from the input

        var startDate = new Date(dateString);

        var offset = new Date().getTimezoneOffset(); //get the offset of local time from GTC
        // this is necessary because making a Date object from the input date string creates a date with time of midnight GTC
        // for locales with different time zones, this means that the Date displayed could be the previous day

        //Add the number of days (in ms) and offset (in ms) to the start Date (in ms) and make it a new date object
        var newDate = new Date(startDate.getTime() + numDays * 24 * 60 * 60 * 1000 + offset * 60 * 1000);

        $newDateClass.text(newDate.toDateString());
    },

    printPND_days: function () {
        my_widget_script.addDays($("#DOB").val(), $(".pnd2"), 2);
        my_widget_script.addDays($("#DOB").val(), $(".pnd4"), 4);
        my_widget_script.addDays($("#DOB").val(), $(".pnd9"), 9);
        my_widget_script.addDays($("#DOB").val(), $(".pnd10"), 10);
        my_widget_script.addDays($("#DOB").val(), $(".pnd11"), 11);
        my_widget_script.addDays($("#DOB").val(), $(".pnd12"), 12);
        my_widget_script.addDays($("#DOB").val(), $(".pnd13"), 13);
        my_widget_script.addDays($("#DOB").val(), $(".pnd14"), 14);
        my_widget_script.addDays($("#DOB").val(), $(".pnd15"), 15);
        my_widget_script.addDays($("#DOB").val(), $(".pnd16"), 16);
        my_widget_script.addDays($("#DOB").val(), $(".pnd17"), 17);
        my_widget_script.addDays($("#DOB").val(), $(".pnd19"), 19);
        my_widget_script.addDays($("#DOB").val(), $(".pnd21"), 21);
    },

    createRow_startPara: function ($table, $avgMass, whichPara) {
        var rowCount = $table.find("tbody tr").length + 1;
        var rowClass = "Row_" + rowCount;
        var rowClasses = "massTableRow " + rowClass;

        var col1ID = "total_mass_" + whichPara + "_" + rowCount;
        var col2ID = "individual_mass_" + whichPara + "_" + rowCount;

        $table.find("tbody").append(
            $('<tr></tr>', { //add a new row        
                "class": rowClasses
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "number", //make it type "number"
                        class: "totalMass",
                        step: 0.1,
                        width: "5em"
                    }).on("change", function () {
                        $(".totalMass").each(function () { //update for each row
                            var $totalMass = $(this);
                            my_widget_script.getIndividualMass($totalMass);
                        });

                        var avgMass = my_widget_script.getAvgMass($table, whichPara);
                        $avgMass.text(avgMass);
                    })
                )
            ).append(
                $('<td></td>', {
                    id: col2ID,
                    "class": "individualMass"
                })
            )
        );

        //resize the container
        my_widget_script.resize();
    },

    createRow_offDemo: function ($table, whichPara) {
        var rowCount = $table.find("tbody tr").length + 1;
        var rowClass = "Row_" + rowCount;
        var rowClasses = "offDemoRow " + rowClass;

        var col1ID = "tail_" + whichPara + "_" + rowCount;
        var redButtonID = "redbutton_" + whichPara + "_" + rowCount;
        var blackButtonID = "blackbutton_" + whichPara + "_" + rowCount;
        var clearButtonID = "clearbutton_" + whichPara + "_" + rowCount;
        var col2ID = "id_" + whichPara + "_" + rowCount;
        var col3ID = "sex_" + whichPara + "_" + rowCount;

        var col1CalcClass = ".tailcalc_" + whichPara + "_" + rowCount;
        var col2CalcClass = ".idcalc_" + whichPara + "_" + rowCount;
        var col3CalcClass = ".sexcalc_" + whichPara + "_" + rowCount;

        $table.find("tbody").append(
            $('<tr></tr>', { //add a new row
                "class": rowClasses
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: redButtonID,
                        name: redButtonID,
                        type: "button",
                        class: "redButton",
                        value: "Red |"
                    }).on("click", function () {
                        $(this).parent().find(".tailMark").append(
                            "<span style='color:red'>|</span>"
                        );
                        $(col1CalcClass).html(
                            $(this).parent().find(".tailMark").html()
                        );
                    })
                ).append(
                    $('<input/>', { //append a new input to the td
                        id: blackButtonID,
                        name: blackButtonID,
                        type: "button",
                        class: "blackButton",
                        value: "Black |"
                    }).on("click", function () {
                        $(this).parent().find(".tailMark").append(
                            "<span style='color:black'>|</span>"
                        );
                        $(col1CalcClass).html(
                            $(this).parent().find(".tailMark").html()
                        );
                    })
                ).append(
                    $('<input/>', { //append a new input to the td
                        id: clearButtonID,
                        name: clearButtonID,
                        type: "button",
                        class: "clearButton",
                        value: "Clear"
                    }).on("click", function () {
                        $(this).parent().find(".tailMark").text(
                            ""
                        );
                        $(col1CalcClass).html(
                            $(this).parent().find(".tailMark").html()
                        );
                    })
                ).append(
                    $('<span></span>', {
                        "class": "tailMark"
                    })
                )
            ).append(
                $('<td></td>').append(
                    $('<select></select>', {
                        id: col2ID,
                        name: col2ID,
                        "class": "idCol needForTable"
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
                        $(col2CalcClass).text(
                            $("#damID").val() + "_" + $(this).val()
                        )
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<select></select>', { //append a new select to the td
                        id: col3ID,
                        name: col3ID,
                        "class": "sexCol needForTable"
                    }).append( //append options to the select tag
                        "<option value=''>[Select]</option>",
                        "<option value='F'>Female</option>",
                        "<option value='M'>Male</option>"
                    ).on("change", function () {
                        $(col3CalcClass).text(
                            $(this).val()
                        )
                    })
                )
            )
        );

        //resize the container
        my_widget_script.resize();
    },

    createRow_massTable: function ($table, whichPara, whichDay) {
        var rowCount = $table.find("tbody tr").length + 1;
        var rowClass = "Row_" + rowCount;
        var rowClasses = "offMassRow " + rowClass;
        var rowClassWDot = "." + rowClass;
        if (whichPara === "p4_11") {
            var $demoTable = $("#offspringDemoP11");
        } else if (whichPara === "p2_9") {
            var $demoTable = $("#offspringDemoP9");
        }

        var col1CalcClass = "tailcalc_" + whichPara + "_" + rowCount;
        var col2CalcClass = "idcalc_" + whichPara + "_" + rowCount;
        var col3CalcClass = "sexcalc_" + whichPara + "_" + rowCount;
        var col4ID = "mass_" + whichDay + "_" + whichPara + "_" + rowCount;

        //used for event listener
        var massCalcClass = ".massCalc_" + whichDay + "_" + whichPara + "_" + rowCount;

        var dropMassCol = false;
        if ($table.find("th").length === 3) {
            dropMassCol = true;
        }

        $table.find("tbody").append(
            $('<tr></tr>', { //add a new row
                "class": rowClasses
            }).append(
                $('<td></td>', {
                    "class": col1CalcClass
                }).append(
                    $demoTable.find(rowClassWDot).find(".tailMark").html()
                )
            ).append(
                $('<td></td>', {
                    "class": col2CalcClass
                }).append(
                    $("#damID").val() + "_" + $demoTable.find(rowClassWDot).find(".idCol").val()
                )
            ).append(
                $('<td></td>', {
                    "class": col3CalcClass
                }).append(
                    $demoTable.find(rowClassWDot).find(".sexCol").val()
                )
            ).append(
                $('<td></td>').append(
                    $('<input/>', {
                        id: col4ID,
                        name: col4ID,
                        type: "number"
                    }).on("input", function () {
                        $(massCalcClass).text(parseFloat($(this).val()).toFixed(1));
                    })
                )
            )
        );

        if (dropMassCol) {
            $table.find("#" + col4ID).parent().remove();
        }

        //resize the container
        my_widget_script.resize();
    },

    createRow_summaryMassTable: function ($table, whichPara) {
        var rowCount = $table.find("tbody tr").length + 1;
        var output = my_widget_script.calcForOutputTable(whichPara, rowCount);

        if (whichPara === "p4_11") {
            var $demoTable = $("#offspringDemoP11");
        } else if (whichPara === "p2_9") {
            var $demoTable = $("#offspringDemoP9");
        }

        $table.find("tbody").append(
            $('<tr></tr>', { //add a new row
                "class": output.rowClasses
            }).append( //Mouse_ID
                $('<td></td>', {
                    "class": output.col2CalcClass
                }).append(
                    //get id from demo table, if it already exists
                    $("#damID").val() + "_" + $demoTable.find(output.rowClassWDot).find(".idCol").val()
                )
            ).append( //ParaType
                $('<td></td>', {
                    "class": output.paraTypeClass
                }).append(
                    output.paraType
                )
            ).append( //Mass_P9
                $('<td></td>', {
                    "class": output.massCalcClasses[0]
                }).append(
                    output.massVals[0]
                )
            ).append( //Mass_P10
                $('<td></td>', {
                    "class": output.massCalcClasses[1]
                }).append(
                    output.massVals[1]
                )
            ).append( //Mass_P11
                $('<td></td>', {
                    "class": output.massCalcClasses[2]
                }).append(
                    output.massVals[2]
                )
            ).append( //Mass_P12
                $('<td></td>', {
                    "class": output.massCalcClasses[3]
                }).append(
                    output.massVals[3]
                )
            ).append( //Mass_P13
                $('<td></td>', {
                    "class": output.massCalcClasses[4]
                }).append(
                    output.massVals[4]
                )
            ).append( //Mass_P14
                $('<td></td>', {
                    "class": output.massCalcClasses[5]
                }).append(
                    output.massVals[5]
                )
            ).append( //Mass_P15
                $('<td></td>', {
                    "class": output.massCalcClasses[6]
                }).append(
                    output.massVals[6]
                )
            ).append( //Mass_P16
                $('<td></td>', {
                    "class": output.massCalcClasses[7]
                }).append(
                    output.massVals[7]
                )
            ).append( //Mass_P17
                $('<td></td>', {
                    "class": output.massCalcClasses[8]
                }).append(
                    output.massVals[8]
                )
            ).append( //Mass_P19
                $('<td></td>', {
                    "class": output.massCalcClasses[9]
                }).append(
                    output.massVals[9]
                )
            ).append( //Mass_P20
                $('<td></td>', {
                    "class": output.massCalcClasses[10]
                }).append(
                    output.massVals[10]
                )
            )
        );

        //resize the container
        my_widget_script.resize();
    },

    calcForOutputTable: function (whichPara, rowCount) {
        var rowClass = "Row_" + rowCount;
        var rowClasses = "offMassRow " + rowClass;

        var rowClassWDot = "." + rowClass;

        var paraType

        switch (whichPara) {
            case "p2_9":
                paraType = 2;
                break;
            case "p4_11":
                paraType = 4;
                break
            default:
                paraType = "NA";
                break;
        }

        var col2CalcClass = "idcalc_" + whichPara + "_" + rowCount;
        var paraTypeClass = "paraType_" + whichPara + "_" + rowCount;

        var massDays = ["p9", "p10", "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p19", "p21"];
        var massIDs = [];
        var massVals = [];
        var massCalcClasses = [];
        for (var i = 0; i < massDays.length; i++) {
            var massID = "#mass_" + massDays[i] + "_" + whichPara + "_" + rowCount;

            var massVal, massCalcClass
            if ($(massID)) {
                massCalcClass = "massCalc_" + massDays[i] + "_" + whichPara + "_" + rowCount;
            } else {
                massCalcClass = ""
            }

            if ($(massID).val()) {
                massVal = parseFloat($(massID).val()).toFixed(1);
            } else {
                massVal = "NA";
            }

            massIDs[i] = massID;
            massVals[i] = massVal;
            massCalcClasses[i] = massCalcClass;
        }

        var output = {
            rowClass: rowClass,
            rowClasses: rowClasses,
            rowClassWDot: rowClassWDot,
            paraType: paraType,
            col2CalcClass: col2CalcClass,
            paraTypeClass: paraTypeClass,
            massIDs: massIDs,
            massVals: massVals,
            massCalcClasses: massCalcClasses
        };
        return output;
    },

    createRows_allMassTables: function (whichPara) {
        if (whichPara === "p4_11") {
            var massTables = [
                $("#offspringDemoP11_nice"),
                $("#offspringMassP11"),
                $("#offspringMassP12"),
                $("#offspringMassP13"),
                $("#offspringMassP14"),
                $("#offspringMassP15"),
                $("#offspringMassP16"),
                $("#offspringMassP19"),
                $("#offspringMassP21")
            ];
            var massDays = ["demo", "p11", "p12", "p13", "p14", "p15", "p16", "p19", "p21"];
        } else if (whichPara === "p2_9") {
            var massTables = [
                $("#offspringDemoP9_nice"),
                $("#offspringMassP9_P9"),
                $("#offspringMassP9_P10"),
                $("#offspringMassP9_P11"),
                $("#offspringMassP9_P12"),
                $("#offspringMassP9_P13"),
                $("#offspringMassP9_P15"),
                $("#offspringMassP9_P17"),
                $("#offspringMassP9_P19"),
                $("#offspringMassP9_P21")
            ];
            var massDays = ["demo", "p9", "p10", "p11", "p12", "p13", "p15", "p17", "p19", "21"];
        }

        if (massDays) {
            for (var i = 0; i < massDays.length; i++) {
                var $table = massTables[i];
                var whichDay = massDays[i];
                my_widget_script.createRow_massTable($table, whichPara, whichDay);
            }
        }

        //Create row in summary table
        if (whichPara === "p4_11") {
            my_widget_script.createRow_summaryMassTable($("#offspringMassOutTable_p4_11"), whichPara);
        } else if (whichPara = "p2_9") {
            my_widget_script.createRow_summaryMassTable($("#offspringMassOutTable_p2_9"), whichPara);
        }

    },

    deleteRow: function (tableName) {
        var lastRow = $(tableName).find("tbody tr").last();
        $(lastRow).remove();

        //resize the container
        my_widget_script.resize();
    },

    deleteRows_allMassTables: function (whichPara) {
        if (whichPara === "p4_11") {
            var massTables = [
                $("#offspringDemoP11_nice"),
                $("#offspringMassP11"),
                $("#offspringMassP12"),
                $("#offspringMassP13"),
                $("#offspringMassP14"),
                $("#offspringMassP15"),
                $("#offspringMassP16"),
                $("#offspringMassP19"),
                $("#offspringMassP21")
            ];
            //Delete from summary table
            my_widget_script.deleteRow($("#offspringMassOutTable_p4_11"));
        } else if (whichPara === "p2_9") {
            var massTables = [
                $("#offspringDemoP9_nice"),
                $("#offspringMassP9_P9"),
                $("#offspringMassP9_P10"),
                $("#offspringMassP9_P11"),
                $("#offspringMassP9_P12"),
                $("#offspringMassP9_P13"),
                $("#offspringMassP9_P15"),
                $("#offspringMassP9_P17"),
                $("#offspringMassP9_P19"),
                $("#offspringMassP9_P21")
            ];
            my_widget_script.deleteRow($("#offspringMassOutTable_p2_9"));
        }

        for (var i = 0; i < massTables.length; i++) {
            var $table = massTables[i];
            //Delete from summary table
            my_widget_script.deleteRow($table);
        }

    },

    getIndividualMass: function ($totalMass) {
        //Get the total mass of the previous row - if this is blank, will be NaN
        var prevTotal = parseFloat($totalMass.parent().parent().prev().find(".totalMass").val());

        //Get the total mass from this row
        var currentTotal = parseFloat($totalMass.val());

        if (!prevTotal) { // if the previous total is NaN
            //use this total
            $totalMass.parent().next(".individualMass").text(currentTotal.toFixed(1));
        } else {
            //Calculate the difference between the current total and the previous total
            var massDiff = currentTotal - prevTotal;
            $totalMass.parent().next(".individualMass").text(massDiff.toFixed(1));
        }
    },

    getAvgMass: function ($table, whichPara) {
        var totalMass;
        var numberPups = my_widget_script.countPups($table);

        var lastMassID = "#total_mass_" + whichPara + "_" + numberPups;
        var $lastTotalMass = $(lastMassID);

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

    countPups: function ($table) {
        var numberPups
        numberPups = $table.find("tbody tr").length;
        return numberPups;
    },

    offspringCalculations: function ($table, $numPups, $avgMass, whichPara) {
        //Count Pups
        var numberPups = my_widget_script.countPups($table);
        $numPups.text(numberPups);

        //Update Avg
        var avgMass = my_widget_script.getAvgMass($table, whichPara);
        $avgMass.text(avgMass);
    },

    updateCalculation: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
    },

    addPupStartFuncs: function ($table, $numPups, $avgMass, whichPara) {
        my_widget_script.createRow_startPara($table, $avgMass, whichPara);
        my_widget_script.offspringCalculations($table, $numPups, $avgMass, whichPara);
        my_widget_script.resize();
    },

    removePupStartFuncs: function ($table, $numPups, $avgMass, whichPara) {
        my_widget_script.deleteRow($table);
        my_widget_script.offspringCalculations($table, $numPups, $avgMass, whichPara);
        my_widget_script.resize();
    },

    addPupEndFuncs: function ($tableDemo, $numPups, whichPara) {
        my_widget_script.createRow_offDemo($tableDemo, whichPara);
        my_widget_script.createRows_allMassTables(whichPara);

        //Count Pups
        var numberPups = my_widget_script.countPups($tableDemo);
        $numPups.text(numberPups);
        my_widget_script.resize();
    },

    removePupEndFuncs: function ($tableDemo, $numPups, whichPara) {
        my_widget_script.deleteRow($tableDemo);
        my_widget_script.deleteRows_allMassTables(whichPara);

        //Count Pups
        var numberPups = my_widget_script.countPups($tableDemo);
        $numPups.text(numberPups);
        my_widget_script.resize();
    },

    remakeEndParaTables: function (rowCount, whichPara, $demoTable) {
        var rowClass = ".Row_" + rowCount;

        var col1CalcClass = ".tailcalc_" + whichPara + "_" + rowCount;
        var col2CalcClass = ".idcalc_" + whichPara + "_" + rowCount;
        var col3CalcClass = ".sexcalc_" + whichPara + "_" + rowCount;

        $(col1CalcClass).html(
            $demoTable.find(rowClass).find(".tailMark").html()
        );

        $(col2CalcClass).text(
            $("#damID").val() + "_" + $demoTable.find(rowClass).find(".idCol").val()
        );

        $(col3CalcClass).text(
            $demoTable.find(rowClass).find(".sexCol").val()
        );

        //initialize output table
        var output = my_widget_script.calcForOutputTable(whichPara, rowCount);
        // console.log("Mass Vals: " + output.massVals + "\nLength: " + output.massVals.length);
        for (var j = 0; j < output.massVals.length; j++) {
            var massCalcClass = "." + output.massCalcClasses[j];
            var massVal = output.massVals[j];

            // console.log(
            //     "Mass Class: " + massCalcClass + 
            //     "\n Mass Value: " + massVal
            // );

            $(massCalcClass).text(massVal);
        }
    },

    runCSV_buttonFunc: function (whichPara, whichGeneration) {
        var fileName, outTable
        if (whichGeneration === "dam") {
            fileName = "damData";
            if (whichPara === "p4_11") {
                outTable = "damOutTable_p4_11"
            } else if (whichPara === "p2_9") {
                outTable = "damOutTable_p2_9"
            }
        } else if (whichGeneration === "offspring") {
            fileName = "massOffspring"
            if (whichPara === "p4_11") {
                outTable = "offspringMassOutTable_p4_11"
            } else if (whichPara === "p2_9") {
                outTable = "offspringMassOutTable_p2_9"
            }
        }

        if (whichPara) {
            var data_valid = my_widget_script.data_valid_form();
            //alert(data_valid);
            if (data_valid) {
                my_widget_script.exportTableToCSV(fileName, outTable);
                $("#errorMsg").html("<span style='color:grey; font-size:24px;'>Saved successfully</span>")
            } else {
                $("#errorMsg").append("<br/><span style='color:grey; font-size:24px;'>Did not export</span><br/><p>Be sure to check that you haven't created table rows with the other paradigm treatment period</p>");
            }
        } else { //if have not selected paradigm - shouldn't happen since buttons are hidden now
            $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please select a treatment period</span>");
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

    copyData_buttonFunc: function (whichPara, whichGeneration, $copyHead) {
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
            if (whichPara === "p4_11") {
                $outTable = $("#damOutTable_p4_11");
            } else if (whichPara === "p2_9") {
                $outTable = $("#damOutTable_p2_9");
            }
        } else if (whichGeneration === "offspring") {
            $outDiv = $("#offspringMassOutDiv");
            if (whichPara === "p4_11") {
                $outTable = $("#offspringMassOutTable_p4_11");
            } else if (whichPara === "p2_9") {
                $outTable = $("#offspringMassOutTable_p2_9");
            }
        }

        if (whichPara) {
            var data_valid = my_widget_script.data_valid_form();
            //alert(data_valid);
            if (data_valid) {
                $outDiv.show();
                my_widget_script.resize();
                my_widget_script.copyTable($outTable, copyHead);
                $("#errorMsg").html("<span style='color:grey; font-size:24px;'>Copied successfully</span>")
            } else {
                $("#errorMsg").append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span><br/><p>Be sure to check that you haven't created table rows with the other paradigm treatment period</p>");
            }
        } else { //if have not selected paradigm - Note, this shouldn't happen given that the buttons are now hidden
            $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please select a treatment period</span>");

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