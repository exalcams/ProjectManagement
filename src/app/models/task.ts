import { Guid } from 'guid-typescript';

export class CommonClass {
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}

export class Task extends CommonClass {
    TaskID: number;
    TaskSubGroupID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: Guid[];
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    TaskGroupTitle: string;
    TaskSubGroupTitle: string;
    OwnerNames: string;
}

export class TaskLog extends CommonClass {
    // Log fields
    LogID: number;
    LogTypeID: number;
    LogType: string;
    LogText: string;
    Status: string;
    Remarks: string;

    TaskID: number;
    TaskSubGroupID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: Guid[];
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    TaskGroupTitle: string;
    TaskSubGroupTitle: string;
    OwnerNames: string;
}

export class Input extends CommonClass {
    InputID: number;
    TaskID: number;
    Field: string;
    Validation: string;
    Remarks: string;
}

export class Output extends CommonClass {
    OutputID: number;
    TaskID: number;
    Level: number;
    Field: string;
    Validation: string;
    Remarks: string;
}

export class Logic extends CommonClass {
    LogicID: number;
    TaskID: number;
    LogicText: string;
}

export class Validation extends CommonClass {
    ValidationID: number;
    TaskID: number;
    ValidationText: string;
}

export class SketchView extends CommonClass {
    SketchID: number;
    TaskID: number;
    AttachmentName: string;
    DocumentType: string;
    ContentLength: number;
}

export class TaskView extends CommonClass {
    TaskID: number;
    TaskSubGroupID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: Guid[];
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    Inputs: Input[];
    Outputs: Output[];
    Logics: Logic[];
    Validations: Validation[];
    constructor() {
        super();
        this.Inputs = [];
        this.Outputs = [];
        this.Logics = [];
        this.Validations = [];
    }
}

export class CreateTaskView extends CommonClass {
    TaskID: number;
    TaskSubGroupID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: Guid[];
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    Inputs: Input[];
    Logics: Logic[];
    Validations: Validation[];
}

export class UpdateTaskView extends CommonClass {
    TaskID: number;
    TaskSubGroupID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: Guid[];
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    Outputs: Output[];
}

export class TaskSubGroupView {
    TaskGroupID: number;
    TaskSubGroupID: number;
    TaskSubGroupTitle: string;
    TaskGroupTitle: string;
    ProjectTitle: string;
}

export class AttachmentDetails {
    FileName: string;
    blob: Blob;
}

export class AcceptTaskView extends CommonClass {
    TaskID: number;
    TaskSubGroupID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: Guid[];
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    Remarks: string;
}

export class SelectSprint extends CommonClass {
    TaskGroupID: number;
    TaskSubGroupID: number;
    ProjectID: number;
    TaskGroupTitle: string;
    TaskSubGroupTitle: string;
    Sprint: string;
    OwnerNames: string;
}

