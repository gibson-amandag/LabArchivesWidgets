my_widget_script =
{
    slideDivNums: [],
    slideNums: [],

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
        
        //resize the content box when the window size changes
        window.onresize = this.resize;

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);
        
        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));
        
        this.fillRowsColsOrientation(parsedJson);
        
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
            slideDivNums: dynamicContent.slideDivNums,
            slideNums: dynamicContent.slideNums,
            slideInfo: dynamicContent.slideInfo
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
            slideDivNums: [1, 2],
            slideNums: [1],
            slideInfo: {
                1: {
                    cols: 2,
                    rows: 2, 
                    orientation: "row",
                    cellInfo: {
                        1: {
                            text: "Cell 1",
                            filled: true
                        },
                        2: {
                            text: "Cell 2",
                            filled: true
                        },
                        3: {
                            text: "Cell 3", 
                            filled: false
                        },
                        4: {
                            text: "Cell 4",
                            filled: false
                        }
                    }
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
        if(parsedJson.slideDivNums){
            var numDivs = parsedJson.slideDivNums.length;
            my_widget_script.makeSlideDiv(numDivs);

            if(parsedJson.slideNums){
                // For each slide
                for(var i = 0; i < parsedJson.slideNums.length; i++){
                    var slide = parsedJson.slideNums[i];
                    var slideInfo = parsedJson.slideInfo[slide];
                    var cols = slideInfo.cols;
                    var rows = slideInfo.rows;
                    var orientation = slideInfo.orientation;
                    // Make the slide with the slide #, # of rows, # of cols, and orientation
                    my_widget_script.slideNums.push(slide);
                    my_widget_script.buildForSlideDiv(slide, rows, cols, orientation);
                    var slideSearch = my_widget_script.slideSearch(slide);
                    // Called after parent init function, so this replaces whatever was in the form with the actual values used to create the slide
                    $(".numRows"+slideSearch).val(rows);
                    $(".numCols"+slideSearch).val(cols);
                    $(".orientation"+slideSearch).val(orientation);

                    var numCells = cols * rows;
                    var $div = $(".slideDiv"+my_widget_script.slideSearch(slide));
                    // Fill each cell with the text and mark if filled
                    for (var j = 0; j < numCells; j++){
                        var cell = j + 1;
                        var cellInfo = slideInfo.cellInfo[cell];
                        var text = cellInfo.text;
                        var filled = cellInfo.filled;
                        var cellSearch = my_widget_script.cellSearch(cell);
                        var $cell = $div.find(cellSearch);
                        $cell.text(text);
                        if(filled){
                            $cell.addClass("filled");
                        }
                    }
                }
            }
        }
        // for (var i = 0; i < parsedJson.addedRows; i++) {
        // };
    },

    fillRowsColsOrientation: function (parsedJson) {
        if(parsedJson.slideNums){
            // For each slide
            for(var i = 0; i < parsedJson.slideNums.length; i++){
                var slide = parsedJson.slideNums[i];
                var slideInfo = parsedJson.slideInfo[slide];
                var cols = slideInfo.cols;
                var rows = slideInfo.rows;
                var orientation = slideInfo.orientation;
                var slideSearch = my_widget_script.slideSearch(slide);
                // Called after parent init function, so this replaces whatever was in the form with the actual values used to create the slide
                $(".numRows"+slideSearch).val(rows);
                $(".numCols"+slideSearch).val(cols);
                $(".orientation"+slideSearch).val(orientation);
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
            $(".slideDiv").show();
        }
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

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
        });

        $(".makeSlideDiv").on("click", function () {
            var maxSlide = Math.max.apply(Math,my_widget_script.slideDivNums);
            if( maxSlide == -Infinity){
                maxSlide = 0;
            }
            var slide = maxSlide + 1;
            console.log(maxSlide);
            // var slide = $(".allSlides").find(".slideDiv").first().data("slide");
            // if(!slide){
            //     slide = 1;
            // } else {
            //     slide++;
            // }
            my_widget_script.makeSlideDiv(slide);
        });

        $(".makeSlide").on("click", function () {
            var slide = $(this).data("slide");
            my_widget_script.makeSlide(slide);
        });

        $("#selectSlide").on("input", function () {
            var selectedSlide = $(this).val();
            var slideSearch = my_widget_script.slideSearch(selectedSlide);
            $(".slideDiv"+slideSearch).show();
            $(".slideDiv").not(slideSearch).hide();
            my_widget_script.resize();
        })

        $("#fixVal").on("input", function () {
            // Store the value from the input
            var fixedText = $(this).val();
            // Replace anything with the "fixing" class with this value
            $(".fixing").text(fixedText);
        }).on("focusout", function () { // When this input box loses focus
            // Remove the "fixing" class from all elements
            $(".fixing").removeClass("fixing");
            // Hide the forFixing div
            $(".forFixing").hide();
            my_widget_script.resize();
        });

        $("#idEntry").each(function () {
            var fullList = $(this).val();
            var splitList = fullList.split(/[\r\n]+/);
            // console.log(splitList);
            var $select = $("#idSelect");
            $select.html("");
            for (var i = 0; i < splitList.length; i++ ){
                mouseID = splitList[i];
                $select.append(
                    $("<option/>", {
                        value: i,
                        "data-mouse": i,
                    }).append(mouseID)
                );
                // console.log($select.find("option").last().text());
            }
        }).on("change", function () {
            var fullList = $(this).val();
            var splitList = fullList.split(/[\r\n]+/);
            // console.log(splitList);
            var $select = $("#idSelect");
            $select.html("");
            for (var i = 0; i < splitList.length; i++ ){
                mouseID = splitList[i];
                $select.append(
                    $("<option/>", {
                        value: i,
                        "data-mouse": i,
                    }).append(mouseID)
                );
                // console.log($select.find("option").last().text());
            }
            my_widget_script.resize();
        });

        $("#fillIDs").on("click", function () {
            var output = my_widget_script.getSelectedIDs();
            var slide = $("#fillSlide").val();
            var cell = $("#fillCell").val();
            var proceed = true;
            if(slide){
                slide = parseInt(slide);
            } else {
                alert("Enter slide number");
                proceed = false;
            } 
            if(cell){
                cell = parseInt(cell);
            } else {
                alert("Enter cell number");
                proceed = false;
            }
            if(proceed){
                my_widget_script.printIDsOnSlide(output.selectedIDs, slide, cell);
            }
            // console.log(output);
        })

        // Formatting gets weird if this is done with css
        $(".forFixing").hide(); 

        my_widget_script.resize();
    },

    getSelectedIDs: function () {
        var selectedVals = $("#idSelect").val();
        var selectedIDs = [];
        if(selectedVals){
            for(var i = 0; i < selectedVals.length; i++ ){
                var mouseSearch = my_widget_script.mouseSearch(selectedVals[i]);
                var thisID = $("#idSelect").find(mouseSearch).text();
                selectedIDs[i] = thisID;
            }
        }
        // console.log(selectedIDs);
        var output = {
            selectedVals: selectedVals,
            selectedIDs: selectedIDs
        }
        return output
    },

    printIDsOnSlide: function (IDs, startSlide, startCell) {
        var slide = startSlide;
        
        // Will check to see if div for slide exists, if not, will make one
        my_widget_script.makeSlideDiv(slide);
        var $div = $(".slideDiv"+my_widget_script.slideSearch(slide));
        
        // If there's not a "forSlide" div, then make one
        if (!$div.find(".forSlide").html()){
            my_widget_script.makeSlide(slide);
        }
        
        // Get the number of cells on the slide
        var numCells = $div.find(".slideCell").length;
        var cell = startCell;
        // console.log(numCells, cell);

        if(IDs){
            var checkBeforeReplacing = true;
            var proceed = true;
            for(var i = 0; i < IDs.length; i++ ){
                // If the cell number is larger than the number of cells on this slide
                if(cell > numCells){
                    // Move to the next slide
                    slide++;
                    // Check if div exists
                    my_widget_script.makeSlideDiv(slide);
                    $div = $(".slideDiv"+my_widget_script.slideSearch(slide));
                    
                    // If slide doesn't exist, make it
                    if (!$div.find(".forSlide").html()){
                        my_widget_script.makeSlide(slide);
                    }

                    // Get the new number of cells
                    numCells = $div.find(".slideCell").length;

                    // Start back at cell 1
                    cell = 1;
                }
                var id = IDs[i];
                var cellSearch = my_widget_script.cellSearch(cell);
                var $cell = $div.find(cellSearch);
                // Check once if replacing a previously filled cell
                if($cell.hasClass("filled") && checkBeforeReplacing){
                    proceed = confirm("This will replace a previously filled cell. Are you sure you wish to continue?");
                    checkBeforeReplacing = false;
                }
                if(proceed){
                    $cell.text(id).addClass("filled");
                    cell++
                } else {
                    return;
                }
            }
            if(cell > numCells){
                cell = 1;
                slide++;
            }
            $("#fillSlide").val(slide);
            $("#fillCell").val(cell);
            my_widget_script.resize();
        }
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
        var slideInfo = {};
        if(my_widget_script.slideNums){
            for(var i = 0; i < my_widget_script.slideNums.length; i++){
                var slide = my_widget_script.slideNums[i];
                var slideSearch = my_widget_script.slideSearch(slide);
                $div = $(".forSlide"+slideSearch);
                var numCols = $div.data("numcols");
                var numRows = $div.data("numrows");
                var orientation = $div.data("orientation");

                var numMice = numCols * numRows;
                var $div = $(".slideDiv"+my_widget_script.slideSearch(slide));
                
                var cellInfo = {};
                for (var j = 0; j < numMice; j++){
                    var cell = j + 1;
                    var cellSearch = my_widget_script.cellSearch(cell);
                    var $cell = $div.find(cellSearch);
                    var filled = $cell.hasClass("filled");
                    var text = $cell.text();
                    cellInfo[cell] = {
                        text: text,
                        filled: filled
                    };
                }
                slideInfo[slide] = {
                    cellInfo: cellInfo,
                    cols: numCols,
                    rows: numRows,
                    orientation: orientation
                }
            }
            // console.log(slideInfo);

        }

        var dynamicContent = {
            slideDivNums: my_widget_script.slideDivNums,
            slideNums: my_widget_script.slideNums,
            slideInfo: slideInfo
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

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch;
    },

    slideSearch: function (slide){
        var slideSearch = my_widget_script.dataSearch("slide", slide);
        return slideSearch;
    },
    
    colSearch: function (col) {
        var colSearch = my_widget_script.dataSearch("col", col);
        return colSearch;
    },
    
    rowSearch: function (row) {
        var rowSearch = my_widget_script.dataSearch("row", row);
        return rowSearch;
    },

    mouseSearch: function (mouse){
        var mouseSearch = my_widget_script.dataSearch("mouse", mouse);
        return mouseSearch
    },

    cellSearch: function (cell){
        var cellSearch = my_widget_script.dataSearch("cell", cell);
        return cellSearch
    },

    makeSlide: function (slide) {
        var slideSearch = my_widget_script.slideSearch(slide);
        var cols = $(".numCols"+slideSearch).val();
        var rows = $(".numRows"+slideSearch).val();
        var proceed = true;

        if(cols && rows){
            cols = parseInt(cols);
            rows = parseInt(rows);
            var orientation = $(".orientation"+slideSearch).val();
        } else {
            alert("Select both number of columns and rows");
            proceed = false;
        }

        if(proceed && my_widget_script.checkInArray(slide, my_widget_script.slideNums)){
            proceed = confirm("Are you sure that you wish to replace the existing slide?");
        } else {
            my_widget_script.slideNums[my_widget_script.slideNums.length] = slide;
        }

        // console.log(my_widget_script.slideNums);

        if(proceed){
            my_widget_script.buildForSlideDiv(slide, rows, cols, orientation);
        }
    },

    buildForSlideDiv: function (slide, rows, cols, orientation){
        var $div = $(".slideDiv"+my_widget_script.slideSearch(slide));
        $div.find(".forSlide").remove();
        $div.append(
            $("<div/>", {
                "class": "forSlide container mt-2",
                "data-numcols": cols,
                "data-numrows": rows,
                "data-orientation": orientation,
                "data-slide": slide
            })
        );
        var mouseNum = 1;
        for (var i = 0; i < rows; i++ ){
            var row = i + 1;
            if(orientation == "col"){
                var mouseNum = row;
            }
            $div.find(".forSlide").append(
                $("<div/>", {
                    "class": "row",
                    "data-row": row
                })
            );
            var rowSearch = my_widget_script.rowSearch(row);
            var $rowRow = $div.find(".row"+rowSearch);
            for(var j = 0; j < cols; j++){
                var col = j + 1;
                $rowRow.append(
                    $("<div/>", {
                        "class": "col slideCell",
                        "data-col": col,
                        "data-cell": mouseNum
                    }).on("dblclick", function () {
                        // Allows for correcting value if double-clicked
                        var text = $(this).text();
                        $(this).addClass("fixing").addClass("filled");
                        $(".forFixing").show();
                        $("#fixVal").val(text).select();
                        my_widget_script.resize();
                    }).append(mouseNum)
                );
                if(orientation == "col"){
                    mouseNum = mouseNum + rows;
                } else {
                    mouseNum++
                }
            }
        }
        my_widget_script.resize();
    },

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
    },

    makeSlideDiv: function (lastSlide) {
        var $div = $(".allSlides");
        var myLeftCol = "col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right";
        
        // This makes it so that each slide number div gets made
        for(var i = 0; i < lastSlide; i++){
            var slide = i + 1;
            // If slide number isn't in array
            if(!my_widget_script.checkInArray(slide, my_widget_script.slideDivNums)){
                my_widget_script.slideDivNums[my_widget_script.slideDivNums.length] = slide;
                // console.log(my_widget_script.slideDivNums);
                var lastSlideSearch = my_widget_script.slideSearch(slide - 1);
                var lastRowNum = $(".numRows"+lastSlideSearch).val();
                var lastColNum = $(".numCols"+lastSlideSearch).val();
                var lastOrientation = $(".orientation"+lastSlideSearch).val();
                if(lastRowNum){
                    lastRowNum = parseInt(lastRowNum);
                } else {
                    lastRowNum = 4;
                }
                if(lastColNum){
                    lastColNum = parseInt(lastColNum);
                } else {
                    lastColNum = 7;
                }
                if(!lastOrientation){
                    lastOrientation = "col";
                }

                $("#selectSlide").append(
                    $("<option/>", {
                        value: slide,
                        selected: true
                    }).append(
                        "Slide " + slide
                    )
                );

                $(".selectDiv").after(
                    $("<div/>", {
                        "class": "container slideDiv mt-2",
                        "data-slide": slide
                    }).append(
                        $("<div/>", {
                            "class": "row"
                        }).append(
                            "<h3 class='col'>Slide " + slide + "</h3>"
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2"
                        }).append(
                            $("<div/>", {
                                "class": myLeftCol
                            }).append("Date slide started:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "date",
                                    name: "startdate"+slide,
                                    id: "startDate"+slide,
                                    "class": "startDate",
                                    "data-slide": slide
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2"
                        }).append(
                            $("<div/>", {
                                "class": myLeftCol
                            }).append("Date slide finished:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "date",
                                    name: "enddate"+slide,
                                    id: "endDate"+slide,
                                    "class": "endDate",
                                    "data-slide": slide
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2 hideView"
                        }).append(
                            $("<div/>", {
                                "class": myLeftCol
                            }).append("Number of Rows:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "number",
                                    name: "numrows"+slide,
                                    id: "numRows"+slide,
                                    "class": "numRows",
                                    "data-slide": slide,
                                    "step": 1,
                                    value: lastRowNum
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2 hideView"
                        }).append(
                            $("<div/>", {
                                "class": myLeftCol
                            }).append("Number of Columns:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "number",
                                    name: "numcols"+slide,
                                    id: "numColss"+slide,
                                    "class": "numCols",
                                    "data-slide": slide,
                                    "step": 1,
                                    value: lastColNum
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2 hideView"
                        }).append(
                            $("<div/>", {
                                "class": myLeftCol
                            }).append("Select Orientation:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<select/>", {
                                    name: "orientation"+slide,
                                    id: "orientation"+slide,
                                    "class": "orientation",
                                    "data-slide": slide
                                }).append(
                                    $("<option/>", {
                                        value: "col"
                                    }).append("By column")
                                ).append(
                                    $("<option/>", {
                                        value: "row"
                                    }).append("By row")
                                )
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2 hideView"
                        }).append(
                            $("<div/>", {
                                "class": myLeftCol
                            }).append("Create new slide template:")
                        ).append(
                            $("<div/>", {
                                "class": "col"
                            }).append(
                                $("<input/>", {
                                    type: "button",
                                    name: "makeslide"+slide,
                                    id: "makeSlide"+slide,
                                    "class": "makeSlide",
                                    "data-slide": slide,
                                    value: "Make slide template"
                                }).on("click", function () {
                                    var slideNum = $(this).data("slide");
                                    my_widget_script.makeSlide(slideNum);
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2 hideView"
                        }).append(
                            $("<div/>", {
                                "class": "col"
                            }).append("Double click on cell to edit value")
                        )
                    )
                );
                $div.find(".orientation"+my_widget_script.slideSearch(slide)).val(lastOrientation);
                var slideSearch = my_widget_script.slideSearch(slide);
                $(".slideDiv"+slideSearch).show();
                $(".slideDiv").not(slideSearch).hide();
                my_widget_script.resize();
            }
        }
    }
};