describe('Authentication Flows', () => {
    beforeEach(() => {
        // Ideally we would reset database or state here, but for now we just visit
    })

    it('should navigate to login page', () => {
        cy.visit('/login')
        cy.contains('Username')
        cy.contains('Password')
    })

    it('should show error on invalid login', () => {
        cy.visit('/login')
        cy.get('input[name="username"]').type('wronguser')
        cy.get('input[name="password"]').type('wrongpass')
        cy.get('input[type="submit"]').click()
        cy.contains("Nom d'utilisateur ou mot de passe incorrect").should('be.visible')
    })

    it('should redirect to register page from login', () => {
        cy.visit('/login')
        cy.contains('Créer un compte').click()
        cy.url().should('include', '/register')
    })

    it('should show error on register password mismatch', () => {
        cy.visit('/register')
        cy.get('input[name="username"]').type('newuser')
        cy.get('input[name="password"]').type('password123')
        cy.get('input[name="confirmationpassword"]').type('password456')
        cy.get('input[type="submit"]').click()
        cy.contains('Les mots de passe ne correspondent pas').should('be.visible')
    })

    // Note: Successful register/login tests might affect the DB, so we might mock them or use a test user if available.
    // For this exercise, I'll assume we can use a test user or mock the API.
    // Since I cannot easily verify the backend state, I will create a test that mocks the API response for success.

    it('should successfully login (mocked)', () => {
        cy.intercept('POST', '**/api/login', {
            statusCode: 200,
            body: { token: 'fake-token' }
        }).as('loginRequest')

        cy.visit('/login')
        cy.get('input[name="username"]').type('testuser')
        cy.get('input[name="password"]').type('password')
        cy.get('input[type="submit"]').click()

        // faster than waiting for real network
        cy.wait('@loginRequest')
        cy.url().should('include', '/ouvrages')
    })
})
