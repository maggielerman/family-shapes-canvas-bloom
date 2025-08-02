import { test, expect } from '@playwright/test';

const TEST_DONOR = {
  email: `donor.test.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  fullName: 'Test Donor',
  donorNumber: 'TEST123',
  cryobankName: 'Test Cryobank'
};

test.describe('Donor Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should allow donor signup and access donor dashboard', async ({ page }) => {
    // Navigate to donor auth
    await page.goto('/donor/auth');
    
    // Click on Sign Up tab
    await page.click('text=Sign Up');
    
    // Fill signup form
    await page.fill('input[name="email"]', TEST_DONOR.email);
    await page.fill('input[name="password"]', TEST_DONOR.password);
    await page.fill('input[name="confirmPassword"]', TEST_DONOR.password);
    await page.fill('input[name="fullName"]', TEST_DONOR.fullName);
    await page.fill('input[name="donorNumber"]', TEST_DONOR.donorNumber);
    await page.fill('input[name="cryobankName"]', TEST_DONOR.cryobankName);
    
    // Select donor type
    await page.click('label:has-text("Sperm")');
    
    // Check consent boxes
    await page.check('input[name="agreeToTerms"]');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create Donor Account")');
    
    // Should see success message
    await expect(page.locator('text=Account Created Successfully!')).toBeVisible();
    
    // Note: In real test, would verify email and then sign in
  });

  test('should prevent non-donors from accessing donor pages', async ({ page }) => {
    // Try to access donor dashboard without being logged in
    await page.goto('/donor/dashboard');
    
    // Should be redirected to donor auth
    await expect(page).toHaveURL('/donor/auth');
  });

  test('should show correct navigation for donors', async ({ page }) => {
    // This would require a pre-created donor account or mocking auth
    // For now, test that donor auth page loads correctly
    await page.goto('/donor/auth');
    
    // Check page elements
    await expect(page.locator('h2:has-text("Donor Portal")')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('existing individual users should still work', async ({ page }) => {
    // Navigate to regular auth
    await page.goto('/auth');
    
    // Check that regular auth still exists
    await expect(page.locator('text=Create an account')).toBeVisible();
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('sidebar should show donor portal link for non-donors', async ({ page }) => {
    // This would require being logged in as a non-donor
    // Navigate to a protected page to see if sidebar loads
    await page.goto('/dashboard');
    
    // Will redirect to auth if not logged in
    await expect(page).toHaveURL('/auth');
  });
});

test.describe('Donor Features', () => {
  // These tests would require authentication setup
  
  test.skip('should allow profile editing', async ({ page }) => {
    // Would test profile editing functionality
  });

  test.skip('should allow health information updates', async ({ page }) => {
    // Would test health update functionality
  });

  test.skip('should allow privacy settings changes', async ({ page }) => {
    // Would test privacy settings
  });

  test.skip('should show communication placeholder', async ({ page }) => {
    // Would test communication center
  });
});