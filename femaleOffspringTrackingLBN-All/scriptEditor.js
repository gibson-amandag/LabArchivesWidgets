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
                "<span style='color:green'>||</span>", 
                "<span style='color:red'>|||</span>", 
                "<span style='color:blue'>||||</span>",
                "<span style='color:grey'>|||||</span>"],
            addedRows_VOs: [1, 2, 3, 4, 5],
            addedRows_1Es: [2, 3, 4, 5, 6],
            allVO_dates: [
                ["2021-01-01"],
                ["2021-01-01", "2021-01-02"], 
                ["2021-01-01", "2021-01-02", "2021-01-03"], 
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04"],
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04", "2021-01-05"]
            ],
            all1E_dates: [
                ["2021-01-01", "2021-01-02"], 
                ["2021-01-01", "2021-01-02", "2021-01-03"], 
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04"],
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04", "2021-01-05"],
                ["2021-01-01", "2021-01-02", "2021-01-03", "2021-01-04", "2021-01-05", "2021-01-06"]
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
        //     "addedRows_VOs: " + parsedJson.addedRows_VOs + "\n" + 
        //     "addedRows_1Es: " + parsedJson.addedRows_1Es + "\n" +
        //     "allVO_dates: " + parsedJson.allVO_dates + "\n" + 
        //     "all1E_dates: " + parsedJson.all1E_dates
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
    
                var dates_VO = parsedJson.allVO_dates[j];
                for (var i = 0; i < parsedJson.addedRows_VOs[j]; i++) {
                    my_widget_script.createMaturationRow_VO(dates_VO[i], mouseNum);
                }
    
                var dates_1E = parsedJson.all1E_dates[j];
                for(var i=0; i < parsedJson.addedRows_1Es[j]; i++ ) {
                    my_widget_script.createMaturationRow_1E(dates_1E[i], mouseNum);
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
        var dateToday = new Date();
        var dateTodayYear = dateToday.getFullYear();
        var dateTodayMonth = dateToday.getMonth() + 1;
        var dateTodayDay = dateToday.getDate();
        var dateTodayString = dateTodayYear + "-" + dateTodayMonth.toString().padStart(2, 0) + "-" + dateTodayDay.toString().padStart(2, 0);
        return(dateTodayString);
    },

    adjustifOther: function () {
        $(".firstE_state").each(function () {
            my_widget_script.showOther($(this));
        });

        $(".VO_state").each(function () {
           my_widget_script.showOther($(this));
        });
    },

    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        $('.myLeftCol2').addClass("col-6 col-md-4 col-lg-3 text-right");
        $('.myLeftCol3').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right font-weight-bold");
        $(".med2").addClass("col-12 col-md-6 col-lg");
        $(".med3").addClass("col-12 col-sm-6 col-md-4");
        // $(".calcFull").addClass("simpleCalc fullWidth");

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
            my_widget_script.watchForVO();
            my_widget_script.watchFor1E();
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
                if($(this).hasClass("VO")) {
                    my_widget_script.createMaturationRow_VO($dateVal, mouseNum);
                } else if($(this).hasClass("firstE")){
                    my_widget_script.createMaturationRow_1E($dateVal, mouseNum);
                }
            } else {
                alert("Enter a Date");
            }
        });

        $(".addMatDate").val(my_widget_script.getLocalDateString());

        $(".removeMatCheck").on("click", function () {
            var proceed = confirm("Are you sure that you want to remove the last date?");
            if(proceed){
                var mouseNum = $(this).data("num");
                if($(this).hasClass("VO")){
                    my_widget_script.removeMaturationRow("VO", mouseNum);
                    my_widget_script.watchForVO();
                } else if($(this).hasClass("firstE")){
                    my_widget_script.removeMaturationRow("firstE", mouseNum);
                    my_widget_script.watchFor1E();
                }
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

        $(".VO_mass").on("input", function () {
            var mouseNum = $(this).data("num");
            my_widget_script.watchVO_mass(mouseNum);
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
                fileName = "maturation_" + $("#damID").val() + "_females";
                tableID = "maturationTable";
                $errorMsg = $(".errorMsg.maturation");
            } else if($(this).hasClass("mass")){
                fileName = "mass_" + $("#damID").val() + "_females";
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
        my_widget_script.watchForVO();
        my_widget_script.watchFor1E();
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
        var tailMarks, addedRows_VOs, addedRows_1Es, allVO_dates, all1E_dates;
        var maxOffspring = 5;

        tailMarks = [];
        addedRows_VOs = [];
        addedRows_1Es = [];
        allVO_dates = [];
        all1E_dates = [];

        for (var j = 0; j < maxOffspring; j++) {
            var mouseNum = j + 1;
            var dataSearch = my_widget_script.dataSearch("num", mouseNum);
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


            // console.log(
            //     "Tail Mark: "  + tailMark + "\n" + 
            //     "addedRows_VO: " + addedRows_VO + "\n" + 
            //     "addedRows_1E: " + addedRows_1E + "\n" +
            //     "dates_VO: " + dates_VO + "\n" + 
            //     "dates_1E: " + dates_1E
            // );
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
        // var offset = new Date().getTimezoneOffset();
        var $DOBVal = $("#DOB").val();

        if($DOBVal){
            var offset = new Date().getTimezoneOffset(); //get the offset of local time from GTC
            // this is necessary because making a Date object from the input date string creates a date with time of midnight GTC
            // for locales with different time zones, this means that the Date displayed could be the previous day
    
            var currentYear = new Date().getFullYear();
            var currentMonth = new Date().getMonth();
            var currentDay = new Date().getDate();
            
            var DOB_asDate = new Date($DOBVal);
    
            //Adjust for offset
            var DOB_asDate_adj = new Date(DOB_asDate.getTime() + offset * 60 * 1000);
            var today_asDate = new Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0);
    
            var dateDiff_ms = today_asDate.getTime() - DOB_asDate_adj.getTime();
    
            var dateDiff_days = dateDiff_ms / (24 * 60 * 60 * 1000);
    
            var pndTodayString = ".pnd.pnd" + dateDiff_days;
            var pndNotTodayString = ".pnd:not(.pnd" + dateDiff_days + ")";
    
            $(pndTodayString).css("color", "red");
            $(pndNotTodayString).css("color", "black");
    
            $(".pndToday").text(dateDiff_days);

            // This prints at the top what needs to be done today and switches the Mass and AGD selector 
            my_widget_script.updateToDoStatus(dateDiff_days);
            my_widget_script.updateCycleStatus(dateDiff_days);
    
            return(dateDiff_days);
    
            // console.log(
            //     "Current Year: " + currentYear +"\n" +
            //     "Current Month: " + currentMonth + "\n" +
            //     "Current Day: " + currentDay + "\n" +
            //     "DOB String: " + $DOBVal + "\n" +
            //     "DOB Date Obj: " + DOB_asDate + "\n" +
            //     "DOB Adjusted Date Obj: " + DOB_asDate_adj + "\n" + 
            //     "Today Date Obj: " + today_asDate + "\n" +
            //     "Diff in ms: " + dateDiff_ms + "\n" +
            //     "Diff in days: " + dateDiff_days
            // )
        } else {
            my_widget_script.switchMassTable($("#massSelect").val());
        }
    },

    getPND: function (dateInputVal) {
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var DOBisDay = 0;
        var compDate_as_ms = new Date(dateInputVal).getTime();
        var textOutput;
        if($("#DOB").val()){
            if(dateInputVal){
                var DOB_as_ms = new Date($("#DOB").val()).getTime();
                var pnd = (compDate_as_ms - DOB_as_ms) / (1000 * 3600 * 24) + DOBisDay;
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
        var dateString = $startDateVal; //get the date string from the input

        var startDate = new Date(dateString);

        var offset = new Date().getTimezoneOffset(); //get the offset of local time from GTC
        // this is necessary because making a Date object from the input date string creates a date with time of midnight GTC
        // for locales with different time zones, this means that the Date displayed could be the previous day

        //Add the number of days (in ms) and offset (in ms) to the start Date (in ms) and make it a new date object
        var newDate = new Date(startDate.getTime() + numDays * 24 * 60 * 60 * 1000 + offset * 60 * 1000);

        $newDateClass.text(newDate.toDateString());
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
            var dataSearch = my_widget_script.dataSearch("num", mouseNum);

            if($(".VO_state" + dataSearch).length === 0){
                $(".ifVO" + dataSearch).hide();
                $(".VO_status" + dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet");
                $(".VO_PND" + mouseNum + "_calc").text("NA");
                $(".VO_mass" + mouseNum + "_calc").text("NA");
                $(".VO_date" + mouseNum + "_calc").text("NA");
            } else {
                $(".VO_state" + dataSearch).each(function () {
                    // console.log("within .VO_state function");
                    var $this = $(this);
                    
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
    
                        $this.css("background-color", "yellow").closest(".row").css("background-color", "yellow"); 
                    } else {
                        $this.css("background-color", "").closest(".row").css("background-color", ""); 
                    }
    
                    if(hasReachedVO){
                        // console.log(mouseNum + "has reached VO");
                        $(".VO_status" + dataSearch).removeClass("notReached").addClass("reached").text("has");
                        $(".VO_PND" + mouseNum + "_calc").text(pndAtVO);
                        $(".VO_date" + mouseNum + "_calc").text(dateAtVO);
                        my_widget_script.watchVO_mass(mouseNum, true);
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
            my_widget_script.watchFor1E();
            my_widget_script.adjustifOther();
        } else {
            $(".ifVO.msg").hide();
        }

        my_widget_script.resize();
    },

    watchVO_mass: function (mouseNum, knownStatus) {
        var hasReachedVO = false;
        var dataSearch = my_widget_script.dataSearch("num", mouseNum);
        
        if(knownStatus === true) {
            hasReachedVO = true;
        } else {
            $(".VO_state" + dataSearch).each(function () {
                $this = $(this);
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
            var dataSearch = my_widget_script.dataSearch("num", mouseNum);
            // console.log("Watching " + mouseNum + " for 1E");

            $(".firstE_state" + dataSearch).each(function () {
                var $this = $(this);
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
    
                    $this.css("background-color", "yellow").closest(".row").css("background-color", "yellow").find(".firstE_mass").css("background-color", "yellow"); 
                } else {
                    $this.css("background-color", "").closest(".row").css("background-color", "").find(".firstE_mass").css("background-color", ""); 
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
        my_widget_script.resize();
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

    createMaturationRow_VO: function (dateInputVal, mouseNum) {
        var $div, selectBaseName, textareaBaseName, rowCount, selectName, textareaName, pndValue;
        var dataSearch = my_widget_script.dataSearch("num", mouseNum);
        $div = $(".VO_div" + dataSearch);
        selectBaseName = "vocheck" + mouseNum + "_";
        textareaBaseName = "vocheck_other" + mouseNum + "_";

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
                        "class": "VO_state fullWidth VO",
                        "data-num": mouseNum
                    }).append(
                        '<option value="Closed">Closed</option>',
                        '<option value="|">Line |</option>',
                        '<option value="T">&#8869;</option>',
                        '<option value="Almost">Almost</option>',
                        '<option value="VO">Open</option>',
                        '<option value="Other">Other</option>'
                    ).on("change", function () {
                        my_widget_script.watchForVO();
                        my_widget_script.showOther($(this));
                    })
                ).append(
                    $("<text" + "area></text" + "area>", {
                        name: textareaName,
                        id: textareaName,
                        rows: 1,
                        "class": "VO fullWidth ifOther autoAdjust",
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

    createMaturationRow_1E: function (dateInputVal, mouseNum) {
        var $div, selectBaseName, textareaBaseName, massBaseName, rowCount, selectName, textareaName, massName, pndValue;
        var dataSearch = my_widget_script.dataSearch("num", mouseNum);
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
                        "class": "firstE_state fullWidth firstE",
                        "data-num": mouseNum
                    }).append(
                        '<option value="">[Select]</option>',
                        '<option value="D">Diestrus</option>',
                        '<option value="P">Proestrus</option>',
                        '<option value="E">Estrus</option>',
                        '<option value="Other">Other</option>'
                    ).on("change", function () {
                        my_widget_script.watchFor1E();
                        my_widget_script.showOther($(this));
                    })
                ).append(
                    $("<text" + "area></text" + "area>", {
                        name: textareaName,
                        id: textareaName,
                        rows: 1,
                        "class": "firstE fullWidth ifOther autoAdjust",
                        "data-num": mouseNum
                    }).on('input', function () {
                        this.style.height = 'auto';
                        this.style.height = (this.scrollHeight) + 'px';
                        my_widget_script.resize();
                    })
                )
            ).append(
                $("<div/>", {
                    "class": "col"
                }).append(
                    $("<input/>", {
                        name: massName,
                        id: massName,
                        type: "number",
                        "class": "firstE fullWidth firstE_mass",
                        "data-num": mouseNum
                    }).on("input", function (){
                        my_widget_script.watchFor1E();
                    })
                )
            ).append(
                $("<div/>", {
                    "class": "col"
                }).append(
                    $("<input/>", {
                        name: slideLocName,
                        id: slideLocName,
                        "class": "firstE fullWidth sliceLoc",
                        "data-num": mouseNum
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
        if(whichPheno === "VO"){
            var $div = $(".VO_div" + dataSearch);
        } else if(whichPheno === "firstE"){
            var $div = $(".firstE_div" + dataSearch);
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
        my_widget_script.makeVOStatusMsg(numMice);
        my_widget_script.make1EStatusMsg(numMice);
        my_widget_script.makeDemoEntries(numMice);
        my_widget_script.makeMassRows(numMice);
    },

    makeVOStatusMsg: function (numMice) {
        var $VOmsgDiv = $("#VOmsgDiv");
        $VOmsgDiv.html(""); //clear
        for(i = 0; i < numMice; i ++ ) {
            var mouseNum = i + 1;
            $VOmsgDiv.append(
                $("<div/>", {
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
                $("<div/>", {
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
                                $("<select/>", {
                                    name: "eartag" + mouseNum,
                                    id: "earTag" + mouseNum,
                                    "class": "simpleCalc"
                                }).append(
                                    "<option value=''>[Select]</option>"+
                                    "<option value='04'>04</option>"+
                                    "<option value='06'>06</option>"+
                                    "<option value='40'>40</option>"+
                                    "<option value='60'>60</option>"+
                                    "<option value='44'>44</option>"+
                                    "<option value='66'>66</option>"+
                                    "<option value='46'>46</option>"+
                                    "<option value='64'>64</option>"
                                )
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