describe('Auth Login', () => {

  let registeredUser: { name: string, email: string, password: string }

  before(() => {
    cy.registerUniqueUser().then((user) => {
      registeredUser = user
    })
  })

  beforeEach(() => cy.visit("/login"))

  it('loads and renders the login component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
  });


  describe('Form', () => {
    it('shoud password must to be type password', () => {
      cy.getBySelector('password').type('test')
      cy.getBySelector('password').should('have.attr', 'type', 'password')
    })
  })

  describe('Submit Form', () => {
    it("should redirect to /feed and set the auth cookie on successful login", () => {
      cy.login(registeredUser.name, registeredUser.password);
      cy.getCookie('access_token').should('exist').its('value').should('not.be.empty')
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
  })

});
