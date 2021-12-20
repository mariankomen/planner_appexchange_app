public class PlannerConfiguration {
  private static final String MISSING_LABEL = 'MISSING LABEL';
  private static List<String> standartLookups = new List<String>{ 'OwnerId', 'CreatedById', 'LastModifiedById' };

  @AuraEnabled
  public static Map<String, String> getAllObjects() {
    Map<String, Schema.SObjectType> allsObjects = Schema.getGlobalDescribe();
    Map<String, String> sObjectListofOrg = new Map<String, String>();
    List<String> plannerTabs = getAllPlannerTabsFromCustomSettings();
    System.debug('plannerTabs '+plannerTabs);
    for (Schema.SObjectType sObjectName : allsObjects.values()) {
      Map<String, Schema.SObjectField> mfields = sObjectName.getDescribe().fields.getMap();
      // System.debug('mfields: '+mfields);
      if (
        mfields.get('Name') != null &&
        !sObjectName.getDescribe().getLabel().contains(MISSING_LABEL) &&
        !plannerTabs.contains(sObjectName.getDescribe().getLabel())
      ) {
        sObjectListofOrg.put( sObjectName.getDescribe().getName(), sObjectName.getDescribe().getLabel());
      }
    }
    System.debug(JSON.serialize(sObjectListofOrg));

    return sObjectListofOrg;
  }

  @AuraEnabled
  public static List<ReferencedObject> getAllJunctions(String selectedObject) {
    List<ReferencedObject> objectRelationshipMap = new List<ReferencedObject>();
    Schema.SObjectType objType = Schema.getGlobalDescribe().get(selectedObject);
    List<Schema.ChildRelationship> childRelationshipList = objType.getDescribe().getChildRelationships();
    for (Schema.ChildRelationship child : childRelationshipList) {
      SObjectType childType = child.getChildSObject();
      Map<String, Schema.SObjectField> childFields = childType.getDescribe().fields.getMap();
      for (String fieldName : childFields.keySet()) {
        Schema.DescribeFieldResult fieldDescribe = childFields.get(fieldName).getDescribe();
        if (fieldDescribe.getType() == Schema.DisplayType.Reference && !standartLookups.contains(fieldDescribe.getName())) {
          String childObjectName = String.valueof(child.getChildSObject());
          String relationshipName = child.getRelationshipName();
          String childFieldToken = String.valueOf(child.getChildSObject().getDescribe().getLabel());
            if(relationshipName != null){
                     objectRelationshipMap.add(new ReferencedObject(childObjectName + ' (' + childFieldToken + ')', relationshipName, childObjectName));
            }
          break;
        }
      }
    }
    return objectRelationshipMap;
  }

  @AuraEnabled
  public static List<ReferencedObject> getAllReferenceFields(String selectedObject) {
    List<ReferencedObject> objectRelationshipMap = new List<ReferencedObject>();
    List<Schema.ChildRelationship> childRelationshipList = Schema.getGlobalDescribe().get(selectedObject).getDescribe().getChildRelationships();

    for (Schema.ChildRelationship child : childRelationshipList) {
      String childObjectName = String.valueof(child.getChildSObject());
      String relationshipName = child.getRelationshipName();
      String childFieldToken = String.valueOf(child.getField().getDescribe().getLabel());
      SObjectType accountType = Schema.getGlobalDescribe().get(childObjectName);
      Map<String, Schema.SObjectField> mfields = accountType.getDescribe().fields.getMap();
      if (relationshipName != null && mfields.get('Name') != null) {
        objectRelationshipMap.add(new ReferencedObject(childObjectName + ' (' + childFieldToken + ')', relationshipName, childObjectName));
      }
    }
    return objectRelationshipMap;
  }

  @AuraEnabled
  public static List<ReferencedObject> getAllJunctionRelateObjects(String selectedObject) {
    List<ReferencedObject> objectRelationshipMap = new List<ReferencedObject>();
    Schema.SObjectType objType = Schema.getGlobalDescribe().get(selectedObject);
    Map<String, Schema.SObjectField> fieldMap = objType.getDescribe().fields.getMap();
    for (String fieldName : fieldMap.keySet()) {
      Schema.DisplayType fielddataType = fieldMap.get(fieldName).getDescribe().getType();
      if (fielddataType == Schema.DisplayType.Reference) {
        Schema.sObjectType referenceField = fieldMap.get(fieldName).getDescribe().getReferenceTo()[0];
        String relationshipName = fieldMap.get(fieldName).getDescribe().getRelationshipName();
        String childObjectName = String.valueof(fieldMap.get(fieldName).getDescribe().getReferenceTo()[0].getDescribe().getName());
        String childFieldToken = String.valueOf(fieldMap.get(fieldName).getDescribe().getLabel());
        objectRelationshipMap.add(new ReferencedObject(childObjectName + ' (' + childFieldToken + ')', relationshipName, childObjectName));
      }
    }
    return objectRelationshipMap;
  }

  @AuraEnabled
  public static List<ReferencedObject> getAllImprovementObjects(String selectedObject) {
    List<ReferencedObject> listForReturn = new List<ReferencedObject>();
    for(Schema.ChildRelationship cr : Schema.getGlobalDescribe().get(selectedObject).getDescribe().getChildRelationships()) {
      if(cr.getRelationshipName() != null) {
        listForReturn.add(new ReferencedObject(cr.getChildSObject().getDescribe().getLabel(),
                                               cr.getRelationshipName(),
                                               cr.getChildSObject().getDescribe().getName()));
      }
    }
    return listForReturn;
  }

  @AuraEnabled
  public static Map<String, String> getAllFieldsBySelectedObject(String selectedObject) {
    Map<String, String> reqFields = new Map<String, String>();
    Map<String, Schema.SObjectField> allFields = Schema.getGlobalDescribe().get(selectedObject).getDescribe().fields.getMap();

    for (String fieldName : allFields.keySet()) {
      Schema.SObjectField field = allFields.get(fieldName);

      if (
        field.getDescribe().getType() == Schema.DisplayType.DateTime ||
        field.getDescribe().getType() == Schema.DisplayType.Integer ||
        field.getDescribe().getType() == Schema.DisplayType.Date
      ) {
        reqFields.put(field.getDescribe().getLabel(), field.getDescribe().getName());
      }
    }

    return reqFields;
  }

  @AuraEnabled
  public static void save(String request) {
    PlannerCustomSetting planner = (PlannerCustomSetting) System.JSON.deserialize(request, PlannerCustomSetting.class);
    Planner_Tab__c setting = new Planner_Tab__c();

    if( Schema.sObjectType.Planner_Tab__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Name.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Object_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Start_Date_Label__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Start_Date_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.End_Date_Label__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.End_Date_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Child_Object_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.ChildObjectApiNameOut__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Junction_Object_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Junction_Api_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Improvement_Object_Name__c.isCreateable()
        && Schema.sObjectType.Planner_Tab__c.fields.Improvement_Api_Name__c.isCreateable()
     ){
      setting.Name = planner.name;
      setting.Object_Name__c = planner.objectName;
      setting.Start_Date_Label__c = planner.startFieldDateApiLabel;
      setting.Start_Date_Name__c = planner.startFieldDateApiName;
      setting.End_Date_Label__c = planner.endFieldDateApiLabel;
      setting.End_Date_Name__c = planner.endFieldDateApiName;
      setting.Child_Object_Name__c = planner.childObjectName;
      setting.ChildObjectApiNameOut__c = planner.childObjectNameOut;
      setting.Junction_Object_Name__c = planner.junctionObjectName; 
      setting.Junction_Api_Name__c = planner.junctionApiName;
      setting.Improvement_Object_Name__c = planner.improvementObjectName; 
      setting.Improvement_Api_Name__c = planner.improvementApiName;
      insert setting;
    }
    
  }

  @TestVisible
  private static List<String> getAllPlannerTabsFromCustomSettings() {
    List<String> plannerTabs = new List<String>();
    List<Planner_Tab__c> tabs = Planner_Tab__c.getall().values();
    for (Planner_Tab__c tab : tabs) {
      plannerTabs.add(tab.Name);
    }
    return plannerTabs;
  }

  public class ReferencedObject {
    @AuraEnabled
    public String label;
    @AuraEnabled
    public String apiFieldName;
    @AuraEnabled
    public String apiObjectName;

    public ReferencedObject(String label, String apiFieldName, String apiObjectName) {
      this.label = label;
      this.apiFieldName = apiFieldName;
      this.apiObjectName = apiObjectName;
    }
  }
}