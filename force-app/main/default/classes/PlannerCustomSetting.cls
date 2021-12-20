public class PlannerCustomSetting {
  public String childObjectName;
  public String childObjectNameOut;
  public String name { get; set; }
  public String objectName { get; set; }
  public String startFieldDateApiLabel { get; set; }
  public String startFieldDateApiName { get; set; } 
  public String endFieldDateApiLabel { get; set; }
  public String endFieldDateApiName { get; set; }
  public String junctionObjectName { get; set; }
  public String junctionApiName { get; set; }
  public String improvementObjectName { get; set; }
  public String improvementApiName { get; set; }


  public PlannerCustomSetting(
    String name,
    String objectName,
    String startFieldDateApiLabel,
    String startFieldDateApiName,
    String endFieldDateApiLabel,
    String endFieldDateApiName
    
  ) {
    this.name = name;
    this.objectName = objectName;
    this.startFieldDateApiLabel = startFieldDateApiLabel;
    this.startFieldDateApiName = startFieldDateApiName;
    this.endFieldDateApiLabel = endFieldDateApiLabel;
    this.endFieldDateApiName = endFieldDateApiName;
  }

  public PlannerCustomSetting(
    String childObjectNameOut,
    String childObjectName,
    String name,
    String objectName,
    String startFieldDateApiLabel,
    String startFieldDateApiName,
    String endFieldDateApiLabel,
    String endFieldDateApiName,
    String junctionObjectName,
    String junctionApiName,
    String improvementObjectName,
    String improvementApiName
  ) {
    this.junctionObjectName = junctionObjectName;
    this.improvementObjectName = improvementObjectName;
    this.childObjectNameOut = childObjectNameOut;
    this.name = name;
    this.objectName = objectName;
    this.startFieldDateApiLabel = startFieldDateApiLabel;
    this.startFieldDateApiName = startFieldDateApiName;
    this.endFieldDateApiLabel = endFieldDateApiLabel;
    this.endFieldDateApiName = endFieldDateApiName;
    this.childObjectName = childObjectName;
  }
}