
Feature: Create Lisk Account

  In order to use LSK coin
  As a user
  I want to create lisk account

  Scenario Outline: Create account
    Given I have list of clients
    Given The node is forging
    When "<user>" create a lisk account
    And has a balance "<amount>"LSK in the account
    Examples:
      | user    | amount |
      | sheldon | 1000   |
      | raj     | 1000   |
      | lenard  | 1000   |
      | howard  | 1000   |
