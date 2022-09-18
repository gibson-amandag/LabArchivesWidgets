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
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event

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

        this.resetFilter();
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
            cellNums: this.cellNums,
            cells: this.cells
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
        $('#the_form').find('select, textarea, input').each((i, e)=> {
            if (!$(e).prop('required')) { //if this element does not have a required attribute
                //don't change anything (fail remains false)
            } else { //if there is a required attribute
                if (!$(e).val()) { //if there is not a value for this input
                    fail = true; //change fail to true
                    name = $(e).attr('id'); //replace the name variable with the name attribute of this element
                    fail_log += name + " is required \n"; //add to the fail log that this name is required
                }

            }
        });

        $("input[type='date']").each((i, e)=> {
            var date = $(e).val();
            if(date){
                var validDate = this.isValidDate(date);
                if(!validDate){
                    fail = true;
                    fail_log += "Please enter valid date in form 'YYYY-MM-DD'";
                }
            }
        });

        $("input[type='time']").each((i, e)=> {
            var time = $(e).val();
            if(time){
                var validtime = this.isValidTime(time);
                if(!validtime){
                    fail = true;
                    fail_log += "Please enter valid time in form 'hh:mm' - 24 hr time";
                }
            }
        });

        if (fail) { //if fail is true (meaning a required element didn't have a value)
            return bootbox.alert(fail_log); //return the fail log as an alert
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
            this.cells = parsedJson.cells;
        } else {
            this.cells = {}
        }

        // console.log(this.cells);

        // console.time("initDynamic");
        if(parsedJson.cellNums){
            for (var i = 0; i < parsedJson.cellNums.length; i++){
                cell = parsedJson.cellNums[i];
                this.cellNums.push(cell);
                this.makeCellCard(cell);
            }
        } else {
            this.cellNums = [];
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
            $(".filter").prop("readonly", "").prop("disabled", "");
            $(".filter").find("option").prop("disabled", "");

        } else {
            $("input[type='date']").each((i,e)=> {
                this.checkDateFormat($(e));
            });
            
            $("input[type='time']").each((i,e)=> {
                this.checkTimeFormat($(e));
            });
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        $(".toggleTable").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var $table = $("#"+tableID);
            this.toggleTableFuncs($table);
        });

        $('.toCSV').on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var dateToday = luxon.DateTime.now().toISODate(); // Luxon has to be added in HTML
            var fileName = "table_"+tableID+"_"+dateToday;
            var $errorMsg = $("#errorMsg");
            
            this.toCSVFuncs(fileName, tableID, $errorMsg);
        });

       $(".copyData").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            // Get the data-table text string to add to the query to find the table
            var tableSearch = this.tableSearch(tableID);
            // Find the element that tells whether or not to copy the table
            var $copyHead = $(".copyHead"+tableSearch);
            var $transpose = $(".transpose"+tableSearch);
            var $tableToCopy = $("#"+tableID);
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose)
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
        $('.needForTableLab').each((i,e)=> { //find element with class "needForFormLab"
            //alert($(this).val());
            $(e).html("<span style='color:blue'>#</span>" + $(e).html()); //add # before
        });

        $('.requiredLab').each((i,e)=> { //find element with class "requiredLab"
            //alert($(e).val());
            $(e).html("<span style='color:red'>*</span>" + $(e).html()); //add # before
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
        this.timeSupported = supported;
        return (supported);
    },

    timeSupported: true,

    checkTimeFormat: function ($timeInput) {
        if(!this.timeSupported){ // if not supported
            $timeInput.next(".timeWarning").remove();
            var time = $timeInput.val();
            var isValid = this.isValidTime(time);
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
        this.dateSupported = supported;
        return (supported);
    },

    dateSupported: true,

    checkDateFormat: function ($dateInput) {
        if(!this.dateSupported){ // if not supported
            $dateInput.next(".dateWarning").remove();
            var date = $dateInput.val();
            var isValid = this.isValidDate(date);
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
        this.isDateSupported();
        this.isTimeSupported();
        
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", (e)=> {
            this.checkDateFormat($(e.currentTarget));
        }).each((i,e)=> {
            this.checkDateFormat($(e));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", (e)=> {
            this.checkTimeFormat($(e.currentTarget));
        }).each((i,e)=> {
            this.checkTimeFormat($(e));
        });
        
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        
        $('textarea.autoAdjust').each((i, e)=> {
            e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', (e)=> {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = (e.currentTarget.scrollHeight) + 'px';
            this.resize();
        });

        $(".watchTime").each((i, e)=> {
            this.watchTimeNextEl($(e));
        }).on("input", (e)=> {
            this.watchTimeNextEl($(e.currentTarget));
        });

        $(".addCell").on("click", (e)=> {
            if(this.cellNums.length > 0){
                var lastCell = this.cellNums[this.cellNums.length - 1];
                var cellNum = lastCell + 1;
            } else {
                var cellNum = 1;
            }

            var inArray = this.checkInArray(cellNum, this.cellNums);
            if(! inArray){
                this.cellNums.push(cellNum);
                this.cells[cellNum] = {}
                this.makeCellCard(cellNum);
            }
        });

        $(".filter").on("input", (e)=>{
            // console.log("changed a filter")
            this.filterData();
        });

        $("#resetFilter").on("click", (e)=>{
            // console.log("pressed reset filter");
            this.resetFilter();
        });

        $(".watch").each((i,e)=> {
            this.watchValue($(e));
        });

        $("input.extractedTime").each((i,e)=> {
            this.watchTimeNextEl($(e));
        });

        $(".cellHeader").each((i,e)=> {
            this.toggleCard($(e));
        });

        this.updateAllExclusion();
        // this.resetFilter();
        this.resize();
    },

    cellNums: [],
    cells: {},

    watchTimeNextEl: function ($elToWatch){
       var $elToFill = $elToWatch.next($(".fillTime"));
        // console.log($elToFill);

        this.watchTime($elToWatch, $elToFill);
    },

    /**
     * TO DO: edit this function to define which <div>s or other elements
     * should be adjusted based on the current width of the window
     */
    resize: function () {
        //resize the container
        this.parent_class.resize_container();
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
     data_valid_form: function ($errorMsg) {
        var valid = true; //begin with a valid value of true
        var fail_log = $("<div></div>").append("Missing values for:");
        var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('.needForTable').each((i, e)=> {
            if (!$(e).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                name = $(e).attr('id'); //replace the name variable with the id attribute of this element
                fail_log.append("<br/>"+name)
                // fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $errorMsg.html(
                "<span style='color:red; font-size:36px;'>" +
                    "Please fill out all elements marked by a"+
                    "</span><span style='color:blue; font-size:36px;'>" +
                    " blue #"+
                "</span>"
            );
            $errorMsg.append(fail_log);
            // console.log("fail log\n", fail_log)    
        } else {
            $errorMsg.html("");
        }

        this.resize();
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
            startTimeSplit = this.getHoursMin(startTime);
            addTimeSplit = this.getHoursMin(addTime);
            // set start time
            time.setHours(startTimeSplit.hours, startTimeSplit.mins, 00, 000);
            time.setHours(time.getHours() + addTimeSplit.hours);
            time.setMinutes(time.getMinutes() + addTimeSplit.mins);
            // console.log(time);
            $elToFill.text(time.toLocaleTimeString());
        } else{
            $elToFill.text("{Enter Start Time}")
        }

        this.resize();
    },

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        $cardHead.next().find("textarea.autoAdjust").each((i,e)=> {
            if(! $(e).is(":hidden")) {
                e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        this.resize();
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
                }).on("click", (e)=> {
                    this.toggleCard($(e.currentTarget));
                }).append(cardHeadContent)
            ).append(
                $("<div/>", {
                    "class": "card-body collapse"
                }).append(
                    cardBodyContent
                )
            )
        )
        this.resize();
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    calcSearch: function (calc) {
        var calcSearch = this.dataSearch("calc", calc);
        return calcSearch;
    },

    cellSearch: function (cell) {
        var cellSearch = this.dataSearch("cell", cell);
        return cellSearch;
    },

    tableSearch: function (table){
        var tableSearch = this.dataSearch("table", table);
        return tableSearch;
    },
    
    watchSearch: function (watch){
        var watchSearch = this.dataSearch("watch", watch);
        return watchSearch;
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = this.calcSearch(watch);
        var dayNum = $el.data("day");
        var cellNum = $el.data("cell");
        var val = $el.val();
        if(dayNum){
            calcSearch += this.daySearch(dayNum);
        }
        if(cellNum){
            calcSearch += this.cellSearch(cellNum);
        }
        if(watch == "cell"){
            if(!val){
                val = "Cell " + cellNum;
            }
        } else if(watch == "recordingType"){
            if(val){
                var newVal = "";
                for(selection of val){
                    if(newVal){
                        newVal+=";"
                    }
                    newVal += selection
                }
                val = newVal;
            }
        }
        $(calcSearch).html(val);


        if(cellNum){
            this.updateExclusion(cellNum);
        }
        this.resize();
    },

    updateAllExclusion: function(){
        var cells = this.cellNums;
        var numCells = cells.length;
        for(var i = 0; i<numCells; i++){
            var thisCell = cells[i];
            my_widget_script.updateExclusion(thisCell);
        }
    },
        
    updateExclusion: function(cellNum){   
        var calcSearch = this.calcSearch("excludeCell");
        var cellSearch = this.cellSearch(cellNum);

        var exclude = false;
        var acqData = $(".acqData"+cellSearch).val();
        var passive = $(".passives"+cellSearch).val();
        var includeCell = $(".incCell"+cellSearch).val();
        if(acqData == "no" || passive == "no" || includeCell == "no"){
            exclude = true;
        }
        $(calcSearch+cellSearch).text(exclude);
        if(exclude){
            // console.log("make it red");
            this.findCellRow(cellNum).css("background-color", "lightpink")
        } else {
            this.findCellRow(cellNum).css("background-color", "white")
        }
    },

    checkInArray: function (searchVal, array){
        var inArray = $.inArray(searchVal, array) !== -1;
        return inArray
    },

    checkDateKeyPress: function ($el) {
        // https://stackoverflow.com/questions/40762549/html5-input-type-date-onchange-event
        $el.off("change blur"); // remove change/blur listeners
        $el.on("blur", (e)=> {
            this.checkDateFormat($el);
            $el.off("blur"); //remove listener
            $el.on("change", (e)=> { //add back change listener
                this.checkDateFormat($el);
            });
        });
        if (event.keyCode === 13) { // also fire if press enter
            this.checkDateFormat($el);
        }
    },

    checkTimeKeyPress: function ($el) {
        // https://stackoverflow.com/questions/40762549/html5-input-type-date-onchange-event
        $el.off("change blur"); // remove change/blur listeners
        $el.on("blur", (e)=> {
            this.checkTimeFormat($el);
            $el.off("blur"); //remove listener
            $el.on("change", (e)=> { //add back change listener
                this.checkTimeFormat($el);
            });
        });
        if (event.keyCode === 13) { // also fire if press enter
            this.checkTimeFormat($el);
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
        
        var recTypeObj = {
            label: "Recording type:",
            type: "select",
            className: "recordingType",
            optionsObj: [
                {
                    value: "",
                    text: "[Select]"
                }, {
                    value: "extracellular",
                    text: "Extracellular"
                }, {
                    value: "currentClamp",
                    text: "Current clamp"
                }, {
                    value: "voltageClamp",
                    text: "Voltage Clamp"
                }
            ]
        };
        var recTypeRow = this.makeRowFromObj(recTypeObj, cellNum);

        var locationObj = {
            label: "Cell location:",
            type: "text",
            className: "cellLoc"
        }
        var locationRow = this.makeRowFromObj(locationObj, cellNum);

        var responseRow = this.makeCheckRow(row, col, "Responded to stim:", "responseToStim", cellNum)
        
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
                    }).on("click", (e)=> {
                        this.toggleCard($(e.currentTarget));
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
                                }).on("change", (e)=> {
                                    this.cells[cellNum]["id"] = $(e.currentTarget).val();
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
                                }).on("click", (e)=> {
                                    this.deleteCellFuncs($(e.currentTarget).data("cell"));
                                })
                            )
                        )
                    ).append(
                        acqDataRow
                    ).append(
                        locationRow
                    ).append(
                        recTypeRow
                    ).append(
                        passiveDateRow
                    ).append(
                        passivesRow
                    ).append(
                        evDetectDateRow
                    ).append(
                        evConfirmDateRow
                    ).append(
                        responseRow
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
                                }).on('input', (e)=> {
                                    e.currentTarget.style.height = 'auto';
                                    e.currentTarget.style.height = (e.currentTarget.scrollHeight) + 'px';
                                    this.resize();
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
                                }).on('input', (e)=> {
                                    e.currentTarget.style.height = 'auto';
                                    e.currentTarget.style.height = (e.currentTarget.scrollHeight) + 'px';
                                    this.resize();
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
            "cellLoc",
            "recordingType", 
            "checkPassDate", 
            "passives", 
            "evDetectDate", 
            "evConfirmDate",
            "responseToStim",
            "incCell",
            "excludeCell"
        ]
            
        for(i in cells){
            var cell = cells[i];
            var $el = this.makeDataCell(cell, cellNum);
            $thisRow.append($el);
        }

        $(".watch").on("input", (e)=> {
            this.watchValue($(e.currentTarget));
        });

        $("input[type='date']").each((i,e)=> {
            this.checkDateFormat($(e));
        }).on("input", (e)=>{
            this.checkDateFormat($(e.currentTarget));
        });
        
        $("input[type='time']").each((i,e)=> {
            this.checkTimeFormat($(e));
        }).on("input", (e)=> {
            this.checkTimeFormat($(e.currentTarget));
        });

        $(".recordingType").each((i,e)=>{
            $(e).attr("multiple", true);
        })

        this.resize();
    },

    makeRow: function(label, $input, addRowClass = ""){
        var myLeftCol = "col-12 col-lg-6";
        if(addRowClass){
            addRowClass = " " + addRowClass
        }

        var $label = $("<label></label>", {
            "for": $input.attr("id")
        }).append(label);

        var $row = $("<div></div>", {
            "class": "row mt-2" + addRowClass
        }).append(
            $("<div></div>", {
                "class": myLeftCol
            }).append(
                $label
            )
        ).append(
            $("<div></div>", {
                "class": "col"
            }).append(
                $input
            )
        )
        return $row
    },

    makeInput: function(inputType, className, itemNum, optionsObj){
        var lowerCaseName = className.toLowerCase();
        if(inputType === "select"){
            $input = $("<select></select>", {
                "name": lowerCaseName+itemNum,
                "id": className+itemNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-cell": itemNum
            })
            for(option of optionsObj){
                $input.append(
                    $("<option></option>", {
                        "value": option.value
                    }).append(
                        option.text
                    )
                )
            }
        } else if(inputType === "textarea"){
            $input = $("<tex" + "tarea></tex" +"tarea>", {
                "name": lowerCaseName+itemNum,
                "id": className+itemNum,
                "class": className + " fullWidth watch autoAdjust",
                "data-watch": className,
                "data-cell": itemNum,
            }).on("input", (e)=>{
                this.updateTextarea(e.currentTarget);
            })
        } else {
            var $input = $("<input></input>", {
                type: inputType,
                "name": lowerCaseName+itemNum,
                "id": className+itemNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-cell": itemNum
            })
        }

        if(inputType === "time"){
            $input.each((i,e)=> {
                this.checkTimeFormat($(e));
            }).on("change", (e)=> {
                this.checkTimeFormat($(e.currentTarget));
            })
        }
        if(inputType === "date"){
            $input.each((i,e)=> {
                this.checkDateFormat($(e));
            }).on("change", (e)=> {
                this.checkDateFormat($(e.currentTarget));
            })
        }
        return($input)
    },

    makeRowFromObj: function(obj, itemNum){
        var $row = this.makeRow(
            obj.label,
            this.makeInput(
                obj.type,
                obj.className,
                itemNum,
                obj.optionsObj
            ),
            obj.addRowClass
        );
        return($row);
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
            var index = this.cellNums.indexOf(cellNum);
            if(index > -1){
                this.cellNums.splice(index, 1);
            }

            //Remove it from cells
            delete this.cells[cellNum];
    
            var cellSearch = this.cellSearch(cellNum);
            $(cellSearch).remove();
        }

        this.resize();
    },

    resetFilter: function(){
        // console.log("reset filter");
        this.resetFilterSelections();
        this.filterData();
    },

    resetFilterSelections: function(){
        $("#nameFilter").val("");
        // $("#acqDataFilter").find("option").prop("selected", false);
        $("#acqDataFilter").val("yes");
        $("#checkPassFilter").val("either");
        $("#passiveFilter").find("option").prop("selected", false);
        $("#evDetectFilter").val("either");
        $("#evConfirmFilter").val("either");
        $("#includeFilter").find("option").prop("selected", false);
    },

    filterData: function(){
        var cells = this.cellNums;
        var numCells = cells.length;
        // console.log("cells", cells, "number of cells", numCells)
        
        var nameFilter = $("#nameFilter").val();
        var acqDataFilter = $("#acqDataFilter").val();
        var checkPassFilter = $("#checkPassFilter").val();
        var passiveFilter = $("#passiveFilter").val();
        var evDetectFilter = $("#evDetectFilter").val();
        var evConfirmFilter = $("#evConfirmFilter").val();
        var includeFilter = $("#includeFilter").val();
        // console.log(acqDataFilter);
        var keepCell;
        for(var i = 0; i<numCells; i++){
            var thisCell = cells[i];
            var keepCell = false
            if(this.matchesName(thisCell, nameFilter)){
                if(this.matchesFilter(thisCell, "acqData", acqDataFilter)){
                    if(this.matchesDate(thisCell, "checkPassDate", checkPassFilter)){
                        if(this.matchesFilter(thisCell, "passives", passiveFilter)){
                            // keepCell = true
                            if(this.matchesDate(thisCell, "evDetectDate", evDetectFilter)){
                                if(this.matchesDate(thisCell, "evConfirmDate", evConfirmFilter)){
                                    if(this.matchesFilter(thisCell, "incCell", includeFilter)){
                                        keepCell = true;
                                        // console.log("keep cell", thisCell)
                                    // } else {
                                    //     console.log(thisCell, "doesn't match inclusion")
                                    }
                                // } else {
                                //     console.log(thisCell, "doesn't match confirmation")
                                }
                            // } else {
                            //     console.log(thisCell, "doesn't match detection")
                            }
                        // } else {
                        //     console.log(thisCell, "doesn't match passives")
                        }
                    // } else {
                    //     console.log(thisCell, "doesn't match check passives")
                    }
                // } else {
                //     console.log(thisCell, "doesn't match acquired data")
                }
            // } else {
            //     console.log(thisCell, "doesn't match name")
            }

            if(keepCell){
                this.findCellCard(thisCell).show();
                this.findCellRow(thisCell).show();
            } else{
                this.findCellCard(thisCell).hide();
                this.findCellRow(thisCell).hide();
            }
        }
        this.resize();
    },

    findCellCard: function(cellNum){
        var cellSearch = this.cellSearch(cellNum);
        var $cellCard = $(".cellCard"+cellSearch);
        return $cellCard
    },

    findCellRow: function(cellNum){
        var cellSearch = this.cellSearch(cellNum);
        var $row = $("tr"+cellSearch);
        return $row
    },

    matchesFilter: function(cellNum, watchName, matchArray){
        var matches = false;
        if(matchArray){
            var cellSearch = this.cellSearch(cellNum);
            var watchSearch = this.watchSearch(watchName);
            var $el = $(watchSearch + cellSearch);
            var thisVal = $el.val();
            // console.log("thisVal", thisVal, "matchArray", matchArray);
            if(!thisVal){thisVal = ""}
            var matches = this.checkInArray(thisVal, matchArray);
        } else {
            // console.log("no match array");
            matches = true;
        }
        return matches
    },

    matchesName: function(cellNum, matchString){
        var matches = false;
        if(matchString){
            // console.log(matchString);
            var cellSearch = this.cellSearch(cellNum);
            var watchSearch = this.watchSearch("cell");
            var $el = $(watchSearch + cellSearch);
            var thisVal = $el.val();
            // console.log(thisVal)
            if(thisVal){
                matchArray = thisVal.match(matchString);
                // console.log("match name", matches);
                if(matchArray){
                    matches = true
                }
            } else{ // for when viewing
                matchArray = "".match(matchString);
                if(matchArray){
                    matches = true
                }
            }
        } else {
            matches = true; // they all match if no filter on name
        }
        return matches
    },
    
    matchesDate: function(cellNum, watchName, dateType){
        var matches = false;
        // console.log(dateType);
        if(dateType == "either"){
            matches = true;
        } else {
            var cellSearch = this.cellSearch(cellNum);
            var watchSearch = this.watchSearch(watchName);
            var $el = $(watchSearch + cellSearch);
            console.log($el);
            var thisVal = $el.val();
            var thisDateType = "invalid"
            // console.log(thisVal);
            if(thisVal){
                // console.log(thisVal, this.isValidDate(thisVal));
                if(this.isValidDate(thisVal)){
                    thisDateType = "valid"
                }
            }
            if(dateType == thisDateType){
                matches = true;
            } 
        }
        return matches
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
     * @param {*} $divForCopy - where the temp textarea should be added
     * @param {*} transpose - true if table should be transposed
     */
     
     copyTable: function ($table, copyHead, $divForCopy, transpose) {
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var rows = [];
        var rowNum = 0;
        // If you copying the head of the table
        if (copyHead) {
            // Find thead and then all children rows
            $table.find("thead").children("tr").each((i,e)=> {
                // If the table is being transposed, start the row number at 0 for each new row
                if(transpose){rowNum = 0;}
                // For each row, find each td or th element (table cell)
                $(e).find("td, th").each((i,e)=> {
                    // If there's not yet an array for this row, make an empty one
                    if(rows[rowNum]===undefined){rows[rowNum] = []}
                    // Add the text of each cell to the row's array
                    rows[rowNum].push($(e).text());
                    // If table is being transposed, add one to the row number for each cell
                    if(transpose){rowNum++;}
                });
                // If table is not being transposed, add one to the row number for each row
                if(!transpose){rowNum++;}
            });
        }

        // Find each row in the table body
        $table.find("tbody").children("tr").not(":hidden").each((i,e)=> { // don't copy hidden rows
            // If transposing, start the row number at 0 for each new row
            if(transpose){rowNum = 0;}
            // Find each cell within the row
            $(e).find("td, th").each((i,e)=> {
                // If there's not yet an array for this row, make an empty one
                if(rows[rowNum]===undefined){rows[rowNum] = []}
                // Add the text of each cell to the row's array
                rows[rowNum].push($(e).text());
                // If the table is being transposed, add one to the row number for each cell
                if(transpose){rowNum++;}
            });
            // If table is not being transposed, add one to the row number for each row
            if(!transpose){rowNum++;}
        });

        // For each row, join together all of the elements of the array with a \t to separate them (tab)
        for(var i = 0; i < rows.length; i++){
            rows[i] = rows[i].join("\t");
        }

        // Add each row to the temporary text area using \n (new line) to separate them
        $temp.append(rows.join("\n"));
        // Append the textarea to the div for copy, then select it
        $temp.appendTo($divForCopy).select();
        // Copy the "selected" text
        document.execCommand("copy");
        $temp.remove(); //remove temp
        // Doesn't work within LA b/c of permissions, but would be easier way to copy w/o appending to page
        // navigator.clipboard.writeText(rows.join("\n")); 
    },

    /**
     * This either shows or hides (toggles) the table provided as a parameter. 
     * It checks if the data is valid, but this doesn't stop it from running.
     * It resizes the widget in the process.
     * 
     * @param {*} $table - jQuery object for table
    **/
     toggleTableFuncs: function ($table) {
        this.data_valid_form();
        $table.toggle();
        this.resize();
    },

    /**
     * Set of functions when toCSVButton clicked
     * 
     * Checked if data is valid, exports the table to a CSV
     * Updates the error message accordingly
     * 
     * @param {string} fileName - fileName for the CSV that will be produced
     * @param {string} tableID - tableID as a string for the table that will be copied
     * @param $errorMsg - error message div as jQuery object
     */
    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = this.data_valid_form($errorMsg); // update data_valid_form to print to specific error field

        if (data_valid) {
            this.exportTableToCSV(fileName, tableID);
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
     * @param $transpose - checkbox for whether or not to transpose the table head as jQuery object
     */
     copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose){
        var data_valid = this.data_valid_form($errorMsg); // update data_valid_form to print to specific error field
        var copyHead = false, transpose = false;

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        }

        if ($transpose.is(":checked")) {
            transpose = true;
        }

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            this.resize(); //resize
            this.copyTable($tableToCopy, copyHead, $divForCopy, transpose); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },
};