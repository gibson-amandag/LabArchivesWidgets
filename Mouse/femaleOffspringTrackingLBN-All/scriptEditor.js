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
        // debugger;

        //Make HTML for five animals
        this.makeHTMLforMice(5);

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to console
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode);

        // Print to console log if any elements don't have a required name attribute
        this.checkForNames();

        // uncomment to print name log to check for uppercase letters
        // var name_log = ''
        // $("body").find("[name]").each(function () {
        //     var thisName = this.getAttribute("name");
        //     name_log += thisName + "\n";
        // });
        // console.log(name_log);
    },
    
    to_json: function () {
        //Acquire input data from the form using the parent_class.to_json() function
        var widgetJsonString = this.parent_class.to_json();

        //Get information about any dynamic content that may have been created
        var dynamicContent = this.getDynamicContent();

        // Add widgetData and any additional dynamic content to an output object
        // Will be accessed within the init and from_json methods
        var output = { 
            widgetData: JSON.parse(widgetJsonString),
            tailMarks: dynamicContent.tailMarks,
            addedRows_VOs: dynamicContent.addedRows_VOs,
            addedRows_1Es: dynamicContent.addedRows_1Es,
            allVO_dates: dynamicContent.allVO_dates,
            all1E_dates: dynamicContent.all1E_dates
        };

        //uncomment to check stringified output
        // console.log("to JSON", JSON.stringify(output));

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

    test_data: function () {
        //store the outcome of the the test data within the testData variable
        var testData = JSON.parse(this.parent_class.test_data());

        //If no additional dynamic content 
        var output = { 
            widgetData: testData,
            tailMarks: [
                "<span style='color:black'>|</span>",
                "<span style='color:green'>||</span>"],
            addedRows_VOs: [1, 2],
            addedRows_1Es: [2, 3],
            allVO_dates: [
                ["2021-01-01"],
                ["2021-01-01", "2021-01-02"]
            ],
            all1E_dates: [
                ["2021-01-01", "2021-01-02"], 
                ["2021-01-01", "2021-01-02", "2021-01-03"]
            ]
        };

        //return the stringified output for use by the init function
        return JSON.stringify(output);
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

    initDynamicContent: function (parsedJson) {
        var maxOffspring = 5;
        //The first time that this runs when making a new widget, tailMarks (and the other components) are undefined
        //parsedJson (json_data) is just an object with various methods, but it doesn't have these parameters yet
        if(parsedJson.tailMarks) {
            // console.log("Found tail marks and proceeding to add data for each mouse");
            for (var j = 0; j < maxOffspring; j++) {
                var mouseNum = j + 1;
                var dataSearch = this.numSearch(mouseNum);
    
                var $tailMark = $("#tailMark" + mouseNum);
                $tailMark.html(parsedJson.tailMarks[j]);
                var $tailMarkCalc = $(".tailMark" + mouseNum + "_calc");
                $tailMarkCalc.html(parsedJson.tailMarks[j]);
    
                var dates_VO = parsedJson.allVO_dates[j];
                for (var i = 0; i < parsedJson.addedRows_VOs[j]; i++) {
                    this.createMaturationRow_VO(dates_VO[i], mouseNum);
                }
    
                var dates_1E = parsedJson.all1E_dates[j];
                for(var i=0; i < parsedJson.addedRows_1Es[j]; i++ ) {
                    this.createMaturationRow_1E(dates_1E[i], mouseNum);
                }
    
            }
        }

    },

    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
            $(".hideView").hide();
            $(".massDiv").hide();
            $("#showDates").prop("checked", true).closest(".container").hide();
            $("#datesList").show();
            $("#outputDiv").insertAfter($(".fullDemoDiv"));
            $(".entry.mat").each((i,e)=> {
                var mouseNum = parseInt($(e).data("num"));
                if(mouseNum <= parseInt($("#numOffspring").val())){
                    $(e).show();
                }
            });
            this.adjustifOther();
            $(".tableDiv").show();
            $("input[type='date']").removeClass(".hasDatePicker");
            $(".tableDiv").show();
            if($("#cycleMice").is(":checked")){
                $(".cycleDates").hide();
                $(".cycleEdits").hide();
            } else {
                $(".cycleDiv").hide();
            }
        } else {
            if($("#DOB").val()) {
                $("#entryDiv").insertAfter("#titleDiv");
                $("#editDemo").prop("checked", false);
                $(".editDemoChecked").hide();
            } else {
                $("#editDemo").prop("checked", true);
                $(".editDemoChecked").show();
            }

            // Put first estrus div first
            $(".firstE_div_outer").each((i,e)=>{
                var mouseNum = $(e).data("num");
                var numSearch = this.numSearch(mouseNum);
                $(e).insertBefore($(".VO_div_outer" + numSearch));
            })

            $("input[type='date']").each((i, e)=> {
                this.checkDateFormat($(e));
            });
            
            $("input[type='time']").each((i, e)=> {
                this.checkTimeFormat($(e));
            });
            // Add * and # to mark required field indicators
            this.addRequiredFieldIndicators();
            // $(".hideEdit").hide();
        }
    },

    updateTailMarkButton: function ($tailMark) {
        var tailMarking = $tailMark.parent().find(".tailMark").html();
        var mouseNum = $tailMark.data("num");
        var $tailMarkCalc = $(".tailMark" + mouseNum + "_calc");
        $tailMarkCalc.html(tailMarking);
        this.resize();
    },

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

    // This isn't currently being used anywhere
    // updateTailMarkCalc: function ($tailMark) {
    //     var mouseNum = $tailMark.data("num");
    //     var $tailMarkCalc = $(".tailMark" + mouseNum + "_calc");
    //     $tailMarkCalc.html($tailMark.html());
        
    //     this.resize();
    // },

    switchMouseForEntry: function () {
        // Comes out as number, not string
        var selectedMouse = $("#mouseSelect :selected").data("num");
        if (($.inArray(selectedMouse, [1, 2, 3, 4, 5]) !== -1)) {
            $(".entry[data-num='" + selectedMouse + "']").show();
            $(".entry[data-num!='" + selectedMouse + "']").hide();
        } else {
            $(".entry").hide();
        }
        this.resize();
    },

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
        } else {
            $toToggle.hide();
        }
        this.resize();
    },

    hideWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.hide();
        } else {
            $toToggle.show();
        }
        this.resize();
    },

    showOther: function ($this) {
        if($this.val() === "Other") {
            var $other = $this.next(".ifOther").show();
            // Adjust height
            var thisScrollHeight = $other.prop("scrollHeight");
            $other.css("height", thisScrollHeight).css("overflow-y", "hidden");
        } else {
            $this.next(".ifOther").hide();
        }
        this.resize();
    },

    getLocalDateString: function () {
        var dateTodayString = luxon.DateTime.now().toISODate();
        // console.log(dateTodayString);
        return(dateTodayString);
    },

    adjustifOther: function () {
        $(".firstE_state").each((i,e)=> {
            this.showOther($(e));
        });

        $(".VO_state").each((i,e)=> {
           this.showOther($(e));
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

    setUpInitialState: function () {
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

        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        $('.myLeftCol2').addClass("col-6 col-md-4 col-lg-3 text-right");
        $('.myLeftCol3').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right font-weight-bold");
        $(".med2").addClass("col-12 col-md-6 col-lg");
        $(".med3").addClass("col-12 col-sm-6 col-md-4");
        // $(".calcFull").addClass("simpleCalc fullWidth");
        
        $("#editDemo").each((i,e)=> {
            this.showWithCheck($(e), $(".editDemoChecked"));
        }).on("change", (e)=> {
            this.showWithCheck($(e.currentTarget), $(".editDemoChecked"));
        });
        
        $("#DOB").on("change", (e)=> {
            this.adjustForNumOffspring();
            this.printPND_days();
            this.getPND_today();
            this.updateMatPND();
            this.switchMouseForEntry();
            this.watchForVO();
            this.watchFor1E();
        });

        $("#numOffspring").on("change", (e)=> {
            this.adjustForNumOffspring();
            this.switchMouseForEntry();
            // var numMice = parseInt($(this).val());
        });

        // Change mouseID in select list
        $(".mouseID").each((i,e)=> {
            var mouseNum = $(e).data("num");
            $("#mouseSelect option.mouse" + mouseNum).text($(e).val());
        }).on("input", (e)=> {
            var mouseNum = $(e.currentTarget).data("num");
            $("#mouseSelect option.mouse" + mouseNum).text($(e.currentTarget).val());
            this.resize();
        });

        // Add tail mark
        $(".redButton").on("click", (e)=> {
            $(e.currentTarget).parent().find(".tailMark").append(
                "<span style='color:red'>|</span>"
            );
            this.updateTailMarkButton($(e.currentTarget));
        });

        $(".blackButton").on("click", (e)=> {
            $(e.currentTarget).parent().find(".tailMark").append(
                "<span style='color:black'>|</span>"
            );
            this.updateTailMarkButton($(e.currentTarget));
        });

        $(".clearButton").on("click", (e)=> {
            $(e.currentTarget).parent().find(".tailMark").text(
                ""
            );
            this.updateTailMarkButton($(e.currentTarget));
        });

        $("#showDates").each((i,e)=> {
            this.showWithCheck($(e), $("#datesList"));
        }).on("change", (e)=> {
            this.showWithCheck($(e.currentTarget), $("#datesList"));
        });

        $("#cycleMice").each(function () {
            my_widget_script.showWithCheck($(this), $(".ifCycle"));
            if(!$(this).is(":checked")){
                $("#cycleDatesCheck").prop("checked", false);
                my_widget_script.showWithCheck($("#cycleDatesCheck"), $(".cycleDates"));
            } 
        }).on("change", function () {
            my_widget_script.showWithCheck($(this), $(".ifCycle"));
            if(!$(this).is(":checked")){
                $("#cycleDatesCheck").prop("checked", false);
                my_widget_script.showWithCheck($("#cycleDatesCheck"), $(".cycleDates"));
            } 
        });

        $("#cycleStart").each(function () {
            my_widget_script.startCycleFuncs();
        }).on("input", function (){
            my_widget_script.startCycleFuncs();
        });

        $("#cycleEnd").each(function () {
            my_widget_script.endCycleFuncs();
        }).on("input", function (){
            my_widget_script.endCycleFuncs();
        });

        $("#cycleDatesCheck").each(function () {
            my_widget_script.showWithCheck($(this), $(".cycleDates"));
        }).on("change", function () {
            my_widget_script.showWithCheck($(this), $(".cycleDates"));
        });

        // Output table calculations
        $(".simpleCalc").each((i,e)=> {
            var elementID = e.id;
            var calcID = "." + elementID + "_calc";
            this.watchValue($(e), $(calcID));
        }).on("input", (e)=> {
            var elementID = e.currentTarget.id;
            var calcID = "." + elementID + "_calc";
            this.watchValue($(e.currentTarget), $(calcID));
        });

        $(".addMatCheck").on("click", (e)=> {
            var el = e.currentTarget;
            var $dateVal = $(el).parent().next().children(".addMatDate").val();
            var mouseNum = $(el).data("num");
            if ($dateVal) {
                if($(el).hasClass("VO")) {
                    this.createMaturationRow_VO($dateVal, mouseNum);
                } else if($(el).hasClass("firstE")){
                    this.createMaturationRow_1E($dateVal, mouseNum);
                }
            } else {
                bootbox.alert("Enter a Date");
            }
        });

        $(".addMatDate").val(this.getLocalDateString());

        $(".removeMatCheck").on("click", (e)=> {
            var el = e.currentTarget;
            // console.log("in mat check", e.currentTarget.offsetTop);
            // console.log(e.currentTarget.offsetParent);
            this.runIfConfirmed(
                "Are you sure that you want to remove the last date?",
                ()=>{
                    var mouseNum = $(el).data("num");
                    if($(el).hasClass("VO")){
                        this.removeMaturationRow("VO", mouseNum);
                        this.watchForVO();
                    } else if($(el).hasClass("firstE")){
                        this.removeMaturationRow("firstE", mouseNum);
                        this.watchFor1E();
                    }
                }
                , el
            );
        });

        $("#massSelect").on("change", (e)=> {
            var pnd = $(e.currentTarget).val();
            if (pnd) {
                this.switchMassTable(pnd);
            } else {
                $(".massDiv").hide();
            }
            this.resize();
        });

        $("#mouseSelect").on("change", (e)=> {
            this.switchMouseForEntry();
            this.adjustifOther();
            this.resize();
        });

        $(".VO_mass").on("input", (e)=> {
            var mouseNum = $(e.currentTarget).data("num");
            this.watchVO_mass(mouseNum);
        });

        // Output Table Buttons

        //Show/hide the table
        $(".toggleTable").on("click", (e)=> { //when the showTable button is clicked. Run this function
            var $tableDiv, $errorMsgDiv;
            var el = e.currentTarget;

            if($(el).hasClass("maturation")) {
                baseName = "maturation";
            } else if($(el).hasClass("mass")){
                baseName = "mass";
            } else if($(el).hasClass("demo")){
                baseName = "demo";
            }

            if(baseName){
                $tableDiv = $(".tableDiv." +baseName);
                $errorMsgDiv = $(".errorMsg." +baseName);
                this.toggleTableFuncs($tableDiv, $errorMsgDiv);
            }
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('.toCSV').on("click", (e)=> {
            var fileName, tableID, $errorMsg, baseName;
            var el = e.currentTarget;
            if($(el).hasClass("maturation")) {
                baseName = "maturation";
            } else if($(el).hasClass("mass")){
                baseName = "mass";
            } else if($(el).hasClass("demo")){
                baseName = "demo";
            }

            if(baseName){
                fileName = baseName + "_" + $("#damID").val() + "_females";
                tableID = baseName + "Table";
                $errorMsg = $(".errorMsg." + baseName);
            }

            if(fileName && tableID && $errorMsg){
                this.toCSVFuncs(fileName, tableID, $errorMsg);
            }
        });

        //When the copy button is clicked, run the copyTable function
        $(".copyDataButton").on("click", (e)=> {
            var $copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy;

            var el = e.currentTarget;

            if($(el).hasClass("maturation")) {
                baseName = "maturation";
            } else if($(el).hasClass("mass")){
                baseName = "mass";
            } else if($(el).hasClass("demo")){
                baseName = "demo";
            }

            if(baseName){
                $copyHead = $(".copyHead." + baseName);
                $tableToCopy = $("#" + baseName + "Table");
                $tableDiv = $(".tableDiv." + baseName);
                $errorMsg = $(".errorMsg." + baseName);
                $divForCopy = $(".forCopy." + baseName);
                this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy);
            }            
        });
        
        this.adjustForNumOffspring();
        this.switchMouseForEntry();
        this.printPND_days();
        this.getPND_today();
        // update mat pnd before watching for values, otherwise, there's not DOB because the rows are initialized before the widget data is reloaded
        this.updateMatPND();
        this.watchForVO();
        this.watchFor1E();
        this.calcValues();
        this.adjustifOther();
        this.resize();
    },

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
    getDynamicContent: function () {
        var tailMarks, addedRows_VOs, addedRows_1Es, allVO_dates, all1E_dates;
        var maxOffspring = 5;

        tailMarks = [];
        addedRows_VOs = [];
        addedRows_1Es = [];
        allVO_dates = [];
        all1E_dates = [];

        for (var j = 0; j < maxOffspring; j++) {
            var mouseNum = j + 1;
            var dataSearch = this.numSearch(mouseNum);
            var tailMark = $("#tailMark" + mouseNum).html();
            var addedRows_VO = $(".VO_div" + dataSearch).find(".addedRow").length;
            var addedRows_1E = $(".firstE_div" + dataSearch).find(".addedRow").length;
            
            var dates_VO = [];
            for (var i = 0; i < addedRows_VO; i++) {
                var rowNum = i + 1;
                var rowClassName = ".Row_" + rowNum;
                var thisDate = $(".VO_div" + dataSearch).find(rowClassName).find(".mat_date").html();
                dates_VO[i] = thisDate;
            }

            var dates_1E = [];
            for (var i = 0; i < addedRows_1E; i++) {
                var rowNum = i + 1;
                var rowClassName = ".Row_" + rowNum;
                var thisDate = $(".firstE_div" + dataSearch).find(rowClassName).find(".mat_date").html();
                dates_1E[i] = thisDate;
            }


            if(tailMark) {
                tailMarks[j] = tailMark;
            } else {
                tailMarks[j] = "";
            }
            addedRows_VOs[j] = addedRows_VO;
            addedRows_1Es[j] = addedRows_1E;
            if(dates_VO) {
                allVO_dates[j] = dates_VO;
            } else {allVO_dates[j] = [""];}
            if(dates_1E) {
                all1E_dates[j] = dates_1E;
            } else {all1E_dates[j] = [""];}
        }

        var dynamicContent = {
            tailMarks: tailMarks,
            addedRows_VOs: addedRows_VOs,
            allVO_dates: allVO_dates,
            addedRows_1Es: addedRows_1Es,
            all1E_dates: all1E_dates
        };

        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

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
            // top = elForHeight.offsetTop + "px";
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.confirm({
            message: thisMessage,
            callback: (proceed)=>{
                if(proceed){
                    functionToCall()
                }
            }
        });
        console.log(top)
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

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    numSearch: function(num){
        var numSearch = this.dataSearch("num", num);
        return numSearch
    },

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
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
                fail_log.append("<br></br>"+name)
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

    watchValue: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
        this.resize();
    },

    getPND_today: function () {
        var $DOBVal = $("#DOB").val();

        if($DOBVal){
            var startDate = luxon.DateTime.fromISO($DOBVal).startOf("day");
            var todayDate = luxon.DateTime.now().startOf("day")
            var dateDiff_days = todayDate.diff(startDate, "days").as("day");
            // console.log(dateDiff_days);
    
            var pndTodayString = ".pnd.pnd" + dateDiff_days;
            var pndNotTodayString = ".pnd:not(.pnd" + dateDiff_days + ")";
    
            $(pndTodayString).css("color", "red");
            $(pndNotTodayString).css("color", "black");
    
            $(".pndToday").text(dateDiff_days);

            // This prints at the top what needs to be done today and switches the Mass and AGD selector 
            this.updateToDoStatus(dateDiff_days);
            this.updateCycleStatus(dateDiff_days);
    
            return(dateDiff_days);
        } else {
            this.switchMassTable($("#massSelect").val());
        }
    },

    getPND: function (dateInputVal) {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var DOBisDay = 0;
        var textOutput;
        if($("#DOB").val()){
            if(dateInputVal){
                var compDate = luxon.DateTime.fromISO(dateInputVal).startOf("day");
                var DOB = luxon.DateTime.fromISO($("#DOB").val()).startOf("day").minus({ days: DOBisDay });
                var pnd = compDate.diff(DOB, "days").as("day");
                // console.log(pnd);
                textOutput = pnd;
            } else {
                textOutput = "[Enter Date of VO Check]";
            }
        } else {
            textOutput = "[Enter DOB]";
        }
        
        return textOutput;
    },

    updateMatPND: function () {
        $(".mat_pnd").each((i,e)=> {
            var dateVal = $(e).prev(".mat_date").text();
            var pnd = this.getPND(dateVal);
            $(e).text(pnd);
        });
    },

    updateToDoStatus: function (PND_today) {
        var $toDoStatus = $(".toDo_status");
        if ($.inArray(PND_today, [28, 35, 42, 49, 56, 63]) !== -1)  {
            $toDoStatus.html("<span style='color:blue'>Take mass today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            this.switchMassTable("pnd"+PND_today);
        } else if ($.inArray(PND_today, [22, 23, 24, 70, 71, 72]) !== -1) {
            $toDoStatus.html("<span style='color:blue'>Take mass and AGD today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            this.switchMassTable("pnd"+PND_today);
        } else if (PND_today === 21) {
            $toDoStatus.html("<span style='color:blue'>Wean and take mass today - enter in litter widget</span>");
            $("#massSelect").val("");
            this.switchMassTable("");
        } else {
            $toDoStatus.html("<em>No mass or AGD today</em>");
            $("#massSelect").val("");
            this.switchMassTable($("#massSelect").val());
        }
    },

    updateCycleStatus: function (PND_today){
        var cycleStartDay = $("#cycleStart").val();
        var cycleEndDay = $("#cycleEnd").val();
        if(!cycleStartDay){cycleStartDay = 70}
        if(!cycleEndDay){cycleEndDay = 90}
        var $cycling_status = $(".cycling_status");
        if(PND_today >= cycleStartDay && PND_today <= cycleEndDay){
            $cycling_status.css("background-color", "yellow");
        } else {
            $cycling_status.css("background-color", "");
        }
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toLocaleString({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
        $newDateClass.text(newDate);
    },

    pndDays: [21, 22, 23, 24, 28, 35, 42, 49, 56, 63, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91],
    massDays: [22, 23, 24, 28, 35, 42, 49, 56, 63, 70, 71, 72],
    agdDays: [22, 23, 24, 70, 71, 72],
    datesList: [21, 22, 23, 24, 28, 35, 42, 49, 56, 63, 70, 71, 72, 91],

    printPND_days: function () {
        if($("#DOB").val()){
            var pndDays = this.pndDays;
            
            for(i = 0; i < pndDays.length; i ++ ) {
                var pnd = pndDays[i];
                this.addDays($("#DOB").val(), $(".pnd"+pnd), pnd);
            }
        }

        this.resize();
    },

    adjustForNumOffspring: function () {
        var numOffspring = parseInt($("#numOffspring").val());

        // Hide everything, then show only the relevant ones
        $(".mouse1").hide();
        $(".mouse2").hide();
        $(".mouse3").hide();
        $(".mouse4").hide();
        $(".mouse5").hide();
        $(".invalid").hide();

        if(numOffspring >= 1 && numOffspring <= 5){
            for(i = 0; i < numOffspring; i++){
                $(".mouse" + (i+1)).show();
            }
            $("#mouseSelect").val("mouse1");
        } else {
            $(".invalid").show();
            $("#mouseSelect").val("");
            $(".numOffspring_calc").html("<span style='color:red'>Enter a number from 1-5</span>");
        }

        this.resize();
    },

    watchForVO: function () {
        // Function to check if VO has happened, and find what the earliest date with open VO marked is for each mouse

        var anyHasReachedVO = false;
        var hasReachedVO = false;
        var thisPndAtVO, thisVODate;
        var pndAtVO, dateAtVO;

        var totalMice = parseInt($("#numOffspring").val());

        for (var i = 0; i < totalMice; i ++ ) {
            hasReachedVO = false;
            pndAtVO = null;
            dateAtVO = null;

            var mouseNum = i + 1;
            // console.log("Mouse Number is " + mouseNum);
            var dataSearch = this.numSearch(mouseNum);

            if($(".VO_state" + dataSearch).length === 0){
                $(".ifVO" + dataSearch).hide();
                $(".VO_status" + dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet");
                $(".VO_PND" + mouseNum + "_calc").text("NA");
                $(".VO_mass" + mouseNum + "_calc").text("NA");
                $(".VO_date" + mouseNum + "_calc").text("NA");
            } else {
                $(".VO_state" + dataSearch).each((i,e)=> {
                    // console.log("within .VO_state function");
                    var $this = $(e);
                    
                    // if the state is VO
                    if($this.val()==="VO") {
                        $(".ifVO" + dataSearch).show();
                        anyHasReachedVO = true;
                        hasReachedVO = true;
                        thisPndAtVO = $this.closest(".addedRow").find(".mat_pnd").text();
                        thisVODate = $this.closest(".addedRow").find(".mat_date").text();
    
                        if(dateAtVO) { //if there's a value for dateAtVO
                            if(new Date(thisVODate).getTime() < new Date(dateAtVO).getTime()) { //if this date is earlier than current dateAtVO
                                dateAtVO = thisVODate;
                                pndAtVO = thisPndAtVO;
                            }
                        } else { //if no dateAtVO
                            dateAtVO = thisVODate;
                            pndAtVO = thisPndAtVO;
                        }
                        
                        $this.closest(".row").addClass("yellowRow");
                    } else {
                        $this.closest(".row").removeClass("yellowRow");
                    }
    
                    if(hasReachedVO){
                        // console.log(mouseNum + "has reached VO");
                        $(".VO_status" + dataSearch).removeClass("notReached").addClass("reached").text("has");
                        $(".VO_PND" + mouseNum + "_calc").text(pndAtVO);
                        $(".VO_date" + mouseNum + "_calc").text(dateAtVO);
                        this.watchVO_mass(mouseNum, true);
                    } else {
                        // console.log(mouseNum + "has not reached VO");
                        $(".ifVO" + dataSearch).hide();
                        $(".VO_status" + dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet");
                        $(".VO_PND" + mouseNum + "_calc").text("NA");
                        $(".VO_mass" + mouseNum + "_calc").text("NA");
                        $(".VO_date" + mouseNum + "_calc").text("NA");
                    }
                });
            }
        }

        if (anyHasReachedVO) {
            $(".ifVO.msg").show();
            this.watchFor1E();
            this.adjustifOther();
        } else {
            $(".ifVO.msg").hide();
        }

        this.resize();
    },

    watchVO_mass: function (mouseNum, knownStatus) {
        var hasReachedVO = false;
        var dataSearch = this.numSearch(mouseNum);
        
        if(knownStatus === true) {
            hasReachedVO = true;
        } else {
            $(".VO_state" + dataSearch).each((i,e)=> {
                $this = $(e);
                // if the state is VO
                if($this.val()==="VO") {
                    hasReachedVO = true;
                    return false;
                }
            });
        }

        if(hasReachedVO){
            var $VO_massVal = $("#VO_mass"+mouseNum).val();
            if($VO_massVal) {
                $(".VO_mass" + mouseNum + "_calc").text($VO_massVal);
            } else {
                $(".VO_mass" + mouseNum + "_calc").text("[Enter VO Mass]")
            }
        } else {
            $(".VO_mass" + mouseNum + "_calc").text("NA");
        }
    },

    watchFor1E: function () {
        var anyHasReached1E = false;
        var hasReached1E = false;
        var thisPndAt1E, this1EDate, this1EMass;
        var pndAt1E, dateAt1E, massAt1E;

        var totalMice = parseInt($("#numOffspring").val());

        for (var i = 0; i < totalMice; i ++ ) {
            hasReached1E = false;
            pndAt1E = null;
            dateAt1E = null;
            massAt1E = null;

            var mouseNum = i + 1;
            var dataSearch = this.numSearch(mouseNum);
            // console.log("Watching " + mouseNum + " for 1E");

            $(".firstE_state" + dataSearch).each((i,e)=> {
                var $this = $(e);
                // if the state is E
                if($this.val()==="E") {
                    $(".if1E" + dataSearch).show();
                    // console.log($(".if1E" + dataSearch).html());
                    anyHasReached1E = true;
                    hasReached1E = true;
                    thisPndAt1E = $this.closest(".addedRow").find(".mat_pnd").text();
                    this1EDate = $this.closest(".addedRow").find(".mat_date").text();
                    this1EMass = $this.closest(".addedRow").find(".firstE_mass").val();
    
                    if(dateAt1E) { //if there's a value for dateAt1E
                        if(new Date(this1EDate).getTime() < new Date(dateAt1E).getTime()) { //if this date is earlier than current dateAt1E
                            dateAt1E = this1EDate;
                            pndAt1E = thisPndAt1E;
                            massAt1E = this1EMass;
                        }
                    } else { //if no dateAt1E
                        dateAt1E = this1EDate;
                        pndAt1E = thisPndAt1E;
                        massAt1E = this1EMass;
                    }
                    
                    $this.closest(".row").addClass("yellowRow");
                } else {
                    $this.closest(".row").removeClass("yellowRow");
                }
            });
    
            if(hasReached1E){
                // console.log("This mouse has reached 1E");
                $(".firstE_status" + dataSearch).removeClass("notReached").addClass("reached").text("has");
                $(".firstE_PND" + mouseNum + "_calc").text(pndAt1E);
                $(".firstE_date" + mouseNum + "_calc").text(dateAt1E);
                $(".firstE_mass" + mouseNum + "_calc").text(massAt1E);
            } else {
                // console.log("This mouse has not reached 1E");
                $(".if1E" + dataSearch).hide();
                $(".firstE_status" + dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet");
                $(".firstE_PND" + mouseNum + "_calc").text("NA");
                $(".firstE_mass" + mouseNum + "_calc").text("NA");
                $(".firstE_date" + mouseNum + "_calc").text("NA");
            }

        }
        this.resize();
    },

    switchMassTable: function (pnd) {
        if(pnd){
            var $massDiv = $("._"+pnd);
            $massDiv.show();
            $(".massDiv:not(._"+pnd).hide();
            this.resize();
        } else {
            $(".massDiv").hide();
        }
        this.resize();
    },

    createMaturationRow_VO: function (dateInputVal, mouseNum) {
        var $div, selectBaseName, textareaBaseName, rowCount, selectName, textareaName, pndValue;
        var dataSearch = this.numSearch(mouseNum);
        $div = $(".VO_div" + dataSearch);
        selectBaseName = "vocheck" + mouseNum + "_";
        textareaBaseName = "vocheck_other" + mouseNum + "_";

        rowCount = $div.find(".addedRow").length + 1;
        rowClassName = "Row_" + rowCount;
        selectName = selectBaseName + rowCount;
        textareaName = textareaBaseName + rowCount;
        
        pndValue = this.getPND(dateInputVal);


        $div.prepend(
            $("<div></div>", {
                "class": "row mt-2 addedRow " + rowClassName
            }).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<select></select>", {
                        name: selectName,
                        id: selectName,
                        "class": "VO_state fullWidth VO",
                        "data-num": mouseNum
                    }).append(
                        '<option value="Closed">Closed</option>',
                        '<option value="|">Line |</option>',
                        '<option value="T">&#8869;</option>',
                        '<option value="Almost">Almost</option>',
                        '<option value="VO">Open</option>',
                        '<option value="Other">Other</option>'
                    ).on("change", (e)=> {
                        this.watchForVO();
                        this.showOther($(e.currentTarget));
                    })
                ).append(
                    $("<text" + "area></text" + "area>", {
                        name: textareaName,
                        id: textareaName,
                        rows: 1,
                        "class": "VO fullWidth ifOther autoAdjust",
                        "data-num": mouseNum,
                    }).on('input', (e)=> {
                        var el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = (el.scrollHeight) + 'px';
                        this.resize();
                    })
                )
            ).append(
                $("<div></div>", {
                    "class": "col mat_date",
                    "data-num": mouseNum
                }).append(dateInputVal)
            ).append(
                $("<div></div>", {
                    "class": "col mat_pnd",
                    "data-num": mouseNum
                }).append(pndValue)
            )
        );

        this.resize();
    },

    createMaturationRow_1E: function (dateInputVal, mouseNum) {
        var $div, selectBaseName, textareaBaseName, massBaseName, rowCount, selectName, textareaName, massName, pndValue;
        var dataSearch = this.numSearch(mouseNum);
        $div = $(".firstE_div" + dataSearch);
        selectBaseName = "firstecheck" + mouseNum + "_";
        textareaBaseName = "firstecheck" + mouseNum + "_other_";
        massBaseName = "firstemass" + mouseNum + "_";
        slideLocBaseName = "slidelocation" + mouseNum + "_";

        rowCount = $div.find(".addedRow").length + 1;
        rowClassName = "Row_" + rowCount;
        selectName = selectBaseName + rowCount;
        textareaName = textareaBaseName + rowCount;
        massName = massBaseName + rowCount;
        slideLocName = slideLocBaseName + rowCount;
        
        pndValue = this.getPND(dateInputVal);


        $div.prepend(
            $("<div></div>", {
                "class": "row mt-2 addedRow " + rowClassName
            }).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<select></select>", {
                        name: selectName,
                        id: selectName,
                        "class": "firstE_state fullWidth firstE",
                        "data-num": mouseNum
                    }).append(
                        '<option value="">[Select]</option>',
                        '<option value="D">Diestrus</option>',
                        '<option value="P">Proestrus</option>',
                        '<option value="E">Estrus</option>',
                        '<option value="Other">Other</option>'
                    ).on("change", (e)=> {
                        this.watchFor1E();
                        this.showOther($(e.currentTarget));
                    })
                ).append(
                    $("<text" + "area></text" + "area>", {
                        name: textareaName,
                        id: textareaName,
                        rows: 1,
                        "class": "firstE fullWidth ifOther autoAdjust",
                        "data-num": mouseNum
                    }).on('input', (e)=> {
                        var el = e.currentTarget;
                        el.style.height = 'auto';
                        el.style.height = (el.scrollHeight) + 'px';
                        this.resize();
                    })
                )
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        name: massName,
                        id: massName,
                        type: "number",
                        "class": "firstE fullWidth firstE_mass",
                        "data-num": mouseNum
                    }).on("input", ()=>{
                        this.watchFor1E();
                    })
                )
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        name: slideLocName,
                        id: slideLocName,
                        "class": "firstE fullWidth sliceLoc",
                        "data-num": mouseNum
                    })
                )
            ).append(
                $("<div></div>", {
                    "class": "col mat_date",
                    "data-num": mouseNum
                }).append(dateInputVal)
            ).append(
                $("<div></div>", {
                    "class": "col mat_pnd",
                    "data-num": mouseNum
                }).append(pndValue)
            )
        );

        this.resize();
    },

    removeMaturationRow: function (whichPheno, mouseNum) {
        var dataSearch = this.numSearch(mouseNum);
        if(whichPheno === "VO"){
            var $div = $(".VO_div" + dataSearch);
        } else if(whichPheno === "firstE"){
            var $div = $(".firstE_div" + dataSearch);
        }
        var numRows = $div.find(".addedRow").length;
        $div.find(".Row_"+numRows).remove();
        // $div.find(".addedRow").first().remove(); // remove first now, since that's the most recent

        this.resize();
    },

    calcValues: function () {
        $(".tableDiv").find("tr").each((i,e)=> { //for each row
            $("td", e).each((i,e)=> { //for each cell
                var value = $(e).text(); //get the value of the text
                if (value === "" || value === "NaN") { //if blank or NaN
                    $(e).text("NA"); //make NA
                }
            })
        });

        //resize the tableDiv
        this.resize();
    },

    // source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
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

        for (var i = 0; i <= $("#numOffspring").val() && i < rows.length; i++) {
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
    copyTable: function ($table, copyHead, $divForCopy, transpose = false) {
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
        $table.find("tbody").children("tr").slice(0, parseInt($("#numOffspring").val())).each((i,e)=> {
            // If transposing, start the row number at 0 for each new row
            if(transpose){rowNum = 0;}
            // Find each cell within the row
            $(e).find("td, th").each((i,e)=> {
                // If there's not yet an array for this row, make an empty one
                if(rows[rowNum]===undefined){rows[rowNum] = []}
                // Add the text of each cell to the row's array
                if ($(e).text()) {
                    var addText = $(e).text();
                } else {
                    var addText = "NA"
                }
                console.log(addText);
                rows[rowNum].push(addText);
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

        // the div has to be showing in order to be copied
        $divForCopy.show();
        // Add each row to the temporary text area using \n (new line) to separate them
        $temp.append(rows.join("\n"));
        // Append the textarea to the div for copy, then select it
        $temp.appendTo($divForCopy).select();
        // Copy the "selected" text
        document.execCommand("copy");
        $divForCopy.hide();
        $temp.remove(); //remove temp
        // Doesn't work within LA b/c of permissions, but would be easier way to copy w/o appending to page
        // navigator.clipboard.writeText(rows.join("\n")); 
    },

    // copyTable: function ($table, copyHead, $divForCopy) {
    //     //create a temporary text area
    //     var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
    //     var addLine = "";
    //     if (copyHead) {
    //         $table.find("thead").children("tr").each(function () { //add each child of the row
    //             var addTab = "";
    //             $(this).children().each(function () {
    //                 $temp.text($temp.text() + addTab + $(this).text());
    //                 addTab = "\t";
    //             });
    //         });
    //         addLine = "\n";
    //     }

    //     $table.find("tbody").children("tr").slice(0, parseInt($("#numOffspring").val())).each(function () { //add each child of the row
    //         $temp.text($temp.text() + addLine);
    //         var addTab = "";
    //         $(this).find("td").each(function () {
    //             if ($(this).text()) {
    //                 var addText = $(this).text();
    //             } else {
    //                 var addText = "NA"
    //             }
    //             $temp.text($temp.text() + addTab + addText);
    //             addTab = "\t";
    //             addLine = "\n";
    //         });
    //     });

    //     // the div has to be showing in order to be copied
    //     $divForCopy.show();
    //     $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
    //     document.execCommand("copy"); //copy the "selected" text
    //     $divForCopy.hide();
    //     $temp.remove(); //remove temp
    // },

    toggleTableFuncs: function ($tableDiv, $errorMsgDiv) {
        this.resize();
        this.data_valid_form($errorMsgDiv); //run to give error, but allow to calc regardless
        this.calcValues();
        $tableDiv.toggle();
        this.parent_class.resize_container();
    },

    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = this.data_valid_form($errorMsg);

        if (data_valid) {
            this.calcValues();
            this.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }

        this.resize();
    },

    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy){
        var data_valid = this.data_valid_form($errorMsg);
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        this.calcValues();

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            this.resize(); //resize
            this.copyTable($tableToCopy, copyHead, $divForCopy); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied attempted</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }

        this.resize();
    },

    makeHTMLforMice: function (numMice) {
        $(".VO_div").html("");
        $(".fistE_div").html("");
        this.makeMassSelect();
        this.makeMassEntry(numMice);
        this.makeDatesList();
        this.makeVOStatusMsg(numMice);
        this.make1EStatusMsg(numMice);
        this.makeDemoEntries(numMice);
        this.makeMassRows(numMice);
        this.makeDemoRows(numMice);
    },

    makeVOStatusMsg: function (numMice) {
        var $VOmsgDiv = $("#VOmsgDiv");
        $VOmsgDiv.html(""); //clear
        for(i = 0; i < numMice; i ++ ) {
            var mouseNum = i + 1;
            $VOmsgDiv.append(
                $("<div></div>", {
                    "class": "mouse" + mouseNum
                }).append(
                    'Mouse <span class="mouseID' + mouseNum + '_calc">__</span> ' +  
                    '<span class="tailMark' + mouseNum + '_calc">&nbsp;</span> <span class="VO_status notReached" data-num="'+mouseNum+'">has NOT yet</span> had vaginal opening ' +
                    '<span class="ifVO" data-num="'+mouseNum+'">on PND <span class="VO_PND'+mouseNum+'_calc">&nbsp;</span> with a mass of <span class="VO_mass'+mouseNum+'_calc">&nbsp;</span> g</span>'
                )
            );
        }
    },

    make1EStatusMsg: function (numMice) {
        var $firstEmsgDiv = $("#firstEmsgDiv");
        $firstEmsgDiv.html(""); //clear
        for(i = 0; i < numMice; i ++ ) {
            var mouseNum = i + 1;
            $firstEmsgDiv.append(
                $("<div></div>", {
                    "class": "mouse" + mouseNum + " ifVO",
                    "data-num": mouseNum
                }).append(
                    'Mouse <span class="mouseID' + mouseNum + '_calc">__</span> ' +  
                    '<span class="tailMark' + mouseNum + '_calc">&nbsp;</span> <span class="firstE_status notReached" data-num="'+mouseNum+'">has NOT yet</span> had first estrus ' +
                    '<span class="if1E" data-num="'+mouseNum+'">on PND <span class="firstE_PND'+mouseNum+'_calc">&nbsp;</span> with a mass of <span class="firstE_mass'+mouseNum+'_calc">&nbsp;</span> g</span>'
                )
            );
        }
    },

    makeDemoEntries: function (numMice) {
        var $demoEntryDiv = $("#demoEntryDiv");
        $demoEntryDiv.html(""); //clear

        var showChecked = "col-12 hideView editDemoChecked";

        for(i = 0; i < numMice; i ++ ) {
            var mouseNum = i + 1;
            $demoEntryDiv.append(
                $("<div></div>", {
                    "class": "mouse" + mouseNum + " row mt-2"
                }).append(
                    $("<div></div>", {
                        "class": "col-6 col-md-3 container"
                    }).append(
                        $("<div></div>", {
                            "class": "row"
                        }).append(
                            $("<div></div>", {
                                "class": "col-12"
                            }).append(
                                "<h4 class='needForTableLab'>Mouse " + mouseNum + " ID</h4"
                            )
                        ).append(
                            $("<div></div>", {
                                "class": showChecked + " mouse" + mouseNum
                            }).append(
                                '<input type="text" class="simpleCalc mouseID" id="mouseID'+mouseNum+'" name="mouseid'+mouseNum+'" data-num="'+mouseNum+'"/>'
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "col-12 mouseID"+mouseNum+"_calc mouse"+mouseNum
                            })
                        )
                    )
                ).append(
                    $("<div></div>", {
                        "class": "col-6 col-md-3 container"
                    }).append(
                        $("<div></div>", {
                            "class": "row"
                        }).append(
                            $("<div></div>", {
                                "class": "col-12"
                            }).append(
                                "<h4 class='needForTableLab'>Full ID " + mouseNum + "</h4"
                            )
                        ).append(
                            $("<div></div>", {
                                "class": showChecked + " mouse" + mouseNum
                            }).append(
                                '<input type="text" class="simpleCalc mouseID_spec" id="mouseID_spec'+mouseNum+'" name="mouseidspec'+mouseNum+'" data-num="'+mouseNum+'"/>'
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "col-12 mouseID_spec"+mouseNum+"_calc mouse"+mouseNum
                            })
                        )
                    )
                ).append(
                    $("<div></div>", {
                        "class": "col-6 col-md-3 container"
                    }).append(
                        $("<div></div>", {
                            "class": "row"
                        }).append(
                            $("<div></div>", {
                                "class": "col-12"
                            }).append(
                                "<h4>Ear Tag " + mouseNum + "</h4"
                            )
                        ).append(
                            $("<div></div>", {
                                "class": showChecked + " mouse" + mouseNum
                            }).append(
                                $("<input></input>", {
                                    name: "eartag" + mouseNum,
                                    id: "earTag" + mouseNum,
                                    type: "number",
                                    "class": "simpleCalc"
                                })
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "col-12 earTag"+mouseNum+"_calc mouse"+mouseNum
                            })
                        )
                    )
                ).append(
                    $("<div></div>", {
                        "class": "col-6 col-md-3 container"
                    }).append(
                        $("<div></div>", {
                            "class": "row"
                        }).append(
                            $("<div></div>", {
                                "class": "col-12"
                            }).append(
                                "<h4>Tail Mark " + mouseNum + "</h4"
                            )
                        ).append(
                            $("<div></div>", {
                                "class": showChecked
                            }).append(
                                '<input type="button" value="Red |" id="redButton'+mouseNum+'" name="redbutton'+mouseNum+'" class="redButton mouse'+mouseNum+'" data-num="'+mouseNum+'"/> '+
                                '<input type="button" value="Black |" id="blackButton'+mouseNum+'" name="blackbutton'+mouseNum+'" class="blackButton mouse'+mouseNum+'" data-num="'+mouseNum+'"/> '+
                                '<input type="button" value="Clear" id="clearButton'+mouseNum+'" name="clearbutton'+mouseNum+'" class="clearButton mouse'+mouseNum+'" data-num="'+mouseNum+'"/> '+
                                '<span class="tailMark" id="tailMark'+mouseNum+'" data-num="'+mouseNum+'">&nbsp;</span>'
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "col-12 tailMark"+mouseNum+"_calc mouse"+mouseNum
                            })
                        )
                    )
                )
            )
        }
    },

    makeMassRows: function (numMice) {
        var $massTable = $("#massTable");
        var pnds = this.massDays;

        for(i=0; i < numMice; i++) {
            var mouseNum = i + 1;
            var $tr = $massTable.find("tr.mouse"+mouseNum).html("");
            $tr.append('<td class="mouseID'+mouseNum+'_calc">&nbsp;</td>')
            for (j = 0; j < pnds.length; j ++ ){
                var pnd = pnds[j];
                $tr.append(
                    $("<td></td>", {
                        "class": "mass_pnd" + pnd + "_" + mouseNum + "_calc"
                    })
                )
            }
        }
    },

    makeMassSelect: function(){
        var $select = $("#massSelect");
        var pnds = this.massDays;
        
        for(i = 0; i < pnds.length; i++){
            var pnd = pnds[i];
            $select.append(
                '<option value="pnd' +pnd + '">PND ' + pnd + '</option>'
            );
        }
    },

    makeDatesList: function(){
        var $list = $("#datesList");
        var pnds = this.datesList;
        $list.html("");
        $list.append(
            '<div class="row"></div>'
        );

        var $row = $list.find(".row");

        for(i = 0; i < pnds.length; i++){
            var pnd = pnds[i];
            $row.append(
                $("<div></div>", {
                    "class": "med3"
                }).append(
                    $("<strong></strong>").append(
                        "PND " + pnd + ": "
                    )
                ).append(
                    $("<span></span>", {
                        "class": "pnd pnd" + pnd
                    })
                )
            );
        }
    },

    makeMassEntry: function (numMice = 5) {
        var $entryDiv = $("#forMassEntry");
        var pnds = this.massDays;

        for(i = 0; i < pnds.length; i++){
            var pnd = pnds[i];
            $entryDiv.append(
                $("<div></div>", {
                    "class": "container mt-2 _pnd" + pnd + " massDiv"
                }).append(
                    $("<div></div>", {
                        "class": "row align-items-end mt-2 blackBackground"
                    }).append(
                        $("<div></div>", {
                            "class": "myLeftCol2"
                        }).append(
                            "PND " + pnd + ":"
                        )
                    ).append(
                        $("<div></div>", {
                            "class": "col pnd"+pnd
                        })
                    )
                )
            );

            for(j = 0; j < numMice; j ++){
                mouseNum = j + 1;
                $entryDiv.find(".massDiv").last().append(
                    $("<div></div>", {
                        "class": "entry",
                        "data-num": mouseNum
                    })
                );
                this.addMassAGDRow(
                    $entryDiv.find(".entry").last(),
                    "mass",
                    pnd,
                    mouseNum
                );
                if(this.checkInArray(pnd, this.agdDays)){
                    this.addMassAGDRow(
                        $entryDiv.find(".entry").last(),
                        "agd",
                        pnd,
                        mouseNum
                    );
                }
            }
        }
    },

    addMassAGDRow: function($div, type, pnd, mouseNum){
        var text;
        if(type === "mass"){
            text = "Mass (g):";
            idText = "mass";
        } else if(type == "agd"){
            text = "AGD:"
            idText = "AGD"
        }
        $div.append(
            $("<div></div>", {
                "class": "row mt-2"
            }).append(
                $("<div></div>", {
                    "class": "myLeftCol3"
                }).append(text)
            ).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    $("<input></input>", {
                        "type": "number",
                        "class": "simpleCalc",
                        "name": type + "_pnd" + pnd + "_" + mouseNum,
                        "id": idText + "_pnd" + pnd + "_" + mouseNum,
                        "data-num": mouseNum
                    })
                )
            )
        );        
    },

    makeDemoRows: function (numMice) {
        var $demoTable = $("#demoTable");
        
        for(i=0; i < numMice; i++) {
            var mouseNum = i + 1;
            var $tr = $demoTable.find("tr.mouse"+mouseNum).html("");
            $tr.append(
                '<td class="mouseID_spec'+mouseNum+'_calc"></td>'+
                '<td class="mouseID'+mouseNum+'_calc"></td>'+
                '<td class="earTag'+mouseNum+'_calc"></td>'+
                '<td>F</td>'+
                '<td class="damID_calc"></td>'+
                '<td class="cageNum_calc"></td>'
                )
        }
    },

    startCycleFuncs: function () {
        var dateClass = "pnd" + $("#cycleStart").val();
        var allClasses = "pnd " + "startCycle " + dateClass;
        $(".startCycle").removeClass().addClass(allClasses);
        if($("#DOB").val()){
            this.addDays($("#DOB").val(), $("."+dateClass), parseInt($("#cycleStart").val()));
        }
        this.getPND_today();
        this.resize();
    },

    endCycleFuncs: function () {
        var dateClass = "pnd" + $("#cycleEnd").val();
        var allClasses = "pnd " + "endCycle " + dateClass;
        $(".endCycle").removeClass().addClass(allClasses);
        if($("#DOB").val()){
            this.addDays($("#DOB").val(), $("."+dateClass), parseInt($("#cycleEnd").val()));
        }
        this.getPND_today();
        this.resize();
    }
};