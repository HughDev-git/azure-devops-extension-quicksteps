import * as React from "react";
import {
  getStatusIndicatorData,
  IPipelineItem,
  UserResponeItems
} from "./UserResponses";

import { Card } from "azure-devops-ui/Card";
import { Status, StatusSize } from "azure-devops-ui/Status";
import {
  ITableColumn,
  SimpleTableCell,
  Table,
  ColumnSorting,
  SortOrder,
  sortItems,
  ITableRow
} from "azure-devops-ui/Table";
import {
  ProgressIndicator
} from "@fluentui/react";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";
import {
  IWorkItemFormService,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";
import { Link } from "azure-devops-ui/Link";
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Icon } from '@fluentui/react/lib/Icon';
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Checkbox } from "azure-devops-ui/Checkbox";
import {WorkItemTrackingRestClient} from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingClient";
import {WikiRestClient} from "azure-devops-extension-api/Wiki/WikiClient";
import { getClient } from "azure-devops-extension-api";
import { Project } from "./CurrentProject"
import "./quicksteps.scss";
import { WorkItemExpand } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";


initializeIcons();
const activityNotApply = new ObservableValue<boolean>(false);

interface MyStates {
  StepRecordsItemProvider: ArrayItemProvider<IPipelineItem>;
  isCoachMarkVisible: boolean;
  percentComplete: any;
  totalSteps: number;
  completedSteps: number;
  nextStep: number;
  nextStepText: string;
  isRenderReady: boolean;
  CBDoesNotApply: boolean;
  wikiUrl: string;
}

// interface WorkItemExpand {
//   /**
//    * Default behavior.
//    */
//   None = 0,
//   /**
//    * Relations work item expand.
//    */
//   Relations = 1,
//   /**
//    * Fields work item expand.
//    */
//   Fields = 2,
//   /**
//    * Links work item expand.
//    */
//   Links = 3,
//   /**
//    * Expands all.
//    */
//   All = 4
// }

// interface GetWorkItems {
//   id: number;
//   project: string;
//   fields: string[];
//   asOf: Date;
//   expand: WorkItemTracking.WorkItemExpand;
//   errorPolicy:  WorkItemTracking.WorkItemErrorPolicy;
// }

export class QuickSteps extends React.Component<{}, MyStates> {
  constructor(props: {}) {
    super(props);
    this.state = {
      StepRecordsItemProvider: new ArrayItemProvider([]),
      isCoachMarkVisible: false,
      totalSteps: 0,
      completedSteps: 0,
      nextStep: 0,
      nextStepText: "",
      percentComplete: 0,
      isRenderReady: false,
      CBDoesNotApply: false,
      wikiUrl: "",
    };
  }
  

  public componentDidMount() {
    SDK.init().then(() => {
    this.fetchAllJSONData().then(() => {
      this.getWiki();
      this.determineIfNotApply();
      this.determinePercentComplete();
      this.isRenderReady();
      })
    })
  }

