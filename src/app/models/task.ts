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

