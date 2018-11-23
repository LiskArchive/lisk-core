@smoke @fast
Feature: Node constants

  In order to ensure if the has correct constants
  As a user
  I want to verify the node constants

  Background: Running node
    Given I have list of addresses
    And The node is running

  Scenario: validate node constants
    When I request for node constants
    Then I should get node constants
