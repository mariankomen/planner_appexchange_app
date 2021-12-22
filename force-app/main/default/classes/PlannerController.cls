public class PlannerController {
    public static final String namespacePrefix = String.valueOf(PlannerController.class).split('\\.', 2)[0];
    
    @AuraEnabled
    public static String getSelectedObjectRecords(String selectedObjectApiName, String period, String selectedDate, String frontQuery/*DateTime startDateTime, DateTime endtDateTime*/) {
        String childFields = '';
        String condition = '';
        String soql = '';
        Integer timezoneHours = UserInfo.getTimeZone().getOffset(system.now())/1000/60/60;
        System.debug('timezoneHours: '+timezoneHours);

        Map<String, Object> selectedDateMap = (Map<String, Object>) JSON.deserializeUntyped(selectedDate);
        System.debug('selectedDateMap: '+selectedDateMap);
        DateTime startPeriodCondition = DateTime.newInstance((Integer) selectedDateMap.get('_year'), ((Integer) selectedDateMap.get('countMonth')) + 1, period == 'day' ? (Integer) selectedDateMap.get('_day') : 1, 0, 0, 0);
        System.debug('startPeriodCondition: '+startPeriodCondition);

        DateTime endPeriodCondition = DateTime.newInstance((Integer) selectedDateMap.get('_year'), ((Integer) selectedDateMap.get('countMonth')) + 1, period == 'day' ? (Integer) selectedDateMap.get('_day') : Date.daysInMonth((Integer) selectedDateMap.get('_year'), ((Integer) selectedDateMap.get('countMonth')) + 1), 23, 59, 59);
        System.debug('endPeriodCondition: '+endPeriodCondition);

        if(period.equalsIgnoreCase('week')) {
            Date datePeriod = Date.newInstance((Integer) selectedDateMap.get('_year'), ((Integer) selectedDateMap.get('countMonth')) + 1, (Integer) selectedDateMap.get('_day'));
            startPeriodCondition = DateTime.newInstance(datePeriod.toStartOfWeek(), Time.newInstance(0, 0, 0, 0));
            endPeriodCondition = DateTime.newInstance(datePeriod.toStartOfWeek().addDays(6), Time.newInstance(23, 59, 59, 999));
        }
        
        Planner_Tab__c selectedTab = new Planner_Tab__c();
        for (Planner_Tab__c plannerTab : Planner_Tab__c.getall().values()) {
            if (plannerTab.Name == selectedObjectApiName) {
                selectedTab = plannerTab;
            }
        }
        String objectName = selectedTab.Junction_Api_Name__c;
        String startDateField = selectedTab.Start_Date_Name__c;
        String endDateField = selectedTab.End_Date_Name__c;
        SObjectType startDateFieldType = ((SObject)(Type.forName('Schema.'+objectName).newInstance())).getSObjectType();
        SObjectType endDateFieldType = ((SObject)(Type.forName('Schema.'+objectName).newInstance())).getSObjectType();
        DescribeSObjectResult s = startDateFieldType.getDescribe();
        DescribeSObjectResult e = endDateFieldType.getDescribe();
        
        Date dateStartPeriod = Date.newInstance((Integer)startPeriodCondition.Year(), (Integer)startPeriodCondition.Month(), (Integer)startPeriodCondition.Day());
        Date dateEndPeriod = Date.newInstance((Integer)endPeriodCondition.Year(), (Integer)endPeriodCondition.Month(), (Integer)endPeriodCondition.Day());
        if(String.valueOf(s.fields.getMap().get(startDateField).getDescribe().getType()) == 'DATETIME'
           &&String.valueOf(e.fields.getMap().get(endDateField).getDescribe().getType()) == 'DATETIME'){
            condition = '(' + selectedTab.Start_Date_Name__c + ' >= :startPeriodCondition AND ' + selectedTab.Start_Date_Name__c + ' <= :endPeriodCondition ' + frontQuery + ') OR ' + 
                        '(' + selectedTab.End_Date_Name__c + ' >= :startPeriodCondition AND ' + selectedTab.End_Date_Name__c + ' <= :endPeriodCondition ' + frontQuery + ') OR ' + 
                        '(' + selectedTab.Start_Date_Name__c + ' <= :startPeriodCondition AND ' + selectedTab.End_Date_Name__c + ' >= :endPeriodCondition ' + frontQuery + ')';
        } else if(String.valueOf(s.fields.getMap().get(startDateField).getDescribe().getType()) == 'DATE'
                  &&String.valueOf(e.fields.getMap().get(endDateField).getDescribe().getType()) == 'DATE'){
            condition = '(' + selectedTab.Start_Date_Name__c + ' >= :dateStartPeriod AND ' + selectedTab.Start_Date_Name__c + ' <= :dateEndPeriod) OR ' + 
                        '(' + selectedTab.End_Date_Name__c + ' >= :dateStartPeriod AND ' + selectedTab.End_Date_Name__c + ' <= :dateEndPeriod) OR ' + 
                        '(' + selectedTab.Start_Date_Name__c + ' <= :dateStartPeriod AND ' + selectedTab.End_Date_Name__c + ' >= :dateEndPeriod ' + frontQuery + ')';
        } 

        String impovementQuery = '';
        if (selectedTab.Improvement_Object_Name__c != null) {
            impovementQuery = String.format(', (SELECT Name FROM {0})', new List<String>{ selectedTab.Improvement_Object_Name__c }
            );
        }
        
        if (selectedTab.Junction_Object_Name__c != null) {
            childFields = String.format('{0}.Name,{1},{2}',new List<String>{ selectedTab.Child_Object_Name__c, selectedTab.Start_Date_Name__c, selectedTab.End_Date_Name__c }
            );
            if (selectedTab.Selected_Pick_List__c != null) {childFields += ',' + /*selectedTab.Child_Object_Name__c + '.' + */selectedTab.Selected_Pick_List__c;}
            soql = String.format('SELECT Name,(SELECT {0} FROM {1} WHERE {2}){3} FROM {4}', new List<String>{ childFields, selectedTab.Junction_Object_Name__c, condition, impovementQuery, selectedTab.Name });
            soql+= ' WITH SECURITY_ENFORCED';
        } else {
            childFields ='Name,' +(selectedTab.Selected_Pick_List__c == null ? '' : selectedTab.Selected_Pick_List__c + ',') +selectedTab.Start_Date_Name__c +',' +selectedTab.End_Date_Name__c;
            soql = String.format('SELECT Name,(SELECT {0} FROM {1} WHERE {2}) FROM {3}',new List<String>{ childFields, selectedTab.ChildObjectApiNameOut__c, condition, selectedTab.Object_Name__c });
            soql+= ' WITH SECURITY_ENFORCED';
        }
        System.debug('soql: '+soql);
        System.debug('JSON.serialize(Database.query(soql)): '+JSON.serialize(Database.query(soql)));
        List<Object> forReturn = new List<Object>();
        for(Object obj : (List<Object>) JSON.deserializeUntyped(JSON.serialize(Database.query(soql)))) {
            Map<String, Object> objMap = (Map<String, Object>) obj;
            if(objMap.containsKey(selectedTab.Junction_Object_Name__c)) {
                Map<String, Object> childContainer = (Map<String, Object>) objMap.get(selectedTab.Junction_Object_Name__c);
                List<Object> childFinishList = new List<Object>();
                for(Object childObj : (List<Object>) childContainer.get('records')) {
                    Map<String, Object> childObjMap = (Map<String, Object>) childObj;
                    DateTime tmpDT = ((DateTime)JSON.deserialize('"' + (String) childObjMap.get(selectedTab.Start_Date_Name__c) + '"', DateTime.class)).addHours(timezoneHours);
                    childObjMap.put(selectedTab.Start_Date_Name__c, tmpDT);
                    tmpDT = ((DateTime)JSON.deserialize('"' + (String) childObjMap.get(selectedTab.End_Date_Name__c) + '"', DateTime.class)).addHours(timezoneHours);
                    childObjMap.put(selectedTab.End_Date_Name__c, tmpDT);
                    childFinishList.add(childObjMap);
                }
                objMap.put(selectedTab.Junction_Object_Name__c, childFinishList);
            }
            forReturn.add(objMap);
        }
        return JSON.serialize(forReturn);
    }
    
    @AuraEnabled
    public static String getPickLists(String objType) {
        List<Junction_Setting__c> jObjList = (List<Junction_Setting__c>) Database.query('SELECT id, PicklistsColors__c FROM Junction_Setting__c WHERE Name =: objType WITH SECURITY_ENFORCED LIMIT 1');
        Map<String, Object> settingMap = new Map<String, Object>();
        if(!jObjList.isEmpty()) {if(jObjList[0].PicklistsColors__c != null && jObjList[0].PicklistsColors__c != '') settingMap = (Map<String, Object>) JSON.deserializeUntyped(jObjList[0].PicklistsColors__c);}
        List<PickListWrapper> wrappers = new List<PickListWrapper>();
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        Schema.sObjectType sobjectType = gd.get(objType);
        Schema.DescribeSObjectResult sobjectDescribe = sobjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = sobjectDescribe.fields.getMap();
        for (Schema.SObjectField field : fieldMap.values()) {
            DescribeFieldResult fieldDescribe = field.getDescribe();
            if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                PickListWrapper wrapper = new PickListWrapper(fieldDescribe.getLabel(), fieldDescribe.getName());
                for (Schema.PicklistEntry e : fieldDescribe.getPicklistValues()) {
                    PickListWrapper entryWrapper = new PickListWrapper(e.getLabel(), e.getValue());
                    entryWrapper.color = null;
                    if(settingMap.containsKey(fieldDescribe.getName())) {
                        Map<String, Object> color = (Map<String, Object>) settingMap.get(fieldDescribe.getName());
                        if(color.containsKey(e.getValue())) entryWrapper.color = (String) color.get(e.getValue());
                    }
                    wrapper.pickListValues.add(entryWrapper);
                }
                wrappers.add(wrapper);
            }
        }
        return JSON.serialize(wrappers);
    }
    
    @AuraEnabled
    public static string getJunctionSettings(){
        return [SELECT Id, PicklistsColors__c FROM Junction_Setting__c WITH SECURITY_ENFORCED LIMIT 1].PicklistsColors__c;
    }
    @AuraEnabled
    public static void changePlannerPickListColor(String objectApiName, String fieldApiName, String pickListEntryApiName, String hexColor) {
        List<Junction_Setting__c> jObjList = (List<Junction_Setting__c>) Database.query('SELECT id, PicklistsColors__c FROM Junction_Setting__c WHERE Name =: objectApiName WITH SECURITY_ENFORCED LIMIT 1');
        if(!jObjList.isEmpty()) {
            Map<String, Object> settingMap = jObjList[0].PicklistsColors__c != null && jObjList[0].PicklistsColors__c != '' ? (Map<String, Object>) JSON.deserializeUntyped(jObjList[0].PicklistsColors__c) : new Map<String, Object>();
            Map<String, Object> picklistValuesMap = settingMap.containsKey(fieldApiName) ? (Map<String, Object>) settingMap.get(fieldApiName) : new Map<String, Object>();
            picklistValuesMap.put(pickListEntryApiName, hexColor);
            settingMap.put(fieldApiName, picklistValuesMap);
            if(Schema.sObjectType.Junction_Setting__c.isUpdateable() && Schema.sObjectType.Junction_Setting__c.fields.PicklistsColors__c.isUpdateable()){
                update new Junction_Setting__c(id=jObjList[0].id, PicklistsColors__c=JSON.serialize(settingMap));
            }
        } else {
            if(Schema.sObjectType.Junction_Setting__c.isCreateable() && Schema.sObjectType.Junction_Setting__c.fields.Name.isCreateable() && Schema.sObjectType.Junction_Setting__c.fields.PicklistsColors__c.isCreateable()){
                insert new Junction_Setting__c(Name=objectApiName, PicklistsColors__c=JSON.serialize(new Map<String, Object>{fieldApiName => new Map<String, Object>{pickListEntryApiName => hexColor}}));
            }
        }
    }
    
    @AuraEnabled
    public static List<Planner_Tab__c> getAllPlannerTabsFromCustomSettings() {
        return Planner_Tab__c.getall().values().size() == 0 ? null : Planner_Tab__c.getall().values();
    }
    
    @AuraEnabled
    public static void setMainPickList(String type, String pickListApiName) {
        if(Schema.sObjectType.Planner_Tab__c.isUpdateable() && Schema.sObjectType.Planner_Tab__c.fields.Selected_Pick_List__c.isUpdateable()){
            Planner_Tab__c pt = Planner_Tab__c.getValues(type);
            pt.Selected_Pick_List__c = pickListApiName;
            update pt;
        }
    }
    
    @AuraEnabled
    public static void saveMixedColorForTab(String type, String color) {
        if(Schema.sObjectType.Planner_Tab__c.isUpdateable() && Schema.sObjectType.Planner_Tab__c.fields.Crossed_Color__c.isUpdateable()){
            Planner_Tab__c pt = Planner_Tab__c.getValues(type);
            pt.Crossed_Color__c = color;
            update pt;
        }
    }
    
    @AuraEnabled
    public static Boolean deleteRecord(String idObj) {
        String apiObj = String.valueOf(Id.valueOf(idObj).getSObjectType());
        Boolean state = false;
        if(Schema.getGlobalDescribe().get(apiObj).getDescribe().isDeletable()){
            state = Database.delete(idObj).isSuccess();
        }
        return state;
    }
    
    @AuraEnabled
    public static String getAllPicklistValues(){
        Planner_Tab__c planerTab = Planner_Tab__c.getall().values();
        List<Object> picklistData = new List<Object>();
        List<String> objects = new List<String>{planerTab.Junction_Api_Name__c, planerTab.Name, planerTab.Improvement_Api_Name__c};
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();

        for(String obj:objects){
            String objAPI = obj;
            Schema.sObjectType sobjectType = gd.get(objAPI);
            Schema.DescribeSObjectResult sobjectDescribe = sobjectType.getDescribe();
            Map<String, Schema.SObjectField> fieldMap = sobjectDescribe.fields.getMap();
            for (Schema.SObjectField field : fieldMap.values()) {
                
                DescribeFieldResult fieldDescribe = field.getDescribe();
                if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                    for (Schema.PicklistEntry e : fieldDescribe.getPicklistValues()) {
                        picklistData.add(new Map<String, String>{'value' => e.getValue(), 
                                                                'label' => e.getLabel(), 
                                                                'fieldName' => fieldDescribe.getName(),
                                                                'object' => objAPI});
                    }
                }
            }
        }
        System.debug(JSON.serialize(picklistData));
        return JSON.serialize(picklistData);
    }

    private class PickListWrapper {
        private String label { get; set; }
        private String apiName { get; set; }
        private String color { get; set; }
        private List<PickListWrapper> pickListValues = new List<PickListWrapper>();
        
        public PickListWrapper(String label, String apiName) {
            this.label = label;
            this.apiName = apiName;
        }
    }
}