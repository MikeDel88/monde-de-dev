// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

declare namespace Cypress {
    interface Chainable {
      getBySelector(selector: string): Chainable<JQuery>
      findBySelector(selector: string, search: string): Chainable<JQuery>
      login(emailOrName?: string, password?: string): void
      register(name?: string, email?: string, password?: string): void
    }
}

Cypress.Commands.add("getBySelector", (selector: string) => {
  return cy.get(`[data-test=${selector}]`)
})

Cypress.Commands.add("findBySelector", (selector: string, search: string) => {
  return cy.getBySelector(selector).find(`[data-test=${search}]`)
})

Cypress.Commands.add('login', (emailOrName?: string, password?: string) => {
  cy.visit('/login')
  cy.getBySelector('name').type(emailOrName ?? "test")
  cy.getBySelector('password').type(password ?? "Test1234!")
  cy.getBySelector('btn-submit').click()
})

Cypress.Commands.add('register', (name?: string, email?: string, password?: string) => {
  cy.visit('/register')
  cy.getBySelector('name').type(name ?? "test")
  cy.getBySelector('email').type(email ?? "test@test.com")
  cy.getBySelector('password').type(password ?? "Test1234!")
  cy.getBySelector('btn-submit').click()
})
