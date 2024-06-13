my_widget_script =
{
    init: function (mode, json_data) {
        // Google charts
        this.includeGoogle(
            "https://www.gstatic.com/charts/loader.js"
            , ()=>{
                $(document).ready(
                    () =>{
                        // jQuery for bootstrap
                        this.include(
                            "https://code.jquery.com/jquery-3.5.1.min.js",
                            "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=",
                            "anonymous",
                            ()=>{
                                $(document).ready(
                                    ()=>{
                                        // console.log("After load", $.fn.jquery);
                                        
                                        // Load bootstrap
                                        this.include(
                                            "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
                                            "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl",
                                            "anonymous",
                                            ()=>{
                                                $(document).ready(
                                                    ()=>{
                                                        // Load Luxon
                                                        this.include(
                                                            "https://cdn.jsdelivr.net/npm/luxon@1.26.0/build/global/luxon.min.js",
                                                            "sha256-4sbTzmCCW9LGrIh5OsN8V5Pfdad1F1MwhLAOyXKnsE0=",
                                                            "anonymous",
                                                            ()=>{
                                                                $(document).ready(
                                                                    ()=>{
                                                                        // Load bootbox - need the bootstrap JS to be here first, with appropriate jQuery
                                                                        this.include(
                                                                            "https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/5.5.2/bootbox.min.js",
                                                                            "sha512-RdSPYh1WA6BF0RhpisYJVYkOyTzK4HwofJ3Q7ivt/jkpW6Vc8AurL1R+4AUcvn9IwEKAPm/fk7qFZW3OuiUDeg==",
                                                                            "anonymous",
                                                                            // referrerpolicy="no-referrer"
                                                                            ()=>{
                                                                                $(document).ready(
                                                                                    ()=>{
                                                                                        $jq351 = jQuery.noConflict(true);
                                                                                        // console.log("After no conflict", $.fn.jquery);
                                                                                        // console.log("bootstrap jquery", $jq351.fn.jquery);
                                                                                        this.myInit(mode, json_data);
                                                                                    }
                                                                                )
                                                                            }
                                                                        );
                                                                    }
                                                                )
                                                            }
                                                        );
                                                    }
                                                )
                                            }
                                        )
                                    }
                                )
                            }
                        )
                    }
                )
            }
        )
    },

    includeGoogle: function(src, onload) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.onload = script.onreadystatechange = function() {
            if (script.readyState) {
                if (script.readyState === 'complete' || script.readyState === 'loaded') {
                    script.onreadystatechange = null;                                                  
                    onload();
                }
            } 
            else {
                onload();          
            }
        };
        head.appendChild(script);
    },

    //https://stackoverflow.com/questions/8139794/load-jquery-in-another-js-file
    include: function(src, integrity, crossorigin, onload) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.setAttribute("integrity", integrity);
        script.setAttribute("crossorigin", crossorigin);
        script.src = src;
        script.type = 'text/javascript';
        script.onload = script.onreadystatechange = function() {
            if (script.readyState) {
                if (script.readyState === 'complete' || script.readyState === 'loaded') {
                    script.onreadystatechange = null;                                                  
                    onload();
                }
            } 
            else {
                onload();          
            }
        };
        head.appendChild(script);
    },

    myInit: function (mode, json_data) {
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
        // debugger;
        
        // console.time("init");

        this.myFunctions();

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to console
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event
        window.onresize = ()=> this.makeCharts();

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

        // Print to console log if any elements don't have a required name attribute
        this.checkForNames();

        this.makeCharts();

        // console.timeEnd("init");
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
            mouseNums: my_widget_script.mouseNums,
            mice: my_widget_script.mice
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
            mouseNums: [1, 2, 3, 4, 5, 6, 7],
            mice: {
                1: {id: "CRH-01", cycleNum: "1", startDate: "2021-04-01", endDate: "2021-04-17"},
                2: {id: "CRH-02", cycleNum: "2", startDate: "2021-04-01", endDate: "2021-04-17"},
                3: {id: "CRH-03", cycleNum: "3", startDate: "2021-04-01", endDate: "2021-04-17"},
                4: {id: "CRH-04", cycleNum: "4", startDate: "2021-04-01", endDate: "2021-04-17"},
                5: {id: "CRH-05", cycleNum: "5", startDate: "2021-04-01", endDate: "2021-04-17"},
                6: {id: "CRH-06", cycleNum: "6", startDate: "2021-04-01", endDate: "2021-04-17"},
                7: {id: "CRH-07", cycleNum: "7", startDate: "2021-04-01", endDate: "2021-04-17"},
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
            return bootbox.alert (fail_log); //return the fail log as an alert
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
        // console.log(parsedJson);
        if(parsedJson.mice){
            my_widget_script.mice = parsedJson.mice;
        } else {
            my_widget_script.mice = {}
        }

        // console.log(my_widget_script.mice);

        // console.time("initDynamic");
        if(parsedJson.mouseNums){
            for (var i = 0; i < parsedJson.mouseNums.length; i++){
                mouse = parsedJson.mouseNums[i];
                my_widget_script.mouseNums.push(mouse);
                my_widget_script.makeMouseCard(mouse);
                my_widget_script.adjustScoringRows(mouse, false);
            }
            for(date in this.dates){
                today = luxon.DateTime.now().toISODate();
                var isToday = false;
                if(date == today){isToday = true}
                header = "Date: " + date;                    
                var cardBody = document.createDocumentFragment();
                cardBody.appendChild(my_widget_script.createLabelRow());
                
                var dateSearch = my_widget_script.dateSearch(date);
                var x = document.querySelectorAll(".sortCard"+dateSearch);
                for (var j = 0; j < x.length; j++) {
                    cardBody.appendChild(x[j]);
                }
                
                my_widget_script.makeCard($(".madeCards"), header, cardBody);

                var $cardBody = $(".madeCards").find(".card-body").last();
                for(mouse in this.dates[date]){
                    var day = this.dates[date][mouse];
                    this.makeScoringRow(mouse, date, day, $cardBody);
                }
                if(isToday){
                    $(".madeCards").find(".card-header").last().addClass("cardToday");
                }
            }
        } else {
            my_widget_script.mouseNums = [];
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
            $("input[type='date']").removeClass(".hasDatePicker");
            $(".hideView").hide();
            $("#copyDiv").insertBefore("#addMouseDiv");
            $(".tableOuterDiv").insertAfter("#copyDiv");
            $(".editOnView").prop("readonly", "").prop("disabled", "");
            $(".editOnView").find("option").prop("disabled", "");
        } else {
            $("input[type='date']").each((i, e)=> {
                this.checkDateFormat($(e));
            });
            
            $("input[type='time']").each((i, e)=> {
                this.checkTimeFormat($(e));
            });

            this.toggleCard($(".cardToday"));
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        $(".toggleSpec").on("click", (e)=>{
            if($(e.currentTarget).hasClass("hidden")){
                $(e.currentTarget).val("Show only scoring");
                $(e.currentTarget).removeClass("hidden");
            } else {
                $(e.currentTarget).val("Show all");
                $(e.currentTarget).addClass("hidden");
            }
            this.toggleSpecs();
        });

        $(".sortButton").on("click", (e)=>{
            var sortBy = $(e.currentTarget).data("sort");
            this.sortFunc(sortBy);
            $(".watch").each((i,e)=> {
                this.watchValue($(e));
            });
        });

        $("#addMouse").on("click", (e)=> {
            if(this.mouseNums.length > 0){
                var lastMouse = this.mouseNums[this.mouseNums.length - 1];
                var mouseNum = lastMouse + 1;
            } else {
                var mouseNum = 1;
            }

            var inArray = this.checkInArray(mouseNum, this.mouseNums);
            if(! inArray){
                this.mouseNums.push(mouseNum);
                this.mice[mouseNum] = {}
                this.makeMouseCard(mouseNum);
                this.makeTableCols();
                this.sortFunc("date");
            }
        });

        $("#makeCharts").on("click", (e)=> {this.makeCharts()});
    },

    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForFormLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each((i, e)=> { //find element with class "needForFormLab"
            //alert($(e).val());
            $(e).html("<span class='hideView' style='color:blue'>#</span>" + $(e).html()); //add # before
        });

        $('.requiredLab').each((i, e)=> { //find element with class "requiredLab"
            //alert($(e).val());
            $(e).html("<span class='hideView' style='color:red'>*</span>" + $(e).html()); //add # before
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
        input.remove();
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
            this.resize();
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
        input.remove();
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
            this.resize();
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
        
        this.isDateSupported();
        this.isTimeSupported();


        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", (e)=> {
            this.checkDateFormat($(e.currentTarget));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", (e)=> {
            this.checkTimeFormat($(e.target));
        });

        $('textarea.autoAdjust').each((i,e)=> { // i is the index for each match, textArea is the object
            e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', (e)=> {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
            this.resize();
        });

        $(".toggleTable").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var $table = $("#"+tableID);
            var $errorMsg = $("#errorMsg");
            this.toggleTableFuncs($table, $errorMsg);
        });

        $('.toCSV').on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var dateToday = luxon.DateTime.now().toISODate(); // Luxon has to be added in HTML
            var fileName = "cycling_"+dateToday;
            var $errorMsg = $("#errorMsg");
            
            this.toCSVFuncs(fileName, tableID, $errorMsg);
        });

       $(".copyData").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var copyType = $(e.currentTarget).data("copy");
            // Get the data-table text string to add to the query to find the table
            var tableSearch = this.tableSearch(tableID);
            // Find the element that tells whether or not to copy the table
            var $tableToCopy = $("#"+tableID);
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");

            var startDay, endDay, copyHead, transpose;

            var numAddedCols = $tableToCopy.find("thead").find(".added").length
            if(copyType === "simple"){
                copyHead = false;
                transpose = false;
                startDay = 1;
                endDay = numAddedCols;
            } else {
                startDay = $("#startDayCopy").val();
                endDay = $("#endDayCopy").val();
                if (!startDay || startDay < 1) {
                    startDay = 1
                }
                    
                if (!endDay || endDay > numAddedCols) {
                    endDay = numAddedCols
                }

                copyHead = $(e.currentTarget).data("head");
                transpose = $(e.currentTarget).data("transpose");
            }
                                
            this.copyDataFuncs(copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, transpose, startDay, endDay)
        });

        // Generic update when any part of the form has user input
        $("#the_form").on("input", (e)=>{
            // Add a watch attribute to elements if need to be more specific, such as
            // to specify a day or a mouse to update
            if($(e.target).data("watch")){
                this.watchValue($(e.target));
            } else{
                // the target will be whatever is currently receiving input
                // This will update any field with a "data-calc" attribute that
                // matches the id of the target element
                this.updateCalcFromEl(e.target);
            }
        });
        
        // Run this first incase calcValues needs to overrule
        $("input, select, textarea").each((i,e)=>{
            if($(e).attr("type")!= "button"){
                if($(e).data("watch")){
                    this.watchValue($(e));
                } else {
                    // This will update any field with a "data-calc" attribute that
                    // matches the id of the target element
                    this.updateCalcFromEl(e);   
                }
            }
        });

        this.makeTableCols();

        $(".mouseHeader").each((i,e)=>{
            this.toggleCard($(e));
        });

        this.resize();
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
        this.parent_class.resize_container();
    },

    checkForNames: function() {
        $("input, select, textarea").each((i,e)=>{
            var thisName = $(e).attr("name");
            if(!thisName){
                console.log("There is no name attribute for: ", e.id);
            } else {
                var hasUpper = /[A-Z]/.test(thisName);
                if(hasUpper){
                    console.log("The name contains an uppercase letter for: ", e.id);
                }
            }
        })
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    /**
     * getDynamicContent, such as the number of rows added to the page
     * 
     * If you add something here, you need to read it within to_json to 
     * provide it to the output of to_json to be read when initiating form
     * 
     * If you're just reading data that's stored as a property of 
     * my_widget_script, you can do that directly in to_json
     */ 
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
        console.log("running sort func");
        // console.time("sortFunc");
        $(".cardContainer").mySort({sortBy: sortBy});
        var sortVals = [];
        $(".sortCard").each((i,e)=> {
            var sortVal = $(e).data(sortBy);
            if(! this.checkInArray(sortVal, sortVals)){
                sortVals.push(sortVal);
            }
        });
        // console.log(sortVals);
        $(".madeCards").html("");
        if(sortVals){
            for(var i = 0; i<sortVals.length; i++){
                var sortVal = sortVals[i];
                if(sortBy == "mouse"){
                    header = "<div data-calc='mouse' data-mouse='"+sortVal+"'>"+this.capitalize(sortBy) + ": " + sortVal+"</div>";
                } else {
                    header = this.capitalize(sortBy) + ": " + sortVal;
                }
                
                var cardBody = document.createDocumentFragment();
                cardBody.appendChild(this.createLabelRow());
                
                var dataSearch = this.dataSearch(sortBy, sortVal);
                var x = document.querySelectorAll(".sortCard"+dataSearch);
                for (var j = 0; j < x.length; j++) {
                    cardBody.appendChild(x[j]);
                }
                
                this.makeCard($(".madeCards"), header, cardBody);

                var $cardBody = $(".madeCards").find(".card-body").last();
                $cardBody.mySort({sortBy: "day"});
                $cardBody.mySort({sortBy: "mouse"});
            }
        }

        // To hide non-relevant columns
        var colSearch = this.colSearch(sortBy);
        $(".sortCol"+colSearch).hide();
        $(".sortCol").not(colSearch).show();

        this.toggleSpecs();
        this.resize();
        // console.timeEnd("sortFunc");
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

    //#region dialog boxes
    // Need this because there is positioning for some elements within the form, and it gives the offset relative to that
    // parent element with positioning, rather than to the top of the form
    getOffsetTop: function(element){
        var offsetTop = 0;
        var lastElement = 0;
        while(element && !lastElement){
            // console.log("the element", element);
            var formChild = $(element).children("#the_form");
            if(formChild.length>0){
                // console.log("found the child");
                lastElement = 1;
            }
            offsetTop += element.offsetTop;
            element = element.offsetParent;
            // console.log("offsetTop", offsetTop)
        }
        return offsetTop
    },

    /**
     * Run the supplied function if user presses OK
     * 
     * @param text The message to be displayed to the user. 
     * @param functionToCall Function to run if user pressed OK
     * @param elForHeight Element to based the height of the dialog box on
     * 
     * If no text is provided, "Are you sure?" is used
     * Can supply a function with no parameters and no () after the name,
     * or an anonymous function using function(){} or ()=>{}
     * 
     * Nothing happens if cancel or "X" is pressed
     * 
     * If elForHeight is left blank, height is auto
     * 
     * Example:
     * this.runIfConfirmed(
            "Do you want to run the function?", 
            ()=>{
                console.log("pretend delete function");
            }
        );
    */
    runIfConfirmed: function(text, functionToCall, elForHeight = null){
        var thisMessage = "Are you sure?";
        if(text){
            thisMessage = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.confirm ({
            message: thisMessage,
            callback: (proceed)=>{
                if(proceed){
                    functionToCall()
                }
            }
        });
        $(".modal-dialog").css("top", top);
    },

    /**
     * Confirm with user
     * 
     * @param text The message to display to user
     * @param functionToCall Function to run, with the result (true/false) as a parameter
     * @param elForHeight Element to based the height of the dialog box on
     * 
     * If no text is provided, "Do you wish to proceed?" is the default
     * Use an anonymous function, function(result){} or (result)=>{}. Then the function can use the result to decide what to do
     * 
     * If elForHeight is left blank, height is auto
     * 
     * Example:
     * this.dialogConfirmx(
            "Make a choice:", 
            (result)=>{ // arrow function, "this" still in context of button
                if(result){
                    console.log("You chose OK");
                } else {
                    console.log("You canceled or closed the dialog");
                }
            }
        );
        */
    dialogConfirmx: function(text, functionToCall, elForHeight = null){
        var thisMessage = "Do you want to proceed?";
        if(text){
            thisMessage = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.confirm ({
            message: thisMessage,
            callback: (result)=>{
                functionToCall(result);
            }
        });
        $(".modal-dialog").css("top", top);
    },

    /**
     * Get user input for a function
     * 
     * @param prompt Text to provide to the user
     * @param functionToCall Function to run, with the user input as a parameter
     * @param elForHeight Element to based the height of the dialog box on
     * 
     * If no text is provided, "Enter value:" is used as default
     * Use an anonymous function, function(result){} or (result)=>{}. Then the function can use the result to decide what to do
     * 
     * If elForHeight is left blank, height is auto
     *  
     * Example:
     * this.runBasedOnInput(
            "Enter a number from 0-10", (result)=>{
                if(result <= 10 && result >= 0){
                    console.log("You entered: " + result);
                } else {
                    console.log("You did not enter an appropriate value");
                }
            }
        );
        */ 
    runBasedOnInput: function(prompt, functionToCall, elForHeight = null){
        var thisTitle = "Enter value:"
        if(prompt){
            thisTitle = prompt;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.prompt({
            title: thisTitle,
            callback: (result)=>{
                functionToCall(result);
            }
        });
        $(".modal-dialog").css("top", top);
    },
    //#endregion dialog boxes

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
    },

    /**
     * Build a string for search for a HTML element that has a particular data value
     * ex: mouseSearch = dataSearch("mouse", 1) -> mouseSearch = "[data-mouse=1]"
     * $(".mouseID" + mouseSearch) would find an element with class mouseID and data-mouse = 1
     * 
     * @param {*} dataName String for the name of the data attribute within the HTML form 
     * @param {*} dataValue Value you want to match
     * @returns A text string that can be added to a jQuery search for an element that matches the data value
    **/
    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    /**
     * Builds a string "[data-table=table]". See dataSearch explanation
     * @param {*} table string for data-table value that you want to match
     * @returns 
    **/
    tableSearch: function (table){
        var tableSearch = this.dataSearch("table", table);
        return tableSearch;
    },

    calcSearch: function (calc) {
        var calcSearch = this.dataSearch("calc", calc);
        return calcSearch;
    },

    daySearch: function (day) {
        var daySearch = this.dataSearch("day", day);
        return daySearch;
    },

    colSearch: function (colVal) {
        var colSearch = this.dataSearch("col", colVal);
        return colSearch
    },

    dateSearch: function (date) {
        var dateSearch = this.dataSearch("date", date);
        return dateSearch
    },

    mouseSearch: function (mouse) {
        var mouseSearch = this.dataSearch("mouse", mouse);
        return mouseSearch;
    },

    capitalize: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    updateCalcFromEl: function (el) {
        // Get the element id
        var calc = el.id;
        // Get the element value
        var val = el.value;
        // Get the data-calc search string to match id
        var calcSearch = this.calcSearch(calc);

        // Update any element that matches the calc search with the value
        $(calcSearch).html(val);
        this.resize();
    },

    updateCalcFromVal: function(calc, val){
        var calcSearch = this.calcSearch(calc);
        $(calcSearch).text(val);
        this.resize();
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = this.calcSearch(watch);
        var dayNum = $el.data("day");
        var mouseNum = $el.data("mouse");
        var val = $el.val();
        if(dayNum){
            calcSearch += this.daySearch(dayNum);
        }
        if(mouseNum){
            calcSearch += this.mouseSearch(mouseNum);
        }
        if(watch == "mouse"){
            if(!val){
                val = "Mouse " + mouseNum;
            }
        }
        $(calcSearch).html(val);

        this.resize();
    },

    //#region copy tables
    /**
     * This either shows or hides (toggles) the table provided as a parameter. 
     * It checks if the data is valid, but this doesn't stop it from running.
     * It resizes the widget in the process.
     * 
     * @param {*} $table - jQuery object for table
    **/
    toggleTableFuncs: function ($table, $errorMsg) {
        this.data_valid_form($errorMsg);
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
    **/
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
        var tableArray = this.getTableArray($("#"+ table), copyHead = true, transpose = false);
        var tableString = this.convertRowArrayToString(tableArray, ",", "\n");

        // Download CSV file
        this.downloadCSV(tableString, filename);
    },

    /**
     * The steps that should be taken when the copy data button is pressed
     * Checks if the $copyHead is checked, and then
     * checks if the data is valid. If it is, it shows the table, resizes, and then
     * copies the table (via a temporary textarea that is then removed). 
     * 
     * @param copyHead - true/false whether or not to copy the table head
     * @param $tableToCopy - table to copy as jQuery object
     * @param $tableDiv - div containing table to copy
     * @param $errorMsg - error message div as jQuery object
     * @param $divForCopy - div where the output should copy to
     * @param transpose - true/false whether or not to transpose the table
     */
     copyDataFuncs: function (copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, transpose, start, end){
        var data_valid = this.data_valid_form($errorMsg); // update data_valid_form to print to specific error field
        
        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            this.resize(); //resize
            this.copyTable($tableToCopy, copyHead, $divForCopy, $errorMsg, transpose, start, end); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
            this.resize();
        }
    },

    /**
     * This function creates a temporary textarea and then appends the contents of the
     * specified table body to this textarea, separating each cell with a tab (\t).
     * Because the script editor in LA is within a <textarea> the script cannot contain
     * the verbatim string "textarea" so this must be separated as "text" + "area"
     * to avoid errors.
     * 
     * If copying a table that has form inputs, you
     * 
     * If copying a table that could have multiple table rows (<tr>), the use the 
     * \n new line separator
     * 
     * @param {*} $table - jQuery object for the table that will be copied
     * @param {*} copyHead - true/false for whether or not the table head should be copied
     * @param {*} $divForCopy - where the temp textarea should be added
     * @param {*} $errorMsg - where to update the user
     * @param {*} transpose - true if table should be transposed
     */
     copyTable: function ($table, copyHead, $divForCopy, $errorMsg, transpose, start, end) {
        var tableArray = this.getTableArray($table, copyHead, transpose, start, end);
        var tableString = this.convertRowArrayToString(tableArray, "\t", "\n");
        this.copyStringToClipboard(tableString, $divForCopy, $errorMsg);
    },

    /**
     * Get the items from an HTML table into an array
     * 
     * If the table has form inputs, then you would need to adjust the $(e).text() to reflect .val() instead
     * 
     * @param {*} $table The table element that is to be read
     * @param {*} copyHead Whether or not to include the head of the table
     * @param {*} transpose Whether or not to tanspose the table
     * @returns the table as an array, with the each row being and element, and each row as an array where each cell is an element
     */
    getTableArray: function ($table, copyHead, transpose, start, end) {
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
                    var day = $(e).data("day");
                    if ($(e).is(".mouse, .cycleNum, .startDate") || (day >= start && day <= end)) {
                        // If there's not yet an array for this row, make an empty one
                        if(rows[rowNum]===undefined){rows[rowNum] = []}
                        // Add the text of each cell to the row's array
                        rows[rowNum].push($(e).text());
                        // If table is being transposed, add one to the row number for each cell
                        if(transpose){rowNum++;}
                    }
                });
                // If table is not being transposed, add one to the row number for each row
                if(!transpose){rowNum++;}
            });
        }

        // Find each row in the table body
        $table.find("tbody").children("tr").each((i,e)=> {
            // If transposing, start the row number at 0 for each new row
            if(transpose){rowNum = 0;}
            // Find each cell within the row
            $(e).find("td, th").each((i,e)=> {
                var day = $(e).data("day");
                if ($(e).is(".mouse, .cycleNum, .startDate") || (day >= start && day <= end)) {
                    // If there's not yet an array for this row, make an empty one
                    if(rows[rowNum]===undefined){rows[rowNum] = []}
                    // Add the text of each cell to the row's array
                    rows[rowNum].push($(e).text());
                    // If the table is being transposed, add one to the row number for each cell
                    if(transpose){rowNum++;}
                }
            });
            // If table is not being transposed, add one to the row number for each row
            if(!transpose){rowNum++;}
        });
        return(rows);
    },

    /**
     * Take an array from a table and convert it to a string for export to clipboard or saving to csv
     * @param {*} rowArray An array where each row is an element, and each row is also an array containing each cell as an element
     * @param {*} cellSepString The string that should be used to separate each cell (column)
     * @param {*} newRowString The string that should be used to separate each row
     * @returns A single string of the table
     */
    convertRowArrayToString: function(rowArray, cellSepString = "\t", newRowString = "\n"){
        var rowString = [];
        rowArray.forEach((row)=>{
            if(row.length){
                row.forEach((cell, i)=>{
                    if(cell.includes(cellSepString) || cell.includes(newRowString)){
                        row[i] = '"' + cell + '"'; // protect if includes separator
                    }
                });
                rowString.push(row.join(cellSepString));
            }
        });
        var tableString = rowString.join(newRowString);
        return(tableString)
    },

    /**
     * This function will copy a string to the clipboard. If the string is blank, changes it to a single space
     * otherwise nothing is copied
     * 
     * The temporary <textarea> is appended to the HTML form and selected.
     * After the <textarea> is copied, it is then removed from the page.
     * 
     * @param {*} textStr The string that is to be copied to the clipboard
     * @param {*} $divForCopy The div on the page that should be used to create the temporary textarea
     * @param {*} $errorMsg Where messages to the user should be printed regarding status of the copy
     */
    copyStringToClipboard: function(textStr, $divForCopy, $errorMsg){
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        // var $temp = $("<text" + "area></text" + "area>");

        if(textStr){
            errorStr = "Copy attempted";
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copy attempted</span>");
        } else {
            textStr = " ";
            $errorMsg.html("<span style='color:red; font-size:24px;'>Nothing to copy</span>");
        }
        $temp.text(textStr);

        console.log(textStr);
        $temp.appendTo($divForCopy).select();
        document.execCommand("copy");
        $temp.remove();
        this.resize();
        
        // Doesn't work within LA b/c of permissions, but would be easier way to copy w/o appending to page
        // navigator.clipboard.writeText(textStr); 
    },
    // #endregion copy tables

    //#region cards
    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        $cardHead.next().find("textarea.autoAdjust").each((i,e)=> {
            if(! $(e).is(":hidden")) {
                e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
            } 
        });
        this.resize();
    },

    makeCard: function ($div, cardHeadContent, cardBodyContent) {
        // Add extras to header, such as classes or data attributes in calling function after making the card
        $div.append(
            $("<div></div>", {
                "class": "card"
            }).append(
                $("<button></button>", {
                    "type": "button",
                    "class": "card-header",
                }).on("click", (e)=> {
                    this.toggleCard($(e.currentTarget));
                }).append(cardHeadContent)
            ).append(
                $("<div></div>", {
                    "class": "card-body collapse"
                }).append(
                    cardBodyContent
                )
            )
        )
        this.resize();
    },
    //#endregion cards


    makeScoringRow: function (mouseNum, dateString, day, $appendContainer){
        var $cardContainer = $("<div/>", {
            "class": "card sortCard",
            "data-mouse": mouseNum,
            "data-day": day,
            "data-date": dateString
        });

        labelClasses = "col-12 font-weight-bold";
        dataCols = ["mouse", "date", "day", "total", "nuc", "corn", "leuko", "stage", "final"];
        extraClasses = ["sortCol", "sortCol", "sortCol", "showCol", "showCol", "showCol", "showCol", "showCol", "showCol"];
        sortClasses = "col-12 col-md sortCol";
        showClasses = "col-12 col-md showCol";
        inputCols = ["total", "nuc", "corn", "leuko", "stage"];

        $cardContainer.append(
            $("<div/>", {
                "class": "row"
            }).append(
                $("<div/>", {
                    "class": "col-6 d-md-none row labelRow",
                    "data-mouse": mouseNum
                })
            ).append(
                $("<div/>", {
                    "class": "col-6 col-md-12 row mouseRow",
                    "data-mouse": mouseNum
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
        );
        
        for(var i=0; i<dataCols.length; i++){
            var col = dataCols[i];
            var extraClass = extraClasses[i]
            $cardContainer.find(".labelRow[data-mouse='"+mouseNum+"']").append(
                $("<div/>",{
                    "class": labelClasses + " " + extraClass,
                    "data-col": col
                }).append(this.capitalize(col))
            );
        }
        
        for(var i=0; i<inputCols.length; i++){
            var col = inputCols[i];
            $cardContainer.find(".mouseRow[data-mouse='"+mouseNum+"']").append(
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

        $cardContainer.find(".mouseRow[data-mouse='"+mouseNum+"']").append(
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

        $appendContainer.append($cardContainer);

        $cardContainer.find(".watch").on("input", (e)=> {
            this.watchValue($(e.currentTarget));
        });
    },

    createLabelRow: function () {
        labelClasses = "col font-weight-bold";
        dataCols = ["mouse", "date", "day", "total", "nuc", "corn", "leuko", "stage", "final"];
        extraClasses = ["sortCol", "sortCol", "sortCol", "showCol", "showCol", "showCol", "showCol", "showCol", "showCol"];

        var card = document.createElement("div");
        card.className = "card d-none d-md-flex topTableRow";
        var row = document.createElement("div");
        row.className = "row";
        var col = document.createElement("div");
        col.className = "col-12 row labelRow";

        for (var i=0; i<dataCols.length; i++) {
            var colName = dataCols[i];
            var extraClass = extraClasses[i];
            var e = document.createElement("div");
            e.className = labelClasses + " " + extraClass;
            e.dataset.col = colName;
            content = document.createTextNode(this.capitalize(colName));
            e.appendChild(content);
            col.appendChild(e);
        }
        row.appendChild(col);
        card.appendChild(row);

        return card;
    },

    appendLabelRow: function ($div){
        labelClasses = "col font-weight-bold";
        dataCols = ["mouse", "date", "day", "total", "nuc", "corn", "leuko", "stage", "final"];
        extraClasses = ["sortCol", "sortCol", "sortCol", "showCol", "showCol", "showCol", "showCol", "showCol", "showCol"];
        
        $div.append(
            $("<div></div>", {
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
                }).append(this.capitalize(col))
            );
        }
    },

    startDateFuncs: function ($el, mouseNum) {
        this.checkDateFormat($el);
        var currentDate = this.mice[mouseNum]["startDate"];
        var thisDate = $el.val();
        if(currentDate && currentDate != thisDate){
            $el.val(currentDate); // reset to current date
            this.runIfConfirmed(
                "This will reset all sampling days for this mouse. Are you sure you want to proceed?", 
                ()=>{
                    this.runIfConfirmed(
                        "All data you've entered for this mouse will be erased. Are you sure you want to proceed?",
                        ()=>{
                            this.mice[mouseNum]["dates"] = [];
                            for(var date in this.dates){
                                var inDates = this.dates[date].hasOwnProperty(mouseNum);
                                if(inDates){
                                    delete this.dates[date][mouseNum];
                                    var mouseSearch = this.mouseSearch(mouseNum);
                                    var dateSearch = this.dateSearch(date);
                                    $(mouseSearch+dateSearch).remove();
                                }
                                }
                            this.mice[mouseNum]["startDate"]=thisDate;
                            $el.val(thisDate); // change back to newly entered date
                            this.adjustScoringRows(mouseNum, true);
                            this.sortFunc("date");
                            this.makeTableCols();
                        }
                        , elForHeight = $el.get(0)
                    )
                },
                elForHeight = $el.get(0)
            );
        } else{
            this.mice[mouseNum]["startDate"]=thisDate;
            this.adjustScoringRows(mouseNum, true);
            this.sortFunc("date");
            this.makeTableCols();
        }
    },

    endDateFuncs: function ($el, mouseNum) {
        this.checkDateFormat($el);
        var currentDate = this.mice[mouseNum]["endDate"];
        var thisDate = $el.val();
        var currentAsDate = luxon.DateTime.fromISO(currentDate).startOf("day");
        var thisAsDate = luxon.DateTime.fromISO(thisDate).startOf("day");
        if(currentDate && currentAsDate > thisAsDate){
            $el.val(currentDate); // reset to current date
            this.runIfConfirmed(
                "This will remove sampling days. Are you sure you wish to proceed?"
                , ()=>{
                    this.mice[mouseNum]["endDate"]=thisDate;
                    $el.val(thisDate); // set back to entered val
                    this.adjustScoringRows(mouseNum, true);
                    this.sortFunc("date");
                    this.makeTableCols();
                }
                , elForHeight = $el.get(0)
            )
        } else {
            this.mice[mouseNum]["endDate"]=$el.val();
            this.adjustScoringRows(mouseNum, true);
            this.sortFunc("date");
            this.makeTableCols();
        }
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
                    $("<button></button>", {
                        "class": "card-header mouseHeader",
                        "type": "button",
                        "data-calc": "mouse",
                        "data-mouse": mouseNum
                    }).on("click", (e)=> {
                        this.toggleCard($(e.currentTarget));
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
                                }).on("change", (e)=> {
                                    this.mice[mouseNum]["id"] = $(e.currentTarget).val();
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": row
                        }).append(
                            $("<div/>", {
                                "class": col
                            }).append("<h5>Cycle ID #:</h5>")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "number", 
                                    "data-mouse": mouseNum,
                                    id: "cycleNum"+mouseNum,
                                    name: "cyclenum"+mouseNum,
                                    "class": "cycleNum fullWidth watch",
                                    "data-watch": "cycleNum"
                                }).on("change", (e)=> {
                                    this.mice[mouseNum]["cycleNum"] = $(e.currentTarget).val();
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
                                }).on("click", (e)=> {
                                    this.deleteMouseFuncs($(e.currentTarget).data("mouse"), elForHeight = e.currentTarget);
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
                                }).each((i,e)=> {
                                    this.checkDateFormat($(e));
                                }).on("change", (e)=> {// For date picker; fires for any possible date; including 0002
                                    this.startDateFuncs($(e.currentTarget), mouseNum);
                                }).on("keypress", (e)=> { //enter with keyboard
                                    // https://stackoverflow.com/questions/40762549/html5-input-type-date-onchange-event
                                    $(e.currentTarget).off("change blur"); // remove change/blur listeners
                                    $(e.currentTarget).on("blur", (e)=> {
                                        if(this.isValidDate($(e.currentTarget).val())){
                                            this.startDateFuncs($(e.currentTarget), mouseNum);
                                        }
                                        $(e.currentTarget).off("blur"); //remove listener
                                        $(e.currentTarget).on("change", (e)=> { //add back change listener
                                            this.startDateFuncs($(e.currentTarget), mouseNum);
                                        });
                                    });
                                    if (event.keyCode === 13) { // also fire if press enter
                                        if(this.isValidDate($(e.currentTarget).val())){
                                            this.startDateFuncs($(e.currentTarget), mouseNum);
                                        }
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
                                }).each((i,e)=> {
                                    this.checkDateFormat($(e));
                                }).on("change", (e)=> {
                                    this.endDateFuncs($(e.currentTarget), mouseNum);
                                }).on("keypress", (e)=> { //enter with keyboard
                                    // https://stackoverflow.com/questions/40762549/html5-input-type-date-onchange-event
                                    $(e.currentTarget).off("change blur"); // remove change/blur listeners
                                    $(e.currentTarget).on("blur", (e)=> {
                                        if(this.isValidDate($(e.currentTarget).val())){
                                            this.endDateFuncs($(e.currentTarget), mouseNum);
                                        }
                                        $(e.currentTarget).off("blur"); //remove listener
                                        $(e.currentTarget).on("change", (e)=> { //add back change listener
                                            this.endDateFuncs($(e.currentTarget), mouseNum);
                                        });
                                    });
                                    if (event.keyCode === 13) { // also fire if press enter
                                        if(this.isValidDate($(e.currentTarget).val())){
                                            this.endDateFuncs($(e.currentTarget), mouseNum);
                                        }
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
                    "data-mouse": mouseNum,
                    "class": "mouse"
                }).append("Mouse "+mouseNum)
            ).append(
                $("<td/>", {
                    "data-calc": "cycleNum",
                    "data-mouse": mouseNum,
                    "class": "cycleNum"
                })
            ).append(
                $("<td/>", {
                    "data-calc": "startDate",
                    "data-mouse": mouseNum,
                    "class": "startDate"
                })
            )
        );

        $(".watch").on("input", (e)=> {
            this.watchValue($(e.currentTarget));
        });

        this.resize();
    },

    deleteMouseFuncs: function (mouseNum, elForHeight = null) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this mouse?"
            , ()=>{
                // Remove it from the mouseNums
                var index = this.mouseNums.indexOf(mouseNum);
                if(index > -1){
                    this.mouseNums.splice(index, 1);
                }
        
                //Remove it from mice
                delete this.mice[mouseNum];
        
                // Remove mouse from dates list
                for(date in this.dates){
                    delete this.dates[date][mouse];
                }
        
                var mouseSearch = this.mouseSearch(mouseNum);
                $(mouseSearch).remove();
                // console.log(this.mice, this.dates);
                this.sortFunc("date");

            }
            , elForHeight = elForHeight
        )

        this.resize();
    },

    adjustScoringRows: function (mouse, makeRow) {
        var mouseInfo = this.mice[mouse];
        // console.log(mouseInfo);
        
        var startDate = mouseInfo.startDate;
        var endDate = mouseInfo.endDate;
        
        var numDays = 0;
        if(startDate && endDate){
            var startDateAsDate = luxon.DateTime.fromISO(startDate).startOf("day");
            var endDateAsDate = luxon.DateTime.fromISO(endDate).startOf("day");
        
            numDays = endDateAsDate.diff(startDateAsDate, "days").as("days") + 1;
        }            
        // console.log(id, startDateAsDate, endDateAsDate, currentNumDays);

        this.mice[mouse]["numDays"] = numDays;

        // Reset dates array
        this.mice[mouse]["dates"] = [];

        if(numDays > 0){
            var date = startDateAsDate;
            for(var j = 0; j < numDays; j++){
                var dateString = date.toISODate();
                var day = j + 1;
                var dateOb = this.dates[dateString];
                if(! dateOb){
                    this.dates[dateString] = {};
                }
                var inDateOb = this.dates[dateString].hasOwnProperty(mouse);
                if(! inDateOb){
                    this.dates[dateString][mouse] = day;
                    if(makeRow){
                        this.makeScoringRow(mouse, dateString, day, $(".cardContainer"));
                    }
                }
                
                var inMouseDateOb = this.checkInArray(dateString, this.mice[mouse]["dates"]);
                if(! inMouseDateOb){
                    this.mice[mouse]["dates"].push(dateString);
                }
                date = date.plus({days: 1});
            }
        }

        // Remove dates that aren't in mouse dates array
        for(var date in this.dates){
            var inMouseDate = this.checkInArray(date, this.mice[mouse]["dates"]);
            if(! inMouseDate){
                var inDates = this.dates[date].hasOwnProperty(mouse);
                if(inDates){
                    delete this.dates[date][mouse];
                    var mouseSearch = this.mouseSearch(mouse);
                    var dateSearch = this.dateSearch(date);
                    $(mouseSearch+dateSearch).remove();
                }
            }
        }

        // this.sortFunc("date");
        // console.log(this.dates, this.mice);
    },

    maxNumDays: 0,

    makeTableCols: function () {
        // console.log(this.mice, this.dates);
        var $table = $("#mouseTable");

        newMax = 0;

        for( var mouse in this.mice ){
            var numDays = this.mice[mouse]["numDays"];
            if(numDays>newMax){newMax = numDays}
        }

        if(newMax > this.maxNumDays){
            for(var i = this.maxNumDays; i < newMax; i++){
                var day = i+1;
                $table.find("thead tr").append(
                    $("<th/>", {
                        "class": "added",
                        "data-day": day
                    }).append("Day" + day)
                )
            }
        } else if(this.maxNumDays > newMax){
            for(var i = newMax; i < this.maxNumDays; i++){
                var day = i+1;
                var daySearch = this.daySearch(day);
                $table.find("thead tr").find("th"+daySearch).remove();
            }
        }

        this.maxNumDays = newMax;

        for( var mouse in this.mice){
            var mouseSearch = this.mouseSearch(mouse);
            var $row = $table.find("tr"+mouseSearch);

            var days = [];
            $row.find("td").each(function () {
                days.push($(this).data("day"));
            });

            for(var i = 0; i < newMax; i ++ ){
                var day = i + 1;
                if(! this.checkInArray(day, days)){
                    $row.append(
                        $("<td/>", {
                            "class": "added",
                            "data-calc": "final",
                            "data-day": day,
                            "data-mouse": mouse
                        })
                    );
                } else {
                    var index = days.indexOf(day);
                    if(index > -1){
                        days.splice(index, 1);
                    }
                }
            }

            if(days){
                for(var i = 0; i < days.length; i++){
                    var day = days[i];
                    var daySearch = this.daySearch(day);
                    $row.find("td"+daySearch).remove();
                }
            }
        
        }

        // console.log(maxNumDays);

        $(".watch").each((i,e)=> {
            this.watchValue($(e));
        });

        this.resize();
    },

    makeCharts: function () {
        // console.log("in make charts");
        $("#chartDiv").html("");
        $("#mouseTable tbody tr").each((i,e)=> {
            var mouseNum = e.dataset.mouse;
            var id = this.mice[mouseNum].id;
            if(!id){
                id = "Mouse " + mouseNum;
            }
            var cycleNum = this.mice[mouseNum].cycleNum;
            if(cycleNum){
                id = id + "-" + cycleNum
            }
            var rowArray = [];
            var day = 1;
            $(e).find(".added").each((i,e)=>{
                var stage = $(e).text();
                if(stage){
                    stage=parseInt(stage);
                } else {stage = NaN}
                rowArray.push([day, stage]);
                day++;
            });
            this.GoogleChart(rowArray, id, mouseNum);
        });
        this.resize();
    },

    GoogleChart: function (rowArray, mouseID, mouseNum) {
        google.charts.load('current', {packages: ['corechart', 'line'], callback: drawBasic});

        function drawBasic() {

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Day');
            data.addColumn('number', 'Stage');

            data.addRows(rowArray);

            var options = {
                title: mouseID,
                hAxis: {
                title: 'Day',
                gridlines: {color: 'none', multiple: 1},
                },
                vAxis: {
                title: 'Stage',
                ticks: [{v: 1, f: "E"}, {v: 2, f: "D"}, {v: 3, f: "P"}],
                minValue: 0,
                maxValue: 4,
                gridlines: {color: 'none'}
                },
                legend: "none"
            };

            $("#chartDiv").append($("<div></div>", {id: "chartDiv"+mouseNum, "style": "height: 200px"}));
            var chart = new google.visualization.LineChart(document.getElementById("chartDiv"+mouseNum));

            chart.draw(data, options);
            my_widget_script.resize();

        }
    },
};