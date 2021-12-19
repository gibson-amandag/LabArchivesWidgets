my_widget_script =
{   
    init: function(){
        // Make the output tables
        this.makeOutputTableCards();
        this.addOptionsToCustom();
    },

    initDynamicContent: function (parsedJson) {
        // for (var i = 0; i < parsedJson.addedRows; i++) {
        // };
    },

    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
        }
    },
    
    addEventListeners: function () {
        
    },

    setUpInitialState: function () {
        // #region output buttons
        $("[data-table]").not(".dontHide").hide();
        // $(".viewTableButtons").on("click", (e)=>{ // can't rely on this bubbling up if make it before the parent init, because it sets everything as readonly
        $(".showTable").on("click", (e)=>{
            if($(e.target).hasClass("showTable")){
                $("[data-table]").not(".dontHide").hide();
                var table = $(e.target).data("table");
                var tableName = $(e.target).data("tablename");
                var tableSearch = this.tableSearch(table);
                $(tableSearch).show();
                $(".card"+tableSearch).find(".card-body").removeClass("collapse");
                this.selectedTable = {id: table, name: tableName};
                $("#errorMsg").html("");
                this.resize();
            }
        });
        
        //when the toCSV button is clicked, run the exportTableToCSV function if data is valid
        $(".toCSV").on("click", (e)=>{
            var tableID = this.selectedTable.id;
            if(tableID){
                var tableName = this.selectedTable.name;
                var dateToday = luxon.DateTime.now().toISODate(); // Luxon has to be added
                var fileName = "table_" + tableName + "_" + dateToday;
                var $errorMsg = $("#errorMsg");
                // console.log("fileName", fileName, "table", tableID, "errorMsg", $errorMsg);
                this.toCSVFuncs(fileName, tableID, $errorMsg);
            } else {
                $("#errorMsg").html("Please select a table first");
                this.resize();
            }
        });

        $(".copyData").on("click", (e)=>{
            var tableID = this.selectedTable.id;
            if(tableID){
                // Get the data-table text string to add to the query to find the table
                var tableSearch = this.tableSearch(tableID);
                // Find the element that tells whether or not to copy the table
                var $copyHead = $("#copyHead");
                var $transpose = $("#transpose");
                var $tableToCopy = $("#"+tableID);
                var $tableDiv = $tableToCopy.parent();
                var $errorMsg = $("#errorMsg");
                var $divForCopy = $("#forCopy");
    
                this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose);
            } else {
                $("#errorMsg").html("Please select a table first");
                this.resize();
            }
        });
        // #endregion output buttons


        this.resize();
    },
    
    resize: function () {
        //resize the container
        this.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var dynamicContent = {};
        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

    selectedTable: {id: "", name: ""},

    // #region output tables  
    //****************
    // OUTPUT TABLES
    // ***************

    // object here with the infromation about each of the different tables
    outputTables: {
        labGoogleSheet: {
            id: "labGoogleSheet",
            label: "Lab Google Sheet",
            saveName: "fullLabSlicing",
            columns: [
                "mouseID",
                "cageNum",
                "who",
                "recordingDate",
                "dateOfBirth",
                "ageInDays",
                "sacTime",
                "daylightSavings",
                "sacHrs",
                "strain",
                "zygosity",
                "sex",
                "bodyMass",
                "reproTractMass",
                "reproTract_mg_per_g",
                "gonadStatus",
                "cycleStage",
                "stageComment",
                "surgeryDate",
                "implant",
                "implantType",
                "implantDate",
                "implantComment",
                "tubeLabel",
                "savedPit",
                "genTreatment",
                "treatment",
                "glucose",
                "nucleus",
                "orientation",
                "sliceQual",
                "sliceComment",
                "fluorQual",
                "fluorComment",
                "externalSoln",
                "externalDate",
                "internalSoln",
                "internalDate",
                "pipette",
                "pipetteLot"
            ],
            num: 1
        },
        mouseInfo: {
            id: "mouseInfo",
            label: "Mouse Information",
            saveName: "mouseInfo",
            columns: [
                "mouseID",
                "cageNum",
                "generation",
                "damID",
                "sireID",
                "genTreatment",
                "treatment",
                "dateOfBirth",
                "DOB_equals",
                "sex",
                "zygosity",
                "strain",
                "gonadStatus",
                "surgeryDate",
                "implantType",
                "implantDate"
            ],
            num: 2
        },
        slicingInfo: {
            id: "slicingInfo",
            label: "Slicing Information",
            saveName: "slicingInfo",
            columns: [
                "mouseID",
                "recordingDate",
                "ageInDays",
                "savedPit",
                "daylightSavings",
                "sacTime",
                "sacHrs",
                "who",
                "cycleStage",
                "bodyMass",
                "reproTractMass"
            ],
            num: 3
        },
        slicingTiming: {
            id: "slicingTiming",
            label: "Slicing Timing",
            saveName: "slicingTiming",
            columns: [
                "mouseID",
                "daylightSavings",
                "sacTime",
                "sacHrs"
            ],
            num: 4
        },
        KNDyPNA_extracellular: {
            id: "KNDyPNA_extracellular",
            label: "KNDy PNA Extracell",
            saveName: "KNDyPNA_extracellular",
            columns: [
                "mouseID",
                "cageNum",
                "genTreatment",
                "treatment",
                "cycleStage",
                "bodyMass",
                "uterineMass",
                "uterine_mg_per_g",
                "dateOfBirth",
                "recordingDate",
                "ageInDays",
                "savedPit",
                "daylightSavings",
                "sacTime",
                "sacHrs",
                "who",
                "zygosity"
            ],
            num: 5
        },
        jennPNA: {
            id: "jennPNA",
            label: "Jenn PNA Project",
            saveName: "JennPNA",
            columnNames: [
                "CellID",
                "mouseID",
                "Exclude reason",
                "Cage",
                "TX",
                "Group",
                "DOB",
                "Age",
                "RecordingAge",
                "RecordingDay",
                "Mass (g)",
                "Ut. mass (g)",
                "Ut. mass (mg)",
                "Cycle Stage",
                "Sac time",
                "Sac hour",
                "Pit",
                "Blood",
                "Notes"
            ],
            columns: [
                "NA",
                "mouseID",
                "NA",
                "cageNum",
                "treatment",
                "genTreatment",
                "dateOfBirth",
                "ageGroup",
                "ageInDays",
                "recordingDate",
                "bodyMass",
                "reproTractMass_g",
                "reproTractMass",
                "cycleStage",
                "sacTime",
                "sacHrs",
                "savedPit_yn",
                "savedBlood_yn",
                "NA"
            ],
            num: 6
        },
        externalAdditions: {
            id: "externalAdditions",
            label: "External Additions",
            saveName: "externalAdditions",
            columnNames: [
                "Addition Name",
                "Addition Date"
            ],
            columns: [],
            num: 7
        },
        internalAdditions: {
            id: "internalAdditions",
            label: "Internal Additions",
            saveName: "internalAdditions",
            columnNames: [
                "Addition Name",
                "Addition Date"
            ],
            columns: [],
            num: 8
        },
        custom: {
            id: "custom",
            label: "Custom",
            saveName: "custom",
            columns: [],
            num: 9
        }

    },

    // Make everything for each table
    makeOutputTableCards: function(){
        for(table in this.outputTables){
            var tableObj = this.outputTables[table];
            this.makeViewButtons(tableObj);
            this.makeOutputTableCard(tableObj);
        }
    },

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        this.resizeTextareaInEl($cardHead.next());
        // $cardHead.next().find("textarea.autoAdjust").each((i,e)=> {
        //     if(! $(e).is(":hidden")) {
        //         e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;'); //add "display:inline-block"; if not working for ifOther textboxes in cards
        //     } 
        // });
        this.resize();
    },

    makeCard: function ($div, cardHeadContent, cardBodyContent) {
        // Add extras to header, such as classes or data attributes in calling function after making the card
        $div.append(
            $("<div/>", {
                "class": "card"
            }).append(
                $("<button></button>", {
                    "type": "button",
                    "class": "card-header",
                }).on("click", (e)=> {
                    this.toggleCard($(e.currentTarget));
                }).append(cardHeadContent)
            ).append(
                $("<div/>", {
                    "class": "card-body collapse"
                }).append(
                    cardBodyContent
                )
            )
        )
        this.resize();
    },

    makeOutputTableCard: function(tableObj){
        // console.log("in makeOutputTable card, name is", tableObj.id, "object is", tableObj);

        var $div = $(".outCardContainer");
        
        // Card head
        var cardHead = tableObj.label;

        // Card body
        var $body = $("<div></div>");
        // var outputButtons = this.makeOuputButtons(tableObj); 
        var table = this.makeOutputTable(tableObj);

        // $body.append(outputButtons).append(table);
        $body.append(table);

        this.makeCard($div, cardHead, $body);

        // Add data tag to the card that was just made
        $div.find(".card").last().attr("data-table", tableObj.id)
    },

    makeViewButtons: function(tableObj){
        var numForTags = tableObj.num;
        var tableID = tableObj.id;
        var tableName = tableObj.saveName;
        var tableLabel = tableObj.label;

        var $buttonsDiv = $(".viewTableButtons");
        if(numForTags === 1){
            $buttonsDiv.html("");
        }
        $buttonsDiv.append(
            $("<div></div>", {
                "class": "col-12 col-sm-6 col-md-4, col-lg-3",
            }).append(
                $("<input></input>", {
                    "type": "button",
                    "id": "showTable" + numForTags,
                    "name": "showtable" + numForTags,
                    "class": "showTable fullWidth dontHide",
                    "data-table": tableID,
                    "data-tablename": tableName,
                    "value": tableLabel
                })
            )
        )
    },

    makeOutputTable: function(tableObj){
        var columnNames = tableObj.columns;
        if(tableObj.hasOwnProperty("columnNames")){
            columnNames = tableObj.columnNames;
        }
        var $div = this.makeCalcTable(tableObj.id, columnNames, tableObj.columns);
        return $div;
    },

    makeCalcTable: function(tableID, colNames, colCalcs){
        var $table = $("<div></div>", {"class": "container calcTableContainer"}).append(
            $("<div></div>", {"class": "row"}).append(
                $("<div></div>", {"class": "col-12 table-responsive xsTableDiv"}).append(
                    $("<table></table>", {
                        "id": tableID,
                        "class": "table outTable"
                    }).append(
                        $("<thead></thead>")
                    ).append(
                        $("<tbody></tbody>")
                    )
                )
            )
        );

        var headRow = document.createElement("tr");
        var bodyRow = document.createElement("tr");
        for(var i=0; i<colNames.length; i++){
            var colName = colNames[i];
            // Make a new cell
            var headCell = document.createElement("th");
            // // Add the label to the headCell
            headCell.append(colName); // append rather than appendChild to avoid creating as textNode
            // Add the headCell to the headRow
            headRow.appendChild(headCell);
            
            if(colCalcs.length>0){
                var colCalc = colCalcs[i];
                // Make a new cell
                var bodyCell = document.createElement("td");
                // Add the data attribute
                bodyCell.dataset.calc = colCalc;
                // Add the bodyCell to the bodyRow
                bodyRow.appendChild(bodyCell);
            }
        }

        $table.find("thead").append(headRow);
        if(colCalcs.length>0){
            $table.find("tbody").append(bodyRow);
        }

        return $table;
    },

    // #region custom  
    allOptions: [
        "mouseID",
        "cageNum",
        "generation",
        "damID",
        "sireID",
        "who",
        "recordingDate",
        "dateOfBirth",
        "ageInDays",
        "sacTime",
        "daylightSavings",
        "sacHrs",
        "strain",
        "zygosity",
        "sex",
        "bodyMass",
        "reproTractMass",
        "reproTract_mg_per_g",
        "gonadStatus",
        "cycleStage",
        "stageComment",
        "surgeryDate",
        "implant",
        "implantType",
        "implantDate",
        "implantComment",
        "tubeLabel",
        "savedPit",
        "genTreatment",
        "treatment",
        "glucose",
        "nucleus",
        "orientation",
        "sliceQual",
        "sliceComment",
        "fluorQual",
        "fluorComment",
        "externalSoln",
        "externalDate",
        "internalSoln",
        "internalDate",
        "pipette",
        "pipetteLot"
    ],

    sortableOptions: function () {
        $('.sortable[sortable="true"]').sortable({
            connectWith:".sortable",
            placeholder: "ui-state-highlight",
            update: ()=> {
                this.getSelectedOrder();
            }
        });
    },
    
    getSelectedOrder: function(){
        // Options within the selected list sent to custom columns as an array
        this.outputTables.custom.columns = $("#selectedOptions").sortable("toArray");
        this.outputTables.custom.unSelColumns = $("#unselected").sortable("toArray");
        // Update the table with this new list
        this.updateCustomTable();
    },

    addOptionsToCustom: function(){
        $cardBody = $(".card"+this.tableSearch("custom")).find(".card-body");
        $cardBody.append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-12"
                }).append(
                    $("<input></input>", {
                        "name": "resetoptions",
                        "id": "resetOptions",
                        "value": "Reset",
                        "type": "button",
                        "class": "fullWidth"
                    }).on("click", (e)=>{
                        this.resetOptionsList()
                    })
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col"
                }).append(
                    "Drag and drop variables to add to table"
                )
            )
        ).append(
            $("<div></div>", {
                "class": "row"
            }).append(
                $("<div></div>", {
                    "class": "col-6"
                }).append(
                    "<h3>Selected:</h3>"
                ).append(
                    $("<ul></ul>", {
                        "id": "selectedOptions",
                        "sortable": "true",
                        "class": "sortable"
                    }).append(
                        "&nbsp;" // lets you drag into empty space
                    )
                )
            ).append(
                $("<div></div>", {
                    "class": "col-6"
                }).append(
                    "<h3>Unselected:</h3>"
                ).append(
                    $("<ul></ul>", {
                        "id": "unselected",
                        "sortable": "true",
                        "class": "sortable"
                    }).append(
                        "&nbsp;" // lets you drag into empty space
                    )
                )
            )
        )

        this.sortableOptions(); // This has to come first to initialize
        this.resetOptionsList();
    },

    updateCustomTable: function(){
        // Get the column names 
        var columns = this.outputTables.custom.columns;
        var $customCard = $(".card"+this.tableSearch("custom"))
        $customCard.find(".calcTableContainer").remove();
        var $table = this.makeCalcTable("custom", columns, columns);
        $table.prependTo($customCard.find(".card-body"));

        $("input, select, textarea").each((i,e)=>{
            if($(e).attr("type")!= "button"){
                this.updateCalcFromEl(e);   
            }
        });
        this.calcValues();
    },

    resetOptionsList: function(unselected = this.allOptions, selected){
        // console.log("selected",selected, "unselected", unselected);
        // Reset with options all sent to unselected
        $("#selectedOptions").html("&nbsp;");
        $("#unselected").html("&nbsp;")
        for(var i=0; i<unselected.length; i++){
            var option = unselected[i]
            $("#unselected").append(
                $("<li></li>", {
                    "id": option
                }).append(
                    option
                )
            );
        }
        if(selected){
            for(var i=0; i<selected.length; i++){
            var option = selected[i]
            $("#selectedOptions").append(
                $("<li></li>", {
                    "id": option
                }).append(
                    option
                )
            );
        }
        }
        this.getSelectedOrder();
    },
    // #endregion custom  
    // #endregion output tables

};