  public isRenderReady(){
    this.setState({
      isRenderReady: true
      // StoryRecordsArray: storiesplaceholder
    });
  }
  public render(): JSX.Element {
    if (this.state.isRenderReady){
    return (
      <div className="MainDiv">
        <Icon iconName="FileSymlink" /> <Link href={this.state.wikiUrl} subtle={true} target="_blank" className="instructions-class">
           Click For Instructions
        </Link>
        <ProgressIndicator
          label={
            "My Progress | " +
            this.state.percentComplete.toFixed(1) * 100 +
            " %"}
          // description={this.state.percentComplete + " %"}
          percentComplete={this.state.percentComplete}
        />
        <Card
          className="flex-grow bolt-table-card"
          contentProps={{ contentPadding: false }}
          titleProps={{ text: "Getting Started" }}
        >
          {/* <Observer itemProvider={this.itemProvider}>
          {(observableProps: {
            itemProvider: ArrayItemProvider<IPipelineItem>;
          }) => ( */}
          <Table<IPipelineItem>
            ariaLabel="Advanced table"
            //behaviors={[this.sortingBehavior]}
            className="table-example"
            columns={this.columns}
            containerClassName="h-scroll-auto"
            itemProvider={this.state.StepRecordsItemProvider}
            showLines={true}
            //singleClickActivation={true}
            onSelect={(event, data) => this.updateStatus(data)}
            // onActivate={(event, row) =>
          />
        </Card>
        <div
          className="checkboxNotApply"
        >
           <Checkbox
                onChange={(event, checked) => (this.notApplyCheckbox(checked)) }
                checked={activityNotApply}
                label="This onboarding requirement does not apply to me"
            />
        </div>
        <div style={{ marginTop: "10px"}}>
          {this.state.isCoachMarkVisible ? (
            <MessageCard
              //className="flex-self-stretch"
              onDismiss={this.onDismissCoach.bind(this)}
              severity={MessageCardSeverity.Info}
            >
              It looks like this next step needs to be completed by someone
              else. Once you receive confirmation it has been completed, come
              back here and go ahead and mark it as complete.
            </MessageCard>
          ) : (
            ""
          )}
        </div>
        <div style={{ marginTop: "10px"}}>
          {this.state.CBDoesNotApply ? (
            <MessageCard
              //className="flex-self-stretch"
              //onDismiss={this.onDismissCoach2.bind(this)}
              severity={MessageCardSeverity.Warning}
            >
              You have marked this requirement as not applicable. If this requirement does apply to you in the future, don't forget to uncheck the box above.
            </MessageCard>
          ) : (
            ""
          )}
        </div>
      </div> 
    );} else {
      return (<div className="flex-row"></div>)
    }
  }

