import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordValidator } from '../core/services/password-validator';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: [ '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      username: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(9),
          Validators.pattern('^[a-zA-Z0-9]+$')
        ]
      ],
      password: ['',
        [
          Validators.required,
          PasswordValidator.passwordStrength
        ]
      ],
      confirmPassword: ['',
        [
          Validators.required,
          PasswordValidator.matchPassword
        ]
      ]
    });
  }

  goLogin(): void {
    this.router.navigate(['web/login']);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Form submitted:', this.registerForm.value);
    } else {
      console.error('Form invalid');
    }
  }

}
