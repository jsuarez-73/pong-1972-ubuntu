import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PasswordValidator {

  passwordPattern: string = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';

  constructor() { }

  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumericChar = /[0-9]/.test(password);
    const hasSpecialChar = /[@$!%*&]/.test(password);
    const hasMinLength = /^.{8,}$/.test(password);

    const isValidPassword = hasUpperCase && hasLowerCase && hasNumericChar && hasSpecialChar && hasMinLength

    const validationErrors = {
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumericChar: !hasNumericChar,
      hasSpecialChar: !hasSpecialChar,
      hasMinLength: !hasMinLength
    }
    return isValidPassword ? null : validationErrors;
  }


  static matchPassword(control: AbstractControl): ValidationErrors | null {
    const confirmPassword = control.value;
    const password = control?.parent?.get('password')?.value;

    if(!password)
      return null;

    return confirmPassword == password ? null : {mismatch: true}
  }
}
