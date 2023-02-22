my_widget_script =
{
    damGenerationNums: [],
    damGenerations: {},
        /**
         * 1: {gen: ####, DOB: ####-##-##, strain:}
         **/


    sireGenerationNums: [],
    sireGenerations: {},    

    damNums: [],
    dams: {},
        /**
         * 1: {
         * genNum: #
         * breedingNums: [],
         * breedings: {} -> sire, date, cage, initialMass, massNums: [], masses: {#: val}, plugNums: [], plugs: {#:{date, quality}}
         * }
         **/

    sireNums: [],
    sires: {},
        /**
         * 1: {
         * genNum: #
        **/

    mode: "edit",

    dateToday: null,
    
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
        this.dateToday = luxon.DateTime.now().toISODate();
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
            damGenerationNums: this.damGenerationNums,
            damGenerations: this.damGenerations,
            sireGenerationNums: this.sireGenerationNums,
            sireGenerations: this.sireGenerations,  
            damNums: this.damNums,
            dams: this.dams,
            sireNums: this.sireNums,
            sires: this.sires
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
    initDynamicContent: function (pj) {
        if(pj.damGenerations){
            this.damGenerations = pj.damGenerations;
        }
        if(pj.damGenerationNums){
            for(genNum of pj.damGenerationNums){
                this.makeDamGenCard(genNum);
            }
            this.damGenerationNums = pj.damGenerationNums;
        }

        if(pj.sireGenerations){
            this.sireGenerations = pj.sireGenerations
        }
        if(pj.sireGenerationNums){
            for(genNum of pj.sireGenerationNums){
                this.makeSireGenCard(genNum);
            }
            this.sireGenerationNums = pj.sireGenerationNums;
        }

        if(pj.sires){
            this.sires = pj.sires
        }
        if(pj.sireNums){
            for(sireNum of pj.sireNums){
                this.makeSireCard(sireNum);
            }
            this.sireNums = pj.sireNums
        }

        if(pj.dams){
            this.dams = pj.dams
        }
        if(pj.damNums){
            for(damNum of pj.damNums){
                this.makeDamCard(damNum);

                var breedingNums = this.dams[damNum].breedingNums;
                if(breedingNums){
                    for(breedingNum of breedingNums){
                        this.makeDamBreeding(damNum, breedingNum);

                        var plugCheckNums = this.dams[damNum].breedings[breedingNum].plugCheckNums;
                        if(plugCheckNums){
                            for(plugCheckNum of plugCheckNums){
                                this.makePlugEntry(damNum, breedingNum, plugCheckNum);
                            }
                        }

                        var massNums = this.dams[damNum].breedings[breedingNum].massNums;
                        if(massNums){
                            for(massNum of massNums){
                                this.makeMassEntry(damNum, breedingNum, massNum);
                            }
                        }
                    }
                }
            }
            this.damNums = pj.damNums
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
            this.updateTextarea(e);
            // e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
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
            var fileName = "table_"+tableID+"_"+this.dateToday;
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

        $(".addDam").on("click", (e)=> {
            var damNum = this.getNextNum(this.damNums);
            // if(this.damNums.length > 0){
            //     var lastDam = this.damNums[this.damNums.length - 1];
            //     var damNum = lastDam + 1;
            // } else {
            //     var damNum = 1;
            // }
            this.addDam(damNum);
        });
        
        $(".addSire").on("click", (e)=> {
            var sireNum = this.getNextNum(this.sireNums);
            // if(this.sireNums.length > 0){
            //     var lastSire = this.sireNums[this.sireNums.length - 1];
            //     var sireNum = lastSire + 1;
            // } else {
            //     var sireNum = 1;
            // }
            this.addSire(sireNum);
        });

        $(".addDamGen").on("click", (e)=> {
            var genNum = this.getNextNum(this.damGenerationNums);
            // if(this.damGenerationNums.length > 0){
            //     var lastDamGeneration = this.damGenerationNums[this.damGenerationNums.length - 1];
            //     var damGeneration = lastDamGeneration + 1;
            // } else {
            //     var damGeneration = 1;
            // }
            this.addDamGeneration(genNum);
        });
        
        $(".addSireGen").on("click", (e)=> {
            var genNum = this.getNextNum(this.sireGenerationNums);
            // if(this.sireGenerationNums.length > 0){
            //     var lastSireGeneration = this.sireGenerationNums[this.sireGenerationNums.length - 1];
            //     var sireGeneration = lastSireGeneration + 1;
            // } else {
            //     var sireGeneration = 1;
            // }
            this.addSireGeneration(genNum);
        });

        $("#collapseDams").on("click", (e)=>{
            this.collapseAllDamCards();
        });

        $("#showLastBreeding").on("click", (e)=>{
            this.showLatestBreeding();
        });

        $("#showBreeding").on("click", (e)=>{
            $(".breedDiv").show().find("textarea.autoAdjust").each((i,e)=> {
                this.updateTextarea(e);
                // if(! $(e).is(":hidden")) {
                //     e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
                // } 
            });;
            this.resize();
        });

        $("#hideBreeding").on("click", (e)=>{
            $(".breedDiv").hide();
            this.resize();
        });

        $("#showAllDams").on("click", (e)=>{
            this.showDamCards(this.damNums);
        });

        $("#showPresentDams").on("click", (e)=>{
            var dams = this.getPresentDams();
            this.showDamCards(dams);
        });

        $("#showInProgDams").on("click", (e)=>{
            var dams = this.getInProgDams();
            this.showDamCards(dams);
        });

        var dams = this.getInProgDams();
        this.showDamCards(dams);

        this.showLatestBreeding();

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
            this.getDamsDue($("#dueDate").val());
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

        $("#dueDate").val(this.dateToday).each((i,e)=>{
            this.getDamsDue($(e).val());
        });

        $(".htmlCardHeader").on("click", (e)=> {
            this.toggleCard($(e.currentTarget));
        });

        $("#convertToTable").on("click", (e)=>{
            var tableText = $("#pasteField").val();
            var colH = false, rowH = false;
            if($("#makeColHead").is(":checked")){
                colH = true
            }
            if($("#makeRowHead").is(":checked")){
                rowH = true
            }
            var $divForTable = $(".forTable")
            this.rebuildTableFromStr(tableText, rowH, colH, $divForTable);
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

        // This should be addressed now when adding from table, but if need to fix, this is the way to do it
        // $(".updateDamObj").find("input, select").each((i,e)=>{
        //     var damNum = $(e).data("dam");
        //     this.updateObjFromVal($(e), this.dams[damNum]);
        // });

        // $(".updateSireObj").find("input, select").each((i,e)=>{
        //     var sireNum = $(e).data("sire");
        //     this.updateObjFromVal($(e), this.sires[sireNum]);
        // });

        // $(".updateDamGenerationObj").find("input, select").each((i,e)=>{
        //     var genNum = $(e).data("damgen");
        //     this.updateObjFromVal($(e), this.damGenerations[genNum]);
        // });

        // $(".updateSireGenerationObj").find("input, select").each((i,e)=>{
        //     var genNum = $(e).data("siregen");
        //     this.updateObjFromVal($(e), this.sireGenerations[genNum]);
        // });

        this.resize();
    },

    updateTextarea: function(ta) {
        if(! $(ta).is(":hidden")) {
            ta.setAttribute('style', 'height:' + (ta.scrollHeight) + 'px;overflow-y:hidden;');
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
        var dc = {};
        return dc;
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
        var msg = "Are you sure?";
        if(text){
            msg = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = elForHeight.offsetTop + "px";
        }
        bootbox.confirm({
            message: msg,
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
        var msg = "Do you want to proceed?";
        if(text){
            msg = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = elForHeight.offsetTop + "px";
        }
        bootbox.confirm({
            message: msg,
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

    damSearch: function (dam) {
        var str = this.dataSearch("dam", dam);
        return str;
    },

    sireSearch: function (sire) {
        var str = this.dataSearch("sire", sire);
        return str;
    },

    damGenSearch: function (damGen) {
        var str = this.dataSearch("damgen", damGen);
        return str;
    },

    sireGenSearch: function (sireGen) {
        var str = this.dataSearch("siregen", sireGen);
        return str;
    },

    breedingSearch: function (breedingNum) {
        var str = this.dataSearch("breed", breedingNum);
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
        var damNum = $el.data("dam");
        var damGenNum = $el.data("damgen");
        var sireNum = $el.data("sire");
        var sireGenNum = $el.data("siregen");
        var val = $el.val();
        if(damNum){
            calcSearch += this.damSearch(damNum);
        }
        if(damGenNum){
            calcSearch += this.damGenSearch(damGenNum);
        }
        if(sireNum){
            calcSearch += this.sireSearch(sireNum);
        }
        if(sireGenNum){
            calcSearch += this.sireGenSearch(sireGenNum);
        }
        if(watch == "damID"){
            if(!val){
                val = "Dam " + damNum;
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
            this.updateTextarea(e);
            // if(! $(e).is(":hidden")) {
            //     e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
            // } 
        });
        this.resize();
    },

    collapseAllDamCards: function(){
        $(".damCard").find(".card-header").each((i,e)=>{
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

    
    addDam: function(damNum){
        var inArray = this.checkInArray(damNum, this.damNums);
        if(! inArray){
            // debugger;
            this.damNums.push(damNum);
            this.dams[damNum] = {
                damID: "",
                damGeneration: "",
                breedingNums: [],
                breedings: {},
                damEuthanized: NaN,
                damStopShowing: null
            };

            this.makeDamCard(damNum);
        }
    },

    makeDamCard: function(damNum){
        var $div = $("#damCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col-12 col-lg-6 mt-2 damCard",
                "data-dam": damNum
            })
        )
        
        var $damDiv = $(".damCard"+this.damSearch(damNum));
        
        var header = $("<div></div>", {
            "class": "damIDCalc",
            "data-calc": "damID",
            "data-dam": damNum
        }).append("Dam " + damNum);
        var $body = this.makeDamCardBody(damNum);
        this.makeCard($damDiv, header, $body);

        this.makeDamGenList(damNum);

        $("#damSelect").append(
            $("<option></option>", {
                value: damNum,
                class: "damIDCalc",
                "data-calc": "damID",
                "data-dam": damNum
            }).append(
                "Dam " + damNum
            )
        ).attr(
            "size",
            Math.min(this.damNums.length, 15)
        );
    },

    makeDamCardBody: function(damNum){
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "<h4>Dam ID:</h4>",
                    type: "text",
                    className: "damID",
                    addRowClass: "updateDamObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteDam",
                    addRowClass: "hideView"
                },
                {
                    label: "Generation:",
                    type: "select",
                    className: "damGeneration",
                    addRowClass: "updateDamObj",
                    optionsObj: [
                        {
                            value: "",
                            text: "[Select]"
                        }
                    ]
                }, 
                {
                    label: "Euthanized",
                    type: "date",
                    className: "damEuthanized",
                    addRowClass: "updateDamObj"
                }, 
                {
                    label: "Stop showing",
                    type: "checkbox",
                    className: "damStopShowing",
                    addRowClass: "updateDamObj"
                }, 
                {
                    label: "Add breeding:",
                    type: "button",
                    className: "addBreeding",
                    addRowClass: "hideView"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, damNum, "dam")
                )
            }

            $body.find(".deleteDam").prop("value", "Delete Dam").on("click", (e)=>{
                this.deleteDam(damNum);
            });

            $body.find(".addBreeding").prop("value", "Add Breeding").on("click", (e)=>{
                this.addDamBreeding(damNum);
            });

            $body.find(".updateDamObj").on("change", (e)=>{
                var $el = $(e.target); // not currentTarget, because the .updateDamObj gets put on the row
                this.updateObjFromVal($el, this.dams[damNum]);
                // // debugger;
                // var val = $el.val();
                // // Store only the text and no HTML elements.
                // valSafe = this.encodeHTML(val);
                // var thisProp = $el.data("watch");
                // this.dams[damNum][thisProp] = valSafe;
            });

        return $body
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

    addSire: function(sireNum){
        var inArray = this.checkInArray(sireNum, this.sireNums);
        if(! inArray){
            // debugger;
            this.sireNums.push(sireNum);
            this.sires[sireNum] = {
                sireID: "",
                sireGeneration: ""
            };

            this.makeSireCard(sireNum);
        }
    },

    makeSireCard: function(sireNum){
        var $div = $("#sireCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 sireCard",
                "data-sire": sireNum
            })
        )
        
        var $sireDiv = $(".sireCard"+this.sireSearch(sireNum));
        
        var header = $("<div></div>", {
            "class": "sireIDCalc",
            "data-calc": "sireID",
            "data-sire": sireNum
        }).append("Sire " + sireNum);
        var $body = this.makeSireCardBody(sireNum);
        this.makeCard($sireDiv, header, $body);

        this.makeSireGenList(sireNum);

        $("#sireSelect").append(
            $("<option></option>", {
                value: sireNum,
                class: "sireIDCalc",
                "data-calc": "sireID",
                "data-sire": sireNum
            }).append(
                "Sire " + sireNum
            )
        ).attr(
            "size",
            Math.min(this.sireNums.length, 15)
        );

        this.updateSireList(sireNum);
    },

    makeSireList: function(damNum, breedingNum){
        // debugger;
        var sires = this.sires;
        
        var sireNums = this.sireNums;
        var damSearch = this.damSearch(damNum);
        var breedingSearch = this.breedingSearch(breedingNum);
        var damBreedingSearch = damSearch + breedingSearch;

        for(sireNum of sireNums){

            var sire = sires[sireNum];

            var sireInfo = ""
            var sireID = sire.sireID;
            if(!sireID){
                sireID = "Sire " + sireNum;
            }

            $("select.sireBreeding"+damBreedingSearch).append(
                $("<option></option>", {
                    "value": sireNum,
                    "data-sire": sireNum
                }).append(sireID)
            );
        }
    },


    updateSireList: function(sireNum){
        var sires = this.sires;

        var sire = sires[sireNum];

        var sireInfo = ""
        var sireID = sire.sireID;
        if(!sireID){
            sireID = "Sire " + sireNum;
        }

        var $option = $("select.sireBreeding").find("option[value='" + sireNum+"']")
        
        if($option.length == 0){
            $("select.sireBreeding").append(
                $("<option></option>", {
                    "value": sireNum,
                    "data-sire": sireNum
                }).append(sireID)
            );
        } else {
            $option.text(sireID);
        }

        // if(this.mode === "edit"){
        //     $jq351("select.sireBreeding").each((i,e)=>{
        //         $(e)[0].selectize.addOption({
        //             value: sireNum,
        //             text: sireID
        //         })
        //     });
        // }
    },

    makeSireCardBody: function(sireNum){
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "<h4>Sire ID:</h4>",
                    type: "text",
                    className: "sireID",
                    addRowClass: " updateSireObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteSire",
                    optionsObj: [],
                    addRowClass: " hideView"
                },
                {
                    label: "Generation:",
                    type: "select",
                    className: "sireGeneration",
                    addRowClass: " updateSireObj",
                    optionsObj: [
                        {
                            value: "",
                            text: "[Select]"
                        }
                    ]
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, sireNum, "sire")
                )
            }

            $body.find(".deleteSire").prop("value", "Delete Sire").on("click", (e)=>{
                this.deleteSire(sireNum);
            });

            $body.find(".updateSireObj").on("change", (e)=>{
                var $el = $(e.target); // not currentTarget, because the .updateSireObj gets put on the row
                this.updateObjFromVal($el, this.sires[sireNum]);
                // // debugger;
                // var val = $el.val();
                // // Store only the text and no HTML elements.
                // valSafe = this.encodeHTML(val);
                // var thisProp = $el.data("watch");
                // this.sires[sireNum][thisProp] = valSafe;
                // this.makeDueDatesTable();
                this.updateSireList(sireNum);
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
    
    addDamGeneration: function(damGenerationNum){
        var inArray = this.checkInArray(damGenerationNum, this.damGenerationNums);
        if(! inArray){
            // debugger;
            this.damGenerationNums.push(damGenerationNum);
            this.damGenerations[damGenerationNum] = {
                damGen: null,
                damGenDOB: null,
                damGenStrain: null
            };

            this.makeDamGenCard(damGenerationNum);
        }
    },

    makeDamGenCard: function(damGenerationNum){
        var $div = $("#damGensCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 damGenCard",
                "data-damgen": damGenerationNum
            })
        )
        
        var $damDiv = $(".damGenCard"+this.damGenSearch(damGenerationNum));
        
        var header = $("<div></div>", {
            "class": "damGenCalc",
            "data-calc": "damGen",
            "data-damgen": damGenerationNum
        }).append("Dam Generation " + damGenerationNum);
        var $body = this.makeDamGenCardBody(damGenerationNum);
        // console.log($damDiv, header, $body);
        this.makeCard($damDiv, header, $body);

        this.updateDamGenList(damGenerationNum);
    },

    makeDamGenList: function(damNum){
        // debugger;
        var damGenNums = this.damGenerationNums;

        var damGens = this.damGenerations;
        var damSearch = this.damSearch(damNum);

        for(damGenNum of damGenNums){
            var damGen = damGens[damGenNum];

            var genInfo = ""
            var gen = damGen.damGen;
            if(!gen){
                gen = "Gen " + damGenNum;
            }
            genInfo = gen;
            var dob = damGen.damGenDOB;
            if(dob){
                genInfo += "; DOB: " + dob; 
            }
            var strain = damGen.damGenStrain;
            if(strain){
                genInfo += "; strain: " + strain;
            }

            $(".damGeneration"+damSearch).append(
                $("<option></option>", {
                    "value": damGenNum,
                    "data-damgen": damGenNum
                }).append(genInfo)
            )
        }
    },

    updateDamGenList: function(damGenNum){
        var damGens = this.damGenerations;

        var damGen = damGens[damGenNum];

        var genInfo = ""
        var gen = damGen.damGen;
        if(!gen){
            gen = "Gen " + damGenNum;
        }
        genInfo = gen;
        $(".damGenCalc"+this.damGenSearch(damGenNum)).text(genInfo);
        var dob = damGen.damGenDOB;
        if(dob){
            genInfo += "; DOB: " + dob; 
        }
        var strain = damGen.damGenStrain;
        if(strain){
            genInfo += "; strain: " + strain;
        }

        var $option = $(".damGeneration").find("option[value='" + damGenNum+"']")
        
        if($option.length == 0){
            $(".damGeneration").append(
                $("<option></option>", {
                    "value": damGenNum,
                    "data-damgen": damGenNum
                }).append(genInfo)
            );
        } else {
            $option.text(genInfo);
        }
    },

    makeDamGenCardBody: function(damGenerationNum){
        // debugger;
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "<h4>Generation:</h4>",
                    type: "text",
                    className: "damGen",
                    addRowClass: " updateDamGenerationObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteDamGeneration",
                    optionsObj: [],
                    addRowClass: " hideView"
                },
                {
                    label: "DOB:",
                    type: "date",
                    className: "damGenDOB",
                    addRowClass: " updateDamGenerationObj"
                }, {
                    label: "Strain:",
                    type: "text",
                    className: "damGenStrain",
                    addRowClass: " updateDamGenerationObj"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, damGenerationNum, "damgen")
                )
            }

            $body.find(".deleteDamGeneration").prop("value", "Delete Dam Gen").on("click", (e)=>{
                this.deleteDamGen(damGenerationNum);
            });

            $body.find(".updateDamGenerationObj").on("change", (e)=>{
                var $el = $(e.target); // not currentTarget, because the .updateDamGenerationObj gets put on the row
                this.updateObjFromVal($el, this.damGenerations[damGenerationNum]);
                // // debugger;
                // var val = $el.val();
                // // Store only the text and no HTML elements.
                // valSafe = this.encodeHTML(val);
                // var thisProp = $el.data("watch");
                // // console.log(thisProp, valSafe);
                // this.damGenerations[damGenerationNum][thisProp] = valSafe;

                this.updateDamGenList(damGenerationNum);
            });
        return $body
    },

    addSireGeneration: function(sireGenerationNum){
        var inArray = this.checkInArray(sireGenerationNum, this.sireGenerationNums);
        if(! inArray){
            // debugger;
            this.sireGenerationNums.push(sireGenerationNum);
            this.sireGenerations[sireGenerationNum] = {
                sireGen: null,
                sireGenDOB: null,
                sireGenStrain: null
            };

            this.makeSireGenCard(sireGenerationNum);
        }
    },

    makeSireGenCard: function(sireGenerationNum){
        var $div = $("#sireGensCardDiv");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";

        $div.append(
            $("<div/>", {
                "class": "col col-md-6 mt-2 sireGenCard",
                "data-siregen": sireGenerationNum
            })
        )
        
        var $sireDiv = $(".sireGenCard"+this.sireGenSearch(sireGenerationNum));
        
        var header = $("<div></div>", {
            "class": "sireGenCalc",
            "data-calc": "sireGen",
            "data-siregen": sireGenerationNum
        }).append("Sire Generation " + sireGenerationNum);
        var $body = this.makeSireGenCardBody(sireGenerationNum);
        // console.log($sireDiv, header, $body);
        this.makeCard($sireDiv, header, $body);

        this.updateSireGenList(sireGenerationNum);
    },

    makeSireGenList: function(sireNum){
        // debugger;
        var sireGenNums = this.sireGenerationNums;

        var sireGens = this.sireGenerations;
        var sireSearch = this.sireSearch(sireNum);

        for(sireGenNum of sireGenNums){
            var sireGen = sireGens[sireGenNum];

            var genInfo = ""
            var gen = sireGen.sireGen;
            if(!gen){
                gen = "Gen " + sireGenNum;
            }
            genInfo = gen;
            var dob = sireGen.sireGenDOB;
            if(dob){
                genInfo += "; DOB: " + dob; 
            }
            var strain = sireGen.sireGenStrain;
            if(strain){
                genInfo += "; strain: " + strain;
            }

            $(".sireGeneration"+sireSearch).append(
                $("<option></option>", {
                    "value": sireGenNum,
                    "data-siregen": sireGenNum
                }).append(genInfo)
            )
        }
    },

    updateSireGenList: function(sireGenNum){
        var sireGens = this.sireGenerations;

        var sireGen = sireGens[sireGenNum];

        var genInfo = ""
        var gen = sireGen.sireGen;
        if(!gen){
            gen = "Gen " + sireGenNum;
        }
        genInfo = gen;
        var dob = sireGen.sireGenDOB;
        if(dob){
            genInfo += "; DOB: " + dob; 
        }
        var strain = sireGen.sireGenStrain;
        if(strain){
            genInfo += "; strain: " + strain;
        }

        var $option = $(".sireGeneration").find("option[value='" + sireGenNum+"']")
        
        if($option.length == 0){
            $(".sireGeneration").append(
                $("<option></option>", {
                    "value": sireGenNum,
                    "data-siregen": sireGenNum
                }).append(genInfo)
            );
        } else {
            $option.text(genInfo);
        }
    },

    makeSireGenCardBody: function(sireGenerationNum){
        // console.log("genNum:", sireGenerationNum);
        // debugger;
        var $body = $("<div></div>");

        var initialRows = [
                {
                    label: "<h4>Generation:</h4>",
                    type: "text",
                    className: "sireGen",
                    addRowClass: " updateSireGenerationObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteSireGeneration",
                    optionsObj: [],
                    addRowClass: " hideView"
                },
                {
                    label: "DOB:",
                    type: "date",
                    className: "sireGenDOB",
                    addRowClass: " updateSireGenerationObj"
                }, {
                    label: "Strain:",
                    type: "text",
                    className: "sireGenStrain",
                    addRowClass: " updateSireGenerationObj"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, sireGenerationNum, "siregen")
                )
            }

            $body.find(".deleteSireGeneration").prop("value", "Delete Sire Gen").on("click", (e)=>{
                this.deleteSireGen(sireGenerationNum);
            });

            $body.find(".updateSireGenerationObj").on("change", (e)=>{
                var $el = $(e.target); // not currentTarget, because the .updateSireGenerationObj gets put on the row
                this.updateObjFromVal($el, this.sireGenerations[sireGenerationNum]);
                // // debugger;
                // var val = $el.val();
                // // Store only the text and no HTML elements.
                // valSafe = this.encodeHTML(val);
                // var thisProp = $el.data("watch");
                // // console.log(thisProp, valSafe);
                // this.sireGenerations[sireGenerationNum][thisProp] = valSafe;

                this.updateSireGenList(sireGenerationNum);
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

    deleteDam: function (damNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam?", 
            ()=>{
                // Remove it from the damNums
                var index = this.damNums.indexOf(damNum);
                if(index > -1){
                    this.damNums.splice(index, 1);
                }
        
                // Remove it from the dams object
                delete this.dams[damNum];
        
                // console.log(this.damNums);
        
                var damSearch = this.damSearch(damNum);
                
                // remove everything with this data attribute
                $(damSearch).remove();
                this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deleteSire: function (sireNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this sire?", 
            ()=>{
                // Remove it from the sireNums
                var index = this.sireNums.indexOf(sireNum);
                if(index > -1){
                    this.sireNums.splice(index, 1);
                }
        
                // Remove it from the sires object
                delete this.sires[sireNum];
        
                // console.log(this.sireNums);
        
                var sireSearch = this.sireSearch(sireNum);
                
                // remove everything with this data attribute
                $(sireSearch).remove();
                this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deleteBreedingFuncs: function (damNum, breedingNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam breeding?", 
            ()=>{
                var thisDam = this.dams[damNum];
                var breedingNums = thisDam.breedingNums;
                var damBreedings = thisDam.breedings;
                // Remove it from the damNums
                var index = breedingNums.indexOf(breedingNum);
                if(index > -1){
                    breedingNums.splice(index, 1);
                }
        
                // Remove it from the dams object
                delete damBreedings[breedingNum];
        
                // console.log(this.damNums);
        
                var damSearch = this.damSearch(damNum);
                var breedingSearch = this.breedingSearch(breedingNum);
                
                // remove everything with this data attribute
                $(damSearch+breedingSearch).remove();
                this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deletePlugFuncs: function (damNum, breedingNum, plugCheckNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam breeding?", 
            ()=>{
                var thisDam = this.dams[damNum];
                var damBreeding = thisDam.breedings[breedingNum];
                var plugCheckNums = damBreeding.plugCheckNums;
                var plugChecks = damBreeding.plugChecks;

                // Remove it from the plugCheckNums
                var index = plugCheckNums.indexOf(plugCheckNum);
                if(index > -1){
                    plugCheckNums.splice(index, 1);
                }
        
                // Remove it from the dams object
                delete plugChecks[plugCheckNum];
        
                // console.log(this.damNums);
        
                var damSearch = this.damSearch(damNum);
                var breedingSearch = this.breedingSearch(breedingNum);
                var plugSearch = this.plugSearch(plugCheckNum);
                
                // remove everything with this data attribute
                $(damSearch+breedingSearch+plugSearch).remove();
                this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deleteMassFuncs: function (damNum, breedingNum, massNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam breeding?", 
            ()=>{
                var thisDam = this.dams[damNum];
                var damBreeding = thisDam.breedings[breedingNum];
                var massNums = damBreeding.massNums;
                var masses = damBreeding.masses;

                // Remove it from the massNums
                var index = massNums.indexOf(massNum);
                if(index > -1){
                    massNums.splice(index, 1);
                }
        
                // Remove it from the dams object
                delete masses[massNum];
        
                // console.log(this.damNums);
        
                var damSearch = this.damSearch(damNum);
                var breedingSearch = this.breedingSearch(breedingNum);
                var massSearch = this.massSearch(massNum);
                
                // remove everything with this data attribute
                $(damSearch+breedingSearch+massSearch).remove();
                this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deleteDamGen: function (genNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam generation?", 
            ()=>{
                // Remove it from the damGenerationNums
                var index = this.damGenerationNums.indexOf(genNum);
                if(index > -1){
                    this.damGenerationNums.splice(index, 1);
                }
        
                // Remove it from the damGenerations object
                delete this.damGenerations[genNum];
        
                // console.log(this.damGenerationNums);
        
                var damGenSearch = this.damGenSearch(genNum);
                $(".damGenCard"+damGenSearch).remove();
                // $("tr"+damGenerationSearch).remove();

                // remove everything with this data attribute
                $(damGenSearch).remove();
                this.getDamsDue($("#dueDate").val());
            }
        );
        this.resize();
    },

    deleteSireGen: function (genNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this sire generation?", 
            ()=>{
                // Remove it from the sireGenerationNums
                var index = this.sireGenerationNums.indexOf(genNum);
                if(index > -1){
                    this.sireGenerationNums.splice(index, 1);
                }
        
                // Remove it from the sireGenerations object
                delete this.sireGenerations[genNum];
        
                // console.log(this.sireGenerationNums);
        
                var sireGenSearch = this.sireGenSearch(genNum);
                $(".sireGenCard"+sireGenSearch).remove();
                // $("tr"+sireGenerationSearch).remove();

                // remove everything with this data attribute
                $(sireGenSearch).remove();
                this.getDamsDue($("#dueDate").val());
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

    addDamBreeding: function(damNum){
        var breedingNums = this.dams[damNum].breedingNums;
        var damBreedings = this.dams[damNum].breedings;

        var breedingNum = this.getNextNum(breedingNums);

        // if(breedingNums.length>0){
        //     var lastDamBreeding = breedingNums[breedingNums.length - 1];
        //     var breedingNum = lastDamBreeding + 1;
        // } else {
        //     var breedingNum = 1;
        // }

        var inArray = this.checkInArray(breedingNum, breedingNums);
        if(! inArray){
            // debugger;
            breedingNums.push(breedingNum);
            damBreedings[breedingNum] = {
                sireBreeding: null, 
                litterNum: NaN,
                breedDate: NaN, 
                breedCage: NaN,
                breedCageLoc: null, 
                initialMass: NaN, 
                massNums: [], 
                masses: {},
                plugCheckNums: [],
                plugChecks: {},
                sepFromMaleDate: NaN,
                sepDamCageNum: NaN,
                litterDOB: NaN,
                litterSize: NaN,
                pupsAdded: NaN,
                pupsRemoved: NaN,
                damUse: null,
                damNotes: NaN,
                stopTrackingDate: NaN
            };

            this.makeDamBreeding(damNum, breedingNum);
            this.getDamsDue($("#dueDate").val());
        }

    },
    
    makeDamBreeding: function(damNum, breedingNum){
        var damSearch = this.damSearch(damNum);
        var $cardBody = $(".damCard"+damSearch).find(".card-body");

        var initialRows = [
            {
                label: "Copy info:",
                type: "button",
                className: "copyBreeding"
            },
            {
                label: "Delete:",
                type: "button",
                className: "deleteBreeding",
                optionsObj: [],
                addRowClass: "hideView"
            },
            {
                label: "Sire:",
                type: "select",
                className: "sireBreeding",
                addRowClass: "updateDamBreedObj",
                optionsObj: [ // will need to populate with existing
                    {
                        value: "",
                        text: "[Select]"
                    }
                ]
            },
            {
                label: "Date:",
                type: "date",
                className: "breedDate",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Litter Number:",
                type: "number",
                className: "litterNum",
                addRowClass: "updateDamBreedObj"
            }, 
            {
                label: "Cage Num:",
                type: "number",
                className: "breedCage",
                addRowClass: "updateDamBreedObj"
            }, 
            {
                label: "Cage location:",
                type: "text",
                className: "breedCageLoc",
                addRowClass: "updateDamBreedObj"
            }, 
            {
                label: "Initial mass:",
                type: "number",
                className: "initialMass",
                addRowClass: "updateDamBreedObj"
            }, 
            {
                label: "Add plug check:",
                type: "button",
                className: "addPlugCheck",
                addRowClass: "hideView"
            },
            {
                label: "Add mass:",
                type: "button",
                className: "addMass",
                addRowClass: "hideView"
            },
            {
                label: "Separated from male:",
                type: "date",
                className: "sepFromMaleDate",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Sep cage #:",
                type: "number",
                className: "sepDamCageNum",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Parturition date:",
                type: "date",
                className: "litterDOB",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Litter size at birth:",
                type: "number",
                className: "litterSize",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Pups added:",
                type: "number",
                className: "pupsAdded",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Pups removed:",
                type: "number",
                className: "pupsRemoved",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Stop tracking:",
                type: "date",
                className: "stopTrackingDate",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Use:",
                type: "select",
                className: "damUse",
                addRowClass: "updateDamBreedObj",
                optionsObj: [
                    {
                        value: "",
                        text: "[Select]"
                    },
                    {
                        value: "generalCol",
                        text: "general colony"
                    },
                    {
                        value: "std",
                        text: "STD"
                    },
                    {
                        value: "",
                        text: "LBN"
                    }
                ]
            },
            {
                label: "Dam notes:",
                type: "textarea",
                className: "damNotes",
                addRowClass: "updateDamBreedObj"
            },
            {
                label: "Copy info:",
                type: "button",
                className: "copyBreeding"
            }
        ]
        
        $cardBody.append(
            $("<div></div>", {
                "class": "breedDiv",
                "data-breed": breedingNum,
                "data-dam": damNum
            }).append(
                $("<hr></hr>")
            )
        );

        var $body = $cardBody.find(".breedDiv").last();

        for(row of initialRows){
            $body.append(
                this.makeRowFromObj(row, damNum, "dam", true, breedingNum, "breed")
            )
        }

        $body.find(".addPlugCheck").prop("value", "Plug check").on("click", (e)=>{
            this.addPlugCheck(damNum, breedingNum);
        }).closest(".row").after(
            $("<div></div>", {
                "class": "plugsDiv",
                "data-dam": damNum,
                "data-breed": breedingNum
            }).append(
                this.makeTopLabelRow(this.plugLabels)
            )
        );

        $body.find(".addMass").prop("value", "Add mass").on("click", (e)=>{
            this.addMass(damNum, breedingNum);
        }).closest(".row").after(
            $("<div></div>", {
                "class": "massesDiv",
                "data-dam": damNum,
                "data-breed": breedingNum
            }).append(
                this.makeTopLabelRow(this.massLabels)
            )
        );

        $body.find(".deleteBreeding").prop("value", "Delete Breeding").on("click", (e)=>{
            this.deleteBreedingFuncs(damNum, breedingNum);
        });

        $body.find(".copyBreeding").prop("value", "Copy Breeding").on("click", (e)=>{
            this.copyDamBreedingToClipboard(damNum, breedingNum);
        });

        this.makeSireList(damNum, breedingNum);
        var damBreeedingSearch = this.damSearch(damNum) + this.breedingSearch(breedingNum);
        // if(this.mode === "edit"){
        //     $jq351(".sireBreeding"+damBreeedingSearch).selectize({});
        // }

        // $body.find(".addBreeding").prop("value", "Add Breeding").on("click", (e)=>{
        //     this.addDamBreeding(damNum);
        // });

        $body.find(".updateDamBreedObj").on("change", (e)=>{
            // debugger;
            var $el = $(e.target); // not currentTarget, because the .updateDamObj gets put on the row
            var val = $el.val();
            // Store only the text and no HTML elements.
            valSafe = this.encodeHTML(val);
            var thisProp = $el.data("watch");
            this.dams[damNum].breedings[breedingNum][thisProp] = valSafe;

            if(thisProp === "initialMass"){
                this.calcMassChange(damNum, breedingNum);
            }
            if(thisProp === "breedDate"){
                this.updateBreedingWatchDates(damNum, breedingNum);
            }
        });

        this.resize();
    },

    plugLabels: ["Date", "Plug", "Comments", "Delete"],
    massLabels: ["Date", "Mass", "% initial mass", "Delete"],

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

    addPlugCheck: function(damNum, breedingNum){
        var damInfo = this.dams[damNum];
        var bInfo = damInfo.breedings[breedingNum];

        var plugCheckNums = bInfo.plugCheckNums;
        var plugChecks = bInfo.plugChecks;

        var plugCheckNum = this.getNextNum(plugCheckNums);

        // if(plugCheckNums.length>0){
        //     var lastPlugCheckNum = plugCheckNums[plugCheckNums.length - 1];
        //     var plugCheckNum = lastPlugCheckNum + 1;
        // } else {
        //     var plugCheckNum = 1;
        // }

        var inArray = this.checkInArray(plugCheckNum, plugCheckNums);
        if(! inArray){
            // debugger;
            plugCheckNums.push(plugCheckNum);
            plugChecks[plugCheckNum] = {
                plugDate: NaN,
                plugCheck: null,
                plugComments: null
            };

            this.makePlugEntry(damNum, breedingNum, plugCheckNum);
        }
    },

    makePlugEntry: function(damNum, breedingNum, plugNum){
        var $card = $("<div></div>", {
            "class": "card plugCard",
            "data-dam": damNum,
            "data-breed": breedingNum,
            "data-plug": plugNum
        }).append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-6 d-md-none row labelRow"
                })
            ).append(
                $("<div></div>", {
                    "class": "col-6 col-md-12 row plugRow"
                })
            )
        );

        for(label of this.plugLabels){
            $card.find(".labelRow").append(
                $("<div></div>", {
                    "class": "col-12 font-weight-bold"
                }).append(label)
            );
        }

        var inputCols = [
            {
                "type": "date",
                "className": "plugDate"
            },
            {
                "type": "select",
                "className": "plugCheck",
                "optionsObj": [
                    {
                        value: "neg",
                        text: "-/-"
                    },
                    {
                        value: "1",
                        text: "?"
                    },
                    {
                        value: "2",
                        text: "+/-"
                    },
                    {
                        value: "3",
                        text: "+/+"
                    },
                    {
                        value: "red",
                        text: "Red"
                    },
                    {
                        value: "closed",
                        text: "Closed VO"
                    },
                ]
            }, {
                "type": "textarea",
                "className": "plugComments"
            }, {
                "type": "button",
                "className": "deletePlug"
            }
        ]

        for(colObj of inputCols){
            $card.find(".plugRow").append(
                $("<div></div>", {
                    "class": "col-12 col-md-" + Math.floor(12/inputCols.length)
                }).append(
                    this.makeInput(
                        colObj.type,
                        colObj.className,
                        damNum,
                        colObj.optionsObj,
                        "dam",
                        true,
                        breedingNum,
                        "breed",
                        true,
                        plugNum,
                        "plug"
                    )
                )
            )
        }

        $card.find(".deletePlug").prop("value", "Delete").on("click", (e)=>{
            this.deletePlugFuncs(damNum, breedingNum, plugNum);
        });

        $card.find(".plugRow").on("change", (e)=>{
            var $el = $(e.target);
            var val = $el.val();
            // Store only the text and no HTML elements.
            valSafe = this.encodeHTML(val);
            var thisProp = $el.data("watch");
            this.dams[damNum].breedings[breedingNum].plugChecks[plugNum][thisProp] = valSafe;

            this.updateBreedingWatchDates(damNum, breedingNum);
        });

        $(".plugsDiv"+this.damSearch(damNum)+this.breedingSearch(breedingNum)).append($card);
        this.resize();
    },

    addMass: function(damNum, breedingNum){
        var damInfo = this.dams[damNum];
        var bInfo = damInfo.breedings[breedingNum];

        var massNums = bInfo.massNums;
        var masses = bInfo.masses;

        var massNum = this.getNextNum(massNums);

        // if(massNums.length>0){
        //     var lastMassNum = massNums[massNums.length - 1];
        //     var massNum = lastMassNum + 1;
        // } else {
        //     var massNum = 1;
        // }

        var inArray = this.checkInArray(massNum, massNums);
        if(! inArray){
            // debugger;
            massNums.push(massNum);
            masses[massNum] = {
                massDate: NaN,
                mass: null
            };

            this.makeMassEntry(damNum, breedingNum, massNum);
        }
    },

    makeMassEntry: function(damNum, breedingNum, massNum){
        // debugger;
        var $card = $("<div></div>", {
            "class": "card massCard",
            "data-dam": damNum,
            "data-breed": breedingNum,
            "data-mass": massNum
        }).append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-6 d-md-none row labelRow"
                })
            ).append(
                $("<div></div>", {
                    "class": "col-6 col-md-12 row massRow"
                })
            )
        );

        for(label of this.massLabels){
            $card.find(".labelRow").append(
                $("<div></div>", {
                    "class": "col-12 font-weight-bold"
                }).append(label)
            );
        }

        var inputCols = [
            {
                "type": "date",
                "className": "massDate"
            },
            {
                "type": "number",
                "className": "mass"
            }, 
            {
                "type": "noEntry",
            },
            {
                "type": "button",
                "className": "deleteMass"
            }
        ]

        for(colObj of inputCols){
            if(colObj.type === "noEntry"){
                $card.find(".massRow").append(
                    $("<div></div>", {
                        "class": "change col-12 col-md-" + Math.floor(12/inputCols.length),
                        "data-dam": damNum,
                        "data-breed": breedingNum,
                        "data-mass": massNum
                    }).append(
                        "Enter new mass"
                    )
                )
            } else {
                $card.find(".massRow").append(
                    $("<div></div>", {
                        "class": "col-12 col-md-" + Math.floor(12/inputCols.length)
                    }).append(
                        this.makeInput(
                            colObj.type,
                            colObj.className,
                            damNum,
                            colObj.optionsObj,
                            "dam",
                            true,
                            breedingNum,
                            "breed",
                            true,
                            massNum,
                            "mass"
                        )
                    )
                )
            }
            
        }

        $card.find(".deleteMass").prop("value", "Delete").on("click", (e)=>{
            this.deleteMassFuncs(damNum, breedingNum, massNum);
        });

        $card.find(".massRow").on("change", (e)=>{
            var $el = $(e.target);
            var val = $el.val();
            // Store only the text and no HTML elements.
            valSafe = this.encodeHTML(val);
            var thisProp = $el.data("watch");
            this.dams[damNum].breedings[breedingNum].masses[massNum][thisProp] = valSafe;
        });

        var damSearch = this.damSearch(damNum);
        var breedingSearch = this.breedingSearch(breedingNum);
        var massSearch = this.massSearch(massNum);
        var searchString = damSearch + breedingSearch + massSearch;

        $card.find(".mass").on("input", (e)=>{
            var $el = $(e.currentTarget);
            var newMass = $el.val();

            var initialMass = this.dams[damNum].breedings[breedingNum].initialMass;
            var massText = this.calcPercMass(newMass, initialMass);

            $(".change"+searchString).text(massText);
        })


        $(".massesDiv"+ damSearch + breedingSearch).append($card);
        this.resize();
    },

    calcMassChange: function(damNum, breedingNum){
        // debugger;
        var bInfo = this.dams[damNum].breedings[breedingNum];
        // console.log(bInfo);
        var m1 = bInfo.initialMass;
        var ds = this.damSearch(damNum);
        var bs = this.breedingSearch(breedingNum);

        for(massNum of bInfo.massNums){
            var ms = this.massSearch(massNum);
            var newMass = bInfo.masses[massNum].mass;

            var text = this.calcPercMass(newMass, m1);
            $(".change"+ds+bs+ms).text(text);
        }
    },

    calcPercMass: function (newMass, initMass) {
        var newVal = parseFloat(newMass);
        var m1 = parseFloat(initMass);

        var text;
        if(newVal > 0 && m1 > 0) {        
            var percChange = (newVal)/(m1) * 100;
            text = percChange.toFixed(1)
        } else if(! newVal > 0){
            text = "Enter new mass";
        } else {
            text = "Enter initial mass";
        };
        return(text);
    },

    makeEstDatesTable: function(){
        var damObjs = this.getDamsForImpDates();

        var labels = this.damDatesLabels;

        const tableData = [labels];

        for(damObj of damObjs){
            var damNum = damObj.damNum;
            var breedingNum = damObj.breedingNum;

            var datesInfo = this.getDamDates(damNum, breedingNum);
    
            var row = [], val;
            for (label of labels){
                val =datesInfo[label];
                if(!val){val = ""}
                row.push(val);
            }
    
            tableData.push(row);
        }

        $tableDiv = $(".estExpDatesTable");

        this.createTable(tableData, true, false, $tableDiv);

        $tableDiv.find("tr").each((i,e)=>{
            $(e).find("td, th").each((i,e)=>{
                if(i===2){
                    var DOBcertain = $(e).text();
                    $(e).addClass("hide");
                    if(DOBcertain === "true"){
                        $(e).parent().addClass("isCertain");
                    } else{
                        $(e).parent().removeClass("isCertain");
                    }
                }
                var text = $(e).text();
                if(this.isValidDate(text)){
                    $(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday: "short", month: "short", day: "2-digit"}));
                }
            })
        });
    },

    makeDamsBreedingTable: function(){
        var dams = this.dams;
        var damNums = this.damNums;

        var labels = this.damBreedingLabels;

        const tableData = [labels];

        for(damNum of damNums){
            var damInfo = dams[damNum];
            var breedingNums = damInfo.breedingNums;
            for(breedingNum of breedingNums){
                var bInfo = this.getDamBreedingInfo(damNum, breedingNum);
    
                var row = [], val;
                for (label of labels){
                    val =bInfo[label];
                    if(!val){val = ""}
                    row.push(val);
                }
    
                tableData.push(row);
            }
        }

        $tableDiv = $(".damsBreedingsInfoTable");

        this.createTable(tableData, true, false, $tableDiv);
    },

    getDamDates: function(damNum, breedingNum){
        var dam = this.dams[damNum]
        var breeding = this.dams[damNum].breedings[breedingNum];

        var damID = dam.damID;
        if(!damID){
            damID = "d"+damNum;
        }

        var litterNum = breeding.litterNum;
        if(!litterNum){
            litterNum = breedingNum;
        }
        var specDamID = damID + "-" + (""+litterNum).padStart(2, "0");

        var DOB, DOBcertain = false;
        if(! breeding.litterDOB){
            if(!breeding.goodPlugDate){
                if(!breeding.likelyPlugDate){
                    if(!breeding.potentialPlugDate){
                        DOB = this.addDays(breeding.breedDate, 21);
                    } else{
                        DOB = this.addDays(breeding.potentialPlugDate, 20);
                    }
                } else {
                    DOB = this.addDays(breeding.likelyPlugDate, 20);
                }
            } else {
                DOB = this.addDays(breeding.goodPlugDate, 20);
            }
        } else {
            DOB = breeding.litterDOB;
            DOBcertain = true;
        }

        var P4 = this.addDays(DOB, 4);
        var P11 = this.addDays(DOB, 11);
        var P21 = this.addDays(DOB, 21);
        var P70 = this.addDays(DOB, 70);
        var P91 = this.addDays(DOB, 91);
        

        var damObj = {
            damID: specDamID,
            DOB: DOB,
            DOBcertain: DOBcertain,
            P4: P4,
            P11: P11,
            P21: P21,
            P70: P70,
            P91: P91
        };

        return damObj;
    },

    damDatesLabels: [
        "damID",
        "DOB",
        "DOBcertain",
        "P4",
        "P11",
        "P21",
        "P70",
        "P91"
    ],

    getDamBreedingInfo: function(damNum, breedingNum){
        var dam = this.dams[damNum]
        var breeding = this.dams[damNum].breedings[breedingNum];

        var damID = dam.damID;
        if(!damID){
            damID = "d"+damNum;
        }

        var litterNum = breeding.litterNum;
        if(!litterNum){
            litterNum = breedingNum;
        }
        var specDamID = damID + "-" + (""+litterNum).padStart(2, "0");

        var damGenNum = dam.damGeneration;
        var damStrain, damGeneration, damDOB
        if(damGenNum){
            var damGenInfo = this.damGenerations[damGenNum];

            damStrain = damGenInfo.damGenStrain;
            damGeneration = damGenInfo.damGen;
            damDOB = damGenInfo.damGenDOB;
        }

        var sireNum = breeding.sireBreeding;
        var sireID, sireStrain, sireGeneration, sireDOB
        if(sireNum){
            var sireInfo = this.sires[sireNum];

            sireID = sireInfo.sireID;
            sireGenNum = sireInfo.sireGeneration;

            if(sireGenNum){
                var sireGenInfo = this.sireGenerations[sireGenNum];

                sireStrain = sireGenInfo.sireGenStrain;
                sireGeneration = sireGenInfo.sireGen;
                sireDOB = sireGenInfo.sireGenDOB;
            }

        }

        var plugDate = breeding.potentialPlugDate // TODO calc from earliest possible

        var damObj = {
            damID: specDamID,
            litterNum: breeding.litterNum,
            dam: damID,
            damStrain: damStrain,
            damGeneration: damGeneration,
            damDOB: damDOB,
            sire: sireID,
            sireStrain: sireStrain,
            sireGeneration: sireGeneration,
            sireDOB: sireDOB,
            breedDate: breeding.breedDate,
            plugDate: plugDate,
            DOB: breeding.litterDOB,
            Sac_or_stop: breeding.stopTrackingDate
        };

        return damObj
    },

    damBreedingLabels: [
        "damID",
        "litterNum",
        "dam",
        "damStrain",
        "damGeneration",
        "damDOB",
        "sire",
        "sireStrain",
        "sireGeneration",
        "sireDOB",
        "breedDate",
        "plugDate",
        "DOB",
        "Sac_or_stop"
    ],

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

    getDamsDue: function(dueDate = this.dateToday){
        // debugger;
        var pObj = this.getDamsForPlugChecks(dueDate);
        var dPlug = pObj.remaining;
        var sepObj = this.getDamsForSeparation(dueDate);
        var dSep = sepObj.due;
        var bObj = this.getDamsForBirth(dueDate);
        var dBirth = bObj.due;

        var nPlug = this.getDamNamesArray(dPlug);
        var nSep = this.getDamNamesArray(dSep);
        var nBirth = this.getDamNamesArray(dBirth);

        this.printDams(nPlug, $(".plugCheckList"));
        this.printDams(nSep, $(".sepMaleList"));
        this.printDams(nBirth, $(".checkBirthsList"));

        this.makeSeparationTable(sepObj.remaining);
        this.makeCheckForBirthsTable(bObj.remaining);
        this.makeEstDatesTable();
        this.makeDamsBreedingTable();
        this.resize();
    },

    sepTableLabels: ["damID", "sepBreedingDate", "sepPotentialPlugDate", "sepLikelyPlugDate", "sepGoodPlugDate"],
    sepTableHeaders: ["Dam", "Breed Date + 12", "Potential Plug + 11", "Likely Plug + 11", "Good Plug + 11"],

    makeSeparationTable: function(toBeSeparated){
        var dams = this.dams;

        var labels = this.sepTableLabels;

        const tableData = [this.sepTableHeaders];

        for(damBreedingObj of toBeSeparated){
            var damNum = damBreedingObj.damNum;
            var breedingNum = damBreedingObj.breedingNum;

            var damInfo = dams[damNum];
            var bInfo = damInfo.breedings[breedingNum];

            var row = [], val;
            for (label of labels){
                if(label == "damID"){
                    val = damInfo[label];
                    if(!val){val = "Dam " + damNum}
                } else {
                    val =bInfo[label];
                    if(!val){val = ""}
                }
                row.push(val);
            }

            tableData.push(row);
        }

        $tableDiv = $(".sepDueDatesTable");

        this.createTable(tableData, true, false, $tableDiv);

        $tableDiv.find("td").each((i,e)=>{
            var text = $(e).text();
            if(this.isValidDate(text)){
                // debugger;
                if(text <= luxon.DateTime.fromISO($("#dueDate").val()).toISODate()){
                    $(e).addClass("isDue");
                }
                $(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday: "short", month: "short", day: "2-digit"}));
            }
        });
    },

    birthTableLabels: ["damID", "birthBreedingDate", "birthPotentialPlugDate", "birthLikelyPlugDate", "birthGoodPlugDate"],
    birthTableHeaders: ["Dam", "Breed Date + 19", "Potential Plug + 18", "Likely Plug + 18", "Good Plug + 18"],

    makeCheckForBirthsTable: function(toBeSeparated){
        var dams = this.dams;

        var labels = this.birthTableLabels;

        const tableData = [this.birthTableHeaders];

        for(damBreedingObj of toBeSeparated){
            var damNum = damBreedingObj.damNum;
            var breedingNum = damBreedingObj.breedingNum;

            var damInfo = dams[damNum];
            var bInfo = damInfo.breedings[breedingNum];

            var row = [], val;
            for (label of labels){
                if(label == "damID"){
                    val = damInfo[label];
                    if(!val){val = "Dam " + damNum}
                } else {
                    val =bInfo[label];
                    if(!val){val = ""}
                }
                row.push(val);
            }

            tableData.push(row);
        }

        $tableDiv = $(".checkForBirthsTable");

        this.createTable(tableData, true, false, $tableDiv);

        $tableDiv.find("td").each((i,e)=>{
            var text = $(e).text();
            if(this.isValidDate(text)){
                // debugger;
                if(text <= luxon.DateTime.fromISO($("#dueDate").val()).toISODate()){
                    $(e).addClass("isDue");
                }
                $(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday: "short", month: "short", day: "2-digit"}));
            }
        });
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

    getDueDatesForDam: function(damNum){
        var waterDate = this.getWaterDueDate(damNum);
        var foodDate = this.getFoodDueDate(damNum);
        var bottomDate = this.getBottomDueDate(damNum);
        var topDate = this.getTopDueDate(damNum);

        this.dams[damNum].water = waterDate;
        this.dams[damNum].food = foodDate;
        this.dams[damNum].bottom = bottomDate;
        this.dams[damNum].top = topDate;
        
        return {
            water: waterDate,
            food: foodDate,
            bottom: bottomDate,
            top: topDate
        }
    },

    allDamTableLabels: [
        "damID",
        "damLoc",
        "damType",
        "food",
        "water",
        "bottom",
        "top",
        "barcode"
    ],

    makeDueDatesTable: function(){
        var damNums = this.damNums;
        var dams = this.dams;

        var labels = this.allDamTableLabels;

        const tableData = [labels];

        for(damNum of damNums){
            this.getDueDatesForDam(damNum);
            var dam = dams[damNum]
            var endDate = dam.endDam;

            if(!endDate){
                var row = [];
                for (label of labels){
                    var val =dam[label];
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
                if(text <= this.dateToday){
                    $(e).addClass("isDue");
                }
                $(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday: "short", month: "short", day: "2-digit"}))
            }
        })
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


    damGenLabels: ["damGen", "damGenDOB", "damGenStrain"],
    sireGenLabels: ["sireGen", "sireGenDOB", "sireGenStrain"],

    addDamGenFromTable: function(obj){
        var genNum = this.getNextNum(this.damGenerationNums);
        // if(this.damGenerationNums.length>0){
        //     var lastDamGeneration = this.damGenerationNums[this.damGenerationNums.length - 1];
        //     var genNum = lastDamGeneration + 1;
        // } else {
        //     var genNum = 1;
        // }
        this.addDamGeneration(genNum);
        var damGenerationSearch = this.damGenSearch(genNum);

        var headers = this.damGenLabels;
        for(header of headers){
            $("." + header + damGenerationSearch).val(obj[header]);
            this.damGenerations[genNum][header] = obj[header];
        }
        this.updateDamGenList(genNum);
        return(genNum);
    },

    addSireGenFromTable: function(obj){
        var genNum = this.getNextNum(this.sireGenerationNums);
        // if(this.sireGenerationNums.length>0){
        //     var lastSireGeneration = this.sireGenerationNums[this.sireGenerationNums.length - 1];
        //     var sireGenerationNum = lastSireGeneration + 1;
        // } else {
        //     var sireGenerationNum = 1;
        // }
        this.addSireGeneration(genNum);
        var sireGenerationSearch = this.sireGenSearch(genNum);

        var headers = this.sireGenLabels;
        for(header of headers){
            $("." + header + sireGenerationSearch).val(obj[header]);
            this.sireGenerations[genNum][header] = obj[header];
        }
        this.updateSireGenList(genNum);
        return genNum;
    },

    addDamFromTable: function(obj, headers){
        var damNum = this.getNextNum(this.damNums);
        // if(this.damNums.length>0){
        //     var lastDam = this.damNums[this.damNums.length - 1];
        //     var damNum = lastDam + 1;
        // } else {
        //     var damNum = 1;
        // }
        this.addDam(damNum);
        var damSearch = this.damSearch(damNum);

        for(header of headers){
            var damGen, damGenDOB, damGenStrain;
            if(header === "damID"){
                $("." + header + damSearch).val(obj[header]);
                this.dams[damNum][header] = obj[header];
            } else {
                if(header === "damGen" || header.toLowerCase().includes("generation")){
                    damGen = obj[header];
                } else if(header === "damGenDOB" || header.toLowerCase().includes("DOB")){
                    damGenDOB = obj[header];
                } else if(header === "damGenStrain" || header.toLowerCase().includes("strain")){
                    damGenStrain = obj[header];
                }
            }
        }
        var matchInfo = this.getMatchingObjSubset(
            this.damGenerations, 
            "damGen", 
            damGen, 
            "damGenDOB", 
            damGenDOB, 
            "damGenStrain", 
            damGenStrain
        )

        var dInfo = this.dams[damNum]
        if(matchInfo.matchingObj.length>0){
            $(".damGeneration"+damSearch).val(matchInfo.matchingObj[0])
        } else if(matchInfo.noMatches && damGen){ // means no matches for gen - add it
            var obj = {
                damGen: damGen,
                damGenDOB: damGenDOB,
                damGenStrain: damGenStrain
            }
            var genNum = this.addDamGenFromTable(obj);
            $(".damGeneration"+damSearch).val(genNum);
        }
        this.updateObjFromVal($(".damGeneration"+damSearch), this.dams[damNum]);
        
    },

    addSireFromTable: function(obj, headers){
        var sireNum = this.getNextNum(this.sireNums);
        // if(this.sireNums.length>0){
        //     var lastSire = this.sireNums[this.sireNums.length - 1];
        //     var sireNum = lastSire + 1;
        // } else {
        //     var sireNum = 1;
        // }
        this.addSire(sireNum);
        var sireSearch = this.sireSearch(sireNum);

        for(header of headers){
            var sireGen, sireGenDOB, sireGenStrain;
            if(header === "sireID"){
                $("." + header + sireSearch).val(obj[header]);
                this.sires[sireNum][header] = obj[header];
            } else {
                if(header === "sireGen" || header.toLowerCase().includes("generation")){
                    sireGen = obj[header];
                } else if(header === "sireGenDOB" || header.toLowerCase().includes("DOB")){
                    sireGenDOB = obj[header];
                } else if(header === "sireGenStrain" || header.toLowerCase().includes("strain")){
                    sireGenStrain = obj[header];
                }
            }
        }
        var matchInfo = this.getMatchingObjSubset(
            this.sireGenerations, 
            "sireGen", 
            sireGen, 
            "sireGenDOB", 
            sireGenDOB, 
            "sireGenStrain", 
            sireGenStrain
        )
        if(matchInfo.matchingObj.length>0){
            $(".sireGeneration"+sireSearch).val(matchInfo.matchingObj[0])
        } else if(matchInfo.noMatches && sireGen){ // means no matches for gen - add it
            var obj = {
                sireGen: sireGen,
                sireGenDOB: sireGenDOB,
                sireGenStrain: sireGenStrain
            }
            var genNum = this.addSireGenFromTable(obj);
            $(".sireGeneration"+sireSearch).val(genNum);

        }
        this.updateSireList(sireNum);
        this.updateObjFromVal($(".sireGeneration"+sireSearch), this.sires[sireNum]);
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
            if(headers.join("") === this.damGenLabels.join("")){
                for(obj of dataByHeader){
                    this.addDamGenFromTable(obj);
                }
            } else if(headers.join("") === this.sireGenLabels.join("")){
                for(obj of dataByHeader){
                    this.addSireGenFromTable(obj);
                }
            } else if(headers[0] === "damID") {
                for(obj of dataByHeader){
                    this.addDamFromTable(obj, headers);
                }
            } else if(headers[0] === "sireID") {
                for(obj of dataByHeader){
                    this.addSireFromTable(obj, headers);
                }
            } else {
                bootbox.alert("Please use a table that has appropriate headers so that we know what to do with it. [damGen, damGenDOB, damGenStrain], [sireGen, sireGenDOB, sireGenStrain], [damID], or [sireID]")
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


    // Plug dates

    updateBreedingWatchDates: function(damNum, breedingNum){
        // debugger;
        var damInfo = this.dams[damNum];
        var bInfo = damInfo.breedings[breedingNum];
        var plugCheckNums = bInfo.plugCheckNums;

        var breedDate = bInfo.breedDate;

        // earliest date; potential = p, likely = l, good = g
        var pPlug1, lPlug1, gPlug1;
        // start checking separation date
        var sepBreeding, sepPPlug, sepLPlug, sepGPlug;
        // start checking birth day
        var birthBreeding, bPPlug, bLPlug, bGPlug;

        if(breedDate){
            for(plugCheckNum of plugCheckNums){
                var plugCheckInfo = bInfo.plugChecks[plugCheckNum];
                
                // 1 = potential (?) // 2 = likely (+/-) // 3 = good (+/+)
                var plugState = plugCheckInfo.plugCheck;
                var plugDate = plugCheckInfo.plugDate;
                
                if(plugState > 0){
                    if(! pPlug1 || plugDate < pPlug1){
                        pPlug1 = plugDate;
                    }
                    if(plugState > 1){
                        if(! lPlug1 || plugDate < lPlug1){
                            lPlug1 = plugDate;
                        }
                        if(plugState > 2){
                            if(! gPlug1 || plugDate < gPlug1){
                                gPlug1 = plugDate;
                            }
                        }
                    }
                }
            }

            sepBreeding = this.addDays(breedDate, 12);
            birthBreeding = this.addDays(breedDate, 19);

            if(pPlug1){
                sepPPlug = this.addDays(pPlug1, 11);
                bPPlug = this.addDays(pPlug1, 18)
            }
            if(lPlug1){
                sepLPlug = this.addDays(lPlug1, 11);
                bLPlug = this.addDays(lPlug1, 18)
            }
            if(gPlug1){
                sepGPlug = this.addDays(gPlug1, 11);
                bGPlug = this.addDays(gPlug1, 18)
            }
        }

        bInfo["potentialPlugDate"] = pPlug1;
        bInfo["likelyPlugDate"] = lPlug1;
        bInfo["goodPlugDate"] = gPlug1;

        bInfo["sepBreedingDate"] = sepBreeding;
        bInfo["sepPotentialPlugDate"] = sepPPlug;
        bInfo["sepLikelyPlugDate"] = sepLPlug;
        bInfo["sepGoodPlugDate"] = sepGPlug;

        bInfo["birthBreedingDate"] = birthBreeding;
        bInfo["birthPotentialPlugDate"] = bPPlug;
        bInfo["birthLikelyPlugDate"] = bLPlug;
        bInfo["birthGoodPlugDate"] = bGPlug;
    },

    getDamsForPlugChecks: function(dueDate = this.dateToday){
        var damNums = this.damNums;

        const damsToCheck = [];
        const damsForLikely = [];

        for(damNum of damNums){
            var damInfo = this.dams[damNum];

            var breedingNum = this.getDamLatestBreeding(damInfo, dueDate);
            
            if(breedingNum){
                var bInfo = damInfo.breedings[breedingNum];

                if(
                    (! bInfo.sepFromMaleDate || bInfo.sepFromMaleDate > dueDate) &&
                    (! bInfo.litterDOB || bInfo.litterDOB > dueDate) &&
                    (! bInfo.stopTrackingDate || bInfo.stopTrackingDate > dueDate) &&
                    (! bInfo.potentialPlugDate || bInfo.potentialPlugDate > dueDate)
                ){
                    damsToCheck.push(damNum);
                    if(! bInfo.likelyPlugDate || bInfo.likelyPlugDate > dueDate){
                        damsForLikely.push(damNum);
                    }
                }
            }
        }
        return({
            remaining: damsToCheck,
            forLikely: damsForLikely
        });
    },

    getDamsForSeparation: function(dueDate = this.dateToday){
        var damNums = this.damNums;

        const damsToCheck = [];
        const damsDueToCheck = [];

        for(damNum of damNums){
            var damInfo = this.dams[damNum];

            var breedingNum = this.getDamLatestBreeding(damInfo, dueDate);
            
            if(breedingNum){
                var bInfo = damInfo.breedings[breedingNum];

                if(
                    (! bInfo.sepFromMaleDate || bInfo.sepFromMaleDate > dueDate) &&
                    (! bInfo.litterDOB || bInfo.litterDOB > dueDate) &&
                    (! bInfo.stopTrackingDate || bInfo.stopTrackingDate > dueDate)
                ){
                    damsToCheck.push({
                        damNum: damNum,
                        breedingNum: breedingNum
                    });

                    if(bInfo.sepBreedingDate <= dueDate){
                        damsDueToCheck.push(damNum);
                    }
                }
            }
        }
        return({
            remaining: damsToCheck,
            due: damsDueToCheck
        });
    },

    getDamsForBirth: function(dueDate = this.dateToday){
        var damNums = this.damNums;

        const damsToCheck = [];
        const damsDueToCheck = [];

        for(damNum of damNums){
            var damInfo = this.dams[damNum];

            var breedingNum = this.getDamLatestBreeding(damInfo, dueDate);
            
            if(breedingNum){
                var bInfo = damInfo.breedings[breedingNum];

                if(
                    (! bInfo.litterDOB || bInfo.litterDOB > dueDate) &&
                    (! bInfo.stopTrackingDate || bInfo.stopTrackingDate > dueDate)
                ){
                    damsToCheck.push({
                        damNum: damNum,
                        breedingNum: breedingNum
                    });

                    if(bInfo.birthBreedingDate <= dueDate){
                        damsDueToCheck.push(damNum);
                    }
                }
            }
        }
        return({
            remaining: damsToCheck,
            due: damsDueToCheck
        });
    },

    getDamsForImpDates: function(dueDate = this.dateToday){
        var damNums = this.damNums;

        const damsForTable = [];

        for(damNum of damNums){
            var damInfo = this.dams[damNum];

            var breedingNum = this.getDamLatestBreeding(damInfo);
            
            if(breedingNum){
                var bInfo = damInfo.breedings[breedingNum];
                if(
                    (! bInfo.stopTrackingDate || bInfo.stopTrackingDate > dueDate)
                ){
                    damsForTable.push({
                        damNum: damNum,
                        breedingNum: breedingNum
                    });
                }
            }
        }
        return(damsForTable);
    },

    showLatestBreeding: function(){
        var damNums = this.damNums;
        for(damNum of damNums){
            var damInfo = this.dams[damNum];
            var breedingNum = this.getDamLatestBreeding(damInfo);
            if(breedingNum){
                var damSearch = this.damSearch(damNum);
                var breedSearch = this.breedingSearch(breedingNum);
                $(".breedDiv"+damSearch).hide();
                $(".breedDiv"+breedSearch+damSearch).show().find("textarea.autoAdjust").each((i,e)=> {
                    this.updateTextarea(e);
                    // if(! $(e).is(":hidden")) {
                    //     e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
                    // } 
                });;
            }   
        }
        this.resize();
    },

    getDamLatestBreeding: function(damInfo, dueDate = this.dateToday){
        var breedingNums = damInfo.breedingNums;
        var lastBreeding, lastBreedingNum;

        for(breedingNum of breedingNums){
            var bInfo = damInfo.breedings[breedingNum];

            var breedDate = bInfo.breedDate;
            if((!lastBreeding || breedDate > lastBreeding) && breedDate < dueDate){
                lastBreeding = breedDate;
                lastBreedingNum = breedingNum;
            }
        }
        return(lastBreedingNum)
    },

    getPresentDams: function(){
        var damNums = this.damNums;

        const damsToShow = [];

        for(damNum of damNums){
            var damInfo = this.dams[damNum];
            var euthDate = damInfo.damEuthanized;
            if(!euthDate){
                damsToShow.push(damNum);
            }
        }
        return(damsToShow);
    },

    getInProgDams: function(){
        var damNums = this.damNums;

        const damsToShow = [];

        for(damNum of damNums){
            var damInfo = this.dams[damNum];
            var stopShowing = damInfo.damStopShowing;
            var euthDate = damInfo.damEuthanized;
            if(!stopShowing && !euthDate){
                damsToShow.push(damNum);
            }
        }
        return(damsToShow);
    },

    showDamCards: function(damNums){
        $(".damCard").hide();
        for(damNum of damNums){
            var damSearch = this.damSearch(damNum);
            $(".damCard"+damSearch).show().find("textarea.autoAdjust").each((i,e)=> {
                this.updateTextarea(e);
                // if(! $(e).is(":hidden")) {
                //     e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
                // } 
            });;
        }
        this.resize();
    }

};