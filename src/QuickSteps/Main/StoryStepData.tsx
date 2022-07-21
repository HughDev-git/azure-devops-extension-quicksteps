export interface ITaskItem {
    name: string;
    type: string;
  }
  
  export const tasks: ITaskItem[] = [
    {
      name: "Download latest SAAR-N",
      type: "internal"
    },
    {
      name: "Fill out SAAR-N",
      type: "internal"
    },
    {
      name: "Email SAAR-N",
      type: "internal"
    },
    {
      name: "Customer Process SAAR-N",
      type: "external"
    },
    {
      name: "Validate Login to Account",
      type: "internal"
    },
    {
      name: "Validate Roles on Account",
      type: "internal"
    }
  ];
  