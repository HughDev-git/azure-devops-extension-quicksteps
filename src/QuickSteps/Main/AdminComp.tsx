import * as React from "react";
import { Card } from "azure-devops-ui/Card";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import {
  ScrollableList,
  IListItemDetails,
  ListSelection,
  ListItem,
} from "azure-devops-ui/List";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { showRootComponent } from "../../Common";
import * as SDK from "azure-devops-extension-sdk";
import {ITaskItem} from "./StepSchema"
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import { Icon, IconSize } from "azure-devops-ui/Icon";
import { ObservableValue, Observable } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import "./quicksteps.scss";
import { Button } from "azure-devops-ui/Button";
import { Dialog } from "azure-devops-ui/Dialog";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Panel } from "azure-devops-ui/Panel";
import { FormItem } from "azure-devops-ui/FormItem";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import {allSteps, IResponseItem} from "./StoryStepData"
import {
  IWorkItemFormService,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";
import { IPipelineItem } from "./UserResponses";


initializeIcons();

interface MyAdminStates {
    StepRecordsItemProvider: ArrayItemProvider<ITaskItem>;
    removeStepDisabled: boolean;
    moveUpStepDisabled: boolean;
    moveDownStepDisabled: boolean;
    nextDisabled: boolean;
    panelExpanded: boolean;
    numberOfChildrecords: number;
    almostDoneDDID: string;
    View: string;
    isRenderReady: boolean;
  }

  export class QuickStepsAdmin extends React.Component<{}, MyAdminStates>{
    constructor(props: {}) {
      super(props);
      this.state = {
        StepRecordsItemProvider: new ArrayItemProvider([]),
        removeStepDisabled: true,
        moveUpStepDisabled: true,
        moveDownStepDisabled: true,
        panelExpanded: false,
        nextDisabled: true,
        numberOfChildrecords: 0,
        almostDoneDDID: "",
        View: "",
        isRenderReady: false
        
        // selectedItem: null
      };
      this.almostDoneDDselection.select(0)
    }
    private isAlmostDoneChildItemsExistDialogOpen = new ObservableValue<boolean>(false);
    private isAlmostDoneChildItemsNotExistDialogOpen = new ObservableValue<boolean>(false);
    private almostDoneDDselection = new DropdownSelection();
    // private almostDoneDDSelectedItemID = new ObservableValue<string>("");
    private selection = new ListSelection(true);
    private ddSelection = new DropdownSelection();
    private newStepTitle = new ObservableValue<string | undefined>("");
    //private newStepTitleRO = new IReadonlyObservableValue()
    
    private newStepType = new ObservableValue<string>("");
    //     private selection = new Selection({
    //       onItemsChanged: () => {
    //         setSelectedItem(selection.getSelection()[0])
    //     }
    // })
    //private allSteps = new ArrayItemProvider(allSteps);
  
    //private selectedItem = new ObservableValue<IListRow<ITaskItem>>(null);
    public componentDidMount() {
      SDK.init().then(() => {
      this.fetchWITInput()
      if (this.state.View === "ADMIN") {
      this.fetchAllJSONData().then(() => {
      this.determineIfChildrenExist();
      this.isRenderReady()
      });
      } else {
        console.log("This is the USER view")
      }
      });
      // });
    }

    public fetchWITInput(){
      let view = SDK.getConfiguration().witInputs["View Type"]
      this.setState({
        View: view
        // StoryRecordsArray: storiesplaceholder
      });
    
}
  
    public render(): JSX.Element {
      if (this.state.isRenderReady){
      return (
        <div>
          <Card>
            <div style={{ display: "flex" }}>
              <ScrollableList
                itemProvider={this.state.StepRecordsItemProvider}
                renderRow={this.renderRow}
                selection={this.selection}
                // onActivate={this.testActivate}
                onSelect={(event, data) => this.determineButtonsStates()}
                width="100%"
              />
            </div>
          </Card>
          <ButtonGroup className="buttonGroup">
            <Button
              ariaLabel="Move Up"
              iconProps={{ iconName: "Up" }}
              disabled={this.state.moveUpStepDisabled}
              onClick={this.onClickMoveUp.bind(this)}
            />
            <Button
              ariaLabel="Move Down"
              iconProps={{ iconName: "Down" }}
              disabled={this.state.moveDownStepDisabled}
              onClick={this.onClickMoveDown.bind(this)}
            />
            <Button
              text="Remove Step"
              danger={true}
              disabled={this.state.removeStepDisabled}
              iconProps={{ iconName: "Remove" }}
              onClick={this.onClickRemove.bind(this)}
            />
            <Button
              text="Add Step"
              primary={true}
              iconProps={{ iconName: "Add" }}
              onClick={() => this.setState({ panelExpanded: true })}
            />
            <Button
              text="Next"
              style={{flexDirection: "row-reverse"}}
              iconProps={{ iconName: "DoubleChevronRight", style:{marginLeft: ".5em"}}}
            //   className="btnfloat"
              primary={true}
              disabled={this.state.nextDisabled}
              onClick={this.onNextButtonClick.bind(this)}
            />
          </ButtonGroup>
          {this.state.panelExpanded && (
            <Panel
              onDismiss={() => this.setState({ panelExpanded: false })}
              titleProps={{ text: "New Step" }}
              // description={
              //   ""
              // }
              footerButtonProps={[
                {
                  text: "Cancel",
                  onClick: () => this.setState({ panelExpanded: false })
                },
                {
                  text: "Create",
                  primary: true,
                  onClick: this.onCreateClick.bind(this)
                }
              ]}
            >
              <div style={{ height: "500px" }}>
                <div>
                  <FormItem
                    label="Step Title:"
                    message="Give your step a title. Avoid titles with names, dates or details that could require frequent updating. You can use the wiki to store such information for easier updating."
                  >
                    <TextField
                      value={this.newStepTitle}
                      onChange={this.onNewTitleChange}
                      placeholder="Title of Step"
                      width={TextFieldWidth.standard}
                    />
                  </FormItem>
                </div>
                <div style={{ marginTop: "1em" }}>
                  <FormItem
                    label="Step Type:"
                    message="Internal: This step type has no external dependency and be fully completed by the individual resource. External: This step type has an external dependency and must be completed by someone else.  "
                  >
                    <Dropdown
                      ariaLabel="Basic"
                      className="example-dropdown"
                      placeholder="Select an Option"
                      selection={this.ddSelection}
                      onSelect={this.onNewTypeChange}
                      items={[
                        { id: "internal", text: "Internal" },
                        { id: "external", text: "External" }
                      ]}
                      // onSelect={this.onSelect}
                    />
                  </FormItem>
                </div>
                <div style={{ marginTop: "3em" }}>
                  <div>
                    <Status
                      {...Statuses.Success}
                      key="success"
                      size={StatusSize.m}
                      className="status-example flex-self-center"
                    />{" "}
                    DO have at least 1 step
                  </div>
                  <div>
                    <Status
                      {...Statuses.Success}
                      key="success"
                      size={StatusSize.m}
                      className="status-example flex-self-center"
                    />{" "}
                    DO match title with titles used in the wiki
                  </div>
                  <div>
                    <Status
                      {...Statuses.Success}
                      key="success"
                      size={StatusSize.m}
                      className="status-example flex-self-center"
                    />{" "}
                    DO keep specific step details in the wiki
                  </div>
                </div>
                <div style={{ marginTop: "2em" }}>
                  <div>
                    <Status
                      {...Statuses.Failed}
                      key="success"
                      size={StatusSize.m}
                      className="status-example flex-self-center"
                    />{" "}
                    DO NOT use special characters
                  </div>
                  <div>
                    <Status
                      {...Statuses.Failed}
                      key="success"
                      size={StatusSize.m}
                      className="status-example flex-self-center"
                    />{" "}
                    DO NOT start or end with external steps
                  </div>
                  <div>
                    <Status
                      {...Statuses.Failed}
                      key="success"
                      size={StatusSize.m}
                      className="status-example flex-self-center"
                    />{" "}
                    DO NOT use emails or names in the title
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "3em" }}></div>
            </Panel>
          )}
                  <Observer isDialogOpen={this.isAlmostDoneChildItemsExistDialogOpen}>
                    {(props: { isDialogOpen: boolean }) => {
                        return props.isDialogOpen ? (
                            <Dialog
                                titleProps={{ text: "Almost Done..." }}
                                
                                footerButtonProps={[
                                    {
                                        text: "Cancel",
                                        onClick: this.onDismissAlmostDoneChildItemsExistDialog.bind(this)
                                    },
                                    {
                                        text: "PUBLISH",
                                        onClick: this.onPublishClick.bind(this),
                                        primary: true
                                    }
                                ]}
                                onDismiss={this.onDismissAlmostDoneChildItemsExistDialog}
                            >
                              It looks like there are {this.state.numberOfChildrecords} onboarding activitie(s) already assigned to this this onboarding story. How do you want to handle onboarding activities that have already been assigned?
                              <Dropdown
                                  //ariaLabel="Default selection"
                                  //className="example-dropdown"
                                  className="resetOptionsDD"
                                  placeholder="Select an Option"
                                  items={[
                                    { id: "1", text: "Do Nothing" },
                                    { id: "2", text: "Reset Everyone" },
                                    { id: "3", text: "Reset In Progress Users" }
                                ]}
                                  selection={this.almostDoneDDselection}
                                  onSelect={this.onAlmostDoneDDSelect.bind(this)}
                              />
                                  {this.state.almostDoneDDID === "1" ?
                                  <div>
                                  <div className="noteDiv"><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Recommended if you didn't reorder steps and only made slight changes</div>
                                  <div className="noteDiv"><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Reordered steps not previously completed might be marked completed now</div>
                                  <div><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />If a critical step detail has changed, the user might be unaware</div>
                                  </div>
                                  :this.state.almostDoneDDID === "2" ?
                                  <div>
                                  <div className="noteDiv"><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Recommended when you need everyone to reasses their onboarding activity</div>
                                  <div className="noteDiv"><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Users who completed the activity will need to revalidate their steps</div>
                                  <div><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Users who completed the onboarding activity will need to revalidate their steps</div>
                                  </div>
                                  :this.state.almostDoneDDID === "3" ?
                                  <div>
                                  <div className="noteDiv"><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Recommended when you don't need users already done to redo efforts</div>
                                  <div className="noteDiv"><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />Users already done will not need to redo their activity</div>
                                  <div><Status {...Statuses.Skipped} key="skipped"size={StatusSize.s}className="skippedAlmostDoneIcon" />User almost done with their steps will still need to start over</div>
                                  </div>
                                  : ""}
                            </Dialog>
                        ) : null;
                    }}
                </Observer>
                <Observer isDialogOpen={this.isAlmostDoneChildItemsNotExistDialogOpen}>
                    {(props: { isDialogOpen: boolean }) => {
                        return props.isDialogOpen ? (
                            <Dialog
                                titleProps={{ text: "You are good to go!" }}
                                
                                footerButtonProps={[
                                    {
                                        text: "Cancel",
                                        onClick: this.onDismissAlmostDoneChildItemsNotExistDialog.bind(this)
                                    },
                                    {
                                        text: "PUBLISH",
                                        onClick: this.onPublishClick.bind(this),
                                        primary: true
                                    }
                                ]}
                                onDismiss={this.onDismissAlmostDoneChildItemsNotExistDialog.bind(this)}
                            >
                             <span>Go ahead and click Publish to make these steps available to all activities linked to this story.</span>
                            </Dialog>
                        ) : null;
                    }}
                </Observer>
        </div>
      );
                  } else {
                    return (<div className="flex-row"></div>)
                  }
    }


    public isRenderReady(){
      this.setState({
        isRenderReady: true
        // StoryRecordsArray: storiesplaceholder
      });
    }

    public async onPublishClick(){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      )
       let responsesSchema = (await workItemFormService.getFieldValue("Custom.MSQuickStepResponsesSchemaDraft")).toString();
       let stepsSchema = (await workItemFormService.getFieldValue("Custom.MSQuickStepSchemaDraft")).toString();
      workItemFormService.setFieldValues({"Custom.MSQuickStepSchema": stepsSchema});
      workItemFormService.setFieldValues({"Custom.MSQuickStepResponsesSchema": responsesSchema});
      workItemFormService.save();
    }
  
    public onDismissAlmostDoneChildItemsExistDialog(){
      this.isAlmostDoneChildItemsExistDialogOpen.value = false
    }
    public onDismissAlmostDoneChildItemsNotExistDialog(){
      this.isAlmostDoneChildItemsNotExistDialogOpen.value = false
    }

    private onAlmostDoneDDSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
      this.setState({
        almostDoneDDID: item.id
        // StoryRecordsArray: storiesplaceholder
      });
    }

    public onNextButtonClick(){
      //Determine which dialog to open
      if(this.state.numberOfChildrecords > 0) {
      this.isAlmostDoneChildItemsExistDialogOpen.value = true
    } else {
      this.isAlmostDoneChildItemsNotExistDialogOpen.value = true
    }
    this.setState({
      almostDoneDDID: "1"
      // StoryRecordsArray: storiesplaceholder
    });
  }

    private onNewTitleChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      newValue: string
    ) => {
      this.newStepTitle.value= newValue;
    };
  
    private onNewTypeChange = (
      event: React.SyntheticEvent<HTMLElement>,
      item: IListBoxItem<{}>
    ) => {
      this.newStepType.value = item.id || "";
    };
  
    public async onClickRemove() {
      let items = await allSteps
      items.splice(this.selection.value[0].beginIndex, 1);
      this.updateSchemaDraft();
      let arrayItemProvider = new ArrayItemProvider(items);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
    }
  
    public async onCreateClick() {
      this.updateSchemaDraft();
      let items = await allSteps
      let arrayItemProvider = new ArrayItemProvider(items);
      items.push({
        step: (items.length + 1).toString(),
        name: this.newStepTitle.value || "",
        type: this.newStepType.value
      });
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
      this.newStepTitle.value = "";
      this.ddSelection.clear();
      //this.newStepType.value = "";
      
    }

    public async determineIfChildrenExist(){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      )
      let count = 0
      let relations = await workItemFormService.getWorkItemRelations();
      for (let item of relations){
         console.log("Attributes: "+item.attributes+" ||| Link Type: "+item.rel+" ||| URL: "+item.url)
        if(item.rel == "System.LinkTypes.Hierarchy-Forward"){
          count++
         }
        }
        this.setState({
          numberOfChildrecords: count
          // StoryRecordsArray: storiesplaceholder
        });
        console.log("There are " + count + " child items for this record")
    }


    public async updateSchemaDraft(){
      const workItemFormService = await SDK.getService<IWorkItemFormService>(
        WorkItemTrackingServiceIds.WorkItemFormService
      )
      let items = await allSteps
      let responseSchemaDraft = new Array<IResponseItem<{}>>();
      let stepsSchemaDraft = new Array()
      for(let entry of items){
        responseSchemaDraft.push({
          step: entry.step,
          status: "queued"
        });
        stepsSchemaDraft.push({
          step: entry.step,
          type: entry.type,
          title: entry.name
        });
      }
      let stringifiedresponseSchemaDraft = JSON.stringify(responseSchemaDraft);
      let stringifiedstepsSchemaDraft = JSON.stringify(stepsSchemaDraft);
      workItemFormService.setFieldValues({"Custom.MSQuickStepResponsesSchemaDraft": stringifiedresponseSchemaDraft});
      workItemFormService.setFieldValues({"Custom.MSQuickStepSchemaDraft": stringifiedstepsSchemaDraft});
    }
  
    public determineButtonsStates() {
      //set our observable
      this.determineRemoveStepState();
      this.determineMoveUpState();
      this.determineMoveDownState();
      this.determineNextBtnState();
      //this.selection.select(e.index);
    }
  
    // public determineButtonsStates3() {
    //   //set our observable
    //   // this.setState({
    //   //   selectedItem: e
    //   //   // StoryRecordsArray: storiesplaceholder
    //   // });
    //   this.determineRemoveStepState();
    //   this.determineMoveUpState();
    //   this.determineMoveDownState();
    //   //this.selection.select(e.index);
    // }
  
    public async determineNextBtnState(){
      let items = await allSteps
      if(items.length == 0){
        console.log("The strings match")
        this.setState({
          nextDisabled: true
          // StoryRecordsArray: storiesplaceholder
        });
      } else {
        console.log("The strings DO NOT match")
        this.setState({
          nextDisabled: false
          // StoryRecordsArray: storiesplaceholder
        });
      }
    }

    public cleanHTMLField(string: string){
      const cleanedResponses = string.replace(/(<([^>]+)>)/ig, ""); 
      //second clean for reinsert of quotes
      const cleanedResponses2 = cleanedResponses.replace(/&quot;/g, '"');
      return cleanedResponses2
    }


    public determineRemoveStepState() {
      if (this.selection) {
        this.setState({
          removeStepDisabled: false
          // StoryRecordsArray: storiesplaceholder
        });
      } else {
        this.setState({
          removeStepDisabled: true
          // StoryRecordsArray: storiesplaceholder
        });
      }
    }
    public determineMoveUpState() {
      if (this.selection.value[0].beginIndex === 0) {
        this.setState({
          moveUpStepDisabled: true
          // StoryRecordsArray: storiesplaceholder
        });
      } else {
        this.setState({
          moveUpStepDisabled: false
          // StoryRecordsArray: storiesplaceholder
        });
      }
    }
  
    public async determineMoveDownState() {
      let items = await allSteps
      if (this.selection.value[0].beginIndex + 1 >= items.length) {
        this.setState({
          moveDownStepDisabled: true
          // StoryRecordsArray: storiesplaceholder
        });
      } else {
        this.setState({
          moveDownStepDisabled: false
          // StoryRecordsArray: storiesplaceholder
        });
      }
    }
  
    public async onClickMoveDown() {
      //let newSelected = this.selection.selected.toString()
      let items = await allSteps
      let stepsplaceholder = new Array<ITaskItem>();
      [
        items[this.selection.value[0].beginIndex],
        items[this.selection.value[0].beginIndex + 1]
      ] = [
        items[this.selection.value[0].beginIndex + 1],
        items[this.selection.value[0].beginIndex]
      ];
      this.updateSchemaDraft();
      // this.setState({
      //   selectedItem: this.state.selectedItem
      //   // StoryRecordsArray: storiesplaceholder
      // });
      this.selection.select(this.selection.value[0].endIndex);
      for (let entry of items) {
        console.log(entry);
        // let AreaPath = new String(entry.fields["System.AreaPath"])
        // let cleanedAreaPath = AreaPath.split("\\")[1]
        stepsplaceholder.push({
          name: entry.name,
          type: entry.type
        });
      }
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
      // this.selection.select(this.state.selectedItem.index + 1);
      let a = this.selection.value[0].beginIndex;
      this.selection.select(a + 1);
      this.determineButtonsStates();
      // this.selection.selected
    }
  
    public async onClickMoveUp() {
      let items = await allSteps
      let stepsplaceholder = new Array<ITaskItem>();
      [
        items[this.selection.value[0].beginIndex],
        items[this.selection.value[0].beginIndex - 1]
      ] = [
        items[this.selection.value[0].beginIndex - 1],
        items[this.selection.value[0].beginIndex]
      ];
      this.updateSchemaDraft();
      this.selection.select(this.selection.value[0].endIndex);
      for (let entry of items) {
        console.log(entry);
        // let AreaPath = new String(entry.fields["System.AreaPath"])
        // let cleanedAreaPath = AreaPath.split("\\")[1]
        stepsplaceholder.push({
          name: entry.name,
          type: entry.type
        });
      }
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
      let a = this.selection.value[0].beginIndex;
      this.selection.select(a - 1);
      this.determineButtonsStates();
      // this.selection.select(this.state.selectedItem.index - 1);
    }
  
    public async fetchAllJSONData() {
      let items = await allSteps
      let stepsplaceholder = new Array<ITaskItem>();
      for (let entry of items) {
        // let AreaPath = new String(entry.fields["System.AreaPath"])
        // let cleanedAreaPath = AreaPath.split("\\")[1]
        stepsplaceholder.push({
          name: entry.name,
          type: entry.type
        });
      }
      let arrayItemProvider = new ArrayItemProvider(stepsplaceholder);
      this.setState({
        StepRecordsItemProvider: arrayItemProvider
        // StoryRecordsArray: storiesplaceholder
      });
    }

    public async awaitAllItems(){
      let items = await allSteps
      return items
    }
  
    private renderRow = (
      index: number,
      item: ITaskItem,
      details: IListItemDetails<ITaskItem>,
      key?: string
    ): JSX.Element => {
      return (
        <ListItem
          key={key || "list-item" + index}
          index={index}
          details={details}
        >
          <div className="list-example-row flex-row h-scroll-hidden">
            {item.type === "internal" ? (
              <Icon
                iconName="Contact"
                size={IconSize.large}
                //ariaLabel="This step can be completed by the indivdiual resource"
                //   ariaLabel="This step has an external dependency"
              />
            ) : (
              <Icon iconName="Group" size={IconSize.large} />
            )}
            <div
              style={{ marginLeft: "10px", padding: "10px 0px" }}
              className="flex-column h-scroll-hidden"
            >
              <span className="text-ellipsis">
                Step {index + 1}{" "}
                <Icon
                  iconName="Forward"
                  size={IconSize.small}
                  style={{ marginRight: "5px" }}
                />
                {item.name}
              </span>
              {/* <span className="fontSizeMS font-size-ms text-ellipsis secondary-text">
                              {item.description}
                          </span> */}
            </div>
          </div>
        </ListItem>
      );
    };
  }
  

  export default QuickStepsAdmin;
  showRootComponent(<QuickStepsAdmin/>);
