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

        this.myFunctions();

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        this.initScoringRows();
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
            mouseNums: my_widget_script.mouseNums
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
            mouseNums: [2, 3]
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
    myFunctions: function () {
        (function ( $ ) {
            $.fn.mySort = function( options ) {
                //https://stackoverflow.com/questions/53600375/jquery-sort-order-by-data-attribute
                var settings = $.extend({
                    // These are the defaults.
                    toSort: ".sortCard",
                    sortBy: "mouse"
                }, options );
                
                this
                    .find(settings.toSort)
                    .sort(function (a,b) {
                        if(settings.sortBy == "date"){
                            var aDate = luxon.DateTime.fromISO($(a).data(settings.sortBy));
                            var bDate = luxon.DateTime.fromISO($(b).data(settings.sortBy));
                            var diff = aDate.diff(bDate, "days").as("days");
                        } else{
                            var diff = $(a).data(settings.sortBy) - $(b).data(settings.sortBy);
                        }
                        // console.log(diff);
                        return diff;
                    })
                    .appendTo(this);

                return this;
            };

        }( jQuery ));
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
     */
    initDynamicContent: function (parsedJson) {
        console.log(parsedJson.mouseNums);
        if(parsedJson.mouseNums){
            for (var i = 0; i < parsedJson.mouseNums.length; i++){
                mouse = parsedJson.mouseNums[i];
                my_widget_script.mouseNums.push(mouse);
                my_widget_script.mice[mouse] = {};
                my_widget_script.makeMouseCard(mouse);
            }
            my_widget_script.mouseNums = parsedJson.mouseNums;
        } else {
            my_widget_script.mouseNums = [];
        }
    },

    initScoringRows: function (){
        $.each(my_widget_script.mouseNums, function () {
            var num = this;
            console.log(num);
            var id = $("#mouseID"+num).val();
            var startDate = $("#startDate"+num).val();
            var endDate = $("#endDate"+num).val();
            my_widget_script.mice[num] = {
                id: id,
                startDate: startDate,
                endDate: endDate
            }
        });

        my_widget_script.adjustScoringRows();
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
        input.remove();
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
            my_widget_script.resize();
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
        input.remove();
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
            my_widget_script.resize();
        }
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        
        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();


        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        });

        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
        });

        $(document).on('click', "a.sortLink", function() {
            var sortBy = $(this).data("sort");
            my_widget_script.sortFunc(sortBy);
            $(".watch").each(function () {
                my_widget_script.watchValue($(this));
            });
        });

        $(document).on('click', "a.toggleSpec", function() {
            if($(this).hasClass("hidden")){
                $(this).text("Show all");
                $(this).removeClass("hidden");
            } else {
                $(this).text("Show only scoring");
                $(this).addClass("hidden");
            }
            my_widget_script.toggleSpecs();
        });

        $("#addMouse").on("click", function () {
            if(my_widget_script.mouseNums.length > 0){
                var lastMouse = my_widget_script.mouseNums[my_widget_script.mouseNums.length - 1];
                var mouseNum = lastMouse + 1;
            } else {
                var mouseNum = 1;
            }

            var inArray = my_widget_script.checkInArray(mouseNum, my_widget_script.mouseNums);
            if(! inArray){
                my_widget_script.mouseNums.push(mouseNum);
                my_widget_script.mice[mouseNum] = {}
                my_widget_script.makeMouseCard(mouseNum);
                my_widget_script.makeTableCols();
            }
        });

        $(".watch").each(function () {
            my_widget_script.watchValue($(this));
        });

        // console.log(my_widget_script.mice);

        //Show/hide the table
        $(".toggleTable").on("click", function () { //when the showTable button is clicked. Run this function
            var tableID = $(this).data("table");
            var $table = $("#"+tableID);
            my_widget_script.toggleTableFuncs($table);
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('.toCSV').on("click", function () {
            var tableID = $(this).data("table");
            var dateToday = luxon.DateTime.now().toISODate();
            var fileName = "cycling_"+dateToday;
            var $errorMsg = $("#errorMsg");
            
            my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
        });

        //When the copy button is clicked, run the copyTable function
        $(".copyData").on("click", function () {
            var tableID = $(this).data("table");
            var tableSearch = my_widget_script.tableSearch(tableID);
            var $copyHead = $(".copyHead"+tableSearch);
            var $tableToCopy = $("#"+tableID);
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
        });

        my_widget_script.adjustScoringRows();
        my_widget_script.sortFunc("date");
        
        my_widget_script.resize();
    },

    mouseNums: [],
    mice: {},
    dates: {},

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
    toggleSpecs: function () {
        if($(".toggleSpec").hasClass("hidden")){
            $(".showCol[data-col='total']").hide();
            $(".showCol[data-col='nuc']").hide();
            $(".showCol[data-col='corn']").hide();
            $(".showCol[data-col='leuko']").hide();
        } else {
            $(".showCol[data-col='total']").show();
            $(".showCol[data-col='nuc']").show();
            $(".showCol[data-col='corn']").show();
            $(".showCol[data-col='leuko']").show();
        }
    },

    sortFunc: function (sortBy) {
        $(".cardContainer").mySort({sortBy: sortBy});
        
        var sortVals = [];
        $(".sortCard").each(function () {
            var sortVal = $(this).data(sortBy);
            if(! my_widget_script.checkInArray(sortVal, sortVals)){
                sortVals.push(sortVal);
            }
        });
        // console.log(sortVals);
        
        $(".madeCards").html("");
        if(sortVals){
            for(var i = 0; i<sortVals.length; i++){
                var sortVal = sortVals[i];
                if(sortBy == "mouse"){
                    $header = $("<div></div>", {
                        "data-calc": "mouse",
                        "data-mouse": sortVal
                    }).append(
                        my_widget_script.capitalize(sortBy) + ": " + sortVal
                    )
                } else {
                    $header = my_widget_script.capitalize(sortBy) + ": " + sortVal
                }
                my_widget_script.makeCard($(".madeCards"), $header, "");
                
                var $cardBody = $(".madeCards").find(".card-body").last();
                my_widget_script.appendLabelRow($cardBody);
                var dataSearch = my_widget_script.dataSearch(sortBy, sortVal);
                $(".sortCard"+dataSearch).each(function () {
                    $(this).appendTo($cardBody);
                })
                $cardBody.mySort({sortBy: "day"})
                $cardBody.mySort({sortBy: "mouse"})
            }
        }

        // To hide non-relevant columns
        var colSearch = my_widget_script.colSearch(sortBy);
        $(".sortCol"+colSearch).hide();
        $(".sortCol").not(colSearch).show();

        my_widget_script.toggleSpecs();
        my_widget_script.resize();
    },
    
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

    colSearch: function (colVal) {
        var colSearch = my_widget_script.dataSearch("col", colVal);
        return colSearch
    },

    dateSearch: function (date) {
        var dateSearch = my_widget_script.dataSearch("date", date);
        return dateSearch
    },

    calcSearch: function (calc) {
        var calcSearch = my_widget_script.dataSearch("calc", calc);
        return calcSearch;
    },

    daySearch: function (day) {
        var daySearch = my_widget_script.dataSearch("day", day);
        return daySearch;
    },

    mouseSearch: function (mouse) {
        var mouseSearch = my_widget_script.dataSearch("mouse", mouse);
        return mouseSearch;
    },

    tableSearch: function (table){
        var tableSearch = my_widget_script.dataSearch("table", table);
        return tableSearch;
    },

    capitalize: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = my_widget_script.calcSearch(watch);
        var dayNum = $el.data("day");
        var mouseNum = $el.data("mouse");
        var val = $el.val();
        if(dayNum){
            calcSearch += my_widget_script.daySearch(dayNum);
        }
        if(mouseNum){
            calcSearch += my_widget_script.mouseSearch(mouseNum);
        }
        $(calcSearch).html(val);

        my_widget_script.resize();
    },
    
    makeScoringRow: function (mouseNum, dateString, day){
        var $cardContainer = $(".cardContainer");

        labelClasses = "col-12 font-weight-bold";
        dataCols = ["mouse", "date", "day", "total", "nuc", "corn", "leuko", "stage", "final"];
        extraClasses = ["sortCol", "sortCol", "sortCol", "showCol", "showCol", "showCol", "showCol", "showCol", "showCol"];
        sortClasses = "col-12 col-md sortCol";
        showClasses = "col-12 col-md showCol";
        inputCols = ["total", "nuc", "corn", "leuko", "stage"];

        $cardContainer.append(
            $("<div/>", {
                "class": "card sortCard",
                "data-mouse": mouseNum,
                "data-day": day,
                "data-date": dateString
            }).append(
                $("<div/>", {
                    "class": "row"
                }).append(
                    $("<div/>", {
                        "class": "col-6 d-md-none row labelRow"
                    })
                ).append(
                    $("<div/>", {
                        "class": "col-6 col-md-12 row mouseRow"
                    }).append(
                        $("<div/>", {
                            "class": sortClasses,
                            "data-col": "mouse",
                            "data-calc": "mouse",
                            "data-mouse": mouseNum
                        }).css("word-break", "break-all").append("Mouse " + mouseNum) // change to watch ID
                    ).append(
                        $("<div/>", {
                            "class": sortClasses,
                            "data-col": "date"
                        }).append(dateString)
                    ).append(
                        $("<div/>", {
                            "class": sortClasses,
                            "data-col": "day"
                        }).append(day)
                    )
                )
            )
        );
        
        for(var i=0; i<dataCols.length; i++){
            var col = dataCols[i];
            var extraClass = extraClasses[i]
            $cardContainer.find(".labelRow").last().append(
                $("<div/>",{
                    "class": labelClasses + " " + extraClass,
                    "data-col": col
                }).append(my_widget_script.capitalize(col))
            );
        }
        
        for(var i=0; i<inputCols.length; i++){
            var col = inputCols[i];
            $cardContainer.find(".mouseRow").last().append(
                $("<div/>", {
                    "class": showClasses,
                    "data-col": col
                }).append(
                    $("<input/>", {
                        "class": "fullWidth watch " + col,
                        name: col+mouseNum+"_"+day,
                        id: col+mouseNum+"_"+day,
                        "data-mouse": mouseNum,
                        "data-day": day,
                        "data-date": dateString,
                        "data-watch": col
                    })
                )
            )
        }

        $cardContainer.find(".mouseRow").last().append(
            $("<div/>", {
                "class": showClasses,
                "data-col": "final"
            }).append(
                $("<select/>", {
                    "class": "fullWidth final watch",
                    name: "final"+mouseNum+"_"+day,
                    id: "final"+mouseNum+"_"+day,
                    "data-mouse": mouseNum,
                    "data-day": day,
                    "data-date": dateString,
                    "data-watch": "final"
                }).append('<option value="">[Select]</option><option value="1">Estrus</option><option value="2">Diestrus</option><option value="3">Proestrus</option>')
            )
        );

        $(".watch").on("input", function () {
            my_widget_script.watchValue($(this));
        });

        my_widget_script.sortFunc("date");
    },

    appendLabelRow: function ($div){
        labelClasses = "col font-weight-bold";
        dataCols = ["mouse", "date", "day", "total", "nuc", "corn", "leuko", "stage", "final"];
        extraClasses = ["sortCol", "sortCol", "sortCol", "showCol", "showCol", "showCol", "showCol", "showCol", "showCol"];
        
        $div.append(
            $("<div/>", {
                "class": "card d-none d-md-flex topLabelRow"
            }).append(
                $("<div/>", {
                    "class": "row"
                }).append(
                    $("<div/>", {
                        "class": "col-12 row labelRow"
                    })
                )
            )
        );
        
        for(var i=0; i<dataCols.length; i++){
            var col = dataCols[i];
            var extraClass = extraClasses[i]
            $div.find(".labelRow").last().append(
                $("<div></div>",{
                    "class": labelClasses + " " + extraClass,
                    "data-col": col
                }).append(my_widget_script.capitalize(col))
            );
        }
    },

    checkInArray: function (searchVal, array){
        var inArray = $.inArray(searchVal, array) !== -1;
        return inArray
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
                    "class": "card-body collapse"
                }).append(
                    cardBodyContent
                )
            )
        )
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

    makeMouseCard: function (mouseNum) {
        var $div = $(".mouseInfo");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 mouseCard",
                "data-mouse": mouseNum
            }).append(
                $("<div/>", {
                    "class": "card"
                }).append(
                    $("<div/>", {
                        "class": "card-header",
                        "data-calc": "mouse",
                        "data-mouse": mouseNum
                    }).on("click", function () {
                        // console.log($(this));
                        my_widget_script.toggleCard($(this));
                    }).append("Mouse " + mouseNum)
                ).append(
                    $("<div/>", {
                        "class": "card-body"
                    }).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append("<h4>Mouse ID:</h4>")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "text", 
                                    "data-mouse": mouseNum,
                                    id: "mouseID"+mouseNum,
                                    name: "mouseid"+mouseNum,
                                    "class": "mouseID fullWidth watch",
                                    "data-watch": "mouse"
                                }).on("change", function () {
                                    my_widget_script.mice[mouseNum]["id"] = $(this).val();
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
                                    value: "Delete Mouse",
                                    "data-mouse": mouseNum,
                                    id: "deleteMouse"+mouseNum,
                                    name: "deletemouse"+mouseNum,
                                    "class": "deleteMouse fullWidth",
                                }).on("click", function () {
                                    my_widget_script.deleteMouseFuncs($(this).data("mouse"));
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append("Start Date:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "date", 
                                    "data-mouse": mouseNum,
                                    id: "startDate"+mouseNum,
                                    name: "startdate"+mouseNum,
                                    "class": "startDate fullWidth watch",
                                    "data-watch": "startDate"
                                }).each(function () {
                                    my_widget_script.checkDateFormat($(this));
                                }).on("change", function () {
                                    my_widget_script.checkDateFormat($(this));
                                    var currentDate = my_widget_script.mice[mouseNum]["startDate"];
                                    var thisDate = $(this).val();
                                    var currentAsDate = luxon.DateTime.fromISO(currentDate).startOf("day");
                                    var thisAsDate = luxon.DateTime.fromISO(thisDate).startOf("day");
                                    var proceed = true;
                                    if(currentDate && currentAsDate != thisAsDate){
                                        proceed = confirm("This will reset all sampling days for this mouse. Are you sure you want to proceed?");
                                        if(proceed){
                                            proceed = confirm("All data you've entered for this mouse will be erased. Are you sure you want to proceed?");
                                            if(proceed){
                                                my_widget_script.mice[mouseNum]["dates"] = [];
                                                for(var date in my_widget_script.dates){
                                                    var inDates = my_widget_script.checkInArray(mouseNum, my_widget_script.dates[date]);
                                                    if(inDates){
                                                        var index = my_widget_script.dates[date].indexOf(mouseNum);
                                                        if(index > -1){
                                                            my_widget_script.dates[date].splice(index, 1);
                                                        }
                                                        var mouseSearch = my_widget_script.mouseSearch(mouseNum);
                                                        var dateSearch = my_widget_script.dateSearch(date);
                                                        $(mouseSearch+dateSearch).remove();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if(proceed){
                                        my_widget_script.mice[mouseNum]["startDate"]=$(this).val();
                                        my_widget_script.adjustScoringRows();
                                    } else if(currentDate) {
                                        $(this).val(currentDate);
                                    }
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append("End Date:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "date", 
                                    "data-mouse": mouseNum,
                                    id: "endDate"+mouseNum,
                                    name: "enddate"+mouseNum,
                                    "class": "endDate fullWidth watch",
                                    "data-watch": "endDate"
                                }).each(function () {
                                    my_widget_script.checkDateFormat($(this));
                                }).on("change", function () {
                                    my_widget_script.checkDateFormat($(this));
                                    var currentDate = my_widget_script.mice[$(this).data("mouse")]["endDate"];
                                    var thisDate = $(this).val();
                                    var currentAsDate = luxon.DateTime.fromISO(currentDate).startOf("day");
                                    var thisAsDate = luxon.DateTime.fromISO(thisDate).startOf("day");
                                    var proceed = true;
                                    if(currentDate && currentAsDate > thisAsDate){
                                        proceed = confirm("This will remove sampling days. Are you sure you wish to proceed?");
                                    }
                                    if(proceed){
                                        my_widget_script.mice[$(this).data("mouse")]["endDate"]=$(this).val();
                                        my_widget_script.adjustScoringRows();
                                    } else if(currentDate) {
                                        $(this).val(currentDate);
                                    }
                                })
                            )
                        )
                    )
                )
            )
        )
        
        var $mouseTable = $("#mouseTable");

        $mouseTable.find("tbody").append(
            $("<tr/>", {
                "data-mouse": mouseNum
            }).append(
                $("<td/>", {
                    "data-calc": "mouse",
                    "data-mouse": mouseNum
                }).append("Mouse "+mouseNum)
            )
        );

        $(".watch").on("input", function () {
            my_widget_script.watchValue($(this));
        });

        my_widget_script.resize();
    },

    deleteMouseFuncs: function (mouseNum) {
        var proceed = confirm("Are you sure that you wish to delete this mouse?");
        if(proceed){
            // Remove it from the mouseNums
            var index = my_widget_script.mouseNums.indexOf(mouseNum);
            if(index > -1){
                my_widget_script.mouseNums.splice(index, 1);
            }

            //Remove it from mice
            delete my_widget_script.mice[mouseNum];

            // console.log(my_widget_script.mice);
    
            // Remove mouse from dates list
            if(my_widget_script.dates){
                var numDates = my_widget_script.dates.length;
                for(var i = 0; i < numDates; i++){
                    var index = my_widget_script.dates[i].indexOf(mouseNum);
                    if(index > -1){
                        my_widget_script.dates[i].splice(index, 1);
                    }
                }
            }
    
            var mouseSearch = my_widget_script.mouseSearch(mouseNum);
            $(mouseSearch).remove();
        }

        my_widget_script.resize();
    },

    adjustScoringRows: function () {
        // console.log(my_widget_script.mouseNums.length);
        for(var i = 0; i < my_widget_script.mouseNums.length; i++){
            var mouse = my_widget_script.mouseNums[i];
            
            var mouseInfo = my_widget_script.mice[mouse];
            
            var id = mouseInfo.id;
            var startDate = mouseInfo.startDate;
            var endDate = mouseInfo.endDate;
            
            
            var numDays = 0;
            if(startDate && endDate){
                var startDateAsDate = luxon.DateTime.fromISO(startDate).startOf("day");
                var endDateAsDate = luxon.DateTime.fromISO(endDate).startOf("day");
            
                numDays = endDateAsDate.diff(startDateAsDate, "days").as("days") + 1;
            }            
            // console.log(id, startDateAsDate, endDateAsDate, currentNumDays);

            my_widget_script.mice[mouse]["numDays"] = numDays;

            // Reset dates array
            my_widget_script.mice[mouse]["dates"] = [];

            if(numDays > 0){
                var date = startDateAsDate;
                for(var j = 0; j < numDays; j++){
                    var day = j + 1;
                    var dateOb = my_widget_script.dates[date.toISODate()];
                    if(! dateOb){
                        my_widget_script.dates[date.toISODate()] = [];
                    }
                    var inDateOb = my_widget_script.checkInArray(mouse, my_widget_script.dates[date.toISODate()]);
                    if(! inDateOb){
                        my_widget_script.dates[date.toISODate()].push(mouse);
                        my_widget_script.makeScoringRow(mouse, date.toISODate(), day);
                    }
                    
                    var inMouseDateOb = my_widget_script.checkInArray(date.toISODate(), my_widget_script.mice[mouse]["dates"]);
                    if(! inMouseDateOb){
                        my_widget_script.mice[mouse]["dates"].push(date.toISODate());
                    }
                    date = date.plus({days: 1});
                }
            }

            // Remove dates that aren't in mouse dates array
            for(var date in my_widget_script.dates){
                var inMouseDate = my_widget_script.checkInArray(date, my_widget_script.mice[mouse]["dates"]);
                if(! inMouseDate){
                    var inDates = my_widget_script.checkInArray(mouse, my_widget_script.dates[date]);
                    if(inDates){
                        var index = my_widget_script.dates[date].indexOf(mouse);
                        if(index > -1){
                            my_widget_script.dates[date].splice(index, 1);
                        }
                        var mouseSearch = my_widget_script.mouseSearch(mouse);
                        var dateSearch = my_widget_script.dateSearch(date);
                        $(mouseSearch+dateSearch).remove();
                    }
                }
            }
        }
        my_widget_script.makeTableCols();

        // console.log(my_widget_script.dates, my_widget_script.mice);
    },

    makeTableCols: function () {
        // console.log(my_widget_script.mice, my_widget_script.dates);
        var maxNumDays = 0;
        $("#mouseTable").find(".added").remove();
        var $table = $("#mouseTable");

        for( var mouse in my_widget_script.mice ){
            var numDays = my_widget_script.mice[mouse]["numDays"];
            if(numDays>maxNumDays){maxNumDays = numDays}
        }

        // console.log(maxNumDays);

        for(var i = 0; i < maxNumDays; i++){
            var day = i+1;
            $table.find("thead tr").append(
                $("<th/>", {
                    "class": "added",
                    "data-day": day
                }).append("Day " + day)
            )
            for( var mouse in my_widget_script.mice){
                var mouseSearch = my_widget_script.mouseSearch(mouse);
                $table.find("tr"+mouseSearch).append(
                    $("<td/>", {
                        "class": "added",
                        "data-calc": "final",
                        "data-day": day,
                        "data-mouse": mouse
                    })
                );
            }
        }

        $(".watch").each(function () {
            my_widget_script.watchValue($(this));
        });

        my_widget_script.resize();
    },

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

        $temp.appendTo($divForCopy).select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    toggleTableFuncs: function ($table) {
        my_widget_script.resize();
        my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
        $table.toggle();
        my_widget_script.parent_class.resize_container();
    },

    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) {
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

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
    }

};