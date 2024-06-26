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
        var addedRows = this.getDynamicContent();

        // Add widgetData and any additional dynamic content to an output object
        // Will be accessed within the init and from_json methods
        var output = { widgetData: JSON.parse(widgetJsonString), addedRows: addedRows };

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

        //Add additional content to match the objects in to_json
        var output = { widgetData: testData, addedRows: 2 }; //When in development, initialize with 2 addedRows

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
    * 
    * Here, we are getting the number of addedRows (defined in to_json) from the parsedJson 
    * object and then using the createRow function to remake those rows
    */
    initDynamicContent: function (parsedJson) {
        for (var i = 0; i < parsedJson.addedRows; i++) {
            var tableName = $("#toDoTable");
            my_widget_script.createRow(tableName);
        }
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
            var $table = $("#toDoTable");

            my_widget_script.createRow($table);
        });

        $("#removeRow").on("click", function () {
            var $table = ("#toDoTable");

            my_widget_script.deleteRow($table);
        });
    },

    /**
    * TO DO: edit this function to define how the form should be initilized based 
    * on the existing form values. This is particularly important for when the 
    * widget already has data entered, such as when saved to a page.
    */
    setUpInitialState: function () {
        $(".priority").each(function() {
            console.log("Priority values: " + $(this).val());
            switch($(this).val()) {
                case '':
                    $(this).css("background-color", "");
                    break;
                case "low":
                    $(this).css("background-color", "lightgrey");
                    break;
                case "medium":
                    $(this).css("background-color", "skyblue");
                    break;
                case "high":
                    $(this).css("background-color", "fuchsia");
                    break;
            };
        });

        $(".status").each(function() {
            console.log("Status values: " + $(this).val());
            switch($(this).val()) {
                case '':
                    $(this).closest("tr").css("background-color", "");
                    break;
                case "notStarted":
                    $(this).closest("tr").css("background-color", "lightpink");
                    break;
                case "inProgress":
                    $(this).closest("tr").css("background-color", "lightyellow");
                    break;
                case "completed":
                    $(this).closest("tr").css("background-color", "lightgreen");
                    break;
            };
        });
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
        // These should be simple variables, such as true/false, a number, or a state
        // This cannot be something complex like a full <div>

        var addedRows = $("#toDoTable").find("tbody tr").length;
        return addedRows;
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
    
    /* -----------------------------------------------------------------------------
    ** This function creates a new row at the end of the specified table.
    ** 
    ** This template contains examples for date, number, text, checkbox, select, 
    ** and textarea inputs. It also demonstrates how to add event listeners for 
    ** this new dynamic content, which cannot just be defined within the init function
    ** as these elements do not exist when the page is first initialized.
    **
    ** Because the script editor in LA is within a <textarea> the script cannot contain
    ** the verbatim string "textarea" so this must be separated as "text" + "area"
    ** to avoid errors. 
    ** -----------------------------------------------------------------------------
    */
    createRow: function (tableName) {
        var rowCount = $(tableName).find("tbody tr").length + 1;
        var rowID = "Row_" + rowCount;

        var col1ID = "startdate_" + rowCount;
        var col2ID = "duedate_" + rowCount;
        var col3ID = "priority_" + rowCount;
        var col4ID = "status_" + rowCount;
        var col5ID = "description_" + rowCount;
        var col6ID = "completion_" + rowCount;

        $(tableName).find("tbody").append(
            $('<tr/>', { //add a new row
                id: rowID //give this row the rowID
            }).append(
                $('<td/>').append( //append a new td to the row
                    $('<select/>', { //append a new select to the td
                        id: col3ID,
                        name: col3ID,
                        class: "priority"
                    }).append( //append options to the select tag
                        "<option value=''>[Select]</option>",
                        "<option value='low'>Low</option>",
                        "<option value='medium'>Medium</option>",
                        "<option value='high'>High</option>"
                    ).change(function () {
                        switch($(this).val()) {
                            case '':
                                $(this).css("background-color", "");
                                break;
                            case "low":
                                $(this).css("background-color", "lightgrey");
                                break;
                            case "medium":
                                $(this).css("background-color", "skyblue");
                                break;
                            case "high":
                                $(this).css("background-color", "fuchsia");
                                break;
                        };
                    })
                )
            ).append(
                $('<td/>').append( //append a new td to the row
                    $('<select/>', { //append a new select to the td
                        id: col4ID,
                        name: col4ID,
                        class: "status"
                    }).append( //append options to the select tag
                        "<option value=''>[Select]</option>",
                        "<option value='notStarted'>Not Started</option>",
                        "<option value='inProgress'>In Progress</option>",
                        "<option value='completed'>Completed </option>"
                    ).change(function () {
                        switch($(this).val()) {
                            case '':
                                $(this).closest("tr").css("background-color", "");
                                break;
                            case "notStarted":
                                $(this).closest("tr").css("background-color", "lightpink");
                                break;
                            case "inProgress":
                                $(this).closest("tr").css("background-color", "lightyellow");
                                break;
                            case "completed":
                                $(this).closest("tr").css("background-color", "lightgreen");
                                break;
                        };
                    })
                )
            ).append(
                $('<td/>').append(
                    $('<text' + 'area></text' + 'area>', {
                        id: col5ID,
                        name: col5ID,
                        cols: 20,
                        rows: 3
                    })
                )
            ).append(
                $('<td/>').append( //append a new td to the row
                    //append a new text area to the script. this string has to be split to make LA happy
                    //the widget script entry is within a text area, and if it finds another here, it 
                    //thinks that it has reached the end of the script
                    $('<text' + 'area></text' + 'area>', {
                        id: col6ID,
                        name: col6ID,
                        cols: 20,
                        rows: 3
                    })
                )
            ).append(
                $('<td/>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "date" //make it type "date"
                    })
                )
            ).append(
                $('<td/>').append(
                    $('<input/>', {
                        id: col2ID,
                        name: col2ID,
                        type: "date"
                    })
                )
            )
        );

        //resize the container
        my_widget_script.resize();
    },

    /* -----------------------------------------------------------------------------
    ** This function deletes the last row of the table body for the given table
    ** and then resizes the container and tableDiv.
    ** -----------------------------------------------------------------------------
    */
    deleteRow: function ($table) {
        var lastRow = $table.find("tbody tr").last();
        $(lastRow).remove();

        //resize the container
        my_widget_script.resize();
    }
};