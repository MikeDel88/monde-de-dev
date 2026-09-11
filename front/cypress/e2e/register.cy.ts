describe('Auth Register', () => {

  beforeEach(() => cy.visit("/register"))

  it('loads and renders the register component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("email").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
  });

  describe('Form', () => {
    it('shoud password must to be type password', () => {
      cy.getBySelector('password').type('test')
      cy.getBySelector('password').should('have.attr', 'type', 'password')
    })

    it('shoud email must to be type email', () => {
      cy.getBySelector('email').type('test@test.com')
      cy.getBySelector('email').should('have.attr', 'type', 'email')
    })

    it('shoud name must to be type text', () => {
      cy.getBySelector('name').type('test')
      cy.getBySelector('name').should('have.attr', 'type', 'text')
    })
  })

  describe('Submit Form', () => {
    it("should show a success toast on successful register", () => {
      cy.registerUniqueUser()
    })

    it('should display an error message on invalid credentials', () => {
      cy.getBySelector('email').type('test')
      cy.getBySelector('password').type('test!')
      cy.getBySelector('btn-submit').click()
      cy.findBySelector("email", 'error-email').should('be.visible')
      cy.findBySelector("password", 'error-password').should('be.visible')
    })

    it('should clear the error message on field focus', () => {
      cy.registerUniqueUser().then((registeredUser) => {
        cy.getBySelector('name').type(registeredUser.name)
        cy.getBySelector('email').type(registeredUser.email)
        cy.getBySelector('password').type('WrongPassword1!')
        cy.getBySelector('btn-submit').click()
        cy.findBySelector("error", "error").should('exist')
        cy.findBySelector('name', "input").focus()
        cy.findBySelector("error", "error").should('not.exist')
      })
    })
  })
});
