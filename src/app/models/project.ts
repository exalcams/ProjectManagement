export class Project {
    OwnerID: number;
    ProjectID: number;
    Title: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
    OwnerMaster: Owner;

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
