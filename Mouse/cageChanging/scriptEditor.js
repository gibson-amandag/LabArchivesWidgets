my_widget_script =
{
    cageNums: [],
    cages: {},
    mode: "edit",
    
    init: function (mode, json_data) {
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
        this.mode = mode;
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

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to console
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event

        //Define behavior when buttons are clicked or checkboxes/selctions change
        this.addEventListeners();

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        // $("#cageID2").val("test");
        // $("#cageID5").val("test2");

        // Add * and # to mark required field indicators
        this.addRequiredFieldIndicators();

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode);

        // Print to console log if any elements don't have a required name attribute
        this.checkForNames();
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
            cageNums: this.cageNums,
            cages: this.cages
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

        var output = { 
            widgetData: testData,
            cageNums: [2, 5],
            cages: {
                2: {
                    cageCareNums: [2, 4],
                    cageCares: {
                        2: {
                            date: "2022-11-01",
                            food: true,
                            cageBottom: false
                        },
                        4: {
                            date: "2022-11-09",
                            food: true,
                            cageBottom: false
                        }
                    }
                },
                5: {
                    cageCareNums: [1, 3],
                    cageCares: {
                        1: {
                            date: "2022-11-02",
                            food: true,
                            cageBottom: true
                        },
                        3: {
                            date: "2022-11-11",
                            food: true,
                            cageBottom: false
                        }
                    }
                },
            }
        };

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
        if(parsedJson.cageNums){
            for(cageNum of parsedJson.cageNums){
                this.makeCageCard(cageNum);
            }
            this.cageNums = parsedJson.cageNums
        }
        if(parsedJson.cages){
            this.cages = parsedJson.cages
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
            $("input[type='date']").not(".editOnView").removeClass(".hasDatePicker");
            $(".editOnView").prop("readonly", "").prop("disabled", "");
            $(".editOnView").find("option").prop("disabled", "");
            $(".hideView").hide();
            $("#dueDate").datepicker({dateFormat: "yy-mm-dd"}); // can't figure out how else to get this to work
            $("#careDate").datepicker({dateFormat: "yy-mm-dd"}); // can't figure out how else to get this to work
        } else {
            $("input[type='date']").each((i, e)=> {
                this.checkDateFormat($(e));
            });
            
            $("input[type='time']").each((i, e)=> {
                this.checkTimeFormat($(e));
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

        $(".addCage").on("click", (e)=> {
            if(this.cageNums.length > 0){
                var lastCage = this.cageNums[this.cageNums.length - 1];
                var cageNum = lastCage + 1;
            } else {
                var cageNum = 1;
            }
            this.addCage(cageNum);
        });

        $("#collapseCages").on("click", (e)=>{
            this.collapseAllCageCards();
        })

        $("#addCare").on("click", (e)=>{
            var cageNums = $("#cageSelect").val();
            // Text of selected cages
            var cageDisplayNames = $("#cageSelect option:selected").toArray().map(item => item.text).join(", ");

            if(cageNums && cageNums.length>0){
                for(cageNum of cageNums){
                    if(cageNum){
                        var date = $("#changeDate").val();
                        var changeFood = this.getCheckState($("#changeFood"));
                        var changeWater = this.getCheckState($("#changeWater"));
                        var changeBottom = this.getCheckState($("#changeBottom"));
                        var changeTop = this.getCheckState($("#changeTop"));
                        if(this.cages[cageNum].cageCareNums.length >0){
                            var lastCare = this.cages[cageNum].cageCareNums[this.cages[cageNum].cageCareNums.length - 1];
                            var careNum = lastCare + 1;
                        } else {
                            var careNum = 1;
                        }
                        this.addCare(cageNum, careNum, date, changeFood, changeWater, changeBottom, changeTop);
                    }
                }
                this.getCagesDue($("#dueDate").val());
                this.makeDateCareTable($("#cageDate").val());
                this.makeDueDatesTable();
                $(".cageCaresTable").html("");
                $("#addCareNotes").text("Added care for " + cageDisplayNames + " on " + luxon.DateTime.fromISO(date).toLocaleString(luxon.DateTime.DATE_HUGE));
            } else {
                $("#addCareNotes").text("Select at least one cage")
            }
        });

        // Generic update when any part of the form has user input
        $("#the_form").on("input", (e)=>{
            // Add a watch attribute to elements if need to be more specific, such as
            // to specify a day or a cage to update
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

        var dateToday = luxon.DateTime.now().toISODate()
        $("#changeDate").val(dateToday);
        $("#dueDate").val(dateToday).on("change", (e)=>{
            this.getCagesDue($(e.currentTarget).val());
        }).each((i,e)=>{
            this.getCagesDue($(e).val());
        });

        $("#careDate").val(dateToday).on("change", (e)=>{
            this.makeDateCareTable($(e.currentTarget).val());
        }).each((i,e)=>{
            this.makeDateCareTable($(e).val());
        });

        this.makeDueDatesTable();

        $("#cageSelect").attr(
            "size",
            Math.min(this.cageNums.length, 15)
        );

        $("#selFood").on("click", (e)=>{
            this.selectFood($("#changeDate").val());
        });

        $("#selFoodWater").on("click", (e)=>{
            this.selectFoodWater($("#changeDate").val());
        });

        $("#selBottom").on("click", (e)=>{
            this.selectCageBottom($("#changeDate").val());
        });

        $("#selTop").on("click", (e)=>{
            this.selectCageTop($("#changeDate").val());
        });

        $(".htmlCardHeader").on("click", (e)=> {
            this.toggleCard($(e.currentTarget));
        });

        this.resize();
    },

    getCheckState: function($el){
        var checkState = false
        if($el.is(":checked")){
            checkState = true
        }
        return checkState
    },

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
            top = elForHeight.offsetTop + "px";
        }
        bootbox.confirm({
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
     * this.dialogConfirm(
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
    dialogConfirm: function(text, functionToCall, elForHeight = null){
        var thisMessage = "Do you want to proceed?";
        if(text){
            thisMessage = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = elForHeight.offsetTop + "px";
        }
        bootbox.confirm({
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
            top = elForHeight.offsetTop + "px";
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

    mouseSearch: function (mouse) {
        var mouseSearch = this.dataSearch("mouse", mouse);
        return mouseSearch;
    },

    cageSearch: function (cage) {
        var cageSearch = this.dataSearch("cage", cage);
        return cageSearch;
    },

    updateCalcFromEl: function (el) {
        // debugger;
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
        var cageNum = $el.data("cage");
        var val = $el.val();
        if(cageNum){
            calcSearch += this.cageSearch(cageNum);
        }
        if(watch == "cageID"){
            if(!val){
                val = "Cage " + cageNum;
            }
        }
        $(calcSearch).text(val);

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
            this.copyTable($tableToCopy, copyHead, $divForCopy, $errorMsg, transpose); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
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
     copyTable: function ($table, copyHead, $divForCopy, $errorMsg, transpose) {
        var tableArray = this.getTableArray($table, copyHead, transpose);
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
    getTableArray: function ($table, copyHead, transpose) {
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
        $table.find("tbody").children("tr").each((i,e)=> {
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

        if(textStr){
            errorStr = "Copy attempted";
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copy attempted</span>");
        } else {
            textStr = " ";
            $errorMsg.html("<span style='color:red; font-size:24px;'>Nothing to copy</span>");
        }
        $temp.text(textStr);

        $temp.appendTo($divForCopy).select();
        document.execCommand("copy");
        $temp.remove();
        this.resize();
        
        // Doesn't work within LA b/c of permissions, but would be easier way to copy w/o appending to page
        // navigator.clipboard.writeText(rows.join("\n")); 
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

    collapseAllCageCards: function(){
        $(".cageCard").find(".card-header").each((i,e)=>{
            $(e).next().addClass("collapse");
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

    
    addCage: function(cageNum){
        var inArray = this.checkInArray(cageNum, this.cageNums);
        if(! inArray){
            // debugger;
            this.cageNums.push(cageNum);
            this.cages[cageNum] = {
                cageID: "",
                cageLoc: "",
                cageType: "",
                startCage: "",
                endCage: "",
                cageCareNums: [],
                cageCares: {}
            };

            this.makeCageCard(cageNum);
        }
    },

    makeCageCard: function(cageNum){
        var $div = $("#cageCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 cageCard",
                "data-cage": cageNum
            })
        )
        
        var $cageDiv = $(".cageCard"+this.cageSearch(cageNum));
        
        var header = $("<div></div>", {
            "class": "cageIDCalc",
            "data-calc": "cageID",
            "data-cage": cageNum
        }).append("Cage " + cageNum);
        var $body = this.makeCageCardBody(cageNum);
        this.makeCard($cageDiv, header, $body);

        $("#cageSelect").append(
            $("<option></option>", {
                value: cageNum,
                class: "cageIDCalc",
                "data-calc": "cageID",
                "data-cage": cageNum
            }).append(
                "Cage " + cageNum
            )
        ).attr(
            "size",
            Math.min(this.cageNums.length, 15)
        );
    },

    makeCageCardBody: function(cageNum){
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "<h4>Cage ID:</h4>",
                    type: "text",
                    className: "cageID",
                    addRowClass: " updateCageObj"
                },
                {
                    label: "Cage #:",
                    type: "number",
                    className: "barcode",
                    addRowClass: " updateCageObj"
                }, {
                    label: "Delete:",
                    type: "button",
                    className: "deleteCage",
                    optionsObj: [],
                    addRowClass: " hideView"
                },{
                    label: "Cage location:",
                    type: "text",
                    className: "cageLoc",
                    addRowClass: " updateCageObj"
                }, {
                    label: "Cage type:",
                    type: "select",
                    className: "cageType",
                    addRowClass: " updateCageObj",
                    optionsObj: [
                        {
                            value: "",
                            text: "[Select]"
                        }, {
                            value: "ventilated",
                            text: "Ventilated"
                        }, {
                            value: "static",
                            text: "Static"
                        }, {
                            value: "lbn",
                            text: "LBN"
                        }
                    ]
                }, {
                    label: "Start cage:", 
                    type: "date",
                    className: "startCage",
                    addRowClass: " updateCageObj"
                }, {
                    label: "End cage:", 
                    type: "date",
                    className: "endCage",
                    addRowClass: " updateCageObj"
                }, {
                    label: "Show care activites",
                    type: "button",
                    className: "showCare"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, cageNum)
                )
            }

            $body.find(".deleteCage").prop("value", "Delete Cage").on("click", (e)=>{
                this.deleteCageFuncs(cageNum);
            });

            $body.find(".showCare").prop("value", "Show cares").on("click", (e)=>{
                this.makeCageCareTable(cageNum);
            });

            $body.find(".updateCageObj").on("change", (e)=>{
                // debugger;
                var $el = $(e.target); // not currentTarget, because the .updateCageObj gets put on the row
                var val = $el.val();
                // Store only the text and no HTML elements.
                valSafe = this.encodeHTML(val);
                var thisProp = $el.data("watch");
                this.cages[cageNum][thisProp] = valSafe;
                this.makeDueDatesTable();
            });

        return $body
    },

    encodeHTML: function(dirtyString) {
        // https://stackoverflow.com/a/13140100
        var container = document.createElement('div');
        var text = document.createTextNode(dirtyString);
        container.appendChild(text);
        return container.innerHTML; // innerHTML will be a xss safe string
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

    makeInput: function(inputType, className, cageNum, optionsObj){
        var lowerCaseName = className.toLowerCase();
        if(inputType === "select"){
            $input = $("<select></select>", {
                "name": lowerCaseName+cageNum,
                "id": className+cageNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-cage": cageNum
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
                "name": lowerCaseName+cageNum,
                "id": className+cageNum,
                "class": className + " fullWidth watch autoAdjust",
                "data-watch": className,
                "data-cage": cageNum,
            }).on("input", (e)=>{
                this.updateTextarea(e.currentTarget);
            })
        } else {
            var $input = $("<input></input>", {
                type: inputType,
                "name": lowerCaseName+cageNum,
                "id": className+cageNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-cage": cageNum
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

    makeRowFromObj: function(obj, cageNum){
        var $row = this.makeRow(
            obj.label,
            this.makeInput(
                obj.type,
                obj.className,
                cageNum,
                obj.optionsObj
            ),
            obj.addRowClass
        );
        return($row);
    },

    deleteCageFuncs: function (cageNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this cage?", 
            ()=>{
                // Remove it from the cageNums
                var index = this.cageNums.indexOf(cageNum);
                if(index > -1){
                    this.cageNums.splice(index, 1);
                }
        
                // Remove it from the cages object
                delete this.cages[cageNum];
        
                // console.log(this.cageNums);
        
                var cageSearch = this.cageSearch(cageNum);
                $(".cageCard"+cageSearch).remove();
                // $("tr"+cageSearch).remove();

                // remove everything with this data attribute
                $(cageSearch).remove();
            }
        );
        this.resize();
    },

    deleteCareFuncs: function (cageNum, careNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this care?", 
            ()=>{
                // Remove it from the careNums
                var index = this.cages[cageNum].cageCareNums.indexOf(careNum);
                if(index > -1){
                    this.cages[cageNum].cageCareNums.splice(index, 1);
                }
        
                // Remove it from the cages object
                delete this.cages[cageNum].cageCares[careNum];
                
                this.makeDueDatesTable();
                this.getCagesDue($("#dueDate").val());
                this.makeDateCareTable($("#careDate").val());
                this.makeCageCareTable(cageNum);
            }
        );
        this.resize();
    },

    addCare: function(cageNum, careNum, date, changeFood, changeWater, changeBottom, changeTop){
        var inArray = this.checkInArray(careNum, this.cages[cageNum].cageCareNums);
        if(! inArray){
            // debugger;
            this.cages[cageNum].cageCareNums.push(careNum);
            this.cages[cageNum].cageCares[careNum] = {
                date: date,
                food: changeFood,
                water: changeWater,
                cageBottom: changeBottom,
                cageTop: changeTop
            };
        }
    },

    careLabels: [
        "date",
        "food",
        "water",
        "cageBottom",
        "cageTop"
    ],

    makeCageCareTable: function(cageNum){
        var cageCareNums = this.cages[cageNum].cageCareNums;
        var cageCares = this.cages[cageNum].cageCares;

        var labels = this.careLabels;

        const tableData = [];
        const cageCareAddedNums = [];

        for(cageCareNum of cageCareNums){
            var cageCare = cageCares[cageCareNum]

            var row = [];
            for(label of labels){
                var careVal = cageCare[label]
                if(careVal === true){
                    careVal = "T"
                } else if(!careVal) {
                    careVal = ""
                }
                row.push(careVal);
            }

            tableData.unshift(row);
            cageCareAddedNums.unshift(cageCareNum);
        }

        tableData.unshift(labels);
        cageCareAddedNums.unshift(NaN);
        
        var cageID = this.cages[cageNum].cageID;
        if(!cageID){
            cageID = "Cage " + cageNum;
        }

        $("#tableInfo").text(cageID);
        $tableDiv = $(".cageCaresTable");

        this.createTable(tableData, true, false, $tableDiv);

        $tableDiv.find("td").each((i,e)=>{
            var val = $(e).text();
            console.log(val);
            if(val === "T"){
                $(e).addClass("careDone");
            }
        });

        // console.log(cageCareAddedNums);

        if(this.mode !== "view" && this.mode !== "view_dev"){
            $tableDiv.find("tr").each((i,e)=>{
                if(i == 0){
                    $(e).append(
                        $("<th></th>").append(
                            "Delete"
                        )
                    )
                } else{
                    cageCareNum = cageCareAddedNums[i];
                    // console.log("cageCareNum", cageCareNum);
                    $(e).append(
                        $("<td></td>").append(
                            $("<input></input>", {
                                "data-cage": cageNum,
                                "data-care": cageCareNum,
                                value: "Delete care",
                                id: "deleteCare"+cageNum+cageCareNum,
                                class: "deleteCare",
                                "type": "button"
                            }).on("click", (e)=>{
                                var cageNum = $(e.currentTarget).data("cage");
                                var careNum = $(e.currentTarget).data("care");
                                this.deleteCareFuncs(cageNum, careNum);
                            })
                        )
                    )
                }
            });
        }
    },

    makeDateCareTable: function(matchDate){
        var cageNums = this.cageNums;
        var cages = this.cages;

        var labels = this.careLabels;

        const tableData = [["cageID"].concat(labels)];

        for(cageNum of cageNums){
            var cageCareNums = cages[cageNum].cageCareNums;
            var cageCares = cages[cageNum].cageCares;

            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(cageCare.date == matchDate){
                    var row = [];
                    row.push(cages[cageNum].cageID);
                    for(label of labels){
                        var val = cageCare[label];
                        if(val === true){
                            val = "T"
                        } else if(!val){
                            val = ""
                        }
                        row.push(val);
                    }
                    tableData.push(row)
                }

            }
        }

        $tableDiv = $(".caresOnDateTable");

        this.createTable(tableData, true, false, $tableDiv);

        $tableDiv.find("td").each((i,e)=>{
            var val = $(e).text();
            console.log(val);
            if(val === "T"){
                $(e).addClass("careDone");
            }
        });
    },

    getWaterDueDate: function(cageNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        var cageType = cage.cageType;
        if(
            startDate &&
            !endDate && 
            (cageType === "static" || cageType === "lbn")
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(cageCare.water && 
                    (latestDate === undefined || cageCare.date > latestDate)
                ){
                    latestDate = cageCare.date
                }
            }
            
            if(latestDate === undefined){
                dueDate = dateToday;
            } else if(cageType === "lbn"){
                dueDate = this.addDays(latestDate, 1);
            } else {
                dueDate = this.addDays(latestDate, 7);
            }
        }
        return dueDate;
    },

    isDueForWater: function(cageNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        var cageType = cage.cageType;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate) && 
            (cageType === "static" || cageType === "lbn")
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(cageCare.water && 
                    (latestDate === undefined || cageCare.date > latestDate) &&
                    cageCare.date <= dueDate
                ){
                    latestDate = cageCare.date
                }
            }
            
            if(latestDate === undefined || 
                (cageType == "lbn" && latestDate < dueDate) || 
                this.addDays(latestDate, 7) <= dueDate
            ){
                isDue = true;
            }
        }
        return isDue;
    },

    getCagesDueForWater: function(dueDate = luxon.DateTime.now().toISODate()){
        var cageNums = this.cageNums;
        
        const cagesDue = [];

        for(cageNum of cageNums){
            var isDue = this.isDueForWater(cageNum, dueDate);
            if(isDue){
                cagesDue.push(cageNum);
            }
        }
        return cagesDue;
    },

    getFoodDueDate: function(cageNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        var cageType = cage.cageType;
        if(
            startDate &&
            !endDate
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(
                    cageCare.food && 
                    (latestDate === undefined || cageCare.date > latestDate)
                ){
                    latestDate = cageCare.date
                }
            }
            
            if(latestDate === undefined){
                dueDate = dateToday;
            } else if(cageType === "lbn"){
                dueDate = this.addDays(latestDate, 1);
            } else if(cageType == "static"){
                dueDate = this.addDays(latestDate, 7);
            } else {
                dueDate = this.addDays(latestDate, 14);
            }
        }
        return dueDate;
    },

    isDueForFood: function(cageNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        var cageType = cage.cageType;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate)
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(
                    cageCare.food && 
                    (latestDate === undefined || cageCare.date > latestDate) &&
                    cageCare.date <= dueDate
                ){
                    latestDate = cageCare.date
                }
            }
            
            if(latestDate === undefined || 
                (cageType === "lbn" && latestDate < dueDate) || 
                (cageType === "static" && this.addDays(latestDate, 7) <= dueDate) ||
                this.addDays(latestDate, 14) <= dueDate // default to 14 days
            ){
                isDue = true;
            }
        }
        return isDue;
    },

    getCagesDueForFood: function(dueDate = luxon.DateTime.now().toISODate()){
        // debugger;
        var cageNums = this.cageNums;
        
        const cagesDue = [];

        for(cageNum of cageNums){
            var isDue = this.isDueForFood(cageNum, dueDate);
            if(isDue){
                cagesDue.push(cageNum);
            }
        }
        return cagesDue;
    },

    getBottomDueDate: function(cageNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        var cageType = cage.cageType;
        if(
            startDate &&
            !endDate
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(
                    cageCare.cageBottom && 
                    (latestDate === undefined || cageCare.date > latestDate)
                ){
                    latestDate = cageCare.date
                }
            }

            if(latestDate === undefined){
                dueDate = dateToday;
            } else if(cageType === "lbn" || cageType === "static"){
                dueDate = this.addDays(latestDate, 7);
            } else {
                dueDate = this.addDays(latestDate, 14);
            }
        }

        return dueDate;
    },

    isDueForBottom: function(cageNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        var cageType = cage.cageType;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate)
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(
                    cageCare.cageBottom && 
                    (latestDate === undefined || cageCare.date > latestDate) &&
                    cageCare.date <= dueDate
                ){
                    latestDate = cageCare.date
                }
            }
            
            if(latestDate === undefined || 
                ((cageType === "static" || cageType === "lbn") && this.addDays(latestDate, 7) <= dueDate) ||
                this.addDays(latestDate, 14) <= dueDate // default to 14 days
            ){
                isDue = true;
            }
        }

        return isDue;
    },

    getCagesDueForBottom: function(dueDate = luxon.DateTime.now().toISODate()){
        // debugger;
        var cageNums = this.cageNums;
        
        const cagesDue = [];

        for(cageNum of cageNums){
            var isDue = this.isDueForBottom(cageNum, dueDate);
            if(isDue){
                cagesDue.push(cageNum);
            }
        }
        return cagesDue;
    },

    getTopDueDate: function(cageNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        if(
            startDate &&
            !endDate
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(
                    cageCare.cageTop && 
                    (latestDate === undefined || cageCare.date > latestDate)
                ){
                    latestDate = cageCare.date
                }
            }

            if(latestDate === undefined){
                dueDate = dateToday;
            } else {
                dueDate = this.addDays(latestDate, 90);
            }
        }

        return dueDate;
    },

    isDueForTop: function(cageNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var cages = this.cages;

        var cage = cages[cageNum];
        var cageCareNums = cage.cageCareNums;
        var cageCares = cage.cageCares;
        var startDate = cage.startCage;
        var endDate = cage.endCage;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate)
        ){
            var latestDate = undefined;
            for(cageCareNum of cageCareNums){
                var cageCare = cageCares[cageCareNum]
                if(
                    cageCare.cageTop && 
                    (latestDate === undefined || cageCare.date > latestDate) &&
                    cageCare.date <= dueDate
                ){
                    latestDate = cageCare.date
                }
            }
            
            if(latestDate === undefined || 
                this.addDays(latestDate, 90) <= dueDate
            ){
                isDue = true;
            }
        }

        return isDue;
    },

    getCagesDueForTop: function(dueDate = luxon.DateTime.now().toISODate()){
        // debugger;
        var cageNums = this.cageNums;
        var cages = this.cages;

        const cagesDue = [];

        for(cageNum of cageNums){
            var isDue = this.isDueForTop(cageNum, dueDate);
            if(isDue){
                cagesDue.push(cageNum);
            }
        }
        return cagesDue;
    },

    getCagesDue: function(dueDate = luxon.DateTime.now().toISODate()){
        var cageBottomsToChange = this.getCagesDueForBottom(dueDate);
        var cageTopsToChange = this.getCagesDueForTop(dueDate);
        var foodToChange = this.getCagesDueForFood(dueDate);
        var waterToChange = this.getCagesDueForWater(dueDate);

        var namesBottoms = this.getCageNamesArray(cageBottomsToChange);
        var namesTops = this.getCageNamesArray(cageTopsToChange);
        var namesFood = this.getCageNamesArray(foodToChange);
        var namesWater = this.getCageNamesArray(waterToChange);

        // console.log(namesBottoms, namesTops, namesFood, namesWater);

        this.printCages(namesBottoms, $(".cageBottomsList"));
        this.printCages(namesTops, $(".cageTopsList"));
        this.printCages(namesFood, $(".foodCageList"));
        this.printCages(namesWater, $(".waterCageList"));
        this.resize();
    },

    selectFood: function(dueDate = luxon.DateTime.now().toISODate()){
        var foodToChange = this.getCagesDueForFood(dueDate);
        
        $("#cageSelect").val(foodToChange);

        $("#changeWater").prop("checked", false);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", false);
        $("#changeTop").prop("checked", false);
    },

    selectFoodWater: function(dueDate = luxon.DateTime.now().toISODate()){
        var foodToChange = this.getCagesDueForFood(dueDate);
        var waterToChange = this.getCagesDueForWater(dueDate);

        var comboCages = Array.from(new Set(foodToChange.concat(waterToChange)));
        $("#cageSelect").val(comboCages);

        $("#changeWater").prop("checked", true);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", false);
        $("#changeTop").prop("checked", false);

    },

    selectCageBottom: function(dueDate = luxon.DateTime.now().toISODate()){
        var cageBottomsToChange = this.getCagesDueForBottom(dueDate);
        $("#cageSelect").val(cageBottomsToChange);

        $("#changeWater").prop("checked", false);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", true);
        $("#changeTop").prop("checked", false);
    },

    selectCageTop: function(dueDate = luxon.DateTime.now().toISODate()){
        var cageTopsToChange = this.getCagesDueForTop(dueDate);
        $("#cageSelect").val(cageTopsToChange);

        $("#changeWater").prop("checked", false);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", true);
        $("#changeTop").prop("checked", true);
    },

    getCageNamesArray: function(cageNumArray){
        var names = [];
        for(cageNum of cageNumArray){
            var thisID = this.cages[cageNum].cageID
            if(!thisID){
                thisID = "Cage " + cageNum;
            }
            names.push(thisID);
        }
        return names
    },

    printCages: function(cagesArray, $div){
        cagesArrayClean = this.encodeHTML(cagesArray).split(",");
        $div.html(cagesArrayClean.join("<br/>"));
    },

    addDays: function ($startDateVal, numDays) {
        // console.log("in addDays. Going to replace" + $newDateClass.text());
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toISODate();
        return newDate;
    },

    createTable: function(tableData, makeFirstRowHead = false, makeFirstColHead = false, $tableDiv) {
        // original from: https://stackoverflow.com/a/15164958
        var table = document.createElement('table');
        table.classList.add("table");
        var tableBody = document.createElement('tbody');

        tableData.forEach((rowData, rowNum)=> {
            var row = document.createElement('tr');

            rowData.forEach((cellData, colNum)=> {
                // console.log("make row head", makeFirstRowHead, "rowNum", rowNum, "make col head", makeFirstColHead, "colNum", colNum);
                // console.log("first part", (makeFirstRowHead && rowNum == 0))
                // console.log("second part", (makeFirstColHead && colNum == 0))
                if((makeFirstRowHead && rowNum == 0) || (makeFirstColHead && colNum == 0)){
                    var cell = document.createElement('th');
                } else {
                    var cell = document.createElement('td');
                }
                cell.appendChild(document.createTextNode(cellData)); // text not hmtl - should be safer
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        if($tableDiv === undefined || !$tableDiv){
            console.log("appending generally");
            document.body.appendChild(table);
        } else {
            $tableDiv.html(""); // clear existing
            $tableDiv.append(table);
        }

        this.resize();
    },

    getDueDatesForCage: function(cageNum){
        var waterDate = this.getWaterDueDate(cageNum);
        var foodDate = this.getFoodDueDate(cageNum);
        var bottomDate = this.getBottomDueDate(cageNum);
        var topDate = this.getTopDueDate(cageNum);

        this.cages[cageNum].water = waterDate;
        this.cages[cageNum].food = foodDate;
        this.cages[cageNum].bottom = bottomDate;
        this.cages[cageNum].top = topDate;
        
        return {
            water: waterDate,
            food: foodDate,
            bottom: bottomDate,
            top: topDate
        }
    },

    allCageTableLabels: [
        "cageID",
        "cageLoc",
        "cageType",
        "food",
        "water",
        "bottom",
        "top",
        "barcode"
    ],

    makeDueDatesTable: function(){
        var cageNums = this.cageNums;
        var cages = this.cages;

        var labels = this.allCageTableLabels;

        const tableData = [labels];

        for(cageNum of cageNums){
            this.getDueDatesForCage(cageNum);
            var cage = cages[cageNum]
            var endDate = cage.endCage;

            if(!endDate){
                var row = [];
                for (label of labels){
                    var val =cage[label];
                    if(!val){val = ""}
                    row.push(val);
                }
                tableData.push(row)
            }
        }

        $tableDiv = $(".dueDatesTable");

        this.createTable(tableData, true, false, $tableDiv);

        $tableDiv.find("td").each((i,e)=>{
            var text = $(e).text();
            if(this.isValidDate(text)){
                // debugger;
                if(text <= luxon.DateTime.now().toISODate()){
                    $(e).addClass("isDue");
                }
                $(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday: "short", month: "short", day: "2-digit"}))
            }
        })
    },



};