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
            widgetData: testData,
            dams: {1: {}},
            damNums: [1]
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
        if(parsedJson.damGenerations){
            this.damGenerations = parsedJson.damGenerations;
        }
        if(parsedJson.damGenerationNums){
            for(damGenerationNum of parsedJson.damGenerationNums){
                this.makeDamGenerationCard(damGenerationNum);
            }
            this.damGenerationNums = parsedJson.damGenerationNums;
        }

        if(parsedJson.sireGenerations){
            this.sireGenerations = parsedJson.sireGenerations
        }
        if(parsedJson.sireGenerationNums){
            for(sireGenerationNum of parsedJson.sireGenerationNums){
                this.makeSireGenerationCard(sireGenerationNum);
            }
            this.sireGenerationNums = parsedJson.sireGenerationNums;
        }

        if(parsedJson.sires){
            this.sires = parsedJson.sires
        }
        if(parsedJson.sireNums){
            for(sireNum of parsedJson.sireNums){
                this.makeSireCard(sireNum);
            }
            this.sireNums = parsedJson.sireNums
        }

        if(parsedJson.dams){
            this.dams = parsedJson.dams
        }
        if(parsedJson.damNums){
            for(damNum of parsedJson.damNums){
                this.makeDamCard(damNum);

                var breedingNums = this.dams[damNum].breedingNums;
                if(breedingNums){
                    for(breedingNum of breedingNums){
                        this.makeDamBreeding(damNum, breedingNum);
                    }
                }
            }
            this.damNums = parsedJson.damNums
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
        $jq351("#testSel").selectize({}); // the method 

        // Doesn't  add
        $("#testSel").append(
            "<option value='3'>3</option>"
        );

        // Does add
        $jq351("#testSel")[0].selectize.addOption({
            value: 3,
            text: "3"
        })

        // $("#testSel").selectize({
        //     sortField: "text"
        // });
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

        $(".addDam").on("click", (e)=> {
            if(this.damNums.length > 0){
                var lastDam = this.damNums[this.damNums.length - 1];
                var damNum = lastDam + 1;
            } else {
                var damNum = 1;
            }
            this.addDam(damNum);
        });
        
        $(".addSire").on("click", (e)=> {
            if(this.sireNums.length > 0){
                var lastSire = this.sireNums[this.sireNums.length - 1];
                var sireNum = lastSire + 1;
            } else {
                var sireNum = 1;
            }
            this.addSire(sireNum);
        });

        $(".addDamGen").on("click", (e)=> {
            if(this.damGenerationNums.length > 0){
                var lastDamGeneration = this.damGenerationNums[this.damGenerationNums.length - 1];
                var damGeneration = lastDamGeneration + 1;
            } else {
                var damGeneration = 1;
            }
            this.addDamGeneration(damGeneration);
        });
        
        $(".addSireGen").on("click", (e)=> {
            if(this.sireGenerationNums.length > 0){
                var lastSireGeneration = this.sireGenerationNums[this.sireGenerationNums.length - 1];
                var sireGeneration = lastSireGeneration + 1;
            } else {
                var sireGeneration = 1;
            }
            this.addSireGeneration(sireGeneration);
        });

        $("#collapseDams").on("click", (e)=>{
            this.collapseAllDamCards();
        })

        // $("#addCare").on("click", (e)=>{
        //     var damNums = $("#damSelect").val();
        //     // Text of selected dams
        //     var damDisplayNames = $("#damSelect option:selected").toArray().map(item => item.text).join(", ");

        //     if(damNums && damNums.length>0){
        //         for(damNum of damNums){
        //             if(damNum){
        //                 var date = $("#changeDate").val();
        //                 var changeFood = this.getCheckState($("#changeFood"));
        //                 var changeWater = this.getCheckState($("#changeWater"));
        //                 var changeBottom = this.getCheckState($("#changeBottom"));
        //                 var changeTop = this.getCheckState($("#changeTop"));
        //                 if(this.dams[damNum].damCareNums.length >0){
        //                     var lastCare = this.dams[damNum].damCareNums[this.dams[damNum].damCareNums.length - 1];
        //                     var careNum = lastCare + 1;
        //                 } else {
        //                     var careNum = 1;
        //                 }
        //                 this.addCare(damNum, careNum, date, changeFood, changeWater, changeBottom, changeTop);
        //             }
        //         }
        //         this.getDamsDue($("#dueDate").val());
        //         this.makeDateCareTable($("#damDate").val());
        //         this.makeDueDatesTable();
        //         $(".damCaresTable").html("");
        //         $("#addCareNotes").text("Added care for " + damDisplayNames + " on " + luxon.DateTime.fromISO(date).toLocaleString(luxon.DateTime.DATE_HUGE));
        //     } else {
        //         $("#addCareNotes").text("Select at least one dam")
        //     }
        // });

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
        // $("#changeDate").val(dateToday);
        // $("#dueDate").val(dateToday).on("change", (e)=>{
        //     this.getDamsDue($(e.currentTarget).val());
        // }).each((i,e)=>{
        //     this.getDamsDue($(e).val());
        // });

        // $("#careDate").val(dateToday).on("change", (e)=>{
        //     this.makeDateCareTable($(e.currentTarget).val());
        // }).each((i,e)=>{
        //     this.makeDateCareTable($(e).val());
        // });

        // this.makeDueDatesTable();

        $("#damSelect").attr(
            "size",
            Math.min(this.damNums.length, 15)
        );

        $("#selFood").on("click", (e)=>{
            this.selectFood($("#changeDate").val());
        });

        $("#selFoodWater").on("click", (e)=>{
            this.selectFoodWater($("#changeDate").val());
        });

        $("#selBottom").on("click", (e)=>{
            this.selectDamBottom($("#changeDate").val());
        });

        $("#selTop").on("click", (e)=>{
            this.selectDamTop($("#changeDate").val());
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

        this.resize();
    },

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

    damSearch: function (dam) {
        var damSearch = this.dataSearch("dam", dam);
        return damSearch;
    },

    sireSearch: function (sire) {
        var sireSearch = this.dataSearch("sire", sire);
        return sireSearch;
    },

    damGenSearch: function (damGen) {
        var damGenSearch = this.dataSearch("damgen", damGen);
        return damGenSearch;
    },

    sireGenSearch: function (sireGen) {
        var sireGenSearch = this.dataSearch("siregen", sireGen);
        return sireGenSearch;
    },

    breedingSearch: function (breedingNum) {
        var breedingSearch = this.dataSearch("breed", breedingNum);
        return breedingSearch;
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
                breedings: {}
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
                "class": "col col-md-6 mt-2 damCard",
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
                    addRowClass: " updateDamObj"
                },
                {
                    label: "Delete:",
                    type: "button",
                    className: "deleteDam",
                    optionsObj: [],
                    addRowClass: " hideView"
                },
                {
                    label: "Generation:",
                    type: "select",
                    className: "damGeneration",
                    addRowClass: " updateDamObj",
                    optionsObj: [
                        {
                            value: "",
                            text: "[Select]"
                        }
                    ]
                }, {
                    label: "Add breeding:",
                    type: "button",
                    className: "addBreeding"
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, damNum, "dam")
                )
            }

            $body.find(".deleteDam").prop("value", "Delete Dam").on("click", (e)=>{
                this.deleteDamFuncs(damNum);
            });

            $body.find(".addBreeding").prop("value", "Add Breeding").on("click", (e)=>{
                this.addDamBreeding(damNum);
            });

            $body.find(".updateDamObj").on("change", (e)=>{
                // debugger;
                var $el = $(e.target); // not currentTarget, because the .updateDamObj gets put on the row
                var val = $el.val();
                // Store only the text and no HTML elements.
                valSafe = this.encodeHTML(val);
                var thisProp = $el.data("watch");
                this.dams[damNum][thisProp] = valSafe;
                this.makeDueDatesTable();
            });

        return $body
    },
    addSire: function(sireNum){
        var inArray = this.checkInArray(sireNum, this.sireNums);
        if(! inArray){
            // debugger;
            this.sireNums.push(sireNum);
            this.sires[sireNum] = {
                sireID: "",
                sireLoc: ""
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

    makeSireList: function(damNum, damBreedingNum){
        // debugger;
        var sires = this.sires;
        
        var sireNums = this.sireNums;
        var damSearch = this.damSearch(damNum);
        var breedingSearch = this.breedingSearch(damBreedingNum);
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

        if(this.mode === "edit"){
            $jq351("select.sireBreeding").each((i,e)=>{
                $(e)[0].selectize.addOption({
                    value: sireNum,
                    text: sireID
                })
            });
        }
    },

    setSelectizeValue: function(elName, value){
        $("elName").val(value);
        $jq351("elName")[0].selectize.setValue(value);
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
                this.deleteSireFuncs(sireNum);
            });

            $body.find(".updateSireObj").on("change", (e)=>{
                // debugger;
                var $el = $(e.target); // not currentTarget, because the .updateSireObj gets put on the row
                var val = $el.val();
                // Store only the text and no HTML elements.
                valSafe = this.encodeHTML(val);
                var thisProp = $el.data("watch");
                this.sires[sireNum][thisProp] = valSafe;
                this.makeDueDatesTable();
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

            this.makeDamGenerationCard(damGenerationNum);
        }
    },

    makeDamGenerationCard: function(damGenerationNum){
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
        var $body = this.makeDamGenerationCardBody(damGenerationNum);
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

    makeDamGenerationCardBody: function(damGenerationNum){
        console.log("genNum:", damGenerationNum);
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
                this.deleteDamGenerationFuncs(damGenerationNum);
            });

            $body.find(".updateDamGenerationObj").on("change", (e)=>{
                // debugger;
                var $el = $(e.target); // not currentTarget, because the .updateDamGenerationObj gets put on the row
                var val = $el.val();
                // Store only the text and no HTML elements.
                valSafe = this.encodeHTML(val);
                var thisProp = $el.data("watch");
                console.log(thisProp, valSafe);
                this.damGenerations[damGenerationNum][thisProp] = valSafe;

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

            this.makeSireGenerationCard(sireGenerationNum);
        }
    },

    makeSireGenerationCard: function(sireGenerationNum){
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
        var $body = this.makeSireGenerationCardBody(sireGenerationNum);
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

    makeSireGenerationCardBody: function(sireGenerationNum){
        console.log("genNum:", sireGenerationNum);
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
                this.deleteSireGenerationFuncs(sireGenerationNum);
            });

            $body.find(".updateSireGenerationObj").on("change", (e)=>{
                // debugger;
                var $el = $(e.target); // not currentTarget, because the .updateSireGenerationObj gets put on the row
                var val = $el.val();
                // Store only the text and no HTML elements.
                valSafe = this.encodeHTML(val);
                var thisProp = $el.data("watch");
                console.log(thisProp, valSafe);
                this.sireGenerations[sireGenerationNum][thisProp] = valSafe;

                this.updateSireGenList(sireGenerationNum);
            });
        return $body
    },

    makeInput: function(inputType, className, dataNum, optionsObj, dataName, addSecondData = false, secondDataNum = NaN, secondDataName = null){
        var lowerCaseName = className.toLowerCase();
        dataString = "data-"+dataName.toLowerCase();
        var idNum = dataNum;
        if(addSecondData){
            secondDataString = "data-" + secondDataName.toLowerCase();
            idNum = "a" + dataNum + "b" + secondDataNum
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

    deleteDamFuncs: function (damNum) {
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
                $(".damCard"+damSearch).remove();
                // $("tr"+damSearch).remove();

                // remove everything with this data attribute
                $(damSearch).remove();
            }
        );
        this.resize();
    },

    deleteBreedingFuncs: function (damNum, damBreedingNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam breeding?", 
            ()=>{
                var thisDam = this.dams[damNum];
                var damBreedingNums = thisDam.breedingNums;
                var damBreedings = thisDam.breedings;
                // Remove it from the damNums
                var index = damBreedingNums.indexOf(damBreedingNum);
                if(index > -1){
                    damBreedingNums.splice(index, 1);
                }
        
                // Remove it from the dams object
                delete damBreedings[damBreedingNum];
        
                // console.log(this.damNums);
        
                var damSearch = this.damSearch(damNum);
                var breedingSearch = this.breedingSearch(damBreedingNum);
                
                // remove everything with this data attribute
                $(damSearch+breedingSearch).remove();
            }
        );
        this.resize();
    },

    deleteDamGenerationFuncs: function (damGenerationNum) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dam generation?", 
            ()=>{
                // Remove it from the damGenerationNums
                var index = this.damGenerationNums.indexOf(damGenerationNum);
                if(index > -1){
                    this.damGenerationNums.splice(index, 1);
                }
        
                // Remove it from the damGenerations object
                delete this.damGenerations[damGenerationNum];
        
                // console.log(this.damGenerationNums);
        
                var damGenSearch = this.damGenSearch(damGenerationNum);
                $(".damGenCard"+damGenSearch).remove();
                // $("tr"+damGenerationSearch).remove();

                // remove everything with this data attribute
                $(damGenSearch).remove();
            }
        );
        this.resize();
    },

    addDamBreeding: function(damNum){
        var damBreedingNums = this.dams[damNum].breedingNums;
        var damBreedings = this.dams[damNum].breedings;

        if(damBreedingNums.length>0){
            var lastDamBreeding = damBreedingNums[damBreedingNums.length - 1];
            var damBreedingNum = lastDamBreeding + 1;
        } else {
            var damBreedingNum = 1;
        }

        var inArray = this.checkInArray(damBreedingNum, damBreedingNums);
        if(! inArray){
            // debugger;
            damBreedingNums.push(damBreedingNum);
            damBreedings[damBreedingNum] = {
                sireBreeding: null, 
                breedDate: NaN, 
                breedCage: NaN,
                breedCageLoc: null, 
                initialMass: NaN, 
                massNums: [], 
                masses: {},
                plugCheckNums: [],
                plugChecks: {},
                sepFromMaleDate: NaN,
                sepDamCageNum: NaN
            };

            this.makeDamBreeding(damNum, damBreedingNum);
        }

    },
    
    makeDamBreeding: function(damNum, damBreedingNum){
        var damSearch = this.damSearch(damNum);
        var $cardBody = $(".damCard"+damSearch).find(".card-body");

        var initialRows = [
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
                className: "addPlugCheck"
            },
            {
                label: "Add mass:",
                type: "button",
                className: "addMass"
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
                className: "sepDamCageNum"
            },
            {
                label: "Parturition Date:",
                type: "date",
                className: "litterDOB"
            }
        ]
        
        $cardBody.append(
            $("<div></div>", {
                "class": "breedDiv",
                "data-breed": damBreedingNum,
                "data-dam": damNum
            }).append(
                $("<hr></hr>")
            )
        );

        var $body = $cardBody.find(".breedDiv").last();

        for(row of initialRows){
            $body.append(
                this.makeRowFromObj(row, damNum, "dam", true, damBreedingNum, "breed")
            )
        }

        $body.find(".addPlugCheck").prop("value", "Plug check").on("click", (e)=>{
            this.addPlugCheck(damNum, damBreedingNum);
        }).parents(".row").after(
            $("<div></div>", {
                "class": "plugsDiv",
                "data-dam": damNum,
                "data-breed": damBreedingNum
            })
        );

        $body.find(".addMass").prop("value", "Add mass").on("click", (e)=>{
            this.addMass(damNum, damBreedingNum);
        }).parents(".row").after(
            $("<div></div>", {
                "class": "massesDiv",
                "data-dam": damNum,
                "data-breed": damBreedingNum
            })
        );

        $body.find(".deleteBreeding").prop("value", "Delete Breeding").on("click", (e)=>{
            this.deleteBreedingFuncs(damNum, damBreedingNum);
        });

        this.makeSireList(damNum, damBreedingNum);
        var damBreeedingSearch = this.damSearch(damNum) + this.breedingSearch(damBreedingNum);
        if(this.mode === "edit"){
            $jq351(".sireBreeding"+damBreeedingSearch).selectize({});
        }

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
            this.dams[damNum].breedings[damBreedingNum][thisProp] = valSafe;
        });



    },

    addPlugCheck: function(damNum, damBreedingNum){

    },

    addMass: function(damNum, damBreedingNum){

    },

    makeDamCareTable: function(damNum){
        var damCareNums = this.dams[damNum].damCareNums;
        var damCares = this.dams[damNum].damCares;

        var labels = this.careLabels;

        const tableData = [];
        const damCareAddedNums = [];

        for(damCareNum of damCareNums){
            var damCare = damCares[damCareNum]

            var row = [];
            for(label of labels){
                row.push(damCare[label]);
            }

            tableData.unshift(row);
            damCareAddedNums.unshift(damCareNum);
        }

        tableData.unshift(labels);
        damCareAddedNums.unshift(NaN);
        
        var damID = this.dams[damNum].damID;
        if(!damID){
            damID = "Dam " + damNum;
        }

        $("#tableInfo").text(damID);
        $tableDiv = $(".damCaresTable");

        this.createTable(tableData, true, false, $tableDiv);

        // console.log(damCareAddedNums);

        if(this.mode !== "view" && this.mode !== "view_dev"){
            $tableDiv.find("tr").each((i,e)=>{
                if(i == 0){
                    $(e).append(
                        $("<th></th>").append(
                            "Delete"
                        )
                    )
                } else{
                    damCareNum = damCareAddedNums[i];
                    console.log("damCareNum", damCareNum);
                    $(e).append(
                        $("<td></td>").append(
                            $("<input></input>", {
                                "data-dam": damNum,
                                "data-care": damCareNum,
                                value: "Delete care",
                                id: "deleteCare"+damNum+damCareNum,
                                class: "deleteCare",
                                "type": "button"
                            }).on("click", (e)=>{
                                var damNum = $(e.currentTarget).data("dam");
                                var careNum = $(e.currentTarget).data("care");
                                this.deleteCareFuncs(damNum, careNum);
                            })
                        )
                    )
                }
            });
        }
    },

    makeDateCareTable: function(matchDate){
        var damNums = this.damNums;
        var dams = this.dams;

        var labels = this.careLabels;

        const tableData = [["damID"].concat(labels)];

        for(damNum of damNums){
            var damCareNums = dams[damNum].damCareNums;
            var damCares = dams[damNum].damCares;

            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(damCare.date == matchDate){
                    var row = [];
                    row.push(dams[damNum].damID);
                    for(label of labels){
                        row.push(damCare[label]);
                    }
                    tableData.push(row)
                }

            }
        }

        $tableDiv = $(".caresOnDateTable");

        this.createTable(tableData, true, false, $tableDiv);
    },

    getWaterDueDate: function(damNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        var damType = dam.damType;
        if(
            startDate &&
            !endDate && 
            (damType === "static" || damType === "lbn")
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(damCare.water && 
                    (latestDate === undefined || damCare.date > latestDate)
                ){
                    latestDate = damCare.date
                }
            }
            
            if(latestDate === undefined){
                dueDate = dateToday;
            } else if(damType === "lbn"){
                dueDate = this.addDays(latestDate, 1);
            } else {
                dueDate = this.addDays(latestDate, 7);
            }
        }
        return dueDate;
    },

    isDueForWater: function(damNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        var damType = dam.damType;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate) && 
            (damType === "static" || damType === "lbn")
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(damCare.water && 
                    (latestDate === undefined || damCare.date > latestDate) &&
                    damCare.date <= dueDate
                ){
                    latestDate = damCare.date
                }
            }
            
            if(latestDate === undefined || 
                (damType == "lbn" && latestDate < dueDate) || 
                this.addDays(latestDate, 7) <= dueDate
            ){
                isDue = true;
            }
        }
        return isDue;
    },

    getDamsDueForWater: function(dueDate = luxon.DateTime.now().toISODate()){
        var damNums = this.damNums;
        
        const damsDue = [];

        for(damNum of damNums){
            var isDue = this.isDueForWater(damNum, dueDate);
            if(isDue){
                damsDue.push(damNum);
            }
        }
        return damsDue;
    },

    getFoodDueDate: function(damNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        var damType = dam.damType;
        if(
            startDate &&
            !endDate
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(
                    damCare.food && 
                    (latestDate === undefined || damCare.date > latestDate)
                ){
                    latestDate = damCare.date
                }
            }
            
            if(latestDate === undefined){
                dueDate = dateToday;
            } else if(damType === "lbn"){
                dueDate = this.addDays(latestDate, 1);
            } else if(damType == "static"){
                dueDate = this.addDays(latestDate, 7);
            } else {
                dueDate = this.addDays(latestDate, 14);
            }
        }
        return dueDate;
    },

    isDueForFood: function(damNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        var damType = dam.damType;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate)
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(
                    damCare.food && 
                    (latestDate === undefined || damCare.date > latestDate) &&
                    damCare.date <= dueDate
                ){
                    latestDate = damCare.date
                }
            }
            
            if(latestDate === undefined || 
                (damType === "lbn" && latestDate < dueDate) || 
                (damType === "static" && this.addDays(latestDate, 7) <= dueDate) ||
                this.addDays(latestDate, 14) <= dueDate // default to 14 days
            ){
                isDue = true;
            }
        }
        return isDue;
    },

    getDamsDueForFood: function(dueDate = luxon.DateTime.now().toISODate()){
        // debugger;
        var damNums = this.damNums;
        
        const damsDue = [];

        for(damNum of damNums){
            var isDue = this.isDueForFood(damNum, dueDate);
            if(isDue){
                damsDue.push(damNum);
            }
        }
        return damsDue;
    },

    getBottomDueDate: function(damNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        var damType = dam.damType;
        if(
            startDate &&
            !endDate
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(
                    damCare.damBottom && 
                    (latestDate === undefined || damCare.date > latestDate)
                ){
                    latestDate = damCare.date
                }
            }

            if(latestDate === undefined){
                dueDate = dateToday;
            } else if(damType === "lbn" || damType === "static"){
                dueDate = this.addDays(latestDate, 7);
            } else {
                dueDate = this.addDays(latestDate, 14);
            }
        }

        return dueDate;
    },

    isDueForBottom: function(damNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        var damType = dam.damType;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate)
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(
                    damCare.damBottom && 
                    (latestDate === undefined || damCare.date > latestDate) &&
                    damCare.date <= dueDate
                ){
                    latestDate = damCare.date
                }
            }
            
            if(latestDate === undefined || 
                ((damType === "static" || damType === "lbn") && this.addDays(latestDate, 7) <= dueDate) ||
                this.addDays(latestDate, 14) <= dueDate // default to 14 days
            ){
                isDue = true;
            }
        }

        return isDue;
    },

    getDamsDueForBottom: function(dueDate = luxon.DateTime.now().toISODate()){
        // debugger;
        var damNums = this.damNums;
        
        const damsDue = [];

        for(damNum of damNums){
            var isDue = this.isDueForBottom(damNum, dueDate);
            if(isDue){
                damsDue.push(damNum);
            }
        }
        return damsDue;
    },

    getTopDueDate: function(damNum){
        var dueDate;
        var dateToday = luxon.DateTime.now().toISODate();
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        if(
            startDate &&
            !endDate
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(
                    damCare.damTop && 
                    (latestDate === undefined || damCare.date > latestDate)
                ){
                    latestDate = damCare.date
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

    isDueForTop: function(damNum, dueDate = luxon.DateTime.now().toISODate()){
        var isDue = false;
        var dams = this.dams;

        var dam = dams[damNum];
        var damCareNums = dam.damCareNums;
        var damCares = dam.damCares;
        var startDate = dam.startDam;
        var endDate = dam.endDam;
        if(
            startDate &&
            startDate < dueDate && 
            (!endDate || endDate > dueDate)
        ){
            var latestDate = undefined;
            for(damCareNum of damCareNums){
                var damCare = damCares[damCareNum]
                if(
                    damCare.damTop && 
                    (latestDate === undefined || damCare.date > latestDate) &&
                    damCare.date <= dueDate
                ){
                    latestDate = damCare.date
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

    getDamsDueForTop: function(dueDate = luxon.DateTime.now().toISODate()){
        // debugger;
        var damNums = this.damNums;
        var dams = this.dams;

        const damsDue = [];

        for(damNum of damNums){
            var isDue = this.isDueForTop(damNum, dueDate);
            if(isDue){
                damsDue.push(damNum);
            }
        }
        return damsDue;
    },

    getDamsDue: function(dueDate = luxon.DateTime.now().toISODate()){
        var damBottomsToChange = this.getDamsDueForBottom(dueDate);
        var damTopsToChange = this.getDamsDueForTop(dueDate);
        var foodToChange = this.getDamsDueForFood(dueDate);
        var waterToChange = this.getDamsDueForWater(dueDate);

        var namesBottoms = this.getDamNamesArray(damBottomsToChange);
        var namesTops = this.getDamNamesArray(damTopsToChange);
        var namesFood = this.getDamNamesArray(foodToChange);
        var namesWater = this.getDamNamesArray(waterToChange);

        // console.log(namesBottoms, namesTops, namesFood, namesWater);

        this.printDams(namesBottoms, $(".damBottomsList"));
        this.printDams(namesTops, $(".damTopsList"));
        this.printDams(namesFood, $(".foodDamList"));
        this.printDams(namesWater, $(".waterDamList"));
        this.resize();
    },

    selectFood: function(dueDate = luxon.DateTime.now().toISODate()){
        var foodToChange = this.getDamsDueForFood(dueDate);
        
        $("#damSelect").val(foodToChange);

        $("#changeWater").prop("checked", false);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", false);
        $("#changeTop").prop("checked", false);
    },

    selectFoodWater: function(dueDate = luxon.DateTime.now().toISODate()){
        var foodToChange = this.getDamsDueForFood(dueDate);
        var waterToChange = this.getDamsDueForWater(dueDate);

        var comboDams = Array.from(new Set(foodToChange.concat(waterToChange)));
        $("#damSelect").val(comboDams);

        $("#changeWater").prop("checked", true);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", false);
        $("#changeTop").prop("checked", false);

    },

    selectDamBottom: function(dueDate = luxon.DateTime.now().toISODate()){
        var damBottomsToChange = this.getDamsDueForBottom(dueDate);
        $("#damSelect").val(damBottomsToChange);

        $("#changeWater").prop("checked", false);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", true);
        $("#changeTop").prop("checked", false);
    },

    selectDamTop: function(dueDate = luxon.DateTime.now().toISODate()){
        var damTopsToChange = this.getDamsDueForTop(dueDate);
        $("#damSelect").val(damTopsToChange);

        $("#changeWater").prop("checked", false);
        $("#changeFood").prop("checked", true);
        $("#changeBottom").prop("checked", true);
        $("#changeTop").prop("checked", true);
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
                if(text <= luxon.DateTime.now().toISODate()){
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
        if(this.damGenerationNums.length>0){
            var lastDamGeneration = this.damGenerationNums[this.damGenerationNums.length - 1];
            var damGenerationNum = lastDamGeneration + 1;
        } else {
            var damGenerationNum = 1;
        }
        this.addDamGeneration(damGenerationNum);
        var damGenerationSearch = this.damGenSearch(damGenerationNum);

        var headers = this.damGenLabels;
        for(header of headers){
            $("." + header + damGenerationSearch).val(obj[header]);
            this.damGenerations[damGenerationNum][header] = obj[header];
        }
        this.updateDamGenList(damGenerationNum);
    },

    addSireGenFromTable: function(obj){
        if(this.sireGenerationNums.length>0){
            var lastSireGeneration = this.sireGenerationNums[this.sireGenerationNums.length - 1];
            var sireGenerationNum = lastSireGeneration + 1;
        } else {
            var sireGenerationNum = 1;
        }
        this.addSireGeneration(sireGenerationNum);
        var sireGenerationSearch = this.sireGenSearch(sireGenerationNum);

        var headers = this.sireGenLabels;
        for(header of headers){
            $("." + header + sireGenerationSearch).val(obj[header]);
            this.sireGenerations[sireGenerationNum][header] = obj[header];
        }
        this.updateSireGenList(sireGenerationNum);
    },

    addDamFromTable: function(obj, headers){
        if(this.damNums.length>0){
            var lastDam = this.damNums[this.damNums.length - 1];
            var damNum = lastDam + 1;
        } else {
            var damNum = 1;
        }
        this.addDam(damNum);
        var damSearch = this.damSearch(damNum);

        for(header of headers){
            var damGen, damGenDOB, damGenStrain;
            if(header === "damID"){
                $("." + header + damSearch).val(obj[header]);
                this.dams[damNum][header] = obj[header];
            } else {
                if(header === "damGen" || header.toLowerCase().includes("gen")){
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
        if(matchInfo.matchingObj.length>0){
            $(".damGeneration"+damSearch).val(matchInfo.matchingObj[0])
        } else if(matchInfo.noMatches && damGen){ // means no matches for gen - add it
            var obj = {
                damGen: damGen,
                damGenDOB: damGenDOB,
                damGenStrain: damGenStrain
            }
            this.addDamGenFromTable(obj);
        }
    },

    addSireFromTable: function(obj, headers){
        if(this.sireNums.length>0){
            var lastSire = this.sireNums[this.sireNums.length - 1];
            var sireNum = lastSire + 1;
        } else {
            var sireNum = 1;
        }
        this.addSire(sireNum);
        var sireSearch = this.sireSearch(sireNum);

        for(header of headers){
            var sireGen, sireGenDOB, sireGenStrain;
            if(header === "sireID"){
                $("." + header + sireSearch).val(obj[header]);
                this.sires[sireNum][header] = obj[header];
            } else {
                if(header === "sireGen" || header.toLowerCase().includes("gen")){
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
            this.addSireGenFromTable(obj);
        }
        this.updateSireList(sireNum);
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
    }

};