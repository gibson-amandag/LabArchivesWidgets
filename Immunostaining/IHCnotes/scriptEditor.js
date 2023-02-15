my_widget_script =
{
    mouseNums: [],
    mice: {},
        /**
         * 1: {} Series/region combination. IHC, imaging, quant, etc 
         **/

    trtGroupNums: [],
    trtGroups: {},

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
            trtGroupNums: this.trtGroupNums,
            trtGroups: this.trtGroups,  
            mouseNums: this.mouseNums,
            mice: this.mice
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
            widgetData: testData
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
        if(parsedJson.trtGroups){
            this.trtGroups = parsedJson.trtGroups
        }
        if(parsedJson.trtGroupNums){
            for(trtGroupNum of parsedJson.trtGroupNums){
                this.makeTrtGroupCard(trtGroupNum);
            }
            this.trtGroupNums = parsedJson.trtGroupNums;
        }

        if(parsedJson.mice){
            this.mice = parsedJson.mice;
        }
        if(parsedJson.mouseNums){
            for(mouseNum of parsedJson.mouseNums){
                this.makeMouseCard(mouseNum);

                var regNums = this.mice[mouseNum].regNums;
                if(regNums){
                    for(regNum of regNums){
                        this.makeRegionSeries(mouseNum, regNum);
                    }
                }
            }
            this.mouseNums = parsedJson.mouseNums;
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
            $(".filter").prop("readonly", "").prop("disabled", "");
            $(".filter").find("option").prop("disabled", "");
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
            var $table = $("."+tableID).find("table"); // note the change! div of a class, find the table within
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
            var $tableToCopy = $("."+tableID).find("table"); // note the change! div of a class, find the table within
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose)
        });

        $(".addMouse").on("click", (e)=> {
            var genNum = this.getNextNum(this.mouseNums);
            // if(this.mouseNums.length > 0){
            //     var lastMouse = this.mouseNums[this.mouseNums.length - 1];
            //     var mouse = lastMouse + 1;
            // } else {
            //     var mouse = 1;
            // }
            this.addMouse(genNum);
        });
        
        $(".addTrtGroup").on("click", (e)=> {
            var genNum = this.getNextNum(this.trtGroupNums);
            // if(this.trtGroupNums.length > 0){
            //     var lastTrtGroup = this.trtGroupNums[this.trtGroupNums.length - 1];
            //     var trtGroup = lastTrtGroup + 1;
            // } else {
            //     var trtGroup = 1;
            // }
            this.addTrtGroup(genNum);
        });

        $("#collapseMice").on("click", (e)=>{
            this.collapseAllMiceCards();
        })

        // Generic update when any part of the form has user input
        $("#the_form").on("input", (e)=>{
            // Add a watch attribute to elements if need to be more specific, such as
            // to specify a day or a dam to update
            if($(e.target).data("watch")){
                this.watchValue($(e.target));
            } else{
                // the target will be whatever is currently receiving input
                // This will update any field with a "data-calc" attribute that
                // matches the id of the target element
                this.updateCalcFromEl(e.target);
            }
        }).on("change", (e)=>{
            // this.getDamsDue($("#dueDate").val());
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
        $("#dueDate").val(dateToday).each((i,e)=>{
            // this.getDamsDue($(e).val());
        });

        $(".htmlCardHeader").on("click", (e)=> {
            this.toggleCard($(e.currentTarget));
        });

        $("#convertToTable").on("click", (e)=>{
            var tableText = $("#pasteField").val();
            var makeFirstColHead = false, makeFirstRowHead = false;
            if($("#makeColHead").is(":checked")){
                makeFirstColHead = true
            }
            if($("#makeRowHead").is(":checked")){
                makeFirstRowHead = true
            }
            var $divForTable = $(".forTable")
            this.rebuildTableFromStr(tableText, makeFirstRowHead, makeFirstColHead, $divForTable);
        });

        $("#upload").on("click", (e)=>{
            this.upload();
        });

        $("#preview").on("click", (e)=>{
            this.preview();
        });

        $(".initialMass").each((i,e)=>{
            var damNum = $(e).data("dam");
            var breedNum = $(e).data("breed");
            this.calcMassChange(damNum, breedNum);
        });

        $(".filter").on("input", (e)=>{
            // console.log("changed a filter")
            var type = $(e.currentTarget).data("filter");
            if(type == "region"){
                this.makeRegionsTable();
            } else {
                this.makeMouseTable();
            }
        });

        $("#resetFilter").on("click", (e)=>{
            this.resetFilter();
        });
        this.resetFilter();

        $("#resetMouseFilter").on("click", (e)=>{
            this.resetMouseFilter();
        });
        this.resetMouseFilter();

        $("#showPerfusion").on("click", (e)=>{
            $(".perfusionInfo").show().find("textarea.autoAdjust").each((i,e)=> {
                if(! $(e).is(":hidden")) {
                    e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
                } 
            });
            this.resize();
        });

        $("#hidePerfusion").on("click", (e)=>{
            $(".perfusionInfo").hide();
            this.resize();
        });

        $(".perfusionInfo").hide();

        $("#showRegions").on("click", (e)=>{
            $(".regDiv").show().find("textarea.autoAdjust").each((i,e)=> {
                if(! $(e).is(":hidden")) {
                    e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
                } 
            });
            this.resize();
        });

        $("#hideRegions").on("click", (e)=>{
            $(".regDiv").hide();
            this.resize();
        });

        $(".clearRegionEdit").on("click", (e)=>{
            $(".whichRegion").text("");
            $(".regionNotes").text("");
        })
        
        $(".whichRegion").text("");
        $(".regionNotes").text("");
        $(".regDiv").hide();

        $(".updateThickness").on("click", (e)=>{
            this.runIfConfirmed(
                "Are you sure you want to update all?"
                , ()=>{
                    $(".sectionSize").val($("#defThickness").val());
                }
            )
        })

        this.resize();
    },

    regDivOn: false,

    updateTextarea: function(textarea) {
        if(! $(textarea).is(":hidden")) {
            textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');
        } 
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
        var str = this.dataSearch("table", table);
        return str;
    },

    calcSearch: function (calc) {
        var str = this.dataSearch("calc", calc);
        return str;
    },

    daySearch: function (day) {
        var str = this.dataSearch("day", day);
        return str;
    },

    mouseSearch: function (mouse) {
        var str = this.dataSearch("mouse", mouse);
        return str;
    },

    trtGroupSearch: function (trtGroup) {
        var str = this.dataSearch("trtgroup", trtGroup);
        return str;
    },

    regSearch: function (regNum) {
        var str = this.dataSearch("reg", regNum);
        return str;
    },

    plugSearch: function (plugNum) {
        var str = this.dataSearch("plug", plugNum);
        return str;
    },

    massSearch: function (massNum) {
        var str = this.dataSearch("mass", massNum);
        return str;
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
        var mouseNum = $el.data("mouse");
        var trtGroupNum = $el.data("trtgroup");
        var val = $el.val();
        if(mouseNum){
            calcSearch += this.mouseSearch(mouseNum);
        }
        if(trtGroupNum){
            calcSearch += this.trtGroupSearch(trtGroupNum);
        }
        if(watch == "mouseID"){
            if(!val){
                val = "Mouse " + mouseNum;
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
        var dLink;

        // CSV file
        csvFile = new Blob([csv], { type: "text/csv" });

        // Download link
        dLink = document.createElement("a");

        // File name
        dLink.download = filename;

        // Create a link to the file
        dLink.href = window.URL.createObjectURL(csvFile);

        // Hide download link
        dLink.style.display = "none";

        // Add the link to DOM
        document.body.appendChild(dLink);

        // Click download link
        dLink.click();
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
        // debugger;
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
                    var dontCopy = $(e).hasClass("noCopy");
                    if(!dontCopy){
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
                var dontCopy = $(e).hasClass("noCopy");
                if(!dontCopy){
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

    collapseAllMiceCards: function(){
        $(".mouseCard").find(".card-header").each((i,e)=>{
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

    addMouse: function(mouseNum){
        var inArray = this.checkInArray(mouseNum, this.mouseNums);
        if(! inArray){
            // debugger;
            this.mouseNums.push(mouseNum);
            this.mice[mouseNum] = {
                // Decide if need to add and make null, or if can just let them be added as they're filled
                regNums: [],
                regs: {}
            };

            this.makeMouseCard(mouseNum);
            this.makeMouseTable();
        }
    },

    makeMouseCard: function(mouseNum){
        var $div = $("#mouseCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col-12 col-lg-6 mt-2 mouseCard",
                "data-mouse": mouseNum
            })
        )
        
        var $mouseDiv = $(".mouseCard"+this.mouseSearch(mouseNum));
        
        var header = $("<div></div>", {
            "class": "mouseIDCalc",
            "data-calc": "mouseID",
            "data-mouse": mouseNum
        }).append("Mouse " + mouseNum);
        var $body = this.makeMouseCardBody(mouseNum);
        this.makeCard($mouseDiv, header, $body);

        this.makeTrtGroupList(mouseNum);

        $("#mouseSelect").append(
            $("<option></option>", {
                value: mouseNum,
                class: "mouseIDCalc",
                "data-calc": "mouseID",
                "data-mouse": mouseNum
            }).append(
                "Mouse " + mouseNum
            )
        ).attr(
            "size",
            Math.min(this.mouseNums.length, 15)
        );
    },

    makeMouseCardBody: function(mouseNum){
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "<h4>Mouse ID:</h4>",
                    type: "text",
                    className: "mouseID",
                    addRowClass: "updateMouseObj"
                },
                {
                    label: "<h5>Cycle ID#</h5>",
                    type: "number",
                    className: "cycleID",
                    addRowClass: "updateMouseObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteMouse",
                    addRowClass: "hideView"
                },
                {
                    label: "Date of birth:",
                    type: "date",
                    className: "DOB",
                    addRowClass: "updateMouseObj"
                },
                {
                    label: "Age in Days:",
                    type: "number",
                    className: "ageInDays",
                    addRowClass: "updateMouseObj"
                },
                {
                    label: "Trt group:",
                    type: "select",
                    className: "trtGroup",
                    addRowClass: "updateMouseObj",
                    optionsObj: [
                        {
                            value: "",
                            text: "[Select]"
                        }
                    ]
                }, 
                {
                    label: "Date of sacrifice:",
                    type: "date",
                    className: "sacDate",
                    addRowClass: "updateMouseObj"
                },
                {
                    label: "Time of transport:",
                    type: "time",
                    className: "transportTime",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Time of sacrifice:",
                    type: "time",
                    className: "sacTime",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Uterine description:",
                    type: "textarea",
                    className: "uterineDesc",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Time of saline:",
                    type: "time",
                    className: "salineTime",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Time of perfusion:",
                    type: "time",
                    className: "perfusionTime",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Liver cleared?",
                    type: "checkbox",
                    className: "liverCleared",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Movement with formalin?",
                    type: "checkbox",
                    className: "formalinMovement",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Time of brain extraction:",
                    type: "time",
                    className: "extractionTime",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                // add change sucrose time message
                {
                    label: "Time vial changed to sucrose:",
                    type: "time",
                    className: "sucroseTime",
                    addRowClass: "updateMouseObj perfusionInfo"
                },
                {
                    label: "Date sectioned:",
                    type: "date",
                    className: "sectionDate",
                    addRowClass: "updateMouseObj"
                },
                {
                    label: "Section thickness (&micro;m):",
                    type: "number",
                    className: "sectionSize",
                    addRowClass: "updateMouseObj",
                    value: 30
                },
                {
                    label: "Add region series:",
                    type: "button",
                    className: "addRegionSeries",
                    addRowClass: "hideView"
                },
                {
                    label: "Notes:",
                    type: "textarea",
                    className: "genNotes",
                    addRowClass: "updateMouseObj"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, mouseNum, "mouse")
                )
            }

            $body.find(".deleteMouse").prop("value", "Delete Mouse").on("click", (e)=>{
                this.deleteMouse(mouseNum);
            });

            $body.find(".addRegionSeries").prop("value", "Add region series").on("click", (e)=>{
                this.addRegionSeries(mouseNum);
            });

            $body.find(".extractionTime").parent().append(
                "Change to sucrose at <span class='fillTime purple' data-time='01:30'>{Enter Time}</span>"
            );

            $body.find(".extractionTime").on("input", (e)=>{
                this.watchTimeNextEl($(e.currentTarget));
            }).each((i,e)=> {
                this.watchTimeNextEl($(e));
            });

            $body.find(".updateMouseObj").on("change", (e)=>{
                var $el = $(e.target); // not currentTarget, because the .updateMouseObj gets put on the row
                this.updateObjFromVal($el, this.mice[mouseNum]);

                this.updateMouseList(mouseNum);
                this.makeRegionsTable();
                this.makeMouseTable();
            });

        return $body
    },

    watchTimeNextEl: function ($elToWatch){
       var $elToFill = $elToWatch.next($(".fillTime"));
        // console.log($elToFill);

        this.watchTime($elToWatch, $elToFill);
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

    updateObjFromVal: function($el, obj){
        var val = $el.val();
        var elType = $el.attr("type");
        var valSafe;
        if(elType == "checkbox"){
            valSafe = $el.is(":checked");
        } else{
            // Store only the text and no HTML elements.
            valSafe = this.encodeHTML(val);
        }
        var thisProp = $el.data("watch");
        if(thisProp){
            obj[thisProp] = valSafe;
        }
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

    makeMouseList: function(damNum){
        // debugger;
        var mouseNums = this.mouseNums;

        var mice = this.mice;

        // to-do: decide what list of mice to update
        // var damSearch = this.damSearch(damNum);

        for(mouseNum of mouseNums){
            var mouse = mice[mouseNum];

            var mouseInfo = ""
            var mouseID = mouse.mouseID;
            if(!mouseID){
                mouseID = "Mouse " + mouseNum;
            }
            mouseInfo = mouseID;

            // to-do: decide if want any other info 

            // var trtGroup = mouse.trtGroupNum;
            // if(trtGroup){
            //     mouseInfo += "; trtGroup: " + trtGroup; 
            // }
            // var strain = mouse.mouseStrain;
            // if(strain){
            //     mouseInfo += "; strain: " + strain;
            // }
            
            // to-do: this is where the updates would happen
            // $(".mouse"+damSearch).append(
            //     $("<option></option>", {
            //         "value": mouseNum,
            //         "data-mouse": mouseNum
            //     }).append(mouseInfo)
            // )
        }
    },

    updateMouseList: function(mouseNum){
        var mice = this.mice;

        var mouse = mice[mouseNum];

        var mouseInfo = ""
        var mouseID = mouse.mouseID;
        if(!mouseID){
            mouseID = "Mouse " + mouseNum;
        }
        mouseInfo = mouseID;

        // to-do: decide if want any other info 

        // var trtGroup = mouse.trtGroupNum;
        // if(trtGroup){
        //     mouseInfo += "; trtGroup: " + trtGroup; 
        // }
        // var strain = mouse.mouseStrain;
        // if(strain){
        //     mouseInfo += "; strain: " + strain;
        // }
        
        // to-do: this is where the updates would happen
        // $(".mouse"+damSearch).append(
        //     $("<option></option>", {
        //         "value": mouseNum,
        //         "data-mouse": mouseNum
        //     }).append(mouseInfo)
        // )

        var $option = $(".mouse").find("option[value='" + mouseNum+"']")
        
        // if($option.length == 0){
        //     $(".mouse").append(
        //         $("<option></option>", {
        //             "value": mouseNum,
        //             "data-mouse": mouseNum
        //         }).append(mouseInfo)
        //     );
        // } else {
        //     $option.text(mouseInfo);
        // }
    },

    addTrtGroup: function(trtGroupNum){
        var inArray = this.checkInArray(trtGroupNum, this.trtGroupNums);
        if(! inArray){
            // debugger;
            this.trtGroupNums.push(trtGroupNum);
            this.trtGroups[trtGroupNum] = {
                trt: null,
                time: null
            };

            this.makeTrtGroupCard(trtGroupNum);
        }
    },

    makeTrtGroupCard: function(trtGroupNum){
        var $div = $("#trtGroupsCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 trtGroupCard",
                "data-trtgroup": trtGroupNum
            })
        )
        
        var $sireDiv = $(".trtGroupCard"+this.trtGroupSearch(trtGroupNum));
        
        var header = $("<div></div>", {
            "class": "trtGroupCalc",
            "data-calc": "trtGroup",
            "data-trtgroup": trtGroupNum
        }).append("Treatment group " + trtGroupNum);
        var $body = this.makeTrtGroupCardBody(trtGroupNum);
        // console.log($sireDiv, header, $body);
        this.makeCard($sireDiv, header, $body);

        this.updateTrtGroupList(trtGroupNum);
    },

    makeTrtGroupList: function(mouseNum){
        // debugger;
        var trtGroupNums = this.trtGroupNums;

        var trtGroups = this.trtGroups;
        var mouseSearch = this.mouseSearch(mouseNum);

        for(trtGroupNum of trtGroupNums){
            var trtGroup = trtGroups[trtGroupNum];

            var trtInfo = ""
            var trt = trtGroup.trt;
            if(!trt){
                trt = "Trt: " + trtGroupNum;
            }
            trtInfo = trt;
            var time = trtGroup.time;
            if(time){
                trtInfo += "; time: " + time; 
            }

            $(".trtGroup"+mouseSearch).append(
                $("<option></option>", {
                    "value": trtGroupNum,
                    "data-trtgroup": trtGroupNum
                }).append(trtInfo)
            )
        }
    },

    updateTrtGroupList: function(trtGroupNum){
        var trtGroups = this.trtGroups;

        var trtGroup = trtGroups[trtGroupNum];

        var trtInfo = ""
        var trt = trtGroup.trt;
        if(!trt){
            trt = "Trt: " + trtGroupNum;
        }
        trtInfo = trt;
        var time = trtGroup.time;
        if(time){
            trtInfo += "; time: " + time; 
        }

        var $option = $(".trtGroup").find("option[value='" + trtGroupNum+"']")
        
        if($option.length == 0){
            $(".trtGroup").append(
                $("<option></option>", {
                    "value": trtGroupNum,
                    "data-trtgroup": trtGroupNum
                }).append(trtInfo)
            );
        } else {
            $option.text(trtInfo);
        }

        $(".trtGroupCalc"+this.trtGroupSearch(trtGroupNum)).text(trtInfo);
    },

    makeTrtGroupCardBody: function(trtGroupNum){
        // console.log("genNum:", trtGroupNum);
        // debugger;
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "Treatment",
                    type: "text",
                    className: "trt",
                    addRowClass: " updateTrtGroupObj"
                },
                {
                    label: "Time:",
                    type: "number",
                    className: "time",
                    addRowClass: " updateTrtGroupObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteTrtGroup",
                    optionsObj: [],
                    addRowClass: " hideView"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, trtGroupNum, "trtgroup")
                )
            }

            $body.find(".deleteTrtGroup").prop("value", "Delete treatment group").on("click", (e)=>{
                this.deleteTrtGroup(trtGroupNum);
            });

            $body.find(".showTrtGroupRegions").prop("value", "Show trt group regions").on("click", (e)=>{
                this.makeRegionsTable(trtGroupNum);
            });

            $body.find(".updateTrtGroupObj").on("change", (e)=>{
                var $el = $(e.target); // not currentTarget, because the .updateTrtGroupObj gets put on the row
                this.updateObjFromVal($el, this.trtGroups[trtGroupNum]);

                this.updateTrtGroupList(trtGroupNum);
            });
        return $body
    },

    makeInput: function(inputType, className, dataNum, optionsObj, dataName, addSecondData = false, secondDataNum = NaN, secondDataName = null, addThirdData = false, thirdDataNum = NaN, thirdDataName = null){
        var lowerCaseName = className.toLowerCase();
        dataString = "data-"+dataName.toLowerCase();
        var idNum = dataNum;
        if(addSecondData){
            secondDataString = "data-" + secondDataName.toLowerCase();
            idNum = "a" + dataNum + "b" + secondDataNum
        }
        if(addThirdData){
            thirdDataString = "data-" + thirdDataName.toLowerCase();
            idNum += ("c" + thirdDataNum);
        }
        if(inputType === "select"){
            var selectObj = {
                "name": lowerCaseName+idNum,
                "id": className+idNum,
                "class": className + " fullWidth watch",
                "data-watch": className
            }
            selectObj[dataString] = dataNum;
            if(addSecondData){
                selectObj[secondDataString] = secondDataNum;
            }
            if(addThirdData){
                selectObj[thirdDataString] = thirdDataNum;
            }

            $input = $("<select></select>", selectObj);

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
            var inputObj = {
                "name": lowerCaseName+idNum,
                "id": className+idNum,
                "class": className + " fullWidth watch autoAdjust",
                "data-watch": className,
            }
            inputObj[dataString] = dataNum;
            if(addSecondData){
                inputObj[secondDataString] = secondDataNum;
            }
            if(addThirdData){
                inputObj[thirdDataString] = thirdDataNum;
            }
            $input = $("<tex" + "tarea></tex" +"tarea>", inputObj).on("input", (e)=>{
                this.updateTextarea(e.currentTarget);
            })
        } else {
            var inputObj = {
                type: inputType,
                "name": lowerCaseName+idNum,
                "id": className+idNum,
                "class": className + " fullWidth watch",
                "data-watch": className
            }
            inputObj[dataString] = dataNum;
            if(addSecondData){
                inputObj[secondDataString] = secondDataNum;
            }
            if(addThirdData){
                inputObj[thirdDataString] = thirdDataNum;
            }
            var $input = $("<input></input>", inputObj);
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

    makeRowFromObj: function(obj, dataNum, dataName, addSecondData = false, secondDataNum = NaN, secondDataName = null){
        var $row = this.makeRow(
            obj.label,
            this.makeInput(
                obj.type,
                obj.className,
                dataNum,
                obj.optionsObj,
                dataName,
                addSecondData,
                secondDataNum,
                secondDataName
            ),
            obj.addRowClass
        );
        return($row);
    },

    deleteRegFuncs: function (mouseNum, regNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this mouse reg?", 
            ()=>{
                var thisMouse = this.mice[mouseNum];
                var regNums = thisMouse.regNums;
                var regs = thisMouse.regs;
                // Remove it from the mouseNums
                var index = regNums.indexOf(regNum);
                if(index > -1){
                    regNums.splice(index, 1);
                }
        
                // Remove it from the mice object
                delete regs[regNum];
        
                // console.log(this.mouseNums);
        
                var mouseSearch = this.mouseSearch(mouseNum);
                var regSearch = this.regSearch(regNum);
                
                // remove everything with this data attribute
                $(mouseSearch+regSearch).remove();
                // this.getMousesDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deleteMouse: function (genNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this mouse?", 
            ()=>{
                // Remove it from the mouseNums
                var index = this.mouseNums.indexOf(genNum);
                if(index > -1){
                    this.mouseNums.splice(index, 1);
                }
        
                // Remove it from the mice object
                delete this.mice[genNum];
        
                // console.log(this.mouseNums);
        
                var mouseSearch = this.mouseSearch(genNum);
                $(".mouseCard"+mouseSearch).remove();

                // remove everything with this data attribute
                $(mouseSearch).remove();
            }
        );
        this.resize();
    },

    deleteTrtGroup: function (genNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this treatment?", 
            ()=>{
                // Remove it from the trtGroupNums
                var index = this.trtGroupNums.indexOf(genNum);
                if(index > -1){
                    this.trtGroupNums.splice(index, 1);
                }
        
                // Remove it from the trtGroups object
                delete this.trtGroups[genNum];
        
                // console.log(this.trtGroupNums);
        
                var trtGroupSearch = this.trtGroupSearch(genNum);
                $(".trtGroupCard"+trtGroupSearch).remove();
                // $("tr"+trtGroupSearch).remove();

                // remove everything with this data attribute
                $(trtGroupSearch).remove();
                // this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    getNextNum: function(nums){
        if(nums.length>0){
            var lastNum = nums[nums.length - 1];
            var num = lastNum + 1;
        } else {
            var num = 1;
        }
        return num;
    },

    addRegionSeries: function(mouseNum){
        var regNums = this.mice[mouseNum].regNums;
        var mouseRegs = this.mice[mouseNum].regs;

        var regNum = this.getNextNum(regNums);

        var inArray = this.checkInArray(regNum, regNums);
        if(! inArray){
            // debugger;
            regNums.push(regNum);
            mouseRegs[regNum] = {
                region: null, 
                series: null
                // to-do: add others
            };

            this.makeRegionSeries(mouseNum, regNum);
            // this.getDamsDue($("#dueDate").val());
            this.makeRegionsTable();
        }

    },
    
    makeRegionSeries: function(mouseNum, regNum){
        var mouseSearch = this.mouseSearch(mouseNum);
        var $cardBody = $(".mouseCard"+mouseSearch).find(".card-body");

        var initialRows = [
            // {
            //     label: "Copy info:",
            //     type: "button",
            //     className: "copyReg"
            // },
            {
                label: "Delete:",
                type: "button",
                className: "deleteReg",
                optionsObj: [],
                addRowClass: "hideView"
            },
            {
                label: "Region:",
                type: "text",
                className: "region",
                addRowClass: "updateRegObj"
            },
            {
                label: "Series:",
                type: "text",
                className: "series",
                addRowClass: "updateRegObj"
            },
            // {
            //     label: "Copy info:",
            //     type: "button",
            //     className: "copyReg"
            // }
        ]
        
        $cardBody.append(
            $("<div></div>", {
                "class": "regDiv",
                "data-reg": regNum,
                "data-mouse": mouseNum
            }).append(
                $("<hr></hr>")
            )
        );

        var $body = $cardBody.find(".regDiv").show().last();

        for(row of initialRows){
            $body.append(
                this.makeRowFromObj(row, mouseNum, "mouse", true, regNum, "reg")
            )
        }

        $body.find(".deleteReg").prop("value", "Delete region/series").on("click", (e)=>{
            this.deleteRegFuncs(mouseNum, regNum);
        });

        $body.find(".copyReg").prop("value", "Copy region/series").on("click", (e)=>{
            this.copyMouseRegToClipboard(mouseNum, regNum);
        });

        // var regSearch = this.mouseSearch(mouseNum) + this.regSearch(regNum);

        $body.find(".updateRegObj").on("change", (e)=>{
            // debugger;
            var $el = $(e.target); // not currentTarget, because the .updateMouseObj gets put on the row
            var val = $el.val();
            // Store only the text and no HTML elements.
            valSafe = this.encodeHTML(val);
            var thisProp = $el.data("watch");
            this.mice[mouseNum].regs[regNum][thisProp] = valSafe;
            this.makeRegionsTable();
        });

        this.resize();
    },

    makeTopLabelRow: function(labels){

        var $cardDiv = $("<div></div>", {
            "class": "card d-none d-md-flex topLabelRow"
        }).append( // need the extra rows to make this align with the rows
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-12 row labelRow"
                })
            )
        )

        var numLabels = labels.length;
        var colText = "col-" + Math.floor(12/numLabels);
        
        for(label of labels){
            $cardDiv.find(".labelRow").append(
                $("<div></div>", {
                    "class": "font-weight-bold " + colText
                }).append(
                    label
                )
            );
        }

        return $cardDiv
    },

    makeMouseTable: function(){
        var mice = this.mice;
        var mouseNums = this.mouseNums;

        var labels = this.mouseLabels;

        const tableData = [labels];

        for(mouseNum of mouseNums){
            var mouseInfo = mice[mouseNum];
            var info = this.getMouseInfo(mouseNum);

            var proceed = this.filterMouseData(info, mouseInfo.trtGroup);

            if(proceed){
                var row = [], val;
                for (label of labels){
                    val =info[label];
                    if(!val){val = ""}
                    row.push(val);
                }
                tableData.push(row);
            }
        }

        console.log(tableData);

        $tableDiv = $(".mouseFilterTable");

        this.createTable(tableData, true, false, $tableDiv);

        this.resize();
    },

    makeRegionsTable: function(){
        var mice = this.mice;
        var mouseNums = this.mouseNums;

        var labels = this.regLabels;

        const tableData = [labels];
        const regionAddedNums = [];

        for(mouseNum of mouseNums){
            var mouseInfo = mice[mouseNum];
            var regNums = mouseInfo.regNums;
            for(regNum of regNums){
                var regInfo = this.getRegInfo(mouseNum, regNum);
                
                var proceed = this.filterData(regInfo, mouseInfo.trtGroup);

                if(proceed){
                    var row = [], val;
                    for (label of labels){
                        val =regInfo[label];
                        if(!val){val = ""}
                        row.push(val);
                    }
                    tableData.push(row);
                    regionAddedNums.push({mouseNum: mouseNum, regNum: regNum})
                }
            }
        }

        $tableDiv = $(".filterTable");

        this.createTable(tableData, true, false, $tableDiv);

        if(this.mode !== "view" && this.mode !== "view_dev"){
            $tableDiv.find("tr").each((i,e)=>{
                if(i == 0){
                    $(e).append(
                        $("<th></th>", {"class": "noCopy"}).append(
                            "Edit"
                        )
                    )
                } else{
                    var added = regionAddedNums[i - 1];
                    var mouseNum = added.mouseNum;
                    var regNum = added.regNum;
                    // console.log("cageCareNum", cageCareNum);
                    $(e).append(
                        $("<td></td>", {"class": "noCopy"}).append(
                            $("<input></input>", {
                                "data-mouse": mouseNum,
                                "data-reg": regNum,
                                value: "Edit region/series info",
                                id: "editReg"+mouseNum+regNum,
                                class: "editReg",
                                "type": "button"
                            }).on("click", (e)=>{
                                var mouseNum = $(e.currentTarget).data("mouse");
                                var regNum = $(e.currentTarget).data("reg");
                                this.editRegFuncs(mouseNum, regNum);
                            })
                        )
                    )
                }
            });
        }
        this.resize();
    },

    editRegFuncs: function(mouseNum, regNum){
        console.log("mouseNum", mouseNum, "regNum", regNum);
        this.editRegionSeries(mouseNum, regNum);
    },

    editRegionSeries: function(mouseNum, regNum){
        var $div = $(".regionNotes");
        $div.text("");

        var initialRows = [
            {
                label: "IHC date",
                type: "date",
                className: "IHCDate",
                addRowClass: "updateRegObj"
            },
            {
                label: "IHC notes",
                type: "textarea",
                className: "IHCNotes",
                addRowClass: "updateRegObj"
            },
            {
                label: "slide numbers",
                type: "text",
                className: "slideNums",
                addRowClass: "updateRegObj"
            },
            {
                label: "Image date",
                type: "date",
                className: "imageDate",
                addRowClass: "updateRegObj"
            },
            {
                label: "Image notes",
                type: "textarea",
                className: "IHCNotes",
                addRowClass: "updateRegObj"
            },
            {
                label: "Quantified date",
                type: "date",
                className: "quantifiedDate",
                addRowClass: "updateRegObj"
            },
            {
                label: "Region notes",
                type: "textarea",
                className: "regNotes",
                addRowClass: "updateRegObj"
            }
        ]

        for(row of initialRows){
            $div.append(
                this.makeRowFromObj(row, mouseNum, "mouse", true, regNum, "reg")
            )
        }

        // var regSearch = this.mouseSearch(mouseNum) + this.regSearch(regNum);

        $div.find(".updateRegObj").on("change", (e)=>{
            // debugger;
            var $el = $(e.target); // not currentTarget, because the .updateMouseObj gets put on the row
            var val = $el.val();
            // Store only the text and no HTML elements.
            valSafe = this.encodeHTML(val);
            var thisProp = $el.data("watch");
            this.mice[mouseNum].regs[regNum][thisProp] = valSafe;
            this.makeRegionsTable();
        }).each((i,e)=>{
            // debugger;
            // add existing values
            var $el = $(e).find(".watch");
            var thisProp = $el.data("watch");
            var currentVal = this.mice[mouseNum].regs[regNum][thisProp];
            if(currentVal){
                $el.val(currentVal);
            }
        });

        var regInfo = this.getRegInfo(mouseNum, regNum);
        var printInfo = regInfo.mouseID + "; region: " + regInfo.region + "; series: " + regInfo.series;
        $(".whichRegion").text("");
        $(".whichRegion").append(
            $("<h4></h4").append(
                printInfo
            )
        );

        this.resize();
    },


    makeSingleRegionTable: function(mouseNum, regNum){
        var labels = this.regLabels;
        const tableData = [labels];

        var regInfo = this.getRegInfo(mouseNum, regNum);
        var row = [], val;
        for(label of labels){
            val = regInfo[label];
            if(!val){val = ""}
            row.push(val);
        }
        tableData.push(row);

        $tableDiv = $(".mouseTable");

        this.createTable(tableData, true, false, $tableDiv);
    },

    regLabels: [
        "mouseID",
        "trt",
        "time",
        "region",
        "series",
        "IHCDate",
        "IHCNotes",
        "slideNums",
        "imageDate",
        "quantifiedDate",
        "regNotes"
    ],

    getRegInfo: function(mouseNum, regNum){
        var mouse = this.mice[mouseNum]
        var reg = mouse.regs[regNum];

        var mouseID = mouse.mouseID;
        if(!mouseID){
            mouseID = "M"+mouseNum;
        }

        var trtGroup = mouse.trtGroup;
        var trt, time;
        if(trtGroup){
            trt = this.trtGroups[trtGroup].trt;
            time = this.trtGroups[trtGroup].time;
        }

        var labels = this.regLabels;

        var regObj = {
            mouseID: mouseID,
            trt: trt,
            time: time
        };

        for(label of labels.slice(3)){
            val = reg[label];
            if(!val){val = null}
            regObj[label] = val
        }

        return regObj
    },

    resetFilter: function(){
        // console.log("reset filter");
        this.resetFilterSelections();
        this.makeRegionsTable();
    },

    resetFilterSelections: function(){
        $("#mouseFilter").val("");
        // $("#acqDataFilter").find("option").prop("selected", false);
        $("#trtGroupFilter").find("option").prop("selected", false);
        $("#regionFilter").val("");
        $("#seriesFilter").val("");
        $("#IHCFilter").val("valid");
        $("#imageFilter").val("either");
        $("#quantifiedFilter").val("either");
    },

    trtGroupLabels: ["trt", "time"],

    mouseLabels: [
        "mouseID",
        "cycleID",
        "trt",
        "time",
        "DOB",
        "ageInDays",
        "sacDate",
        "transportTime",
        "sacTime",
        "uterineDescription",
        "salineTime",
        "perfusionTime",
        "liverCleared",
        "formalinMovement",
        "extractionTime",
        "sucroseTime",
        "sectionDate",
        "sectionSize"
    ],

    resetMouseFilter: function(){
        // console.log("reset filter");
        this.resetMouseFilterSelections();
        this.makeMouseTable();
    },

    resetMouseFilterSelections: function(){
        $("#mouseFilter2").val("");
        // $("#acqDataFilter").find("option").prop("selected", false);
        $("#trtGroupFilter2").find("option").prop("selected", false);
        $("#sectionedFilter").val("either");
        $("#minAgeFilter").val("70");
        $("#maxAgeFilter").val("180");
    },
    

    getMouseInfo: function(mouseNum){
        var mouse = this.mice[mouseNum];

        var mouseID = mouse.mouseID;
        if(!mouseID){
            mouseID = "M"+mouseNum;
        }

        var trtGroup = mouse.trtGroup;
        var trt = "", time = "";
        if(trtGroup){
            trt = this.trtGroups[trtGroup].trt;
            time = this.trtGroups[trtGroup].time;
        }

        var labels = this.mouseLabels;

        var mouseObj = {
            mouseID: mouseID,
            cycleID: mouse.cycleID, // doing this for slice simplicity
            trt: trt,
            time: time
        };

        for(label of labels.slice(4)){
            val = mouse[label];
            if(!val){val = null}
            mouseObj[label] = val
        }

        return mouseObj
    },

    filterMouseData: function(info, trtGroup){
        // debugger;
        // console.log(info, trtGroup);

        var mouseFilter = $("#mouseFilter2").val();
        var trtGroupFilter = $("#trtGroupFilter2").val();
        var sectionedFilter = $("#sectionedFilter").val();
        var minAgeFilterText = $("#minAgeFilter").val();
        var minAgeFilter = parseFloat(minAgeFilterText);
        var maxAgeFilterText = $("#maxAgeFilter").val();
        var maxAgeFilter = parseFloat(maxAgeFilterText);

        // console.log(mouseFilter, trtGroupFilter, sectionedFilter);
        var keepMouse = false;

        // console.log(
        //     "mouse",
        //     this.matchesName(info.mouseID, mouseFilter),
        //     "group",
        //     this.matchesFilter(trtGroup, trtGroupFilter),
        //     "sectioned",
        //     this.matchesDate(info.sectionDate, sectionedFilter)
        // );
        
        if(
            this.matchesName(info.mouseID, mouseFilter) &&
            this.matchesFilter(trtGroup, trtGroupFilter) &&
            this.matchesDate(info.sectionDate, sectionedFilter) &&
            (!info.ageInDays || (parseFloat(info.ageInDays) <= maxAgeFilter && parseFloat(info.ageInDays) >= minAgeFilter))
        ){
            keepMouse = true;
        }

        return(keepMouse)
    },

    filterData: function(info, trtGroup){
        var mouseFilter = $("#mouseFilter").val();
        var trtGroupFilter = $("#trtGroupFilter").val();
        var regionFilter = $("#regionFilter").val();
        var seriesFilter = $("#seriesFilter").val();
        var IHCFilter = $("#IHCFilter").val();
        var imageFilter = $("#imageFilter").val();
        var quantifiedFilter = $("#quantifiedFilter").val();

        // console.log(acqDataFilter);
        var keepReg = false;

        // console.log(
        //     "mouse",
        //     this.matchesName(info.mouseID, mouseFilter),
        //     "trt",
        //     this.matchesFilter(trtGroup, trtGroupFilter),
        //     "region",
        //     this.matchesName(info.region, regionFilter),
        //     "series",
        //     this.matchesName(info.series, seriesFilter),
        //     "IHC",
        //     this.matchesDate(info.IHCDate, IHCFilter),
        //     "image",
        //     this.matchesDate(info.imageDate, imageFilter),
        //     "quantified",
        //     this.matchesDate(info.quantifiedDate, quantifiedFilter)
        // )
        
        if(
            this.matchesName(info.mouseID, mouseFilter) &&
            this.matchesFilter(trtGroup, trtGroupFilter) &&
            this.matchesName(info.region, regionFilter) &&
            this.matchesName(info.series, seriesFilter) &&
            this.matchesDate(info.IHCDate, IHCFilter) &&
            this.matchesDate(info.imageDate, imageFilter) &&
            this.matchesDate(info.quantifiedDate, quantifiedFilter)
        ){
            keepReg = true;
        }

        return(keepReg)
    },

    matchesFilter: function(thisVal, matchArray){
        var matches = false;
        if(matchArray){
            if(!thisVal){thisVal = ""}
            var matches = this.checkInArray(thisVal, matchArray);
        } else {
            // console.log("no match array");
            matches = true;
        }
        return matches
    },

    matchesName: function(thisVal, matchString){
        var matches = false;
        if(matchString){
            // console.log(matchString);
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
    
    matchesDate: function(thisVal, dateType){
        var matches = false;
        // console.log(dateType);
        if(dateType == "either"){
            matches = true;
        } else {
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

    copyDamBreedingToClipboard: function(damNum, breedingNum, copyLabels = false){
        var damObj = this.getDamBreedingInfo(damNum, breedingNum);

        const tableArray = [];
        const rowArray = [];
        if(copyLabels){
            tableArray.push(this.damBreedingLabels);
        }
        for(label of this.damBreedingLabels){
            var val = damObj[label]
            if(!val){
                val = ""
            }
            rowArray.push(""+val);
        }
        tableArray.push(rowArray);
        var tableString = this.convertRowArrayToString(tableArray, "\t", "\n");
        var $divForCopy = $("#forCopy");
        var $errorMsg = $("#errorMsg");
        this.copyStringToClipboard(tableString, $divForCopy, $errorMsg);
    },  

    getDamNamesArray: function(damNumArray){
        var names = [];
        for(damNum of damNumArray){
            var thisID = this.dams[damNum].damID
            if(!thisID){
                thisID = "Dam " + damNum;
            }
            names.push(thisID);
        }
        return names
    },

    printDams: function(damsArray, $div){
        damsArrayClean = this.encodeHTML(damsArray).split(",");
        $div.html(damsArrayClean.join("<br/>"));
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
                    if($("#makeColHead").is(":checked")){
                        makeFirstColHead = true
                    }
                    if($("#makeRowHead").is(":checked")){
                        makeFirstRowHead = true
                    }
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

    addMouseFromTable: function(obj, uploadHeaders){
        debugger;
        var thisID = obj.mouseID;
        var mouseNum, updatingMouse = false;
        if(thisID){
            var matchInfo = this.getMatchingObjSubset(
                this.mice,
                "mouseID",
                thisID
            );

            if(matchInfo.matchingObj.length>0){ // mouseID already added
                mouseNum = matchInfo.matchingObj[0];
                updatingMouse = true;
            } else {
                // mouseID not added
                mouseNum = this.getNextNum(this.mouseNums);
                this.addMouse(mouseNum);
            }
        } else {
            mouseNum = this.getNextNum(this.mouseNums);
            this.addMouse(mouseNum);
        }

        var mouseSearch = this.mouseSearch(mouseNum);

        var headers = this.mouseLabels;
        for(header of headers){
            var thisVal = obj[header];
            var updateVal = true;
            if(updatingMouse && ! this.checkInArray(header, uploadHeaders)){
                updateVal = false;
            }
            if(updateVal){
                $("." + header + mouseSearch).val(obj[header]);
                this.mice[mouseNum][header] = obj[header];
            }
        }
        this.updateMouseList(mouseNum);
        return(mouseNum);
    },

    addTrtGroupFromTable: function(obj){
        var trtGroupNum = this.getNextNum(this.trtGroupNums);
        this.addTrtGroup(trtGroupNum);
        var trtGroupSearch = this.trtGroupSearch(trtGroupNum);

        var headers = this.trtGroupLabels;
        for(header of headers){
            $("." + header + trtGroupSearch).val(obj[header]);
            this.trtGroups[trtGroupNum][header] = obj[header];
        }
        this.updateTrtGroupList(trtGroupNum);
        return trtGroupNum;
    },

    upload: function() {
        var tableStr = this.addedTable;
        if(tableStr){
            var byHeader = Papa.parse(tableStr, {
                skipEmptyLines: true,
                header: true
            })
            var dataByHeader = byHeader.data;
            var headers = byHeader.meta.fields;
            if(headers.join("") === this.mouseLabels.join("")){
                for(obj of dataByHeader){
                    this.addMouseFromTable(obj, headers);
                }
            } else if(headers.join("") === this.trtGroupLabels.join("")){
                for(obj of dataByHeader){
                    this.addTrtGroupFromTable(obj);
                }
            } else if(headers[0] === "mouseID") {
                for(obj of dataByHeader){
                    this.addMouseFromTable(obj, headers);
                }
            } else {
                bootbox.alert("Please use a table that has appropriate headers so that we know what to do with it")
            }
        } else {
            bootbox.alert("Please either make an HTML table after pasting from Excel or preview a CSV file first")
        }
    },

    // returns the matching object from obj if there's only one match
    getMatchingObjSubset: function(obj, firstMatchKey, firstMatchVal, secondMatchKey, secondMatchVal, thirdMatchKey, thirdMatchVal){
        var noMatches = false;
        var matchingObj;
        var objAsArray = Object.entries(obj);
        var matchFirstKeys = objAsArray.filter(d => {return d[1][firstMatchKey] === firstMatchVal});
        var matchingObjs = matchFirstKeys;
        if(matchingObjs.length>1){
            var matchSecondKeys = matchingObjs.filter(d => {return d[1][secondMatchKey] === secondMatchVal});
            matchingObjs = matchSecondKeys;
            if(matchingObjs.length>1){
                var matchThirdKeys = matchingObjs.filter(d => {return d[1][thirdMatchKey] === thirdMatchVal});
                matchingObjs = matchThirdKeys;
            }
        } else if(matchingObjs.length === 0){
            noMatches = true;
        }
        if(matchingObjs.length !== 1){
            matchingObj = {}
        } else {
            // matchingObj = Object.fromEntries(matchingObjs)
            matchingObj = matchingObjs[0]
        }
        return {
            matchingObj: matchingObj,
            noMatches: noMatches
        };
        // return matchingObj;
    },
};