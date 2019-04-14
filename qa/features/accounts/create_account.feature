
Feature: Create Lisk Account

  In order to use LSK token
  As a user
  I want to create lisk account

  Scenario: Create account
    When I create a lisk account
    And transfer 100LSK to account from genesis account
    Then lisk account should be created with balance 100LSK
