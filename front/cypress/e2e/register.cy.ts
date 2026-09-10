describe('Auth Register', () => {

  const uuid = self.crypto.randomUUID()

  beforeEach(() => cy.visit("/register"))

  it('loads and renders the register component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("email").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
  });

  it('shoud password must to be type password', () => {
    cy.getBySelector('password').type('test')
    cy.getBySelector('password').should('have.attr', 'type', 'password')
  })

  it("should show a success toast on successful register", () => {
    cy.register(uuid, uuid + "@test.com", "Test1234!");
    cy.findBySelector("toast", "toast-success").should('exist');
  })

  it('should display an error message on invalid credentials', () => {
    cy.getBySelector('email').type('test')
    cy.getBySelector('password').type('test!')
    cy.getBySelector('btn-submit').click()
    cy.findBySelector("email", 'error-email').should('be.visible')
    cy.findBySelector("password", 'error-password').should('be.visible')
  })

  it('should clear the error message on field focus', () => {
    cy.getBySelector('name').type(uuid)
    cy.getBySelector('email').type(uuid + "@test.com")
    cy.getBySelector('password').type('WrongPassword1!')
    cy.getBySelector('btn-submit').click()
    cy.findBySelector("error", "error").should('exist')
    cy.findBySelector('name', "input").focus()
    cy.findBySelector("error", "error").should('not.exist')
  })
});
