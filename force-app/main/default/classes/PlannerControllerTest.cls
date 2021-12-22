@isTest
public class PlannerControllerTest {
    
    @TestSetup static void setup(){
        Planner_Tab__c selectedTab = new Planner_Tab__c();
        selectedTab.Name = 'Campaign';
        selectedTab.Object_Name__c = 'Campaign';
        selectedTab.Start_Date_Name__c = 'CreatedDate';
        selectedTab.End_Date_Name__c = 'LastModifiedDate';
        
        selectedTab.ChildObjectApiNameOut__c = 'Contact';
        selectedTab.Child_Object_Name__c = 'Contact';

        selectedTab.Junction_Object_Name__c = 'CampaignMembers';
        selectedTab.Junction_Api_Name__c = 'CampaignMember';

        selectedTab.Improvement_Object_Name__c = 'ChildCampaigns';
        selectedTab.Improvement_Api_Name__c = 'Campaign';

        selectedTab.Selected_Pick_List__c = 'Status';
        selectedTab.Start_Date_Label__c = 'Start DateTime';
        selectedTab.End_Date_Label__c = 'End DateTime';
        selectedTab.Crossed_Color__c = '#177FDA';
        insert selectedTab;

        Profile profileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        
        User usr = new User(LastName = 'LIVESTON',
                          FirstName='JASON',
                          Alias = 'jliv',
                          Email = 'jason.liveston@asdf.com',
                          Username = 'jaDsARQwSVason.liveston@asdf.com',
                          ProfileId = profileId.id,
                          TimeZoneSidKey = 'GMT',
                          LanguageLocaleKey = 'en_US',
                          EmailEncodingKey = 'UTF-8',
                          LocaleSidKey = 'en_US'
                          );
        insert usr;
        Account acc = new Account(Name = 'test');
        DateTime now = DateTime.now();
        DateTime firstDate = DateTime.newInstance(now.year(), now.month(), 1);
        DateTime secondDate = DateTime.newInstance(now.year(), now.month(), 28);
        insert acc;
        Contact con = new Contact();
        con.LastName = 'test';
        con.AccountId = acc.id;
        insert con;

        Campaign camp = new Campaign();
        camp.Name = 'testCampaign';
        camp.OwnerId = usr.Id;
        insert camp;

        Lead lea = new Lead();
        lea.OwnerId = usr.Id;
        lea.FirstName = 'FirstName';
        lea.LastName = 'FirstName';
        lea.Email = 'email@gmail.com';
        lea.Status = 'Working - Contacted';
        lea.Company = 'Test Company';
        insert lea;
        ContactRequest cr = new ContactRequest();
        cr.WhoId = lea.Id;
        insert cr;
        CampaignMember camMemb = new CampaignMember();
        camMemb.CampaignId = camp.Id;
        camMemb.LeadId = lea.Id;
        camMemb.ContactId = con.Id;
        insert camMemb;

        Junction_Setting__c junSett = new Junction_Setting__c();
        junSett.Name = 'Account';
        junSett.PicklistsColors__c = '{"Test_Colors__c":{"Third Color":"#14E4D5","First Color":"#FF0000","Second Color":"#00FF11","Fourth Color":"#00FFE1"}}';
        insert junSett;
         
    }    
    
    @isTest
    public static void getSelectedObjectRecordsTest() {   
    
    DateTime now = DateTime.now();
    DateTime firstDate = DateTime.newInstance(now.year(), now.month(), 1);
    DateTime secondDate = DateTime.newInstance(now.year(), now.month(), 25);
    Test.startTest();
        List<Object> returnedDate = (List<Object>)JSON.deserializeUntyped(PlannerController.getSelectedObjectRecords('Campaign','week','{"_year":'+ Datetime.now().year() +', "countMonth":'+Datetime.now().addMonths(-1).month()+',"_day":'+Datetime.now().day()+'}',''));
    Test.stopTest();
    System.assertEquals(1, returnedDate.size());
    }

