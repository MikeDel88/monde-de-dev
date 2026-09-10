describe('Auth Login', () => {

  before(() => cy.register())

  beforeEach(() => cy.visit("/login"))

  it('loads and renders the login component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
  });

  it('shoud password must to be type password', () => {
    cy.getBySelector('password').type('test')
    cy.getBySelector('password').should('have.attr', 'type', 'password')
  })

  it("should redirect to /feed and must have a token on successful login", () => {
    cy.login();
    cy.url().should('include', '/feed')
    cy.getAllLocalStorage().then((result) => {
      const originStorage = result[Cypress.config('baseUrl')!]
      expect(originStorage).to.have.property('token')
      expect(originStorage["token"]).to.be.a('string').and.not.be.empty
    })
  })

  it('should display an error message on invalid credentials', () => {
    cy.getBySelector('name').type('test')
    cy.getBySelector('password').type('WrongPassword1!')
    cy.getBySelector('btn-submit').click()
    cy.getBySelector('error').should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should clear the error message on field focus', () => {
    cy.getBySelector('name').type('test')
    cy.getBySelector('password').type('WrongPassword1!')
    cy.getBySelector('btn-submit').click()
    cy.findBySelector("error", "error").should('be.visible')
    cy.findBySelector('name', "input").focus()
    cy.findBySelector("error", "error").should('not.be.exist')
  })
});
