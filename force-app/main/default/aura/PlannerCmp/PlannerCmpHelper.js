({
    MONTHS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    
    SHORTMONTHS: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    
    WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], 

    
    init: function (cmp, event, helper) {
        cmp.set("v.IsSpinner", true);
        helper.getCurrentDate(cmp, event, helper);
        helper.setTabs(cmp, event, helper);
        helper.setColors(cmp, event, helper);
        helper.setOptionsMonthOrYear(cmp, event, helper);
        
        // helper.getMultipicklistValues(cmp, event, helper)
    },
    
    getCurrentDate: function (cmp, event, helper) {
        let today = new Date();
        let d = today.getDate();
        //let w = today.getMonth();
        let m = today.getMonth();
        let y = today.getFullYear();
        let monthIndex;
        let diff = today.getDate() - today.getDay() + (today.getDay() == 0 ? -6 : 1);
        let startWeekDate = new Date(new Date(today.getTime()).setDate(diff));
        let endWeekDate = new Date(new Date(startWeekDate.getTime()).setDate(startWeekDate.getDate() + 6));
        
        let currentDate = {
            _year: y,
            countMonth: m,
            _day: d,
            weekRange: helper.SHORTMONTHS[startWeekDate.getMonth()] + ', ' + startWeekDate.getDate() + ' - ' + helper.SHORTMONTHS[endWeekDate.getMonth()] + ', ' + endWeekDate.getDate()
        };
        
        for (let i = 0; i < this.MONTHS.length; i++) {
            if (m == i) {
                monthIndex = i;
                currentDate._month = this.MONTHS[i];
            }
        }
        
        cmp.set("v.currentDate", sessionStorage.getItem("currentDate") ? JSON.parse(sessionStorage.getItem("currentDate")) : currentDate);
        this.getDays(cmp, event, helper);
        cmp.set("v.listMonthInYear", this.MONTHS);
        cmp.set("v.mainDate", cmp.get("v.currentDate")._year + " " + cmp.get("v.currentDate")._month);
        
        cmp.set("v.startDate"), new Date(cmp.get("v.currentDate")._year, monthIndex, cmp.get("v.days")[0]);
        cmp.set("v.endDate"), new Date(cmp.get("v.currentDate")._year, monthIndex, cmp.get("v.days")[cmp.get("v.days").length - 1]);
    },
    
    getDays: function (cmp, event, helper) {
        let today = new Date();
        let numberOfDaysPerMonth = new Date(cmp.get("v.currentDate")._year, cmp.get("v.currentDate").countMonth + 1, 0).getDate();
        let listDaysInMonth = [];
        let listMonth = [];
        
        for (let i = 0; i < numberOfDaysPerMonth; i++) {
            listDaysInMonth.push(i + 1);
        }
        
        let listDays = [];
        let days = [];
        let columns = [];
        
        let listWeekDays = [];
        
        let listHours = [];
        
        listDaysInMonth.forEach(function (el) {
            listDays.push({
                type: "text",
                fieldName: "",
                label: el,
                cellAttributes: { class: { fieldName: el } },
                initialWidth: 10
            });
            days.push(el);
        });
        cmp.set("v.days", days);
        
        this.SHORTMONTHS.forEach(function (el) {
            listMonth.push({
                type: "text",
                fieldName: "",
                label: el,
                cellAttributes: { class: { fieldName: el } },
                initialWidth: 130
            });
        });
        
        this.WEEKDAYS.forEach(function (el) {
            if(el != 'Sunday') {
                listWeekDays.push({
                    type: "text",
                    fieldName: "",
                    label: el,
                    cellAttributes: { class: { fieldName: el } },
                    initialWidth: 150
                });
            }
        });
        listWeekDays.push({
            type: "text",
            fieldName: "",
            label: 'Sunday',
            cellAttributes: { class: { fieldName: 'Sunday' } },
        	initialWidth: 150
        });
        cmp.set("v.months", listMonth);
        
        for(let i = 0; i <= 23; i++) {
            listHours.push({
                type: "text",
                fieldName: "",
                label: ""+i,
                cellAttributes: { class: { fieldName: ""+i } },
            });
        }
        
        let startDate = "Start Date";
        let endDate = "End Date";
        let initialWidth = 110;
        
        switch (cmp.get("v.selectedView")) {
        	case "1":
                //!Day
                columns = listHours;
                startDate += "Time";
                endDate += "Time";
                initialWidth = 170;
                break;
            case "2":
                //!WEEK
                columns = listWeekDays;
                break;
            case "4":
                //!YEAR
                columns = listMonth;
                break;
            default:
                //!MONTH
                columns = listDays;
        }
        
        columns.unshift({
            label: "",
            type: "button-icon",
            initialWidth: 50,
            name: "",
            fieldName: "iconType",
            typeAttributes: {
                name: "demo",
                class: "classDemo",
                iconName: "standard:settings",
                iconClass: "dark",
                variant: "container",
                disabled: false
            }
        });
        
        if(cmp.get('v.showImp')) {
            columns.unshift({
                type: "text",
                fieldName: "improvements",
                label: "Improvements",
                initialWidth: initialWidth
            });
        }
        
        columns.unshift({
            type: "text",
            fieldName: endDate,
            label: "End Date",
            initialWidth: initialWidth
        });
        
        columns.unshift({
            type: "text",
            fieldName: startDate,
            label: "Start Date",
            initialWidth: initialWidth
        });
        
        columns.unshift({
            type: "text",
            fieldName: "Name",
            label: "Name",
            initialWidth: 150
        });
        cmp.set("v.columns", columns);
    },
    
    updateColor: function (cmp, helper, pickList, field, color, objectApiName) {
        let action = cmp.get("c.changePlannerPickListColor");
        action.setParams({
            objectApiName: objectApiName,
            fieldApiName: field,
            pickListEntryApiName: pickList,
            hexColor: color
        });
        action.setCallback(this, function (response) {
            let state = response.getState();
            helper.drawLine(cmp, cmp.get("v.mainPickListValuesBeforeDraw"));
            
            if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    console.error("Error message: " + JSON.stringify(errors));
                } else {
                    console.error("Unknown error");
                }
            }
        });
        
        $A.enqueueAction(action);
    },
    
    getSetOfMonth: function (cmp, startDate, endDate) {
        let arr = [];
        let _year = cmp.get("v.currentDate")._year;
        
        for (let i = 0; i <= this.MONTHS.length; i++) {
            if(i >= startDate.getUTCMonth() + 1 && i <= endDate.getUTCMonth() + 1) {
                arr.push(i - 1);
            }
        }
        
        return arr;
    },
    
    setTabs: function (cmp, event, helper) {
        let action = cmp.get("c.getAllPlannerTabsFromCustomSettings");
        action.setCallback(this, function (response) {
            let state = response.getState();
            if (state == "SUCCESS") {
                let dataSet = [];
                let data = response.getReturnValue();
                if (data) {
                    for (let tab of data) {
                        dataSet.push({
                            apiName: tab.Name,
                            label: tab.peek_l_dev__Object_Name__c,
                            childApiName: tab.peek_l_dev__Child_Object_Name__c,
                            childApiNameOut: tab.peek_l_dev__ChildObjectApiNameOut__c,
                            junction: tab.peek_l_dev__Junction_Object_Name__c,
                            junctionApiName: tab.peek_l_dev__Junction_Api_Name__c,
                            improvement: tab.peek_l_dev__Improvement_Object_Name__c,
                            improvementApiName: tab.peek_l_dev__Improvement_Api_Name__c,
                            startDateApiName: tab.peek_l_dev__Start_Date_Name__c,
                            endDateApiName: tab.peek_l_dev__End_Date_Name__c,
                            pickList: tab.peek_l_dev__Selected_Pick_List__c,
                            mixedColor: tab.peek_l_dev__Crossed_Color__c
                        });
                    }
                    cmp.set("v.allTabs", dataSet);
                    helper.sessionStorageController(cmp, event, helper);
                    helper.setPickListValues(cmp, event, helper);
                    helper.setData(cmp, event, helper);
                } else {
                    cmp.set("v.showTestModal", true);
                }
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    console.error("11 Error message: " + JSON.stringify(errors));
                } else {
                    console.error("Unknown error");
                }
            }
        });
        
        $A.enqueueAction(action);
    },
    
    drawLine: function (cmp, listRecords) {
        let data = cmp.get("v.dataWeekly");
        try {
            const currentDay = new Date().getDate();
            const currentMonth =  new Date().getMonth();
            const currentHour =  new Date().getHours();
            const weekDayList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
            let days = cmp.get("v.days");
            let mainPickListValues = cmp.get("v.mainPickListValues");
            let todayDate = new Date(cmp.get("v.currentDate")._year, cmp.get("v.currentDate").countMonth, cmp.get("v.currentDate")._day);
            let pickListEntryColors = cmp.get('v.picklistEntryColor')
            if(cmp.get("v.selectedView") == "2"){
                data.forEach(el => {
                    let state = []
                    if(el._children.length > 0){
                        el._children.forEach(child => {
                            let diff = todayDate.getDate() - todayDate.getDay() + (todayDate.getDay() == 0 ? -6 : 1);
                            let startWeekDate = new Date(new Date(todayDate.getTime()).setDate(diff));
                            for(let day = 0; day <= 6; day++){
                                let addedDay = this.addDays(startWeekDate,day)
                                if(cmp.get('v.isGrayOut') == false){
                                    let index = child.dateDesciption.map(e => e.date.toString().slice(0,15)).indexOf(addedDay.toString().slice(0,15))
                                    if(index !== -1 ){
                                        child[weekDayList[day]] = pickListEntryColors[child.color]
                                        state.push(
                                            {
                                                color: child[weekDayList[day]],
                                                day: weekDayList[day],
                                                count: 1
                                            })
                                    } 
                                } else {
                                    let index = child.dateDesciption.map(e => e.date.toString().slice(0,15)).indexOf(addedDay.toString().slice(0,15))
                                    if(this.addDays(startWeekDate,day) < new Date()){
                                        child[weekDayList[day]] = 'greyOutColor'
                                    }
                                    
                                    if(index !== -1){
                                        state.push(
                                            {
                                                date: child.dateDesciption[index].date,
                                                color: child.dateDesciption[index].date > new Date() ? child[weekDayList[day]] = pickListEntryColors[child.color] : 'Inactive',/*child.color == 'First Color' ? 'color1': child.color == 'Second Color' ? 'color2' : child.color == 'Third Color' ? 'color3' : 'color4' : 'Inactive' ,*/
                                                day: weekDayList[day],
                                                count: 1
                                            })
                                    } 
                                }
                            }
                        })
                    }
                    let arr = []
                    for(let char of state){
                        if(cmp.get('v.isGrayOut') == false){
                            if(arr.findIndex(el => el.day == char.day) == -1){
                                arr.push({
                                    day: char.day,
                                    count: 1,
                                    color: char.color,
                                    date: char.date
                                })
                            } else {
                                arr[arr.findIndex(el => el.day == char.day)].count++
                                arr[arr.findIndex(el => el.day == char.day)].color = 'mixedColor'
                            }
                        } else {
                            if(arr.findIndex(el => el.day == char.day) == -1){
                                arr.push({
                                    day: char.day,
                                    count: 1,
                                    color: char.date > new Date() ? char.color : 'greyOutColor',
                                    date: char.date
                                })
                            } else {
                                if(arr[arr.findIndex(el => el.day == char.day)].color !== 'greyOutColor' && arr[arr.findIndex(el => el.day == char.day)].color !== 'Inactive'){
                                    arr[arr.findIndex(el => el.day == char.day)].count++
                                    arr[arr.findIndex(el => el.day == char.day)].color = 'mixedColor'
                                } 
                                
                            }
                            
                        }
                    }
                    if(cmp.get('v.isGrayOut')){
                        for(let i = 0; i<arr.length; i++){
                            if(arr[i].date < new Date()){
                                el[arr[i].day] = 'greyOutColor'
                            } else {
                                el[arr[i].day] = arr[i].color
                            }
                        }
                        
                    }else {
                        for(let i = 0; i<arr.length; i++){
                            el[arr[i].day] = arr[i].color
                        }
                    }
                    
                    el["Start Date"] = new Date(Math.min.apply(null, el._children.map(item => this.addDays(new Date(item["Start Date"]),1)))).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                    el["End Date"] = new Date(Math.max.apply(null, el._children.map(item => this.addDays(new Date(item["End Date"]),1)))).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                })          
                
            } else{
            listRecords.forEach((el) => {
                if (el._children.length > 0) {
                    el._children.forEach((project) => {
                        switch (cmp.get("v.selectedView")) {
                            case "1":
                                //!DAY
                                let startHour = 0;
                                let endHour = 23;
                                if(new Date(project["Start DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(project["Start DateTime"]).getDate() == cmp.get("v.currentDate")._day){
                                    startHour = new Date(project["Start DateTime"]).getHours();
                                }
                                if(new Date(project["End DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(project["End DateTime"]).getDate() == cmp.get("v.currentDate")._day) {
                                    endHour = new Date(project["End DateTime"]).getHours();
                                }
                                for(let count = startHour; count <= endHour; count++) {
                                    let currentValue = mainPickListValues.find((v) => v.apiName == project.pickListValue);
                                    let currentValueIndex = mainPickListValues.indexOf(mainPickListValues.find((v) => v.apiName == project.pickListValue));
                                    project[count] = currentValueIndex == -1 ? "colorDefault" : currentValue.color ? "color" + currentValueIndex : "colorDefault";
                                }

                                //If GreyOut checked
                                
                                if(cmp.get('v.isGrayOut')){
                                    let selectedDate = new Date(cmp.get("v.currentDate")._year, this.MONTHS.indexOf(cmp.get("v.currentDate")._month), cmp.get("v.currentDate")._day)
                                    if(cmp.get("v.currentDate")._day == new Date().getDate() && cmp.get("v.currentDate")._year == new Date().getFullYear() && this.MONTHS.indexOf(cmp.get("v.currentDate")._month) == new Date().getMonth()){
                                        
                                        for(let i = 0; i<=new Date().getHours(); i++){
                                            project[i] = 'greyOutColor'
                                        }
                                    } else if(selectedDate < new Date()){
                                        for(let i = 0; i<24; i++){
                                            project[i] = 'greyOutColor'
                                        }
                                    } else {
        
                                    }
                                }
                                
                                break;
                            case "4":
                                //!YEAR
                                let startProj = new Date(project["Start DateTime"])
                                let endProj = new Date(project["End DateTime"])
  
                                let colors = cmp.get('v.picklistEntryColor')
                                
                                if(cmp.get("v.currentDate")._year == startProj.getFullYear() && cmp.get("v.currentDate")._year == endProj.getFullYear()){
                                    for(let childMonth = startProj.getMonth(); childMonth <= endProj.getMonth(); childMonth++){
                                        project[this.SHORTMONTHS[childMonth]] = colors[project.pickListValue]
                                    }
                                } else if(startProj.getFullYear() == cmp.get("v.currentDate")._year && cmp.get("v.currentDate")._year < endProj.getFullYear()) {
                                    for(let childMonth = startProj.getMonth(); childMonth < 12; childMonth++){
                                        project[this.SHORTMONTHS[childMonth]] = colors[project.pickListValue]
                                    }
                                } else if(cmp.get("v.currentDate")._year <= endProj.getFullYear() && startProj.getFullYear() < cmp.get("v.currentDate")._year) {
                                    for(let i = 0; i<=endProj.getMonth(); i++){
                                        project[this.SHORTMONTHS[i]] = colors[project.pickListValue]
                                    }
                                } 
                                this.SHORTMONTHS.forEach((month) => {
                                        if(cmp.get("v.currentDate")._year < new Date().getFullYear()){
                                            project[month] = 'greyOutColor';
                                        }else if (cmp.get('v.isGrayOut') && cmp.get("v.currentDate")._year <= new Date().getFullYear()  && new Date().getMonth() > this.SHORTMONTHS.indexOf(month)){
                                            project[month] = 'greyOutColor';
                                        }
            
                                        if(!cmp.get('v.isGrayOut') && el[month] == 'greyOutColor'){
                                            project[month] = 'Inactive';
                                        } 
            
                                    });
                                break;
                            default:
                                //!MONTH
                                let month_dates = [];
                                for(let i = 0; i<el.drawLine.length; i++){
                                    month_dates.push(new Date(cmp.get("v.currentDate")._year,this.MONTHS.indexOf(cmp.get("v.currentDate")._month),i))
                                }
                                project.drawLine.forEach((day) => {
                                    let currentValue = mainPickListValues.find((v) => v.apiName == project.pickListValue);
                                    let currentValueIndex = mainPickListValues.indexOf(mainPickListValues.find((v) => v.apiName == project.pickListValue));
                                    project[day] = currentValueIndex == -1 ? "colorDefault" : currentValue.color ? "color" + currentValueIndex : "colorDefault";
                                });
                                days.forEach((day)=>{
                                    if(cmp.get('v.isGrayOut') && new Date()>month_dates[day]){
                                        project[day] = 'greyOutColor';
                                    } else if(!cmp.get('v.isGrayOut') && project[day] == 'greyOutColor'){
                                        project[day] = 'Inactive';
                                    }
                                });
                        }
                    });
                } else {
                    days.forEach((day) => {
                        el._children.forEach((elem) => {
                            elem[day] = "Inactive";
                        });
                    });
                }
                switch (cmp.get("v.selectedView")) {
                    case "1":
                        let startHour = 0;
                        let endHour = 23;
                        let hourlyMap = []
                        if(new Date(el["Start DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(el["Start DateTime"]).getDate() == cmp.get("v.currentDate")._day) {
                            startHour = new Date(el["Start DateTime"]).getHours();
                        }
                        if(new Date(el["End DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(el["End DateTime"]).getDate() == cmp.get("v.currentDate")._day) {
                            endHour = new Date(el["End DateTime"]).getHours();
                        }
                        if(el._children.length > 0){
                        for(let char of el._children){
                                for(let i = startHour; i<=endHour; i++){
                                    if(hourlyMap.findIndex(el => el.hour == i) == -1 && char[i] !== undefined){
                                        hourlyMap.push({
                                            hour: i,
                                            color: char[i],
                                            count: 1
                                        })
                                    } else{
                                        if(char[i]){
                                            let index = hourlyMap.findIndex(el => el.hour == i)
                                            hourlyMap[index].count++
                                            hourlyMap[index].color = 'mixedColor'
                                        }
                                    }
                                }
                            }
                        }
                        
                        if(hourlyMap.length > 0){
                            for(let i = startHour; i<=endHour; i++){
                                let index = hourlyMap.findIndex(el => el.hour == i)
                                    el[i] = hourlyMap[index].color
                            }
                        }
                        
                        if(cmp.get('v.isGrayOut')){
                            let selectedDate = new Date(cmp.get("v.currentDate")._year, this.MONTHS.indexOf(cmp.get("v.currentDate")._month), cmp.get("v.currentDate")._day)
                            if(cmp.get("v.currentDate")._day == new Date().getDate() && cmp.get("v.currentDate")._year == new Date().getFullYear() && this.MONTHS.indexOf(cmp.get("v.currentDate")._month) == new Date().getMonth()){
                                
                                for(let i = 0; i<=new Date().getHours(); i++){
                                    el[i] = 'greyOutColor'
                                }
                            } else if(selectedDate < new Date()){
                                for(let i = 0; i<24; i++){
                                    el[i] = 'greyOutColor'
                                }
                            } else {

                            }
                        }

                        break;
                    case "2":
                        //!WEEK
                        let diff = todayDate.getDate() - todayDate.getDay() + (todayDate.getDay() == 0 ? -6 : 1);
                        let startWeekDate = new Date(new Date(todayDate.getTime()).setDate(diff));
                        let startDate = startWeekDate < new Date(el["Start DateTime"]) ? new Date(el["Start DateTime"]) : startWeekDate;
                        let endWeekDate = new Date(new Date(startWeekDate.getTime()).setDate(startWeekDate.getDate() + 6));
                        let endDate = endWeekDate > new Date(el["End DateTime"]) ? new Date(el["End DateTime"]) : endWeekDate;
                        if(el.drawLine.length != 0) {
                            let fakeIter = 0;
                            for (let day = endWeekDate.getDate()-6; day <= endDate.getDate(); day++) {
                                let dayOfTheMonth = day <= 0 ? startWeekDate.getDate() + fakeIter : day;
                                let month = day <= 0 ? startWeekDate.getMonth() - (todayDate.getMonth() < endWeekDate.getMonth() ? 0 : 1) : startWeekDate.getMonth() + (todayDate.getMonth() < endWeekDate.getMonth() ? 1 : 0);
                                if(startDate != startWeekDate && dayOfTheMonth < startDate.getDate()) { fakeIter++; continue; }
                                let dayOfWeek = new Date(cmp.get("v.currentDate")._year, month, dayOfTheMonth).getDay();
                                if (el.drawLine[dayOfTheMonth] && el.drawLine[dayOfTheMonth].count == 1) {
                                    let currentValue = mainPickListValues.find((v) => v.apiName == el.drawLine[dayOfTheMonth].picklistValue);
                                    let currentValueIndex = mainPickListValues.indexOf(mainPickListValues.find((v) => v.apiName == el.drawLine[dayOfTheMonth].picklistValue));
                                    el[weekDayList[dayOfWeek]] = currentValueIndex == -1 ? "colorDefault" : currentValue.color ? "color" + currentValueIndex : "colorDefault";
                                } else {
                                    el[weekDayList[dayOfWeek]] = "mixedColor";
                                }
                                fakeIter++;
                            }


                            
                        }

                        if(cmp.get('v.isGrayOut')){
                            if(cmp.get("v.currentDate")._day < new Date().getDate() && cmp.get("v.currentDate")._year <= new Date().getFullYear() && this.MONTHS.indexOf(cmp.get("v.currentDate")._month) <= new Date().getMonth()){
                                for(let i = 0; i<6; i++){
                                    el[weekDayList[i]] = 'greyOutColor'
                                }
                            } else if(cmp.get("v.currentDate")._day == new Date().getDate() && cmp.get("v.currentDate")._year == new Date().getFullYear() && this.MONTHS.indexOf(cmp.get("v.currentDate")._month) == new Date().getMonth()){
                                for(let i = 0; i<=cmp.get("v.currentDate")._day; i++){
                                    el[weekDayList[i]] = 'greyOutColor'
                                }
                            }
                        }
                        break;
                    case "4":
                        //!YEAR
                        let startProj = new Date(el["Start DateTime"])
                        let endProj = new Date(el["End DateTime"])
                        let colors = cmp.get('v.picklistEntryColor')

                        if(el._children.length == 1){
                            if(cmp.get("v.currentDate")._year == startProj.getFullYear() && cmp.get("v.currentDate")._year == endProj.getFullYear()){
                                for(let month = startProj.getMonth(); month<=endProj.getMonth(); month++){
                                    el[this.SHORTMONTHS[month]] = colors[el._children[0].pickListValue]
                                }
                            } else if(startProj.getFullYear() == cmp.get("v.currentDate")._year && cmp.get("v.currentDate")._year < endProj.getFullYear()){
                                for(let month = startProj.getMonth(); month<=12; month++){
                                    el[this.SHORTMONTHS[month]] = colors[el._children[0].pickListValue]
                                }
                            } else if(cmp.get("v.currentDate")._year <= endProj.getFullYear() && startProj.getFullYear() < cmp.get("v.currentDate")._year){
                                for(let i = 0; i<=endProj.getMonth(); i++){
                                    el[this.SHORTMONTHS[i]] = colors[el._children[0].pickListValue]
                                }
                            }
                        } else {
                            let array_of_month = []
                            let count_month = {}
                            for(let child = 0; child < el._children.length; child++){
                                for(let month = 0; month < this.SHORTMONTHS.length; month++){
                                    if(el._children[child][this.SHORTMONTHS[month]]){
                                        array_of_month.push({
                                            month: this.SHORTMONTHS[month],
                                            color: el._children[child].pickListValue
                                        })
                                    }
                                }
                            }
                            array_of_month.forEach(({month}) => {
                                count_month[month] = (count_month[month] || 0) + 1; //For count general count of the same months for different projects
                            });
                            for(let char in count_month){
                                if(count_month[char] > 1){
                                    el[char] = 'mixedColor'
                                }else if(count_month[char] == 1){
                                    let index = array_of_month.findIndex(el => el.month == char);
                                    el[char] = colors[array_of_month[index].color]
                                }

                            }
                        }

                        this.SHORTMONTHS.forEach((month) => {
                            if(cmp.get("v.currentDate")._year < new Date().getFullYear()){
                                el[month] = 'greyOutColor';
                            }else if (cmp.get('v.isGrayOut') && cmp.get("v.currentDate")._year <= new Date().getFullYear()  && new Date().getMonth() > this.SHORTMONTHS.indexOf(month)){
                                el[month] = 'greyOutColor';
                            }

                            if(!cmp.get('v.isGrayOut') && el[month] == 'greyOutColor'){
                                el[month] = 'Inactive';
                            } 

                        });
                        break;
                    default:
                        //!MONTH
                        let month_dates = [];
                        for(let i = 0; i<el.drawLine.length; i++){
                            month_dates.push(new Date(cmp.get("v.currentDate")._year,this.MONTHS.indexOf(cmp.get("v.currentDate")._month),i))
                        }
                        for (const day in el.drawLine) {
                            if (el.drawLine[day].count == 1) {
                                let currentValue = mainPickListValues.find((v) => v.apiName == el.drawLine[day].picklistValue);
                                let currentValueIndex = mainPickListValues.indexOf(mainPickListValues.find((v) => v.apiName == el.drawLine[day].picklistValue));
                                el[day] = currentValueIndex == -1 ? "colorDefault" : currentValue.color ? "color" + currentValueIndex : "colorDefault";
                            } else {
                                el[day] = "mixedColor";
                            }
                        }
                        days.forEach((day)=>{
                            if(cmp.get('v.isGrayOut') && new Date()>month_dates[day]){
                                el[day] = 'greyOutColor';
                            } else if(!cmp.get('v.isGrayOut') && el[day] == 'greyOutColor'){
                                el[day] = 'Inactive';
                            }
                        });
                }
            });
        }
            if(cmp.get("v.selectedView") == "2"){
                cmp.set("v.data", data);
                cmp.set("v.filteredData", data);
            } else {
                cmp.set("v.data", listRecords);
                cmp.set("v.filteredData", listRecords);
            }
        } catch(e) {
        	console.error(e);
        }
	},
    
    getMilliseconds: function (y, m, d) {
        let date = new Date(y, m, d);
        return Date.parse(date);
    },
        
    drawProjectMembersLine: function (cmp, listRecords) {
        try {
            let _year = cmp.get("v.currentDate")._year;
            let _month = this.MONTHS.indexOf(cmp.get("v.currentDate")._month);
            let _day = cmp.get("v.currentDate")._day;
            let days = cmp.get("v.days");
            let todayDate = new Date(cmp.get("v.currentDate")._year, cmp.get("v.currentDate").countMonth, cmp.get("v.currentDate")._day);
            let weekdays = this.WEEKDAYS;
            let arr = [];
            if (listRecords.length != 0) {
                listRecords.forEach((rec) => {
                    if(cmp.get("v.selectedView") == '2') {
                        let diff = todayDate.getDate() - todayDate.getDay() + (todayDate.getDay() == 0 ? -6 : 1);
                        let startWeekDate = new Date(new Date(todayDate.getTime()).setDate(diff));
                        let startDate = startWeekDate < new Date(rec["Start DateTime"]) ? new Date(rec["Start DateTime"]) : startWeekDate;
                        let endWeekDate = new Date(new Date(startWeekDate.getTime()).setDate(startWeekDate.getDate() + 6));
                        let endDate = endWeekDate > new Date(rec["End DateTime"]) ? new Date(rec["End DateTime"]) : endWeekDate;
                    	let finish = false;
                    	let monthday = startDate.getDate();
                        let canPush = false
                    	let currentDate = new Date(startDate);
                        let countMaxDayOfMonth = new Date(_year, _month+1, 0).getDate();
                        switch(countMaxDayOfMonth){
                            case 30:
                                    for(let i = 0; i<=30; i++){
                                        let currentStartDate = Date.parse(new Date(_year, _month, monthday, 0, 0, 0));
                                        let currentEndDate = Date.parse(new Date(_year, _month, monthday, 23, 59, 59));
                                        let weekdayName = weekdays[(new Date(_year, _month, monthday, 1, 0, 0)).getDay()];
                                        if(currentEndDate >= Date.parse(rec["Start Date"]) && currentStartDate <= Date.parse(rec["End Date"])) {
                                                arr.push({ dayNumber: monthday, weekday: weekdayName, picklistValue: rec.pickListValue, byHours: []});
                                        }
                                        currentDate = new Date(new Date(currentDate).setDate(monthday + 1));
                                        monthday = currentDate.getDate();
                                        if(new Date(new Date(startDate).setDate(monthday+1)) > new Date(endDate)) finish = true;
                                }
                                break;
                            case 31:  
                                    for(let i = 0; i<=31; i++){
                                    let currentStartDate = Date.parse(new Date(_year, _month, monthday, 0, 0, 0));
                                    let currentEndDate = Date.parse(new Date(_year, _month, monthday, 23, 59, 59));
                                    let weekdayName = weekdays[(new Date(_year, _month, monthday, 1, 0, 0)).getDay()];
                                    if(currentEndDate >= Date.parse(rec["Start Date"]) && currentStartDate <= Date.parse(rec["End Date"])) {
                                            arr.push({ dayNumber: monthday, weekday: weekdayName, picklistValue: rec.pickListValue, byHours: []});
                                    }
                                    currentDate = new Date(new Date(currentDate).setDate(monthday + 1));
                                    monthday = currentDate.getDate();
                                    if(new Date(new Date(startDate).setDate(monthday+1)) > new Date(endDate)) finish = true;
                            }
                                break;   
                            default:
                                console.error('Something were wrong in switch 30 or 31...')       
                        }
                    } else {
                        days.forEach((day) => {
                            let currentStartDate = Date.parse(new Date(_year, _month, day, 0, 0, 0));
                            let currentEndDate = Date.parse(new Date(_year, _month, day, 23, 59, 59));
                            let weekdayName = weekdays[(new Date(_year, _month, day, 1, 0, 0)).getDay()];
                            if(currentEndDate >= Date.parse(rec["Start Date"]) && currentStartDate <= Date.parse(rec["End Date"])) {
                                let byHours = [];
                                if(cmp.get("v.selectedView") == "1" && day == _day) {
                                    let startHour = 0;
                                    let endHour = 23;
                                    if(new Date(rec["Start DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(rec["Start DateTime"]).getDate() == _day) {
                                        startHour = new Date(rec["Start DateTime"]).getHours();
                                    }
                                    if(new Date(rec["End DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(rec["End DateTime"]).getDate() == _day) {
                                        endHour = new Date(rec["End DateTime"]).getHours();
                                    }
                                    for(let count = startHour; count <= endHour; count++) {
                                        byHours.push(count);
                                    }
                                }
                                arr.push({ dayNumber: day, weekday: weekdayName, picklistValue: rec.pickListValue, byHours: byHours});               
                            }
                        });
                    }
                });
            }
            let counter = [];
            let c = [];
            c = Array.from(new Set(arr.map(JSON.stringify))).map(JSON.parse);
            c.forEach(function (e) {
                if (!counter[e.dayNumber]) {
                    let hoursList = [];
                    if(e.byHours.length > 0) {
                        e.byHours.forEach(function (h) {
                            hoursList.push({hour: h, count: 0, picklistValue: e.picklistValue});
                        });
                    }
                    let weekdayName = weekdays[(new Date(_year, _month, e.dayNumber, 1, 0, 0)).getDay()];
                    counter[e.dayNumber] = { count: 1, weekday: weekdayName, picklistValue: e.picklistValue, byHours: hoursList };
                    
                } else {
                    counter[e.dayNumber].count += 1;
                    if(e.byHours.length > 0) {
                        e.byHours.forEach(function (h) {
                            if(!counter[e.dayNumber].byHours[h]) {
                                counter[e.dayNumber].byHours.push({hour: h, count: 1, picklistValue: e.picklistValue});
                            } else {
                                counter[e.dayNumber].byHours[h].count += 1;
                            }
                        });
                    }
                }
            });
            return counter;
        } catch(e) {
            console.error(e);
        }
	},
    
    drawProjectLine: function (cmp, startDate, endDate) {
        let _year = cmp.get("v.currentDate")._year;
        let _month = this.MONTHS.indexOf(cmp.get("v.currentDate")._month);
        let days = cmp.get("v.days");
        let arr = [];
        if (startDate != null && endDate != null) {
            days.forEach((day) => {
                let currentStartDate = Date.parse(new Date(Date.UTC(_year, _month, day, 0, 0, 0, 0)));
                let currentEndDate = Date.parse(new Date(Date.UTC(_year, _month, day, 23, 59, 59, 999)));
                if(currentEndDate >= Date.parse(startDate) && currentStartDate <= Date.parse(endDate)) {
					arr.push(day);                
            	}
            });
        }
        return arr;
    },
        
    setPickListValues: function (cmp, event, helper) {
        let action = cmp.get("c.getPickLists");
        let tabObj;
            
        cmp.get("v.allTabs").forEach((tab) => {
            if (cmp.get("v.selectedTab") == tab.apiName) {
                tabObj = tab;
            }
        });
        action.setParams({ objType: tabObj.junctionApiName });
        action.setCallback(this, function (response) {
            let state = response.getState();
            if (state == "SUCCESS") {
                let data = JSON.parse(response.getReturnValue());
                if(data.length != 0){
                    let mainPickListValues = [];
                    cmp.set("v.listPickLists", data);
                    helper.getPicklistsValues(cmp, event, helper, data);
                    cmp.get("v.allTabs").forEach((tab) => {
                        if (cmp.get("v.selectedTab") == tab.apiName) {
                            cmp.set("v.mainPickList", tab.pickList);
                            if (tab.pickList) {
    	                        data.forEach((el) => {
        		                    if (el.apiName == tab.pickList) {
                			            mainPickListValues = el.pickListValues;
                            			return;
                        			}
                                });
                    		} else {
                        		mainPickListValues = data[0].pickListValues;
                    		}
                    		return;
                		}
            		});
            		mainPickListValues.unshift({ label: "--None--", apiName: "None" });
            		cmp.set("v.mainPickListValues", mainPickListValues);
        		} else {
                    cmp.set("v.mainPickList", '');
                    cmp.set("v.listPickLists", []);
                    cmp.set("v.mainPickListValues", [{ label: "--None--", apiName: "None" }]);
				}
			} else if (state === "ERROR") {
    			var errors = response.getError();
    			if (errors) {
        			console.error("Error message: " + JSON.stringify(errors));
    			} else {
        			console.error("Unknown error");
    			}
			}

		});
		$A.enqueueAction(action);
	},
        
    setMainPickList: function (cmp, event, helper, selectedPickList) {
        let action = cmp.get("c.setMainPickList");
        action.setParams({
            type: cmp.get("v.selectedTab"),
            pickListApiName: selectedPickList
        });
        action.setCallback(this, function (response) {
            let state = response.getState();
            if (state == "SUCCESS") {
                helper.setData(cmp, event, helper);
                
            }
            if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    console.error("Error message: " + JSON.stringify(errors));
                } else {
                    console.error("Unknown error");
                }
            }
        });
        
        $A.enqueueAction(action);
    },

    addDays: function(date, days) {
        const copy = new Date(Number(date))
        copy.setDate(date.getDate() + days)
        return copy
      },
    setRecordsForWeekly: function(cmp, event, helper, data){
        let selectedTab;
        cmp.get("v.allTabs").forEach((tab) => {
            if (cmp.get("v.selectedTab") == tab.apiName) {
    	        selectedTab = tab;
                return;
            }
        });
        try{
        let prepared = []
        let WEEKDAYS = this.WEEKDAYS
        for(let item of data){
          let dev_Info = {}
          dev_Info._children = []
          dev_Info.id = item.Id
          dev_Info.Name = item.Name
          dev_Info.improvements = []
          if(item[selectedTab['improvement']]){
              let impr = []
              item[selectedTab['improvement']].records.forEach(el => impr.push(el.Name))
              dev_Info.improvements = impr.join(', ')
          }
        if(item[selectedTab['junction']]){
            item[selectedTab['junction']].forEach(el => {
                let _children = {}
                _children.id = el.Id
                _children.Name = el[selectedTab['childApiName']].Name
                _children.Date = {
                    startDateTime: new Date(el[selectedTab['startDateApiName']]),
                    endDateTime: new Date(el[selectedTab['endDateApiName']])
                }
                _children["Start Date"] = new Date(el[selectedTab['startDateApiName']]).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                _children["End Date"] = new Date(el[selectedTab['endDateApiName']]).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                _children.color = el[cmp.get("v.mainPickList")]
                _children.daysBeetween = Math.round(Math.abs((_children.Date.startDateTime - _children.Date.endDateTime) / (24 * 60 * 60 * 1000)))
                _children.pickListValue = el[cmp.get("v.mainPickList")]
                _children.dateDesciption = []
                for(let i = 0; i<=_children.daysBeetween; i++){
                let day = _children.Date.startDateTime
                let info = {}
                info.date = this.addDays(day, i)
                info.day = this.addDays(day, i).getDate()
                info.year = this.addDays(day, i).getFullYear()
                info.weekday = WEEKDAYS[this.addDays(day, i).getDay()]
                info[info.weekday] = _children.color
                _children.dateDesciption.push(info)
            
                }
                dev_Info._children.push(_children)
            })
            prepared.push(dev_Info)
        }
     } 
        cmp.set("v.dataWeekly", prepared);

        } catch(e){
            console.error(e)
        }
    },    
    setRecords: function (cmp, event, helper, data) {
        try{
        let selectedTab;
        let listRecords = [];
        cmp.get("v.allTabs").forEach((tab) => {
            if (cmp.get("v.selectedTab") == tab.apiName) {
    	        selectedTab = tab;
                return;
            }
        });
        cmp.set("v.mixedColor", selectedTab.mixedColor);
        for (let entry of data) {
            let startRangeValues = new Array();
            let endRangeValues = new Array();
            let noProjects = "";
            let record = { id: entry.Id, Name: entry.Name, _children: [] };
            let childFieldName = selectedTab.junction ? selectedTab.junction : selectedTab.childApiNameOut;
            let improvementName = selectedTab.improvement;
            if (entry[childFieldName]) {
                entry[childFieldName].forEach((child) => {
                    startRangeValues.push(new Date(Date.parse(child[selectedTab.startDateApiName])));
                    endRangeValues.push(new Date(Date.parse(child[selectedTab.endDateApiName])));
                    record._children.push({
                        id: child.Id,
                        Name: selectedTab.junction == null ? child.Name : child[selectedTab.childApiName].Name,
                        drawLine: this.drawProjectLine(cmp, child[selectedTab.startDateApiName], child[selectedTab.endDateApiName]),
                        "Start Date": new Date(child[selectedTab.startDateApiName]).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'}),
                        "End Date": new Date(child[selectedTab.endDateApiName]).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'}),
                    	"Start DateTime": new Date(child[selectedTab.startDateApiName]).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC'}),
                        "End DateTime": new Date(child[selectedTab.endDateApiName]).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC'}),
                        Range: this.getSetOfMonth(cmp, new Date(child[selectedTab.startDateApiName]), new Date(child[selectedTab.endDateApiName])),
                        pickListValue: child[cmp.get("v.mainPickList")]
                    });
                });
            }
            record.improvements = '';
            if(entry[improvementName]) {
                entry[improvementName].records.forEach((imp) => {
                    record.improvements = record.improvements + (record.improvements == '' ? '' : ', ') + imp.Name;
                });
            }
            record.drawLine = this.drawProjectMembersLine(cmp, record._children);
            record["Start Date"] = startRangeValues.length > 0 ? new Date(Math.min(...startRangeValues)).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'}) 
            												   : noProjects;
            record["End Date"] = endRangeValues.length > 0 ? new Date(Math.max(...endRangeValues)).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'}) 
            												   : noProjects;
        	record["Start DateTime"] = startRangeValues.length > 0 ? new Date(Math.min(...startRangeValues)).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC'}) 
            												   : noProjects;
            record["End DateTime"] = endRangeValues.length > 0 ? new Date(Math.max(...endRangeValues)).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'UTC'}) 
            												   : noProjects;
            record.Range = this.getSetOfMonth(cmp, new Date(Math.min(...startRangeValues)), new Date(Math.max(...endRangeValues)));
            listRecords.push(record);
            record["Date"] = {
                startDate: new Date(Math.min(...startRangeValues)),
                endDate: new Date(Math.max(...endRangeValues))
            };
        }
        cmp.set("v.mainPickListValuesBeforeDraw", listRecords);
        this.setRecordsForWeekly(cmp, event, helper, data)
        this.drawLine(cmp, listRecords);
        this.filterByPickListValue(cmp, event, helper);
        } catch(e) {
            console.error(e)
        }
	},
    
    setData: function (cmp, event, helper) {
        let action = cmp.get("c.getSelectedObjectRecords");
        action.setParams({
            selectedObjectApiName: cmp.get("v.selectedTab"),
            period: cmp.get("v.period"),
            selectedDate: JSON.stringify(cmp.get("v.currentDate"))
        });
        action.setCallback(this, function (response) {
            let state = response.getState();
            if (state == "SUCCESS") {
                let data = JSON.parse(response.getReturnValue());
                this.setRecords(cmp, event, helper, data);
                
                cmp.set("v.IsSpinner", false);
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    console.error("Error message: " + JSON.stringify(errors));
                } else {
                    console.error("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
        
    setColors: function (cmp, event, helper) {
        /*if (localStorage.length != 0) {
        	cmp.set("v.fullColor", localStorage.getItem("fullColor"));
            cmp.set("v.partColor", localStorage.getItem("partColor"));
            cmp.set("v.crossedColor", localStorage.getItem("crossedColor"));
        }*/
    },
            
    setOptionsMonthOrYear: function (cmp, event, helper) {
    	let optionsView = [
            { id: 1, label: "Day" },
            { id: 2, label: "Week" },
        	{ id: 3, label: "Month", selected: true },
            { id: 4, label: "Year" }
        ];
        cmp.set("v.optionsView", optionsView);
    },
                
    updateMixedColor: function (cmp, helper, color) {
        let action = cmp.get("c.saveMixedColorForTab");
                    
        action.setParams({
            type: cmp.get("v.selectedTab"),
            color: color
        });
                    
        action.setCallback(this, function (response) {
        	let state = response.getState();
            if (state == "SUCCESS") {
            } else if (state === "ERROR") {
            	var errors = response.getError();
                if (errors) {
                	console.error("Error message: " + JSON.stringify(errors));
                } else {
                    console.error("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
	},
                    
    expandSwitch: function (cmp) {
        let tree = cmp.find("treegrid_async");
        let expandSwitcher = cmp.get("v.expandSwitcher");
        if (Array.isArray(tree)) {
            tree.forEach((el) => {
                if (expandSwitcher) {
                    el.expandAll();
                    cmp.set("v.expandSwitcher", false);
                } else {
                    el.collapseAll();
                    cmp.set("v.expandSwitcher", true);
                }
            });
		} else {
            if (expandSwitcher) {
                tree.expandAll();
                cmp.set("v.expandSwitcher", false);
            } else {
                tree.collapseAll();
                cmp.set("v.expandSwitcher", true);
            }
		}
	},
    
    sessionStorageController: function (cmp, event, helper) {
        if (sessionStorage.getItem("gridExpandedRows") != null) {
            let gridExpandedRows = sessionStorage.getItem("gridExpandedRows");
            cmp.set("v.gridExpandedRows", gridExpandedRows.split(","));
        }
        
        if (sessionStorage.getItem("isOpenSetup") != null) {
            let isOpenSetup = sessionStorage.getItem("isOpenSetup");
            cmp.set("v.expandSwitcher", isOpenSetup);
            helper.openSetup(cmp, isOpenSetup);
        }
        
        if (sessionStorage.getItem("expandSwitcher") != null) {
            let expandSwitcher = sessionStorage.getItem("expandSwitcher");
            cmp.set("v.expandSwitcher", !expandSwitcher);
        }
        if (sessionStorage.getItem("SelectedTab") != null) {
            let tab = sessionStorage.getItem("SelectedTab");
            cmp.set("v.selectedTab", tab);
        } else {
            cmp.set("v.selectedTab", cmp.get("v.allTabs")[0].apiName);
        }
    },
        
    openSetup: function (cmp, isOpenSetup) {
        if (!isOpenSetup) {
            cmp.set("v.isOpenSetup", true);
            let openSetup = cmp.find("openSetup");
            $A.util.removeClass(openSetup, "hideOpenSetup");
            $A.util.addClass(openSetup, "showOpenSetup");
        } else {
            cmp.set("v.isOpenSetup", false);
            let openSetup = cmp.find("openSetup");
            $A.util.removeClass(openSetup, "showOpenSetup");
            $A.util.addClass(openSetup, "hideOpenSetup");
        }
        
        let tabSet = cmp.find("tabSet");
        if (isOpenSetup) {
            $A.util.removeClass(tabSet, "slds-p-top_x-small");
            $A.util.addClass(tabSet, "slds-p-top_xx-large");
        } else {
            $A.util.removeClass(tabSet, "slds-p-top_xx-large");
            $A.util.addClass(tabSet, "slds-p-top_x-small");
        }
    },
        
    filterByPickListValue: function (cmp, event, helper) {
        let colors = cmp.get('v.picklistEntryColor')
    	let listRecords = cmp.get("v.data");
    	let filterValue = cmp.get("v.filterValue");
        if(filterValue == "None") cmp.set("v.isFiltered", false);
        else cmp.set("v.isFiltered", true);
    	let days = cmp.get("v.days");
    	let mainPickListValues = cmp.get("v.mainPickListValues");
        let todayDate = new Date(cmp.get("v.currentDate")._year, cmp.get("v.currentDate").countMonth + 1, cmp.get("v.currentDate")._day);

    	if (filterValue == "None") {
      		cmp.set("v.filteredData", listRecords);
    	} else {
      		let filteredData = [];
            let weeklyData = []
      		listRecords.forEach((el) => {
                
        		if (el._children.length) {
          			var filteredChilds = el._children.filter((ch) => {
            			return ch.pickListValue == filterValue;
          			});
          			if (filteredChilds.length) {
                        let copyEl = {};
              			copyEl = Object.assign({}, {'_children':el._children,id:el.id,drawLine:el.drawLine,'Start Date':el['Start Date'],'Start DateTime':el['Start DateTime'],Name:el.Name,'End Date':el['End Date'],'End DateTime':el['End DateTime'],Date:el.Date});
                        copyEl._children = filteredChilds;
            			copyEl.drawLine = helper.drawProjectMembersLine(cmp, copyEl._children);
                        copyEl.improvements = el.improvements
                        switch (cmp.get("v.selectedView")) {
                            case "1":
                                //!DAY
                                let startHour = 0;
                                let endHour = 23;
                                if(new Date(copyEl["Start DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(copyEl["Start DateTime"]).getDate() == cmp.get("v.currentDate")._day) {
                                    startHour = new Date(copyEl["Start DateTime"]).getHours();
                                }
                                if(new Date(copyEl["End DateTime"]).getMonth() == cmp.get("v.currentDate").countMonth && new Date(copyEl["End DateTime"]).getDate() == cmp.get("v.currentDate")._day) {
                                    endHour = new Date(copyEl["End DateTime"]).getHours();
                                }
                                if(copyEl.drawLine[todayDate.getDate()]) {
                                    for (const count in copyEl.drawLine[todayDate.getDate()].byHours) {
                                            let currentValue = mainPickListValues.find((v) => v.apiName == copyEl.drawLine[todayDate.getDate()].byHours[count].picklistValue);
                                            let currentValueIndex = mainPickListValues.indexOf(mainPickListValues.find((v) => v.apiName == copyEl.drawLine[todayDate.getDate()].byHours[count].picklistValue));
                                            copyEl[copyEl.drawLine[todayDate.getDate()].byHours[count].hour] = currentValueIndex == -1 ? "colorDefault" : currentValue.color ? "color" + currentValueIndex : "colorDefault";
                                    }
                                }

                                if(cmp.get('v.isGrayOut')){
                                    let selectedDate = new Date(cmp.get("v.currentDate")._year, this.MONTHS.indexOf(cmp.get("v.currentDate")._month), cmp.get("v.currentDate")._day)
                                    if(cmp.get("v.currentDate")._day == new Date().getDate() && cmp.get("v.currentDate")._year == new Date().getFullYear() && this.MONTHS.indexOf(cmp.get("v.currentDate")._month) == new Date().getMonth()){
                                        for(let i = 0; i<=new Date().getHours(); i++){
                                            copyEl[i] = 'greyOutColor'
                                        }
                                    } else if(selectedDate < new Date()){
                                        for(let i = 0; i<24; i++){
                                            copyEl[i] = 'greyOutColor'
                                        }
                                    } else {

                                    }
                                }
                                break;
                            case "2":
                                //!WEEK
                                if(copyEl._children){
                                    let startDates =  copyEl._children.map(el => new Date(el["Start Date"]))
                                    let endDates =  copyEl._children.map(el => new Date(el["End Date"]))
                                    copyEl["Start Date"] = this.addDays(new Date(new Date(Math.min.apply(null,startDates))),1).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                                    copyEl["End Date"] = this.addDays(new Date(new Date(Math.max.apply(null,endDates))),1).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                                    let durweek = 7
                                    let selectedDate = this.addDays(new Date(cmp.get("v.currentDate")._year, cmp.get("v.currentDate").countMonth, cmp.get("v.currentDate")._day),0)
                                    //Last day of all childrens of team member, on this date loop gonna breake for correct pulling dates.
                                    let endDatesOfChil = copyEl._children.map(el => new Date(el["End Date"]))
                                    let endDateCHILD = new Date(Math.max.apply(null, endDatesOfChil))
                                    let weekDateTime = []
                                    let difer = selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() == 0 ? -6 : 1)
                                    let startWeekDay = new Date(new Date(selectedDate.getTime()).setDate(difer));
                                    let endWeekDay = new Date(new Date(startWeekDay.getTime()).setDate(startWeekDay.getDate() + 6));
                                    let startWeekForLoop = new Date(startWeekDay)

                                    if(new Date(copyEl["Start Date"]) < new Date(selectedDate)){
                                        endWeekDay = this.addDays(selectedDate,durweek-selectedDate.getDay())
                                        for(let day = startWeekForLoop; day<= endWeekDay; day.setDate(day.getDate() + 1)){
                                            el._children.forEach(el => {
                                                let index = el.dateDesciption.findIndex(el => el.date.toString().slice(0,16) == day.toString().slice(0,16));
                                                if(index !== -1){
                                                    weeklyData.push({
                                                        Date: el.dateDesciption[index].date,
                                                        weekday: el.dateDesciption[index].weekday,
                                                        color: el.color
                                                    })
                                                }
                                            })
                                            if(day.toString().slice(0,16) == endDateCHILD.toString().slice(0,16)) {
                                                break;
                                            }
                                        }
                                    } else {
                                        for(let day = new Date(copyEl["Start Date"]); day<= this.addDays(new Date(endWeekDay),-1); day.setDate(day.getDate() + 1)){
                                            el._children.forEach(el => {
                                                let index = el.dateDesciption.findIndex(el => el.date.toString().slice(0,16) == day.toString().slice(0,16));
                                                if(index !== -1){
                                                    weeklyData.push({
                                                        Date: el.dateDesciption[index].date,
                                                        weekday: el.dateDesciption[index].weekday,
                                                        color: el.color
                                                    })
                                                }
                                            })
                                            if(day.toString().slice(0,16) == endDateCHILD.toString().slice(0,16)) {
                                                break;
                                            }
                                        }
                                    }
                                for(let char of new Set(weeklyData.filter(el => el["color"] == filterValue).map(el => el.weekday))){
                                    copyEl[char] = colors[filterValue]
                                }

                                if(cmp.get('v.isGrayOut')){
                                    const weekDayList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
                                    for(let day = 0; day <= 6; day++){
                                        if(this.addDays(startWeekDay,day) < new Date()){
                                            copyEl[weekDayList[day]] = 'greyOutColor'
                                        }
                                    }
                                }
                            }
                                break;
                            case "3":
                                //!MONTH
                                
                                for (const day in copyEl.drawLine) {
                                    if (copyEl.drawLine[day].count == 1) {
                                        let currentValue = mainPickListValues.find((v) => v.apiName == copyEl.drawLine[day].picklistValue);
                                        let currentValueIndex = mainPickListValues.indexOf(mainPickListValues.find((v) => v.apiName == copyEl.drawLine[day].picklistValue));
                                        copyEl[day] = currentValueIndex == -1 ? "colorDefault" : currentValue.color ? "color" + currentValueIndex : "colorDefault";
                                    } else {
                                        copyEl[day] = "mixedColor";
                                    }
                                }

                                //This condition is used for draw greyOutColor when selected colors filted, because after selecting drawLine method get filtered data from this method
                                if(cmp.get('v.isGrayOut')){
                                    if(this.MONTHS.indexOf(cmp.get("v.currentDate")._month) == new Date().getMonth() && cmp.get("v.currentDate")._year == new Date().getFullYear()){
                                        for (const day in copyEl.drawLine) {
                                            if(day <= new Date().getDate()){
                                                copyEl[day] = 'greyOutColor'
                                            }
                                        }
                                        copyEl[new Date().getDate()] = 'greyOutColor'
                                    } else if(this.MONTHS.indexOf(cmp.get("v.currentDate")._month) < new Date().getMonth() && cmp.get("v.currentDate")._year == new Date().getFullYear() || cmp.get("v.currentDate")._year < new Date().getFullYear()){
                                        for(let i = 0; i<32; i++){
                                            copyEl[i] = 'greyOutColor'
                                        }
                                    }
                                }

                            case "4":
                                //!YEAR
                                let startDates =  copyEl._children.map(el => new Date(el["Start Date"]))
                                let endDates =  copyEl._children.map(el => new Date(el["End Date"]))

                                copyEl["Start Date"] = this.addDays(new Date(new Date(Math.min.apply(null,startDates))),1).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                                copyEl["End Date"] = this.addDays(new Date(new Date(Math.max.apply(null,endDates))),1).toLocaleString('en-US', {day: 'numeric', year: 'numeric', month: 'short', timeZone: 'UTC'})
                                
                                let startProj = new Date(copyEl["Start Date"])
                                let endProj = new Date(copyEl["End DateTime"])
                                if(cmp.get("v.currentDate")._year == startProj.getFullYear() && cmp.get("v.currentDate")._year == endProj.getFullYear()){
                                    for(let month = startProj.getMonth(); month<=endProj.getMonth(); month++){
                                        copyEl[this.SHORTMONTHS[month]] = colors[filterValue]
                                    }
                                } else if(startProj.getFullYear() == cmp.get("v.currentDate")._year && cmp.get("v.currentDate")._year < endProj.getFullYear()){
                                    for(let month = startProj.getMonth(); month<12; month++){
                                        copyEl[this.SHORTMONTHS[month]] = colors[filterValue]
                                    }
                                } else if(cmp.get("v.currentDate")._year <= endProj.getFullYear() && startProj.getFullYear() < cmp.get("v.currentDate")._year){
                                    for(let i = 0; i<=endProj.getMonth(); i++){
                                        copyEl[this.SHORTMONTHS[i]] = colors[filterValue]
                                    }
                                }

                                if(cmp.get('v.isGrayOut')){
                                    let projEnd = new Date(copyEl["End Date"])
                                    
                                    let today = new Date();
                                    if(cmp.get("v.currentDate")._year == new Date().getFullYear() && projEnd.getFullYear() == new Date().getFullYear()){
                                        for(let i = 0; i<=today.getMonth()-1; i++){
                                            copyEl[this.SHORTMONTHS[i]] = 'greyOutColor'
                                        }
                                    } else if(cmp.get("v.currentDate")._year == new Date().getFullYear() && projEnd.getFullYear() > new Date().getFullYear()){
                                        for(let i = 0; i<=today.getMonth()-1; i++){
                                            copyEl[this.SHORTMONTHS[i]] = 'greyOutColor'
                                        }
                                    } else if(cmp.get("v.currentDate")._year < today.getFullYear()){
                                        for(let i = 0; i < 12; i++){
                                            copyEl[this.SHORTMONTHS[i]] = 'greyOutColor'
                                        }
                                    }
                                }
                            default:
                                console.log('default')
                        }
            			filteredData.push(copyEl);
          			}
        		}
      		});
      		cmp.set("v.filteredData", filteredData);
    	}
  	},
    getPicklistsValues: function(cmp, event, helper, picklistApis){
        let picklistFieldsApi = [];
        picklistApis.forEach(el => picklistFieldsApi.push(el["apiName"]))
        let mainObj = {}
        let iterator = 1
        var action = cmp.get('c.getAllPicklistValues')
        action.setCallback(this, function(res){
            let state = res.getState()
            if(state == 'SUCCESS'){
                let data = JSON.parse(res.getReturnValue())
                picklistFieldsApi.forEach(el => {
                    data
                        .filter(value => value['fieldName'] == el)
                        .forEach(item => {
                            mainObj[item["label"]] = 'color'+iterator
                            iterator++
                        })
                        iterator = 1;
                })
            }
        })
        cmp.set('v.picklistEntryColor', mainObj)
        $A.enqueueAction(action);
    }  

});