    @isTest
    public static void getPickListsTest() {     
    Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
    Schema.DescribeSObjectResult sobjectDescribe = gd.get('Account').getDescribe();
    Map<String, Schema.SObjectField> fieldMap = sobjectDescribe.fields.getMap();
    List<Schema.SObjectField> pickListFields = new List<Schema.SObjectField>();
    for (Schema.SObjectField field : fieldMap.values()) {
        DescribeFieldResult fieldDescribe = field.getDescribe();
        if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
            pickListFields.add(field);
        }
    }
    List<PickListWrapper> planerPickList = (List<PickListWrapper>)JSON.deserializeStrict(PlannerController.getPickLists('Account'), List<PickListWrapper>.class);
    System.assertEquals(pickListFields.size(), planerPickList.size());

    }
    @isTest
    public static void getPickListsEmptyTest() {       
    Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
    Schema.DescribeSObjectResult sobjectDescribe = gd.get('Contact').getDescribe();
    Map<String, Schema.SObjectField> fieldMap = sobjectDescribe.fields.getMap();
    List<Schema.SObjectField> pickListFields = new List<Schema.SObjectField>();
    for (Schema.SObjectField field : fieldMap.values()) {
        DescribeFieldResult fieldDescribe = field.getDescribe();
        if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
            pickListFields.add(field);
        }
    }
    List<PickListWrapper> planerPickList = (List<PickListWrapper>)JSON.deserializeStrict(PlannerController.getPickLists('Contact'), List<PickListWrapper>.class);
    System.assertEquals(pickListFields.size(), planerPickList.size());
    }
    
    @isTest
    public static void saveMixedColorForTabTest() {       
    Test.startTest();
        PlannerController.saveMixedColorForTab('Campaign','#177FDA');
    Test.stopTest();
    Planner_Tab__c pt = Planner_Tab__c.getValues('Campaign');

    System.assertEquals('#177FDA', pt.Crossed_Color__c);

    }

    @isTest
    public static void setMainPickListTest() {  
    Test.startTest();
        PlannerController.setMainPickList('Campaign','Status');
    Test.stopTest();
    Planner_Tab__c pt = Planner_Tab__c.getValues('Campaign');
    System.assertEquals('Status', pt.Selected_Pick_List__c);
    }
    
    @isTest
     public static void getAllPlannerTabsFromCustomSettingsTest() {       
        List<Planner_Tab__c> tabs = PlannerController.getAllPlannerTabsFromCustomSettings();
        System.assertEquals(1, tabs.size());
     }
    
     @isTest
     public static void changePlannerPickListColorTest() {   
        Test.startTest();
            PlannerController.changePlannerPickListColor('Account','test','test','test');
        Test.stopTest();
        List<Junction_Setting__c> jObjList = (List<Junction_Setting__c>) Database.query('SELECT id, PicklistsColors__c FROM Junction_Setting__c WHERE Name =\'Account\' WITH SECURITY_ENFORCED LIMIT 1');
        Map<String, Object> pickColors = (Map<String, Object>) JSON.deserializeUntyped(jObjList[0].PicklistsColors__c);
        System.assertEquals(true, pickColors.containsKey('test'));
     }
     @isTest
     public static void changePlannerPickListColorElseTest() {   
        Test.startTest();
            PlannerController.changePlannerPickListColor('test','test','test','test');
        Test.stopTest();
        List<Junction_Setting__c> jObjList = (List<Junction_Setting__c>) Database.query('SELECT id, PicklistsColors__c FROM Junction_Setting__c WHERE Name =\'test\' WITH SECURITY_ENFORCED LIMIT 1');
        Map<String, Object> pickColors = (Map<String, Object>) JSON.deserializeUntyped(jObjList[0].PicklistsColors__c);
        System.assertEquals(true, pickColors.containsKey('test'));
     }
     @isTest
     public static void changePlannerPickListColorContactTest() {       
         Test.startTest();
            PlannerController.changePlannerPickListColor('Account','test','test','test');
        Test.stopTest();
        List<Junction_Setting__c> jObjList = (List<Junction_Setting__c>) Database.query('SELECT id, PicklistsColors__c FROM Junction_Setting__c WHERE Name =\'Account\' WITH SECURITY_ENFORCED LIMIT 1');
        Map<String, Object> pickColors = (Map<String, Object>) JSON.deserializeUntyped(jObjList[0].PicklistsColors__c);
        System.assertEquals(true, pickColors.containsKey('test'));
     }
     @isTest
     public static void deleteRecordTest(){
        Account acc = [SELECT Id FROM Account WHERE Name='test' LIMIT 1];
        Boolean state = PlannerController.deleteRecord(acc.id);
        List<Account> del = [SELECT Id FROM Account WHERE Name='test' LIMIT 1];
        System.assertEquals(0, del.size());
     }

     @isTest
     public static void getAllPicklistValuesTest(){
        List<Object> pickListEntry = (List<Object>)JSON.deserializeUntyped(PlannerController.getAllPicklistValues());
        System.assert(pickListEntry.size() > 0);
     }
     @isTest
     public static void getJunctionSettingsTest(){
        Junction_Setting__c junSett = [SELECT Id, PicklistsColors__c FROM Junction_Setting__c WHERE Name='Account' LIMIT 1];
        String color = PlannerController.getJunctionSettings();
        System.assertEquals(junSett.PicklistsColors__c, color);
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