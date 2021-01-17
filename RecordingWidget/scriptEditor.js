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
            addedRows: dynamicContent.addedRows
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
            addedRows: 3 
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
     * This function requires the parsedJson object.
     */
    initDynamicContent: function (parsedJson) {
        for (var i = 0; i < parsedJson.addedRows; i++) {
            var tableName = $("#dataTable");
            my_widget_script.createRow(tableName);
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
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        $("#addRow").on("click", function () {
            var $table = $("#dataTable");
            my_widget_script.createRow($table);
            my_widget_script.calcSpontLength();
            $("#errorMsg").text("");
        });

        $("#removeRow").on("click", function () {
            var $table = $("#dataTable");
            my_widget_script.deleteRow($table);
            my_widget_script.calcSpontLength();
            $("#errorMsg").text("");
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('#toCSV').on("click", function () {
            var fileName = "recordingInfo_" + $("#cellid").val();
            var $datatable = $("#dataTable");
            var $errorMsg = $("#errorMsg");
            
            my_widget_script.toCSVFuncs(fileName, $datatable, $errorMsg);
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            var $copyHead = $("#copyHead");
            var $tableToCopy = $("#dataTable");
            var $tableDiv = $("#seriesDiv");
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy);
        });

        $("#seriesLength").on("input", function () {
            my_widget_script.calcSpontLength();
        });

        $("#addEvent").on("click", function () {
            if (!$("#eventLog").val() == "") {
                addLine = "\n";
            } else {
                addLine = ""
            }
            var textToAdd = (
                addLine +
                new Date() +
                " during Series # " +
                $("#whichSeries").val() + ": " +
                $("#eventName").val() +
                "\n ---------"
            );
            $("#eventLog").val($("#eventLog").val() + textToAdd);
        });

        $("#calcSpont").on("change", function () {
            if($(this).is(":checked")){
                my_widget_script.calcSpontLength();
            } else {
                $("#spontLength").val("");
            }
        })
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

        // $('.needForTable').each(function () { //find element with class "needForForm"
        //     //alert($(this).val());
        //     $(this).after("<span style='color:blue'>#</span>"); //add # after
        // });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            //alert($(this).val());
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });

        // //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
        // $('#the_form').find('select, textarea, input').each(function () { //find each select field, textarea, and input
        //     if ($(this).prop('required')) { //if has the attribute "required"
        //         $(this).after("<span style='color:red'>*</span>"); //add asterisk after
        //     }
        // });
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

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
        var addedRows = $("#dataTable").find("tbody tr").length;
        var dynamicContent = {
            addedRows: addedRows
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
     * @param {string} $datatable - jQuery object for the table that will be exported
     */
    exportTableToCSV: function (filename, $datatable) {
        var csv = [];
        csv = ['"Series","Resistance (MOhm)","Time","Series type","Notes"'];
        console.log(csv);

        $datatable.find("tbody").find("tr").each(function () {
            var row = [];

            $(this).find("td").each(function () {
                console.log("The value is: " + $(this).children().val());
                var cellText = '"' + $(this).children().val() + '"';
                row.push(cellText);
                console.log(row);
            });

            csv.push(row.join(","));
            console.log(csv);
        })

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
            //Completing this manually to avoid "#" in heading
            $temp.text("Series\tResistance (MΩ)\tTime\tSeries type\tBath temp\tNotes");
            
            addLine = "\n";
        }

        $table.find("tbody").children("tr").each(function () { //add each child of the row
            $temp.text($temp.text() + addLine);
            var addTab = "";
            $(this).find("td").each(function () {
                if ($(this).children().val()) {
                    var addText = $(this).children().val();
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

    /**
     * Set of functions when toCSVButton clicked
     * 
     * Checked if data is valid, then re-calculates values, exports the table to a CSV
     * Updates the error message accordingly
     * 
     * @param {string} fileName - fileName for the CSV that will be produced
     * @param $datatable - table as jQuery object that will be copied
     * @param $errorMsg - error message div as jQuery object
     */
    toCSVFuncs: function (fileName, $datatable, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) {
            my_widget_script.exportTableToCSV(fileName, $datatable);
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

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            my_widget_script.resize(); //resize
            my_widget_script.copyTable($tableToCopy, copyHead, $divForCopy); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },

    calcSpontLength: function () {
        if($("#calcSpont").is(':checked')){
            var spontSeriesNum = 0;
            $("#dataTable tbody").find("select").each(function () {
                if ($(this).val() === "Spontaneous") {
                    spontSeriesNum++;
                }
            })
            var seriesLength = parseInt($("#seriesLength").val());
            //alert("# spont series: " + spontSeriesNum + "; series length: " + seriesLength);
            if(seriesLength){
                $("#spontLength").val(spontSeriesNum * seriesLength);
            }
        }
    },

    //Use these to create template row addition examples
    createRow: function (tableName) {
        var rowCount = $(tableName).find("tbody tr").length + 1;
        var rowID = "Row_" + rowCount;

        var col1ID = "series_" + rowCount;
        var col2ID = "resistance_" + rowCount;
        var col3ID = "seriestime_" + rowCount;
        var col4ID = "seriestype_" + rowCount;
        var col5ID = "notes_" + rowCount;
        var colTempID = "temp_" + rowCount;

        $(tableName).find("tbody").append(
            $('<tr style="font-size: 0.8rem"></tr>', { //add a new row
                id: rowID //give this row the rowID
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "number", //make it type "number"
                        min: "1",
                        step: "1",
                        "class": "needForTable"
                    }).css("width", "7ex")
                )
            ).append(
                $('<td></td>').append(
                    $('<input/>', {
                        id: col2ID,
                        name: col2ID,
                        type: "number",
                        min: "0",
                        step: "0.01",
                        "class": "needForTable"
                    }).css("width", "8ex")
                )
            ).append(
                $('<td></td>').append(
                    $('<input/>', {
                        id: col3ID,
                        name: col3ID,
                        type: "time",
                        "class": "needForTable"
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<select></select>', { //append a new select to the td
                        id: col4ID,
                        name: col4ID,
                        "class": "needForTable"
                    }).append( //append options to the select tag
                        "<option value=''>[Select]</option>",
                        "<option value='Stabilization'>Stabilization</option>",
                        "<option value='Spontaneous'>Spontaneous</option>",
                        "<option value='Addition'>Addition</option>"
                    ).on("change", function () {
                        my_widget_script.calcSpontLength();
                    })
                )
            ).append(
                $('<td></td>').append(
                    $('<input/>', {
                        id: colTempID,
                        name: colTempID,
                        type: "number",
                        min: "0",
                        step: "1",
                        "class": "needForTable"
                    }).css("width", "8ex")
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    //append a new text area to the script. this string has to be split to make LA happy
                    //the widget script entry is within a text area, and if it finds another here, it 
                    //thinks that it has reached the end of the script
                    $('<text' + 'area></text' + 'area>', {
                        id: col5ID,
                        name: col5ID
                    })
                )
            )
        );

        var previousSeries = $("#series_" + (rowCount - 1)).val();
        if (previousSeries) {
            $("#series_" + rowCount).val(parseInt(previousSeries) + 1);
        } else {
            $("#series_" + rowCount).val(rowCount);
        };

        $("#whichSeries").val($("#series_" + rowCount).val());

        //resize the container
        my_widget_script.resize();
    },

    deleteRow: function (tableName) {
        var proceed = confirm("Are you sure you want to remove the row?");
        if(proceed){
            var lastRow = $(tableName).find("tbody tr").last();
            $(lastRow).remove();
    
            //resize the container
            my_widget_script.resize();
        }
    }
};