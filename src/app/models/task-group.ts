import { Project } from './project';
import { List } from 'lodash';

export class TaskGroup {
    TaskGroupID: number;
    ProjectID: number;
    OwnerID: number;
    Title: string;
    PlannedStartDate: Date;
    PlannedEndDate: Date;
    PlannedEffort: number;
    ActualStartDate?: Date;
    ActualEndDate?: Date;
    ActualEffort: number;
    OwnerMaster: Owner;
    Project: Project;
    taskSubGroups: List<TaskSubGroup>;
    IsActive: boolean;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;

}
export class TaskSubGroup {
    TaskSubGroupID: number;
    TaskGroupID: number;
    OwnerID: number;
    Title: string;
    PlannedStartDate: Date;
    PlannedEndDate: Date;
    PlannedEffort: number;
    ActualStartDate?: Date;
    ActualEndDate?: Date;
    ActualEffort: number;
    OwnerMaster: Owner;
    TaskGroup: TaskGroup;
    IsActive: boolean;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
    OwnerName: string;


}
export class Owner {
    OwnerID: number;
    MailID: string;
    OwnerName: string;
    PhoneNumber: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
 
}

export class OwnerMaster {
    OwnerID: number;
    MailID: string;
    OwnerName: string;
    PhoneNumber: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
 
}
