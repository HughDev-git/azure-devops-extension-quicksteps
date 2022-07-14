import * as SDK from "azure-devops-extension-sdk";
import {IProjectPageService} from "azure-devops-extension-api";
import {CommonServiceIds} from "azure-devops-extension-api";

let CurrentProject = RetrieveCurrentProjectInfo();

async function RetrieveCurrentProjectInfo(){
    // const client = getClient(WorkItemTrackingRestClient)
    // client.
    const projectService = await SDK.init().then( () => SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService))
    //projectService = new ServiceWorker<IProjectPageService>()
    const thisProject = await projectService.getProject()
        //console.log(thisProject)
        return thisProject
  }

  export const Project =  CurrentProject