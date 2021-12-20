({
    

	
   openModel: function(cmp, event, helper) {
      // for Display Model,set the "isOpen" attribute to "true"
      cmp.set("v.isOpen", true);

   },
 
   closeModel: function(cmp, event, helper) {
      // for Hide/Close Model,set the "isOpen" attribute to "Fasle" 
      cmp.set("v.isOpen", false);
   },
    
    update: function(cmp, event, helper) {
        cmp.find("editForm").submit();
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Success!",
            "type": "success",
            "message": "The record has been updated successfully."
        });
        toastEvent.fire();
		
   },
    
   onSuccess: function(cmp, event, helper) {
      $A.get('e.force:refreshView').fire();
   },
    
   handleDeleteRecord: function(cmp, event, helper) {
      let action = cmp.get("c.deleteRecord");
        action.setParams({
            idObj: cmp.get('v.id')
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state == "SUCCESS") {
                let result = response.getReturnValue();
                console.log('result : ', result)
                if(result == true){
                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "type": "success",
                        "message": "The record has been deleted successfully."
                    });
                    toastEvent.fire();
                    cmp.set("v.isOpen", false);
                    $A.get('e.force:refreshView').fire();
                } else {
                    let toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "type": "error",
                        "message": "Unknown Error"
                    });
                    toastEvent.fire();
                }
                        
            }
            else if(state === "ERROR") {
                var errors = response.getError();
                
                 if (errors) {
                     console.log("Error message: " + errors);
                     
                } else {
                    console.log("Unknown error");
                } 
                
            }
        });
    
        $A.enqueueAction(action);
   },
  
})