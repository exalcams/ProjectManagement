export class CommonClass {
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}

export class Task extends CommonClass {
    TaskID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: string;
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
    LogicText: number;
}

export class Validation extends CommonClass {
    ValidationID: number;
    TaskID: number;
    ValidationText: number;
}

export class TaskView extends CommonClass {
    TaskID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: string;
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
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: string;
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    Inputs: Input[];
    Logics: Logic[];
    Validations: Validation[];
}

export class UpdateTaskView extends CommonClass {
    TaskID: number;
    Title: string;
    Type: string;
    EstimatedEffort: number;
    CompletionBefore: Date;
    AssignedTo: string;
    AcceptedEffort: number;
    AcceptedCompletionDate?: Date;
    Outputs: Output[];
}

