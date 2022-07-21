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
  
  
  export const allSteps: ITaskItem[] = [];

  interface SchemaInterface {
    step: string,
    title: string,
    type: string
   }

   let isSchemaReady = GetSchema()
  
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

async function Schema(){
  const data = await RetrieveResponses()
  const cleanedResponses = data.replace(/(<([^>]+)>)/ig, ""); 
  //second clean for reinsert of quotes
  const cleanedResponses2 = cleanedResponses.replace(/&quot;/g, '"'); 
  let parsedData = JSON.parse(cleanedResponses2)
  for(let item of parsedData){
    //console.log(item)
    allSteps.push({step: item.step, name: item.title, type: item.type})
  }
  return true
}
 export const mySchemaItemsStatus = isSchemaReady;
  