  public async determineIfNotApply(){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    )
    let currentState = (await workItemFormService.getFieldValue("System.State")).toString();
    if (currentState === "N/A - This requirement does not apply to me") {
      activityNotApply.value = true
      this.setState({
        CBDoesNotApply: true
        // StoryRecordsArray: storiesplaceholder
      });
    } else {
      activityNotApply.value = false
      this.setState({
        CBDoesNotApply: false
        // StoryRecordsArray: storiesplaceholder
      });
    }
  }

  public async getWiki(){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
    const organization = await SDK.getHost()
    const project = await Project
    const client = getClient(WorkItemTrackingRestClient);
    const wikiclient = getClient(WikiRestClient);
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
        let UrlToWiki = (await workitem).fields["Custom.URLtoWiki"]
        //let parentRelations = (await workitem).relations
        console.log(UrlToWiki)
        this.setState({
          wikiUrl: UrlToWiki,
        });
    }
  }
}

  public async notApplyCheckbox(checked: boolean){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    )
    let responses = (await UserResponeItems)
    let currentState = (await workItemFormService.getFieldValue("System.State")).toString();
    console.log(currentState)
    activityNotApply.value = checked
    if (checked){
      workItemFormService.setFieldValues({"System.State": "N/A - This requirement does not apply to me"});
      this.setState({
        CBDoesNotApply: true
        // StoryRecordsArray: storiesplaceholder
      });
    } else {
      this.setRemainingADOFields(responses)
      this.setState({
        CBDoesNotApply: false
        // StoryRecordsArray: storiesplaceholder
      });
    }
  }
  public onDismissCoach() {
    this.setState({
      isCoachMarkVisible: false
      // StoryRecordsArray: storiesplaceholder
    });
  }
  public async updateStatus(e: ITableRow<Partial<IPipelineItem>>) {
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    )
    activityNotApply.value = false
    this.setState({
      CBDoesNotApply: false
      // StoryRecordsArray: storiesplaceholder
    });
    //alert(pipelineItems[e.index].step);
    //If it is the first step selected and not complete, mark complete
    let responses = (await UserResponeItems)
    this.setMarks(e, responses);
    //this.determineIfAwaitExternalProcess(e, responses);
    this.setRemainingADOFields(responses)
    // console.log(UserResponeItems.length);
    let stepsplaceholder = new Array<IPipelineItem<{}>>();
    for (let entry of responses) {
      // let AreaPath = new String(entry.fields["System.AreaPath"])
      // let cleanedAreaPath = AreaPath.split("\\")[1]
      stepsplaceholder.push({
        step: entry.step,
        title: entry.title,
        status: entry.status,
        type: entry.type
      });
      //console.log(JSON.stringify(this.state.StepRecordsItemProvider))
      // let total = stepsplaceholder.length;
      // let completed = stepsplaceholder.filter((a) => a.status === "success")
      // .length;
      // console.log("Total: " + total + "Completed: " + completed);
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
      // alert(e.index);
    }
    let stringifiedJSON = JSON.stringify(this.state.StepRecordsItemProvider);
    workItemFormService.setFieldValues({"Custom.MSQuickStepResponses": stringifiedJSON});
  }
  // public updatePercentComplete() {
  //   let percentCompleted = this.state.completedSteps / this.state.totalSteps;
  //   //console.log("Percent Complete:  " + percentCompleted);
  //   this.setState({
  //     percentComplete: percentCompleted
  //     // StoryRecordsArray: storiesplaceholder
  //   });
  // }
  public async setRemainingADOFields(responses: IPipelineItem<{}>[]){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService)
      //Is pending external
      let isPendingExernalAction = (await workItemFormService.getFieldValue("Custom.MSQuickStepIsAwaitingExternalAction")).toString();
      console.log(isPendingExernalAction)
      //determine what our state should be
      if (this.state.percentComplete == 1){
        workItemFormService.setFieldValues({"System.State": "Yes - I fully meet this requirement"});
      }
      if (this.state.percentComplete !== 1 && isPendingExernalAction === "true"){
        workItemFormService.setFieldValues({"System.State": "Standby - I am waiting on external processes"});
      } 
      if (this.state.percentComplete !== 1 && isPendingExernalAction === "false"){
        workItemFormService.setFieldValues({"System.State": "No - I do not meet this requirement"});
      }
      workItemFormService.setFieldValues({"Custom.MSQuickStepPercentComplete": this.state.percentComplete,"Custom.MSQuickStepNextStepID":this.state.nextStep, "Custom.MSQuickStepNextStepText": this.state.nextStepText});
  }

