
Feature: Node constants

  In order to ensure if the has correct constants
  As a user
  I want to verify the node constants

  Background: Client list
    Given I have list of clients

  Scenario: node constants
    When I request for node constants
    Then I have the constants from all the nodes
    And should have a valid epoch time
