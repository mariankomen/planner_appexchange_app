import { LightningElement, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAllObjects from "@salesforce/apex/PlannerConfiguration.getAllObjects";
import getAllFields from "@salesforce/apex/PlannerConfiguration.getAllFieldsBySelectedObject";
import getAllReferenceFields from "@salesforce/apex/PlannerConfiguration.getAllReferenceFields";
import getAllJunctions from "@salesforce/apex/PlannerConfiguration.getAllJunctions";
import getAllJunctionRelateObjects from "@salesforce/apex/PlannerConfiguration.getAllJunctionRelateObjects";
import getAllImprovementObjects from "@salesforce/apex/PlannerConfiguration.getAllImprovementObjects";
import savePlannerTab from "@salesforce/apex/PlannerConfiguration.save";
const RELATIONSHIPS = [{ name: "Many-To-Many" }];
export default class PlannerConfiguration extends LightningElement {
  //TODO: check parse and stringify implementation
  @track allObjects = [];
  @track allJunctionObjects = [];
  @track allJunctionRelatedObjects = [];
  @track allImprovementObjects = [];
  @track allFields = [];
  allFieldsCopy = [];
  @track allReferenceFields = [];

  @track allFilteredObjects = [];
  @track allFilteredJunctionObjects = [];
  @track allFilteredJunctionRelatedObjects = [];
  @track allFilteredImprovementObjects = [];
  @track allFilteredFields = [];
  @track allFilteredRefernceFields = [];
  @track allRelationShipTypes = RELATIONSHIPS;

  selectedObjects = [];
  selectedFields = [];
  selectedObject = null;
  selectedObjectForManyToMany = null;
  selectedParentObject = null;
  selectedReferenceField = null;
  selectedReferenceObjectName = null;
  selectedFirstField = null;
  selectedSecondField = null;
  selectedRelationship = null;
  selectedJunction = null;
  selectedJunctionRelatedObject = null;
  selectedImprovementObject = null;
  objectsLoaded = false;
  step = "step-0";

  objectSection = true;
  fieldReferenceSection = false;
  firstFieldSection = false;
  secondFieldSection = false;
  relationshipSection = false;
  junctionSection = false;
  junctionRelatedObjectSection = false;
  improvementObjectSection = false;

  connectedCallback() {
    getAllObjects().then((response) => {
      let listOfObjects = JSON.parse(JSON.stringify(response));
      if (listOfObjects) {
        this.allObjects = [];
        for (let obj in listOfObjects) {
          if(!obj.includes('__ChangeEvent')){
            this.allObjects.push({ label: listOfObjects[obj], value: false, name: obj, labelApi: listOfObjects[obj]+' ('+obj+')' });
          }
        }
      }
      this.allObjects.sort(function(a,b){
        let first = a.label.toUpperCase()
        let second = b.label.toUpperCase()
        return (first < second) ? -1 : (first > second) ? 1 : 0
      })
      this.allFilteredObjects = this.allObjects;
      this.objectsLoaded = true;
    });
  }

  handleObjectFiltering(event) {
    this.allFilteredObjects = this.allObjects.filter((x) => x.label.toLowerCase().includes(event.target.value.toLowerCase()));
  }

  handleJunctionObjectFiltering(event) {
    try{
      let arr = [];
      for(let char of this.allJunctionObjects){
        let index = arr.findIndex(el => el["label"] == char["label"])
        if(index == -1){
            arr.push(char)
        }
      }
      this.allFilteredJunctionObjects = arr.filter((x) => x.label.toLowerCase().includes(event.target.value.toLowerCase()))
    } catch(e){
      console.error('EXPECTOPN: ',e)
    }
  }

  handleJunctionRelateedObjectFiltering(event) {
    try{
      this.allFilteredJunctionRelatedObjects = this.allJunctionRelatedObjects.filter((x) => x.label.toLowerCase().includes(event.target.value.toLowerCase()));
      
    } catch(e){
      console.error('EXPECTOPN: ',e)
    }
  }

  handleImprovementObjectFiltering(event) {
    try{
      let arr = [];
      for(let char of this.allImprovementObjects){
        let index = arr.findIndex(el => el["label"] == char["label"])
        if(index == -1){
            arr.push(char)
        }
      }
      this.allFilteredImprovementObjects = arr.filter((x) => x.label.toLowerCase().includes(event.target.value.toLowerCase()))
    } catch(e){
      console.error('EXPECTOPN: ',e)
    }
  }

  handleRefenceFieldFiltering(event) {
    this.allFilteredRefernceFields = this.allReferenceFields.filter((x) => x.label.toLowerCase().includes(event.target.value.toLowerCase()));
  }

  handleFieldsFiltering(event) {
    this.allFilteredFields = this.allFields.filter((x) => x.label.toLowerCase().includes(event.target.value.toLowerCase()));
  }
  // FILTERING ISSUE
    handleSelectedObjects(event) {
      if (!event.target.value) {
        return;
      }

      if (this.selectedObject != null) {
        this.allObjects.find((x) => x.name === this.selectedObject).value = false;
      }
      this.selectedObject = event.target.value;
      this.allFilteredObjects.find((x) => x.name === event.target.value).value = true;
  }

  handleSelectedRefenceField(event) {
    this.selectedReferenceObjectName = this.allReferenceFields.find((x) => x.name === event.target.value).object;
    if (event.target.value == 0) {
      return;
    }

    if (this.selectedReferenceField != null) {
      this.allReferenceFields.find((x) => x.name === this.selectedReferenceField).value = false;
    }
    this.selectedReferenceField = event.target.value;
    this.allReferenceFields.find((x) => x.name === event.target.value).value = true;
  }

  handleSelectedFirstField(event) {
    if (event.target.value == 0) {
      return;
    }

    if (this.selectedFirstField != null) {
      this.allFields.find((x) => x.name === this.selectedFirstField).value = false;
    }

    this.selectedFirstField = event.target.value;
    this.allFields.find((x) => x.name === event.target.value).value = true;
  }

  handleSelectedSecondField(event) {
    if (event.target.value == 0) {
      return;
    }
    this.allFilteredFields = [...this.allFieldsCopy]
    if (this.selectedSecondField != null) {
      this.allFilteredFields.find((x) => x.name === this.selectedSecondField).value = false;
    }

    this.selectedSecondField = event.target.value;
  }
  // !!!!fix it terminal!!!!
  handleSelectedRelationship(event) {
    if (!event.target.value) {
      return;
    }
    if (this.selectedRelationship != null) {
      this.allRelationShipTypes.find((x) => x.name === this.selectedRelationship).value = false;
    }
    this.selectedRelationship = event.target.value;
    this.allRelationShipTypes.find((x) => x.name === event.target.value).value = true;
  }

  handleSelectedJunctionObjects(event) {
    if (!event.target.value) {
      return;
    }
    if (this.selectedJunction != null) {
      this.allJunctionObjects.find((x) => x.name === this.selectedJunction).value = false;
    }
    this.selectedJunction = event.target.value;
    this.allFilteredJunctionObjects.find((x) => x.name === event.target.value).value = true;
  }

  handleSelectedJunctionRelatedObjects(event) {
    if (!event.target.value) {
      return;
    }
    if (this.selectedJunctionRelatedObject != null) {
      this.allJunctionRelatedObjects.find((x) => x.name === this.selectedJunctionRelatedObject).value = false;
    }
    this.selectedJunctionRelatedObject = event.target.value;
    this.allFilteredJunctionRelatedObjects.find((x) => x.name === event.target.value).value = true;
  }

  handleSelectedImprovementObjects(event) {
    if (!event.target.value) {
      return;
    }
    if (this.selectedImprovementObject != null) {
      this.allImprovementObjects.find((x) => x.name === this.selectedImprovementObject).value = false;
    }
    this.selectedImprovementObject = event.target.value;
    this.allFilteredImprovementObjects.find((x) => x.name === event.target.value).value = true;
    
  }

  handleFinish() {
    if (this.selectedSecondField == null) {
      const evt = new ShowToastEvent({
        title: "You need to choose at least on field",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return;
    }

    //TODO: figure out better way to implement that
    let plannerInfo = {
      name: this.selectedObject,
      objectName: this.allObjects.find((x) => x.name === this.selectedObject).label,
      startFieldDateApiLabel: this.allFilteredFields.find((x) => x.name === this.selectedFirstField).label,
      startFieldDateApiName: this.selectedFirstField,
      endFieldDateApiLabel: this.allFilteredFields.find((x) => x.name === this.selectedSecondField).label,
      endFieldDateApiName: this.selectedSecondField,
      childObjectName: this.selectedRelationship == "Many-To-Many" ? this.selectedJunctionRelatedObject : this.selectedReferenceObjectName,
      childObjectNameOut:
        this.selectedRelationship == "Many-To-Many"
          ? this.allJunctionRelatedObjects.find((x) => x.name === this.selectedJunctionRelatedObject).object
          : this.allReferenceFields.find((e) => e.object == this.selectedReferenceObjectName).name,
      junctionObjectName: this.selectedJunction,
      junctionApiName: this.allJunctionObjects.find((x) => x.name === this.selectedJunction).object,
      improvementObjectName: this.selectedImprovementObject,
      improvementApiName: this.allImprovementObjects.find((x) => x.name === this.selectedImprovementObject).object
    };
    savePlannerTab({ request: JSON.stringify(plannerInfo) })
      .then((response) => {
        const evt = new ShowToastEvent({
          title: "New Tab was saved",
          variant: "success"
        });
        this.dispatchEvent(evt);

        setTimeout(function () {
          document.location.reload(true);
        }, 3000);
      })
      .catch((error) => {
        const evt = new ShowToastEvent({
          title: "This Tab already exist",
          variant: "error"
        });
        this.dispatchEvent(evt);
      });
  }

  goToFieldrelationshipSection() {
    this.junctionSection = false;
    this.objectSection = false;
    this.fieldReferenceSection = false;
    this.firstFieldSection = false;
    this.secondFieldSection = false;
    this.relationshipSection = true;
  }

  goToFieldReferenceSection() {
    if (this.selectedObject == null) {
      const evt = new ShowToastEvent({
        title: "You need to choose one object",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return;
    }
    return getAllReferenceFields({ selectedObject: this.selectedObject });
  }

  //TODO: improve performance wiring this method
  goToFirstFieldSection() {
    if (this.selectedObject == null) {
      const evt = new ShowToastEvent({
        title: "You need to choose one field",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return;
    }
    let objectToGetFieldsFrom =
      this.selectedRelationship == "Many-To-Many"
        ? this.allJunctionObjects.find((e) => e.name == this.selectedJunction).object
        : this.selectedReferenceObjectName;
    getAllFields({ selectedObject: objectToGetFieldsFrom })
      .then((response) => {
        let listOfFields = JSON.parse(JSON.stringify(response));
        if (listOfFields) {
          this.allFields = [];
          //TODO: check what happens if list will be empty
          for (let field in listOfFields) {
            this.allFields.push({label: field,
                                 value: false,
                                 name: listOfFields[field],
                                 labelApi: field+' ('+listOfFields[field]+')'
                                });
          }

          if (this.allFields.length < 2) {
            const evt = new ShowToastEvent({
              title: "Current object cannot be used in Planner",
              variant: "error"
            });
            this.dispatchEvent(evt);
            return;
          }

          this.allFields.sort(function(a,b){
            let first = a.label.toUpperCase()
            let second = b.label.toUpperCase()
            return (first < second) ? -1 : (first > second) ? 1 : 0
          })
          this.allFieldsCopy = JSON.parse(JSON.stringify(this.allFields));
          this.allFilteredFields = this.allFields;

          this.objectSection = false;
          this.fieldReferenceSection = false;
          this.firstFieldSection = true;
          this.secondFieldSection = false;
          this.junctionRelatedObjectSection = false;
          this.improvementObjectSection = false;
          this.relationshipSection = false;
        }
      })
      .catch((error) => {
        console.log("error " + JSON.stringify(error));
      });
      
  }

  //TODO: change name of this method
  goToFirstFieldAfterSecond() {
    this.objectSection = false;
    this.fieldReferenceSection = false;
    this.firstFieldSection = true;
    this.secondFieldSection = false;
    this.relationshipSection = false;
    this.allFilteredFields.find((x) => x.name === this.selectedFirstField).value = true;
    this.allFilteredFields.find((x) => x.name === this.selectedSecondField).value = false;
  }

  goToSecondFieldSection() {
    for(let i = 0; i<this.allFilteredFields.length; i++){
      this.allFilteredFields[i].value = false
    }
    if (this.selectedFirstField == null) {
      const evt = new ShowToastEvent({
        title: "You need to choose at least one field",
        variant: "error"
      });
      this.dispatchEvent(evt);
      return;
    }

    this.objectSection = false;
    this.fieldReferenceSection = false;
    this.firstFieldSection = false;
    this.secondFieldSection = true;
    this.relationshipSection = false;

    this.allFilteredFields.find((x) => x.name === this.selectedFirstField).value = false;
    this.allFilteredFields.find((x) => x.name === this.selectedSecondField).value = true;
  }

  goToObjects() {
    this.objectSection = true;
    this.fieldReferenceSection = false;
    this.firstFieldSection = false;
    this.secondFieldSection = false;
    this.relationshipSection = false;
  }

  goToJunctionRelateObjectsSection(event) {
    getAllJunctionRelateObjects({
      selectedObject: this.allJunctionObjects.find((e) => e.name == this.selectedJunction).object
    })
      .then((response) => {
        let listOfObjects = JSON.parse(JSON.stringify(response));
        if (listOfObjects) {
          this.allJunctionRelatedObjects = [];
          listOfObjects.forEach((x) => {
            this.allJunctionRelatedObjects.push({
              label: x.label,
              value: false,
              name: x.apiFieldName,
              object: x.apiObjectName,
              labelApi: x.label + ' (' + x.apiObjectName + ')'
            });
          });
        }
        this.allFilteredJunctionRelatedObjects = this.allJunctionRelatedObjects;
        this.objectsLoaded = true;
        this.junctionRelatedObjectSection = true;
        this.improvementObjectSection = false;
        this.junctionSection = false;
        this.objectSection = false;
        this.fieldReferenceSection = false;
        this.firstFieldSection = false;
        this.secondFieldSection = false;
        this.relationshipSection = false;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  goToImprovementObjectsSection(event) {
    getAllImprovementObjects({
      selectedObject: this.selectedObject
    })
      .then((response) => {
        let listOfObjects = JSON.parse(JSON.stringify(response));
        if (listOfObjects) {
          this.allImprovementObjects = [];
          listOfObjects.forEach((x) => {
            this.allImprovementObjects.push({
              label: x.label,
              value: false,
              name: x.apiFieldName,
              object: x.apiObjectName,
              labelApi: x.label + ' (' + x.apiObjectName + ')'

            });
          });
        }
        this.allImprovementObjects.sort(function(a,b){
          let first = a.label.toUpperCase()
          let second = b.label.toUpperCase()
          return (first < second) ? -1 : (first > second) ? 1 : 0
        })
        this.allFilteredImprovementObjects = this.allImprovementObjects;
        this.objectsLoaded = true;
        this.junctionRelatedObjectSection = false;
        this.improvementObjectSection = true;
        this.junctionSection = false;
        this.objectSection = false;
        this.fieldReferenceSection = false;
        this.firstFieldSection = false;
        this.secondFieldSection = false;
        this.relationshipSection = false;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  goToObjcetSelectionByTypeOfRelationship() {
    this.objectsLoaded = false;
    if (this.selectedRelationship == "One-To-Many") {
      this.goToFieldReferenceSection()
        .then((response) => {
          let listOfFields = JSON.parse(JSON.stringify(response));
          if (listOfFields) {
            this.allReferenceFields = [];
            listOfFields.forEach((x) => console.log(JSON.stringify(x)));
            listOfFields.forEach((x) => {
              this.allReferenceFields.push({
                label: x.label,
                value: false,
                name: x.apiFieldName,
                object: x.apiObjectName,
                labelApi: x.label + ' (' + x.apiObjectName + ')'
              });
            });

            if (this.allReferenceFields.length < 2) {
              const evt = new ShowToastEvent({
                title: "Current object cannot be used in Planner",
                variant: "error"
              });
              this.dispatchEvent(evt);
              this.objectsLoaded = true;
              return;
            }

            this.allFilteredRefernceFields = this.allReferenceFields;
            this.objectSection = false;
            this.fieldReferenceSection = true;
            this.firstFieldSection = false;
            this.junctionSection = false;
            this.secondFieldSection = false;
            this.relationshipSection = false;
            this.objectsLoaded = true;
          }
        })
        .catch((error) => {
          this.objectsLoaded = true;
          console.log("error " + JSON.stringify(error));
        });
    }
    if (this.selectedRelationship == "Many-To-Many") {
      this.loadJunctions()
        .then((response) => {
          let listOfObjects = JSON.parse(JSON.stringify(response));
          if (listOfObjects) {
            this.allJunctionObjects = [];
            let id = 0
            listOfObjects.forEach((x) => {
              this.allJunctionObjects.push({
                label: x.label,
                value: false,
                name: x.apiFieldName,
                object: x.apiObjectName,
                labelApi: x.apiFieldName + ' (' + x.apiObjectName + ')',
                id: id
              });
              id++
            });
          }
          this.allFilteredJunctionObjects = this.allJunctionObjects;
          this.objectsLoaded = true;
          this.junctionSection = true;
          this.objectSection = false;
          this.fieldReferenceSection = false;
          this.firstFieldSection = false;
          this.secondFieldSection = false;
          this.relationshipSection = false;
          this.junctionRelatedObjectSection = false;
          this.improvementObjectSection = false;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  loadJunctions() {
    return getAllJunctions({ selectedObject: this.selectedObject });
  }

  closeModal() {
    //document.location.reload(true);
    const objContact = { closeModal: false };
    const evtSelectContact = new CustomEvent("closemodal", { detail: objContact });
    this.dispatchEvent(evtSelectContact);
  }
}