//   public async determineIfAwaitExternalProcess(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]){
//       const workItemFormService = await SDK.getService<IWorkItemFormService>(
//       WorkItemTrackingServiceIds.WorkItemFormService)
//     if (responses.length > e.index + 1) {
//       if (responses[e.index + 1].type === "external" && responses[e.index].status === "success") {
//         workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": true});
//       } else {
//         workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": false});
//       }
//   }
// }
  public async setMarks(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]) {
    //SET MARKS NEW START
    //let previousItemStatus = responses[e.index - 1].status ?? ""
    // const workItemFormService = await SDK.getService<IWorkItemFormService>(
    //   WorkItemTrackingServiceIds.WorkItemFormService)
    let selectedItemStatus = e.data.status
    if(selectedItemStatus !== "success") {
      //Can mark as success since first item
      if(e.index === 0){
        console.log("Entered Zero If")
        responses[e.index].status = "success";
        this.prepStates(e, responses)
        this.checkIfNextItemIsExternal(e, responses)
        return
      }
      //Can mark as success since previous item is success
      if(e.index != 0 && responses[e.index - 1].status === "success"){
        responses[e.index].status = "success";
        this.prepStates(e, responses)
      if(responses[e.index + 1].type === "external"){
        responses[e.index + 1].status = "running";
      }
      this.checkIfNextItemIsExternal(e, responses)
      return
      }

      if(e.data.type === "external"){
        responses[e.index].status = "success";
        this.prepStates(e, responses)
      if(responses[e.index + 1].type === "external"){
        responses[e.index + 1].status = "running";
      }
      this.checkIfNextItemIsExternal(e, responses)
      return
      }
    }
    if (selectedItemStatus === "success") {
      console.log("Entered success if")
      //First check if the item being removed from success is an external action so we can set back to running
      if (responses[e.index].type === "external"){
        responses[e.index].status = "running";
        this.checkIfCurrentItemIsExternal(e, responses)
        for (let entry of responses) {
          if (entry.step > responses[e.index].step) {
            entry.status = "queued";
          }
          // if (entry.step == responses[e.index].step + 1) {
          //   entry.status = "running";
          // }
         }
         this.prepStates(e, responses)
        return
      } else {
        responses[e.index].status = "queued";
        this.prepStates(e, responses)
        this.checkIfCurrentItemIsExternal(e, responses);
      }
      //We now need to go and set forward items to que status
        for (let entry of responses) {
        if (entry.step > responses[e.index].step) {
          entry.status = "queued";
        }
        // if (entry.step == responses[e.index].step + 1) {
        //   entry.status = "running";
        // }
       }
       this.prepStates(e, responses)
       //this.checkIfNextItemIsExternal(e, responses)
      }
    // //SET MARKS NEW END
    //Account for next item being external
    // if (responses.length > e.index + 1) {
    //   if (
    //     responses[e.index + 1].type === "external" &&
    //     responses[e.index].status === "success"
    //   ) {
    //     responses[e.index + 1].status = "running";
    //     this.setState({
    //       isCoachMarkVisible: true
    //       // StoryRecordsArray: storiesplaceholder
    //     });
    //     setTimeout(this.onDismissCoach.bind(this), 20000);
    //   }
    // }
  }
  public async determinePercentComplete(){
    const responses = (await UserResponeItems);
    let total = responses.length;
    let completed = responses.filter((a) => a.status === "success").length;
    let percentComplete = completed / total;
    this.setState({
      percentComplete: percentComplete
    });
  }
  public prepStates(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]) {
        //Prep states
        let total = responses.length;
        let completed = responses.filter((a) => a.status === "success").length;
        // let nextStep = (e.data.type === "external" && e.data.status === "success") ? e.index + 1:e.index + 2;
        let nextStep = this.determineNextStep(e, responses) || 0
        //let nextStep = e.index + 2;
        //Account for no next item
        if (responses.length < nextStep) {
          this.setState({
            nextStepText: "No Next Step",
          });
        
        // } else {
        //   this.setState({
        //     nextStepText: responses[nextStep - 1].title,
        //   });
        } else {
          this.setState({
            nextStepText: responses[nextStep - 1].title,
          });
        }
        let percentComplete = completed / total;
        console.log("Total: "+ total +" ||||| "+ "Completed: "+ completed)
        this.setState({
          nextStep: nextStep,
          totalSteps: total,
          completedSteps: completed,
          percentComplete: percentComplete
        });
  }

  public determineNextStep(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]){
    if(e.data.type === "external" && e.data.status === "success"){
      return e.index + 1
    }
    if(e.data.type === "external" && e.data.status === "running"){
      return e.index + 2
    }
    if(e.data.type !== "external" && e.data.status === "success"){
      return e.index + 1
    }
    if(e.data.type !== "external" && e.data.status === "queued"){
      return e.index + 2
    }
  }

  public async checkIfCurrentItemIsExternal(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService)
    if (responses[e.index].type === "external") {
        //console.log("Setting next item as running")
        responses[e.index].status = "running";
        workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": true});
        this.setState({
          isCoachMarkVisible: true
          // StoryRecordsArray: storiesplaceholder
        });
        setTimeout(this.onDismissCoach.bind(this), 20000);
    }
  }


  public async checkIfNextItemIsExternal(e: ITableRow<Partial<IPipelineItem<{}>>>, responses: IPipelineItem<{}>[]){
    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService)
    if (responses[e.index + 1].type === "external") {
        //console.log("Setting next item as running")
        responses[e.index + 1].status = "running";
  }
    if (responses.length > e.index + 1) {
      if (responses[e.index + 1].type === "external" && responses[e.index].status === "success") {
        workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": true});
        this.setState({
          isCoachMarkVisible: true
          // StoryRecordsArray: storiesplaceholder
        });
        setTimeout(this.onDismissCoach.bind(this), 20000);
      } else {
        workItemFormService.setFieldValues({"Custom.MSQuickStepIsAwaitingExternalAction": false});
      }
  }
}

  public async fetchAllJSONData() {
     let stepsplaceholder = new Array<IPipelineItem<{}>>();
    const responses = (await UserResponeItems);
    // const schema = (await ADOSchema)
    // var parseRespones = JSON.parse(responses)
    for (let entry of responses) {
      // let AreaPath = new String(entry.fields["System.AreaPath"])
      // let cleanedAreaPath = AreaPath.split("\\")[1]
      stepsplaceholder.push({
        step: entry.step,
        title: entry.title,
        status: entry.status,
        type: entry.type
      });
      // storiesplaceholder.push({ "name": entry.fields["System.Title"], "description": entry.id.toString()})
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
    }
    // console.log("123");
  }
  private columns: ITableColumn<IPipelineItem> []= [
    {
      id: "title",
      name: "Action",
      renderCell: renderNameColumn,
      readonly: true,
      // sortProps: {
      //     ariaLabelAscending: "Sorted A to Z",
      //     ariaLabelDescending: "Sorted Z to A",
      // },
      width: 600
    },
    // {
    //     className: "pipelines-two-line-cell",
    //     id: "actions",
    //     name: "Actions",
    //     renderCell: renderLastRunColumn,
    //     width: -33,
    // },
    // {
    //     id: "time",
    //     ariaLabel: "Time and duration",
    //     readonly: true,
    //     renderCell: renderNameColumn,
    //     width: -33,
    // },
    // new ColumnMore(() => {
    //     return {
    //         id: "sub-menu",
    //         items: [
    //             { id: "submenu-one", text: "SubMenuItem 1" },
    //             { id: "submenu-two", text: "SubMenuItem 2" },
    //         ],
    //     };
    // }),
  ];

  // private itemProvider = new ObservableValue<ArrayItemProvider<IPipelineItem>>(
  //   // let a = (await UserResponeItems)
  //   new ArrayItemProvider(UserResponeItems)
  // );

  // private sortingBehavior = new ColumnSorting<Partial<IPipelineItem>>(
  //   (columnIndex: number, proposedSortOrder: SortOrder) => {
  //     this.itemProvider.value = new ArrayItemProvider(
  //       sortItems(
  //         columnIndex,
  //         proposedSortOrder,
  //         this.sortFunctions,
  //         this.columns,
  //         UserResponeItems
  //       )
  //     );
  //   }
  // );

//   private sortFunctions = [
//     // Sort on Name column
//     (item1: IPipelineItem, item2: IPipelineItem) => {
//       return item1.title.localeCompare(item2.title!);
//     }
//   ];
// }
}
function renderNameColumn(
  rowIndex: number,
  columnIndex: number,
  tableColumn: ITableColumn<IPipelineItem>,
  tableItem: IPipelineItem
): JSX.Element {
  return (
    <SimpleTableCell
      columnIndex={columnIndex}
      tableColumn={tableColumn}
      key={"col-" + columnIndex}
      contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
    >
      <Status
        {...getStatusIndicatorData(tableItem.status).statusProps}
        className="icon-large-margin"
        size={StatusSize.l}
      />
      <div className="flex-row scroll-hidden">
        <Tooltip overflowOnly={true}>
          <span className="text-ellipsis">{tableItem.title}</span>
        </Tooltip>
      </div>
    </SimpleTableCell>
  );
  
}

export default QuickSteps;

showRootComponent(<QuickSteps/>);

