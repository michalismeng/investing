import { Directive, Input, OnInit, Self } from "@angular/core";
import { FormGroupDirective } from '@angular/forms';
import { Subject, takeUntil} from "rxjs";

@Directive({
    selector: '[formstore]'
})
export class FormStorageDirective implements OnInit {
    @Input() formstore: string = "";
    @Input() beforeRestoreHook: ((storedValue: any) => any) | null = null;

    private destroy = new Subject();
    private destroy$ = this.destroy.asObservable();

    constructor(@Self() private fg: FormGroupDirective) {
    }

    private get group() {
        return this.fg.form;
    }

    ngOnInit() {
        // Whenever the form changes, store all of its fields to localstorage
        this.group.valueChanges.pipe(takeUntil(this.destroy$))
                               .subscribe(value => localStorage.setItem(this.formstore, JSON.stringify(value)))

        // When restoring a form, apply a hook in case the form owner needs to apply extra logic before restoration
        const storageValue = localStorage.getItem(this.formstore);
        if (storageValue) {
            const storageValueParsed = JSON.parse(storageValue);
            const restoreValue = this.beforeRestoreHook ? this.beforeRestoreHook(storageValueParsed) : storageValueParsed;
            this.group.setValue(restoreValue);
        }
    }

    ngOnDestroy() {
        this.destroy.next(null);
    }
}
