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

        // Make the output tables
        this.makeOutputTableCards();
        this.addOptionsToCustom();

        //Uncomment to print parsedJson to console
        //console.log("init", parsedJson);
        
        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);


        //resize the content box when the window size changes
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event

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
        var output = { 
            widgetData: JSON.parse(widgetJsonString),
            solns: this.solns,
            numExtAdds: dynamicContent.numExtAdds,
            numIntAdds: dynamicContent.numIntAdds,
            selected: this.outputTables.custom.columns,
            unselected: this.outputTables.custom.unSelColumns
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
            solns: {internal: [1], external: [1,2]},
            selected: this.allOptions.slice(0, 3),
            unselected: this.allOptions.slice(3, this.allOptions.length)
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
        if(parsedJson.solns){
            for(type in parsedJson.solns){
                for(var i=0; i<parsedJson.solns[type].length; i++){
                    var solnNum = parsedJson.solns[type][i];
                    // console.log("adding " + type + " #" + solnNum);
                    this.addSoln(type, solnNum);
                }
            }
        }

        if(parsedJson.selected && parsedJson.unselected){
            this.resetOptionsList(parsedJson.unselected, parsedJson.selected)
        }


        // Keep this here to maintain compatibility with old version
        for (var i = 0; i < parsedJson.numExtAdds; i++) {
            this.addSoln("external", i+1);
        };

        for (var i=0; i < parsedJson.numIntAdds; i++) {
            this.addSoln("internal", i+1);
        }
    },

    /**
     * TO DO: edit this function to define how the HTML elements should be adjusted
     * based on the current mode.
     * 
     * Here, a subset of buttons are disabled when the widget is not being edited.
     * There may be other elements that should be shown/hidden based on the mode
     */
    adjustForMode: function (mode, parsedJson) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
            $("input[type='date']").removeClass(".hasDatePicker");
            $(".hideView").hide();
            $("#tableDiv").show();
            $(".outCardContainer").insertAfter($(".firstDiv"));
            $(".reqTextInfo").hide();
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
     * Run the supplied function if user presses OK
     * 
     * @param text The message to be displayed to the user. 
     * @param functionToCall Function to run if user pressed OK
     * 
     * If no text is provided, "Are you sure?" is used
     * Can supply a function with no parameters and no () after the name,
     * or an anonymous function using function(){} or ()=>{}
     * 
     * Nothing happens if cancel or "X" is pressed
     * 
     * Example:
     * my_widget_script.runIfConfirmed(
            "Do you want to run the function?", 
            ()=>{
                console.log("pretend delete function");
            }
        );
    */
    runIfConfirmed: function(text, functionToCall){
        var thisMessage = "Are you sure?";
        if(text){
            thisMessage = text;
        }
        bootbox.confirm({
            message: thisMessage,
            callback: (proceed)=>{
                if(proceed){
                    functionToCall()
                }
            }
        });
    },

    /**
     * Confirm with user
     * 
     * @param text The message to display to user
     * @param functionToCall Function to run, with the result (true/false) as a parameter
     * 
     * If no text is provided, "Do you wish to proceed?" is the default
     * Use an anonymous function, function(result){} or (result)=>{}. Then the function can use the result to decide what to do
     * 
     * Example:
     * my_widget_script.dialogConfirm(
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
    dialogConfirm: function(text, functionToCall){
        var thisMessage = "Do you want to proceed?";
        if(text){
            thisMessage = text;
        }
        bootbox.confirm({
            message: thisMessage,
            callback: (result)=>{
                functionToCall(result);
            }
        })
    },

    /**
     * Get user input for a function
     * 
     * @param prompt Text to provide to the user
     * @param functionToCall Function to run, with the user input as a parameter
     * 
     * If no text is provided, "Enter value:" is used as default
     * Use an anonymous function, function(result){} or (result)=>{}. Then the function can use the result to decide what to do
     * 
     * Example:
     * my_widget_script.runBasedOnInput(
            "Enter a number from 0-10", (result)=>{
                if(result <= 10 && result >= 0){
                    console.log("You entered: " + result);
                } else {
                    console.log("You did not enter an appropriate value");
                }
            }
        );
        */ 
    runBasedOnInput: function(prompt, functionToCall){
        var thisTitle = "Enter value:"
        if(prompt){
            thisTitle = prompt;
        }
        bootbox.prompt({
            title: thisTitle,
            callback: (result)=>{
                functionToCall(result);
            }
        });
    },

    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForTableLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        // $('.needForTableLab').each(function () { //find element with class "needForTableLab"
        //     //alert($(this).val());
        //     $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        // });

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
            this.resize();
        }
    },

    selectedTable: {id: "", name: ""},

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        this.isDateSupported();
        this.isTimeSupported();

        // Add date and time placeholders, and check format with change
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", (e)=> {
            this.checkDateFormat($(e.currentTarget));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", (e)=> {
            this.checkTimeFormat($(e.target));
        });

        // Autoadjust the size of textareas based on content in them
        $('textarea.autoAdjust').each((i,e)=> { // i is the index for each match, textArea is the object
            e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', (e)=> {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
            this.resize();
        });

        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

        // #region solution additions 
        $("#addToExternal").on("click", ()=> {
            this.addSolnClick("external");
        });

        $("#addToInternal").on("click", ()=> {
            this.addSolnClick("internal");
        });

        $("#removeLastExternal").on("click", ()=> {
            this.removeSoln("external");
        });

        $("#removeLastInternal").on("click", ()=> {
            this.removeSoln("internal");
        });
        // #endregion

        // #region output buttons
        $("[data-table]").not(".dontHide").hide();
        // $(".viewTableButtons").on("click", (e)=>{ // can't rely on this bubbling up if make it before the parent init, because it sets everything as readonly
        $(".showTable").on("click", (e)=>{
            if($(e.target).hasClass("showTable")){
                $("[data-table]").not(".dontHide").hide();
                var table = $(e.target).data("table");
                var tableName = $(e.target).data("tablename");
                var tableSearch = this.tableSearch(table);
                $(tableSearch).show();
                $(".card"+tableSearch).find(".card-body").removeClass("collapse");
                this.selectedTable = {id: table, name: tableName};
                $("#errorMsg").html("");
                this.resize();
            }
        });
        
        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $(".toCSV").on("click", (e)=>{
            var tableID = this.selectedTable.id;
            if(tableID){
                var tableName = this.selectedTable.name;
                var dateToday = luxon.DateTime.now().toISODate(); // Luxon has to be added
                var fileName = "table_" + tableName + "_" + dateToday;
                var $errorMsg = $("#errorMsg");
                // console.log("fileName", fileName, "table", tableID, "errorMsg", $errorMsg);
                this.toCSVFuncs(fileName, tableID, $errorMsg);
            } else {
                $("#errorMsg").html("Please select a table first");
                this.resize();
            }
        });

        $(".copyData").on("click", (e)=>{
            var tableID = this.selectedTable.id;
            if(tableID){
                // Get the data-table text string to add to the query to find the table
                var tableSearch = this.tableSearch(tableID);
                // Find the element that tells whether or not to copy the table
                var $copyHead = $("#copyHead");
                var $transpose = $("#transpose");
                var $tableToCopy = $("#"+tableID);
                var $tableDiv = $tableToCopy.parent();
                var $errorMsg = $("#errorMsg");
                var $divForCopy = $("#forCopy");
    
                this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose);
            } else {
                $("#errorMsg").html("Please select a table first");
                this.resize();
            }
        });
        // #endregion output buttons

        // #region calculate for output based on user entry

        // Generic update when any part of the form has user input
        $("#the_form").on("input", (e)=>{
            this.updateCalcFromEl(e.target);
        });

        //Show/hide elements based on sex
        $("#sex").on("change", ()=> { //when sex is changed
            this.checkSexAndGonadStatus();
        });

        //Show/hide elements based on gonad status
        $("#gonadStatus").on("change", ()=> { //when gonad status is changed
            this.checkSexAndGonadStatus();
            this.calcSurgeryDate();
        });

        // When surgery data changes, recalculate for output
        $("#surgeryDate").on("change", ()=> {
            this.calcSurgeryDate();
        })

        // When the steriod implant box is checked, show or hide related elements
        $("#implantBox").on("change", (e)=> {
            this.showWithCheck($(e.target), $("[data-implant]"));
        });

        // Recalculate for changes in implant-related elements
        $(".implantCalc").on("change", ()=> {
            my_widget_script.calcImplant();
        });      
        
        // Change treatment based on selections
        $(".treatmentCalc").on("change", ()=> {
            my_widget_script.calcTreatment();
        });

        // This changes the calculated cycle stage
        // Triggered by sex, gonad status, and cycle-related changes
        $(".cycleCalc").on("change", ()=> {
            my_widget_script.calcCycleStage();
        });

        // Changes with sex, body mass, and repro tract mass
        $(".massCalc").on("input", ()=> {
            my_widget_script.calcUterineMass();
            my_widget_script.calcUterineMass_perBodyMass();
            my_widget_script.calcReproTractMass_perBodyMass();
        });

        // Date of birth, age as day, and recording date
        $(".ageCalc").on("input", ()=> {
            my_widget_script.calcAgeInDays();
        });

        // Update because it's a checkbox
        $("#savedPit").on("change", ()=> {
            my_widget_script.calcSavedPit();
        });
        $("#savedBlood").on("change", ()=> {
            my_widget_script.calcSavedBlood();
        });

        // Calc hours after lights on - change with time and daylight savings
        $(".timeCalc").on("input", ()=> {
            my_widget_script.calcHoursPostLightsOn();
        });
        // #endregion


        // #region initial calculations
        // Run this first incase calcValues needs to overrule
        $("input, select, textarea").each((i,e)=>{
            if($(e).attr("type")!= "button"){
                this.updateCalcFromEl(e);   
            }
        });
        this.calcValues();

        // if ($("#implantBox").is(":checked")) {
        //     console.log("implant shown");
        //     $(".implant").show() //show implant class elements
        // } else {
        //     console.log("implant hidden");
        //     $(".implant").hide()
        // };

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
        // var ids = [];
        $("input, select, textarea").each((i,e)=>{
            // ids.push(e.id);
            var thisName = $(e).attr("name");
            if(!thisName){
                console.log("There is no name attribute for: ", e.id);
            } else {
                var hasUpper = /[A-Z]/.test(thisName);
                if(hasUpper){
                    console.log("The name contains an uppercase letter for: ", e.id);
                }
            }
        });
        // var idsText = ids.join("\n");
        // console.log(idsText);
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        numExtAdds = $("#externalAdditionsTable").find("tbody tr").length;
        numIntAdds = $("#internalAdditionsTable").find("tbody tr").length;
        var dynamicContent = {
            numExtAdds: numExtAdds,
            numIntAdds: numIntAdds
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
     data_valid_form: function ($errorMsg = $("#errorMsg")) {
        var valid = true; //begin with a valid value of true
        var fail_log = $("<div></div>").append("Missing values for:");
        var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('.needForTable').each((i, e)=> {
            if (!$(e).val()) { //if there is not a value for this input
                // valid = false; //change valid to false
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


    // #region check user input and calculate output and form changes

    updateCalcFromEl: function (el) {
        // Get the element id
        var calc = el.id;
        // Get the element value
        var val = el.value;
        // Get the data-calc search string to match id
        var calcSearch = this.calcSearch(calc);

        // console.log("calc: " + calc + "; val: " + val);

        // Update any element that matches the calc search with the value
        $(calcSearch).html(val);
        this.resize();
    },

    updateCalcFromVal: function(calc, val){
        var calcSearch = this.calcSearch(calc);
        $(calcSearch).text(val);
        this.resize();
    },

    resizeTextareaInEl: function($el){
        $el.find("textarea.autoAdjust").each((i,e)=> {
            if(! $(e).is(":hidden")) {
                e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
            } 
        });
    },

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
            this.resizeTextareaInEl($toToggle);
        } else {
            $toToggle.hide();
        }
        my_widget_script.resize();
    },
    
    sexGonads: "",

    // Change which form elements are visible based on sex and gonad status
    checkSexAndGonadStatus: function () {
        var sex = $("#sex").val();
        var gonads = $("#gonadStatus").val();
        
        var sexSearch = this.sexSearch(sex);
        var gonadsSearch = this.gonadsSearch(gonads);

        this.sexGonads = sex+"-"+gonads;

        $("[data-sex]").hide(); // hide everything with a data-sex attribute
        $("[data-gonads]").hide(); // hide everything with a data-gonads attribute

        // If there's a sex value, show all elements whose data-sex matches the sex value
        // As long as there's not a data-gonads attribute
        if(sex){
            $(sexSearch).not("[data-gonads]").show().each((i,e)=>{
                this.resizeTextareaInEl($(e));
            });
        }

        // If there's a gonads value, show all elements whose data-gonads
        // matches the gonads value, as long as there's not a data-sex attribute
        if(gonads){
            $(gonadsSearch).not("[data-sex]").show().each((i,e)=>{
                this.resizeTextareaInEl($(e));
            });;
        }

        // If there's a sex and gonads value, show elements that match both
        if(sex && gonads){
            $(sexSearch+gonadsSearch).show().each((i,e)=>{
                this.resizeTextareaInEl($(e));
            });;
        }

        //resize the container
        this.resize();
    },

    calcTreatment: function(){
        var genTreatment="";
        var treatment = "";

        var projType = $("#projectType").val();

        // hide all elements with a data-proj attribute
        $("[data-proj]").hide();

        if(projType){ // if there's a projType
            var projSearch = this.projSearch(projType);
            $(projSearch).show(); // Show the corresponding field
            var treatment = $(projSearch).val(); // get the value
            if(treatment === "DHT"){ // if treatment is DHT
                genTreatment = "PNA"; // gen treatment is PNA
            } else if(treatment === "ALPS"){ // ALPS is general treatment of stress
                genTreatment = "stress"
            } else if( // Multiple possibilities for control general treatment
                treatment === "CON" ||
                treatment === "CON_main" ||
                treatment === "VEH"
            ){
                genTreatment = "control"
            }
        }

        if(!genTreatment){genTreatment = "NA"} // TO-DO: may be able to do this later when copying
        if(!treatment){treatment = "NA"}

        this.updateCalcFromVal("genTreatment", genTreatment);
        this.updateCalcFromVal("treatment", treatment);

        //resize the container
        this.resize();
    },

    calcCycleStage: function () {
        var stage, comment;
        if (this.sexGonads === "female-intact") { //only for intact females
            stage = $("#cycleStage").val();
            comment = $("#stageComment").val();
        }
        if(!stage){stage = "NA"}
        if(!comment){comment = "NA"}
        this.updateCalcFromVal("cycleStage", stage);
        this.updateCalcFromVal("stageComment", comment);

        //resize the container
        this.resize();
    },

    calcUterineMass: function () {
        var uterineMass;
        if ($("#sex").val() === "female") {
            var uterineMass = $("#reproTractMass").val();
        }
        if (!(isFinite(uterineMass) && uterineMass)) {
            uterineMass = "NA";
        }
        this.updateCalcFromVal("uterineMass", uterineMass);

        //resize the container
        this.resize();
    },

    calcUterineMass_perBodyMass: function () {
        var uterine_mg_per_g;
        if ($("#sex").val() === "female") {
            var uterine_mg_per_g = $("#reproTractMass").val() / $("#bodyMass").val();
        }

        if (isFinite(uterine_mg_per_g) && uterine_mg_per_g) {
            uterine_mg_per_g = uterine_mg_per_g.toFixed(4);
        } else {
            uterine_mg_per_g = "NA";
        }

        this.updateCalcFromVal("uterine_mg_per_g", uterine_mg_per_g);

        //resize the container
        this.resize();
    },

    calcReproTractMass_perBodyMass: function () {
        var reprotract_mg_per_g = $("#reproTractMass").val() / $("#bodyMass").val();
        if(isFinite(reprotract_mg_per_g) && reprotract_mg_per_g){
            reprotract_mg_per_g = reprotract_mg_per_g.toFixed(4);
        } else {
            reprotract_mg_per_g = "NA";
        }
        this.updateCalcFromVal("reproTract_mg_per_g", reprotract_mg_per_g);

        // repro tract as grams
        var reproTractMass = $("#reproTractMass").val();
        var reproTractMass_g = reproTractMass / 1000;
        if(!(isFinite(reproTractMass_g) && reproTractMass)){
            reproTractMass_g = "NA";
        }
        this.updateCalcFromVal("reproTractMass_g", reproTractMass_g);

        //resize the container
        this.resize();
    },

    getPND: function (dateInputVal, DOBisDay) {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var textOutput;
        var DOB_val = $("#dateOfBirth").val()
        if(DOB_val){
            if(dateInputVal){
                var compDate = luxon.DateTime.fromISO(dateInputVal).startOf("day");
                var DOB = luxon.DateTime.fromISO(DOB_val).startOf("day").minus({ days: DOBisDay });
                var pnd = compDate.diff(DOB, "days").as("day");
                // console.log(pnd);
                textOutput = pnd;
            } else {
                textOutput = "[Enter Recording Date]";
            }
        } else {
            textOutput = "[Enter DOB]";
        }
        
        return textOutput;
    },

    calcAgeInDays: function () {
        var DOBisDay = parseInt($("#DOB_equals").val());
        var recordingDate = $("#recordingDate").val()

        var ageInDays = my_widget_script.getPND(recordingDate, DOBisDay);

        this.updateCalcFromVal("ageInDays", ageInDays);
        // console.log(ageInDays);

        var ageGroup="";
        if(ageInDays>=50){
            ageGroup = "adult";
        }else if(ageInDays>=18 && ageInDays <=21){
            ageGroup = "3wk";
        }
        this.updateCalcFromVal("ageGroup", ageGroup);

        //resize the container
        this.resize();
    },

    calcSavedPit: function () {
        var savedPit = "FALSE";
        var savedPit_yn = "N"
        if ($("#savedPit").is(":checked")) {
            savedPit = "TRUE";
            savedPit_yn = "Y"
        }
        this.updateCalcFromVal("savedPit", savedPit);
        this.updateCalcFromVal("savedPit_yn", savedPit_yn);

        //resize the container
        this.resize();
    },
    
    calcSavedBlood: function () {
        var savedBlood = "FALSE";
        var savedBlood_yn = "N"
        if ($("#savedBlood").is(":checked")) {
            savedBlood = "TRUE";
            savedBlood_yn = "Y"
        }
        this.updateCalcFromVal("savedBlood", savedBlood);
        this.updateCalcFromVal("savedBlood_yn", savedBlood_yn);

        //resize the container
        this.resize();
    },

    calcHoursPostLightsOn: function () {
        var sacTime_dur = luxon.Duration.fromISOTime($("#sacTime").val());
        var sacHrs;
        
        if ($("#daylightSavings").val() === "Y") { //if daylight savings time
            var lights_on = "04:00";
        } else if ($("#daylightSavings").val() === "N") {
            var lights_on = "03:00";
        } else {
            sacHrs = "Select daylight savings";
            this.updateCalcFromVal("sacHrs", sacHrs);
            return
        }
        var lights_on_dur = luxon.Duration.fromISOTime(lights_on);
        sacHrs = sacTime_dur.minus(lights_on_dur).as("hour");

        if (!isFinite(sacHrs)) {
            sacHrs = "NA";
        } else {
            sacHrs = sacHrs.toFixed(2); //two decimal points
        }
        this.updateCalcFromVal("sacHrs", sacHrs);

        //resize the container
        this.resize();
    },

    calcSurgeryDate: function () {
        var surgeryDate = "NA"; // default is NA
        if($("#gonadStatus").val()==="gdx") { // only change if had gonadectomy
            surgeryDateVal = $("#surgeryDate").val(); // get the value from the date field
            if(surgeryDateVal){ // if it's a value, update surgery date
                surgeryDate = surgeryDateVal
            }
        }
        this.updateCalcFromVal("surgeryDate", surgeryDate);

        //resize the container
        this.resize();
    },

    calcImplant: function () {
        var implant = "FALSE", type = "NA", date = "NA", comment = "NA";
        if ($("#implantBox").is(":checked")) {
            implant = "TRUE";
            typeVal = $("#implantType").val();
            dateVal = $("#implantDate").val();
            commentVal = $("#implantComment").val();
            if(typeVal){type = typeVal}
            if(dateVal){date = dateVal}
            if(commentVal){comment = commentVal}
        }
        this.updateCalcFromVal("implant", implant);
        this.updateCalcFromVal("implantType", type);
        this.updateCalcFromVal("implantDate", date);
        this.updateCalcFromVal("implantComment", comment);

        //resize the container
        this.resize();        
    },

    checkTableForBlanks: function () {
        $(".outTable tr").each((i,e)=> { //for each row
            $("td", e).each((i,e)=> { //for each cell
                if(!($(e).data("calc") === "NA")){
                    var value = $(e).text(); //get the value of the text
                    if (value === "" || value === "NaN" || value === "___" || value === "Select daylight saving") { //if blank or NaN
                        $(e).text("NA"); //make NA
                    }
                }
            })
        });

        //resize the container
        this.resize();
    },

    calcValues: function(){
        // Check sex and gonad status
        this.checkSexAndGonadStatus();
        
        // treatment
        this.calcTreatment();
    
        // Cycle stage
        this.calcCycleStage();
    
        // uterine mass
        this.calcUterineMass();
    
        // uterine mass per body mass
        this.calcUterineMass_perBodyMass();
    
        // repro tract mass per body mass
        this.calcReproTractMass_perBodyMass();
    
        // Age in days
        this.calcAgeInDays();
    
        // saved pituitary
        this.calcSavedPit();

        // blood
        this.calcSavedBlood();
    
        // Hours since lights on
        this.calcHoursPostLightsOn();
    
        // Surgery date
        this.calcSurgeryDate();
    
        // Implant calculations
        this.calcImplant();

        this.showWithCheck($("#implantBox"), $("[data-implant]"));
        
        // Check for blanks
        this.checkTableForBlanks();

        this.resize();
    },
    // #endregion check user input

    // #region data output

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
        var data_valid = this.data_valid_form($errorMsg);

        if (data_valid) {
            this.checkTableForBlanks();
            this.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
        this.resize();
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
    **/
    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose){
        var data_valid = this.data_valid_form($errorMsg);
        var copyHead = false, transpose = false;

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        }

        if ($transpose.is(":checked")) {
            transpose = true;
        }

        this.checkTableForBlanks();

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            this.resize(); //resize
            this.copyTable($tableToCopy, copyHead, $divForCopy, transpose); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copy attempted</span><br/><span style='color:grey;'>If it didn't work, please press copy again</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
        this.resize();
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

    // #endregion output data

    /**
     * This takes the value of the input for the $elToWatch and then updates the text of 
     * $elToUpdate to match whenever watchValue is called
     * @param {*} $elToWatch - jQuery object with the input element whose value will be used to update
     * @param {*} $elToUpdate - jQuery object of the element whose text will be updated based on the element to watch
     */
    watchValue: function ($elToWatch, $elToUpdate) {
        // var value = $elToWatch.val();
        // $elToUpdate.text(value);
        // this.resize();
    },

    // #region data searches
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

    // Anywhere in list
    sexSearch: function(sex){
        var sexSearch = "[data-sex~='" + sex + "']";
        return sexSearch;
    },

    gonadsSearch: function(gonadsStatus){
        var gonadsSearch = this.dataSearch("gonads", gonadsStatus);
        return gonadsSearch;
    },

    projSearch: function(proj){
        var projSearch = this.dataSearch("proj", proj);
        return projSearch;
    },
    // #endregion data searches

    
    checkInArray: function (searchVal, array){
        var inArray = $.inArray(searchVal, array) !== -1;
        return inArray;
    },

    solns: {
        internal: [],
        external: []
    },

    addSolnClick: function (basename) { // internal or external
        var solnNum = 1;
        var theseSolnNums = this.solns[basename];
        var numSolns = theseSolnNums.length;
        if(numSolns > 0){
            var lastSoln = theseSolnNums[numSolns - 1];
            solnNum = lastSoln + 1;
        }
        var inArray = this.checkInArray(solnNum, theseSolnNums);
        if(! inArray){
            this.addSoln(basename, solnNum);
        }
    },

    addSoln: function(basename, solnNum){
        this.solns[basename].push(solnNum);

        var $solnDiv, $solnTable;
        $solnDiv = $("#" + basename + "AdditionsDiv");
        $solnTable = $("#" + basename + "Additions");

        var additionID = basename + "_addition_" + solnNum;
        var additionDateID = basename + "_additiondate_" + solnNum;

        var additionLabelHTML = '<div class="mt-2">Addition ' + solnNum + ' Name</div>';
        var additionalDateLabelHTML = '<div class="mt-2">Addition ' + solnNum + ' Date</div>';

        $solnDiv.append(
            $('<div></div>', {
                class: "addition",
                "data-soln": basename,
                "data-solnnum": solnNum
            }).append(
                additionLabelHTML
            ).append(
                $('<div></div>').append(
                    $('<input></input>', {
                        id: additionID,
                        name: additionID,
                        class: "fullWidth"
                    })
                )
            ).append(
                additionalDateLabelHTML
            ).append(
                $('<div></div>').append(
                    $('<input></input>', {
                        id: additionDateID,
                        name: additionDateID,
                        class: "fullWidth",
                        type: "date",
                        "placeholder": "YYYY-MM-DD"
                    }).each((i,e)=> {
                        this.checkDateFormat($(e));
                    }).on("input", (e)=> {
                        this.checkDateFormat($(e.currentTarget));
                    })
                )
            )
        );

        $solnTable.find("tbody").append(
            $('<tr></tr>', {
                "data-soln": basename,
                "data-solnnum": solnNum
            }).append(
                $('<td></td>', {
                    "data-calc": additionID
                })
            ).append(
                $('<td></td>', {
                    "data-calc": additionDateID
                })
            )
        );

        this.resize();
    },

    removeSoln: function (basename) { // internal or external
        var $solnDiv, $solnTable;
        $solnDiv = $("#" + basename + "AdditionsDiv");
        $solnTable = $("#" + basename + "AdditionsTable");

        // This could ultimately be updated to delete specific solutions
        // rather than only the last one
        // Add is written to allow this, just have to add different delete buttons
        // And supply the solution number here (and use this.solns[basename].indexOf(solnNum) to find index, 
        // if > -1 -> splice)
        if(this.solns[basename].length > 0){
            var lastSolnIndex = this.solns[basename].length - 1;
            var lastSolnNum = this.solns[basename][lastSolnIndex];
            
            this.solns[basename].splice(lastSolnIndex, 1);
            var search = this.dataSearch("soln", basename) + this.dataSearch("solnnum", lastSolnNum);
            $(search).remove();
        }


    },

    // #region output tables  
    //****************
    // OUTPUT TABLES
    // ***************

    // object here with the infromation about each of the different tables
    outputTables: {
        labGoogleSheet: {
            id: "labGoogleSheet",
            label: "Lab Google Sheet",
            saveName: "fullLabSlicing",
            columns: [
                "mouseID",
                "cageNum",
                "who",
                "recordingDate",
                "dateOfBirth",
                "ageInDays",
                "sacTime",
                "daylightSavings",
                "sacHrs",
                "strain",
                "zygosity",
                "sex",
                "bodyMass",
                "reproTractMass",
                "reproTract_mg_per_g",
                "gonadStatus",
                "cycleStage",
                "stageComment",
                "surgeryDate",
                "implant",
                "implantType",
                "implantDate",
                "implantComment",
                "tubeLabel",
                "savedPit",
                "genTreatment",
                "treatment",
                "glucose",
                "nucleus",
                "orientation",
                "sliceQual",
                "sliceComment",
                "fluorQual",
                "fluorComment",
                "externalSoln",
                "externalDate",
                "internalSoln",
                "internalDate",
                "pipette",
                "pipetteLot"
            ],
            num: 1
        },
        mouseInfo: {
            id: "mouseInfo",
            label: "Mouse Information",
            saveName: "mouseInfo",
            columns: [
                "mouseID",
                "cageNum",
                "generation",
                "damID",
                "sireID",
                "genTreatment",
                "treatment",
                "dateOfBirth",
                "DOB_equals",
                "sex",
                "zygosity",
                "strain",
                "gonadStatus",
                "surgeryDate",
                "implantType",
                "implantDate"
            ],
            num: 2
        },
        slicingInfo: {
            id: "slicingInfo",
            label: "Slicing Information",
            saveName: "slicingInfo",
            columns: [
                "mouseID",
                "recordingDate",
                "ageInDays",
                "savedPit",
                "daylightSavings",
                "sacTime",
                "sacHrs",
                "who",
                "cycleStage",
                "bodyMass",
                "reproTractMass"
            ],
            num: 3
        },
        slicingTiming: {
            id: "slicingTiming",
            label: "Slicing Timing",
            saveName: "slicingTiming",
            columns: [
                "mouseID",
                "daylightSavings",
                "sacTime",
                "sacHrs"
            ],
            num: 4
        },
        KNDyPNA_extracellular: {
            id: "KNDyPNA_extracellular",
            label: "KNDy PNA Extracell",
            saveName: "KNDyPNA_extracellular",
            columns: [
                "mouseID",
                "cageNum",
                "genTreatment",
                "treatment",
                "cycleStage",
                "bodyMass",
                "uterineMass",
                "uterine_mg_per_g",
                "dateOfBirth",
                "recordingDate",
                "ageInDays",
                "savedPit",
                "daylightSavings",
                "sacTime",
                "sacHrs",
                "who",
                "zygosity"
            ],
            num: 5
        },
        jennPNA: {
            id: "jennPNA",
            label: "Jenn PNA Project",
            saveName: "JennPNA",
            columnNames: [
                "CellID",
                "mouseID",
                "Exclude reason",
                "Cage",
                "TX",
                "Group",
                "DOB",
                "Age",
                "RecordingAge",
                "RecordingDay",
                "Mass (g)",
                "Ut. mass (g)",
                "Ut. mass (mg)",
                "Cycle Stage",
                "Sac time",
                "Sac hour",
                "Pit",
                "Blood",
                "Notes"
            ],
            columns: [
                "NA",
                "mouseID",
                "NA",
                "cageNum",
                "treatment",
                "genTreatment",
                "dateOfBirth",
                "ageGroup",
                "ageInDays",
                "recordingDate",
                "bodyMass",
                "reproTractMass_g",
                "reproTractMass",
                "cycleStage",
                "sacTime",
                "sacHrs",
                "savedPit_yn",
                "savedBlood_yn",
                "NA"
            ],
            num: 6
        },
        externalAdditions: {
            id: "externalAdditions",
            label: "External Additions",
            saveName: "externalAdditions",
            columnNames: [
                "Addition Name",
                "Addition Date"
            ],
            columns: [],
            num: 7
        },
        internalAdditions: {
            id: "internalAdditions",
            label: "Internal Additions",
            saveName: "internalAdditions",
            columnNames: [
                "Addition Name",
                "Addition Date"
            ],
            columns: [],
            num: 8
        },
        custom: {
            id: "custom",
            label: "Custom",
            saveName: "custom",
            columns: [],
            num: 9
        }

    },

    // Make everything for each table
    makeOutputTableCards: function(){
        for(table in this.outputTables){
            var tableObj = this.outputTables[table];
            this.makeViewButtons(tableObj);
            this.makeOutputTableCard(tableObj);
        }
    },

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        this.resizeTextareaInEl($cardHead.next());
        // $cardHead.next().find("textarea.autoAdjust").each((i,e)=> {
        //     if(! $(e).is(":hidden")) {
        //         e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
        //     } 
        // });
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

    makeOutputTableCard: function(tableObj){
        // console.log("in makeOutputTable card, name is", tableObj.id, "object is", tableObj);

        var $div = $(".outCardContainer");
        
        // Card head
        var cardHead = tableObj.label;

        // Card body
        var $body = $("<div></div>");
        // var outputButtons = this.makeOuputButtons(tableObj); 
        var table = this.makeOutputTable(tableObj);

        // $body.append(outputButtons).append(table);
        $body.append(table);

        this.makeCard($div, cardHead, $body);

        // Add data tag to the card that was just made
        $div.find(".card").last().attr("data-table", tableObj.id)
    },

    makeViewButtons: function(tableObj){
        var numForTags = tableObj.num;
        var tableID = tableObj.id;
        var tableName = tableObj.saveName;
        var tableLabel = tableObj.label;

        var $buttonsDiv = $(".viewTableButtons");
        if(numForTags === 1){
            $buttonsDiv.html("");
        }
        $buttonsDiv.append(
            $("<div></div>", {
                "class": "col-12 col-sm-6 col-md-4, col-lg-3",
            }).append(
                $("<input></input>", {
                    "type": "button",
                    "id": "showTable" + numForTags,
                    "name": "showtable" + numForTags,
                    "class": "showTable fullWidth dontHide",
                    "data-table": tableID,
                    "data-tablename": tableName,
                    "value": tableLabel
                })
            )
        )
    },

    makeOutputTable: function(tableObj){
        var columnNames = tableObj.columns;
        if(tableObj.hasOwnProperty("columnNames")){
            columnNames = tableObj.columnNames;
        }
        var $div = this.makeCalcTable(tableObj.id, columnNames, tableObj.columns);
        return $div;
    },

    makeCalcTable: function(tableID, colNames, colCalcs){
        var $table = $("<div></div>", {"class": "container calcTableContainer"}).append(
            $("<div></div>", {"class": "row"}).append(
                $("<div></div>", {"class": "col-12 table-responsive xsTableDiv"}).append(
                    $("<table></table>", {
                        "id": tableID,
                        "class": "table outTable"
                    }).append(
                        $("<thead></thead>")
                    ).append(
                        $("<tbody></tbody>")
                    )
                )
            )
        );

        var headRow = document.createElement("tr");
        var bodyRow = document.createElement("tr");
        for(var i=0; i<colNames.length; i++){
            var colName = colNames[i];
            // Make a new cell
            var headCell = document.createElement("th");
            // // Add the label to the headCell
            headCell.append(colName); // append rather than appendChild to avoid creating as textNode
            // Add the headCell to the headRow
            headRow.appendChild(headCell);
            
            if(colCalcs.length>0){
                var colCalc = colCalcs[i];
                // Make a new cell
                var bodyCell = document.createElement("td");
                // Add the data attribute
                bodyCell.dataset.calc = colCalc;
                // Add the bodyCell to the bodyRow
                bodyRow.appendChild(bodyCell);
            }
        }

        $table.find("thead").append(headRow);
        if(colCalcs.length>0){
            $table.find("tbody").append(bodyRow);
        }

        return $table;
    },

    // #region custom  
    allOptions: [
        "mouseID",
        "cageNum",
        "generation",
        "damID",
        "sireID",
        "who",
        "recordingDate",
        "dateOfBirth",
        "ageInDays",
        "sacTime",
        "daylightSavings",
        "sacHrs",
        "strain",
        "zygosity",
        "sex",
        "bodyMass",
        "reproTractMass",
        "reproTract_mg_per_g",
        "gonadStatus",
        "cycleStage",
        "stageComment",
        "surgeryDate",
        "implant",
        "implantType",
        "implantDate",
        "implantComment",
        "tubeLabel",
        "savedPit",
        "genTreatment",
        "treatment",
        "glucose",
        "nucleus",
        "orientation",
        "sliceQual",
        "sliceComment",
        "fluorQual",
        "fluorComment",
        "externalSoln",
        "externalDate",
        "internalSoln",
        "internalDate",
        "pipette",
        "pipetteLot"
    ],

    sortableOptions: function () {
        $('.sortable[sortable="true"]').sortable({
            connectWith:".sortable",
            placeholder: "ui-state-highlight",
            update: ()=> {
                this.getSelectedOrder();
            }
        });
    },
    
    getSelectedOrder: function(){
        // Options within the selected list sent to custom columns as an array
        this.outputTables.custom.columns = $("#selectedOptions").sortable("toArray");
        this.outputTables.custom.unSelColumns = $("#unselected").sortable("toArray");
        // Update the table with this new list
        this.updateCustomTable();
    },

    addOptionsToCustom: function(){
        $cardBody = $(".card"+this.tableSearch("custom")).find(".card-body");
        $cardBody.append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-12"
                }).append(
                    $("<input></input>", {
                        "name": "resetoptions",
                        "id": "resetOptions",
                        "value": "Reset",
                        "type": "button",
                        "class": "fullWidth"
                    }).on("click", (e)=>{
                        this.resetOptionsList()
                    })
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    "Drag and drop variables to add to table"
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-6"
                }).append(
                    "<h3>Selected:</h3>"
                ).append(
                    $("<ul></ul>", {
                        "id": "selectedOptions",
                        "sortable": "true",
                        "class": "sortable"
                    }).append(
                        "&nbsp;" // lets you drag into empty space
                    )
                )
            ).append(
                $("<div></div>", {
                    "class": "col-6"
                }).append(
                    "<h3>Unselected:</h3>"
                ).append(
                    $("<ul></ul>", {
                        "id": "unselected",
                        "sortable": "true",
                        "class": "sortable"
                    }).append(
                        "&nbsp;" // lets you drag into empty space
                    )
                )
            )
        )

        this.sortableOptions(); // This has to come first to initialize
        this.resetOptionsList();
    },

    updateCustomTable: function(){
        // Get the column names 
        var columns = this.outputTables.custom.columns;
        var $customCard = $(".card"+this.tableSearch("custom"))
        $customCard.find(".calcTableContainer").remove();
        var $table = this.makeCalcTable("custom", columns, columns);
        $table.prependTo($customCard.find(".card-body"));

        $("input, select, textarea").each((i,e)=>{
            if($(e).attr("type")!= "button"){
                this.updateCalcFromEl(e);   
            }
        });
        this.calcValues();
    },

    resetOptionsList: function(unselected = this.allOptions, selected){
        // console.log("selected",selected, "unselected", unselected);
        // Reset with options all sent to unselected
        $("#selectedOptions").html("&nbsp;");
        $("#unselected").html("&nbsp;")
        for(var i=0; i<unselected.length; i++){
            var option = unselected[i]
            $("#unselected").append(
                $("<li></li>", {
                    "id": option
                }).append(
                    option
                )
            );
        }
        if(selected){
            for(var i=0; i<selected.length; i++){
            var option = selected[i]
            $("#selectedOptions").append(
                $("<li></li>", {
                    "id": option
                }).append(
                    option
                )
            );
        }
        }
        this.getSelectedOrder();
    },
    // #endregion custom  
    // #endregion output tables
};