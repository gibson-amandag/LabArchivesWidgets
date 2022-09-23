my_widget_script =
{
    numWashes: 0,

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

        // Set wash times equal to what was stored in to_json - should be the same, but just in case
        // Default to 5
        var numWashes = 5
        if(parsedJson.numWashes){
            numWashes = parsedJson.numWashes;
        }

        $("#numWashes").val(numWashes);

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
            abNums: this.abNums,
            numWashes: this.numWashes
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
        if(parsedJson.abNums){
            // console.log("initDynamic: abNums", parsedJson.abNums);
            for(var i = 0; i < parsedJson.abNums.length; i++){
                var abNum = parsedJson.abNums[i];
                this.addAntibodies(abNum);
            }
        }
        // Default to 5
        var numWashes = 5;
        if(parsedJson.numWashes){
            numWashes = parsedJson.numWashes;
        }
        this.updateWashTracking(numWashes);
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
        this.isDateSupported();
        this.isTimeSupported();
        
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", (e)=> {
            this.checkDateFormat($(e.currentTarget));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", (e)=> {
            this.checkTimeFormat($(e.target));
        });
        
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol4').addClass("col-6 col-md-4 col-lg-3 text-right");
        // $('.myLeftCol5').addClass("col-6 col-md-4 col-lg-3 text-right");
        $('.myLeftCol').addClass("col-4 col-sm-5 col-md-4 col-lg-5 text-right");
        $('.myLeftCol2').addClass("col-6 col-sm-5 col-md-4 col-lg-5 text-right");
        $('.myLeftCol3').addClass("col-2 col-lg-1 text-right");

        $('textarea.autoAdjust').each((i,e)=> { // i is the index for each match, textArea is the object
            e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', (e)=> {
            e.target.style.height = 'auto';
            e.target.style.height = (e.target.scrollHeight) + 'px';
            this.resize();
        });

        $(".watchTime").each((i,e)=> {
            var $elToWatch = $(e);
            var $elToFill = $(e).parent().next().find($(".fillTime"));
            // console.log($elToFill);

            this.watchTime($elToWatch, $elToFill);
        }).on("input", (e)=> {
            var $elToWatch = $(e.currentTarget);
            var $elToFill = $(e.currentTarget).parent().next().find($(".fillTime"));
            // console.log($elToFill);

            my_widget_script.watchTime($elToWatch, $elToFill);
        });

        // Toggle card when clicked
        $(".card-header").on("click", (e)=>{
            this.toggleCard($(e.currentTarget));
        });

        // When an amount of 1x PBS is changed, update the volume of 10x PBS to use
        $("#desiredPBSVol").on("change", (e)=>{
            var desiredFinalVol = $(e.currentTarget).val();
            var startVol = this.PBS10xTo1xCalc(desiredFinalVol);
            $("#vol10xPBS").text(startVol);
        }).each((i,e)=>{
            var desiredFinalVol = $(e).val();
            var startVol = this.PBS10xTo1xCalc(desiredFinalVol);
            $("#vol10xPBS").text(startVol);
        });

        // When an amount of blocking solution is changed, update the volumes of components
        $(".updateBlocking").on("change", (e)=>{
            var solns = this.blockingSolnCalc(); // updating within function now
        });

        // When an amount of PBST1 solution is changed, update the volumes of components
        $(".updatePBST1").on("change", (e)=>{
            var solns = this.PBST1Calc(); // updating within function now
        });

        // When an amount of PBST1 solution is changed, update the volumes of components
        $(".updatePBST2").on("change", (e)=>{
            var solns = this.PBST2Calc(); // updating within function now
        });

        $("#addAntibody").on("click", ()=>{
            this.addAntibodyClick();
        });

        $("#addCRHcFosABs").on("click", ()=>{
            this.addCRHcFosABsClick();
        });

        $("#desiredPrimaryVol").on("input", ()=>{
            this.primaryAbSolnCalc();
        });

        $(".calcVol").on("change", (e)=>{
            this.calcVolByPlate($(e.currentTarget));
        }).each((i,e)=>{
            this.calcVolByPlate($(e));
        });

        // Simple watch update
        $(".watch").each((i,e)=>{
            this.watchValue($(e));
        }).on("input", (e)=>{
            this.watchValue($(e.currentTarget));
        });

        $("#numWashes").each((i,e)=>{
            // this.updateWashTracking($(e).val());
        }).on("change", (e)=>{
            this.updateWashTracking($(e.currentTarget).val());
        });

        $("#washDur").on("change", (e)=>{
            var timeText = this.getTimeText($(e.currentTarget).val());
            $(".updateWashDur").attr("data-time", timeText); // change it on the page
            $(".updateWashDur").data('time', timeText); // change what jquery works with

            $(".watchTime").each((i,e)=> {
                var $elToWatch = $(e);
                var $elToFill = $(e).parent().next().find($(".fillTime"));
                // console.log($elToFill);

                this.watchTime($elToWatch, $elToFill);
            });
        });

        $("#blockDur").on("change", (e)=>{
            var blockDur = $(e.currentTarget).val();
            var timeText = this.getTimeText(blockDur);

            $(".updateBlockDur").attr("data-time", timeText);
            $(".updateBlockDur").data("time", timeText);

            $(".watchTime").each((i,e)=> {
                var $elToWatch = $(e);
                var $elToFill = $(e).parent().next().find($(".fillTime"));
                // console.log($elToFill);

                this.watchTime($elToWatch, $elToFill);
            });
        })

        this.blockingSolnCalc();
        this.PBST1Calc();
        this.PBST2Calc();
        this.primaryAbSolnCalc();
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
            var hasName = $(e).attr("name");
            if(!hasName){
                console.log("There is no name attribute for: ", e.id);
            }
        })
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
        $('.needForTable').each((i, e)=> {
            if (!$(e).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(e).attr('id'); //replace the name variable with the id attribute of this element
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

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        $cardHead.next().find("textarea.autoAdjust").each((i,e)=> {
            if(! $(e).is(":hidden")) {
                e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
            } 
        });
        my_widget_script.resize();
    },

    // ******************
    // Widget-specific 
    // ******************
    abNums: [],

    checkInArray: function (searchVal, array){
        var inArray = $.inArray(searchVal, array) !== -1;
        return inArray
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    abNumSearch: function (abNum) {
        var abSearch = this.dataSearch("abnum", abNum);
        return abSearch;
    },

    calcSearch: function (calc) {
        var calcSearch = this.dataSearch("calc", calc);
        return calcSearch;
    },

    watchSearch: function (watch) {
        var watchSearch = this.dataSearch("watch", watch);
        return watchSearch;
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = this.calcSearch(watch);
        var abNum = $el.data("abnum");
        
        var val = $el.val();

        // console.log("watch: " + watch + "; val: " + val);
        
        if(abNum){
            calcSearch += this.abNumSearch(abNum);
        }

        $(calcSearch).html(val);

        this.resize();
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
        // console.log($elToFill);
        var addTime = $elToFill.data("time");
        // console.log(addTime);
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

    /**
     * @param dilFraction Dilution fraction for the item you're adding
     * @param desiredFinalVol Final volume of solution
     * 
     * returns the volume of the concentrated substance to be added
     * 
     * For example, for making 500 mL of 1x PBS using 10x PBS,
     * you would enter this.startVolOfDilutionCalc(0.1, 500)
     */
    startVolOfDilutionCalc: function(dilFraction, desiredFinalVol){
        var startVol = desiredFinalVol * dilFraction
        // console.log("startVol", startVol);
        // console.log("startVol rounded", +startVol.toFixed(2)); // the + gets rid of extra zeros
        return(startVol); // round when using (+startVol.toFixed(2))
    },

    // Return the amount of 10x PBS to use for making 1x PBS
    PBS10xTo1xCalc: function(desiredFinalVol){
        if(desiredFinalVol > 0){
            var dilFraction = 1/10;
            var startVol = +this.startVolOfDilutionCalc(dilFraction, desiredFinalVol).toFixed(2);
        } else {
            var startVol = "[Enter desired amount]"
        }
        return(startVol)
    },

    calcVolByPlate: function($el){
        var plateSize = $el.val();
        var type = $el.data("volwatch");
        var typeSearch = this.dataSearch("volcalc", type);

        var amnt;
        if(plateSize == 24){
            amnt = "500&micro;"
        }else if(plateSize == 12){
            amnt = "1.5m"
        } else if(plateSize == 6){
            amnt = "3m"
        } else {
            amnt = "specify appropriate plate size"
        }
        $(".printVol"+typeSearch).html(amnt)
    },

    // Return the amount of normal goat serum, triton, and PBS for blocking solution
    // Default is 4% NGS and 0.4% triton
    blockingSolnCalc: function(){
        var desiredFinalVol = $("#desiredPBSTBlockVol").val();
        var percNGS = $("#percNGS").val();
        var percTriton = $("#percTriton").val();
        if(!(percNGS>0) || percNGS > 100){
            percNGS = 4;
            $("#percNGS").val(percNGS);
            this.watchValue($("#percNGS"));
        }
        if(!(percTriton>0) || percTriton > 100){
            percTriton = 0.4;
            $("#percTriton").val(0.4);
            this.watchValue($("#percTriton"));
        }
        var dilFractionNGS = percNGS/100;
        var dilFractionTriton = percTriton/100;
        if(desiredFinalVol > 0){
            // var dilFractionNGS = 0.04; // 4% NGS
            var startVolNGSmL = this.startVolOfDilutionCalc(dilFractionNGS, desiredFinalVol);
            var startVolNGSuL = +(startVolNGSmL * 1000).toFixed(2);
            // var dilFractionTriton = 0.004; // 0.4% triton
            var startVolTritonx100 = this.startVolOfDilutionCalc(dilFractionTriton, desiredFinalVol);
            var startVolTriton20percmL = startVolTritonx100 * 5;
            var startVolTriton20percuL = +(startVolTriton20percmL * 1000).toFixed(2);
            var startVolPBS = +(desiredFinalVol - startVolNGSmL - startVolTriton20percmL).toFixed(2);
        } else {
            var startVolNGSuL = "[Enter desired amount]"
            var startVolTriton20percuL = "[Enter desired amount]"
            var startVolPBS = "[Enter desired amount]"
        }
        solns = {
            NGS: startVolNGSuL,
            triton: startVolTriton20percuL,
            PBS: startVolPBS
        }
        $("#volNGSBlock").text(solns.NGS);
        $("#volTritonBlock").text(solns.triton);
        $("#volPBSBlock").text(solns.PBS);
        return(
            solns
        )
    },

    // Return the amount of triton, and PBS for first PBST solution
    // Default is 0.1% triton
    PBST1Calc: function(version){
        var desiredFinalVol = $("#desiredPBST2Vol").val();
        var percTriton = $("#percTriton2").val();
        if(!(percTriton>0) || percTriton > 100){
            percTriton = 0.1;
            $("#percTriton2").val(0.1);
            this.watchValue($("#percTriton2"));
        }
        var dilFractionTriton = percTriton/100;
        if(desiredFinalVol > 0){
            // var dilFractionTriton = 0.004; // 0.4% triton
            var startVolTritonx100 = this.startVolOfDilutionCalc(dilFractionTriton, desiredFinalVol);
            // console.log(startVolTritonx100);
            var startVolTriton20percmL = startVolTritonx100 * 5;
            var startVolTriton20percuL = +(startVolTriton20percmL * 1000).toFixed(2);
            var startVolPBS = +(desiredFinalVol - startVolTriton20percmL).toFixed(2);
        } else {
            var startVolTriton20percuL = "[Enter desired amount]"
            var startVolPBS = "[Enter desired amount]"
        }
        solns = {
            triton2: startVolTriton20percuL,
            PBS2: startVolPBS
        }
        $("#volTriton2").text(solns.triton2);
        $("#volPBS2").text(solns.PBS2);
        $(".PBST1_option").text(percTriton + "% PBS-T");
        return(
            solns
        )
    },

    // Return the amount of triton, and PBS for first PBST solution
    // Default is 0.1% triton
    PBST2Calc: function(version){
        var desiredFinalVol = $("#desiredPBST3Vol").val();
        var percTriton = $("#percTriton3").val();
        if(!(percTriton>0) || percTriton > 100){
            percTriton = 0.4;
            $("#percTriton3").val(0.4);
            this.watchValue($("#percTriton3"));
        }
        var dilFractionTriton = percTriton/100;
        if(desiredFinalVol > 0){
            // var dilFractionTriton = 0.004; // 0.4% triton
            var startVolTritonx100 = this.startVolOfDilutionCalc(dilFractionTriton, desiredFinalVol);
            // console.log(startVolTritonx100);
            var startVolTriton20percmL = startVolTritonx100 * 5;
            var startVolTriton20percuL = +(startVolTriton20percmL * 1000).toFixed(2);
            var startVolPBS = +(desiredFinalVol - startVolTriton20percmL).toFixed(2);
        } else {
            var startVolTriton20percuL = "[Enter desired amount]"
            var startVolPBS = "[Enter desired amount]"
        }
        solns = {
            triton3: startVolTriton20percuL,
            PBS3: startVolPBS
        }
        $("#volTriton3").text(solns.triton3);
        $("#volPBS3").text(solns.PBS3);
        $(".PBST2_option").text(percTriton + "% PBS-T");
        return(
            solns
        )
    },

    primaryAbSolnCalc: function(){
        var $primaryVol = $("#desiredPrimaryVol");
        var primaryVol = $primaryVol.val();

        if(primaryVol > 0){
            // For each dilution factor entry
            $(".abDilution").each((i,e)=>{
                var abNum = $(e).data("abnum");
                var abSearch = this.abNumSearch(abNum);
                var dilutionFactor = $(e).val();
                // If there's a value entered that's greater than 0
                if(dilutionFactor > 0){
                    // Convert to a proportion
                    var dilutionVal = 1/dilutionFactor;
                    // Get the volume in mL
                    var amountAb_mL = this.startVolOfDilutionCalc(dilutionVal, primaryVol);
                    // Convert to uL
                    var amountAb_uL = +(amountAb_mL * 1000).toFixed(2);
                    var stockDilution = $(".abStock"+abSearch).val();
                    if(stockDilution>0){
                        var amountAbStock_uL = +(amountAb_uL*stockDilution).toFixed(2);
                    } else{
                        var amountAbStock_uL = "[Enter stock dilution]"
                    }
                } else{
                    var amountAb_uL = "[Enter dilution factor]"
                    var amountAbStock_uL = "[Enter dilution factor]"
                }
                // Fill in the amount for the abnum matches
                $(".abAmount"+abSearch).text(amountAbStock_uL);
            });
        } else{
            primaryVol = "[Enter desired volume]";
            $(".abDilution").each((i,e)=>{
                var abNum = $(e).data("abnum");
                var abSearch = this.abNumSearch(abNum);
                $(".abAmount"+abSearch).text("[Enter desired volume]");
            });
        }
        $("#volBlockingForPrimary").text(primaryVol);
    },

    addAntibodyClick: function (){
        var abNum = 1;
        if(this.abNums.length > 0){
            var lastAb = this.abNums[this.abNums.length - 1];
            // console.log("lastAb: " + lastAb);
            abNum = lastAb + 1;
        }

        var inArray = this.checkInArray(abNum, this.abNums);
        if(! inArray){
            this.addAntibodies(abNum);
        }
    },

    addCRHcFosABsClick: function (){
        var abNum = 1;
        if(this.abNums.length > 0){
            var lastAb = this.abNums[this.abNums.length - 1];
            // console.log("lastAb: " + lastAb);
            abNum = lastAb + 1;
        }

        // Make an antibody for the rabbit anti-cFos
        var inArray = this.checkInArray(abNum, this.abNums);
        if(! inArray){
            this.addAntibodies(abNum);
        }
        
        // Fill in the information
        var abSearch = this.abNumSearch(abNum);
        $(".abName"+abSearch).val("rabbit anti-cFos");
        var calcSearch = this.calcSearch("abName");
        $(calcSearch + abSearch).text("rabbit anti-cFos");
        $(".abDilution"+abSearch).val("2000");

        // Go to the next antibody number
        abNum++;

        // Make it
        var inArray = this.checkInArray(abNum, this.abNums);
        if(! inArray){
            this.addAntibodies(abNum);
        }
        
        // Fill in the info
        var abSearch = this.abNumSearch(abNum);
        $(".abName"+abSearch).val("chicken anti-GFP");
        var calcSearch = this.calcSearch("abName");
        $(calcSearch + abSearch).text("chicken anti-GFP");
        $(".abDilution"+abSearch).val("1000");

        // Update the calculation
        this.primaryAbSolnCalc();
    },

    addAntibodies: function(abNum){
        this.abNums.push(abNum);

        var myLeftCol = "col-4 col-sm-5 col-md-4 col-lg-5 text-right"

        $("#abInfo").append(
            $("<div></div>", {
                "class": "row mt-2", 
                "data-abnum": abNum
            }).append(
                $("<h4></h4>", {
                    "class": "col",
                    "data-abnum": abNum,
                    "data-calc": "abName"
                }).append("Antibody " + abNum)
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        "type": "button",
                        "data-abnum": abNum,
                        "value": "Delete antibody",
                        name: "deleteab"+abNum,
                        id: "deleteAb"+abNum,
                        "class": "col fullWidth deleteAb hideView"
                    }).on("click", (e)=>{
                        this.deleteAb(abNum)
                    })
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row",
                "data-abnum": abNum
            }).append(
                "<div class='"+myLeftCol+"'>Antibody name</div>"
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        "class": "fullWidth abName watch", 
                        type: "text",
                        "name": "abname"+abNum,
                        "id": "abName"+abNum,
                        "data-abnum": abNum,
                        "data-watch": "abName",
                        "value": "Ab " + abNum
                    })
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row",
                "data-abnum": abNum
            }).append(
                "<div class='"+myLeftCol+"'>Final ab dilution (1:x)</div>"
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        "class": "fullWidth abDilution", 
                        type: "number",
                        "name": "abdilution"+abNum,
                        "id": "abDilution"+abNum,
                        "data-abnum": abNum
                    })
                ).on("input", (e)=>{
                    this.primaryAbSolnCalc();
                })
            )
        ).append(
            $("<div></div>", {
                "class": "row",
                "data-abnum": abNum
            }).append(
                "<div class='"+myLeftCol+"'>Current ab stock dilution(1:x)</div>"
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        "class": "fullWidth abStock", 
                        type: "number",
                        "name": "abstock"+abNum,
                        "id": "abStock"+abNum,
                        "value": 1,
                        "data-abnum": abNum
                    })
                ).on("input", (e)=>{
                    this.primaryAbSolnCalc();
                })
            )
        );

        $("#abAmountInfo").append(
            $("<div></div>", {
                "class": "row",
                "data-abnum": abNum
            }).append(
                $("<div></div>", {
                    "class": "green " + myLeftCol,
                }).append(
                    $("<span></span>", {
                        "class": "abAmount",
                        "data-abnum": abNum
                    })
                ).append(" &micro;L")
            ).append(
                $("<div></div>", {
                    "class": "col",
                    "data-abnum": abNum,
                    "data-calc": "abName"
                })
            )
        );

        $("#abInfo").find(".watch").each((i,e)=> { 
            this.watchValue($(e));
        }).on("input", (e)=>{
            this.watchValue($(e.target)); // or currentTarget
        });
    },

    deleteAb: function (abNum){
        this.runIfConfirmed(
            "Are you sure that you wish to delete this antibody?",
            ()=>{
                var search = this.abNumSearch(abNum);
                $(search).remove(); 
                
                var index = this.abNums.indexOf(abNum);
                if(index > -1){
                    this.abNums.splice(index, 1);
                }
            }
        )
    },

    updateWashTracking: function(numWashes){
        var currentNumWashes = parseInt(this.numWashes);
        if( currentNumWashes < numWashes){
            for(i = currentNumWashes; i < numWashes; i++){
                this.makeWashRow(i);
            }
            this.numWashes = numWashes
        } else if(currentNumWashes > numWashes){
            this.dialogConfirm(
                "Are you sure you want to remove a wash?", 
                (result)=>{
                    if(result){
                        for(i = currentNumWashes; i >= numWashes; i--){
                            var washSearch = this.dataSearch("wash", i)
                            $(washSearch).remove();
                        }
                        this.numWashes = numWashes;
                    } else {
                        $("#numWashes").val(currentNumWashes); // reset
                    }
                    this.resize();
                }
            )
        }
        this.resize();
    },

    getTimeText: function(timeInMin){
        var hours = 0, min = 0; timeText = "00:00"
        if(timeInMin){
            hours = Math.floor(timeInMin/60);
            min = Math.round(timeInMin % 60);
            timeText = ("00" + hours).slice(-2) + ":" + ("00"+min).slice(-2);
        }
        return timeText
    },

    makeWashRow: function(washIndex){
        var myLeftCol4 = "col-6 col-md-4 col-lg-3 text-right"
        var timeText = this.getTimeText($("#washDur").val());
        var printNum = washIndex + 1;
        $("#washTimeDiv").append(
            $("<div></div>", {
                "class": "row mt-1",
                "data-wash": washIndex
            }).append(
                $("<div></div>", {
                    "class": myLeftCol4
                }).append(
                    $("<input></input>", {
                        "type": "time",
                        "name": "rinsetime" + washIndex,
                        "id": "rinseTime" + washIndex,
                        "class": "watchTime fullWidth"
                    }).on("input", (e)=>{
                        var $elToWatch = $(e.currentTarget);
                        var $elToFill = $(e.currentTarget).parent().next().find($(".fillTime"));
                        // console.log($elToFill);
                        this.watchTime($elToWatch, $elToFill);
                    })
                )
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    "Wash " + printNum + " complete at <span class='fillTime purple updateWashDur' data-time='" + timeText + "'>{Enter Start Time}</span>"
                )
            )
        )
    }
};