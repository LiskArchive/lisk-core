@smoke @fast
Feature: List Lisk Account

  As a user
  I want to see details for my account
  So that I can validate my balance and other details

  Scenario Outline: List accounts
    Given I have the lisk accounts for "<user>"
      | user    |
      | sheldon |
      | raj     |
      | lenard  |
      | howard  |
    When I search for the account with "<params>"
    Examples:
      | params    |
      | address   |
      | publicKey |
      | limit     |
      | offset    |
      | sort      |
    Then I should get my account
