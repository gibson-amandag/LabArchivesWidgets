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
            dam1Plug_addedRows: dynamicContent.dam1Plug_addedRows,
            dam2Plug_addedRows: dynamicContent.dam2Plug_addedRows,
            dam1Mass_addedRows: dynamicContent.dam1Mass_addedRows,
            dam2Mass_addedRows: dynamicContent.dam2Mass_addedRows
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
            dam1Plug_addedRows: 1,
            dam2Plug_addedRows: 2,
            dam1Mass_addedRows: 3,
            dam2Mass_addedRows: 4 
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
        for (var i = 0; i < parsedJson.dam1Plug_addedRows; i++) {
            var tableName = $("#dam1PlugTable");
            var whichDam = "dam1";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        }

        for (var i = 0; i < parsedJson.dam2Plug_addedRows; i++) {
            var tableName = $("#dam2PlugTable");
            var whichDam = "dam2";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        }

        for (var i = 0; i < parsedJson.dam1Mass_addedRows; i++) {
            var tableName = $("#dam1MassTable");
            var whichDam = "dam1";

            my_widget_script.createMassRow(tableName, whichDam, $("#dammass_1"));
        }

        for (var i = 0; i < parsedJson.dam2Mass_addedRows; i++) {
            var tableName = $("#dam2MassTable");
            var whichDam = "dam2";

            my_widget_script.createMassRow(tableName, whichDam, $("#dammass_2"));
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
        } else {
            if($("#breedDate").val()) {
                $(".entry").insertAfter($(".myTitle"));
            }
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        //When the "addDivCheck" checkbox is changed, run this function
        $('#dam2Check').on("change", function () { //change rather than click so that it runs only when editable
            if ($(this).is(":checked")) {
                $(".dam2").show();
                $("#sireDiv").removeClass("mt-md-0").addClass("mt-xl-0");
            } else {
                //alert("I'm not checked")
                $(".dam2").hide();
                $("#sireDiv").addClass("mt-md-0").removeClass("mt-xl-0");
            };

            my_widget_script.adjustForDaysPostBreedingAndPlug();

            //resize the container
            my_widget_script.resize();
        });

        //When damid_1 is changed, replace the text in the #dam1_calc span
        $("#damid_1").on("input", function () {
            my_widget_script.watchValue($("#damid_1"), $(".dam1_calc"));
            my_widget_script.resize();
        });

        //When damid_2 is changed, replace the text in the #dam2_calc span
        $("#damid_2").on("input", function () {
            my_widget_script.watchValue($("#damid_2"), $(".dam2_calc"));
            my_widget_script.resize();
        });

        $("#dammass_1").on("input", function () {
            $(".newMass_dam1").each(function () {
                my_widget_script.calcPercMass($(this), $("#dammass_1"));
            });
        });

        $("#dammass_2").on("input", function () {
            $(".newMass_dam2").each(function () {
                my_widget_script.calcPercMass($(this), $("#dammass_2"));
            });
        });

        $("#addPlugCheck1").on("click", function () {
            var tableName = $("#dam1PlugTable");
            var whichDam = "dam1";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        });

        $("#removePlugCheck1").on("click", function () {
            var tableName = $("#dam1PlugTable");

            my_widget_script.deleteRow(tableName);

            my_widget_script.adjustForDaysPostBreedingAndPlug();
        });

        $("#addPlugCheck2").on("click", function () {
            var tableName = $("#dam2PlugTable");
            var whichDam = "dam2";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        });

        $("#removePlugCheck2").on("click", function () {
            var tableName = $("#dam2PlugTable");
            my_widget_script.deleteRow(tableName);
            my_widget_script.adjustForDaysPostBreedingAndPlug();
        });

        $("#addMass1").on("click", function () {
            var tableName = $("#dam1MassTable");
            var whichDam = "dam1";

            my_widget_script.createMassRow(tableName, whichDam, $("#dammass_1"));
        });

        $("#removeMass1").on("click", function () {
            var tableName = $("#dam1MassTable");
            my_widget_script.deleteRow(tableName);
        });

        $("#addMass2").on("click", function () {
            var tableName = $("#dam2MassTable");
            var whichDam = "dam2";

            my_widget_script.createMassRow(tableName, whichDam, $("#dammass_2"));
        });

        $("#removeMass2").on("click", function () {
            var tableName = $("#dam2MassTable");

            my_widget_script.deleteRow(tableName);
        });

        $("#breedDate").on("input", function () {
            my_widget_script.adjustForDaysPostBreedingAndPlug();
        })

        $(".updateWatch").on("input", function () {
            my_widget_script.adjustForDaysPostBreedingAndPlug();
        })

    },
    
    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForFormLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
        $('#the_form').find('select, textarea, input').each(function () { //find each select field, textarea, and input
            if ($(this).prop('required')) { //if has the attribute "required"
                $(this).after("<span style='color:red'>*</span>"); //add asterisk after
            }
        });
    },
    
    updateTextarea: function () {
        $('textarea').each(function () {
            if(! $(this).is(":hidden")) {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        my_widget_script.resize();
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
            console.log($dateInput.val());
        }
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();
        
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        }).each(function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        }).each(function () {
            my_widget_script.checkTimeFormat($(this));
        });

        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

        $("textarea").on("input", function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
        });

        $(".checkText").on("change", function () {
            my_widget_script.updateTextarea();
        });

        //Check if the dam2Check checkbox is checked and adjust visibility
        if ($('#dam2Check').is(":checked")) {
            $(".dam2").show();
            $("#sireDiv").removeClass("mt-md-0").addClass("mt-xl-0");
        } else {
            $(".dam2").hide();
            $("#sireDiv").addClass("mt-md-0").removeClass("mt-xl-0");
        };

        my_widget_script.watchValue($("#damid_1"), $(".dam1_calc"));
        my_widget_script.watchValue($("#damid_2"), $(".dam2_calc"));

        $(".newMass_dam1").each(function () {
            my_widget_script.calcPercMass($(this), $("#dammass_1"));
        });

        $(".newMass_dam2").each(function () {
            my_widget_script.calcPercMass($(this), $("#dammass_2"));
        });

        my_widget_script.adjustForDaysPostBreedingAndPlug();
        my_widget_script.updateTextarea();
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
        var dam1Plug_addedRows = $("#dam1PlugTable").find("tbody tr").length;
        var dam2Plug_addedRows = $("#dam2PlugTable").find("tbody tr").length;
        
        var dam1Mass_addedRows = $("#dam1MassTable").find("tbody tr").length;
        var dam2Mass_addedRows = $("#dam2MassTable").find("tbody tr").length;

        var dynamicContent = {
            dam1Plug_addedRows: dam1Plug_addedRows,
            dam2Plug_addedRows: dam2Plug_addedRows,
            dam1Mass_addedRows: dam1Mass_addedRows,
            dam2Mass_addedRows: dam2Mass_addedRows
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

    createPlugCheckRow: function (tableName, whichDam) {
        var rowCount = $(tableName).find("tbody tr").length + 1;
        var rowID = whichDam + "_row_" + rowCount;

        var col1ID = whichDam + "date_" + rowCount;
        var col2ID = whichDam + "_qual_" + rowCount;
        var col3ID = whichDam + "_comment_" + rowCount;

        // Not using this because don't have a set up for loading previously added dates. This would add today's date for everything when remaking form
        // var dateToday = my_widget_script.getLocalDateString();

        $(tableName).find("tbody").append(
            $('<tr></tr>', { //add a new row
                id: rowID //give this row the rowID
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "date", //make it type "date"
                        "class": "plugDate",
                        // value: dateToday,
                        "placeholder": "hh:mm"
                    }).each(function () {
                        my_widget_script.checkDateFormat();
                    }).on("change", function () {
                        my_widget_script.checkDateFormat();
                        my_widget_script.adjustForDaysPostBreedingAndPlug();
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<select></select>', { //append a new select to the td
                        id: col2ID,
                        name: col2ID,
                        "class": "plugStatus"
                    }).append( //append options to the select tag
                        "<option value='0'>-/-</option>",
                        "<option value='1'>?</option>",
                        "<option value='2'>+/-</option>",
                        "<option value='3'>+/+</option>",
                        "<option value='4'>Red</option>",
                        "<option value='5'>Closed VO</option>"
                    ).on("change", function () {
                        my_widget_script.adjustForDaysPostBreedingAndPlug()
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<text' + 'area></text' + 'area>', { //append a new input to the td. For some reason, adding a textarea breaks LA
                        id: col3ID,
                        name: col3ID,
                        "rows": 1,
                        "cols": 12,
                    }).css(
                        "height", this.scrollHeight + "px"
                    ).css(
                        "overflow-y", "hidden"
                    ).on('input', function () {
                        this.style.height = 'auto';
                        this.style.height = (this.scrollHeight) + 'px';
                    })
                )
            )
        );

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    createMassRow: function (tableName, whichDam, initMass) {
        var rowCount = $(tableName).find("tbody tr").length + 1;
        var rowID = whichDam + "_row_" + rowCount;

        var col1ID = whichDam + "_massdate_" + rowCount;
        var col2ID = whichDam + "_mass_" + rowCount;
        //var col3ID = whichDam + "_change_" + rowCount;

        // Not using due to need to refill with previously used date
        // var dateToday = my_widget_script.getLocalDateString();

        $(tableName).find("tbody").append(
            $('<tr></tr>', { //add a new row
                id: rowID //give this row the rowID
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "date", //make it type "date"
                        // value: dateToday,
                        "placeholder": "hh:mm"
                    }).each(function () {
                        my_widget_script.checkDateFormat();
                    }).on("change", function () {
                        my_widget_script.checkDateFormat();
                        my_widget_script.adjustForDaysPostBreedingAndPlug();
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new select to the td
                        id: col2ID,
                        name: col2ID,
                        type: "number",
                        step: "0.1",
                        min: "0",
                        width: "4em",
                        "class": "newMass_" + whichDam
                    }).on("input", function () {
                        my_widget_script.calcPercMass($(this), initMass);
                    })
                )
            ).append(
                $('<td></td>', {
                    "class": "change"
                })
            )
        );

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    deleteRow: function (tableName) {
        var lastRow = $(tableName).find("tbody tr").last();
        $(lastRow).remove();

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    calcPercMass: function (newMass, initMass) {
        var newMassVal = parseFloat($(newMass).val());
        var initMassVal = parseFloat($(initMass).val());

        if(newMassVal > 0 && initMassVal > 0) {        
            var percChange = (newMassVal)/(initMassVal) * 100;
            $(newMass).parent().next(".change").text(percChange.toFixed(1));
        } else if(! newMassVal > 0){
            $(newMass).parent().next(".change").text("Enter New Mass");
        } else {
            $(newMass).parent().next(".change").text("Enter Initial Mass");
        };
        my_widget_script.resize();
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        // console.log("in addDays. Going to replace" + $newDateClass.text());
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toLocaleString(luxon.DateTime.DATE_HUGE);
        $newDateClass.text(newDate);
    },

    watchForPlug: function (whichDam) {
        // console.log("in watchForPlug");
        var hasPotentialPlug = false;
        var thisGestDayAtPotentialPlug, thisPlugPotentialDate;
        var gestDayAtPotentialPlug, dateAtPotentialPlug;
        var hasLikelyPlug = false;
        var thisGestDayAtLikelyPlug, thisPlugLikelyDate;
        var gestDayAtLikelyPlug, dateAtLikelyPlug;
        var hasGoodPlug = false;
        var thisGestDayAtGoodPlug, thisPlugGoodDate;
        var gestDayAtGoodPlug, dateAtGoodPlug;

        var dataSearch = my_widget_script.dataSearch("dam", whichDam);
        $(".table.plug" + dataSearch).find(".plugStatus").each(function () {
            var $this = $(this);

            //if the state is 1, 2, 3 (? +/- +/+)
            if($this.val()==="1" || $this.val()==="2" || $this.val()==="3"){
                hasPotentialPlug = true;
                thisPlugPotentialDate = $this.closest("tr").find(".plugDate").val(); 
                thisGestDayAtPotentialPlug = my_widget_script.getGestDay(thisPlugPotentialDate);

                if(dateAtPotentialPlug) { //if there's a value for dateAtPotentialPlug
                    if(new Date(thisPlugPotentialDate).getTime() < new Date(dateAtPotentialPlug).getTime()) { // if this is earlier
                        dateAtPotentialPlug = thisPlugPotentialDate;
                        gestDayAtPotentialPlug = thisGestDayAtPotentialPlug;
                    }
                } else { //if no current date
                    dateAtPotentialPlug = thisPlugPotentialDate;
                    gestDayAtPotentialPlug = thisGestDayAtPotentialPlug;
                }
            }

            if($this.val()==="2" || $this.val()==="3"){
                hasLikelyPlug = true;
                thisPlugLikelyDate = $this.closest("tr").find(".plugDate").val(); 
                thisGestDayAtLikelyPlug = my_widget_script.getGestDay(thisPlugLikelyDate);

                if(dateAtLikelyPlug) { //if there's a value for dateAtLikelyPlug
                    if(new Date(thisPlugLikelyDate).getTime() < new Date(dateAtLikelyPlug).getTime()) { // if this is earlier
                        dateAtLikelyPlug = thisPlugLikelyDate;
                        gestDayAtLikelyPlug = thisGestDayAtLikelyPlug;
                    }
                } else { //if no current date
                    dateAtLikelyPlug = thisPlugLikelyDate;
                    gestDayAtLikelyPlug = thisGestDayAtLikelyPlug;
                }
            }

            if($this.val()==="3"){
                hasGoodPlug = true;
                thisPlugGoodDate = $this.closest("tr").find(".plugDate").val(); 
                thisGestDayAtGoodPlug = my_widget_script.getGestDay(thisPlugGoodDate);

                if(dateAtGoodPlug) { //if there's a value for dateAtGoodPlug
                    if(new Date(thisPlugGoodDate).getTime() < new Date(dateAtGoodPlug).getTime()) { // if this is earlier
                        dateAtGoodPlug = thisPlugGoodDate;
                        gestDayAtGoodPlug = thisGestDayAtGoodPlug;
                    }
                } else { //if no current date
                    dateAtGoodPlug = thisPlugGoodDate;
                    gestDayAtGoodPlug = thisGestDayAtGoodPlug;
                }
            }
        })

        var plugDates = {
            hasPotentialPlug: hasPotentialPlug,
            earliestPotential: dateAtPotentialPlug,
            hasLikelyPlug: hasLikelyPlug,
            earliestLikely: dateAtLikelyPlug,
            hasGoodPlug: hasGoodPlug,
            earliestGood: dateAtGoodPlug
        }
        // console.log(plugDates)
        return plugDates
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    adjustForDaysPostBreedingAndPlug: function () {
        // console.log("In adjustForDaysPostBreedingAndPlug");
        if($("#breedDate").val()) {
            // Get days post breeding
            var daysPostBreeding = my_widget_script.getDaysPostEvent($("#breedDate").val());
            // Print days post breeding
            $(".postBreedDays").text(daysPostBreeding);
            // 12 days after breeding
            my_widget_script.addDays($("#breedDate").val(), $(".bd12"), 12);
            // 19 days after breeding
            my_widget_script.addDays($("#breedDate").val(), $(".bd19"), 19);

            // If today is 12 days after breeding, make red
            if (daysPostBreeding === 12) {
                // andSelf() is deprecated for newer versions. addBack() is new method
                $(".bd12").parent().andSelf().css("color", "red");
            }
            // If today is more than 12 days after breeding, make blue
            else if(daysPostBreeding > 12) {
                $(".bd12").parent().andSelf().css("color", "blue");
            } 
            // Otherwise, make it black
            else {
                $(".bd12").parent().andSelf().css("color", "black");
            }

            if (daysPostBreeding === 19) {
                $(".bd19").parent().andSelf().css("color", "red");
            }
            else if(daysPostBreeding >= 19) {
                $(".bd19").parent().andSelf().css("color", "blue");
            } else {
                $(".bd19").parent().andSelf().css("color", "black");
            }

        } else {
            $(".postBreedDays").text("[Enter breed date]");
            $(".bd12").text("[Enter breed date]").parent().andSelf().css("color", "black");
            $(".bd19").text("[Enter breed date]").parent().andSelf().css("color", "black");

        }

        if ($("#dam2Check").is(":checked")) {
            var max = 2
        } else {
            var max = 1
        }
        for(i = 0; i < max; i ++) {
            damNum = "" + (i + 1);
            // console.log("in for loop with dam " + damNum);
            // Get plug dates
            var plugDates = my_widget_script.watchForPlug(damNum);
            var dataSearch = my_widget_script.dataSearch("dam", damNum);

            // Get days post plug
            // after earliest potential
            if(plugDates.hasPotentialPlug) {
                $(".ifPlug" + dataSearch).show();

                // console.log(plugDates.earliestPotential);
                if(plugDates.earliestPotential){ //if there's a date entered
                    var daysEarliestPotentialPlug = my_widget_script.getDaysPostEvent(plugDates.earliestPotential);
                    $(".postEarliestPotentialPlug" + dataSearch).text(daysEarliestPotentialPlug);
                    
                    my_widget_script.addDays(plugDates.earliestPotential, $(".plug11" + dataSearch), 11);
                    my_widget_script.addDays(plugDates.earliestPotential, $(".plug18" + dataSearch), 18);
                    // If today is 12 days after plug, make red
                    if (daysEarliestPotentialPlug === 11) {
                        $(".plug11" + dataSearch).parent().andSelf().css("color", "red");
                    }
                    // If today is more than 12 days after breeding, make blue
                    else if(daysEarliestPotentialPlug > 11) {
                        if($("#sepDam"+damNum).is(":not(:checked)")){
                            $(".plug11" + dataSearch).parent().andSelf().css("color", "blue");
                        } else {
                            $(".plug11" + dataSearch).parent().andSelf().css("color", "black");
                        }
                    } 
                    // Otherwise, make it black
                    else {
                        $(".plug11" + dataSearch).parent().andSelf().css("color", "black");
                    }

                    if (daysEarliestPotentialPlug === 18) {
                        $(".plug18" + dataSearch).parent().andSelf().css("color", "red");
                    }
                    else if(daysEarliestPotentialPlug >= 18) {
                        if($("#birthDam"+damNum).is(":not(:checked)")){
                            $(".plug18" + dataSearch).parent().andSelf().css("color", "blue");
                            $(".ifBirth" + dataSearch).hide();
                        } else {
                            $(".plug18" + dataSearch).parent().andSelf().css("color", "black");
                            $(".ifBirth" + dataSearch).show();
                        }
                    } else {
                        $(".plug18" + dataSearch).parent().andSelf().css("color", "black");
                    }
                } else {
                    $(".postEarliestPotentialPlug" + dataSearch).text("[enter plug date]");
                    $(".plug11" + dataSearch).text("[enter plug date]").children().andSelf().css("color", "black");
                    $(".plug18" + dataSearch).text("[enter plug date]").children().andSelf().css("color", "black");
                }            
                
            } else { // if had not had potential plug
                $(".ifPlug" + dataSearch).hide();
                $(".postEarliestPotentialPlug" + dataSearch).text("[enter plug date]");
                $(".plug11" + dataSearch).text("[enter plug date]").children().andSelf().css("color", "black");
                $(".plug18" + dataSearch).text("[enter plug date]").children().andSelf().css("color", "black");

            }

            // after earliest likely
            if(plugDates.hasLikelyPlug) {
                $(".ifLikelyPlug" + dataSearch).show();

                if(plugDates.earliestLikely){ //if there's a date entered
                    var daysEarliestLikelyPlug = my_widget_script.getDaysPostEvent(plugDates.earliestLikely);
                    $(".postEarliestLikelyPlug" + dataSearch).text(daysEarliestLikelyPlug);          
                } else {
                    $(".postEarliestLikelyPlug" + dataSearch).text("[enter plug date]");
                }
            } else { // if had not had likely plug
                $(".ifLikelyPlug" + dataSearch).hide();
                $(".postEarliestLikelyPlug" + dataSearch).text("[enter plug date]");
            }

            // after earliest good
            if(plugDates.hasGoodPlug) {
                $(".ifGoodPlug" + dataSearch).show();

                if(plugDates.earliestGood){ //if there's a date entered
                    var daysEarliestGoodPlug = my_widget_script.getDaysPostEvent(plugDates.earliestGood);
                    $(".postEarliestGoodPlug" + dataSearch).text(daysEarliestGoodPlug);          
                } else {
                    $(".postEarliestGoodPlug" + dataSearch).text("[enter plug date]");
                }
            } else { // if had not had good plug
                $(".ifGoodPlug" + dataSearch).hide();
                $(".postEarliestGoodPlug" + dataSearch).text("[enter plug date]");
            }

        if($("#sepDam"+damNum).is(":not(:checked)")){
            $(".ifSep" + dataSearch).hide();
        } else {
            $(".ifSep" + dataSearch).show();
        }

        if($("#birthDam"+damNum).is(":not(:checked)")){
            $(".ifBirth" + dataSearch).hide();
        } else {
            $(".ifBirth" + dataSearch).show();
        }
        }
        my_widget_script.resize();
    },

    getDaysPostEvent: function ($originDateVal) {
        if($originDateVal) {
            // AGG - 3/14/21 - Switched to use luxon package
            var startDate = luxon.DateTime.fromISO($originDateVal).startOf("day");
            var todayDate = luxon.DateTime.now().startOf("day")
            var dateDiff_days = todayDate.diff(startDate, "days").as("day");
            // console.log(dateDiff_days);

            return(dateDiff_days);
        }
    },

    getGestDay: function (dateInputVal) {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var breedDateisDay = 0;
        var textOutput;
        if($("#breedDate").val()){
            if(dateInputVal){
                var compDate = luxon.DateTime.fromISO(dateInputVal).startOf("day");
                var breedDate = luxon.DateTime.fromISO($("#breedDate").val()).startOf("day").minus({ days: breedDateisDay });
                var gestDay = compDate.diff(breedDate, "days").as("day");
                // console.log(gestDay);
                textOutput = gestDay;
            } else {
                textOutput = "[Enter Date of Plug Check]";
            }
        } else {
            textOutput = "[Enter Breed Date]";
        }
        
        return textOutput;
    },

    getLocalDateString: function () {
        var dateTodayString = luxon.DateTime.now().toISODate();
        // console.log(dateTodayString);
        return(dateTodayString);
    }
};