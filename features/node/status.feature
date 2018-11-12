@smoke @fast
Feature: Node status

   In order to ensure if the node is running
   As a user
   I want to check status of the node

Scenario: check seed node status
Given I have the valid address
When I make a get request
Then I should get node status

Scenario: check network nodes status
Given I have a list of valid address
When I make a get request
Then I should get node status
