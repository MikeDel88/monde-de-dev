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

  it('shows no toast on initial load', () => {
    cy.getBySelector('app-toast').should('not.be.visible')
  })


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

    it('should show an error toast on invalid credentials', () => {
      cy.getBySelector('name').type('test')
      cy.getBySelector('password').type('WrongPassword1!')
      cy.getBySelector('btn-submit').click()
      cy.getBySelector('app-toast').should('be.visible')
      cy.url().should('include', '/login')
    })

    it('should clear the error toast on field focus', () => {
      cy.getBySelector('name').type('test')
      cy.getBySelector('password').type('WrongPassword1!')
      cy.getBySelector('btn-submit').click()
      cy.getBySelector('app-toast').should('be.visible')
      cy.findBySelector('name', "input").focus()
      cy.getBySelector('app-toast').should('not.be.visible')
    })
  })

});
