describe('Page Profile', () => {

  let user: { name: string, email: string, password: string }

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
    cy.visit("/profile")
  })

  it('loads and renders the home component', () => {
    cy.getBySelector("name").should('exist');
    cy.getBySelector("email").should('exist');
    cy.getBySelector("password").should('exist');
    cy.getBySelector("btn-submit").should('exist');
    cy.getBySelector("modal").should('exist');
    cy.getBySelector("title").should('exist');
    cy.getBySelector("topic").should('exist');
  });

  describe('Form', () => {
    it('shoud render user information except password', () => {
      cy.findBySelector('name', 'input').should('have.value', user.name);
      cy.findBySelector('email', 'input').should('have.value', user.email);
      cy.findBySelector('password', 'input').should('not.have.value', user.password);
    })
  })

  describe('Update profile', () => {
    it('updates the name after confirming the current password, without sending a new password', () => {
      const newName = `Updated-${Date.now()}`;
      cy.intercept('PATCH', '**/profile').as('updateProfile');

      cy.findBySelector('name', 'input').clear().type(newName);
      cy.getBySelector('btn-submit').click();

      cy.findBySelector('current-password', 'input').type(user.password);
      cy.getBySelector('btn-confirm').click();

      cy.wait('@updateProfile').its('request.body').should((body) => {
        expect(body.password).to.be.null;
        expect(body.name).to.eq(newName);
        expect(body.email).to.be.null;
        expect(body.currentPassword).to.eq(user.password);
      });

      cy.getBySelector('app-toast').should('be.visible');
    });

    it('updates the email after confirming the current password, without sending a new password', () => {
      const newEmail = `updated-${Date.now()}@test.com`;
      cy.intercept('PATCH', '**/profile').as('updateProfile');

      cy.findBySelector('email', 'input').clear().type(newEmail);
      cy.getBySelector('btn-submit').click();

      cy.findBySelector('current-password', 'input').type(user.password);
      cy.getBySelector('btn-confirm').click();

      cy.wait('@updateProfile').its('request.body').should((body) => {
        expect(body.password).to.be.null;
        expect(body.email).to.eq(newEmail);
        expect(body.name).to.be.null;
        expect(body.currentPassword).to.eq(user.password);
      });

      cy.getBySelector('app-toast').should('be.visible');
    });

    it('shows an error toast when the profile update request fails', () => {
      const newName = `Updated-${Date.now()}`;
      cy.intercept('PATCH', '**/profile', { statusCode: 500, body: { message: 'Erreur serveur' } }).as('updateProfileFail');

      cy.findBySelector('name', 'input').clear().type(newName);
      cy.getBySelector('btn-submit').click();

      cy.findBySelector('current-password', 'input').type(user.password);
      cy.getBySelector('btn-confirm').click();

      cy.wait('@updateProfileFail');
      cy.getBySelector('app-toast').should('be.visible');
    });
  })

  describe('Update password', () => {
    const newPassword = 'NewPassword1!';

    it('opens the confirmation modal and sends the new password only after confirming the current password', () => {
      cy.intercept('PATCH', '**/profile').as('updateProfile');

      cy.findBySelector('password', 'input').clear().type(newPassword);
      cy.getBySelector('btn-submit').click();

      cy.findBySelector('current-password', 'input').type(user.password);
      cy.getBySelector('btn-confirm').click();

      cy.wait('@updateProfile').its('request.body').should((body) => {
        expect(body.password).to.eq(newPassword);
        expect(body.name).to.be.null;
        expect(body.email).to.be.null;
        expect(body.currentPassword).to.eq(user.password);
      });
    });

    it('does not send the update when the confirmation modal is cancelled', () => {
      cy.intercept('PATCH', '**/profile').as('updateProfile');

      cy.findBySelector('password', 'input').clear().type(newPassword);
      cy.getBySelector('btn-submit').click();

      cy.getBySelector('btn-cancel').click();

      cy.get('@updateProfile.all').should('have.length', 0);
    });
  })

  describe('Unsubscribe from a topic', () => {
    it('unsubscribes from a topic and removes it from the list', () => {
      cy.intercept('DELETE', '**/topics/*/subscribe').as('unsubscribe');
      cy.intercept('GET', '**/profile').as('getProfile');

      cy.getBySelector('topic').should('have.length', 1);
      cy.getBySelector('topic').first().find('[data-test=btn-subscribe] button').click();

      cy.wait('@unsubscribe');
      cy.wait('@getProfile');

      cy.getBySelector('topic').should('not.exist');
      cy.getBySelector('app-toast').should('not.be.visible');
    });
  })
});
