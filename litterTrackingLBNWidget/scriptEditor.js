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

        //Load additional scripts such as updated jQuery and Bootstrap
        //this.loadAdditionalScripts();

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

        //Define behavior when buttons are clicked or checkboxes/selctions change
        this.addEventListeners(parsedJson);

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        // Add * and # to mark required field indicators
        this.addRequiredFieldIndicators();

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
        var output = { widgetData: JSON.parse(widgetJsonString), numPupsP4: dynamicContent.numPupsP4, numPupsP11: dynamicContent.numPupsP11, tailMarks: dynamicContent.tailMarks };

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
        //var output = { widgetData: testData };

        var tailMarks = [];
        tailMarks[0] = "<span style='color:blue'>Test</span>"
        tailMarks[1] = "<span style='color:red'>Test2</span>"

        var output = { widgetData: testData, numPupsP4: 2, numPupsP11: 2, tailMarks: tailMarks }
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
    loadAdditionalScripts: function () {
        $('#jQueryScript')
            .prop("src", "https://code.jquery.com/jquery-3.5.1.min.js")
            .prop("integrity", "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=");

        $('#bootstrapJS')
            .prop("src", "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js")
            .prop("integrity", "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl");
    },

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
    * 
    * Here, we are getting the number of addedRows (defined in to_json) from the parsedJson 
    * object and then using the createRow function to remake those rows
    */
    initDynamicContent: function (parsedJson) {
        for (var i = 0; i < parsedJson.numPupsP4; i++) {
            var $table = $("#offspringMassP4");
            var $avgMass = $("#avgMassP4");
            var whichPara = $("#treatmentPeriod").val();
            //var whichPara = "p4_11";
            my_widget_script.createRow_startPara($table, $avgMass, whichPara);
        }

        for (var i = 0; i < parsedJson.numPupsP11; i++) {
            var $tableDemo = $("#offspringDemoP11");
            var whichPara = "p4_11";
            my_widget_script.createRow_offDemo($tableDemo, whichPara);

            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            $("#offspringDemoP11").find(rowClassName).find(".tailMark").html(parsedJson.tailMarks[i]);

            my_widget_script.createRows_allMassTables(whichPara);
        }

        $("#numPupsP11").text(parsedJson.numPupsP11);

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
            $("#addPupP4").prop('disabled', true);
            $("#removePupP4").prop('disabled', true);
            $("#addPupP11").prop('disabled', true);
            $("#removePupP11").prop('disabled', true);
            $(".hideView").hide();
            $(".massTable.demo").show();
            $("#offspringDemoP11").hide();
            if ($("#treatmentPeriod").val()) { $("#offspringMassOutDiv").show(); }
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

            //to do add for P2-9
        });

        //Show/hide the table
        $("#toggleTable").on("click", function () { //when the showTable button is clicked. Run this function
            //alert("button pressed");
            my_widget_script.resize();
            my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
            $("#offspringMassOutDiv").toggle();
            my_widget_script.parent_class.resize_container();
        });

        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSV').on("click", function () {
            var whichPara = $("#treatmentPeriod").val();

            if (whichPara) {
                var data_valid = my_widget_script.data_valid_form();
                //alert(data_valid);
                if (data_valid) {
                    if (whichPara === "p4_11") {
                        my_widget_script.exportTableToCSV("massOffspring", "offspringMassOutTable_p4_11");
                    } else if (whichPara === "p2_9") {
                        my_widget_script.exportTableToCSV("massOffspring", "offspringMassOutTable_p2_9");
                    }
                    $("#errorMsg").html("<span style='color:grey; font-size:24px;'>Saved successfully</span>")
                } else {
                    $("#errorMsg").append("<br/><span style='color:grey; font-size:24px;'>Did not export</span><br/><p>Be sure to check that you haven't created table rows with the other paradigm treatment period</p>");
                }
            } else { //if have not selected paradigm - shouldn't happen since buttons are hidden now
                $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please select a treatment period</span>");
            }
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            var whichPara = $("#treatmentPeriod").val();
            var copyHead

            //only copy the heading when the input box is checked
            if ($("#copyHead").is(":checked")) {
                copyHead = true;
            } else {
                copyHead = false;
            }

            if (whichPara) {
                var data_valid = my_widget_script.data_valid_form();
                //alert(data_valid);
                if (data_valid) {
                    my_widget_script.resize();
                    $("#offspringMassOutDiv").show();
                    if (whichPara === "p4_11") {
                        my_widget_script.copyTable($("#offspringMassOutTable_p4_11"), copyHead);
                    } else if (whichPara === "p2_9") {
                        my_widget_script.copyTable($("#offspringMassOutTable_p2_9"), copyHead);
                    }
                    $("#errorMsg").html("<span style='color:grey; font-size:24px;'>Copied successfully</span>")
                } else {
                    $("#errorMsg").append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span><br/><p>Be sure to check that you haven't created table rows with the other paradigm treatment period</p>");
                }
            } else { //if have not selected paradigm - Note, this shouldn't happen given that the buttons are now hidden
                $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please select a treatment period</span>");

            }

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

        $("#addPupP4").on("click", function () {
            var $table = $("#offspringMassP4");
            var $numPups = $("#numPupsP4");
            var $avgMass = $("#avgMassP4");
            var whichPara = $("#treatmentPeriod").val();
            //var whichPara = "p4_11";

            my_widget_script.createRow_startPara($table, $avgMass, whichPara);

            my_widget_script.offspringCalculations($table, $numPups, $avgMass, whichPara);
            my_widget_script.resize();
        });

        $("#removePupP4").on("click", function () {
            var $table = $("#offspringMassP4");
            var $avgMass = $("#avgMassP4");
            var $numPups = $("#numPupsP4");
            var whichPara = $("#treatmentPeriod").val();
            //var whichPara = "p4_11";

            my_widget_script.deleteRow($table);

            my_widget_script.offspringCalculations($table, $numPups, $avgMass, whichPara);
            my_widget_script.resize();
        });

        $("#addPupP11").on("click", function () {
            var $tableDemo = $("#offspringDemoP11");
            var $numPups = $("#numPupsP11");
            var whichPara = $("#treatmentPeriod").val();
            //var whichPara = "p4_11";

            my_widget_script.createRow_offDemo($tableDemo, whichPara);

            my_widget_script.createRows_allMassTables(whichPara);

            //Count Pups
            var numberPupsP11 = my_widget_script.countPups($tableDemo);
            $numPups.text(numberPupsP11);
            my_widget_script.resize();
        });

        $("#removePupP11").on("click", function () {
            var $tableDemo = $("#offspringDemoP11");
            var $numPups = $("#numPupsP11");
            var whichPara = $("#treatmentPeriod").val();
            //var whichPara = "p4_11";

            my_widget_script.deleteRow($tableDemo);

            my_widget_script.deleteRows_allMassTables(whichPara);

            //Count Pups
            var numberPupsP11 = my_widget_script.countPups($tableDemo);
            $numPups.text(numberPupsP11);
            my_widget_script.resize();
        });

        $("#massDayP4_11").on("change", function () {
            my_widget_script.switchMassTable($(this).val());
            my_widget_script.resize();
        });
    },

    /**
    * TO DO: edit this function to define the symbols that should be added to the HTML
    * page based on whether or not a field is required to save the widget to the page
    * 
    * Here, the function adds a blue # after fields of the class "needForForm" and a 
    * red * after fields with the "required" property
    */
    addRequiredFieldIndicators: function () {
        $('.needForTable').each(function () { //find element with class "needForForm"
            //alert($(this).val());
            $(this).after("<span style='color:blue'>#</span>"); //add # after
        });

        //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
        $('#the_form').find('select, textarea, input').each(function () { //find each select field, textarea, and input
            if ($(this).prop('required')) { //if has the attribute "required"
                $(this).after("<span style='color:red'>*</span>"); //add asterisk after
            }
        });
    },

    /**
    * TO DO: edit this function to define how the form should be initilized based 
    * on the existing form values. This is particularly important for when the 
    * widget already has data entered, such as when saved to a page.
    */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-6 col-md-4 col-lg-3 col-xl-2 text-right");

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
        my_widget_script.offspringCalculations($("#offspringMassP4"), $("#numPupsP4"), $("#avgMassP4"), "p4_11");

        if ($("#showDatesP4").is(":checked")) {
            $("#datesList").show();
        } else { $("#datesList").hide(); }

        my_widget_script.switchMassTable($("#massDayP4_11").val());

        var numPupsP11 = my_widget_script.countPups($("#offspringDemoP11"));

        for (var i = 0; i < numPupsP11; i++) {
            var rowCount = i + 1;
            var whichPara = "p4_11";

            var rowClass = ".Row_" + rowCount;

            var col1CalcClass = ".tailcalc_" + whichPara + "_" + rowCount;
            var col2CalcClass = ".idcalc_" + whichPara + "_" + rowCount;
            var col3CalcClass = ".sexcalc_" + whichPara + "_" + rowCount;

            var $tableDemoP11 = $("#offspringDemoP11");
            $(col1CalcClass).html(
                $tableDemoP11.find(rowClass).find(".tailMark").html()
            );

            $(col2CalcClass).text(
                $("#damID").val() + "_" + $tableDemoP11.find(rowClass).find(".idCol").val()
            );

            $(col3CalcClass).text(
                $tableDemoP11.find(rowClass).find(".sexCol").val()
            );

            //initialize output table
            var output = my_widget_script.calcForOutputTable(whichPara, rowCount);
            console.log("Mass Vals: " + output.massVals + "\nLength: " + output.massVals.length);
            for (var j = 0; j < output.massVals.length; j++) {
                var massCalcClass = "." + output.massCalcClasses[j];
                var massVal = output.massVals[j];

                console.log(
                    "Mass Class: " + massCalcClass +
                    "\n Mass Value: " + massVal
                );

                $(massCalcClass).text(massVal);
            }
        }

        my_widget_script.resize();
    },

    /**
    * TO DO: edit this function to define which <div>s or other elements
    * should be adjusted based on the current width of the window
    */
    resize: function () {
        //gets the inner width of the window.
        var width = window.innerWidth;

        //make width of table div 95% of current width
        $(".tableDiv").width(width * .95);

        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        // These should be simple variables, such as true/false, a number, or a state
        // This cannot be something complex like a full <div>

        var numPupsP4 = my_widget_script.countPups($("#offspringMassP4"));
        var numPupsP11 = my_widget_script.countPups($("#offspringDemoP11"));
        var tailMarks = [];
        var IDs = [];
        var sexes = [];
        for (var i = 0; i < numPupsP11; i++) {
            var rowNum = i + 1;
            var rowClassName = ".Row_" + rowNum;
            var tailMarkText = $("#offspringDemoP11").find(rowClassName).find(".tailMark").html();
            tailMarks[i] = tailMarkText;
        }

        var dynamicContent = { numPupsP4: numPupsP4, numPupsP11: numPupsP11, tailMarks: tailMarks }
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

    /**
    * 
    * This function takes a csv element and filename that are passed from the
    * exportTableToCSV function.
    * 
    * This creates a csvFile and builds a download link that references this file.
    * The download link is "clicked" by the function to prompt the browser to 
    * download this file
    * 
    * source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
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
    */
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
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        //debugger;
        var dateString = $startDateVal; //get the date string from the input

        var startDate = new Date(dateString);

        var offset = new Date().getTimezoneOffset(); //get the offset of local time from GTC
        // this is necessary because making a Date object from the input date string creates a date with time of midnight GTC
        // for locales with different time zones, this means that the Date displayed could be the previous day

        //Add the number of days (in ms) and offset (in ms) to the start Date (in ms) and make it a new date object
        var newDate = new Date(startDate.getTime() + numDays * 24 * 60 * 60 * 1000 + offset * 60 * 1000);

        $newDateClass.text(newDate.toDateString());
    },

    /* -----------------------------------------------------------------------------
    ** DEFINE ADDITIONAL METHODS HERE
    **
    ** Be sure that there is a comma after previous method
    **
    ** my_widget_script.parent_class.resize_container(); should be called each time
    ** content is created, modified, or deleted within a function.
    ** -----------------------------------------------------------------------------
    */

    printPND_days: function () {
        my_widget_script.addDays($("#DOB").val(), $(".pnd4"), 4);
        my_widget_script.addDays($("#DOB").val(), $(".pnd11"), 11);
        my_widget_script.addDays($("#DOB").val(), $(".pnd12"), 12);
        my_widget_script.addDays($("#DOB").val(), $(".pnd13"), 13);
        my_widget_script.addDays($("#DOB").val(), $(".pnd14"), 14);
        my_widget_script.addDays($("#DOB").val(), $(".pnd15"), 15);
        my_widget_script.addDays($("#DOB").val(), $(".pnd16"), 16);
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
                    $("#offspringDemoP11").find(rowClassWDot).find(".tailMark").html()
                )
            ).append(
                $('<td></td>', {
                    "class": col2CalcClass
                }).append(
                    $("#damID").val() + "_" + $("#offspringDemoP11").find(rowClassWDot).find(".idCol").val()
                )
            ).append(
                $('<td></td>', {
                    "class": col3CalcClass
                }).append(
                    $("#offspringDemoP11").find(rowClassWDot).find(".sexCol").val()
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

        $table.find("tbody").append(
            $('<tr></tr>', { //add a new row
                "class": output.rowClasses
            }).append( //Mouse_ID
                $('<td></td>', {
                    "class": output.col2CalcClass
                }).append(
                    //get id from demo table, if it already exists
                    $("#damID").val() + "_" + $("#offspringDemoP11").find(output.rowClassWDot).find(".idCol").val()
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
            var massTables = [$("#offspringDemoP11_nice"), $("#offspringMassP11"), $("#offspringMassP12"), $("#offspringMassP13"), $("#offspringMassP14"), $("#offspringMassP15"), $("#offspringMassP16"), $("#offspringMassP19"), $("#offspringMassP21")];
            var massDays = ["demo", "p11", "p12", "p13", "p14", "p15", "p16", "p19", "p21"];
        } else if (whichPara === "p2_11") { //to do add dates for P2-P9
            var massTables = [];
            var massDays = [];
            //var massTables = [$("#offspringMassP11"), $("#offspringMassP12"), $("#offspringMassP13"), $("#offspringMassP14"), $("#offspringMassP15"), $("#offspringMassP16"), $("#offspringMassP19"), $("#offspringMassP21")];
            //var massDays = ["p11", "p12", "p13", "p14", "p15", "p16", "p19", "p21"];
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

    /* -----------------------------------------------------------------------------
    ** This function deletes the last row of the table body for the given table
    ** and then resizes the container and tableDiv.
    ** -----------------------------------------------------------------------------
    */
    deleteRow: function (tableName) {
        var lastRow = $(tableName).find("tbody tr").last();
        $(lastRow).remove();

        //resize the container
        my_widget_script.resize();
    },

    deleteRows_allMassTables: function (whichPara) {
        if (whichPara === "p4_11") {
            var massTables = [$("#offspringDemoP11_nice"), $("#offspringMassP11"), $("#offspringMassP12"), $("#offspringMassP13"), $("#offspringMassP14"), $("#offspringMassP15"), $("#offspringMassP16"), $("#offspringMassP19"), $("#offspringMassP21")];
            //Delete from summary table
            my_widget_script.deleteRow($("#offspringMassOutTable_p4_11"));
        } else if (whichPara === "p2_9") {
            var massTables = []; //to do P2-9
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

    countPups: function ($table) {
        var numberPups
        numberPups = $table.find("tbody tr").length;
        return numberPups;
    },

    getAvgMass: function ($table, whichPara) {
        var totalMass;
        var numberPups = my_widget_script.countPups($table);

        var lastMassID = "#total_mass_" + whichPara + "_" + numberPups;
        var $lastTotalMass = $(lastMassID);

        if ($lastTotalMass.val()) {
            totalMass = parseFloat($lastTotalMass.val())
        } else { totalmass = "NaN" }

        //This was having problems with anything but the last value changed
        //Should double check that new doesn't cause errors with LabArchives, though

        // var lastTotalMassEl = document.getElementById("total_mass_" + whichPara + "_" + numberPups);

        // if(lastTotalMassEl) {
        //     totalMass = parseFloat(lastTotalMassEl.value);
        // } else {totalMass = NaN;}

        var avgMass = totalMass / numberPups;
        return avgMass.toFixed(2);
    },

    offspringCalculations: function ($table, $numPups, $avgMass, whichPara) {
        //Count Pups
        var numberPups = my_widget_script.countPups($table);
        $numPups.text(numberPups);

        //Update Avg
        var avgMass = my_widget_script.getAvgMass($table, whichPara);
        $avgMass.text(avgMass);
    }

};