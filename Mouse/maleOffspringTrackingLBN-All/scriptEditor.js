my_widget_script =
{
    init: function (mode, json_data) {
        //uncomment to inspect and view code while developing
        //debugger;

        //Make HTML for five animals
        this.makeHTMLforMice(5);

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to console
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode);

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
            addedRows_PPSs: dynamicContent.addedRows_PPSs,
            allPPS_dates: dynamicContent.allPPS_dates
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
                "<span style='color:green'>||</span>", 
                "<span style='color:red'>|||</span>", 
                "<span style='color:blue'>||||</span>",
                "<span style='color:grey'>|||||</span>"],
            addedRows_PPSs: [1, 2, 3, 4, 5],
            allPPS_dates: [
                ["2021-01-01"],
                ["2021-01-01", "2021-01-02"], 
                ["2021-01-01", "2021-01-02", "2021-01-03"], 
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04"],
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04", "2021-01-05"]
            ]
        };

        //return the stringified output for use by the init function
        return JSON.stringify(output);
    },

    /**
     * source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     */
    is_valid: function (b_suppress_message) {
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
            return alert(fail_log); //return the fail log as an alert
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
        // console.log("Parsed Json");
        // console.log(parsedJson);
        // console.log(
        //     "Tail Marks: "  + parsedJson.tailMarks + "\n" + 
        //     "addedRows_PPSs: " + parsedJson.addedRows_PPSs + "\n" + 
        //     "allPPS_dates: " + parsedJson.allPPS_dates + "\n" 
        // );

        //The first time that this runs when making a new widget, tailMarks (and the other components) are undefined
        //parsedJson (json_data) is just an object with various methods, but it doesn't have these parameters yet
        if(parsedJson.tailMarks) {
            // console.log("Found tail marks and proceeding to add data for each mouse");
            for (var j = 0; j < maxOffspring; j++) {
                var mouseNum = j + 1;
                var dataSearch = my_widget_script.dataSearch("num", mouseNum);
    
                var $tailMark = $("#tailMark" + mouseNum);
                $tailMark.html(parsedJson.tailMarks[j]);
                var $tailMarkCalc = $(".tailMark" + mouseNum + "_calc");
                $tailMarkCalc.html(parsedJson.tailMarks[j]);
    
                var dates_PPS = parsedJson.allPPS_dates[j];
                for (var i = 0; i < parsedJson.addedRows_PPSs[j]; i++) {
                    my_widget_script.createMaturationRow_PPS(dates_PPS[i], mouseNum);
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
            $(".entry.mat").each(function () {
                var mouseNum = parseInt($(this).data("num"));
                if(mouseNum <= parseInt($("#numOffspring").val())){
                    $(this).show();
                }
            });
            my_widget_script.adjustifOther();
            $(".tableDiv").show();
        } else {
            if($("#DOB").val()) {
                $("#entryDiv").insertAfter("#titleDiv");
                $("#editDemo").prop("checked", false);
                $(".editDemoChecked").hide();
            } else {
                $("#editDemo").prop("checked", true);
                $(".editDemoChecked").show();
            }
            // Add * and # to mark required field indicators
            my_widget_script.addRequiredFieldIndicators();
            // $(".hideEdit").hide();
        }
    },

    updateTailMarkButton: function ($tailMark) {
        if($tailMark.hasClass("mouse1")) {
            $(".tailMark1_calc").html(
                $tailMark.parent().find(".tailMark").html()
            );
        } else if($tailMark.hasClass("mouse2")) {
            $(".tailMark2_calc").html(
                $tailMark.parent().find(".tailMark").html()
            );
        } else if($tailMark.hasClass("mouse3")) {
            $(".tailMark3_calc").html(
                $tailMark.parent().find(".tailMark").html()
            );
        } else if($tailMark.hasClass("mouse4")) {
            $(".tailMark4_calc").html(
                $tailMark.parent().find(".tailMark").html()
            );
        } else if($tailMark.hasClass("mouse5")) {
            $(".tailMark5_calc").html(
                $tailMark.parent().find(".tailMark").html()
            );
        }
        my_widget_script.resize();
    },

    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each(function () { //find element with class "needForTableLab"
            //alert($(this).val());
            $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            //alert($(this).val());
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });
    },

    updateTailMarkCalc: function ($tailMark) {
        var mouseNum = $tailMark.data("num");
        var $tailMarkCalc = $(".tailMark" + mouseNum + "_calc");
        $tailMarkCalc.html($tailMark.html());
        
        my_widget_script.resize();
    },

    switchMouseForEntry: function () {
        // Comes out as number, not string
        var selectedMouse = $("#mouseSelect :selected").data("num");
        if (($.inArray(selectedMouse, [1, 2, 3, 4, 5]) !== -1)) {
            $(".entry[data-num='" + selectedMouse + "']").show();
            $(".entry[data-num!='" + selectedMouse + "']").hide();
        } else {
            $(".entry").hide();
        }
        my_widget_script.resize();
    },

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
        } else {
            $toToggle.hide();
        }
        my_widget_script.resize();
    },

    hideWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.hide();
        } else {
            $toToggle.show();
        }
        my_widget_script.resize();
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
        my_widget_script.resize();
    },

    getLocalDateString: function () {
        var dateTodayString = luxon.DateTime.now().toISODate();
        // console.log(dateTodayString);
        return(dateTodayString);
    },

    adjustifOther: function () {
        $(".PPS_state").each(function () {
           my_widget_script.showOther($(this));
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
            console.log($dateInput.val());
        }
    },

    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        $('.myLeftCol2').addClass("col-6 col-md-4 col-lg-3 text-right");
        $('.myLeftCol3').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right font-weight-bold");
        $(".med2").addClass("col-12 col-md-6 col-lg");
        $(".med3").addClass("col-12 col-sm-6 col-md-4");
        // $(".calcFull").addClass("simpleCalc fullWidth");

        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();
        
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        }).each(function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        }).each(function () {
            my_widget_script.checkTimeFormat($(this));
        });
        
        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
        });

        
        $("#editDemo").each(function () {
            my_widget_script.showWithCheck($(this), $(".editDemoChecked"));
        }).on("change", function () {
            my_widget_script.showWithCheck($(this), $(".editDemoChecked"));
        });
        
        $("#DOB").on("change", function () {
            my_widget_script.adjustForNumOffspring();
            my_widget_script.printPND_days();
            my_widget_script.getPND_today();
            my_widget_script.updateMatPND();
            my_widget_script.switchMouseForEntry();
            my_widget_script.watchForPPS();
        });

        $("#numOffspring").on("change", function () {
            my_widget_script.adjustForNumOffspring();
            my_widget_script.switchMouseForEntry();
            // var numMice = parseInt($(this).val());
        });

        // Change mouseID in select list
        $(".mouseID").each(function () {
            var mouseNum = $(this).data("num");
            $("#mouseSelect option.mouse" + mouseNum).text($(this).val());
        }).on("input", function () {
            var mouseNum = $(this).data("num");
            $("#mouseSelect option.mouse" + mouseNum).text($(this).val());
            my_widget_script.resize();
        });

        // Add tail mark
        $(".redButton").on("click", function () {
            $(this).parent().find(".tailMark").append(
                "<span style='color:red'>|</span>"
            );
            my_widget_script.updateTailMarkButton($(this));
        });

        $(".blackButton").on("click", function () {
            $(this).parent().find(".tailMark").append(
                "<span style='color:black'>|</span>"
            );
            my_widget_script.updateTailMarkButton($(this));
        });

        $(".clearButton").on("click", function () {
            $(this).parent().find(".tailMark").text(
                ""
            );
            my_widget_script.updateTailMarkButton($(this));
        });

        $("#showDates").each(function () {
            my_widget_script.showWithCheck($(this), $("#datesList"));
        }).on("change", function () {
            my_widget_script.showWithCheck($(this), $("#datesList"));
        });

        // Output table calculations
        $(".simpleCalc").each(function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        }).on("input", function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });

        $(".addMatCheck").on("click", function () {
            var $dateVal = $(this).parent().next().children(".addMatDate").val();
            var mouseNum = $(this).data("num");
            if ($dateVal) {
                my_widget_script.createMaturationRow_PPS($dateVal, mouseNum);
            } else {
                alert("Enter a Date");
            }
        });

        $(".addMatDate").val(my_widget_script.getLocalDateString());

        $(".removeMatCheck").on("click", function () {
            var proceed = confirm("Are you sure that you want to remove the last date?");
            if(proceed){
                var mouseNum = $(this).data("num");
                my_widget_script.removeMaturationRow("PPS", mouseNum);
                my_widget_script.watchForPPS();
            }
        });

        $("#massSelect").on("change", function () {
            var pnd = $(this).val();
            if (pnd) {
                my_widget_script.switchMassTable(pnd);
            } else {
                $(".massDiv").hide();
            }
            my_widget_script.resize();
        });

        $("#mouseSelect").on("change", function () {
            my_widget_script.switchMouseForEntry();
            my_widget_script.adjustifOther();
            my_widget_script.resize();
        });

        $(".PPS_mass").on("input", function () {
            var mouseNum = $(this).data("num");
            my_widget_script.watchPPS_mass(mouseNum);
        });

        // Output Table Buttons

        //Show/hide the table
        $(".toggleTable").on("click", function () { //when the showTable button is clicked. Run this function
            var $tableDiv, $errorMsgDiv;
            if($(this).hasClass("maturation")) {
                $tableDiv = $(".tableDiv.maturation");
                $errorMsgDiv = $(".errorMsg.maturation");
            } else if($(this).hasClass("mass")){
                $tableDiv = $(".tableDiv.mass");
                $errorMsgDiv = $(".errorMsg.mass");
            }

            if($tableDiv && $errorMsgDiv){
                my_widget_script.toggleTableFuncs($tableDiv, $errorMsgDiv);
            }
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('.toCSV').on("click", function () {
            var fileName; 
            var tableID 
            var $errorMsg 
            if($(this).hasClass("maturation")) {
                fileName = "maturation_" + $("#damID").val() + "_males";
                tableID = "maturationTable";
                $errorMsg = $(".errorMsg.maturation");
            } else if($(this).hasClass("mass")){
                fileName = "mass_" + $("#damID").val() + "_males";
                tableID = "massTable";
                $errorMsg = $(".errorMsg.mass");
            }

            if(fileName && tableID && $errorMsg){
                my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
            }
        });

        //When the copy button is clicked, run the copyTable function
        $(".copyDataButton").on("click", function () {
            var $copyHead //TO DO add table
            var $tableToCopy //TO DO add table
            var $tableDiv //TO DO add tableDiv
            var $errorMsg //TO DO add error message
            var $divForCopy //TO DO add div where the table copies to

            if($(this).hasClass("maturation")) {
                $copyHead = $(".copyHead.maturation");
                $tableToCopy = $("#maturationTable");
                $tableDiv = $(".tableDiv.maturation");
                $errorMsg = $(".errorMsg.maturation");
                $divForCopy = $(".forCopy.maturation");
            } else if($(this).hasClass("mass")) {
                $copyHead = $(".copyHead.mass");
                $tableToCopy = $("#massTable");
                $tableDiv = $(".tableDiv.mass");
                $errorMsg = $(".errorMsg.mass");
                $divForCopy = $(".forCopy.mass");
            }
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy);
        });
        
        my_widget_script.adjustForNumOffspring();
        my_widget_script.switchMouseForEntry();
        my_widget_script.printPND_days();
        my_widget_script.getPND_today();
        // update mat pnd before watching for values, otherwise, there's not DOB because the rows are initialized before the widget data is reloaded
        my_widget_script.updateMatPND();
        my_widget_script.watchForPPS();
        my_widget_script.calcValues();
        my_widget_script.adjustifOther();
        my_widget_script.resize();
    },

    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var tailMarks, addedRows_PPSs, allPPS_dates;
        var maxOffspring = 5;

        tailMarks = [];
        addedRows_PPSs = [];
        allPPS_dates = [];

        for (var j = 0; j < maxOffspring; j++) {
            var mouseNum = j + 1;
            var dataSearch = my_widget_script.dataSearch("num", mouseNum);
            var tailMark = $("#tailMark" + mouseNum).html();
            var addedRows_PPS = $(".PPS_div" + dataSearch).find(".addedRow").length;
            
            var dates_PPS = [];
            for (var i = 0; i < addedRows_PPS; i++) {
                var rowNum = i + 1;
                var rowClassName = ".Row_" + rowNum;
                var thisDate = $(".PPS_div" + dataSearch).find(rowClassName).find(".mat_date").html();
                dates_PPS[i] = thisDate;
            }


            // console.log(
            //     "Tail Mark: "  + tailMark + "\n" + 
            //     "addedRows_PPS: " + addedRows_PPS + "\n" + 
            //     "dates_PPS: " + dates_PPS + "\n" 
            // );
            if(tailMark) {
                tailMarks[j] = tailMark;
            } else {
                tailMarks[j] = "";
            }
            addedRows_PPSs[j] = addedRows_PPS;
            if(dates_PPS) {
                allPPS_dates[j] = dates_PPS;
            } else {allPPS_dates[j] = [""];}
        }

        var dynamicContent = {
            tailMarks: tailMarks,
            addedRows_PPSs: addedRows_PPSs,
            allPPS_dates: allPPS_dates
        };

        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    /** -----------------------------------------------------------------------------
     * source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     * -----------------------------------------------------------------------------
     */
    data_valid_form: function ($errorMsgDiv) {
        var valid = true; //begin with a valid value of true
        //var fail_log = ''; //begin with an empty fail log
        //var name; //create a name variable

        //search the_form for all elements that are of class "needForTable"
        $('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(this).attr('id'); //replace the name variable with the id attribute of this element
                //fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $errorMsgDiv.html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $errorMsgDiv.html("");
        }

        return valid;
    },

    watchValue: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
        my_widget_script.resize();
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
            my_widget_script.updateToDoStatus(dateDiff_days);
            my_widget_script.updateCycleStatus(dateDiff_days);

            return(dateDiff_days);
        } else {
            my_widget_script.switchMassTable($("#massSelect").val());
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
                textOutput = "[Enter Date of PPS Check]";
            }
        } else {
            textOutput = "[Enter DOB]";
        }
        
        return textOutput;
    },

    updateMatPND: function () {
        $(".mat_pnd").each(function () {
            var dateVal = $(this).prev(".mat_date").text();
            var pnd = my_widget_script.getPND(dateVal);
            $(this).text(pnd);
        });
    },

    updateToDoStatus: function (PND_today) {
        var $toDoStatus = $(".toDo_status");
        if ($.inArray(PND_today, [28, 35, 42, 49, 56, 63]) !== -1)  {
            $toDoStatus.html("<span style='color:blue'>Take mass today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            my_widget_script.switchMassTable("pnd"+PND_today);
        } else if ($.inArray(PND_today, [22, 23, 24, 70, 71, 72]) !== -1) {
            $toDoStatus.html("<span style='color:blue'>Take mass and AGD today</span>");
            // Set massSelect to today's date
            $("#massSelect").val("pnd"+PND_today);
            my_widget_script.switchMassTable("pnd"+PND_today);
        } else if (PND_today === 21) {
            $toDoStatus.html("<span style='color:blue'>Wean and take mass today - enter in litter widget</span>");
            $("#massSelect").val("");
            my_widget_script.switchMassTable("");
        } else {
            $toDoStatus.html("<em>No mass or AGD today</em>");
            $("#massSelect").val("");
            my_widget_script.switchMassTable($("#massSelect").val());
        }
    },

    updateCycleStatus: function (PND_today){
        var $cycling_status = $(".cycling_status");
        if(PND_today >= 70 && PND_today <= 91){
            $cycling_status.css("background-color", "yellow");
        } else {
            $cycling_status.css("background-color", "none");
        }
    },

    addDays: function ($startDateVal, $newDateClass, numDays) {
        var newDate = luxon.DateTime.fromISO($startDateVal).plus({days: numDays}).toLocaleString({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
        $newDateClass.text(newDate);
    },

    printPND_days: function () {
        if($("#DOB").val()){
            var pndDays = [21, 22, 23, 24, 28, 35, 42, 49, 56, 63, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91]
            
            for(i = 0; i < pndDays.length; i ++ ) {
                var pnd = pndDays[i];
                my_widget_script.addDays($("#DOB").val(), $(".pnd"+pnd), pnd);
            }
        }

        my_widget_script.resize();
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

        my_widget_script.resize();
    },

    watchForPPS: function () {
        // Function to check if PPS has happened, and find what the earliest date with open PPS marked is for each mouse

        var anyHasReachedPPS = false;
        var hasReachedPPS = false;
        var thisPndAtPPS, thisPPSDate;
        var pndAtPPS, dateAtPPS;

        var totalMice = parseInt($("#numOffspring").val());

        for (var i = 0; i < totalMice; i ++ ) {
            hasReachedPPS = false;
            pndAtPPS = null;
            dateAtPPS = null;

            var mouseNum = i + 1;
            // console.log("Mouse Number is " + mouseNum);
            var dataSearch = my_widget_script.dataSearch("num", mouseNum);

            if($(".PPS_state" + dataSearch).length === 0){
                $(".ifPPS" + dataSearch).hide();
                $(".PPS_status" + dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet");
                $(".PPS_PND" + mouseNum + "_calc").text("NA");
                $(".PPS_mass" + mouseNum + "_calc").text("NA");
                $(".PPS_date" + mouseNum + "_calc").text("NA");
            } else {
                $(".PPS_state" + dataSearch).each(function () {
                    // console.log("within .PPS_state function");
                    var $this = $(this);
                    
                    // if the state is PPS
                    if($this.val()==="PPS") {
                        $(".ifPPS" + dataSearch).show();
                        anyHasReachedPPS = true;
                        hasReachedPPS = true;
                        thisPndAtPPS = $this.closest(".addedRow").find(".mat_pnd").text();
                        thisPPSDate = $this.closest(".addedRow").find(".mat_date").text();
    
                        if(dateAtPPS) { //if there's a value for dateAtPPS
                            if(new Date(thisPPSDate).getTime() < new Date(dateAtPPS).getTime()) { //if this date is earlier than current dateAtPPS
                                dateAtPPS = thisPPSDate;
                                pndAtPPS = thisPndAtPPS;
                            }
                        } else { //if no dateAtPPS
                            dateAtPPS = thisPPSDate;
                            pndAtPPS = thisPndAtPPS;
                        }
    
                        $this.css("background-color", "yellow").closest(".row").css("background-color", "yellow"); 
                    } else {
                        $this.css("background-color", "").closest(".row").css("background-color", ""); 
                    }
    
                    if(hasReachedPPS){
                        // console.log(mouseNum + "has reached PPS");
                        $(".PPS_status" + dataSearch).removeClass("notReached").addClass("reached").text("has");
                        $(".PPS_PND" + mouseNum + "_calc").text(pndAtPPS);
                        $(".PPS_date" + mouseNum + "_calc").text(dateAtPPS);
                        my_widget_script.watchPPS_mass(mouseNum, true);
                    } else {
                        // console.log(mouseNum + "has not reached PPS");
                        $(".ifPPS" + dataSearch).hide();
                        $(".PPS_status" + dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet");
                        $(".PPS_PND" + mouseNum + "_calc").text("NA");
                        $(".PPS_mass" + mouseNum + "_calc").text("NA");
                        $(".PPS_date" + mouseNum + "_calc").text("NA");
                    }
                });
            }
        }

        if (anyHasReachedPPS) {
            $(".ifPPS.msg").show();
            my_widget_script.adjustifOther();
        } else {
            $(".ifPPS.msg").hide();
        }

        my_widget_script.resize();
    },

    watchPPS_mass: function (mouseNum, knownStatus) {
        var hasReachedPPS = false;
        var dataSearch = my_widget_script.dataSearch("num", mouseNum);
        
        if(knownStatus === true) {
            hasReachedPPS = true;
        } else {
            $(".PPS_state" + dataSearch).each(function () {
                $this = $(this);
                // if the state is PPS
                if($this.val()==="PPS") {
                    hasReachedPPS = true;
                    return false;
                }
            });
        }

        if(hasReachedPPS){
            var $PPS_massVal = $("#PPS_mass"+mouseNum).val();
            if($PPS_massVal) {
                $(".PPS_mass" + mouseNum + "_calc").text($PPS_massVal);
            } else {
                $(".PPS_mass" + mouseNum + "_calc").text("[Enter PPS Mass]")
            }
        } else {
            $(".PPS_mass" + mouseNum + "_calc").text("NA");
        }
    },

    switchMassTable: function (pnd) {
        if(pnd){
            var $massDiv = $("._"+pnd);
            $massDiv.show();
            $(".massDiv:not(._"+pnd).hide();
            my_widget_script.resize();
        } else {
            $(".massDiv").hide();
        }
        my_widget_script.resize();
    },

    createMaturationRow_PPS: function (dateInputVal, mouseNum) {
        var $div, selectBaseName, textareaBaseName, rowCount, selectName, textareaName, pndValue;
        var dataSearch = my_widget_script.dataSearch("num", mouseNum);
        $div = $(".PPS_div" + dataSearch);
        selectBaseName = "ppscheck" + mouseNum + "_";
        textareaBaseName = "ppscheck_other" + mouseNum + "_";

        rowCount = $div.find(".addedRow").length + 1;
        rowClassName = "Row_" + rowCount;
        selectName = selectBaseName + rowCount;
        textareaName = textareaBaseName + rowCount;
        
        pndValue = my_widget_script.getPND(dateInputVal);


        $div.append(
            $("<div/>", {
                "class": "row mt-2 addedRow " + rowClassName
            }).append(
                $("<div/>", {
                    "class": "col"
                }).append(
                    $("<select/>", {
                        name: selectName,
                        id: selectName,
                        "class": "PPS_state fullWidth PPS",
                        "data-num": mouseNum
                    }).append(
                        '<option value="No">No</option>',
                        '<option value="Starting">Starting</option>',
                        '<option value="No Red">No Red</option>',
                        '<option value="Incomplete Red">Incomplete Red</option>',
                        '<option value="PPS">PPS</option>',
                        '<option value="Other">Other</option>'
                    ).on("change", function () {
                        my_widget_script.watchForPPS();
                        my_widget_script.showOther($(this));
                    })
                ).append(
                    $("<text" + "area></text" + "area>", {
                        name: textareaName,
                        id: textareaName,
                        rows: 1,
                        "class": "PPS fullWidth ifOther autoAdjust",
                        "data-num": mouseNum,
                    }).on('input', function () {
                        this.style.height = 'auto';
                        this.style.height = (this.scrollHeight) + 'px';
                        my_widget_script.resize();
                    })
                )
            ).append(
                $("<div/>", {
                    "class": "col mat_date",
                    "data-num": mouseNum
                }).append(dateInputVal)
            ).append(
                $("<div/>", {
                    "class": "col mat_pnd",
                    "data-num": mouseNum
                }).append(pndValue)
            )
        );

        my_widget_script.resize();
    },

    removeMaturationRow: function (whichPheno, mouseNum) {
        var dataSearch = my_widget_script.dataSearch("num", mouseNum);
        if(whichPheno === "PPS"){
            var $div = $(".PPS_div" + dataSearch);
        }
        $div.find(".addedRow").last().remove();

        my_widget_script.resize();
    },

    calcValues: function () {
        $(".tableDiv").find("tr").each(function () { //for each row
            $("td", this).each(function () { //for each cell
                var value = $(this).text(); //get the value of the text
                if (value === "" || value === "NaN") { //if blank or NaN
                    $(this).text("NA"); //make NA
                }
            })
        });

        //resize the tableDiv
        my_widget_script.resize();
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

    copyTable: function ($table, copyHead, $divForCopy) {
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";
        if (copyHead) {
            $table.find("thead").children("tr").each(function () { //add each child of the row
                var addTab = "";
                $(this).children().each(function () {
                    $temp.text($temp.text() + addTab + $(this).text());
                    addTab = "\t";
                });
            });
            addLine = "\n";
        }

        $table.find("tbody").children("tr").slice(0, parseInt($("#numOffspring").val())).each(function () { //add each child of the row
            $temp.text($temp.text() + addLine);
            var addTab = "";
            $(this).find("td").each(function () {
                if ($(this).text()) {
                    var addText = $(this).text();
                } else {
                    var addText = "NA"
                }
                $temp.text($temp.text() + addTab + addText);
                addTab = "\t";
                addLine = "\n";
            });
        });

        // the div has to be showing in order to be copied
        $divForCopy.show();
        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $divForCopy.hide();
        $temp.remove(); //remove temp
    },

    toggleTableFuncs: function ($tableDiv, $errorMsgDiv) {
        my_widget_script.resize();
        my_widget_script.data_valid_form($errorMsgDiv); //run to give error, but allow to calc regardless
        my_widget_script.calcValues();
        $tableDiv.toggle();
        my_widget_script.parent_class.resize_container();
    },

    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form($errorMsg);

        if (data_valid) {
            my_widget_script.calcValues();
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }

        my_widget_script.resize();
    },

    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form($errorMsg);
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        my_widget_script.calcValues();

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            my_widget_script.resize(); //resize
            my_widget_script.copyTable($tableToCopy, copyHead, $divForCopy); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }

        my_widget_script.resize();
    },

    makeHTMLforMice: function (numMice) {
        my_widget_script.makePPSStatusMsg(numMice);
        my_widget_script.makeDemoEntries(numMice);
        my_widget_script.makeMassRows(numMice);
    },

    makePPSStatusMsg: function (numMice) {
        var $PPSmsgDiv = $("#PPSmsgDiv");
        $PPSmsgDiv.html(""); //clear
        for(i = 0; i < numMice; i ++ ) {
            var mouseNum = i + 1;
            $PPSmsgDiv.append(
                $("<div/>", {
                    "class": "mouse" + mouseNum
                }).append(
                    'Mouse <span class="mouseID' + mouseNum + '_calc">__</span> ' +  
                    '<span class="tailMark' + mouseNum + '_calc">&nbsp;</span> <span class="PPS_status notReached" data-num="'+mouseNum+'">has NOT yet</span> had preputial separation ' +
                    '<span class="ifPPS" data-num="'+mouseNum+'">on PND <span class="PPS_PND'+mouseNum+'_calc">&nbsp;</span> with a mass of <span class="PPS_mass'+mouseNum+'_calc">&nbsp;</span> g</span>'
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
                $("<div/>", {
                    "class": "mouse" + mouseNum + " row mt-2"
                }).append(
                    $("<div/>", {
                        "class": "col-4 container"
                    }).append(
                        $("<div/>", {
                            "class": "row"
                        }).append(
                            $("<div/>", {
                                "class": "col-12"
                            }).append(
                                "<h4 class='needForTableLab'>Mouse " + mouseNum + " ID</h4"
                            )
                        ).append(
                            $("<div/>", {
                                "class": showChecked + " mouse" + mouseNum
                            }).append(
                                '<input type="text" class="simpleCalc mouseID" id="mouseID'+mouseNum+'" name="mouseid'+mouseNum+'" data-num="'+mouseNum+'"/>'
                            )
                        ).append(
                            $("<div/>", {
                                "class": "col-12 mouseID"+mouseNum+"_calc mouse"+mouseNum
                            })
                        )
                    )
                ).append(
                    $("<div/>", {
                        "class": "col-4 container"
                    }).append(
                        $("<div/>", {
                            "class": "row"
                        }).append(
                            $("<div/>", {
                                "class": "col-12"
                            }).append(
                                "<h4>Ear Tag " + mouseNum + "</h4"
                            )
                        ).append(
                            $("<div/>", {
                                "class": showChecked + " mouse" + mouseNum
                            }).append(
                                $("<input/>", {
                                    name: "eartag" + mouseNum,
                                    id: "earTag" + mouseNum,
                                    type: "number",
                                    "class": "simpleCalc"
                                })
                            )
                        ).append(
                            $("<div/>", {
                                "class": "col-12 earTag"+mouseNum+"_calc mouse"+mouseNum
                            })
                        )
                    )
                ).append(
                    $("<div/>", {
                        "class": "col-4 container"
                    }).append(
                        $("<div/>", {
                            "class": "row"
                        }).append(
                            $("<div/>", {
                                "class": "col-12"
                            }).append(
                                "<h4>Tail Mark " + mouseNum + "</h4"
                            )
                        ).append(
                            $("<div/>", {
                                "class": showChecked
                            }).append(
                                '<input type="button" value="Red |" id="redButton'+mouseNum+'" name="redbutton'+mouseNum+'" class="redButton mouse'+mouseNum+'"/> '+
                                '<input type="button" value="Black |" id="blackButton'+mouseNum+'" name="blackbutton'+mouseNum+'" class="blackButton mouse'+mouseNum+'"/> '+
                                '<input type="button" value="Clear" id="clearButton'+mouseNum+'" name="clearbutton'+mouseNum+'" class="clearButton mouse'+mouseNum+'"/> '+
                                '<span class="tailMark" id="tailMark'+mouseNum+'" data-num="'+mouseNum+'">&nbsp;</span>'
                            )
                        ).append(
                            $("<div/>", {
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
        var pnds = [22, 23, 24, 28, 35, 42, 49, 56, 63, 70, 71, 72]

        for(i=0; i < numMice; i++) {
            var mouseNum = i + 1;
            var $tr = $massTable.find("tr.mouse"+mouseNum).html("");
            for (j = 0; j < pnds.length; j ++ ){
                var pnd = pnds[j];
                $tr.append(
                    $("<td/>", {
                        "class": "mass_pnd" + pnd + "_" + mouseNum + "_calc"
                    })
                )
            }
        }
    }
};