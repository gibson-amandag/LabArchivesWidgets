my_widget_script =
{
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
        

        my_widget_script.resize();
    },
    
    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var dynamicContent = {};
        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

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

    makeInput: function(inputType, className, itemNum, optionsObj){
        var lowerCaseName = className.toLowerCase();
        if(inputType === "select"){
            $input = $("<select></select>", {
                "name": lowerCaseName+itemNum,
                "id": className+itemNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-item": itemNum
            })
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
            $input = $("<tex" + "tarea></tex" +"tarea>", {
                "name": lowerCaseName+itemNum,
                "id": className+itemNum,
                "class": className + " fullWidth watch autoAdjust",
                "data-watch": className,
                "data-item": itemNum,
            }).on("input", (e)=>{
                this.updateTextarea(e.currentTarget);
            })
        } else {
            var $input = $("<input></input>", {
                type: inputType,
                "name": lowerCaseName+itemNum,
                "id": className+itemNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-item": itemNum
            })
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

    makeRowFromObj: function(obj, itemNum){
        var $row = this.makeRow(
            obj.label,
            this.makeInput(
                obj.type,
                obj.className,
                itemNum,
                obj.optionsObj
            ),
            obj.addRowClass
        );
        return($row);
    },

};