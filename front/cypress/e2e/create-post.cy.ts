describe('Page Create Post', () => {

  let user: { name: string, password: string }

  const loginAsUser = () => cy.session(user.name, () => cy.login(user.name, user.password))

  before(() => {
    cy.registerUniqueUser().then((registeredUser) => {
      user = registeredUser
      loginAsUser()
      cy.visit('/topics')
      cy.getBySelector('topic')
        .first()
        .find('[data-test=btn-subscribe] button')
        .click()
        .should('be.disabled')
    })
  })

  beforeEach(() => {
    loginAsUser()
    cy.visit('/post')
  })

  it('loads and renders the post component', () => {
    cy.getBySelector("topic").should('exist');
    cy.getBySelector("content").should('exist');
    cy.getBySelector("btn-submit").should('exist');
  });

  it('should create a post', () => {
    cy.createPost('Mon titre de test', 'Mon contenu de test')
  })

  it("should be disabled while any field is empty", () => {
    cy.getBySelector("btn-submit").find('button').should('be.disabled');
    cy.getBySelector('topic').select(1);
    cy.getBySelector("btn-submit").find('button').should('be.disabled');
    cy.findBySelector('title', 'input').type('Mon titre de test')
    cy.getBySelector("btn-submit").find('button').should('be.disabled');
    cy.getBySelector('content').type('Mon contenu de test')
    cy.getBySelector("btn-submit").find('button').should('not.be.disabled');
  })
});
