({
  // double tab change
	init: function (cmp, event, helper) {
    	helper.init(cmp, event, helper);
  	},
    
  	grayOutPast: function (cmp, event, helper) {
        sessionStorage.removeItem("currentDate");
    	helper.getCurrentDate(cmp, event, helper);
        helper.drawLine(cmp, cmp.get("v.mainPickListValuesBeforeDraw"));
  	},
    
    showImprovements: function (cmp, event, helper) {
        helper.getDays(cmp, event, helper);
    },

  	filterByPickListValue: function (cmp, event, helper) {
        helper.filterByPickListValue(cmp, event, helper);
  	},

  	changeMainPickList: function (cmp, event, helper) {
        let mainPickList = event.getSource().get("v.value");
        let mainPickListValues;
        cmp.set("v.mainPickList", mainPickList);
        cmp.get("v.listPickLists").forEach((el) => {
          	if (el.apiName == mainPickList) mainPickListValues = el.pickListValues;
        });
        if (!mainPickListValues.find((e) => e.apiName == "None")) {
          	mainPickListValues.unshift({ label: "--None--", apiName: "None" });
        }
        cmp.set("v.mainPickListValues", mainPickListValues);
        helper.setMainPickList(cmp, event, helper, mainPickList);
  	},

  	handleTabChange: function (cmp, event, helper) {
        if (cmp.get("v.selectedTab") == "addTab" && cmp.get("v.allowPopUpOpen")) {
          	cmp.set("v.showTestModal", true);
        }
        if (cmp.get("v.selectedTab") != "addTab" && cmp.get("v.reloadComponent")) {
        	sessionStorage.setItem("SelectedTab", cmp.get("v.selectedTab"));
            helper.init(cmp, event, helper);
        } else {
            cmp.set("v.reloadComponent", false);
            cmp.set("v.allowPopUpOpen", true);
        }
        if (cmp.get("v.selectedTab") != "addTab") {
          	cmp.set("v.reloadComponent", true);
        }
  	},

  	openModelTest: function (cmp, event, helper) {
    	if (event != null) {
      		cmp.set("v.showTestModal", false);
    	} else {
      		cmp.set("v.showTestModal", true);
    	}
  	},

  	expandSwitcher: function (cmp, event, helper) {
    	if (cmp.get("v.expandSwitcher")) {
      		let gridExpandedRows = [];
      		let data = cmp.get("v.filteredData");
      		data.forEach((row) => {
        		gridExpandedRows.push(row.id);
      		});
      		sessionStorage.setItem("gridExpandedRows", gridExpandedRows);
    	} else {
      		sessionStorage.removeItem("gridExpandedRows");
    	}
    	helper.expandSwitch(cmp, event, helper);
  	},

  	setup: function (cmp, event, helper) {
    	let isOpenSetup = cmp.get("v.isOpenSetup");
    	sessionStorage.setItem("isOpenSetup", isOpenSetup);
    	helper.openSetup(cmp, isOpenSetup);
  	},

  	handleColor: function (cmp, event, helper) {
        let pickListValues = cmp.get("v.mainPickListValues");
        let color = event.getSource().get("v.value");
        let pickListApiName = event.getSource().get("v.label");
        let fieldApiName = cmp.get("v.mainPickList");
        let objectApiName;
    	cmp.get("v.allTabs").forEach((tab) => {
      		if (cmp.get("v.selectedTab") == tab.apiName) {
        		objectApiName = tab.junctionApiName;
      		}
    	});
    	pickListValues[pickListValues.indexOf(pickListValues.find((el) => el.apiName == pickListApiName))].color = color;
    	cmp.set("v.mainPickListValues", pickListValues);

    	helper.updateColor(cmp, helper, pickListApiName, fieldApiName, color, objectApiName);
        if(cmp.get("v.isFiltered")) helper.filterByPickListValue(cmp, helper, color);
  	},

  	handleMixedColor: function (cmp, event, helper) {
        let color = event.getSource().get("v.value");
        cmp.set("v.mixedColor", color);
        helper.updateMixedColor(cmp, helper, color);
        if(cmp.get("v.isFiltered")) helper.filterByPickListValue(cmp, helper, color);
  	},

  	handleRowAction: function (cmp, event, helper) {
        let defaultFields;
        var action = event.getParam("action");
        var row = event.getParam("row");
        const row_copy = Object.assign({}, row);
        let selectedTab;
        cmp.get("v.allTabs").forEach((tab) => {
          	if (cmp.get("v.selectedTab") == tab.apiName) {
            	selectedTab = tab;
            	return;
          	}
        });
        if (!row_copy.hasChildren) {
          	cmp.set("v.ptmId", row.id);
          	cmp.set("v.ptmIsOpen", true);
          	cmp.set("v.ptmTab", selectedTab);
        } else if (row_copy.hasChildren) {    
          	let createRecordEvent = $A.get("e.force:createRecord");
          	createRecordEvent.setParams({
              	entityApiName: selectedTab.junction?selectedTab.junctionApiName:selectedTab.childApiName,
              	navigationLocation: "RELATED_LIST",
              	defaultFieldValues:{
               		[selectedTab.apiName] : row_copy.id,
              	}
          	});
          	createRecordEvent.fire();
        }
  	},

  	goBackInTime: function (cmp, event, helper) {
    	let currentDate = cmp.get("v.currentDate");
        switch (cmp.get("v.selectedView")) {
        	case "1":
                //!DAY
                currentDate._day = currentDate._day - 1;
                var d = new Date(currentDate._year, currentDate.countMonth, 0);
                if (currentDate._day == 0) {
                    currentDate._day = d.getDate();
                    currentDate.countMonth = currentDate.countMonth - 1;
                    let listMonthInYear = cmp.get("v.listMonthInYear");
                    for (let i = 0; i < listMonthInYear.length; i++) {
                        if (currentDate.countMonth == i) {
                            currentDate._month = listMonthInYear[i];
                        }
                    }
                    if (currentDate.countMonth == -1) {
                        currentDate.countMonth = 11;
                        currentDate._month = listMonthInYear[11];
                        currentDate._year = currentDate._year - 1;
                    }
                }
                break;
            case "2":
                //!WEEK
                currentDate._day = currentDate._day - 7;
                var d = new Date(currentDate._year, currentDate.countMonth, 0);
                if (currentDate._day <= 0) {
                    currentDate._day = d.getDate() + currentDate._day;
                    currentDate.countMonth = currentDate.countMonth - 1;
                    let listMonthInYear = cmp.get("v.listMonthInYear");
                    for (let i = 0; i < listMonthInYear.length; i++) {
                        if (currentDate.countMonth == i) {
                            currentDate._month = listMonthInYear[i];
                        }
                    }
                    if (currentDate.countMonth == -1) {
                        currentDate.countMonth = 11;
                        currentDate._month = listMonthInYear[11];
                        currentDate._year = currentDate._year - 1;
                    }
                }
                let curDate = new Date(currentDate._year, currentDate.countMonth, currentDate._day);
                let diff = curDate.getDate() - curDate.getDay() + (curDate.getDay() == 0 ? -6 : 1);
                let startWeekDate = new Date(new Date(curDate.getTime()).setDate(diff));
                let endWeekDate = new Date(new Date(startWeekDate.getTime()).setDate(startWeekDate.getDate() + 6));
                
                currentDate.weekRange = helper.SHORTMONTHS[startWeekDate.getMonth()] + ', ' + startWeekDate.getDate() + ' - ' + helper.SHORTMONTHS[endWeekDate.getMonth()] + ', ' + endWeekDate.getDate();
                break;
            case "4":
                //!YEAR
                currentDate._year = currentDate._year - 1;
                break;
            default:
                //!MONTH
                currentDate.countMonth = currentDate.countMonth - 1;
                let listMonthInYear = cmp.get("v.listMonthInYear");
                for (let i = 0; i < listMonthInYear.length; i++) {
                    if (currentDate.countMonth == i) {
                        currentDate._month = listMonthInYear[i];
                    }
                }
                if (currentDate.countMonth == -1) {
                    currentDate.countMonth = 11;
                    currentDate._month = listMonthInYear[11];
                    currentDate._year = currentDate._year - 1;
                }
        }
    	cmp.set("v.currentDate", currentDate);
    	helper.getDays(cmp, event, helper);
        if(cmp.get("v.isFiltered")) helper.filterByPickListValue(cmp, event, helper);
  	},

  	goToTheFuture: function (cmp, event, helper) {
    	let currentDate = cmp.get("v.currentDate");
        switch (cmp.get("v.selectedView")) {
        	case "1":
                //!DAY
                currentDate._day = currentDate._day + 1;
                var d = new Date(currentDate._year, currentDate.countMonth + 1, 0);
                if (currentDate._day > d.getDate()) {
                    currentDate._day = 1;
                    currentDate.countMonth = currentDate.countMonth + 1;
                    let listMonthInYear = cmp.get("v.listMonthInYear");
                    for (let i = 0; i < listMonthInYear.length; i++) {
                        if (currentDate.countMonth == i) {
                            currentDate._month = listMonthInYear[i];
                        }
                    }
                    if (currentDate.countMonth > 11) {
                        currentDate.countMonth = 0;
                        currentDate._month = listMonthInYear[0];
                        currentDate._year = currentDate._year + 1;
                    }
                }
                break;
            case "2":
                //!WEEK
                currentDate._day = currentDate._day + 7;
                var d = new Date(currentDate._year, currentDate.countMonth + 1, 0);
                if (currentDate._day > d.getDate()) {
                    currentDate._day = currentDate._day - d.getDate();
                    currentDate.countMonth = currentDate.countMonth + 1;
                    let listMonthInYear = cmp.get("v.listMonthInYear");
                    for (let i = 0; i < listMonthInYear.length; i++) {
                        if (currentDate.countMonth == i) {
                            currentDate._month = listMonthInYear[i];
                        }
                    }
                    if (currentDate.countMonth > 11) {
                        currentDate.countMonth = 0;
                        currentDate._month = listMonthInYear[0];
                        currentDate._year = currentDate._year + 1;
                    }
                }
                let curDate = new Date(currentDate._year, currentDate.countMonth, currentDate._day);
                let diff = curDate.getDate() - curDate.getDay() + (curDate.getDay() == 0 ? -6 : 1);
                let startWeekDate = new Date(new Date(curDate.getTime()).setDate(diff));
                let endWeekDate = new Date(new Date(startWeekDate.getTime()).setDate(startWeekDate.getDate() + 6));
                
                currentDate.weekRange = helper.SHORTMONTHS[startWeekDate.getMonth()] + ', ' + startWeekDate.getDate() + ' - ' + helper.SHORTMONTHS[endWeekDate.getMonth()] + ', ' + endWeekDate.getDate();
                
                break;
            case "4":
                //!YEAR
                currentDate._year = currentDate._year + 1;
                break;
            default:
                //!MONTH
                currentDate.countMonth = currentDate.countMonth + 1;
                let listMonthInYear = cmp.get("v.listMonthInYear");
                for (let i = 0; i < listMonthInYear.length; i++) {
                    if (currentDate.countMonth == i) {
                        currentDate._month = listMonthInYear[i];
                    }
                }
                if (currentDate.countMonth > 11) {
                    currentDate.countMonth = 0;
                    currentDate._month = listMonthInYear[0];
                    currentDate._year = currentDate._year + 1;
                }
        }
    	cmp.set("v.currentDate", currentDate);
    	helper.getDays(cmp, event, helper);
        if(cmp.get("v.isFiltered")) helper.filterByPickListValue(cmp, event, helper);
  	},
          
   	handleChange: function (cmp, event, helper) {
        if(cmp.get('v.currentDate')){
           	sessionStorage.setItem('currentDate', JSON.stringify(cmp.get('v.currentDate')));
        }
        if(cmp.get("v.selectedTab") != null) helper.setData(cmp, event, helper);
        if(cmp.get("v.isFiltered")) helper.filterByPickListValue(cmp, event, helper);

    },

  	currentDate: function (cmp, event, helper) {
    	sessionStorage.removeItem("currentDate");
    	helper.getCurrentDate(cmp, event, helper);
  	},

  	changedView: function (cmp, event, helper) {
        switch (cmp.get("v.selectedView")) {
        	case "1":
                cmp.set("v.period", "day");
                break;
            case "2":
                cmp.set("v.period", "week");
                break;
            case "4":
                cmp.set("v.period", "year");
                break;
            default:
                cmp.set("v.period", "month");
        }
        helper.getDays(cmp, event, helper);
        if(cmp.get("v.selectedTab") != null) helper.setData(cmp, event, helper);
        if(cmp.get("v.isFiltered")) helper.filterByPickListValue(cmp, event, helper);
  	},

  	refresh: function (cmp, event, helper) {
    	$A.get("e.force:refreshView").fire();
  	},

  	handleExpandSwitcher: function (cmp, event, helper) {
    	let currentValue = event.getParam("value");
    	sessionStorage.setItem("expandSwitcher", currentValue);
  	}
});