@isTest public class PlannerConfigurationTest {
    
    @TestSetup
    static void makeData(){
        Planner_Tab__c selectedTab = new Planner_Tab__c();
        selectedTab.Name = 'Account';
        selectedTab.Object_Name__c = 'Account';
        selectedTab.Child_Object_Name__c = 'Contact';
        selectedTab.Start_Date_Name__c = 'CreatedDate';
        selectedTab.End_Date_Name__c = 'LastModifiedDate';
        selectedTab.Object_Name__c = 'Account';
        selectedTab.ChildObjectApiNameOut__c = 'Contacts';
        selectedTab.Improvement_Object_Name__c = 'Account';
    }


    @isTest static void getAllObjectsTest(){
        Map<String, String> allObj = PlannerConfiguration.getAllObjects();
        System.assert(0 < allObj.size());
    }
    
   @isTest static void getAllJunctionsTest(){
        List<PlannerConfiguration.ReferencedObject> allJunc = PlannerConfiguration.getAllJunctions('Account');
        System.assert(0 < allJunc.size());
    }
    
     @isTest static void getAllReferenceFieldsTest(){
        List<PlannerConfiguration.ReferencedObject> allObj = PlannerConfiguration.getAllReferenceFields('Account');
        System.assert(0 < allObj.size());
    }

    @isTest static void getAllJunctionRelateObjectsTest(){
        
        List<PlannerConfiguration.ReferencedObject> allObj = PlannerConfiguration.getAllJunctionRelateObjects('Account');
        System.assert(0 < allObj.size());
    }    
    
     @isTest static void getAllFieldsBySelectedObjectTest(){
        Map<String, String> allObj = PlannerConfiguration.getAllFieldsBySelectedObject('Account');
        System.assert(0 < allObj.size());
    }  
    
    
     @isTest static void getAllPlannerTabsFromCustomSettingsTest(){
        List<String> plannerTabs = PlannerConfiguration.getAllPlannerTabsFromCustomSettings();
        List<Planner_Tab__c> tabs = Planner_Tab__c.getall().values();
        System.assertEquals(tabs.size(), plannerTabs.size());
    }  

  @isTest static void saveTest(){
        PlannerCustomSetting cs = new PlannerCustomSetting('test','test','test','test','test','test');
        PlannerCustomSetting cs1= new PlannerCustomSetting('test','test','test','test','test','test','test','test','test','test','test','test');
        Test.startTest();
            PlannerConfiguration.save('{"name":"test"}');
        Test.stopTest();
        Planner_Tab__c pt = Planner_Tab__c.getValues('test');
        System.assertEquals('test', pt.Name);
    }      
    
    
}