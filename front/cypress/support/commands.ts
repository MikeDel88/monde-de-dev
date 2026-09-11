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

interface TestUser {
  name: string
  email: string
  password: string
}

declare namespace Cypress {
    interface Chainable {
      getBySelector(selector: string): Chainable<JQuery>
      findBySelector(selector: string, search: string): Chainable<JQuery>
      login(emailOrName?: string, password?: string): Chainable<void>
      register(name?: string, email?: string, password?: string): Chainable<void>
      registerUniqueUser(): Chainable<TestUser>
      createPost(title: string, content: string): Chainable<void>
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
  cy.fixture("user").then((user) => {
    cy.getBySelector('name').type(emailOrName ?? user.name)
    cy.getBySelector('password').type(password ?? user.password)
  })

  cy.getBySelector('btn-submit').click()
  cy.url().should('include', '/feed')
})

Cypress.Commands.add('register', (name?: string, email?: string, password?: string) => {
  cy.visit('/register')
  cy.fixture("user").then((user) => {
    cy.getBySelector('name').type(name ?? user.name)
    cy.getBySelector('email').type(email ?? user.email)
    cy.getBySelector('password').type(password ?? user.password)
  })

  cy.getBySelector('btn-submit').click()
})

Cypress.Commands.add('registerUniqueUser', () => {
  const name = self.crypto.randomUUID()
  const user: TestUser = { name: name.substring(0, 10), email: `${name}@test.com`, password: "Test1234!" }

  cy.register(user.name, user.email, user.password)
  cy.findBySelector("toast", "toast-success").should('exist')

  return cy.wrap(user)
})

Cypress.Commands.add('createPost', (title: string, content: string) => {
  cy.visit('/post')
  cy.getBySelector('topic').select(1)
  cy.findBySelector('title', 'input').type(title)
  cy.getBySelector('content').type(content)
  cy.getBySelector('btn-submit').find('button').should('not.be.disabled').click()
  cy.url().should('include', '/feed')
})


