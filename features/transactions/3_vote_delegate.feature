Feature: Cast Vote

  As a user
  I want to cast my vote to delegate
  So that the delegate can maintain the blockchain

  Background: Client list
    Given I have list of clients

  Scenario: vote for delegate
    Given "thor" has a lisk account with balance 100 LSK tokens
    When "odin" cast vote for a delegate "thor"
    Then delegate "thor" should received vote from "odin"

  Scenario: vote for myself
    Given "thor" has a lisk account with balance 100 LSK tokens
    When "thor" cast my vote for himself
    Then delegate "thor" should received vote from "thor"
