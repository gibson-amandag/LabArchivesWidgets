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
            cellNums: my_widget_script.cellNums,
            cells: my_widget_script.cells
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
            cellNums: [1, 2, 3, 4, 5, 6, 7],
            cells: {
                1: {id: "20220227a"},
                2: {id: "20220227b"},
                3: {id: "20220227c"},
                4: {id: "20220227d"},
                5: {id: "20220227e"},
                6: {id: "20220227f"},
                7: {id: "20220227g"},
            }
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
       // console.log(parsedJson);
       if(parsedJson.cells){
            my_widget_script.cells = parsedJson.cells;
        } else {
            my_widget_script.cells = {}
        }

        // console.log(my_widget_script.cells);

        // console.time("initDynamic");
        if(parsedJson.cellNums){
            for (var i = 0; i < parsedJson.cellNums.length; i++){
                cell = parsedJson.cellNums[i];
                my_widget_script.cellNums.push(cell);
                my_widget_script.makeCellCard(cell);
            }
        } else {
            my_widget_script.cellNums = [];
        }
        // console.timeEnd("initDynamic");
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
            $("input[type='date']").removeClass(".hasDatePicker");
        } else {
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

        $(".watchTime").each(function () {
            my_widget_script.watchTimeNextEl($(this));
        }).on("input", function () {
            my_widget_script.watchTimeNextEl($(this));
        });

        $("#addCell").on("click", function () {
            if(my_widget_script.cellNums.length > 0){
                var lastCell = my_widget_script.cellNums[my_widget_script.cellNums.length - 1];
                var cellNum = lastCell + 1;
            } else {
                var cellNum = 1;
            }

            var inArray = my_widget_script.checkInArray(cellNum, my_widget_script.cellNums);
            if(! inArray){
                my_widget_script.cellNums.push(cellNum);
                my_widget_script.cells[cellNum] = {}
                my_widget_script.makeCellCard(cellNum);
            }
        });

        $(".watch").each(function () {
            my_widget_script.watchValue($(this));
        });

        $("input.extractedTime").each(function () {
            my_widget_script.watchTimeNextEl($(this));
        });

        $(".cellHeader").each(function () {
            my_widget_script.toggleCard($(this));
        });

        my_widget_script.resize();
    },

    cellNums: [],
    cells: {},

    watchTimeNextEl: function ($elToWatch){
       var $elToFill = $elToWatch.next($(".fillTime"));
        // console.log($elToFill);

        my_widget_script.watchTime($elToWatch, $elToFill);
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

    watchTime: function ($elToWatch, $elToFill) {
        var addTime = $elToFill.data("time");
        // console.log(length);

        var startTime = $elToWatch.val();
        if(startTime){
            var time = new Date();
            startTimeSplit = my_widget_script.getHoursMin(startTime);
            addTimeSplit = my_widget_script.getHoursMin(addTime);
            // set start time
            time.setHours(startTimeSplit.hours, startTimeSplit.mins, 00, 000);
            time.setHours(time.getHours() + addTimeSplit.hours);
            time.setMinutes(time.getMinutes() + addTimeSplit.mins);
            // console.log(time);
            $elToFill.text(time.toLocaleTimeString());
        } else{
            $elToFill.text("{Enter Start Time}")
        }

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
                $("<button></button>", {
                    "type": "button",
                    "class": "card-header",
                }).on("click", function () {
                    my_widget_script.toggleCard($(this));
                }).append(cardHeadContent)
            ).append(
                $("<div/>", {
                    "class": "card-body collapse"
                }).append(
                    cardBodyContent
                )
            )
        )
        my_widget_script.resize();
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    calcSearch: function (calc) {
        var calcSearch = my_widget_script.dataSearch("calc", calc);
        return calcSearch;
    },

    cellSearch: function (cell) {
        var cellSearch = my_widget_script.dataSearch("cell", cell);
        return cellSearch;
    },

    tableSearch: function (table){
        var tableSearch = my_widget_script.dataSearch("table", table);
        return tableSearch;
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = my_widget_script.calcSearch(watch);
        var dayNum = $el.data("day");
        var cellNum = $el.data("cell");
        var val = $el.val();
        if(dayNum){
            calcSearch += my_widget_script.daySearch(dayNum);
        }
        if(cellNum){
            calcSearch += my_widget_script.cellSearch(cellNum);
        }
        if(watch == "cell"){
            if(!val){
                val = "Cell " + cellNum;
            }
        }
        $(calcSearch).html(val);

        my_widget_script.resize();
    },

    checkInArray: function (searchVal, array){
        var inArray = $.inArray(searchVal, array) !== -1;
        return inArray
    },

    checkDateKeyPress: function ($el) {
        // https://stackoverflow.com/questions/40762549/html5-input-type-date-onchange-event
        $el.off("change blur"); // remove change/blur listeners
        $el.on("blur", function () {
            my_widget_script.checkDateFormat($el);
            $el.off("blur"); //remove listener
            $el.on("change", function () { //add back change listener
                my_widget_script.checkDateFormat($el);
            });
        });
        if (event.keyCode === 13) { // also fire if press enter
            my_widget_script.checkDateFormat($el);
        }
    },

    checkTimeKeyPress: function ($el) {
        // https://stackoverflow.com/questions/40762549/html5-input-type-date-onchange-event
        $el.off("change blur"); // remove change/blur listeners
        $el.on("blur", function () {
            my_widget_script.checkTimeFormat($el);
            $el.off("blur"); //remove listener
            $el.on("change", function () { //add back change listener
                my_widget_script.checkTimeFormat($el);
            });
        });
        if (event.keyCode === 13) { // also fire if press enter
            my_widget_script.checkTimeFormat($el);
        }
    },

    makeCellCard: function (cellNum) {
        var $div = $(".cellInfo");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        var acqDataRow = this.makeCheckRow(row, col, "Acquired data:", "acqData", cellNum);
        var passiveDateRow = this.makeDateRow(row, col, "Checked passives:", "checkPass", cellNum);
        var passivesRow = this.makeCheckRow(row, col, "Passes passives:", "passives", cellNum);
        var evDetectDateRow = this.makeDateRow(row, col, "Date of event detection:", "evDetect", cellNum);
        var evConfirmDateRow = this.makeDateRow(row, col, "Date of event confirmation:", "evConfirm", cellNum);
        var incCellRow = this.makeCheckRow(row, col, "Include Cell:", "incCell", cellNum);
        // var sectionDateRow = this.makeDateRow(row, col, "Date of Sectioning:", "section", cellNum);
        // var immunoDateRow = this.makeDateRow(row, col, "Date Immuno Finished:", "immuno", cellNum);
        // var imageDateRow = this.makeDateRow(row, col, "Date Imaging Finished:", "image", cellNum);
        // var quantDateRow = this.makeDateRow(row, col, "Date Quantified:", "quant", cellNum);

        // var transportTimeRow = this.makeTimeRow(row, col, "Time of transport:", "transport", cellNum);
        // var sacTimeRow = this.makeTimeRow(row, col, "Time of sacrifice:", "sac", cellNum);
        // var perfusionTimeRow = this.makeTimeRow(row, col, "Time of perfusion:", "perfusion", cellNum);
        // var extractedTimeRow = this.makeTimeRow(row, col, "Time of brain extraction:", "extracted", cellNum);
        // var changedSucroseTimeRow = this.makeTimeRow(row, col, "Time vial changed to sucrose:", "changedSucrose", cellNum);

        // extractedTimeRow.find("div.col").append(
        //     "Change to sucrose at <span class='fillTime purple' data-time='01:30'>{Enter Time}</span>"
        // )

        // extractedTimeRow.find(".extractedTime").on("input", function (){
        //     my_widget_script.watchTimeNextEl($(this));
        // }).each(function () {
        //     my_widget_script.watchTimeNextEl($(this));
        // });

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 cellCard",
                "data-cell": cellNum
            }).append(
                $("<div/>", {
                    "class": "card"
                }).append(
                    $("<button></button>", {
                        "class": "card-header cellHeader",
                        "type": "button",
                        "data-calc": "cell",
                        "data-cell": cellNum
                    }).on("click", function () {
                        my_widget_script.toggleCard($(this));
                    }).append("Cell " + cellNum)
                ).append(
                    $("<div/>", {
                        "class": "card-body"
                    }).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append("<h4>Cell ID:</h4>")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "text", 
                                    "data-cell": cellNum,
                                    id: "cellID"+cellNum,
                                    name: "cellid"+cellNum,
                                    "class": "cellID fullWidth watch",
                                    "data-watch": "cell"
                                }).on("change", function () {
                                    my_widget_script.cells[cellNum]["id"] = $(this).val();
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": row + " hideView"
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append("Delete:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "button", 
                                    value: "Delete Cell",
                                    "data-cell": cellNum,
                                    id: "deleteCell"+cellNum,
                                    name: "deletecell"+cellNum,
                                    "class": "deleteCell fullWidth",
                                }).on("click", function () {
                                    my_widget_script.deleteCellFuncs($(this).data("cell"));
                                })
                            )
                        )
                    ).append(
                        acqDataRow
                    ).append(
                        passiveDateRow
                    ).append(
                        passivesRow
                    ).append(
                        evDetectDateRow
                    ).append(
                        evConfirmDateRow
                    ).append(
                        incCellRow
                    // ).append(
                    //     extractedTimeRow
                    // ).append(
                    //     changedSucroseTimeRow
                    // ).append(
                    //     sectionDateRow
                    // ).append(
                    //     immunoDateRow
                    // ).append(
                    //     imageDateRow
                    // ).append(
                    //     quantDateRow
                    ).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append(
                                "Series to include:"
                            )
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $('<text' + 'area></text' + 'area>', {
                                    "data-cell": cellNum,
                                    id: "incNotes"+cellNum,
                                    name: "incnotes"+cellNum,
                                    "rows": 1,
                                    "class": "incNotes fullWidth autoAdjust"
                                }).on('input', function () {
                                    this.style.height = 'auto';
                                    this.style.height = (this.scrollHeight) + 'px';
                                    my_widget_script.resize();
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $('<text' + 'area></text' + 'area>', {
                                    "data-cell": cellNum,
                                    id: "notes"+cellNum,
                                    name: "notes"+cellNum,
                                    "rows": 1,
                                    "class": "notes fullWidth autoAdjust"
                                }).on('input', function () {
                                    this.style.height = 'auto';
                                    this.style.height = (this.scrollHeight) + 'px';
                                    my_widget_script.resize();
                                })
                            )
                        )
                    )
                )
            )
        )

        
        var $cellTable = $("#cellTable");

        var $cellTableBody = $cellTable.find("tbody");
        
        $cellTableBody.append(
            $("<tr/>", {
                "data-cell": cellNum
            })
        );
            
        var $thisRow = $cellTableBody.find(this.cellSearch(cellNum));
        
        var cells = [
            "cell", 
            "acqData", 
            "checkPassDate", 
            "passives", 
            "evDetectDate", 
            "evConfirmDate",
            "incCell"
        ]
            
        for(i in cells){
            var cell = cells[i];
            var $el = my_widget_script.makeDataCell(cell, cellNum);
            $thisRow.append($el);
        }

        $(".watch").on("input", function () {
            my_widget_script.watchValue($(this));
        });

        $("input[type='date']").each(function () {
            my_widget_script.checkDateFormat($(this));
        }).on("input", function (){
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").each(function () {
            my_widget_script.checkTimeFormat($(this));
        }).on("input", function() {
            my_widget_script.checkTimeFormat($(this));
        });

        my_widget_script.resize();
    },

    makeCheckRow: function (row, col, label, className, cellNum) {
        var lowerCaseName = className.toLowerCase();
        var $row = $("<div></div>", {
                        "class": row
                    }).append(
                        $("<div></div>", {
                            "class": col
                        }).append(label)
                    ).append(
                        $("<div></div>", {
                            "class": "col"
                        }).append(
                            $("<select></select>", {
                                "data-cell": cellNum,
                                id: className+"Check"+cellNum,
                                name: lowerCaseName+"check"+cellNum,
                                "class": className+" fullWidth watch",
                                "data-watch": className
                            }).append(
                                "<option value=''>Select</option><option value='yes'>Yes</option><option value='no'>No</option><option value='unsure'>Unsure</option><option value='NA'>N/A</option>"
                            )
                        )
                    )

        return $row
    },

    makeDateRow: function (row, col, label, className, cellNum) {
        var lowerCaseName = className.toLowerCase();
        var $row = $("<div/>", {
                        "class": row
                    }).append(
                        $("<div/>", {
                            "class": col
                        }).append(label)
                    ).append(
                        $("<div/>", {
                            "class": "col"
                        }).append(
                            $("<input/>", {
                                type: "date", 
                                "data-cell": cellNum,
                                id: className+"Date"+cellNum,
                                name: lowerCaseName+"date"+cellNum,
                                "class": className+"Date fullWidth watch",
                                "data-watch": className+"Date"
                            })
                        )
                    )

        return $row
    },

    makeTimeRow: function (row, col, label, className, cellNum) {
        var lowerCaseName = className.toLowerCase();
        var $row = $("<div/>", {
                        "class": row
                    }).append(
                        $("<div/>", {
                            "class": col
                        }).append(label)
                    ).append(
                        $("<div/>", {
                            "class": "col"
                        }).append(
                            $("<input/>", {
                                type: "time", 
                                "data-cell": cellNum,
                                id: className+"Time"+cellNum,
                                name: lowerCaseName+"time"+cellNum,
                                "class": className+"Time fullWidth watch",
                                "data-watch": className+"Time"
                            })
                        )
                    )

        return $row
    },

    makeDataCell: function (className, cellNum) {
        var $cell = $("<td/>", {
            "data-calc": className,
            "data-cell": cellNum,
            "class": className
        })
        return $cell
    },

    deleteCellFuncs: function (cellNum) {
        var proceed = confirm("Are you sure that you wish to delete this cell?");
        if(proceed){
            // Remove it from the cellNums
            var index = my_widget_script.cellNums.indexOf(cellNum);
            if(index > -1){
                my_widget_script.cellNums.splice(index, 1);
            }

            //Remove it from cells
            delete my_widget_script.cells[cellNum];
    
            var cellSearch = my_widget_script.cellSearch(cellNum);
            $(cellSearch).remove();
        }

        my_widget_script.resize();
    },
};