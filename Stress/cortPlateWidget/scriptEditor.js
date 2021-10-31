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

        my_widget_script.makePlateTable("plateID");
        my_widget_script.makePlateTable("mouseID");
        my_widget_script.makePlateTable("time");
        my_widget_script.makeStdEntry();
        my_widget_script.makeSampleEntry();

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
            widgetData: JSON.parse(widgetJsonString)
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
        var output = { widgetData: testData };

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
        // for (var i = 0; i < parsedJson.addedRows; i++) {
        // };
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
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        $("#sampleNum").on("change", function () {
            my_widget_script.adjustForNumSamples();
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('#toCSV').on("click", function () {
            var fileName = "cortEIA_Plate";
            var tableID = "plateIDImg";
            var $errorMsg = $("#errorMsg");
            
            my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
        });

        //When the copy button is clicked, run the copyTable function
        // $("#copyDataButton").on("click", function () {
        $(".copyPlate").on("click", function () {
            var $copyHead = true;
            var plateType = $(this).data("plate");
            var plateSearch = my_widget_script.dataSearch("plate", plateType);
            console.log(plateSearch);
            var $tableToCopy = $(".plateImg" + plateSearch);
            var $tableDiv = $(".plateDiv" + plateSearch);
            var $errorMsg = $(".errorMsg"+plateSearch);
            console.log($errorMsg);
            var $divForCopy = $(".forCopy"+plateSearch);
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
        });

        $("#copySamplesButton").on("click", function (){
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            var duplicate = false;

            my_widget_script.copySampleIDsFuncs($errorMsg, $divForCopy, duplicate);
        });

        $("#copySamplesButton_dup").on("click", function (){
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            var duplicate = true;

            my_widget_script.copySampleIDsFuncs($errorMsg, $divForCopy, duplicate);
        });

        $("#copyMouseIDsButton").on("click", function (){
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyMouseIDs($divForCopy);
        });

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

        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
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

        $(".std").each(function () {
            var dataStd = $(this).data("std");
            my_widget_script.updatePlateValsStd(dataStd);
        }).on("input", function () {
            var dataStd = $(this).data("std");
            my_widget_script.updatePlateValsStd(dataStd);
        });

        $(".sample").each(function () {
            var dataSample = $(this).data("sample");
            my_widget_script.updatePlateValsSamples(dataSample, "plateID", "sample");
        }).on("input", function () {
            var dataSample = $(this).data("sample");
            my_widget_script.updatePlateValsSamples(dataSample, "plateID", "sample");
        });
        $(".mouseID").each(function () {
            var dataSample = $(this).data("sample");
            my_widget_script.updatePlateValsSamples(dataSample, "mouseID", "mouseID");
        }).on("input", function () {
            var dataSample = $(this).data("sample");
            my_widget_script.updatePlateValsSamples(dataSample, "mouseID", "mouseID");
        });
        $(".time").each(function () {
            var dataSample = $(this).data("sample");
            my_widget_script.updatePlateValsSamples(dataSample, "time", "time");
        }).on("input", function () {
            var dataSample = $(this).data("sample");
            my_widget_script.updatePlateValsSamples(dataSample, "time", "time");
        });

        if($("#useTextEntry").is(":checked")){
            $("#idEntry").each(function () {
                my_widget_script.fillSampleIDsFromList($(this));
            }).on("change", function () {
                my_widget_script.fillSampleIDsFromList($(this));
            });
        }

        $("#useTextEntry").on("change", function () {
            if($("#useTextEntry").is(":checked")){
                $("#idEntry").each(function () {
                    my_widget_script.fillSampleIDsFromList($(this));
                }).on("change", function () {
                    my_widget_script.fillSampleIDsFromList($(this));
                });
            } else {
                $("#idEntry").off("change");
            }
        })

        my_widget_script.adjustForNumSamples();
        my_widget_script.resize();
    },

    fillSampleIDsFromList: function ($list){
        var fullList = $list.val();
        var splitList = fullList.split(/[\r\n]+/);
        if(splitList.length <= 19){
            $("#sampleNum").val(splitList.length * 2);
            my_widget_script.adjustForNumSamples()
        } else if(splitList.length > 19){
            $("#sampleNum").val(38);
            my_widget_script.adjustForNumSamples()
        }
        sampleNum = 0;
        for (var i = 0; i < splitList.length && i < 19; i++ ){
            mouseID = splitList[i];
            sampleNum++;

            // Sample ID
            $preSample = $("#sample"+sampleNum);
            $preSample.val(
                mouseID + " pre"
            );
            var dataPreSample = $preSample.data("sample");
            my_widget_script.updatePlateValsSamples(dataPreSample, "plateID", "sample");
            
            // Mouse ID
            $preMouseID = $("#mouse"+sampleNum);
            $preMouseID.val(mouseID);
            my_widget_script.updatePlateValsSamples(dataPreSample, "mouseID", "mouseID");


            // Sample ID
            sampleNum++;
            $postSample = $("#sample"+sampleNum);
            $postSample.val(
                mouseID + " post"
            );
            var dataPostSample = $postSample.data("sample");
            my_widget_script.updatePlateValsSamples(dataPostSample, "plateID", "sample");

            // Mouse ID
            $postMouseID = $("#mouse"+sampleNum);
            $postMouseID.val(mouseID);
            my_widget_script.updatePlateValsSamples(dataPostSample, "mouseID", "mouseID");
        }
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
        var dynamicContent = {};
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

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },
    // example - dataSearch("well", "1A") -> "[data-well = '1A']"

    watchValue: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
    },

    makePlateTable: function (plateType) {
        var plateSearch = my_widget_script.dataSearch("plate", plateType);
        var $table = $(".plateImg" + plateSearch);

        // Add the first row
        $table.append(
            $("<tr/>", {
                "class": "row0"
            })
        );

        var $tableRow = $table.find(".row0");

        // Add the columns for the first row
        for( var col = 0; col < 13; col ++) {
            // If it's column 0, leave it blank
            if(col == 0){
                $tableRow.append(
                    $("<th/>").append(plateType)
                )
            } else { // otherwise, make it class by column number and append the column number in a cell
                $tableRow.append(
                    $("<th/>", {
                        "class": "col"+col
                    }).append(col)
                )
            }   
        }

        var rowLetters = ["", "A", "B", "C", "D", "E", "F", "G", "H"];
        var rowPairs1 = [1, 2, 5, 6];
        var shading;

        // For subsequent rows
        for (var row = 1; row < 9; row++) {
            // Make the row and give it the class based on row letter
            $table.append(
                $("<tr/>", {
                    "class": "row"+rowLetters[row]
                })
            )
            
            $tableRow = $table.find(".row"+rowLetters[row]);

            for( var col = 0; col < 13; col++) {
                if (my_widget_script.isEven(col)){
                    if(rowPairs1.includes(row)){
                        shading = "light";
                    } else {shading = "dark";}
                } else {
                    if(rowPairs1.includes(row)){
                        shading = "dark";
                    } else {shading = "light";}
                }
                if(col == 0){
                    $tableRow.append(
                        $("<th/>", {
                            "class": "row"+rowLetters[row]
                        }).append(rowLetters[row])
                    )
                } else {
                    $tableRow.append(
                        $("<td/>", {
                            "class": "col" + col + " row" + rowLetters[row] + " well " + shading,
                            "data-well": col + rowLetters[row]
                        })
                    )
                }
            }
        }
    },

    isEven: function(value) {
	if (value%2 == 0)
		return true;
	else
		return false;
    },

    adjustForNumSamples: function () {
        var numSamples = parseInt($("#sampleNum").val());

        // Hide everything, then show only the relevant ones
        $(".sampleDiv").hide();

        if(numSamples >= 1 && numSamples <= 38){
            for(i = 0; i < numSamples; i++){
                var dataSearch = my_widget_script.dataSearch("sample", i+1);
                $(".sampleDiv" + dataSearch).show();
                var defaultTime;
                if(!my_widget_script.isEven(i + 1)){
                    defaultTime = 0
                } else {
                    defaultTime = 5
                }
                $(".time"+dataSearch).val(defaultTime);
                my_widget_script.updatePlateValsSamples(i+1, "time", "time");
            }

            for(i; i < 38; i ++ ){
                var dataSearch = my_widget_script.dataSearch("sample", i+1);
                $(".sample" + dataSearch).val("");
                $(".mouseID" + dataSearch).val("");
                $(".time" + dataSearch).val("");
                my_widget_script.updatePlateValsSamples(i+1, "plateID", "sample");
                my_widget_script.updatePlateValsSamples(i+1, "mouseID", "mouseID");
                my_widget_script.updatePlateValsSamples(i+1, "time", "time");
            }
            $(".sampleNum_calc").html("");
        } else {
            $(".sampleNum_calc").html("<span style='color:red'>Enter a number from 1-38</span>");
        }

        my_widget_script.resize();
    },

    makeStdEntry: function () {
        var $entryDiv = $(".stdsEntry");
        var colClasses = "col-12 col-sm-6 col-md-4 col-lg-3 mt-2 ";

        $entryDiv.empty();

        $entryDiv.append(
            $("<div/>", {
                "class": colClasses + "stdDiv",
                "data-std": "NSB"
            }).append(
                "NSB: <br/>"
            ).append(
                $("<input/>", {
                    type: "text",
                    name: "nsb",
                    id: "NSB",
                    "class": "std",
                    "data-std": "NSB",
                    value: "NSB"
                })
            )
        );

        for(i = 0; i < 7; i ++ ){
            stdNum = i + 1;

            $entryDiv.append(
                $("<div/>", {
                    "class": colClasses + "stdDiv",
                    "data-std": stdNum
                }).append(
                    "Std " + stdNum + ": <br/>"
                ).append(
                    $("<input/>", {
                        type: "text",
                        name: "std"+stdNum,
                        id: "std"+stdNum,
                        "class": "std",
                        "data-std": stdNum,
                        value: "STD " + stdNum
                    })
                )
            );
        }

        $entryDiv.append(
            $("<div/>", {
                "class": colClasses + "stdDiv",
                "data-std": "buffCon"
            }).append(
                "Buffer Ctrl: <br/>"
            ).append(
                $("<input/>", {
                    type: "text",
                    name: "buffcon",
                    id: "buffCon",
                    "class": "std",
                    "data-std": "buffCon",
                    value: "bufferCtrl"
                })
            )
        ).append(
            $("<div/>", {
                "class": colClasses + "stdDiv",
                "data-std": "cort"
            }).append(
                "Cort Standard: <br/>"
            ).append(
                $("<input/>", {
                    type: "text",
                    name: "cort",
                    id: "cort",
                    "class": "std",
                    "data-std": "cort",
                    value: "C_2"
                })
            )
        );

    },

    makeSampleEntry: function () {
        var $entryDiv = $(".sampleEntry");
        var colClasses = "col-12 col-sm-6 col-md-4 col-lg-3 mt-2 ";

        $entryDiv.empty();

        for(i = 0; i < 38; i ++ ) {
            sampleNum = i + 1;
            var defaultTime;
            if (my_widget_script.isEven(sampleNum)){
                defaultTime = 5
            } else {
                defaultTime = 0
            }

            $entryDiv.append(
                $("<div/>", {
                    "class": colClasses + "sampleDiv",
                    "data-sample": sampleNum
                }).append(
                    "<strong>Sample " + sampleNum + ":</strong> <br/>"
                ).append(
                    $("<input/>", {
                        type: "text",
                        name: "sample"+sampleNum,
                        id: "sample"+sampleNum,
                        "class": "sample",
                        "data-sample": sampleNum
                    })
                ).append(
                    "<br/>Mouse: <br/>"
                ).append(
                    $("<input/>", {
                        type: "text",
                        name: "mouse"+sampleNum,
                        id: "mouse"+sampleNum,
                        "class": "mouseID",
                        "data-sample": sampleNum
                    })
                ).append(
                    "<br/>Time: <br/>"
                ).append(
                    $("<input/>", {
                        type: "number",
                        name: "time"+sampleNum,
                        id: "time"+sampleNum,
                        "class": "time",
                        "data-sample": sampleNum,
                        value: defaultTime
                    })
                )
            )
        }
    },

    updatePlateValsStd: function (stdVal) {
        var dataSearchVal = my_widget_script.dataSearch("std", stdVal);
        var col, row1, row2
        var dataSearchWell1, dataSearchWell2

        switch (stdVal) {
            case "NSB":
                col = 1;
                row1 = "A";
                row2 = "B";
                break;

            case 1:
                col = 1;
                row1 = "C";
                row2 = "D";
                break;

            case 2:
                col = 1;
                row1 = "E";
                row2 = "F";
                break;
            
            case 3:
                col = 1;
                row1 = "G";
                row2 = "H";
                break;

            case 4:
                col = 2;
                row1 = "A";
                row2 = "B";
                break;
            
            case 5:
                col = 2;
                row1 = "C";
                row2 = "D";
                break;

            case 6:
                col = 2;
                row1 = "E";
                row2 = "F";
                break;

            case 7:
                col = 2;
                row1 = "G";
                row2 = "H";
                break;

            case "buffCon":
                col = 3;
                row1 = "A";
                row2 = "B";
                break;

            case "cort":
                col = 3;
                row1 = "C";
                row2 = "D";
                break;
            default:
                break;
        }
        
        dataSearchWell1 = my_widget_script.dataSearch("well", "" + col+row1);
        dataSearchWell2 = my_widget_script.dataSearch("well", "" + col+row2);

        my_widget_script.watchValue($(".std" + dataSearchVal), $("#plateIDImg").find(".well" + dataSearchWell1));
        my_widget_script.watchValue($(".std" + dataSearchVal), $("#plateIDImg").find(".well" + dataSearchWell2));
    },

    updatePlateValsSamples: function (sampleNum, plateType, valType) {
        var dataSearchVal = my_widget_script.dataSearch("sample", sampleNum);
        var col, row1, row2
        var dataSearchWell1, dataSearchWell2
        var plateSearch = my_widget_script.dataSearch("plate", plateType);

        cols = [
            "", 3, 3,
            4, 4, 4, 4, 
            5, 5, 5, 5,
            6, 6, 6, 6,
            7, 7, 7, 7,
            8, 8, 8, 8,
            9, 9, 9, 9,
            10, 10, 10, 10,
            11, 11, 11, 11,
            12, 12, 12, 12
        ];

        row1s = [
            "", "E", "G", // 3
            "A", "C", "E", "G", // 4 
            "A", "C", "E", "G", // 5 
            "A", "C", "E", "G", // 6 
            "A", "C", "E", "G", // 7 
            "A", "C", "E", "G", // 8 
            "A", "C", "E", "G", // 9 
            "A", "C", "E", "G", // 10 
            "A", "C", "E", "G", // 11
            "A", "C", "E", "G", // 12
        ];

        row2s = [
            "", "F", "H", // 3
            "B", "D", "F", "H", // 4
            "B", "D", "F", "H", // 5
            "B", "D", "F", "H", // 6
            "B", "D", "F", "H", // 7
            "B", "D", "F", "H", // 8
            "B", "D", "F", "H", // 9
            "B", "D", "F", "H", // 10
            "B", "D", "F", "H", // 11
            "B", "D", "F", "H", // 12
        ]

        col = cols[sampleNum];
        row1 = row1s[sampleNum];
        row2 = row2s[sampleNum];

        dataSearchWell1 = my_widget_script.dataSearch("well", "" + col+row1);
        dataSearchWell2 = my_widget_script.dataSearch("well", "" + col+row2);

        my_widget_script.watchValue($("." + valType + dataSearchVal), $(".plateImg"+plateSearch).find(".well" + dataSearchWell1));
        my_widget_script.watchValue($("." + valType + dataSearchVal), $(".plateImg"+plateSearch).find(".well" + dataSearchWell2));

        my_widget_script.resize();
    },

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        $cardHead.next().find("textarea.autoAdjust").each(function () {
            if(! $(this).is(":hidden")) {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        my_widget_script.resize();
    },

    makeCard: function ($div, cardHeadContent, cardBodyContent) {
        // Add extras to header, such as classes or data attributes in calling function after making the card
        $div.append(
            $("<div/>", {
                "class": "card"
            }).append(
                $("<div/>", {
                    "class": "card-header"
                }).on("click", function () {
                    // console.log($(this));
                    my_widget_script.toggleCard($(this));
                }).append(cardHeadContent)
            ).append(
                $("<div/>", {
                    "class": "card-body"
                }).append(
                    cardBodyContent
                )
            )
        )
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
        var toAddLine = false;
        if (copyHead) {
            $table.find("thead").children("tr").each(function () { //add each child of the row
                var addTab = "";
                $(this).children().each(function () {
                    $temp.text($temp.text() + addTab + $(this).text());
                    addTab = "\t";
                });
                toAddLine = true;
            });
            if(toAddLine){addLine = "\n";}
        }

        $table.find("tbody").children("tr").each(function () { //add each child of the row
            $temp.text($temp.text() + addLine);
            var addTab = "";
            $(this).find("th, td").each(function () {
                if ($(this).text()) {
                    var addText = $(this).text();
                } else {
                    var addText = ""
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

    copyMouseIDs: function($divForCopy){
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";

        var fullList = $("#idEntry").val();
        var splitList = fullList.split(/[\r\n]+/);
        var addText;

        for (var i = 0; i < splitList.length && i < 19; i++ ){
            mouseID = splitList[i];
            $temp.text($temp.text() + addLine);
            addLine = "\n";
            totalText = mouseID + addLine + mouseID + addLine + mouseID + addLine + mouseID;
            $temp.text($temp.text() + totalText);
        }

        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    copySampleIDs: function ($divForCopy, duplicate) {
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";

        var numSamples = $("#sampleNum").val();
        var addText, sampleNum;
        
        for (i = 0; i < numSamples; i ++ ){
            $temp.text($temp.text() + addLine);
            addLine = "\n";
            sampleNum = i + 1;
            var dataSearch = my_widget_script.dataSearch("sample", sampleNum);
            addText = $(".sample"+dataSearch).val();
            if(duplicate){
                totalText = addText + addLine + addText;
            } else{
                totalText = addText;
            }
            $temp.text($temp.text() + totalText);
        }

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
     * @param {string} tableID - tableID as a string for the table that will be copied
     * @param $errorMsg - error message div as jQuery object
     */
     toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) {
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    /**
     * The steps that should be taken when the copy data button is pressed
     * Checks if the $copyHead is checked, and then
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
        var copyHead = $copyHead;

        // //only copy the heading when the input box is checked
        // if ($copyHead.is(":checked")) {
        //     copyHead = true;
        // } else {
        //     copyHead = false;
        // }

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            my_widget_script.resize(); //resize
            my_widget_script.copyTable($tableToCopy, copyHead, $divForCopy); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },  

    copySampleIDsFuncs: function ($errorMsg, $divForCopy, duplicate){
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) { //if data is valid
            if($("#sampleNum").val() > 0 && $("#sampleNum").val() <= 38){
                my_widget_script.copySampleIDs($divForCopy, duplicate); //copy table
                $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
            } else{
                $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Please enter a sample number from 1-38 </span>"); //add to error message
            }
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    }      
};