import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, ValidatorFn, AbstractControl} from '@angular/forms';

@Component({
    selector: 'page-home',
    templateUrl: 'changepassword.html'
})
export class ChangePassword implements OnInit {
    user: FormGroup;
    constructor() {}

    ngOnInit() {

        this.user = new FormGroup({
            password: new FormControl('', [Validators.required]),
            re_password: new FormControl('', [Validators.required, this.equalto('password')])
        });

    }

    equalto(field_name): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} => {

            let input = control.value;

            let isValid = control.root.value[field_name] == input
            if (!isValid)
                return {'equalTo': {isValid}}
            else
                return null;
        };
    }


}

