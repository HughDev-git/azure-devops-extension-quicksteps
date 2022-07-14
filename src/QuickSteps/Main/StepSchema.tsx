export const schemaItems = [
  {
    step: "1",
    title: "Complete SAAR-N & Digitally Sign",
    type: "internal"
  },
  {
    step: "2",
    title: "Email SAAR-N",
    type: "internal"
  },
  {
    step: "3",
    title: "Await Email SAAR-N Completion",
    type: "external"
  },
  {
    step: "4",
    title: "Validate Login to Account",
    type: "internal"
  },
  {
    step: "5",
    title: "Validate Roles on Account",
    type: "internal"
  },
  {
    step: "6",
    title: "Mention CSAM in Comments upon completion",
    type: "internal"
  }
];

export const ADOSchema = {
  items: [
    {
      step: "1",
      title: "Chalk-Talk / Classroom / Non-MIP / Training",
      type: "internal"
    },
    { step: "2", title: "Migrate / Move / Modernize", type: "internal" },
    { step: "3", title: "Reactive / Remediate / Repair", type: "internal" },
    {
      step: "4",
      title: "Proactive / Preventative / Discovery",
      type: "external"
    },
    { step: "5", title: "Review / Documentation / Draft", type: "internal" },
    {
      step: "6",
      title: "Meeting / Discussion / Collaboration",
      type: "internal"
    }
  ]
};

export const ADOSchemaToString = ADOSchema.items.toString();
