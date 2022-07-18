import * as React from "react";

import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISimpleListCell } from "azure-devops-ui/List";
import { MenuItemType } from "azure-devops-ui/Menu";
import {
  IStatusProps,
  Status,
  Statuses,
  StatusSize
} from "azure-devops-ui/Status";
import {
  ColumnMore,
  ColumnSelect,
  ISimpleTableCell,
  renderSimpleCell,
  TableColumnLayout
} from "azure-devops-ui/Table";
import { css } from "azure-devops-ui/Util";
import { allSchemaItems, mySchemaItemsStatus} from "./StepSchema";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import {
    IWorkItemFormService,
    WorkItemTrackingServiceIds,
  } from "azure-devops-extension-api/WorkItemTracking";
  import { IListBoxItem} from "azure-devops-ui/ListBox";
  import * as SDK from "azure-devops-extension-sdk";

export const renderStatus = (className?: string) => {
  return (
    <Status
      {...Statuses.Success}
      ariaLabel="Success"
      className={css(className, "bolt-table-status-icon")}
      size={StatusSize.s}
    />
  );
};

enum PipelineStatus {
  running = "running",
  succeeded = "succeeded",
  failed = "failed",
  warning = "warning",
  queued = "queued",
  waiting = "waiting"
}
const UserResponses = [
  {
    step: 1,
    status: "success"
  },
  {
    step: 2,
    status: "queued"
  },
  {
    step: 3,
    status: "queued"
  },
  {
    step: 4,
    status: "queued"
  },
  {
    step: 5,
    status: "queued"
  },
  {
    step: 6,
    status: "queued"
  }
];

let results = GetAllMyResponses()
let mergedSchemaAndResults = MergeSchemaAndResults(results)
  
async function GetAllMyResponses() {
  let response = await ParseResponses()
  return response
}
async function RetrieveResponses(){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      )
        let responses = (await workItemFormService.getFieldValue("Custom.MSQuickStepResponses")).toString();
        //let responses2 = (await workItemFormService.getFieldValue("Custom.MSQuickStepResponses"));
        //console.log("RESPONSE 1 :  " + responses)
        //console.log("RESPONSE 2 :  " + responses2)
        //let cleanedResponse = responses.replace( /(<([^>]+)>)/ig, '');
        return responses
    }
async function ParseResponses(){
  const data = await RetrieveResponses()
  // console.log("RESPONSE 3 :   " + data)
  return data
}

async function MergeSchemaAndResults(results: Promise<string>){
    // console.log("RESPONSE 4 :   " + results)
    let stepsplaceholder = new Array<IPipelineItem<{}>>();
    const responses = (await results)
    //first clean for html tag removal
    const cleanedResponses = responses.replace(/(<([^>]+)>)/ig, ""); 
    //second clean for reinsert of quotes
    const cleanedResponses2 = cleanedResponses.replace(/&quot;/g, '"'); 
    // console.log("CLEANED RESPONSE 5 :   " + cleanedResponses2)
    // const schema = (await ADOSchema)
    var parsedResponse = JSON.parse(cleanedResponses2)
    // console.log("RESPONSE 6 :   " + parsedResponse)
    for (let entry of parsedResponse) {
        // let AreaPath = new String(entry.fields["System.AreaPath"])
        let itemToMatch = await returnMatchedSchemaRecord(entry.step);
        stepsplaceholder.push({
          step: entry.step,
          title: itemToMatch?.title || "", //We will set this from schema
          status: entry.status,
          type: itemToMatch?.type || "", //We will set this from schema
        });
      }
return stepsplaceholder
}

async function returnMatchedSchemaRecord(item: any){
  console.log("What we are looking for: " + item)
  // console.log("First Log"+item)
  let schemaRetrievalStatus = await mySchemaItemsStatus
  if (schemaRetrievalStatus){
    let a = allSchemaItems.find((i: { step: string; }) => i.step === item)
    return a
  }

}

export const UserResponeItems = mergedSchemaAndResults

// export const UserResponeItems = getUserStepStatus();

export interface IPipelineItem<T = {}> {
  step: number;
  title: string;
  status: string;
  type: string;
}

interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label: string;
}

export function getStatusIndicatorData(status: string): IStatusIndicatorData {
  status = status || "";
  status = status.toLowerCase();
  const indicatorData: IStatusIndicatorData = {
    label: "Success",
    statusProps: { ...Statuses.Success, ariaLabel: "Success" }
  };
  switch (status) {
    case PipelineStatus.failed:
      indicatorData.statusProps = { ...Statuses.Failed, ariaLabel: "Failed" };
      indicatorData.label = "Failed";
      break;
    case PipelineStatus.running:
      indicatorData.statusProps = { ...Statuses.Running, ariaLabel: "Running" };
      indicatorData.label = "Running";
      break;
    case PipelineStatus.warning:
      indicatorData.statusProps = { ...Statuses.Warning, ariaLabel: "Warning" };
      indicatorData.label = "Warning";
      break;
    case PipelineStatus.queued:
      indicatorData.statusProps = { ...Statuses.Queued, ariaLabel: "Queued" };
      indicatorData.label = "Queued";
      break;
    case PipelineStatus.waiting:
      indicatorData.statusProps = { ...Statuses.Waiting, ariaLabel: "Waiting" };
      indicatorData.label = "Waiting";
  }

  return indicatorData;
}
