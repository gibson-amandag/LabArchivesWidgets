my_widget_script =
{
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
                                                                        // selectize
                                                                        this.include(
                                                                            "https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.0/js/selectize.js", 
                                                                            "sha512-1HjnkKhHSDunRgIHRK4gXORl/T0WxhVkiQ5gjwvrH4yQK9RqPqYnPPwJfh+6gYTc/U9Cg8n4MGRZV1CzsP0UIA==",
                                                                            "anonymous",
                                                                            // "https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.0/js/selectize.min.js",
                                                                            // "sha512-yPolz8xdNko3x+XY5yvuS5Inib7HXh7xD269BZOgyfv2GrNPisWLelUblxN5CdOoBAO0Siwfg4+QsAOVfUryCg==",
                                                                            // "anonymous",
                                                                            () =>{
                                                                                this.include(
                                                                                    // Papa Parse for CSVs
                                                                                    "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js",
                                                                                    "sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg==",
                                                                                    "anonymous",
                                                                                    ()=>{
                                                                                        $jq351 = jQuery.noConflict(true);
                                                                                        // console.log("After no conflict", $.fn.jquery);
                                                                                        // console.log("bootstrap jquery", $jq351.fn.jquery);
                                                                                        this.myInit(mode, json_data);
                                                                                    }
                                                                                )
                                                                            }
                                                                        )
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
        
        // Want this to be before the parseInitJson so that any user-changed data persists in the widget
        // Note that this means that when viewing in development mode, there's going to be all sorts of
        // gibberish test data - just press "update entries" to fix this

        this.makePlates();
        this.makeWellEntries();
        
        //Get the parsed JSON data
        // console.log(json_data);
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
        // console.log("to_json", this.netODvals);
        var output = { 
            widgetData: JSON.parse(widgetJsonString)
            , netODvals: this.netODvals
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
            widgetData: testData 
            , netODvals: {"1A": "0", "1B": 5}
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
        if(parsedJson.netODvals){
            this.netODvals = parsedJson.netODvals;
            this.fillNetODVals();
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
            $("input[type='date']").removeClass(".hasDatePicker");
            $(".hideView").hide();
            $("#entryContainer").insertAfter($("#platesWrapper"));
            this.toggleCard($(".plateCard[data-plate='plateID']").find(".card-header"));

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
            this.toggleTableFuncs($table);
        });

        $('.toCSV').on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var dateToday = luxon.DateTime.now().toISODate(); // Luxon has to be added in HTML
            var fileName = "table_"+tableID+"_"+dateToday;
            var $errorMsg = $("#errorMsg");
            
            this.toCSVFuncs(fileName, tableID, $errorMsg);
        });

    //    $(".copyData").on("click", (e)=> {
    //         var tableID = $(e.currentTarget).data("plate");
    //         // Get the data-table text string to add to the query to find the table
    //         var tableSearch = this.tableSearch(tableID);
    //         // Find the element that tells whether or not to copy the table
    //         var $copyHead = $(".copyHead"+tableSearch);
    //         var $transpose = $(".transpose"+tableSearch);
    //         var $tableToCopy = $("#"+tableID);
    //         var $tableDiv = $tableToCopy.parent();
    //         var $errorMsg = $("#errorMsg");
    //         var $divForCopy = $("#forCopy");
            
    //         this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose)
    //     });

        $(".copyPlate").on("click", (e)=> {
            var copyHead = true;
            var plateType = $(e.target).data("plate");
            var plateSearch = this.plateSearch(plateType);
            // console.log(plateSearch);
            var $tableToCopy = $(".plateImg" + plateSearch);
            var $tableDiv = $(".plateDiv" + plateSearch);
            var $errorMsg = $(".errorMsg"+plateSearch);
            // console.log($errorMsg);
            var $divForCopy = $(".forCopy"+plateSearch);
            
            this.copyDataFuncs(copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
        });

        $("#downloadCSV").on("click", (e)=>{
            var fileName = "cortPlate_" + this.buildFileName(); 

            this.exportAllTablesToCSV(fileName);
        });

        $("#downloadMetaCSV").on("click", (e)=>{
            this.exportMetaDataCSV();
        });

        $(".copyMouseIDs").on("click", (e)=>{
            var $divForCopy = $("#forCopy");
            var listName = $(e.currentTarget).data("list");
            var numSamples = $(e.currentTarget).data("samples");
            if(!numSamples){
                numSamples = $("#samplesPerMouse").val();
                if(!numSamples){
                    numSamples = 2;
                }
            }

            this.copyMouseIDs(listName, $divForCopy, numSamples);
        });

        $("#idEntry2").each((i,e)=> {
            // This will push times to 0 and 5 if there's pre/post
            // Won't save if you manually change it
            // The widget itself should actually fill in the values since they're form 
            // this.fillSampleIDsFromList($(e));
        }).on("change", (e)=> {
            this.fillSampleIDsFromList($(e.currentTarget));
        });
        
        $(".calcTotal").on("change", (e)=>{
            this.calcNumAssignedWells();
        });

        $("#9ptCurve").on("click", ()=>{
            $("#numSTD").val(9);
            $("#largestSTD").val(500);
            this.checkAndUpdateWells();
        });

        $("#7ptCurve").on("click", ()=>{
            $("#numSTD").val(7);
            $("#largestSTD").val(250);
            this.checkAndUpdateWells();
        });
        
        $("#updateEntries").on("click", ()=>{
            this.checkAndUpdateWells();
        });
        
        // this.calcNumAssignedWells();
        // this.checkAndUpdateWells();
        
        $(".type").each((i,e)=>{
            this.adjustViewByType($(e));
        }).on("change", (e)=>{
            this.fillByType($(e.currentTarget));
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

        $("#upload").on("click", (e)=>{
            this.upload();
        });

        $(".addNetODdiv").insertBefore($(".plateDiv"+this.plateSearch("netOD")));

        // for(i = 0; i < this.wellGroups; i++){
        //     var wellGroup = i + 1;
        //     var wellIDs = this.getWellIDsFromGroupNum(wellGroup);
        //     this.fillWells("plateID", wellIDs, wellGroup);
        //     // console.log("wellGroup", wellGroup, "well1", wellIDs.well1, "well2", wellIDs.well2)
        // }

        this.resize();
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

    watchSearch: function (watch) {
        var watchSearch = this.dataSearch("watch", watch);
        return watchSearch;
    },

    daySearch: function (day) {
        var daySearch = this.dataSearch("day", day);
        return daySearch;
    },

    mouseSearch: function (mouse) {
        var mouseSearch = this.dataSearch("mouse", mouse);
        return mouseSearch;
    },

    plateSearch: function (plate) {
        var plateSearch = this.dataSearch("plate", plate);
        return plateSearch;
    },

    wellSearch: function (well) {
        var wellSearch = this.dataSearch("well", well);
        return wellSearch;
    },

    groupSearch: function (group) {
        var groupSearch = this.dataSearch("group", group);
        return groupSearch;
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
        var calcSearch = my_widget_script.calcSearch(watch);
        var groupNum = $el.data("group");
        var mouseNum = $el.data("mouse");
        var val = $el.val();
        if(groupNum){
            calcSearch += my_widget_script.groupSearch(groupNum);
        }
        if(mouseNum){
            calcSearch += my_widget_script.mouseSearch(mouseNum);
        }
        if(watch == "plateID"){
            if(!val){
                // val = "Sample " + groupNum;
            }
        }
        $(calcSearch).html(val);

        // Update wells
        if(groupNum && this.checkInArray(watch, this.entryTypes)){
            var wellIDs = this.getWellIDsFromGroupNum(groupNum);
            this.fillWells(watch, wellIDs, val);
        }

        my_widget_script.resize();
    },

    //#region copy tables
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
        var tableArray = this.getTableArray($("."+ table).find("table"), copyHead = true, transpose = false);
        var tableString = this.convertRowArrayToString(tableArray, ",", "\n");

        // Download CSV file
        this.downloadCSV(tableString, filename);
    },

    buildPlateID: function(){
        var date = $("#date").val();
        if(!date){
            date = luxon.DateTime.now().toISODate();
        }
        var plateNum = parseInt($("#plateNumber").val());
        var plateLetter = "a";
        if(plateNum > 0){
            plateLetter = String.fromCharCode(plateNum - 1 + "a".charCodeAt(0));
        }
        var plateID = date + plateLetter;
        return(plateID)
    },

    buildFileName: function(){
        var fileName = this.buildPlateID();
        
        var initials = $("#initials").val();
        var kitLot = $("#kitLot").val();
        var cortLot = $("#cortLot").val();

        if(initials){
            fileName += "_by" + initials;
        }
        if(kitLot){
            fileName += "_kit" + kitLot
        }
        if(cortLot){
            fileName += "_cort" + cortLot
        }

        return(fileName);
    },

    exportAllTablesToCSV: function(filename){
        var csv = [];

        for(var i = 0; i < this.plateTypes.length; i++){
            var plateType = this.plateTypes[i];

            var $plate = $(".plateImg"+this.plateSearch(plateType));

            var tableArray = this.getTableArray($plate, copyHead = true, transpose = false);
            var tableString = this.convertRowArrayToString(tableArray, ",", "\n");

            csv.push(tableString);
            // console.log(csv);
        }

        this.downloadCSV(csv.join("\n\n"), filename);
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
     copyDataFuncs: function (copyHead = true, $tableToCopy, $tableDiv, $errorMsg, $divForCopy
    //  , $transpose
     ){
        var data_valid = this.data_valid_form($errorMsg); // update data_valid_form to print to specific error field
        var transpose = false;

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            this.resize(); //resize
            this.copyTable($tableToCopy, copyHead, $divForCopy, $errorMsg, transpose); //copy table
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
    //#endregion copy tables

    exportMetaDataCSV: function(){
        // debugger;
        var headers = ["plateID", "date", "initials", "kitLot", "cortLot", "experiment", "description"];
        var date = $("#date").val();
        if(!date){
            date = luxon.DateTime.now().toISODate();
        }
        var vals = [this.buildPlateID(), date, $("#initials").val(), $("#kitLot").val(), $("#cortLot").val(), $("#experiment").val(), $("#description").val()]
        
        var tableArray = [headers, vals];

        var tableString = this.convertRowArrayToString(tableArray, ",", "\n");

        var fileName = "cortInfo_" + this.buildFileName();
        this.downloadCSV(tableString, fileName);
    },

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

    plateTypes: [
        "plateID"
        , "netOD"
        , "mouseID"
        , "time"
        , "type"
        , "stdPgPerWell"
        , "volPerWell"
        , "dilutionFactor"
    ],

    entryTypes: [
        "plateID"
        , "mouseID"
        , "time"
        , "type"
        , "stdPgPerWell"
        , "volPerWell"
        , "dilutionFactor"
    ],

    entryTypesNice: [
        "Label"
        , "Mouse"
        , "Time"
        , "Sample Type"
        , "STD pg/well"
        , "mL/well"
        , "Dilution Factor"
    ],

    sampleTypes: {
        "": {
            label: "blank",
            plateID: "",
            mouseID: "",
            time:"",
            stdPgPerWell:"",
            volPerWell: "",
            dilutionFactor:""
        },
        "NSB": {
            label: "NSB",
            plateID: "NSB",
            mouseID: "",
            time:"",
            stdPgPerWell:"",
            volPerWell: "",
            dilutionFactor:""
        },
        "STD": {
            label: "standard",
            plateID: "STD",
            mouseID: "",
            time:"",
            volPerWell: 0.05,
            dilutionFactor:1
        },
        "bufferCtrl": {
            label: "buffer control",
            plateID: "bufferCtrl",
            mouseID: "",
            time:"",
            stdPgPerWell:"",
            volPerWell: "",
            dilutionFactor:""
        },
        "QC": {
            label: "quality control",
            plateID: "C_3",
            mouseID: "",
            time:"",
            stdPgPerWell:"",
            volPerWell: 0.05,
            dilutionFactor:100
        },
        "sample": {
            label: "sample",
            stdPgPerWell:"",
            volPerWell: 0.05,
            dilutionFactor:100,
        }
    },

    wellGroups: 48,

    cols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],

    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],

    row1: ["A", "C", "E", "G"],
    row2: ["B", "D", "F", "H"],

    sampleTimes: [],

    makePlates: function(){
        var $platesDiv = $("#platesWrapper");
        $platesDiv.html("");
        for(var i = 0; i < this.plateTypes.length; i++){
            var plateType = this.plateTypes[i];

            // make a div
            var $div = this.makePlateDiv(plateType, i+1);
            $platesDiv.append($div);

            var $table = this.makePlateTable(plateType);
            var plateSearch = this.plateSearch(plateType);
            $(".plateDiv" + plateSearch).append($table);
        }
    },

    makePlateDiv: function(plateType, plateNum){
        var $header = "<h3>" + plateType + "</h3>"
        var $body = $("<div></div>", {
            "class": "container mt-4 plateContainer",
            "data-plate": plateType
        }).append(
            $("<div></div>", {
                "class": "row mt-2"
            }).append(
                $("<div></div>", {
                    "class": "col-12 col-sm-6 col-md-3"
                }).append(
                    $("<input></input>", {
                        "type": "button",
                        "class": "copyPlate fullWidth",
                        "data-plate": plateType,
                        "value": "COPY PLATE",
                        "name": "copyplate"+plateNum
                    })
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row mt-2"
            }).append(
                $("<div></div>", {
                    "class": "col-12 errorMsg",
                    "data-plate": plateType
                })
            ).append(
                $("<div></div>", {
                    "class": "col-12 forCopy",
                    "data-plate": plateType
                })
            )
        ).append(
            $("<div></div>", {
                "class": "mt-2 table-responsive xsTableDiv plateDiv",
                "data-plate": plateType
            })
        );
        
        var $div = $("<div></div>", {
            "class": "plateCard",
            "data-plate": plateType
        });
        
        this.makeCard($div, $header, $body)

        return($div);
    },

    makePlateTable: function (plateType) {
        var $table = $("<table></table>", {
            "class": "table plateImg",
            "data-plate": plateType
        });

        // Add the first row
        $table.append(
            $("<tr></tr>", {
                "class": "row0"
            })
        );

        var $tableRow = $table.find(".row0");

        // Add the columns for the first row
        for( var col = 0; col < 13; col ++) {
            // If it's column 0, add the plateType label
            if(col == 0){
                $tableRow.append(
                    $("<th></th>").append(plateType)
                )
            } else { // otherwise, make it class by column number and append the column number in a cell
                $tableRow.append(
                    $("<th></th>", {
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
                $("<tr></tr>", {
                    "class": "row"+rowLetters[row]
                })
            )
            
            $tableRow = $table.find(".row"+rowLetters[row]);

            for( var col = 0; col < 13; col++) {
                // for even columns, dark for first and third pairs
                // for odd columns, dark for second and fourth pairs
                if (this.isEven(col)){
                    if(rowPairs1.includes(row)){ // alt is checkInArray if slow/unsupported
                        shading = "light";
                    } else {shading = "dark";}
                } else {
                    if(rowPairs1.includes(row)){
                        shading = "dark";
                    } else {shading = "light";}
                }
                if(col == 0){
                    $tableRow.append(
                        $("<th></th>", {
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
        return($table)
    },

    isEven: function(value) {
        if (value%2 == 0)
            return true;
        else
            return false;
    },

    makeWellEntries: function(){
        $("#entryWrapper").html("");
        for(i = 0; i < this.wellGroups; i++){
            var wellGroup = i + 1;

            var $cardDiv = this.makeWellEntry(wellGroup);
            $("#entryWrapper").append($cardDiv);
        }
    },

    makeWellEntry: function(wellGroup){
        var $div = $("<div></div>", {
            "class": "col-6 col-md-4 col-lg-3 col-xl-2",
            "data-group": wellGroup
        });

        var $header = wellGroup + ". <span data-group='"+wellGroup+"' data-calc='plateID'>Sample " + wellGroup +"</span>";

        var inputTypes = this.entryTypes;

        var $body = $("<div></div>", {
            "class": "container"
        });

        for(var i = 0; i < inputTypes.length; i++){
            var inputType = inputTypes[i];

            // Properties for input object
            var inputObject = {
                "class": "fullWidth watch " + inputType,
                id: inputType + wellGroup,
                name: inputType.toLowerCase() + wellGroup,
                "data-group": wellGroup,
                "data-watch": inputType 
            }

            var $input;

            if(inputType === "type"){
                $input = $("<select></select>", inputObject);
                for(type in this.sampleTypes){
                    $input.append(
                        $("<option></option>", {
                            value: type
                        }).append(this.sampleTypes[type]["label"])
                    );
                }
            } else {
                if(inputType === "mouseID" || inputType === "plateID"){
                    inputObject.type = "text"
                } else{
                    inputObject.type = "number"
                }
                $input = $("<input></input>", inputObject);
            }

            $body.append(
                $("<div></div>", {
                    "class": "row",
                    "data-entry": inputType,
                    "data-group": wellGroup
                }).append(
                    $("<div></div>", {
                        "class": "col-12 font-weight-bold"
                    }).append(
                        this.entryTypesNice[i]
                    )
                ).append(
                    $("<div></div>", {
                        "class": "col",
                    }).append(
                        $input
                    )
                )
            );
        }
        
        this.makeCard($div, $header, $body);

        return($div);
    },

    getWellIDsFromGroupNum: function(wellGroup){
        var well1, well2;
        if(wellGroup > 0 && wellGroup <= 48){

            // Get the index for the column by dividing by 4
            var colIndex = Math.ceil(wellGroup / 4) - 1;
            // console.log(wellGroup, colIndex);
            var col = this.cols[colIndex];

            // Determine the row based on divisibility by 4
            // For example, group 1 -> 0 / 4 = remainder 0
            var remainder = (wellGroup - 1) % 4; 
            var row1 = this.row1[remainder];
            var row2 = this.row2[remainder];

            well1 = col + row1;
            well2 = col + row2;
        }
        var wells = {
            well1: well1,
            well2: well2
        }
        return(wells)
    },

    // Provide the plate type and an object with both well ids
    // Fill in the wells with the provided value
    // Get the well ids from getWellIDsFromGroupNum
    fillWells: function(plateType, wells, val){
        var plateSearch = this.plateSearch(plateType);
        var well1Search = this.wellSearch(wells.well1);
        var well2Search = this.wellSearch(wells.well2);
        
        $(".plateImg"+plateSearch).find(".well" + well1Search).text(val);
        $(".plateImg"+plateSearch).find(".well" + well2Search).text(val);
        this.resize();
    },

    adjustViewByType: function($sampleType){
        var type = $sampleType.val();
        var infoObj = this.sampleTypes[type];
        var wellGroup = $sampleType.data("group");
        var groupSearch = this.groupSearch(wellGroup);

        var wellIDs = this.getWellIDsFromGroupNum(wellGroup);

        $(groupSearch + "[data-entry]").show();

        for( info in infoObj ){
            if(info !== "label"){
                var watchSearch = this.watchSearch(info);
                var entrySearch = this.dataSearch("entry", info);
                var val = infoObj[info];

                // if(val === "STD"){
                //     var currentVal = $(watchSearch + groupSearch).val();
                //     if(currentVal.startsWith("STD")){
                //         val = currentVal;
                //     }
                // }

                // // Update the entry values
                // $(watchSearch + groupSearch).val(val);

                // if(info === "plateID"){
                //     $(groupSearch+this.calcSearch("plateID")).text(val);
                // }

                // // // Update the table
                // this.fillWells(info, wellIDs, val);

                // Hide if a blank value specified
                if(!val){
                    $(groupSearch + entrySearch).hide();
                }
            }
        }
        this.resize();
    },
    fillByType: function($sampleType){
        // debugger;
        var type = $sampleType.val();
        var infoObj = this.sampleTypes[type];
        var wellGroup = $sampleType.data("group");
        var groupSearch = this.groupSearch(wellGroup);

        var wellIDs = this.getWellIDsFromGroupNum(wellGroup);

        $(groupSearch + "[data-entry]").show();

        for( info in infoObj ){
            if(info !== "label"){
                var watchSearch = this.watchSearch(info);
                var entrySearch = this.dataSearch("entry", info);
                var val = infoObj[info];

                if(val === "STD"){
                    var currentVal = $(watchSearch + groupSearch).val();
                    if(currentVal.startsWith("STD")){
                        val = currentVal;
                    }
                }

                // Update the entry values
                $(watchSearch + groupSearch).val(val);

                if(info === "plateID"){
                    $(groupSearch+this.calcSearch("plateID")).text(val);
                }

                // // Update the table
                this.fillWells(info, wellIDs, val);

                // Hide if a blank value specified
                if(!val){
                    $(groupSearch + entrySearch).hide();
                }
            }
        }
        this.resize();
    },

    calcNumAssignedWells: function(){
        var total = 0;
        $(".calcTotal").each((i,e)=>{
            if(e.value){
                total += parseInt(e.value);
            }
        });
        this.updateCalcFromVal("totalWellGroups", total);
        if(total>48){
            $(this.calcSearch("totalWellGroups")).css("color", "red");
            $("#numWarning").text("You have entered too many samples to fit on the plate");
            return(false);
        }
        else {
            $(this.calcSearch("totalWellGroups")).css("color", "black");
            $("#numWarning").text("");
            return(true);
        }
    },

    checkAndUpdateWells: function(){
        // debugger;
        var numNSB = $("#numNSB").val();
        var numSTD = $("#numSTD").val();
        var numBuffer = $("#numBuffer").val();
        var numQC = $("#numQC").val();
        var numSamples = $("#numSamples").val();

        if(this.calcNumAssignedWells()){
            this.updateEntryWells(numNSB, numSTD, numBuffer, numQC, numSamples);
        } else {
            $("#numWarning").text("Did not update; too many samples");
        }
        this.resize();
    },

    firstSampleGroup: 0,

    updateEntryWells: function(numNSB, numSTD, numBuffer, numQC, numSamples){
        // console.log(numNSB, numSTD, numBuffer, numQC, numSamples);
        for(var i = 0; i < this.wellGroups; i ++){
            var wellGroup = i+1;
            var groupSearch = this.groupSearch(wellGroup);
            var type;
            if(numNSB>0){
                type = "NSB";
                numNSB--;
            } else if(numSTD > 0){
                type = "STD";
                numSTD--;
            } else if(numBuffer > 0){
                type = "bufferCtrl";
                numBuffer--;
            } else if(numQC > 0){
                type = "QC";
                numQC--;
            } else if(numSamples > 0){
                type = "sample";
                numSamples--;
                if(this.firstSampleGroup === 0){
                    this.firstSampleGroup = wellGroup;
                }else if(wellGroup < this.firstSampleGroup){
                    this.firstSampleGroup = wellGroup;
                }
            } else {
                type = "";
            }
            $(".type" + groupSearch).val(type);
            var wellIDs = this.getWellIDsFromGroupNum(wellGroup);
            this.fillWells("type", wellIDs, type);
        }

        this.updateSTDVals();

        $(".type").each((i,e)=>{
            this.fillByType($(e));
        });

        this.resize();
    },

    updateSTDVals: function(){
        var stdVal = $("#largestSTD").val();
        stdVal = parseFloat(stdVal);
        var stdNum = 0;
        $(".type").each((i,e)=>{
            if($(e).val() === "STD"){
                stdNum++;
                var wellGroup = $(e).data("group");
                var wellGroupSearch = this.groupSearch(wellGroup);
                $(".plateID" + wellGroupSearch).val("STD " + stdNum);
                $(".stdPgPerWell" + wellGroupSearch).val(stdVal);
                
                var wellIDs = this.getWellIDsFromGroupNum(wellGroup);

                this.fillWells("plateID", wellIDs, "STD " + stdNum);
                this.fillWells("stdPgPerWell", wellIDs, stdVal);

                stdVal = stdVal / 2;
            }
        });
        this.resize();
    },

    copyMouseIDs: function(listName, $divForCopy, numCopies){
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";

        var fullList = $("#"+listName).val();
        var splitList = fullList.split(/[\r\n]+/);
        var addText;

        var newList = [];

        for (var i = 0; i < splitList.length /*&& i < 19*/; i++ ){
            mouseID = splitList[i];
            for(var j=0; j < numCopies; j++){
                newList.push(mouseID);
            }
            // $temp.text($temp.text() + addLine);
            // addLine = "\n";
            // totalText = mouseID + addLine + mouseID; // + addLine + mouseID + addLine + mouseID;
            // $temp.text($temp.text() + totalText);
        }
        $temp.text(newList.join("\n"));

        $temp.appendTo($divForCopy).select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    fillSampleIDsFromList: function($list){
        var fullList = $list.val();
        var splitList = fullList.split(/[\r\n]+/);
        // get the current number of samples in case we need to restore it
        var currentNumSamples = $("#numSamples").val();
        var listLength = splitList.length;

        $("#numSamples").val(listLength);

        // check if we're okay with the length of this list and other samples
        if(!this.calcNumAssignedWells()){
            // If not, post a warning, and restore the old value
            $("#numWarning").text("You've entered too many mice");
            $("#numSamples").val(currentNumSamples);
            return;
        }

        // Update the well types with this new number of samples
        // This will restart fresh
        this.checkAndUpdateWells();

        // Get the well group number for the first sample slot
        var firstSample = this.firstSampleGroup;

        var wellGroup, wellGroupSearch, mouseID, lastMouseID, lastWellGroupSearch, lastWellIDs, isLastDup = false, numDups = 1;
        for(var i = 0; i < listLength; i ++){
            // get the well group and associated well IDs
            wellGroup = firstSample + i;
            wellGroupSearch = this.groupSearch(wellGroup);
            var wellIDs = this.getWellIDsFromGroupNum(wellGroup);

            // Get this mouseID
            mouseID = splitList[i];
            var thisID = mouseID;
            
            // Assume the time is 0
            var time = 0;
            
            if(mouseID === lastMouseID){
                if(!isLastDup){ // this is a duplicate, but the last mouse wasn't a duplicate; i.e., first of label
                    // Add pre to the last plateID
                    // entry
                    $(".plateID" + lastWellGroupSearch).val(lastMouseID + " pre");
                    // card head title
                    $(lastWellGroupSearch+this.calcSearch("plateID")).text(lastMouseID + " pre");
                    // table wells
                    this.fillWells("plateID", lastWellIDs, lastMouseID + " pre");
                } 
                time = NaN; // don't make assumptions about time for the rest of the matches
                
                // Mark that this mouse was a duplicate
                isLastDup = true;
                numDups++; // add one to number of duplicates

                // don't make assumptions about plateID
                thisID = mouseID
            } else {
                isLastDup = false;
                if(numDups == 2){ // if there were only two duplicates, assume post at 5h
                    // Add post to the last plateID
                    // entry
                    $(".plateID" + lastWellGroupSearch).val(lastMouseID + " post");
                    // card head title
                    $(lastWellGroupSearch+this.calcSearch("plateID")).text(lastMouseID + " post");
                    // table wells
                    this.fillWells("plateID", lastWellIDs, lastMouseID + " post");
                    // Update the time
                    $(".time"+lastWellGroupSearch).val(5);
                    this.fillWells("time", lastWellIDs, 5);
                }
                numDups = 1 // reset
            }

            // update the plateID label
            $(".plateID"+wellGroupSearch).val(thisID);
            $(wellGroupSearch+this.calcSearch("plateID")).text(thisID);
            this.fillWells("plateID", wellIDs, thisID);
            
            // Update the mouseID
            $(".mouseID"+wellGroupSearch).val(mouseID);
            this.fillWells("mouseID", wellIDs, mouseID);

            // Update the time
            $(".time"+wellGroupSearch).val(time);
            this.fillWells("time", wellIDs, time);

            lastMouseID = mouseID;
            lastWellGroupSearch = wellGroupSearch;
            lastWellIDs = wellIDs;
        }

        // Check after last entry
        if(numDups == 2){ // if there were only two duplicates, assume post at 5h
            // Add post to the last plateID
            // entry
            $(".plateID" + lastWellGroupSearch).val(lastMouseID + " post");
            // card head title
            $(lastWellGroupSearch+this.calcSearch("plateID")).text(lastMouseID + " post");
            // table wells
            this.fillWells("plateID", lastWellIDs, lastMouseID + " post");
            // Update the time
            $(".time"+lastWellGroupSearch).val(5);
            this.fillWells("time", lastWellIDs, 5);
        }

        this.resize();
    },

    fillSampleIDsFromList_old: function($list){
        var fullList = $list.val();
        var splitList = fullList.split(/[\r\n]+/);
        // get the current number of samples in case we need to restore it
        var currentNumSamples = $("#numSamples").val();
        var listLength = splitList.length;

        $("#numSamples").val(listLength);

        // check if we're okay with the length of this list and other samples
        if(!this.calcNumAssignedWells()){
            // If not, post a warning, and restore the old value
            $("#numWarning").text("You've entered too many mice");
            $("#numSamples").val(currentNumSamples);
            return;
        }

        // Update the well types with this new number of samples
        // This will restart fresh
        this.checkAndUpdateWells();

        // Get the well group number for the first sample slot
        var firstSample = this.firstSampleGroup;

        var wellGroup, wellGroupSearch, mouseID, lastMouseID, lastWellGroupSearch, lastWellIDs, isLastDup = false;
        for(var i = 0; i < listLength; i ++){
            // get the well group and associated well IDs
            wellGroup = firstSample + i;
            wellGroupSearch = this.groupSearch(wellGroup);
            var wellIDs = this.getWellIDsFromGroupNum(wellGroup);

            // Get this mouseID
            mouseID = splitList[i];
            var thisID = mouseID;
            // Assume the time is 0
            var time = 0;
            // If this id is the same as the last one and the last one wasn't a duplicate of the previous id
            // This means that if there are 3 in a row, the first will be "pre", the second "post",
            // and the third without an appendix. But if there are four in a row, have pre, post, pre, post
            if(mouseID === lastMouseID && !isLastDup){
                // Add pre to the last plateID
                // entry
                $(".plateID" + lastWellGroupSearch).val(lastMouseID + " pre");
                // card head title
                $(lastWellGroupSearch+this.calcSearch("plateID")).text(lastMouseID + " pre");
                // table wells
                this.fillWells("plateID", lastWellIDs, lastMouseID + " pre");

                // add post to this plate ID
                thisID = mouseID + " post";
                // Set this time to 5
                time = 5;
                // Mark that this mouse was a duplicate
                isLastDup = true;
            } else {
                isLastDup = false;
            }

            // update the plateID label
            $(".plateID"+wellGroupSearch).val(thisID);
            $(wellGroupSearch+this.calcSearch("plateID")).text(thisID);
            this.fillWells("plateID", wellIDs, thisID);
            
            // Update the mouseID
            $(".mouseID"+wellGroupSearch).val(mouseID);
            this.fillWells("mouseID", wellIDs, mouseID);

            // Update the time
            $(".time"+wellGroupSearch).val(time);
            this.fillWells("time", wellIDs, time);

            lastMouseID = mouseID;
            lastWellGroupSearch = wellGroupSearch;
            lastWellIDs = wellIDs;
        }
        this.resize();
    },

    //#region upload net values
    
    rebuildTableFromStr: function(textStr, makeFirstRowHead, makeFirstColHead, $tableDiv){
        var rowArray = this.makeArrayFromStr(textStr);
        this.addedTable = textStr;
        if($tableDiv === undefined || !$tableDiv){
            this.createTable(
                rowArray, 
                makeFirstRowHead,
                makeFirstColHead
            );
        } else {
            this.createTable(
                rowArray, 
                makeFirstRowHead,
                makeFirstColHead,
                $tableDiv
            );
        }
        this.resize();
    },

    makeArrayFromStr: function(textStr){
        // var rows = textStr.split(rowSepStr);
        // var newRows = [];
        // for(row of rows){
        //     if(row.length){
        //         newRows.push(row.split(cellSepStr));
        //     }
        // }
        // return(newRows);

        // Papa Parse Library to help with reading. Deals with weird use cases in CSVs
        var results = Papa.parse(textStr, {
            skipEmptyLines: true
        });
        // console.log(results);
        return (results.data);
    },

    preview: function() {
        var fileUpload = document.getElementById("fileUpload");
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = (e) => {
                    var csvText = e.target.result;
                    var makeFirstColHead = false, makeFirstRowHead = false;
                    // if($("#makeColHead").is(":checked")){
                    //     makeFirstColHead = true
                    // }
                    // if($("#makeRowHead").is(":checked")){
                    //     makeFirstRowHead = true
                    // }
                    var $divForTable = $(".forTable")
                    this.rebuildTableFromStr(csvText, makeFirstRowHead, makeFirstColHead, $divForTable);
                }
                reader.readAsText(fileUpload.files[0]);
            } else {
                bootbox.alert("This browser does not support HTML5.");
            }
        } else {
            bootbox.alert("Please upload a valid CSV file.");
        }
    },

    netODvals: {},

    upload: function() {
        // Do table without col/row labels
        var tableStr = $("#pasteField").val();

        if(tableStr){
            this.netODvals = {};

            var plate = Papa.parse(tableStr, {
                skipEmptyLines: true,
                header: false
            });

            // This will be an array of 8 arrays (rows)
            // Each row array will be an array of 12 values (columns)
            var plateData = plate.data;

            var rowLetter;
            var colNum;
            plateData.forEach((row, i) =>{
                rowLetter = String.fromCharCode(i + "A".charCodeAt(0));
                row.forEach((col, i)=>{
                    colNum = i+1;
                    wellID = colNum + rowLetter;
                    this.netODvals[wellID] = col;
                })
            });
            this.fillNetODVals();

        } else {
            bootbox.alert("Please either make an HTML table after pasting from Excel or preview a CSV file first")
        }
    },

    fillNetODVals: function(){
        // clear exisiting netOD
        var $netODPlate = $(".plateImg"+this.plateSearch("netOD"));
        $netODPlate.find("td").text("");

        for(well in this.netODvals){
            $netODPlate.find(".well"+this.wellSearch(well)).text(this.netODvals[well]);
        }

        this.resize();
    },

    createTable: function(tableData, makeFirstRowHead = false, makeFirstColHead = false, $tableDiv) {
        // original from: https://stackoverflow.com/a/15164958
        var table = document.createElement('table');
        table.classList.add("table");
        var tableBody = document.createElement('tbody');

        if(makeFirstRowHead){
            var thead = document.createElement('thead');
        }

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

            if(makeFirstRowHead && rowNum == 0){
                thead.appendChild(row);
                table.appendChild(thead);
            } else {
                tableBody.appendChild(row);
            }
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


    //#endregion upload net values


    
};