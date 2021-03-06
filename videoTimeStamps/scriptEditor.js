my_widget_script =
{
    
    init: function (mode, json_data) {
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

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

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
            fileName: dynamicContent.fileName,
            exitStamps: dynamicContent.exitStamps,
            entryStamps: dynamicContent.entryStamps
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

        var entryStamps = [0, 1, 2, 3];
        var exitStamps = [0.75, 1.5, 2.6];

        //If no additional dynamic content 
        var output = {
            fileName: "test", 
            widgetData: testData,
            exitStamps: exitStamps,
            entryStamps: entryStamps
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

    /**
     * TO DO: edit this function to reinitialize any dynamic content that is not explicity
     * defined within the HTML code. 
     * 
     * This function requires the parsedJson object.
     */
    initDynamicContent: function (parsedJson) {
        $(".filePath").text(parsedJson.fileName);
        if(parsedJson.exitStamps){
            for (var i = 0; i < parsedJson.exitStamps.length; i++) {
                $(".leftStamps").append(
                    $("<div/>", {
                        "class": "exit stamp"
                    }).append(
                        parsedJson.exitStamps[i]
                    )
                );
            }
        }
        
        if(parsedJson.entryStamps){
            for (var i = 0; i < parsedJson.entryStamps.length; i++) {
                $(".returnStamps").append(
                    $("<div/>", {
                        "class": "entry stamp"
                    }).append(
                        parsedJson.entryStamps[i]
                    )
                );
            }
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
            $(".hideView").hide();
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        $("#myfile").on("input", function () {
            var file = document.getElementById('myfile').files[0];
            console.log(file);
            $(".filePath").text(file.name);
            var fileURL = URL.createObjectURL(file);
            $("#videoPlayer").prop("src", fileURL);

            var vid = document.getElementById("videoPlayer");
            vid.playbackRate = $("#changeSpeed").val();

            $("#getDur").removeAttr("disabled");
            $("#addStampButton").removeAttr("disabled");
            $("#removeStampButton").removeAttr("disabled");
        });

        $("#getDur").on("input", function () {
            my_widget_script.getDuration();
        })

        $("#changeSpeed").on("input", function () {
            var vid = document.getElementById("videoPlayer");
            vid.playbackRate = $(this).val();
        });

        $("#startState").on("input", function () {
            var proceed = confirm("Changing this will remove all stamps. Do you wish to proceed?");
            if(proceed){
                $(".stamp").remove();

                var startState = $(this).val();
                if(startState == "off") {
                    $("#addStampButton").val("Dam Enters Nest").data("state", "off");
                    $(".leftStamps").append(
                        $("<div/>", {
                            "class": "start stamp"
                        }).append(
                            "0"
                        )
                    );
                } else if(startState == "on"){
                    $("#addStampButton").val("Dam Exists Nest").data("state", "on");
                    $(".returnStamps").append(
                        $("<div/>", {
                            "class": "start stamp"
                        }).append(
                            "0"
                        )
                    );
                } else {
                    $("#addStampButton").val("[Enter Start State]").data("state", "");
                }

                my_widget_script.calcDurations();
                my_widget_script.resize();
            }
        }).each(function () {
            var startState = $(this).val();
            if(startState == "off") {
                $("#addStampButton").val("Dam Enters Nest").data("state", "off");
                $(".leftStamps").append(
                    $("<div/>", {
                        "class": "start stamp"
                    }).append(
                        "0"
                    )
                );
            } else if(startState == "on"){
                $("#addStampButton").val("Dam Exists Nest").data("state", "on");
                $(".returnStamps").append(
                    $("<div/>", {
                        "class": "start stamp"
                    }).append(
                        "0"
                    )
                );
            } else {
                $("#addStampButton").val("[Enter Start State]").data("state", "");
            }
        });

        $("#addStampButton").on("click", function () {
            var currentState = $(this).data("state");
            my_widget_script.addStampFuncs(currentState);
        });

        $("#removeStampButton").on("click", function () {
            var currentState = $("#addStampButton").data("state");
            my_widget_script.removeStampFuncs(currentState);
        });

        $("#clearStamps").on("click", function () {
            my_widget_script.clearAllStamps();
        });

        //when the calculate button is clicked, run the calcValues function
        $('#calculate').on("click", function () {
            my_widget_script.calcTableFuncs();
        });

        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $('#toCSV').on("click", function () {
            var fileName = "damVideoMonitor";
            var tableID = "outTable";
            var $errorMsg = $("#errorMsg"); 
            
            my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
        });

        //When the copy button is clicked, run the copyTable function
        $("#copyDataButton").on("click", function () {
            var $copyHead = $("#copyHead");
            var $tableToCopy = $("#outTable");
            var $tableDiv = $(".outTableDiv");
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
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
    },

    addStampFuncs: function (currentState){
        if($("#videoPlayer").prop("src")){
            if (currentState == "on"){
                var $stampsDiv = $(".leftStamps");
                var className = "exit"
                var addText = my_widget_script.getTimeStamp();
                var buttonText = "Dam Enters Nest";
                var buttonState = "off";
                var $counter = $("#numExits");
            } else if(currentState == "off"){
                var $stampsDiv = $(".returnStamps");
                var className = "entry"
                var addText = my_widget_script.getTimeStamp();
                var buttonText = "Dam Exists Nest";
                var buttonState = "on";
                var $counter = $("#numEntries");
            }
            
            if(parseFloat(addText) < parseFloat($("#videoPlayer").prop("duration"))){
                $stampsDiv.append(
                    $("<div/>", {
                        "class": className + " stamp"
                    }).append(
                        addText
                    )
                );
                my_widget_script.addOneToCounter($counter);
                my_widget_script.calcDurations();
                $("#addStampButton").val(buttonText).data("state", buttonState);
            }
            
            my_widget_script.resize();
        }
    },

    removeStampFuncs: function (currentState) {
        if($("#videoPlayer").prop("src")){
            if (currentState == "off"){
                var $stampsDiv = $(".leftStamps");
                var className = "exit"
                $("#addStampButton").val("Dam Exists Nest").data("state", "on");
                var $counter = $("#numExits");
            } else if(currentState == "on"){
                var $stampsDiv = $(".returnStamps");
                var className = "entry"
                $("#addStampButton").val("Dam Enters Nest").data("state", "off");
                var $counter = $("#numEntries");
            }

            $stampsDiv.find("." + className).last().remove();

            my_widget_script.removeOneFromCounter($counter);
            my_widget_script.calcDurations();
            my_widget_script.resize();
        }
    },

    clearAllStamps: function () {
        var proceed = confirm("Are you sure that you want to remove all time stamps?");
        if(proceed){
            $(".stamp:not(.start)").remove();
            $("#numEntries").val("");
            $("#numExits").val("");
            my_widget_script.calcDurations();
            my_widget_script.resize();
        }
    },

    getDuration: function () {
        if($("#videoPlayer").prop("src")){
            var duration = $("#videoPlayer").prop("duration");
            $("#videoDur").val(duration);
        }
    },

    getTimeStamp: function () {
        var timeStamp = "";
        if($("#videoPlayer").prop("src")){
            var timeStamp = $("#videoPlayer").prop("currentTime");
        }
        return (timeStamp)
    },

    getExistingText: function (txtarea) {
        var existingText = txtarea.value;
        if (existingText){
            existingText = existingText + "\n";
        }
        return (existingText)
    },

    addOneToCounter: function ($counter) {
        var val = $counter.val();
        if (val){
            var count = parseInt(val);
        } else {
            var count = 0;
        }

        count = count + 1;
        $counter.val(count);
    },

    removeOneFromCounter: function ($counter) {
        var val = $counter.val();
        if(val > 0) {
            var count = parseInt(val);
            count = count - 1;
        } else {
            var count = 0;
        }
        $counter.val(count);
    },

    calcDurations: function () {
        var startState = $("#startState").val();
        var numExits = $("#numExits").val();
        if(numExits){
            numExits = parseInt(numExits);
        }else {
            numExits = 0;
        }
        var numEntries = $("#numEntries").val();
        if(numEntries){
            numEntries = parseInt(numEntries);
        }else {
            numEntries = 0;
        }

        var exitStamps = [];

        $(".leftStamps").find(".stamp").each(function() {
            exitStamps[exitStamps.length] = parseFloat($(this).text()); 
        });

        var entryStamps = [];
        $(".returnStamps").find(".stamp").each(function() {
            entryStamps[entryStamps.length] = parseFloat($(this).text()); 
        });

        var offDurs = [];
        var onDurs = [];
        var duration = $("#videoDur").val();
        var cutLast = "";
        if(!duration) {
            if($("#videoPlayer").prop("src")){
                my_widget_script.getDuration();
                duration = $("#videoDur").val();
            }
        }
        if(startState == "off"){
            numExits = numExits + 1;
            if (numExits > numEntries){
                entryStamps[entryStamps.length] = parseFloat(duration);
                cutLast = "on"
            } else {
                exitStamps[exitStamps.length] = parseFloat(duration);
            }

            for (i = 0; i < numExits; i ++ ) {
                offDurs[i] = entryStamps[i] - exitStamps[i];
                onDurs[i] = exitStamps[i + 1] - entryStamps[i]
            }
        } else if(startState == "on"){
            numEntries = numEntries + 1;
            if (numEntries > numExits){
                exitStamps[exitStamps.length] = parseFloat(duration);
                cutLast = "off"
            } else {
                entryStamps[entryStamps.length] = parseFloat(duration);
            }

            for (i = 0; i < numEntries; i ++ ) {
                onDurs[i] = exitStamps[i] - entryStamps[i];
                offDurs[i] = entryStamps[i + 1] - exitStamps[i]
            }
        }

        if(cutLast == "on"){
            onDurs.pop();
        } else if(cutLast == "off"){
            offDurs.pop();
        }

        var $div = $(".offDurationsDiv");
        $div.find(".duration").remove();
        $("#timeOffNest").val(0);

        for (i = 0; i < offDurs.length; i ++ ){
            $div.append(
                $("<div/>", {
                    "class": "duration off"
                }).append(
                    offDurs[i].toFixed(2)
                )
            );

            var currentDur = parseFloat($("#timeOffNest").val());
            $("#timeOffNest").val((currentDur + offDurs[i]).toFixed(2))
        }

        $div = $(".onDurationsDiv");
        $div.find(".duration").remove();
        $("#timeOnNest").val(0);

        for (i = 0; i < onDurs.length; i ++ ){
            $div.append(
                $("<div/>", {
                    "class": "duration on"
                }).append(
                    onDurs[i].toFixed(2)
                )
            );

            var currentDur = parseFloat($("#timeOnNest").val());
            $("#timeOnNest").val((currentDur + onDurs[i]).toFixed(2));
        }

        my_widget_script.calcValues();
        // console.log("exitStamps", exitStamps, "entryStamps", entryStamps, "offDurs", offDurs, "onDurs", onDurs);
        
    },

    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForFormLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each(function () { //find element with class "needForFormLab"
            //alert($(this).val());
            $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            //alert($(this).val());
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });
    },

    adjustTextareaHeight: function (txtarea) {
        txtarea.style.height = "auto";
        txtarea.style.height = (txtarea.scrollHeight) + 'px';
        my_widget_script.resize();
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-4 text-left text-sm-right");

        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            my_widget_script.adjustTextareaHeight(this);
        });

        my_widget_script.calcDurations();

        my_widget_script.resize();
    },

    /**
     * TO DO: edit this function to define which <div>s or other elements
     * should be adjusted based on the current width of the window
     */
    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var file = $(".filePath").text();

        var exitStamps = [];
        $(".leftStamps").find(".stamp").each(function() {
            exitStamps[exitStamps.length] = parseFloat($(this).text()); 
        });

        var entryStamps = [];
        $(".returnStamps").find(".stamp").each(function() {
            entryStamps[entryStamps.length] = parseFloat($(this).text()); 
        });

        var dynamicContent = {
            fileName: file,
            exitStamps: exitStamps,
            entryStamps: entryStamps
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
    data_valid_form: function () {
        var valid = true; //begin with a valid value of true
        //var fail_log = ''; //begin with an empty fail log
        //var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(this).attr('id'); //replace the name variable with the id attribute of this element
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
     * This takes the value of the input for the $elToWatch and then updates the text of 
     * $elToUpdate to match whenever watchValue is called
     * @param {*} $elToWatch - jQuery object with the input element whose value will be used to update
     * @param {*} $elToUpdate - jQuery object of the element whose text will be updated based on the element to watch
     */
     watchValue: function ($elToWatch, $elToUpdate) {
        var value = $elToWatch.val();
        $elToUpdate.text(value);
    },

    /**
    * This function takes form input and adds them to the corresponding
    * divs within the output table.
    * 
    * For elements that are blank or NaN, the function provides an output of NA
    * 
    * Calls the resize function at the end
    */
    calcValues: function () {
        //TO DO add calc functions
        // Output table calculations

        $(".simpleCalc").each(function () {
            var elementID = this.id;
            var calcID = "." + elementID + "_calc";
            my_widget_script.watchValue($(this), $(calcID));
        });

        $("#outTable tr").each(function () { //for each row
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
     */
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

        $table.find("tbody").children("tr").each(function () { //add each child of the row
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

        $temp.appendTo($divForCopy).focus().select(); //add temp to tableDiv and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    },

    /**
     * Set of functions when calcValuesButton clicked
     * Run data_valid_form
     * Calculate values
     */
    calcTableFuncs: function() {
        my_widget_script.data_valid_form(); //run to give error, but allow to calc regardless
        my_widget_script.calcValues();
    },

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
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) {
            my_widget_script.calcDurations();
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    /**
     * The steps that should be taken when the copy data button is pressed
     * Checks if the $copyHead is checked, runs the calcValues function and then
     * checks if the data is valid. If it is, it shows the table, resizes, and then
     * copies the table (via a temporary textarea that is then removed). 
     * 
     * @param $copyHead - checkbox for whether or not to copy the table head as jQuery object
     * @param $tableToCopy - table to copy as jQuery object
     * @param $tableDiv - div containing table to copy
     * @param $errorMsg - error message div as jQuery object
     * @param $divForCopy - div where the output should copy to
     */
    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form();
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        my_widget_script.calcDurations();

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            my_widget_script.resize(); //resize
            my_widget_script.copyTable($tableToCopy, copyHead, $divForCopy); //copy table
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    }
};