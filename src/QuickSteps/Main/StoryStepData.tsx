import { getClient } from "azure-devops-extension-api";
import {
  IWorkItemFormService,
  WorkItemExpand,
  WorkItemTrackingRestClient,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";

export interface ITaskItem {
    step: string;
    name: string;
    type: string;
  }
  export interface IResponseItem<T = {}> {
    step: string;
    status: string;
  }
  
  

  interface SchemaInterface {
    step: string,
    title: string,
    type: string
   }

let isSchemaReady = GetSchema()
let myscSchemaItems = schemaItems()
  
async function GetSchema() {
  let response = await Schema()
  return response
}
async function RetrieveResponses(){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService)
        let currentSteps = (await workItemFormService.getFieldValue("Custom.MSQuickStepSchema")).toString();
          return currentSteps
}

async function schemaItems(){
let results = await Schema()
return results
}

async function Schema(){
  let placeholder = new Array<ITaskItem>();
  const data = await RetrieveResponses()
  const cleanedResponses = data.replace(/(<([^>]+)>)/ig, ""); 
  //second clean for reinsert of quotes
  const cleanedResponses2 = cleanedResponses.replace(/&quot;/g, '"'); 
  let parsedData = JSON.parse(cleanedResponses2)
  for(let item of parsedData){
    //console.log(item)
    // allSteps.push({step: item.step, name: item.title, type: item.type})
    placeholder.push({step: item.step, name: item.title, type: item.type})
  }
  return placeholder
}
 export const mySchemaItemsStatus = isSchemaReady;
 export const allSteps = myscSchemaItems
  