
Feature: Enable Disable Forging

  In order to ensure if the node is forging block
  As a Delegate
  I want to check if enable and disable feature works

  Background: Client list
    Given I have list of clients

  Scenario: Disable forging
    Given The node is forging
    When I disable forging the node should stop forging

  Scenario: Enable forging
    Given The node is not forging
    When I enable forging the node should start forging
