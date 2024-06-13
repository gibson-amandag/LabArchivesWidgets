my_widget_script =
{
    sections: {
        POA: {
            48: 576987993,
            49: 576987953,
            50: 576987913,
            51: 576987873,
            52: 576987833,
            53: 576987793,
            54: 576987753,
            55: 576987713,
            56: 576987673,
            57: 576987633,
            58: 576987593,
            59: 576987553,
            47: 576988793, // always going to show first
            60: 576987513  
        },
        AVPV: {
            47: 576988793,
            48: 576987993,
            49: 576987953,
            50: 576987913,
            51: 576987873,
            52: 576987833,
            53: 576987793,
            46: 576988833,
            54: 576987753,
        },
        ARC: {
            65: 576987303,
            66: 576987259,
            67: 576990261,
            68: 576990221,
            69: 576990181,
            70: 576990141,
            71: 576990101,
            72: 576990061,
            73: 576990020,
            74: 576989980,
            75: 576989940,
            64: 576987346,
            76: 576989900
        },
        BNST: {
            48: 576987993,
            49: 576987953,
            50: 576987913,
            51: 576987873,
            52: 576987833,
            53: 576987793,
            54: 576987753,
            55: 576987713,
            56: 576987673,
            57: 576987633,
            58: 576987593,
            59: 576987553,
            47: 576988793,
            60: 576987513
        },
        PVN: {
            58: 576987593,
            59: 576987553,
            60: 576987513,
            61: 576987473,
            62: 576987433,
            63: 576987387,
            64: 576987346,
            65: 576987303,
            66: 576987259,
            67: 576990261,
            57: 576987633,
            68: 576990221
        },
        CeA: {
            60: 576987513,
            61: 576987473,
            62: 576987433,
            63: 576987387,
            64: 576987346,
            65: 576987303,
            66: 576987259,
            67: 576990261,
            68: 576990221,
            69: 576990181,
            70: 576990141,
            71: 576990101,
            72: 576990061,
            73: 576990020,
            74: 576989980,
            59: 576987553,
            75: 576989940
        },
    },

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
            cellNums: this.cellNums,
            cells: this.cells
        };

        //uncomment to check stringified output
        //console.log("to JSON", JSON.stringify(output));

        // return stringified output
        // console.log(JSON.stringify(this.cells));
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
            cellNums: [1, 2],
            cells: {
                1: {
                    cellID: "a",
                    region: "POA",
                    section: 49,
                    xPos: 249,
                    yPos: 285,
                    imgPath: "testLoc/name.tif"
                },
                2: {
                    cellID: "b",
                    region: "POA",
                    section: 51,
                    xPos: 270,
                    yPos: 385,
                    imgPath: "testLoc/name2.tif"
                }
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
        if(parsedJson.cells){
            for(cell in parsedJson.cells){
                // var cellID = parsedJson.cells[cell].cellID;
                // var region = parsedJson.cells[cell].region;
                // var section = parsedJson.cells[cell].section;
                // var xPos = parsedJson.cells[cell].xPos;
                // var yPos = parsedJson.cells[cell].yPos;
                // this.addCellRow(cell, cellID, region, section, xPos, yPos);
                this.addCellRow(cell, parsedJson.cells[cell]);
            }
            this.cells = parsedJson.cells;
        } else {
            this.cells = {}
        }

        // console.log(this.cells);

        // console.time("initDynamic");
        if(parsedJson.cellNums){
            this.cellNums = parsedJson.cellNums
        } else {
            this.cellNums = [];
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
            $(".editOnView").prop("readonly", "").prop("disabled", "");
            $(".editOnView").find("option").prop("disabled", "");
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

        $("#region").on("change", (e)=>{
            var region = $(e.currentTarget).val();
            this.changeSectionList(region);
            this.changeSectionDisplay();
        });

        $("#section").on("change", (e)=>{
            this.changeSectionDisplay();
        });

        $(".addCell").on("click", (e)=>{
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
                this.addCell(cellNum);
            }
        });

        $(".showCells").on("click", (e)=>{
            this.showCells();
        });

        $(".hideCells").on("click", (e)=>{
            this.hideCells();
        });

        $("#cellNameRow").hide();
        // $(".hoverInfo").css("display", "none")
        this.changeSectionList($("#region").val());
        this.changeSectionDisplay();

        $("#preview").on("click", (e)=>{
            this.preview();
        });

        $("#upload").on("click", (e)=>{
            this.upload();
        });

        this.resize();
    },

    changeSectionList: function(region){
        var $section = $("#section");
        $section.html("");
        if(region){
            var sections = this.sections[region];
            // console.log(sections);
            var startSection = 0, numSections = 0;
            for(section in sections){
                if(numSections == 1){
                    startSection = section;
                } 
                $section.append(
                    "<option value='"+ section + "'>"+ section + "</option>"
                );
                numSections++;
            }
        }
        if(startSection>0){
            $section.val(startSection);
        }
        this.resize();
    },

    changeSectionDisplay: function (){
        $(".mouseBrain").html("");
        $("#addCellRow").hide();
        $("#cellNameRow").hide();
        $(".downloadSection").attr("href", "").hide();
        $("#viewSection").attr("href", "https://atlas.brain-map.org/atlas?atlas=602630314");
        $("#imgSrc").attr("href", "").html("").hide();
        var region = $("#region").val();
        if(region){
            var section = $("#section").val();
            if(section){
                var sectionID = this.sections[region][section];
                if(sectionID){
                    var src = this.buildImgSrc(sectionID);
                    $(".mouseBrain").append(
                        $("<div></div>", {
                            "style": 'position:relative',
                            "class": "xsTableDiv" // so that you can see it on a small screen. Adds scroll bar
                        }).append(
                            $("<div></div>", {
                                "id": "ABI_div"
                            }).append(
                                $("<img></img>", {
                                    "class": "ABI_section",
                                    "id": "ABI_section",
                                    "src": src
                                })
                            )
                        )
                    );

                    var img = document.getElementById("ABI_section");
                    // console.log("img", img);
                    if(img.complete){
                        // console.log("complete");
                        // img.scrollIntoView();
                        this.resize();
                    } else {
                        // console.log("not complete");
                        $(".ABI_section").on("load", ()=>{
                            // img.scrollIntoView();
                            // console.log("loaded");
                            this.resize();
                        });
                    }

                    $("#imgSrc").attr("href", src).attr("target", "_blank").show().append("["+src+"]");

                    $("#viewSection").attr("href", "https://atlas.brain-map.org/atlas?atlas=602630314" + "&plate=" + sectionID);


                    var src = this.buildDownloadSrc(sectionID)

                    var fileName = "ABI_3Dcoronal_section"+section+"_sectionID"+sectionID+"downsample4.svg"

                    console.log(fileName)
                    $(".downloadSection").attr("href", src).show();

                    $("#addCellRow").show();
                }
            }
        }
        this.resize();
    },


    // If the link is ever broken, SVG files have been downloaded to the AllUsers folder of the server
    // Within AllenBrainAtlasSVGs folder
    // Also added to LabArchives Shared Resources Notebook
    buildImgSrc: function(sectionID){
        var src = "https://api.brain-map.org/api/v2/svg/" + sectionID + "?groups=28&downsample=4";
        return src
    },

    buildDownloadSrc: function(sectionID){
        var src = "https://api.brain-map.org/api/v2/svg_download/" + sectionID + "?groups=28&downsample=4";
        return src
    },

    cellNums: [],

    cells: {},

    addCellToCells: function(cellNum, cellID, region, section, xPos, yPos){
        var cellObj = {
            cellID: cellID,
            region: region,
            section: section,
            xPos: xPos,
            yPos: yPos
        }
        this.cells[cellNum] = cellObj;

        this.addCellRow(cellNum, cellObj);
        // this.addCellRow(cellNum, cellID, region, section, xPos, yPos);
    },
    
    // addCellRow: function(cellNum, cellID, region, section, xPos, yPos){
    addCellRow: function(cellNum, cellObj){
        var imgPath = ""
        if(cellObj.imgPath){
            imgPath = cellObj.imgPath;
        }
        $("#cellTable").find("tbody").append(
            $("<tr></tr>", {
                "data-cell": cellNum,
                "class": "cellRow"
            }).append(
                $("<td></td>", {
                    "class": "removeCol"
                }).append(
                    $("<input></input>", {
                        "type": "button",
                        "data-cell": cellNum,
                        "class": "showCell fullWidth",
                        "value": "Show Cell",
                        "id": "showCell"+cellNum,
                        "name": "showcell"+cellNum
                    }).on("click", (e)=> {
                        this.showCell($(e.currentTarget).data("cell"));
                    })
                )
            ).append(
                "<td>" + cellObj.cellID + "</td>"
            ).append(
                "<td>" + cellObj.region + "</td>"
            ).append(
                "<td>" + cellObj.section + "</td>"
            ).append(
                "<td class='hideCol'>" + cellObj.xPos + "</td>"
            ).append(
                "<td class='hideCol'>" + cellObj.yPos + "</td>"
            ).append(
                $("<td></td>", {
                    "class": "imgPath",
                    "data-cell": cellNum
                }).append(imgPath)
            ).append(
                $("<td></td>", {
                    "class": "imgPathButton removeCol hideView",
                    "data-cell": cellNum
                }).append(
                    $("<input></input>", {
                        "type": "button",
                        "data-cell": cellNum,
                        "class": "addImgPath fullWidth disableOnView",
                        "value": "Add/edit image file path",
                        "id": "addImgPath"+cellNum,
                        "name": "addimgpath"+cellNum
                    }).on("click", (e)=> {
                        this.addImgPath($(e.currentTarget).data("cell"), e.currentTarget);
                    })
                )
            ).append(
                $("<td></td>", {
                    "class": "removeCol hideView"
                }).append(
                    $("<input></input>", {
                        "type": "button",
                        "data-cell": cellNum,
                        "class": "deleteCell fullWidth disableOnView",
                        "value": "Delete Cell",
                        "id": "deleteCell"+cellNum,
                        "name": "deletecell"+cellNum
                    }).on("click", (e)=> {
                        this.deleteCellFuncs($(e.currentTarget).data("cell"), e.currentTarget);
                    })
                )
            )
        );
        this.resize();
    },

    addCell: function(cellNum){
        // var cellName = $("#cellName").val();
        var region = $("#region").val();
        var section = $("#section").val();

        $("#cellNameRow").show();
        $("#cellName").val("");

        this.makeClickFunc(cellNum, region, section);
        this.resize();
    },

    deleteCellFuncs: function (cellNum, elForHeight = null) {
        this.runIfConfirmed(
            "Are you sure that you wish to delete this cell?",
            () => {
                // Remove it from the cellNums
                var index = this.cellNums.indexOf(cellNum);
                if(index > -1){
                    this.cellNums.splice(index, 1);
                }
        
                //Remove it from cells
                delete this.cells[cellNum];
        
                var cellSearch = this.cellSearch(cellNum);
                $(cellSearch).remove();
                this.resize();
            }
            , elForHeight = elForHeight
        );
    },

    makeClickFunc: function(cellNum, region, section){
        // $(".ABI_section").on("click", (e)=>{
        $("#ABI_div").on("click", (e)=>{
            console.log(e);
            // e = Mouse click event.
            // var rect = e.target.getBoundingClientRect();
            var rect = e.currentTarget.getBoundingClientRect();
            var x = e.clientX - rect.left; //x position within the element.
            var y = e.clientY - rect.top;  //y position within the element.
            // console.log("Left? : " + x + " ; Top? : " + y + ".");
            var cellID = $("#cellName").val();
            this.addDot(cellNum, cellID, x, y, e.currentTarget);
            this.addCellToCells(cellNum, cellID, region, section, x, y);
            $("#cellNameRow").hide();
            $(e.currentTarget).off("click");
            this.resize();
        });  
    },

    showCells: function(){
        this.hideCells();
        var cells = this.cells;
        for(cell in cells){
            var region = cells[cell].region;
            var section = cells[cell].section;
            if(region == $("#region").val()){
                if(section == $("#section").val()){
                    var cellID = cells[cell].cellID;
                    var xPos = cells[cell].xPos;
                    var yPos = cells[cell].yPos;
                    this.addDot(cell, cellID, xPos, yPos, $("#ABI_div"));
                }
            }
        }
        this.resize();
    },

    showCell: function(cellNum){
        var cells = this.cells;
        var region = cells[cellNum].region;
        var section = cells[cellNum].section;
        if(region){
            if(section){
                $("#region").val(region);
                this.changeSectionList(region);
                $("#section").val(section);
                this.changeSectionDisplay();
                var cellID = cells[cellNum].cellID;
                var xPos = cells[cellNum].xPos;
                var yPos = cells[cellNum].yPos;
                this.addDot(cellNum, cellID, xPos, yPos, $("#ABI_div"));
                this.resize();
                var img = document.getElementById("ABI_section");
                img.scrollIntoView();
            }
        }
    },

    hideCells: function(){
        $(".dot").remove();
    },

    addDot: function(cellNum, cellID, xPos, yPos, el) {
        // $(el).parent().append(
        $(el).append(
            $("<div></div>", {
                "data-cell": cellNum,
                "data-cellid": cellID,
                "class": "dot",
                "style": "left:" + xPos + "px; top:" + yPos + "px;"
            }).on("mouseover", (e)=>{
                var cellID = $(e.target).data("cellid");
                var cellNum = $(e.target).data("cell");
                $(".hoverInfo").text("").append("This is cell ").append(
                    $("<span></span>", {
                        "class": "font-weight-bold"
                    }).append(cellID)
                );
                this.resize();
            }).on("mouseout", (e)=>{
                $(".hoverInfo").text("Hover over a cell to see its ID");
                this.resize();
            })
        );
        this.resize();
    },

    // https://drive.google.com/file/d/13mIH15JSXzCan_vVcd1z8Zdm_w75wmcl/view?usp=sharing
    addImgPath: function(cellNum, elForHeight = null){
        var cellSearch = this.cellSearch(cellNum);
        var $path = $(".imgPath"+cellSearch);
        var currentPath = $path.text();
        this.runBasedOnInput(
            "Enter img path or link to slice image",
            (path)=>{
                if(!path){
                    path = currentPath;
                }
                $(".imgPath"+this.dataSearch("cell", cellNum)).text(path);
                this.cells[cellNum].imgPath = path;
            },
            elForHeight = elForHeight,
            currentPath
        );
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
    runBasedOnInput: function(prompt, functionToCall, elForHeight = null, defValue = null){
        var thisTitle = "Enter value:"
        if(prompt){
            thisTitle = prompt;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = this.getOffsetTop(elForHeight) + "px";
        }
        // console.log("defValue", defValue);
        bootbox.prompt({
            title: thisTitle,
            callback: (result)=>{
                functionToCall(result);
            },
            value: defValue
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

    cellSearch: function (cell) {
        var cellSearch = this.dataSearch("cell", cell);
        return cellSearch;
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
        var dayNum = $el.data("day");
        var mouseNum = $el.data("mouse");
        var val = $el.val();
        if(dayNum){
            calcSearch += my_widget_script.daySearch(dayNum);
        }
        if(mouseNum){
            calcSearch += my_widget_script.mouseSearch(mouseNum);
        }
        if(watch == "mouse"){
            if(!val){
                val = "Mouse " + mouseNum;
            }
        }
        $(calcSearch).html(val);

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
        var csv = [];
        var datatable = document.getElementById(table);
        var rows = datatable.querySelectorAll("tr");

        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td:not(.removeCol), th:not(.removeCol)");

            console.log(cols);

            for (var j = 0; j < cols.length; j++) {
                // var cellText = '"' + cols[j].innerText + '"'; //add to protect from commas within cell
                var cellText = cols[j].innerText; // removed because reads odd, shouldn't have commas here
                row.push(cellText);
            };

            // csv.push(row.join(","));
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
                $(e).find("td, th").not(".removeCol").each((i,e)=> {
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
            $(e).find("td, th").not(".removeCol").each((i,e)=> {
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
    //#endregion copy tables

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

    //#region upload
    preview: function() {
        var fileUpload = document.getElementById("fileUpload");
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = (e) => {
                    // console.log("csv results", e.target.result);
                    var table = document.createElement("table");
                    table.className = "table";
                    var rows = e.target.result.split("\n");
                    for (var i = 0; i < rows.length; i++) {
                        var cells = rows[i].split(",");
                        if (cells.length > 0) {// changed to greater than 0, from 1
                            var row = table.insertRow(-1);
                            for (var j = 0; j < cells.length; j++) {
                                var cell = row.insertCell(-1);
                                cell.innerHTML = cells[j];
                            }
                        }
                    }
                    var dvCSV = document.getElementById("dvCSV");
                    dvCSV.innerHTML = "";
                    dvCSV.appendChild(table);
                }
                reader.readAsText(fileUpload.files[0]);
            } else {
                bootbox.alert("This browser does not support HTML5.");
            }
        } else {
            bootbox.alert("Please upload a valid CSV file.");
        }
    },

    upload: function() {
        var fileUpload = document.getElementById("fileUpload");
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
        if (regex.test(fileUpload.value.toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = (e) => {
                    var cells = this.getCellsFromCSVTable(e.target.result);
                    console.log(cells);
                    for(cell in cells){
                        var cellInfo = cells[cell];
                        var isDup = this.checkIfCellIsDuplicate(cellInfo);
                        // console.log(isDup);
                        if(!isDup){
                            if(this.cellNums.length > 0){
                                var lastCell = this.cellNums[this.cellNums.length - 1];
                                var cellNum = lastCell + 1;
                            } else {
                                var cellNum = 1;
                            }

                            var inArray = this.checkInArray(cellNum, this.cellNums);
                            if(! inArray){
                                this.cellNums.push(cellNum);
                                this.cells[cellNum] = cellInfo;
                                this.addCellRow(cellNum, cellInfo);
                            }
                        }
                        $("#dvCSV").text(""); // clear preview after upload
                    }
                }
                reader.readAsText(fileUpload.files[0]);
            } else {
                bootbox.alert("This browser does not support HTML5.");
            }
        } else {
            bootbox.alert("Please upload a valid CSV file.");
        }
    },

    getCellsFromCSVTable: function(csv){
        var rows = csv.split("\n");
        // console.log(rows);
        if(rows.length>0){
            var headings = rows[0].split(",");
            var cellsInfo = {};
            for(var i = 1; i < rows.length; i++){
                var cells = rows[i].split(",");
                cellsInfo[i] = {}; // make an object for each cell
                for(var j = 0; j < cells.length; j++){
                    var heading = headings[j];
                    cellsInfo[i][heading] = cells[j];
                }
            }
        }
        // console.log(cellsInfo);
        return cellsInfo;
    },

    checkIfCellIsDuplicate: function(cellInfo){
        var cellID = cellInfo.cellID;
        var isDup = 0;
        for(cell in this.cells){
            var existingID = this.cells[cell].cellID;
            if(cellID == existingID){
                isDup = 1;
                bootbox.alert("cellID " + cellID + " already exists in database");
                break;
            }
        }
        return isDup;
    }
    //#endregion upload

};