import { RestClientBase } from "azure-devops-extension-api/Common/RestClientBase";
import {
    IWorkItemFormService,
    QueryBatchGetRequest,
    QueryHierarchyItem,
    WorkItemReference,
    WorkItemTrackingServiceIds,
  } from "azure-devops-extension-api/WorkItemTracking";
import { WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingClient";
import { WorkItem, WorkItemBatchGetRequest, WorkItemQueryResult } from "azure-devops-extension-api/WorkItemTracking/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";
import { ProjectInfo } from "azure-devops-node-api/interfaces/CoreInterfaces";
// import { IWorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
// import { IVssRestClientOptions } from "azure-devops-extension-api/Common/Context";
// import { VssConnection } from "VSS/Service";
import { getClient, IProjectInfo } from "azure-devops-extension-api";
import {CommonServiceIds} from "azure-devops-extension-api";
import {IProjectPageService} from "azure-devops-extension-api"
// import { WorkItemTrackingHttpBatchClient } from "TFS/WorkItemTracking/BatchRestClient";
// import { WorkItemQueryResult } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
// import { WorkItemTrackingHttpBatchClient } from "TFS/WorkItemTracking/BatchRestClient";
// import * as WorkItemTracking from "azure-devops-extension-api/WorkItemTracking";
// import { WorkItemTrackingHttpBatchClient } from "TFS/WorkItemTracking/BatchRestClient";
// import { WorkItemTrackingHttpClient3 } from "TFS/WorkItemTracking/RestClient";
// import { RestClient } from "TFS"


// import { WorkItemFormNavigationService } from "TFS/WorkItemTracking/Services";

  // var client = new RestClientBase(options: IVss)

  // let queries = finalmethodGetQueries();
  let QueryResults = main();

// async function finalmethodGetQueries() {
//   let response = await RetrieveExtensionQueries()
//   return response

// }
// function test(){
//   let a = main1().then(
//     let query = RetrieveQuery(a)
//   )
// }

async function main(){
  const project = await RetrieveCurrentProjectInfo()
  // const projectName = "Master Template"
  const query = await RetrieveQuery(project!)
  const workItemIDs = await executeQuery(query, project!)
  const WorkItems = await getWorkItemDetails(workItemIDs,project!)
  // const cleanedWorkItems = await cleanWorkItemsFunction(WorkItems)

  // const cleanedWorkItems =
  //const results = finalmethodGetResults(projectName)
  return WorkItems
  //return workItemIDs

}
// async function main1(){
// const projectName = await RetrieveCurrentProjectInfo()
// return projectName
// }

          //  // Get a client
          //  VssConnection connection = Context.Connection;
          //  WorkItemTrackingHttpClient workItemTrackingClient = connection.GetClient<WorkItemTrackingHttpClient>();
async function executeQuery(query: QueryHierarchyItem, projectName: IProjectInfo) {
  // let options = new IVssRestClientOptions
  // let client = new WorkItemTrackingRestClient(IVssRestClientOptions)
  const client = getClient(WorkItemTrackingRestClient)
  let results = await client.queryById(query.id,projectName.name!)
  // const restClient = await SDK.getService<WorkItemTrackingRestClient>("")
  //    let results = (await restClient.queryById('31c95c3e-3074-43b2-af88-c2b6c9d5ac28','Master Template',))
  return results.workItems
}

async function getWorkItemDetails(workItemRefs: WorkItemReference[], projectName: IProjectInfo){
  const client = getClient(WorkItemTrackingRestClient)
  // let b  = workItemRefs
  // b.
  // workItemRefs[1].id
  const batch : WorkItemBatchGetRequest = {
    $expand: 0,
    asOf: new Date(),
    errorPolicy: 1,
    fields: ["System.Title","System.AreaPath","System.Id"],
    ids: []
  }
  for (let a of workItemRefs) {
    batch.ids.push(a.id)
  }
  // const batch = new 
  // for (let entry in items){
  //   arrayOfItems.push({"Title": entry.id?})
  // }
  let workItems = await client.getWorkItemsBatch(batch, projectName.name!)
  return workItems

}

// function cleanWorkItemsFunction(items: WorkItem[]){
// for (let item in items) {
//     item
//   }
// }


async function RetrieveCurrentProjectInfo(){
  // const client = getClient(WorkItemTrackingRestClient)
  // client.
   const projectService = await SDK.init().then( () => SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService))
  //projectService = new ServiceWorker<IProjectPageService>()
  const thisProject = await projectService.getProject()
      //console.log(thisProject)
      return thisProject
}

function RetrieveQuery(projectName: IProjectInfo){
    const input = SDK.getConfiguration().witInputs["QueryName"];
    let queryPath = input
    const client = getClient(WorkItemTrackingRestClient)
    let query = client.getQuery(projectName.name!,queryPath)
    return query
   
}

  // async function RetrieveExtensionQueries(){
  //   // let thisProject = await RetrieveCurrentProjectInfo()
  //   const restClient = await SDK.getService<WorkItemTrackingRestClient>(
  //    WorkItemTrackingServiceIds.WorkItemFormService
  //   )
  //     let queries = (await restClient.getQueries('Master Template'))
  //     return queries
  // }
  
  export const QueryResult =  QueryResults
  // async function ExecuteCustomerStoryQuery(){
  //   const workItemFormService = await SDK.getService<WorkItemTrackingRestClient>(
  //     WorkItemTrackingServiceIds.WorkItemFormService
  //   )
  //     let outcomeT1Data = (await workItemFormService.g
  // }