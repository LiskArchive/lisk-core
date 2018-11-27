
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
    And fees should be
      """
      "fees": {
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000"
      }
      """
