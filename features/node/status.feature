
Feature: Node status
   In order to ensure if the node is running
   As a user
   I want to check status of the node

   Background: Client list
      Given I have list of clients

   Scenario: nodes status
      When I request for node status
      Then I have the status from all the nodes
      And networkHeight should be greater than or equal to height

