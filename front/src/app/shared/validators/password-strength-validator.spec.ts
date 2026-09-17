import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from '@jest/globals';
import { signal } from '@angular/core';
import { form, SchemaPathTree } from '@angular/forms/signals';

import { validatePasswordStrength } from './password-strength-validator';

interface PasswordModel {
  password: string;
}

const buildForm = (initial = '') => {
  const model = signal<PasswordModel>({ password: initial });
  return TestBed.runInInjectionContext(() =>
    form(model, (schemaPath: SchemaPathTree<PasswordModel>) => {
      validatePasswordStrength(schemaPath.password);
    })
  );
};

describe('validatePasswordStrength', () => {
  it('should be invalid when the password is shorter than 8 characters', () => {
    const passwordForm = buildForm('Aa1!aaa');

    expect(passwordForm.password().valid()).toBe(false);
    expect(passwordForm.password().errors()).toContainEqual(expect.objectContaining({ kind: 'minLength' }));
  });

  it('should be invalid when the password has no uppercase letter', () => {
    const passwordForm = buildForm('abcdefg1!');

    expect(passwordForm.password().valid()).toBe(false);
    expect(passwordForm.password().errors()).toContainEqual(expect.objectContaining({ kind: 'pattern' }));
  });

  it('should be invalid when the password has no lowercase letter', () => {
    const passwordForm = buildForm('ABCDEFG1!');

    expect(passwordForm.password().valid()).toBe(false);
    expect(passwordForm.password().errors()).toContainEqual(expect.objectContaining({ kind: 'pattern' }));
  });

  it('should be invalid when the password has no digit', () => {
    const passwordForm = buildForm('Abcdefgh!');

    expect(passwordForm.password().valid()).toBe(false);
    expect(passwordForm.password().errors()).toContainEqual(expect.objectContaining({ kind: 'pattern' }));
  });

  it('should be invalid when the password has no special character', () => {
    const passwordForm = buildForm('Abcdefg1');

    expect(passwordForm.password().valid()).toBe(false);
    expect(passwordForm.password().errors()).toContainEqual(expect.objectContaining({ kind: 'pattern' }));
  });

  it('should be valid when the password satisfies length and pattern rules', () => {
    const passwordForm = buildForm('ValidPass1!');

    expect(passwordForm.password().valid()).toBe(true);
    expect(passwordForm.password().errors()).toEqual([]);
  });

  it('should be valid when the password is empty (optional field left untouched)', () => {
    const passwordForm = buildForm('');

    expect(passwordForm.password().valid()).toBe(true);
    expect(passwordForm.password().errors()).toEqual([]);
  });
});
