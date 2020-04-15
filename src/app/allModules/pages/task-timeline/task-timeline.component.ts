import { Component, HostBinding, Inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { Task, TaskLog } from 'app/models/task';
import { ProjectService } from 'app/services/project.service';

@Component({
    selector: 'task-timeline',
    templateUrl: './task-timeline.component.html',
    styleUrls: ['./task-timeline.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class TaskTimelineComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    form: FormGroup;
    CurrentTask: Task;
    AllTaskLogs1: TaskLog[] = [];
    @Input('AllTaskLogs') AllTaskLogs;
    @HostBinding('class.bar-closed')
    barClosed: boolean;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {FormBuilder} _formBuilder
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {Renderer2} _renderer
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _formBuilder: FormBuilder,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _renderer: Renderer2,
        private _shareParameterService: ShareParameterService,
        private _projectService: ProjectService
    ) {
        // Set the defaults
        this.barClosed = true;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
        // this.AllTaskLogs = this._shareParameterService.GetTaskLogs();
        // console.log('Load Task Timeline ');
        // console.log(this.AllTaskLogs);
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // this.GetCurrentTask();
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                // Update the stored config
                this.fuseConfig = config;
            });
    }

    ngOnChange(): void {
        this.AllTaskLogs = this._shareParameterService.GetTaskLogs();
        console.log('Load Task Timeline ');
        console.log(this.AllTaskLogs);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Remove the custom function menu
        this._fuseNavigationService.removeNavigationItem('custom-function');
    }

    private GetCurrentTask(): void {
        this.CurrentTask = this._shareParameterService.GetCurrentTask();
        this.GetCurrentTaskTimeline(this.CurrentTask.TaskID);
    }

    private GetCurrentTaskTimeline(TaskID: number): void {
        this._projectService.GetAllTaskLogsByTaskID(TaskID).subscribe(
            (data) => {
                this.AllTaskLogs = <TaskLog[]>data;
                //   if (this.AllTaskLogs && this.AllTaskLogs.length) {
                //     this.loadSelectedTask(this.AllTaskLogs[0]);
                //   }
            },
            (err) => {
                console.error(err);
                // this.IsProgressBarVisibile = false;
                // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }
  /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }
}
