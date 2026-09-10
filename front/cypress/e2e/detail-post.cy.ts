describe('Page Detail Post', () => {

  let user: { name: string, password: string }
  const postTitle = 'Mon titre de test'

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
      cy.createPost(postTitle, 'Mon contenu de test')
    })
  })

  beforeEach(() => {
    loginAsUser()
    cy.visit('/feed')
    cy.getBySelector('posts').contains(postTitle).click()
    cy.url().should('include', '/post/')
  })

  it('loads and renders the detail post component', () => {
    cy.getBySelector('title').should('contain.text', postTitle)
    cy.getBySelector('content').should('contain.text', 'Mon contenu de test')
    cy.getBySelector('author').should('exist')
    cy.getBySelector('date').should('exist')
  })

  it('should post a comment and display it', () => {
    const commentText = 'Mon commentaire de test'
    cy.getBySelector('comment-input').type(commentText)
    cy.getBySelector('btn-comment-submit').click()
    cy.getBySelector('comments').should('exist')
    cy.getBySelector('comment-content').should('contain.text', commentText)
  })
});
