import { getClient } from "azure-devops-extension-api";
import {
  IWorkItemFormService,
  WorkItemExpand,
  WorkItemTrackingRestClient,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";
import { Project } from "./CurrentProject";

export interface ITaskItem {
  step: string;
  name: string;
  type: string;
}

export interface ITaskItemLimited {
  name: string;
  type: string;
}

interface SchemaInterface {
  step: string,
  title: string,
  type: string
 }

export const allSchemaItems: SchemaInterface[] = []

let isSchemaReady = GetSchema()
  
async function GetSchema() {
  let response = await Schema()
  return response
}
async function RetrieveResponses(){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      );
      // const organization = await SDK.getHost()
      // const project = await Project
      const client = getClient(WorkItemTrackingRestClient);
      let relations = await workItemFormService.getWorkItemRelations();
      for (let item of relations){
        console.log("Attributes: "+item.attributes+" ||| Link Type: "+item.rel+" ||| URL: "+item.url)
        if(item.rel == "System.LinkTypes.Hierarchy-Reverse"){
          //Get the id from end of string
          var matches : number;
          matches = parseInt(item.url.match(/\d+$/)?.toString()||"")
          console.log(matches);
          client.getWorkItemTypeFieldsWithReferences
          let workitem = client.getWorkItem(matches, undefined, undefined, new Date(), WorkItemExpand.Relations)
          let schemaString = (await workitem).fields["Custom.MSQuickStepSchema"]
          return schemaString
  }
}
    }
async function Schema(){
  const data = await RetrieveResponses()
  const cleanedResponses = data.replace(/(<([^>]+)>)/ig, ""); 
  //second clean for reinsert of quotes
  const cleanedResponses2 = cleanedResponses.replace(/&quot;/g, '"'); 
  let parsedData = JSON.parse(cleanedResponses2)
  for(let item of parsedData){
    //console.log(item)
    allSchemaItems.push({step: item.step, title: item.title, type: item.type})
  }
  return true
}
 export const mySchemaItemsStatus = isSchemaReady;
